import { NextResponse } from 'next/server';
import Replicate from "replicate";
  
console.log(process.env.REPLICATE_API_TOKEN);

const replicate = new Replicate({
   auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
  if (!process.env.REPLICATE_API_TOKEN) {
    console.error("Missing Replicate API token");
    return NextResponse.json(
      { error: "Replicate API token is not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const prompt = body.prompt;
    
    console.log("Received prompt:", prompt);

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Format the prompt properly for JUJUBE
    const formattedPrompt = `JUJUBE is a Chinese teenage boy, ${prompt}, realistic cartoon style, high quality`;
    console.log("Formatted prompt:", formattedPrompt);

    // Run the model
    const output = await replicate.run(
      "sundai-club/jujube:64bb4a1c570c7b3dc7a193b0492755657d2fa526a11e494a18997b83e0a25dbe",
      {
        input: {
          prompt: formattedPrompt,
          num_outputs: 1,
          scheduler: "K_EULER",
          num_inference_steps: 50
        }
      }
    );

    console.log("Raw output:", output);
    const imageUrl = Array.isArray(output) && output.length > 0 ? String(output[0]) : null;
    console.log("Image URL:", imageUrl);

    if (!imageUrl) {
      return NextResponse.json(
        { error: "No image URL generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({ imageUrl });

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
