import openaiclient from '../../../lib/openai.js';
import { NextResponse } from "next/server";
import { randomUUID } from 'crypto';
import dbConnect from "../../../lib/dbconnect.js";
import Conversation from '@/app/models/Conversation.js';
import Assistant from '@/app/models/Assistant.js';

await dbConnect();

// Sessions group messages with less than 30 min of inactivity between them
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

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

        // ── Load conversation state ───────────────────────────────────────────
        let conversation = null;
        let lastResponseId = null;
        try {
            conversation = await Conversation.findById(conversationId);
            lastResponseId = conversation?.lastthreadrun?.lastResponseId || null;
        } catch (e) {
            console.log("Could not find conversation by id, starting fresh:", e.message);
        }

        // ── Session detection ────────────────────────────────────────────────
        const questionCreatedAt = Date.now();
        const lastMessageTime = conversation?.messages?.[0]?.answer_created_at || null;
        const isNewSession = !lastMessageTime || (questionCreatedAt - lastMessageTime) > SESSION_TIMEOUT_MS;

        let sessionId;
        if (isNewSession) {
            sessionId = 'sess_' + randomUUID().replace(/-/g, '').slice(0, 16);
            console.log("New session started:", sessionId);
        } else {
            sessionId = conversation?.lastthreadrun?.currentSessionId
                || 'sess_' + randomUUID().replace(/-/g, '').slice(0, 16);
            console.log("Continuing session:", sessionId);
        }

        // ── Think time: gap between previous answer and this question ─────────
        const think_time_ms = lastMessageTime ? (questionCreatedAt - lastMessageTime) : null;

        // ── Get assistant config from MongoDB ────────────────────────────────
        const assistantDocs = await Assistant.find({ id: assistantId });
        const assistantDoc = assistantDocs[0];
        if (!assistantDoc) {
            return NextResponse.json({ "msg": "Assistant not found", "errormsg": "Assistant not found" });
        }

        const model = assistantDoc.model || "gpt-5.4";
        const instructions = assistantDoc.instructions || "";
        const tools = assistantDoc.tools?.length > 0 ? transformTools(assistantDoc.tools) : undefined;

        // ── Single synchronous Responses API call ─────────────────────────────
        const params = {
            model,
            instructions,
            input: message,
            store: true,
            ...(tools && { tools }),
            ...(lastResponseId && { previous_response_id: lastResponseId })
        };
        console.log("calling responses.create with model:", model);

        const callStart = Date.now();
        const response = await openaiclient.responses.create(params);
        const answerCreatedAt = Date.now();
        const response_time_ms = answerCreatedAt - callStart;

        const answer = response.output_text;
        console.log("ANSWER FROM IA: ", answer?.slice(0, 100));

        // ── Usage metrics ─────────────────────────────────────────────────────
        const usage = response.usage ? {
            input_tokens: response.usage.input_tokens,
            output_tokens: response.usage.output_tokens,
            total_tokens: response.usage.total_tokens
        } : null;
        const totalTokens = usage?.total_tokens || 0;

        // ── Build enriched message object ─────────────────────────────────────
        const messageItem = {
            session_id: sessionId,
            question: message,
            answer,
            question_created_at: questionCreatedAt,
            answer_created_at: answerCreatedAt,
            question_length: message.length,
            answer_length: answer?.length || 0,
            think_time_ms,
            response_time_ms,
            usage,
            model
        };

        // ── Conversation-level counters ───────────────────────────────────────
        const newTotalMessages = (conversation?.total_messages || 0) + 1;
        const newTotalTokens = (conversation?.total_tokens || 0) + totalTokens;
        const newTotalSessions = isNewSession
            ? (conversation?.total_sessions || 0) + 1
            : (conversation?.total_sessions || 1);

        const baseSet = {
            lastthreadrun: { lastResponseId: response.id, currentSessionId: sessionId },
            last_active_at: answerCreatedAt,
            updated_at: answerCreatedAt,
            total_messages: newTotalMessages,
            total_tokens: newTotalTokens,
            total_sessions: newTotalSessions,
        };

        // ── Persist: session tracking + message ───────────────────────────────
        if (isNewSession) {
            const newSession = {
                session_id: sessionId,
                started_at: questionCreatedAt,
                ended_at: answerCreatedAt,
                duration_ms: answerCreatedAt - questionCreatedAt,
                message_count: 1,
                total_tokens: totalTokens
            };
            await Conversation.updateOne(
                { _id: conversationId },
                {
                    $set: baseSet,
                    $push: {
                        messages: { $each: [messageItem], $position: 0 },
                        sessions: { $each: [newSession], $position: 0 }
                    }
                }
            );
        } else {
            // Update the current session's stats using arrayFilters
            const existingSession = conversation?.sessions?.[0];
            await Conversation.updateOne(
                { _id: conversationId },
                {
                    $set: {
                        ...baseSet,
                        'sessions.$[sess].ended_at': answerCreatedAt,
                        'sessions.$[sess].duration_ms': answerCreatedAt - (existingSession?.started_at || questionCreatedAt),
                        'sessions.$[sess].message_count': (existingSession?.message_count || 0) + 1,
                        'sessions.$[sess].total_tokens': (existingSession?.total_tokens || 0) + totalTokens,
                    },
                    $push: {
                        messages: { $each: [messageItem], $position: 0 }
                    }
                },
                { arrayFilters: [{ 'sess.session_id': sessionId }] }
            );
        }

        return NextResponse.json({ "msg": "message sent", "answer": answer });

    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ "msg": "Error sending message", "error": String(error), "errormsg": "Error sending message" });
    }
}
