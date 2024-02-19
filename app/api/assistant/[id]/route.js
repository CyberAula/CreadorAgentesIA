import { NextResponse } from "next/server";
import fsPromises from "fs/promises";
import path from "path";

const dataFilePath = path.join(process.cwd(), 'db.json');
  
//GET /API/ASSISTANT/ID
//api path to get one assistants /api/assistant/ID
export async function GET(request) {
    console.log("GET to /api/assistant/ID");
    var url = new URL(request.url)
    const assistantId = url.pathname.slice(url.pathname.lastIndexOf('/') + 1);
    console.log("GET del assistantId: ", assistantId);
    const jsonData = await fsPromises.readFile(dataFilePath);
    const objectData = JSON.parse(jsonData);
    let resData;
    if(assistantId!=null){
        let getAssistant
        if(assistantId=="new"){
            getAssistant = null
        }else{
            getAssistant = objectData.assistants[assistantId]
        }
        resData = {assistant:getAssistant}
    }else{
        resData = objectData;
    }
    return NextResponse.json(resData)  
}


//PUT /API/ASSISTANT/ID
//api path to update one assistant /api/assistant/ID
export async function PUT(request) {
    console.log("PUT to /api/assistant/ID");
    const { query, method } = request;
    const { id } = query;
    let resData = {msg:`Assistant ${id} updated`};
    return NextResponse.json(resData)
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