import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
    },
    assistantId: {
        type: String,
        required: true,
    },
    // Stores { lastResponseId, currentSessionId } for Responses API chaining
    lastthreadrun: {
        type: Object,
        required: true,
    },
    created_at: {
        type: Number,
        required: true,
    },
    updated_at: {
        type: Number,
        required: true,
    },
    last_active_at: {
        type: Number,
    },

    // Conversation-level aggregates (for quick dashboard queries)
    total_messages: {
        type: Number,
        default: 0,
    },
    total_sessions: {
        type: Number,
        default: 0,
    },
    total_tokens: {
        type: Number,
        default: 0,
    },

    // One entry per session (group of messages within 30 min of each other)
    sessions: {
        type: Array,
        default: [],
        /* each item:
        {
            session_id:    "sess_abc123",
            started_at:    1706887567000,
            ended_at:      1706888100000,
            duration_ms:   533000,
            message_count: 4,
            total_tokens:  1240
        } */
    },

    // One entry per message pair (question + answer)
    messages: {
        type: Array,
        default: [],
        /* each item:
        {
            session_id:          "sess_abc123",
            question:            "¿Cómo importo la base de datos?",
            answer:              "bla bla bla mongoimport ...",
            question_created_at: 1706887567000,   // when student submitted
            answer_created_at:   1706887570000,   // when API replied
            question_length:     38,              // chars — proxy de profundidad
            answer_length:       210,
            think_time_ms:       45000,           // tiempo desde respuesta anterior → esta pregunta
            response_time_ms:    3200,            // latencia de la llamada al API
            usage: {
                input_tokens:  210,
                output_tokens: 180,
                total_tokens:  390
            },
            model: "gpt-5.4"
        } */
    },
});

export default mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
