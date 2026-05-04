import { NextResponse } from 'next/server';
import dbConnect from "../../lib/dbconnect.js";
import Conversation from '@/app/models/Conversation.js';

await dbConnect();

//POST /API/CHATS
//api path to create or retrieve a chat session for a given assistantId + userEmail
export async function POST(request) {
    console.log("POST to /api/chats");

    try {
        const req = await request.json()
        console.log("received params: ", req);
        let { assistantId, userEmail } = req;
        if (userEmail != null && userEmail.includes(" ")) {
            userEmail = userEmail.replace(/ /g, "+");
            console.log("Email with + sign: ", userEmail);
        }

        console.log("creating/retrieving chat for assistant: ", assistantId, " and user: ", userEmail);

        const conversation = await Conversation.find({ assistantId, userEmail });
        if (conversation.length > 0) {
            console.log("Chat already exists for assistant: ", assistantId, " and user: ", userEmail);
            // Reset the response chain so the new session starts fresh
            await Conversation.updateOne({ assistantId, userEmail }, { lastthreadrun: {} });
            return NextResponse.json({ "msg": "chat created", "thread": conversation[0]._id.toString() });
        } else {
            console.log("Creating new chat for assistant: ", assistantId, " and user: ", userEmail);
            const now = Date.now();
            const newConv = await Conversation.create({
                assistantId,
                userEmail,
                lastthreadrun: {},
                created_at: now,
                updated_at: now,
                last_active_at: now,
                total_messages: 0,
                total_sessions: 0,
                total_tokens: 0,
                sessions: [],
                messages: []
            });
            console.log("conversation created: ", newConv);
            return NextResponse.json({ "msg": "chat created", "thread": newConv._id.toString() });
        }

    } catch (error) {
        console.error('Error creating chat:', error);
        return NextResponse.json({ "msg": "Error creating chat", "error": error, "errormsg": "Error creating chat" });
    }
}
