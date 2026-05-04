import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import dbConnect from "../../lib/dbconnect.js";
import Assistant from '@/app/models/Assistant.js';

await dbConnect();

//POST /API/ASSISTANTS
//api path to create or update an assistant /api/assistants
export async function POST(request) {
    console.log("POST to /api/assistants");

    try {
        const req = await request.json()
        const { id, name, instructions, model, tools } = req;
        console.log("received params: ", req);

        let getAssistant;

        if (id == "new") {
            console.log("creating new assistant");
            getAssistant = {
                id: 'ast_' + randomUUID().replace(/-/g, '').slice(0, 24),
                name,
                instructions,
                model,
                tools,
                file_ids: [],
                files: [],
                created_at: Date.now(),
                updated_at: Date.now()
            };
            const mongores = await Assistant.create(getAssistant);
            console.log("assistant saved to mongodb: ", mongores);
        } else {
            console.log("updating assistant: ", id);
            getAssistant = { id, name, instructions, model, tools, updated_at: Date.now() };
            const mongores = await Assistant.updateOne({ id }, { name, instructions, model, tools, updated_at: Date.now() });
            console.log("assistant updated in mongodb: ", mongores);
        }

        return NextResponse.json({ "msg": "assistant created", "assistant": getAssistant });

    } catch (error) {
        console.error('Error creating assistant:', error);
        return NextResponse.json({ "msg": "Error creating assistant", "error": error, "errormsg": "Error creating assistant" });
    }
}


//GET /API/ASSISTANTS
//api path to get all assistants /api/assistants
export async function GET(request) {
    console.log("GET to /api/assistants");

    try {
        const assistants = await Assistant.find({});
        console.log("assistants: ", assistants);
        return NextResponse.json(assistants);
    } catch (error) {
        console.error('Error getting assistants:', error);
        return NextResponse.json({ "msg": "Error getting assistants", "error": error, "errormsg": "Error getting assistants" });
    }
}
