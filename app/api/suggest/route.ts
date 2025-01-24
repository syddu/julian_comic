import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { currentPanels } = body;

    let prompt;
    if (!currentPanels || currentPanels.length === 0) {
      prompt = `Imagine 3 brief actions for Julian to start his adventure. Each action should be a short sentence.`;
    } else {
      const lastPanel = currentPanels[currentPanels.length - 1];
      prompt = `Based on the previous panel where Julian was: ${lastPanel.prompt}, generate 3 brief actions that could happen next. Each action should be a short sentence.`;
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
          system: `Generate exactly 3 brief actions. Each action should be a single, concise sentence starting with "Julian" and containing a unique action or event. Format the response as:
1. Julian [action].
2. Julian [action].
3. Julian [action].`,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error('Ollama API call failed');
      }

      const data = await response.json();
      return NextResponse.json({ suggestions: data.response });

    } catch {
      return NextResponse.json({ 
        suggestions: currentPanels?.length === 0 
          ? "1. Julian finds a compass.\n2. Julian enters a cave.\n3. Julian meets a dragon."
          : "1. Julian finds a door.\n2. Julian follows footprints.",
        error: "An unexpected error occurred"
      });
    }

  } catch {
    return NextResponse.json({ 
      suggestions: "1. Julian finds a compass.\n2. Julian discovers a door.",
      error: "An unexpected error occurred"
    });
  }
}