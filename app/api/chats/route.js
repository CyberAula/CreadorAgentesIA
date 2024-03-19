import openaiclient from '../../lib/openai.js';
import { NextResponse } from 'next/server';
import dbConnect from "../../lib/dbconnect.js";
import Conversation from '@/app/models/Conversation.js';

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
        let { assistantId, userEmail } = req;  
        //if userEmail contains spaces it is because escapp do not encode it, so we replace them with + sign
        if(userEmail!=null && userEmail.includes(" ")){
            userEmail = userEmail.replace(/ /g, "+");
            console.log("Email with + sign: ", userEmail);
        }

        console.log("creating new chat for assistant: ",assistantId, " and user: ",userEmail);
        mythread = await openaiclient.beta.threads.create();

        //check if assistantId and userEmail already exist in database (maybe user did F5)
        const conversation = await Conversation.find({assistantId: assistantId, userEmail: userEmail});
        if(conversation.length>0){
            console.log("Chat already exists for assistant: ",assistantId, " and user: ",userEmail);
            console.log("We update the thread object");
            const conversationUpdate = await Conversation.updateOne({
                assistantId: assistantId,
                userEmail: userEmail},
                {lastthreadrun: mythread});
            console.log("conversation updated: ",conversationUpdate);
        } else {
            console.log("Chat does not exist for assistant: ",assistantId, " and user: ",userEmail);
            console.log("We create a new conversation");
            const conversationCreate = await Conversation.create({
                assistantId: assistantId,
                userEmail: userEmail,
                lastthreadrun: mythread,
                created_at: Date.now(),
                updated_at: Date.now(),
                conversation: []
            });
            console.log("conversation created: ",conversationCreate);
        }

        //return thread id
        return NextResponse.json({"msg":"chat created","thread":mythread.id})
    }
    catch (error) {
        console.error('Error creating chat:', error);
        return NextResponse.json({"msg":"Error creating chat", "error": error, "errormsg": "Error creating chat"})
    }

}
