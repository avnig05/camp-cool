// app/api/chat/route.ts
import { NextResponse } from 'next/server';

const FASTAPI_CHAT_URL = "http://127.0.0.1:8000/api/chat"; // Your FastAPI backend URL

export async function POST(request: Request) {
  try {
    const formData = await request.formData(); // Parse FormData from the frontend
    const userText = formData.get("text") as string | null;

    if (!userText) {
      return NextResponse.json({ error: 'Message text is required from FormData' }, { status: 400 });
    }

    // --- SCENARIO A: Your FastAPI backend expects JSON { "message": "..." } ---
    // (This was my last recommendation for your FastAPI code)
    let fastApiResponse;
    // try {
    //   fastApiResponse = await fetch(FASTAPI_CHAT_URL, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ message: userText }), // Send JSON to FastAPI
    //   });
    // } catch (e) {
    //   console.error("Error calling FastAPI:", e);
    //   return NextResponse.json({ error: "Failed to connect to chat service (FastAPI JSON)" }, { status: 503 });
    // }


    // --- SCENARIO B: Your FastAPI backend expects FormData with a 'text' field ---
    // (If your FastAPI still uses `text: str = Form(...)`)
    try {
      const fastApiFormData = new FormData();
      fastApiFormData.append("text", userText);

      fastApiResponse = await fetch(FASTAPI_CHAT_URL, {
        method: "POST",
        body: fastApiFormData, // Send FormData to FastAPI
      });
    } catch (e) {
      console.error("Error calling FastAPI:", e);
      return NextResponse.json({ error: "Failed to connect to chat service (FastAPI FormData)" }, { status: 503 });
    }
    // --- End Scenario B ---


    if (!fastApiResponse.ok) {
      const errorBody = await fastApiResponse.text(); // Get more details from FastAPI error
      console.error(`FastAPI responded with error ${fastApiResponse.status}:`, errorBody);
      return NextResponse.json({ error: `Chat service failed with status: ${fastApiResponse.status}` }, { status: fastApiResponse.status });
    }

    const fastApiData = await fastApiResponse.json();

    // IMPORTANT: Ensure the key sent back to your Next.js frontend is "reply"
    // Your FastAPI might be returning {"response": ...} as seen in your successful tool test.
    // Adjust here if needed:
    const replyFromAI = fastApiData.reply || fastApiData.response || "Error: Could not get reply key from AI.";

    return NextResponse.json({ reply: replyFromAI });

  } catch (error) {
    console.error('Next.js /api/chat Error:', error);
    return NextResponse.json({ error: 'Failed to process chat message in Next.js API route' }, { status: 500 });
  }
}