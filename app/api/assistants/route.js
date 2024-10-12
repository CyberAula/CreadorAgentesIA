import { NextResponse } from 'next/server';
import openaiclient from '../../lib/openai.js';
import dbConnect from "../../lib/dbconnect.js";
import Assistant from '@/app/models/Assistant.js';

await dbConnect();

//POST /API/ASSISTANTS
//api path to create a new assistant /api/assistants
export async function POST(request) { 
    console.log("POST to /api/assistants"); 

    try {
        //get request body
        const req = await request.json()
        const { id,name,instructions,model,tools } = req;
        console.log("received params: ",req);

        let getAssistant;
        //XXX TODO importante quito file_ids porque en v2 no va ahí https://platform.openai.com/docs/assistants/migration/what-has-changed
        //todo el tema de ficheros habria que afinarlo
        if(id=="new"){
            console.log("creating new assistant");
            getAssistant = await openaiclient.beta.assistants.create({
            name: name,
            instructions: instructions,
            model:model,
            tools: tools,
            })
            //add created_at field
            getAssistant.created_at = Date.now();
            getAssistant.updated_at = Date.now();
            console.log("assistant created: ",getAssistant);

            //save to mongodb
            const mongores = await Assistant.create(getAssistant);
            console.log("assistant saved to mongodb: ",mongores);

        }else{
            console.log("updating assistant: ",id);
            getAssistant = await openaiclient.beta.assistants.update(id,{
            name: name,
            instructions: instructions,
            model:model,
            tools: tools,
            })
            getAssistant.updated_at = Date.now();            
            console.log("assistant upated: ",getAssistant);

            //update to mongodb
            const mongores = await Assistant.updateOne({id: id}, getAssistant);
            console.log("assistant updated to mongodb: ",mongores);
        }
        
        return NextResponse.json({"msg":"assistant created", "assistant": getAssistant})

    } catch (error) {
        console.error('Error creating assistant:', error);
        return NextResponse.json({"msg":"Error creating assistant", "error": error, "errormsg": "Error creating assistant"})
    }
    
            
}



//GET /API/ASSISTANTs
//api path to get all assistants /api/assistants
export async function GET(request) {
    console.log("GET to /api/assistants");    
    
    try {
        const assistants = await Assistant.find({});
        console.log("assistants: ",assistants);
        return NextResponse.json(assistants);
    } catch (error) {
        console.error('Error getting assistants:', error);
        return NextResponse.json({"msg":"Error getting assistants", "error": error, "errormsg": "Error getting assistants"})
    }
}

