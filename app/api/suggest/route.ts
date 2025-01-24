import { NextResponse } from 'next/server';

interface Panel {
  prompt: string;
  dialogue: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { currentPanels } = body;

    let prompt;
    if (!currentPanels || currentPanels.length === 0) {
      prompt = `Imagine 3 unique actions for Julian to start his adventure. Each action should be a brief sentence with an interesting story idea`;
    } else {
      const lastPanel = currentPanels[currentPanels.length - 1];
      prompt = `Based on the previous panel where Julian was: ${lastPanel.prompt}, generate a numbered list of 3 unique events that could happen next to Julian. Each action should be a very brief sentence.`;
    }

    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tinyllama',
          prompt: prompt,
          system: `Generate exactly 3 unique bullet points. Each bullet should be a single, concise sentence starting with "Julian" and containing an action or event. Do not include sub-points. Format the response as:
1. Julian [unique action]?
2. Julian [unique action]?
3. Julian [unique action]?`,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error('Ollama API call failed');
      }

      const data = await response.json();
      return NextResponse.json({ suggestions: data.response });

    } catch (error) {
      return NextResponse.json({ 
        suggestions: currentPanels?.length === 0 
          ? "1. How about Julian discovering a magical compass?\n2. How about Julian exploring a secret cave?\n3. How about Julian meeting a friendly dragon?"
          : "1. How about Julian finding a secret door?\n2. How about Julian following mysterious footprints?"
      });
    }

  } catch (error) {
    return NextResponse.json({ 
      suggestions: "1. How about Julian finding a magical compass?\n2. How about Julian discovering a secret door?"
    });
  }
}