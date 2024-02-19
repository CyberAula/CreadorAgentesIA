import fsPromises from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import openaiclient from '../../lib/openai.js';


const dataFilePath = path.join(process.cwd(), 'db.json');


//POST /API/ASSISTANT
//api path to create a new assistant /api/assistant
export async function POST(request) { 
    console.log("POST to /api/assistant"); 

    try {        
        const jsonData = await fsPromises.readFile(dataFilePath);
        const objectData = JSON.parse(jsonData);        

        //get request body
        const req = await request.json()
        const { id,name,instructions,model,tools } = req;
        console.log("received params: ",req);

        let getAssistant;
        if(id=="new"){
            console.log("creating new assistant");
            getAssistant = await openaiclient.beta.assistants.create({
            name: name,
            instructions: instructions,
            model:model,
            tools: tools,
            file_ids: []
            })
        }else{
            console.log("updating assistant: ",id);
            getAssistant = await openaiclient.beta.assistants.update(id,{
            name: name,
            instructions: instructions,
            model:model,
            tools: tools,
            file_ids: []
            })
        }
        console.log("assistant created: ",getAssistant);
        //save assistant in db.json
        objectData.assistants[getAssistant.id] = getAssistant;

        await fsPromises.writeFile(dataFilePath, JSON.stringify(objectData));
    } catch (error) {
        console.error('Error creating assistant:', error);
        return NextResponse.json({"msg":"Error creating assistant", "error": error, "errormsg": "Error creating assistant"})
    }
    
    return NextResponse.json({"msg":"assistant created"})
            
}



//GET /API/ASSISTANT
//api path to get all assistants /api/assistant
export async function GET(request) {
    console.log("GET to /api/assistant");
    const { query, method } = request;
    let resData = {msg:`List of all Assistants`};
    return NextResponse.json(resData)
  
}

