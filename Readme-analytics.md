# Learning Analytics — Guía de uso de los datos recogidos

Este documento describe cómo usar los datos almacenados en MongoDB para construir modelos de **detección temprana de abandono** y **predicción de nota** a partir de las interacciones de los estudiantes con los agentes de IA.

---

## Estructura de datos disponible

Cada documento `Conversation` en MongoDB tiene tres niveles de granularidad:

| Nivel | Campos | Frecuencia de actualización |
|---|---|---|
| **Conversación** | `total_messages`, `total_sessions`, `total_tokens`, `last_active_at` | En cada mensaje |
| **Sesión** | `sessions[].duration_ms`, `message_count`, `total_tokens` | En cada mensaje |
| **Mensaje** | `question_length`, `think_time_ms`, `response_time_ms`, `usage` | Por mensaje |

---

## Señales y su interpretación

### `think_time_ms`
Tiempo (en ms) entre que el agente respondió y el alumno envió la siguiente pregunta.

- **Valores bajos (< 10 s)**: posible copia directa de texto, uso superficial.
- **Valores medios (30–120 s)**: el alumno lee y reflexiona — buen indicador de engagement.
- **Valores muy altos (> 10 min)**: distracción, dificultad o abandono inminente.
- **`null`**: primer mensaje de la sesión — no hay referencia anterior.

### `question_length`
Número de caracteres de la pregunta del alumno.

- Preguntas cortas (< 20 chars): preguntas cerradas o de bajo esfuerzo cognitivo.
- Preguntas largas (> 80 chars): el alumno elabora contexto, mayor compromiso.
- La **tendencia decreciente** a lo largo de las sesiones es señal de desenganche.

### `total_sessions` y frecuencia entre sesiones
Calculando los `started_at` de `sessions[]` se obtiene la cadencia de uso.

- **Uso regular** (una sesión cada 1–2 días): patrón saludable.
- **Uso en ráfaga** (todas las sesiones el último día): estudio de última hora.
- **Ausencia prolongada** (> 5 días sin `last_active_at` actualizado): señal de abandono.

### `sessions[].duration_ms`
Duración de cada sesión de trabajo.

- Sesiones muy cortas (< 2 min): no hay engagement real.
- Sesiones de 15–45 min: rango típico de trabajo efectivo.
- El ratio `duration_ms / message_count` estima el tiempo por pregunta.

### `total_tokens`
Tokens consumidos en total por el alumno con ese agente.

- Correlaciona con la profundidad de uso (más tokens = más intercambios extensos).
- Útil también para **gestión de presupuesto** por alumno/asistente.

---

## Queries MongoDB útiles

### Alumnos sin actividad en los últimos N días (abandono potencial)
```js
const cutoff = Date.now() - (5 * 24 * 60 * 60 * 1000); // 5 días
db.conversations.find({
    assistantId: "ast_3a7f9c2e1b4d8f6a0e5c7b9d2a",
    last_active_at: { $lt: cutoff }
}, { userEmail: 1, last_active_at: 1, total_messages: 1 })
```

### Alumnos con bajo engagement (pocas preguntas o preguntas muy cortas)
```js
db.conversations.aggregate([
    { $match: { assistantId: "ast_3a7f9c2e..." } },
    { $project: {
        userEmail: 1,
        total_messages: 1,
        avg_question_length: { $avg: "$messages.question_length" },
        avg_think_time_ms:   { $avg: "$messages.think_time_ms" }
    }},
    { $match: { avg_question_length: { $lt: 25 } } },
    { $sort: { avg_question_length: 1 } }
])
```

### Distribución temporal de sesiones por alumno (regularidad)
```js
db.conversations.aggregate([
    { $match: { userEmail: "alumno01@universidad.es" } },
    { $unwind: "$sessions" },
    { $project: {
        session_id: "$sessions.session_id",
        started_at: "$sessions.started_at",
        duration_min: { $divide: ["$sessions.duration_ms", 60000] },
        message_count: "$sessions.message_count"
    }},
    { $sort: { started_at: 1 } }
])
```

### Resumen de uso por alumno para un asistente (tabla de dashboard)
```js
db.conversations.aggregate([
    { $match: { assistantId: "ast_3a7f9c2e..." } },
    { $project: {
        userEmail: 1,
        total_messages: 1,
        total_sessions: 1,
        total_tokens: 1,
        last_active_at: 1,
        avg_think_time_ms:   { $avg: "$messages.think_time_ms" },
        avg_question_length: { $avg: "$messages.question_length" }
    }},
    { $sort: { last_active_at: -1 } }
])
```

