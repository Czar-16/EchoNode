"use client";

import { useState } from "react";

export default function Home() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  
  const presets = [
    "Travis Scott Hit Song",
    "Drake Hit Song",
    "Kanye West Hit Song",
    "Talha Anjum Hit Song",
    "J Cole Hit Song",
  ];


  const handlePlayWithValue = async (songTitle: string) => {
    if (!songTitle.trim()) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/play", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: songTitle }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setMessage(data.message);
    } catch (err: any) {
      setMessage(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = () => handlePlayWithValue(title);

 
  const handlePresetClick = (song: string) => {
    setTitle(song);
    handlePlayWithValue(song);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl flex flex-col items-center">
        {/* MAIN BOX */}
        <div className="w-full bg-black-900 border border-zinc-900 rounded-2xl p-9 shadow-xl grid grid-cols-1 gap-8">
          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-6">🎵 EchoNode 🎶</h1>

           
            <input
              type="text"
              placeholder="Enter song..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-700"
            />

            
            <button
              onClick={handlePlay}
              disabled={loading}
              className="w-full mt-4 p-3 rounded-lg bg-red-700 transition font-semibold disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Playing..." : "▶ Play"}
            </button>

           
            {message && (
              <p className="mt-4 text-sm text-white text-center">{message}</p>
            )}

            {/* ✅ PREDEFINED SONGS */}
            <div className="w-full mt-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 h-px bg-zinc-800"></div>
                <p className="text-xs text-zinc-500 tracking-widest">POPULAR</p>
                <div className="flex-1 h-px bg-zinc-800"></div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                {presets.map((song) => (
                  <button
                    key={song}
                    onClick={() => handlePresetClick(song)}
                    className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-700 text-sm text-zinc-300 hover:text-white hover:border-zinc-500 transition"
                  >
                    {song}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="mt-4 text-xs text-zinc-500 text-center">
        
          {new Date().getFullYear()} EchoNode. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
