import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbconnect.js";
import Assistant from '@/app/models/Assistant.js';
import openaiclient from '@/app/lib/openai.js';


await dbConnect();
  
//GET /API/ASSISTANT/ID
//api path to get one assistants /api/assistant/ID
export async function GET(request) {
    console.log("GET to /api/assistant/ID");
    var url = new URL(request.url)
    const assistantId = url.pathname.slice(url.pathname.lastIndexOf('/') + 1);
    console.log("GET del assistantId: ", assistantId);    
    //get from mongodb
    const objectData = await Assistant.find({id: assistantId});

    if(objectData.length==0){
        return NextResponse.json({msg:"Assistant not found"})
    } else {
        console.log("Assistant found: ",objectData[0]);
        return NextResponse.json(objectData[0])
    }
}

//NO LO USO. PARA EDITAR SE HACE UN POST. NO ES REST PERO NO IMPORTA... YA LO CAMBIARÉ. TODO. XXX
//PUT /API/ASSISTANT/ID
//api path to update one assistant /api/assistant/ID
export async function PUT(request) {
    console.log("PUT to /api/assistant/ID");
    const { query, method } = request;
    const { id } = query;
    let resData = {msg:`Assistant ${id} updated`};
    return NextResponse.json(resData)
}


//DELETE /API/ASSISTANT/ID
//api path to delete one assistant /api/assistant/ID
export async function DELETE(request) {
    console.log("DELETE to /api/assistant/ID");
    var url = new URL(request.url)
    const assistantId = url.pathname.slice(url.pathname.lastIndexOf('/') + 1);
    console.log("DELETE del assistantId: ", assistantId);
    //query to openai to delete assistant    
    const deleteAssistant = await openaiclient.beta.assistants.del(assistantId);
    console.log("Assistant deleted from OpenAI: ",deleteAssistant);

    //delete from mongodb
    const objectData = await Assistant.deleteOne({id: assistantId});
    console.log("Assistant deleted from MongoDB: ",objectData);

    let resData = {msg:`Assistant ${assistantId} deleted`};
    return NextResponse.json(resData);
}

/*
export default function assitantHandler(req,res) {
    const { query, method } = req;
    const id = query.id;
  
    switch (method) {
      case "GET":
        console.log("GET to /api/assistant/ID");
        res.status(200).json({ id});
        break;
      case "PUT":
        // Update or create data in your database
        console.log("PUT to /api/assistant/ID");
        res.status(200).json({ id });
        break;
      default:
        res.setHeader("Allow", ["GET", "PUT"]);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  }*/