---

## Features para modelos de ML

A continuación se listan los features derivables directamente de los datos para entrenar modelos supervisados (regresión para nota, clasificación para abandono).

### Features de volumen
| Feature | Cálculo | Tipo |
|---|---|---|
| `total_messages` | campo directo | Numérico |
| `total_sessions` | campo directo | Numérico |
| `total_tokens` | campo directo | Numérico |
| `avg_messages_per_session` | `total_messages / total_sessions` | Numérico |
| `avg_session_duration_min` | media de `sessions[].duration_ms / 60000` | Numérico |

### Features de engagement
| Feature | Cálculo | Tipo |
|---|---|---|
| `avg_think_time_ms` | media de `messages[].think_time_ms` | Numérico |
| `avg_question_length` | media de `messages[].question_length` | Numérico |
| `think_time_trend` | pendiente de `think_time_ms` a lo largo del tiempo | Numérico |
| `question_length_trend` | pendiente de `question_length` a lo largo del tiempo | Numérico |

### Features de regularidad temporal
| Feature | Cálculo | Tipo |
|---|---|---|
| `days_since_last_active` | `(now - last_active_at) / 86400000` | Numérico |
| `days_span` | días entre primera y última sesión | Numérico |
| `regularity_std` | desviación estándar de los gaps entre sesiones | Numérico — bajo = regular |
| `last_minute_ratio` | % de sesiones en las últimas 48h antes de entrega | Numérico |

### Features de profundidad
| Feature | Cálculo | Tipo |
|---|---|---|
| `max_question_length` | máximo de `messages[].question_length` | Numérico |
| `long_question_ratio` | % de mensajes con `question_length > 60` | Numérico |
| `avg_tokens_per_message` | `total_tokens / total_messages` | Numérico |

---

## Detección temprana de abandono

### Regla heurística rápida (sin ML)

Un alumno se considera **en riesgo** si cumple al menos dos de estas condiciones:

1. `days_since_last_active > 4`
2. `total_messages < 3`
3. `avg_question_length < 20`
4. `think_time_trend` positivo y acelerado (el alumno tarda cada vez más)

### Modelo ML recomendado

**Clasificación binaria** (abandona / no abandona) con ventana temporal:

- Tomar snapshots de features cada 2–3 días desde el inicio de la actividad.
- Etiquetar con si el alumno entregó o no la práctica.
- Modelos sugeridos: **Random Forest** o **XGBoost** (toleran features con nulos como `think_time_ms = null` en el primer mensaje).

---

## Predicción de nota

### Correlaciones esperadas (hipótesis a validar)

| Feature | Dirección esperada | Razón |
|---|---|---|
| `total_sessions` | Positiva | Más sesiones = más práctica |
| `regularity_std` | Negativa | Más irregular = peor planificación |
| `avg_think_time_ms` (rango medio) | Positiva | Reflexión real vs. copy-paste |
| `avg_question_length` | Positiva | Preguntas elaboradas = mayor comprensión |
| `last_minute_ratio` | Negativa | Estudio de última hora |
| `think_time_trend` | Negativa | Si crece = desenganche progresivo |

### Modelo ML recomendado

**Regresión** (nota continua) o **clasificación ordinal** (Suspenso / Aprobado / Notable / Sobresaliente):

- Mínimo recomendado: 30–50 alumnos con nota real para entrenar.
- Baseline: regresión lineal para interpretar coeficientes antes de usar modelos más complejos.
- Validación: leave-one-out o k-fold estratificado por nota para evitar overfitting con pocos datos.

---

## Notas de implementación

- Los timestamps están en **milisegundos** desde epoch Unix (JavaScript `Date.now()`).
- `think_time_ms = null` indica el primer mensaje de una sesión — excluir de medias o imputar con la duración media de la sesma actividad.
- Los campos de analytics en el documento raíz (`total_messages`, `total_sessions`, etc.) se mantienen sincronizados en cada llamada al API — no es necesario recalcularlos desde `messages[]` para queries de dashboard.
- Para análisis histórico o reentrenamiento de modelos, usar `messages[]` directamente ya que contiene la serie temporal completa.
