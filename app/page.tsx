'use client';
import { useState } from "react";
import Image from 'next/image';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [dialogue, setDialogue] = useState('');
  const [images, setImages] = useState<Array<{url: string, dialogue: string, prompt: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string>('Click "Get Ideas" to see story suggestions!');
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const getSuggestions = async () => {
    setLoadingSuggestions(true);
    setSuggestions('Thinking of ideas...');
    
    try {
      console.log('Getting suggestions for panels:', images);
      const response = await fetch("/api/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          currentPanels: images.map(img => ({
            prompt: img.prompt,
            dialogue: img.dialogue
          }))
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await response.json();
      console.log('Received suggestions:', data);
      
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      } else {
        throw new Error('No suggestions received');
      }
    } catch (error) {
      console.error("Error getting suggestions:", error);
      setSuggestions(
        images.length === 0 
          ? "1. How about Julian starting a magical adventure?\n2. How about Julian finding a mysterious map?"
          : "1. How about Julian continuing his journey?\n2. How about Julian making a discovery?"
      );
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const generateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length >= 6) {
      alert("Comic is full! Reset to start over.");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/generate', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ prompt: `What is Julian doing right now? ${prompt}` }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate image: ${response.status}`);
      }

      const data = await response.json();

      if (data.imageUrl) {
        setImages([...images, { url: data.imageUrl, dialogue: dialogue, prompt: prompt }]);
        setPrompt('');
        setDialogue('');
        // Clear suggestions to prompt user to get new ones
        setSuggestions('Get new ideas for what happens next!');
      } else {
        throw new Error('No image URL in response');
      }
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image");
    } finally {
      setLoading(false);
    }
  };

  const resetComic = () => {
    setImages([]);
    setPrompt('');
    setDialogue('');
    setSuggestions('Click "Get Ideas" to start a new story!');
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-[#fdf7ff]">
      <h1 className="text-4xl font-bold mb-8 text-center p-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-200 border-4 border-white" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
        Julian&apos;s Comic Adventure!
      </h1>
      
      {/* Comic Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8 w-full max-w-4xl">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="aspect-square border-4 border-purple-400 rounded-2xl p-2 relative bg-white shadow-lg transform hover:scale-105 transition-transform duration-200 max-h-[300px]">
            {images[index] ? (
              <>
                <Image 
                  src={images[index].url} 
                  alt={`Panel ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-xl"
                />
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-600 to-purple-600/70 p-2 text-white text-center rounded-b-xl font-bold min-h-[15%] flex items-center justify-center"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  <p className="text-sm leading-tight">
                    {images[index].dialogue}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-purple-300 text-xl font-bold animate-pulse" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                Panel {index + 1}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl mt-8">
        {/* Input Form */}
        <form onSubmit={generateImage} className="flex-1 space-y-6 bg-white p-8 rounded-2xl shadow-lg border-4 border-pink-400">
          <div className="space-y-2">
            <label className="block text-purple-600 font-bold mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              What is Julian doing right now? 🎨
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe Julian&apos;s action..."
              className="w-full p-4 border-3 border-purple-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500 bg-purple-50 placeholder-purple-300 text-purple-600 font-medium transition-all duration-200"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-pink-600 font-bold mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              What&apos;s being said? 💭
            </label>
            <input
              type="text"
              value={dialogue}
              onChange={(e) => setDialogue(e.target.value)}
              placeholder="Add some dialogue..."
              className="w-full p-4 border-3 border-pink-300 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-500 bg-pink-50 placeholder-pink-300 text-pink-600 font-medium transition-all duration-200"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            />
          </div>
          <div className="flex gap-4">
            <button 
              type="submit" 
              disabled={loading || images.length >= 6}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-400 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 border-2 border-white"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              {loading ? "✨ Creating..." : "✨ Add Panel"}
            </button>
            <button 
              type="button"
              onClick={resetComic}
              className="px-6 py-4 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-2 border-white"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              🔄 Reset
            </button>
          </div>
          <p className="text-center text-purple-600 font-bold animate-pulse" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            {6 - images.length} panels remaining! ✨
          </p>
        </form>

        {/* Updated Suggestions Panel */}
        <div className="w-full md:w-80 bg-white p-6 rounded-2xl shadow-lg border-4 border-purple-400">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-purple-600" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              ✨ Story Ideas
            </h3>
            <button
              onClick={getSuggestions}
              disabled={loadingSuggestions}
              className="px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 border-2 border-white"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              {loadingSuggestions ? "🤔 Thinking..." : "🎲 Get Ideas"}
            </button>
          </div>
          
          <div className="prose prose-purple" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            {suggestions.split('\n').map((line, index) => (
              <p key={index} className="mb-2 text-purple-700">
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
