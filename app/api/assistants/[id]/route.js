import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbconnect.js";
import Assistant from '@/app/models/Assistant.js';

await dbConnect();

//GET /API/ASSISTANT/ID
//api path to get one assistant /api/assistant/ID
export async function GET(request) {
    console.log("GET to /api/assistant/ID");
    var url = new URL(request.url)
    const assistantId = url.pathname.slice(url.pathname.lastIndexOf('/') + 1);
    console.log("GET del assistantId: ", assistantId);
    const objectData = await Assistant.find({ id: assistantId });

    if (objectData.length == 0) {
        return NextResponse.json({ msg: "Assistant not found" })
    } else {
        console.log("Assistant found: ", objectData[0]);
        return NextResponse.json(objectData[0])
    }
}

//DELETE /API/ASSISTANT/ID
//api path to delete one assistant /api/assistant/ID
export async function DELETE(request) {
    console.log("DELETE to /api/assistant/ID");
    var url = new URL(request.url)
    const assistantId = url.pathname.slice(url.pathname.lastIndexOf('/') + 1);
    console.log("DELETE del assistantId: ", assistantId);

    const objectData = await Assistant.deleteOne({ id: assistantId });
    console.log("Assistant deleted from MongoDB: ", objectData);

    return NextResponse.json({ msg: `Assistant ${assistantId} deleted` });
}
