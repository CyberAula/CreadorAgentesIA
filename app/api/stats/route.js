import connectDB from "../../lib/dbconnect";
import Conversation from "../../models/Conversation";

export async function GET(request) {

  await connectDB();

  const { searchParams } = new URL(request.url);
  const assistantId = searchParams.get('assistantId');

  const filter = assistantId ? { assistantId } : {};

  const conversations = await Conversation.find(filter);

  // ─── CONTADORES GLOBALES ───────────────────────────────────────────────────
  let totalInteractions = 0;   // total de mensajes (user + assistant)
  let totalUserMessages  = 0;  // sólo mensajes del estudiante (preguntas)
  let totalSessions      = 0;

  let totalQuestionLength = 0;
  let totalAnswerLength   = 0;

  // Think time global
  let totalThinkTime = 0;
  let thinkCount     = 0;

  // Think time por posición: mensajes "tempranos" (índice 0-1) vs "tardíos" (≥2)
  // Permite detectar si el estudiante reflexiona más a medida que avanza la sesión.
  let earlyThinkTime  = 0;  let earlyThinkCount  = 0;
  let lateThinkTime   = 0;  let lateThinkCount   = 0;

  // ─── ESTRUCTURAS POR USUARIO ───────────────────────────────────────────────
  const users                    = new Set();
  const interactionsPerStudent   = {};  // mensajes totales (user + assistant)
  const questionsPerStudent      = {};  // sólo mensajes del estudiante (role === 'user')
  const sessionsPerStudent       = {};
  const questionLengthPerStudent = {};
  const answerLengthPerStudent   = {};
  const firstActivityPerStudent  = {};
  const lastActivityPerStudent   = {};

  // Duración de sesión: acumulamos para calcular promedio
  // Agrupamos mensajes por (user, date) → sesión aproximada
  const sessionTimestamps = {};  // { user: { date: [ts, ts, ...] } }

  // ─── TEMPORAL ─────────────────────────────────────────────────────────────
  const interactionsPerDay      = {};
  const activeUsersPerDay       = {};  // para tasa de retención día 7 / día 1

  // ─────────────────────────────────────────────────────────────────────────
  conversations.forEach(conv => {

    const user = (conv.userEmail || "sin_email")
      .toLowerCase()
      .trim();

    users.add(user);

    const messagesCount = conv.messages?.length || 0;
    const sessionsCount = conv.sessions?.length || 0;

    totalSessions += sessionsCount;

    interactionsPerStudent[user] =
      (interactionsPerStudent[user] || 0) + messagesCount;

    sessionsPerStudent[user] =
      (sessionsPerStudent[user] || 0) + sessionsCount;

    if (!sessionTimestamps[user]) sessionTimestamps[user] = {};

    conv.messages?.forEach((msg, msgIndex) => {

      totalInteractions++;

      // ── Detectar mensajes del estudiante ─────────────────────────────────
      // Preferimos msg.role === 'user'; si el campo no existe, usamos
      // question_length como proxy (presente solo en mensajes del estudiante).
      const isUserMessage =
        msg.role !== undefined
          ? msg.role === "user"
          : (msg.question_length !== undefined && msg.question_length !== null);

      if (isUserMessage) {
        totalUserMessages++;
        totalQuestionLength += msg.question_length || 0;

        questionsPerStudent[user] =
          (questionsPerStudent[user] || 0) + 1;

        questionLengthPerStudent[user] =
          (questionLengthPerStudent[user] || 0) + (msg.question_length || 0);
      }

      totalAnswerLength += msg.answer_length || 0;

      answerLengthPerStudent[user] =
        (answerLengthPerStudent[user] || 0) + (msg.answer_length || 0);

      // ── Think time global y por posición ─────────────────────────────────
      if (msg.think_time_ms) {
        totalThinkTime += msg.think_time_ms;
        thinkCount++;

        if (msgIndex <= 1) {
          earlyThinkTime += msg.think_time_ms;
          earlyThinkCount++;
        } else {
          lateThinkTime += msg.think_time_ms;
          lateThinkCount++;
        }
      }

      // ── Timestamps ───────────────────────────────────────────────────────
      const ts = msg.question_created_at
        ? new Date(msg.question_created_at)
        : null;

      if (ts && !isNaN(ts)) {
        const date = ts.toISOString().split("T")[0];

        interactionsPerDay[date] =
          (interactionsPerDay[date] || 0) + 1;

        // Usuarios únicos por día (para tasa de retención)
        if (!activeUsersPerDay[date]) activeUsersPerDay[date] = new Set();
        activeUsersPerDay[date].add(user);

        // Primera / última actividad por usuario
        if (!firstActivityPerStudent[user] || ts < firstActivityPerStudent[user])
          firstActivityPerStudent[user] = ts;
        if (!lastActivityPerStudent[user] || ts > lastActivityPerStudent[user])
          lastActivityPerStudent[user] = ts;

        // Agrupar timestamps por sesión aproximada (usuario × día)
        if (!sessionTimestamps[user][date])
          sessionTimestamps[user][date] = [];
        sessionTimestamps[user][date].push(ts);
      }

    });

  });

  // ─── TOTALES DERIVADOS ────────────────────────────────────────────────────
  const totalUsers = users.size || 1;

  // ─── ENGAGEMENT — 4 niveles (por usuario, no por conversación) ───────────
  // Basado en total de preguntas del estudiante acumuladas.
  let engagementMuyBajo = 0;  // 1–2 preguntas
  let engagementBajo    = 0;  // 3–5
  let engagementMedio   = 0;  // 6–10
  let engagementAlto    = 0;  // > 10

  // "Baja interacción inicial": ≤ 2 preguntas EN UNA SOLA sesión.
  // No equivale a abandono; puede ser un estudiante que resolvió su duda rápido.
  let bajaInteraccionInicialCount = 0;

  users.forEach(user => {
    const q = questionsPerStudent[user] || 0;
    const s = sessionsPerStudent[user]  || 0;

    if      (q <= 2)  engagementMuyBajo++;
    else if (q <= 5)  engagementBajo++;
    else if (q <= 10) engagementMedio++;
    else              engagementAlto++;

    if (q <= 2 && s === 1) bajaInteraccionInicialCount++;
  });

  // ─── DURACIÓN MEDIA DE SESIÓN ─────────────────────────────────────────────
  // Para cada (usuario, día) tomamos max(ts) − min(ts) dentro del grupo.
  // Sesiones de un solo mensaje tienen duración 0 (no se excluyen, representan
  // consultas breves que son igualmente válidas).
  let totalSessionDuration = 0;  // ms
  let sessionCount         = 0;

  Object.values(sessionTimestamps).forEach(daysMap => {
    Object.values(daysMap).forEach(tsList => {
      if (tsList.length > 0) {
        const minTs = Math.min(...tsList.map(t => t.getTime()));
        const maxTs = Math.max(...tsList.map(t => t.getTime()));
        totalSessionDuration += (maxTs - minTs);
        sessionCount++;
      }
    });
  });

  const avgSessionDurationMin =
    sessionCount > 0
      ? totalSessionDuration / sessionCount / 60000
      : 0;

  // ─── TASA DE RETENCIÓN DÍA 7 / DÍA 1 ────────────────────────────────────
  // Identificamos el día con mayor actividad como "día 1" y comprobamos
  // qué fracción de esos usuarios estuvo activa 7 días después.
  const sortedDays = Object.keys(activeUsersPerDay).sort();
  let retentionDay7Rate = null;

  if (sortedDays.length > 0) {
    const day1Str = sortedDays[0];
    const day1    = new Date(day1Str);
    const day7    = new Date(day1);
    day7.setDate(day7.getDate() + 7);
    const day7Str = day7.toISOString().split("T")[0];

    const usersDay1 = activeUsersPerDay[day1Str] || new Set();
    const usersDay7 = activeUsersPerDay[day7Str] || new Set();

    if (usersDay1.size > 0) {
      // Intersección: usuarios del día 1 que también estuvieron en el día 7
      const retained = [...usersDay1].filter(u => usersDay7.has(u)).length;
      retentionDay7Rate = retained / usersDay1.size;
    }
  }

  // ─── RETENCIÓN: días de actividad por usuario ─────────────────────────────
  let totalActiveDays = 0;
  const retentionDaysPerStudent = {};

  users.forEach(user => {
    const first = firstActivityPerStudent[user];
    const last  = lastActivityPerStudent[user];
    let days = 0;
    if (first && last) {
      days = Math.round((last - first) / (1000 * 60 * 60 * 24)) + 1;
    }
    retentionDaysPerStudent[user] = days;
    totalActiveDays += days;
  });

  // ─── PROFUNDIDAD DE PREGUNTAS POR USUARIO ─────────────────────────────────
  const avgQuestionLengthPerStudent = {};
  users.forEach(user => {
    const q = questionsPerStudent[user] || 0;
    avgQuestionLengthPerStudent[user] = q > 0
      ? (questionLengthPerStudent[user] || 0) / q
      : 0;
  });

  // ─── USUARIOS ACTIVOS POR DÍA (serializable) ──────────────────────────────
  const activeUsersCountPerDay = {};
  Object.entries(activeUsersPerDay).forEach(([date, set]) => {
    activeUsersCountPerDay[date] = set.size;
  });

  // ─── RESPUESTA ────────────────────────────────────────────────────────────
  return Response.json({

    // 🌍 GLOBALES
    totalInteractions,
    totalUserMessages,
    totalUsers,

    // 📨 PROMEDIOS POR USUARIO
    avgMessagesPerUser:
      totalInteractions / totalUsers,

    avgSessionsPerUser:
      totalSessions / totalUsers,

    avgQuestionsPerUser:
      totalUserMessages / totalUsers,

    // 🧠 INDICADORES COGNITIVOS
    avgQuestionLength:
      totalQuestionLength / (totalUserMessages || 1),

    avgAnswerLength:
      totalAnswerLength / (totalInteractions || 1),

    avgThinkTime:
      totalThinkTime / (thinkCount || 1),

    // ⏲️ THINK TIME TEMPRANO vs TARDÍO (ms)
    avgEarlyThinkTime:
      earlyThinkCount > 0 ? earlyThinkTime / earlyThinkCount : 0,

    avgLateThinkTime:
      lateThinkCount > 0 ? lateThinkTime / lateThinkCount : 0,

    // 🕒 DURACIÓN MEDIA DE SESIÓN
    avgSessionDurationMin,           // minutos

    // 📊 ENGAGEMENT — 4 niveles (% sobre usuarios únicos)
    engagement: {
      muyBajo: engagementMuyBajo / totalUsers,   // 1–2 preguntas
      bajo:    engagementBajo    / totalUsers,   // 3–5
      medio:   engagementMedio   / totalUsers,   // 6–10
      alto:    engagementAlto    / totalUsers,   // > 10
    },

    // ⚠️  "Baja interacción inicial" (antes llamado abandonoRate)
    // Estudiantes con ≤ 2 preguntas en una sola sesión.
    // No necesariamente abandono; puede ser consulta puntual resuelta.
    bajaInteraccionInicialRate:
      bajaInteraccionInicialCount / totalUsers,

    // 🔁 RETENCIÓN
    avgActiveDaysPerUser:
      totalActiveDays / totalUsers,

    retentionDay7Rate,               // null si no hay datos suficientes

    // 📅 TEMPORAL
    interactionsPerDay,
    activeUsersCountPerDay,          // usuarios únicos activos por día

    // 🌍 DESGLOSE POR ESTUDIANTE
    interactionsPerStudent,
    questionsPerStudent,
    sessionsPerStudent,

    // 🧠 COGNITIVO POR ESTUDIANTE
    avgQuestionLengthPerStudent,
    retentionDaysPerStudent,

  });

}
