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
    usage: {
        type: Array,
        required: false,
    },
    messages: {
        type: Array,
        required: true,
    },
});

export default mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);

/* data example:
{
    "_id": ObjectId("5f3f8e3e3e3e3e3e3e3e3e3e"),
    "userEmail": "XXX",
    "assistantId": "asst_P4gKh4UBgiBuck9bVhgJbltK",
    "lastthreadrun": {
        "id": "run_evhFCmqmrgLSgn3XHDuOIb57",
        "object": "thread.run",
        "created_at": 1706887567,
        "assistant_id": "asst_P4gKh4UBgiBuck9bVhgJbltK",
        "thread_id": "thread_LiGYRq2FTH319y4GBuNp8dm4",
        "status": "queued",
        "started_at": null,
        "expires_at": 1706888167,
        "cancelled_at": null,
        "failed_at": null,
        "completed_at": null,
        "last_error": null,
        "model": "gpt-4o-mini",
        "instructions": "Eres un ayudante a escribir queries de MongoDB. Los alumnos primero deben importar la base de datos con el comando mongoimport y posteriormente hacer queries find y findOne.",
        "tools": [
            {
                "type": "code_interpreter"
            }
        ],
        "file_ids": [],
        "metadata": {},
        "usage": null
    },
    "usage": [{ "prompt_tokens": 127, "completion_tokens": 240, "total_tokens": 367 }, { "prompt_tokens": 27, "completion_tokens": 40, "total_tokens": 67 }],
    "created_at": 1706887567,
    "updated_at": 1706887567,
    "conversation": [
        { 
            "question": "¿Cómo importo la base de datos?", 
            "answer": "bla bla bla mongoimport --db=escuela --collection=alumnos --file=alumnos.json",
            "question_created_at": 1706887567,
            "answer_created_at": 1706887999            
        },
        { 
            "question": "¿Cómo hago un query find?", 
            "answer": "db.alumnos.find({})",
            "question_created_at": 1706889567,
            "answer_created_at": 1706889999
        },
        { 
            "question": "¿Cómo hago un query findOne?", 
            "answer": "db.alumnos.findOne({})",
            "question_created_at": 1706987567,
            "answer_created_at": 1706897999
        }
    ]
}
*/