import openaiclient from '../../lib/openai.js';
import { NextResponse } from 'next/server';
import dbConnect from "../../lib/dbconnect.js";

await dbConnect();

//POST /API/CHAT
//api path to create a new chat "/api/chat" passing assistantId and userId
export async function POST(request) { 
    console.log("POST to /api/chat"); 
    let mythread;

    try {
        //get request body
        const req = await request.json()
        console.log("received params: ",req);
        const { assistantId, userEmail } = req;
        
        //TODO: check if assistantId and userEmail already exist in database (maybe user did F5)

        console.log("creating new chat for assistant: ",assistantId, " and user: ",userEmail);
        mythread = await openaiclient.beta.threads.create();

        //return thread id
        return NextResponse.json({"msg":"chat created","thread":mythread.id})
    }
    catch (error) {
        console.error('Error creating chat:', error);
        return NextResponse.json({"msg":"Error creating chat", "error": error, "errormsg": "Error creating chat"})
    }

}
