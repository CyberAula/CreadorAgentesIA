'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend
} from 'recharts'

export default function Dashboard({ params }) {

  const resolvedParams = use(params)
  const assistantId = resolvedParams.assistantId

  const [data, setData] = useState(null)

  useEffect(() => {
    fetch(`/agentes/api/stats?assistantId=${assistantId}`)
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) {
    return (
      <div style={{ padding: 30 }}>
        Cargando dashboard académico...
      </div>
    )
  }

  // ── 📅 INTERACCIONES POR DÍA ──────────────────────────────────────────────
  const interaccionesPorDia =
    Object.entries(data.interactionsPerDay || {})
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([fecha, valor]) => ({ fecha, valor }))

  // ── 👤 USUARIOS ACTIVOS POR DÍA ───────────────────────────────────────────
  const usuariosActivosPorDia =
    Object.entries(data.activeUsersCountPerDay || {})
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([fecha, usuarios]) => ({ fecha, usuarios }))

  // ── 👥 INTERACCIONES POR ESTUDIANTE ───────────────────────────────────────
  const estudiantesData =
    Object.entries(data.interactionsPerStudent || {})
      .map(([student, interactions]) => ({ student, interactions }))
      .sort((a, b) => b.interactions - a.interactions)

  // ── 📚 SESIONES POR ESTUDIANTE ────────────────────────────────────────────
  const sesionesData =
    Object.entries(data.sessionsPerStudent || {})
      .map(([student, sessions]) => ({ student, sessions }))
      .sort((a, b) => b.sessions - a.sessions)

  // ── ❓ PREGUNTAS POR ESTUDIANTE ───────────────────────────────────────────
  const preguntasData =
    Object.entries(data.questionsPerStudent || {})
      .map(([student, questions]) => ({ student, questions }))
      .sort((a, b) => b.questions - a.questions)

  // ── 🧠 PROFUNDIDAD DE PREGUNTAS POR ESTUDIANTE ───────────────────────────
  const profundidadData =
    Object.entries(data.avgQuestionLengthPerStudent || {})
      .map(([student, avgLen]) => ({
        student,
        profundidad: Math.round(avgLen)
      }))
      .sort((a, b) => b.profundidad - a.profundidad)

  // ── 🔁 RETENCIÓN POR ESTUDIANTE ───────────────────────────────────────────
  const retencionData =
    Object.entries(data.retentionDaysPerStudent || {})
      .map(([student, days]) => ({ student, days }))
      .sort((a, b) => b.days - a.days)

  // ── 📊 ENGAGEMENT — 4 niveles (bar chart, categorías mutuamente excluyentes)
  const eng = data.engagement || {}
  const engagementData = [
    { nivel: 'Muy bajo (1–2)',  porcentaje: Number(((eng.muyBajo || 0) * 100).toFixed(1)) },
    { nivel: 'Bajo (3–5)',      porcentaje: Number(((eng.bajo    || 0) * 100).toFixed(1)) },
    { nivel: 'Medio (6–10)',    porcentaje: Number(((eng.medio   || 0) * 100).toFixed(1)) },
    { nivel: 'Alto (>10)',      porcentaje: Number(((eng.alto    || 0) * 100).toFixed(1)) },
  ]

  // ── ⏲️ THINK TIME TEMPRANO vs TARDÍO ────────────────────────────────────
  const thinkTimeData = [
    {
      momento: 'Mensajes iniciales',
      minutos: Number((( data.avgEarlyThinkTime || 0) / 60000).toFixed(2))
    },
    {
      momento: 'Mensajes avanzados',
      minutos: Number(((data.avgLateThinkTime  || 0) / 60000).toFixed(2))
    },
  ]

  return (

    <div
      style={{
        padding: 30,
        background: '#f8fafc',
        minHeight: '100vh',
        fontFamily: 'Arial'
      }}
    >

      {/* TÍTULO */}
      <h1 style={{ marginBottom: 30, color: '#0f172a' }}>
        📊 Dashboard Académico
      </h1>

      {/* ── KPIs ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
          marginBottom: 40
        }}
      >

        <Card
          title="👥 Usuarios"
          value={data.totalUsers}
          color="#2563eb"
          description="Cantidad total de estudiantes únicos que utilizaron el agente de IA."
        />

        <Card
          title="💬 Interacciones"
          value={data.totalInteractions}
          color="#16a34a"
          description="Número total de mensajes procesados (preguntas + respuestas) por el sistema."
        />

        <Card
          title="❓ Preguntas"
          value={data.totalUserMessages}
          color="#0891b2"
          description="Total de preguntas formuladas por los estudiantes (solo mensajes del usuario)."
        />

        <Card
          title="📨 Mensajes/Usuario"
          value={data.avgMessagesPerUser.toFixed(2)}
          color="#7c3aed"
          description="Promedio de mensajes totales (user + assistant) por cada estudiante."
        />

        <Card
          title="📚 Sesiones/Usuario"
          value={data.avgSessionsPerUser.toFixed(2)}
          color="#ea580c"
          description="Promedio de sesiones iniciadas por cada estudiante."
        />

        <Card
          title="❓ Preguntas/Usuario"
          value={data.avgQuestionsPerUser.toFixed(2)}
          color="#0891b2"
          description="Preguntas promedio del estudiante por usuario. Distinto del total de mensajes."
        />

        <Card
          title="🧠 Long. preguntas"
          value={data.avgQuestionLength.toFixed(2)}
          color="#9333ea"
          description="Longitud promedio de las preguntas del estudiante. Refleja profundidad cognitiva."
        />

        <Card
          title="🤖 Long. respuestas"
          value={data.avgAnswerLength.toFixed(2)}
          color="#059669"
          description="Longitud promedio de las respuestas generadas por el agente."
        />

        <Card
          title="⏱️ Reflexión global"
          value={`${(data.avgThinkTime / 60000).toFixed(2)} min`}
          color="#dc2626"
          description="Tiempo promedio entre la respuesta del agente y la siguiente pregunta del estudiante."
        />

        <Card
          title="🕒 Duración sesión"
          value={`${data.avgSessionDurationMin?.toFixed(2) ?? '—'} min`}
          color="#0369a1"
          description="Duración media de cada sesión (primer al último mensaje del día por usuario)."
        />

        <Card
          title="🔁 Días activos/Usuario"
          value={data.avgActiveDaysPerUser?.toFixed(2) ?? '—'}
          color="#b45309"
          description="Promedio de días con actividad por estudiante. Indicador de retención longitudinal."
        />

        <Card
          title="📅 Retención día 7"
          value={
            data.retentionDay7Rate !== null && data.retentionDay7Rate !== undefined
              ? `${(data.retentionDay7Rate * 100).toFixed(1)}%`
              : 'Sin datos'
          }
          color="#0f766e"
          description="Porcentaje de estudiantes activos el primer día que volvieron al séptimo día."
        />

        <Card
          title="⚠️ Baja interacción inicial"
          value={`${((data.bajaInteraccionInicialRate || 0) * 100).toFixed(1)}%`}
          color="#9f1239"
          description="Estudiantes con ≤ 2 preguntas en una sola sesión. Puede indicar consulta puntual o dificultad para continuar."
        />

      </div>

      {/* ── GRÁFICAS ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: 30
        }}
      >

        {/* 📅 INTERACCIONES POR DÍA */}
        <ChartContainer
          title="📈 Interacciones por día"
          description="Evolución temporal del uso del sistema. Permite identificar picos relacionados con entregas o evaluaciones."
        >
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={interaccionesPorDia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="valor" stroke="#2563eb" strokeWidth={4} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* 👤 USUARIOS ACTIVOS POR DÍA */}
        <ChartContainer
          title="👤 Usuarios activos por día"
          description="Número de estudiantes únicos con actividad cada día. Complementa las interacciones totales mostrando amplitud de adopción."
        >
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={usuariosActivosPorDia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="usuarios" stroke="#0891b2" strokeWidth={4} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* 📊 ENGAGEMENT — 4 NIVELES */}
        <ChartContainer
          title="📊 Distribución de engagement (4 niveles)"
          description="Porcentaje de estudiantes en cada nivel según total de preguntas formuladas. Categorías mutuamente excluyentes y exhaustivas."
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nivel" />
              <YAxis tickFormatter={v => `${v}%`} domain={[0, 100]} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar
                dataKey="porcentaje"
                radius={[8, 8, 0, 0]}
                fill="#2563eb"
                label={{ position: 'top', formatter: v => `${v}%` }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* ⏲️ THINK TIME TEMPRANO vs TARDÍO */}
        <ChartContainer
          title="⏲️ Reflexión: mensajes iniciales vs. avanzados"
          description="Compara el tiempo de reflexión en los primeros dos mensajes (índices 0–1) frente a los mensajes posteriores. Un aumento tardío sugiere mayor elaboración cognitiva con el uso."
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={thinkTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="momento" />
              <YAxis tickFormatter={v => `${v} min`} />
              <Tooltip formatter={v => `${v} min`} />
              <Bar
                dataKey="minutos"
                radius={[8, 8, 0, 0]}
                fill="#dc2626"
                label={{ position: 'top', formatter: v => `${v} min` }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* 👥 INTERACCIONES GLOBALES */}
        <ChartContainer
          title="👥 Interacciones totales por estudiante"
          description="Cantidad total de mensajes (user + assistant) por estudiante. Indicador general de uso del sistema."
        >
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={estudiantesData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="student" width={220} />
              <Tooltip />
              <Bar dataKey="interactions" fill="#0f766e" radius={[0, 10, 10, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* ❓ PREGUNTAS POR ESTUDIANTE */}
        <ChartContainer
          title="❓ Preguntas por estudiante"
          description="Solo mensajes del estudiante (role: user), sin contar respuestas del agente. Refleja la actividad real de consulta."
        >
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={preguntasData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="student" width={220} />
              <Tooltip />
              <Bar dataKey="questions" fill="#2563eb" radius={[0, 10, 10, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* 📚 SESIONES POR ESTUDIANTE */}
        <ChartContainer
          title="📚 Sesiones por estudiante"
          description="Número total de sesiones iniciadas por cada estudiante. Refleja la frecuencia de acceso al agente."
        >
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={sesionesData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="student" width={220} />
              <Tooltip />
              <Bar dataKey="sessions" fill="#7c3aed" radius={[0, 10, 10, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* 🧠 PROFUNDIDAD DE PREGUNTAS */}
        <ChartContainer
          title="🧠 Profundidad promedio de preguntas"
          description="Longitud media de las preguntas por estudiante. Valores mayores sugieren consultas más elaboradas y reflexivas."
        >
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={profundidadData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="student" width={220} />
              <Tooltip />
              <Bar dataKey="profundidad" fill="#9333ea" radius={[0, 10, 10, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* 🔁 RETENCIÓN */}
        <ChartContainer
          title="🔁 Días de actividad por estudiante"
          description="Días transcurridos entre la primera y última interacción. Mide la persistencia y continuidad del uso del agente."
        >
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={retencionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="student" width={220} />
              <Tooltip />
              <Bar dataKey="days" fill="#b45309" radius={[0, 10, 10, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

      </div>

    </div>

  )

}

/* ── COMPONENTES ── */

function Card({ title, value, color, description }) {
  return (
    <div
      style={{
        background: 'white',
        padding: 20,
        borderRadius: 12,
        borderLeft: `6px solid ${color}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}
    >
      <h3 style={{ color: '#334155', marginBottom: 10 }}>{title}</h3>
      <h2 style={{ color, fontSize: 28, marginBottom: 10 }}>{value}</h2>
      <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.5 }}>
        {description}
      </p>
    </div>
  )
}

function ChartContainer({ title, description, children }) {
  return (
    <div
      style={{
        background: 'white',
        padding: 20,
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}
    >
      <h3 style={{ marginBottom: 10, color: '#0f172a' }}>{title}</h3>
      <p style={{ marginBottom: 20, color: '#64748b', lineHeight: 1.6 }}>
        {description}
      </p>
      {children}
    </div>
  )
}
