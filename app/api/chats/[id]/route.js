import openaiclient from '../../../lib/openai.js';
import { NextResponse } from "next/server";
import dbConnect from "../../../lib/dbconnect.js";
import Conversation from '@/app/models/Conversation.js';
import Assistant from '@/app/models/Assistant.js';

await dbConnect();

// Transforms stored tools to the Responses API format.
// Function tools change from { type, function: { name, description, parameters } }
// to the flat form { type, name, description, parameters } required by the Responses API.
function transformTools(tools) {
    return tools.map(tool => {
        if (tool.type === "function" && tool.function) {
            return {
                type: "function",
                name: tool.function.name,
                description: tool.function.description,
                parameters: tool.function.parameters
            };
        }
        return tool;
    });
}

//POST /API/CHATS/CONVERSATIONID
//Sends a user message and returns the assistant reply synchronously.
//Replaces the old message-create + run-create + run-poll + messages-list flow.
export async function POST(request) {
    console.log("POST to /api/chats/conversationId");
    var url = new URL(request.url);
    const conversationId = url.pathname.slice(url.pathname.lastIndexOf('/') + 1);
    console.log("POST al conversationId: ", conversationId);

    try {
        const req = await request.json();
        console.log("received params: ", req);
        let { message, assistantId, userEmail } = req;
        if (userEmail != null && userEmail.includes(" ")) {
            userEmail = userEmail.replace(/ /g, "+");
            console.log("Email with + sign: ", userEmail);
        }

        // Get previous response ID for multi-turn continuity
        let lastResponseId = null;
        try {
            const conversation = await Conversation.findById(conversationId);
            lastResponseId = conversation?.lastthreadrun?.lastResponseId || null;
        } catch (e) {
            console.log("Could not find conversation by id, starting fresh:", e.message);
        }

        // Get assistant config (instructions, model, tools) from MongoDB
        const assistantDocs = await Assistant.find({ id: assistantId });
        const assistantDoc = assistantDocs[0];
        if (!assistantDoc) {
            return NextResponse.json({ "msg": "Assistant not found", "errormsg": "Assistant not found" });
        }

        const model = assistantDoc.model || "gpt-4.1";
        const instructions = assistantDoc.instructions || "";
        const tools = assistantDoc.tools?.length > 0 ? transformTools(assistantDoc.tools) : undefined;

        // Single synchronous call — no polling needed
        const params = {
            model,
            instructions,
            input: message,
            store: true,
            ...(tools && { tools }),
            ...(lastResponseId && { previous_response_id: lastResponseId })
        };
        console.log("calling responses.create with params:", { ...params, instructions: instructions.slice(0, 50) + "..." });

        const response = await openaiclient.responses.create(params);
        const answer = response.output_text;
        console.log("ANSWER FROM IA: ", answer);

        // Persist new response ID and message pair
        await Conversation.updateOne(
            { _id: conversationId },
            {
                lastthreadrun: { lastResponseId: response.id },
                updated_at: Date.now(),
                $push: {
                    messages: {
                        $each: [{
                            question: message,
                            answer,
                            question_created_at: Date.now(),
                            answer_created_at: Date.now()
                        }],
                        $position: 0
                    }
                }
            }
        );

        return NextResponse.json({ "msg": "message sent", "answer": answer });

    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ "msg": "Error sending message", "error": String(error), "errormsg": "Error sending message" });
    }
}
