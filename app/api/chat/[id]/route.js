import openaiclient from '../../../lib/openai.js';
import { NextResponse } from "next/server";
import fsPromises from "fs/promises";
import path from "path";

//POST /API/CHAT/THREADID
//api path to create a new message in the conversation /api/chat/threadId
export async function POST(request) { 
    console.log("POST to /api/chat/threadId"); 
    var url = new URL(request.url)
    const threadId = url.pathname.slice(url.pathname.lastIndexOf('/') + 1);
    console.log("POST al threadId: ", threadId);

    try {
        //get request body
        const req = await request.json()
        console.log("received params: ",req);
        const { message, assistantId } = req;

        await openaiclient.beta.threads.messages.create(
            threadId,
            { role: "user", content: message }
        );
        const getRun = await openaiclient.beta.threads.runs.create(
            threadId,
            { assistant_id: assistantId }
        );
        console.log("RUN CREATED", getRun);
        //return run id
        return NextResponse.json({"msg":"message created","run":getRun});
    }
    catch (error) {
        console.error('Error creating message:', error);
        return NextResponse.json({"msg":"Error creating message", "error": error, "errormsg": "Error creating message"})
    }
}


//GET /API/CHAT/THREADID with runId or messages as query param
export async function GET(request) { 
    console.log("GET to /api/chat/threadId with runId or messages as query param"); 
    var url = new URL(request.url)
    const threadId = url.pathname.slice(url.pathname.lastIndexOf('/') + 1);
    const runId = url.searchParams.get("runId");
    const messages = url.searchParams.get("messages");
    if(runId==null && messages==null){
        //response error
        return NextResponse.json({"msg":"Error: runId or messages query param is required"})
    } else if(runId!=null){
        console.log("DATA threadId: ", threadId, " and runId: ", runId);
        try {
            const getRun = await openaiclient.beta.threads.runs.retrieve(
                threadId,
                runId
            );
            console.log("RUN RETRIEVED", getRun);
            //return run
            return NextResponse.json({"msg":"run retrieved","run":getRun});
        }
        catch (error) {
            console.error('Error retrieving run:', error);
            return NextResponse.json({"msg":"Error retrieving run", "error": error, "errormsg": "Error retrieving run"})
        }
    } else if(messages!=null){
        console.log("GET al threadId: ", threadId, " and messages: ", messages);
        const getmessages = await openaiclient.beta.threads.messages.list(
            threadId
            );
        console.log("MESSAGES RETRIEVED", getmessages);
        //return messages
        return NextResponse.json({"msg":"messages retrieved","messages":getmessages});
    }
}
        