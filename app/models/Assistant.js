import mongoose from "mongoose";


const assistantSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    instructions: {
        type: String,
        required: true,
    },
    model: {
        type: String,
        required: true,
    },
    tools: {
        type: Array,
        required: true,
    },
    file_ids: {
        type: Array,
        required: true,
    },
    files: {
        type: Array,
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
});

export default mongoose.models.Assistant || mongoose.model('Assistant', assistantSchema);


/* data example:
{       
            "_id": ObjectId("5f3f8e3e3e3e3e3e3e3e3e3e"),
            "openai_id": "asst_G1kM24pRNLX8TjY2NJAWoHwy",
            "name": "Profesor de Reliable scalable Maintainable2",
            "instructions": "Eres un profesor de alumnos de universidad. Tu objetivo es que los alumnos aprendan sobre sistemas confiables, escalables y mantenibles. Utiliza solo y exclusivamente el fichero adjunto como fuente de información pues el objetivo es que aprendan su contenido. Ayuda a los alumnos a entender dichos conceptos adecuadamente.",
            "model": "gpt-4o-mini-1106",
            "tools": [
                {
                    "type": "file_search"
                }
            ],
            "files": [
                {
                    "id": "file-QVZuc8KoLX7BWWVSZyp2IqkH",
                    "name": "Chapter 1 - Reliable, Scalable and Maintainable Applications - A blog by Timi Adeniran.pdf"
                }
            ]
        }
        */