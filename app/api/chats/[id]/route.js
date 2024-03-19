import openaiclient from '../../../lib/openai.js';
import { NextResponse } from "next/server";
import dbConnect from "../../../lib/dbconnect.js";
import Conversation from '@/app/models/Conversation.js';

await dbConnect();

//POST /API/CHATS/THREADID
//api path to create a new message in the conversation /api/chats/threadId
export async function POST(request) { 
    console.log("POST to /api/chats/threadId"); 
    var url = new URL(request.url)
    const threadId = url.pathname.slice(url.pathname.lastIndexOf('/') + 1);
    console.log("POST al threadId: ", threadId);

    try {
        //get request body
        const req = await request.json()
        console.log("received params: ",req);
        let { message, assistantId, userEmail } = req;
        //if userEmail contains spaces it is because escapp do not encode it, so we replace them with + sign
        if(userEmail!=null && userEmail.includes(" ")){
            userEmail = userEmail.replace(/ /g, "+");
            console.log("Email with + sign: ", userEmail);
        }        

        await openaiclient.beta.threads.messages.create(
            threadId,
            { role: "user", content: message }
        );
        const getRun = await openaiclient.beta.threads.runs.create(
            threadId,
            { assistant_id: assistantId }
        );
        console.log("RUN CREATED", getRun);
        //save to mongodb, push to array messages in model Conversation
        //place it in the first position, so we can easily add answers to the same message
        const messagesItem = {question: message, question_created_at: Date.now()};
        const conversationUpdate = await Conversation.updateOne({
            assistantId: assistantId,
            userEmail: userEmail},
            {$push: {messages: {$each: [messagesItem], $position: 0}}});
        console.log("conversation updated: ",conversationUpdate);
        //return run id
        return NextResponse.json({"msg":"message created","run":getRun});
    }
    catch (error) {
        console.error('Error creating message:', error);
        return NextResponse.json({"msg":"Error creating message", "error": error, "errormsg": "Error creating message"})
    }
}


//GET /API/CHATS/THREADID with runId or messages as query param
export async function GET(request) { 
    console.log("GET to /api/chats/threadId with runId or messages as query param"); 
    var url = new URL(request.url)
    const threadId = url.pathname.slice(url.pathname.lastIndexOf('/') + 1);
    const runId = url.searchParams.get("runId");
    const assistantId = url.searchParams.get("assistantId");
    let userEmail = url.searchParams.get("userEmail");
    //if userEmail contains spaces it is because escapp do not encode it, so we replace them with + sign
    if(userEmail!=null && userEmail.includes(" ")){
        userEmail = userEmail.replace(/ /g, "+");
        console.log("Email with + sign: ", userEmail);
    }
    const messages = url.searchParams.get("messages");
    if(runId==null && messages==null){
        //response error
        return NextResponse.json({"msg":"Error: runId or messages query param is required"})
    } else if(runId!=null){
        console.log("DATA threadId: ", threadId, " and runId: ", runId, " assistantId: ", assistantId, " userEmail: ", userEmail);
        try {
            const getRun = await openaiclient.beta.threads.runs.retrieve(
                threadId,
                runId
            );
            console.log("RUN RETRIEVED", getRun);
            if(getRun.status=="completed"){
                //save run as lastthreadrun in conversation, and push to array usage in model Conversation
                const conversationUpdate = await Conversation.updateOne({
                    assistantId: assistantId,
                    userEmail: userEmail},
                    {lastthreadrun: getRun, $push: {usage: {$each: [getRun.usage], $position: 0}}});
                console.log("conversation updated: ",conversationUpdate);
            }
            
            //return run
            return NextResponse.json({"msg":"run retrieved","run":getRun});
        }
        catch (error) {
            console.error('Error retrieving run:', error);
            return NextResponse.json({"msg":"Error retrieving run", "error": error, "errormsg": "Error retrieving run"})
        }
    } else if(messages!=null){
        console.log("GET al threadId: ", threadId, " and messages: ", messages, " assistantId: ", assistantId, " userEmail: ", userEmail);
        const getmessages = await openaiclient.beta.threads.messages.list(
            threadId
            );
        console.log("MESSAGES RETRIEVED", getmessages);
        const answer = getmessages.data[0].content[0].text.value;
        console.log("ANSWER FROM IA: ", answer);
        //retrieve conversation from mongodb
        console.log("assistantId: ", assistantId, " userEmail: ", userEmail)
        const conversation = await Conversation.find({assistantId: assistantId, userEmail: userEmail});
        console.log("conversation retrieved: ",conversation);
        //get last item from messages array
        let lastMessage = {};
        if(conversation.length>0 && conversation[0].messages!=undefined && conversation[0].messages.length>0){            
            lastMessage = conversation[0].messages.slice(-1)[0];
            console.log("lastMessage: ",lastMessage);
            lastMessage.answer = answer;
            lastMessage.answer_created_at = Date.now();

            //save to mongodb, update first item from messages array (because we pushed it in the first position)
            const conversationUpdate = await Conversation.updateOne({
                assistantId: assistantId,
                userEmail: userEmail},
                { $set: { 'messages.0': lastMessage } });
            console.log("conversation updated: ",conversationUpdate);
        } else {
            console.log("ERROR OPENGPT: No conversation found for assistant: ",assistantId, " and user: ",userEmail);
        }
        


        //return messages
        return NextResponse.json({"msg":"messages retrieved","messages":answer});
    }
}
        