/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Loader2, Play, Square, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [svgLogo, setSvgLogo] = useState<string | null>(null);
  const [isAnimated, setIsAnimated] = useState(false);
  const [error, setError] = useState('');

  const generateLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsGenerating(true);
    setError('');
    setIsAnimated(false);

    try {
      const res = await fetch('/api/generate-logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate logo');
      }

      const data = await res.json();
      setSvgLogo(data.svg);
    } catch (err) {
      console.error(err);
      setError('An error occurred while generating the logo. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadLogo = () => {
    if (!svgLogo) return;
    const blob = new Blob([svgLogo], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'logo.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#050505] text-white font-sans overflow-hidden selection:bg-cyan-500/30">
      {/* Sidebar */}
      <aside className="w-full md:w-80 lg:w-96 bg-[#0a0a0c] border-b md:border-b-0 md:border-r border-white/5 p-6 md:p-8 flex flex-col gap-6 md:gap-8 z-20 relative shrink-0 max-h-[50vh] md:max-h-none overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2 md:mb-4">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 animate-pulse shrink-0"></div>
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400">Aura Design</span>
        </div>

        <div className="space-y-6 md:space-y-8 flex-1">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3 block font-bold">
              Core Concept
            </label>
            <textarea
              rows={5}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm leading-relaxed text-zinc-300 shadow-inner focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 resize-none transition-colors"
              placeholder="e.g. A sharp, neo-brutalist monolith intersecting a liquid sphere. Color palette: Obsidian and Volt Green."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs leading-relaxed">
              {error}
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 md:pt-8">
          <button
            onClick={generateLogo}
            disabled={isGenerating || !description.trim()}
            className="w-full py-4 bg-white text-black font-black text-xs rounded-xl tracking-tighter hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                SYNTHESIZING...
              </>
            ) : (
              <>SYNTHESIZE LOGO</>
            )}
          </button>
          <p className="text-[9px] text-zinc-600 mt-4 text-center tracking-widest uppercase hidden md:block">
            Render Engine v4.2 / GPU Accelerated
          </p>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 relative flex flex-col min-w-0 bg-[#050505]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_#1a1a2e_0%,_transparent_60%)] opacity-40 pointer-events-none"></div>

        <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-4 sm:p-8">
          <div className="relative group">
            <div className="absolute -inset-10 md:-inset-20 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="w-64 h-64 md:w-80 md:h-80 relative flex items-center justify-center border border-white/10 rounded-[30px] md:rounded-[40px] bg-white/[0.02] backdrop-blur-3xl shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none"></div>

              <AnimatePresence mode="wait">
                {!svgLogo ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center text-zinc-600 relative z-10"
                  >
                    <div className="w-12 h-12 mb-4 border border-zinc-800 rounded-full flex items-center justify-center opacity-50">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] tracking-widest uppercase font-bold text-zinc-700">Awaiting Input</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full h-full flex items-center justify-center p-8 md:p-12 relative z-10"
                  >
                    <motion.div
                      className="w-full h-full flex items-center justify-center"
                      animate={
                        isAnimated
                          ? {
                              y: [0, -15, 0],
                              rotate: [0, 5, -5, 0],
                              scale: [1, 1.05, 1],
                            }
                          : {}
                      }
                      transition={
                        isAnimated
                          ? {
                              duration: 4,
                              ease: "easeInOut",
                              repeat: Infinity,
                            }
                          : {}
                      }
                      dangerouslySetInnerHTML={{ __html: svgLogo }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="absolute -bottom-12 md:-bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-6">
              <div className={`flex flex-col items-center transition-opacity ${svgLogo ? 'opacity-100' : 'opacity-40'}`}>
                <span className="text-[10px] text-zinc-500 mb-1 font-bold">SVG</span>
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
              <div className={`flex flex-col items-center transition-opacity ${isAnimated ? 'opacity-100' : 'opacity-40'}`}>
                <span className="text-[10px] text-cyan-400 font-bold mb-1 tracking-widest">MOTION</span>
                <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-20 md:h-32 bg-white/[0.02] border-t border-white/5 backdrop-blur-md px-6 md:px-12 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsAnimated(!isAnimated)}
                disabled={!svgLogo}
                className={`w-10 h-10 border rounded-full flex items-center justify-center transition-all ${
                  isAnimated
                    ? 'border-cyan-500/50 text-cyan-400 bg-cyan-500/10'
                    : 'border-white/10 text-zinc-400 hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed'
                }`}
                title={isAnimated ? "Stop Animation" : "Play Animation"}
              >
                {isAnimated ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <div className="hidden lg:flex w-64 h-[2px] bg-zinc-800 relative rounded-full overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-cyan-500"
                  initial={{ width: "0%" }}
                  animate={{ width: isAnimated ? ["0%", "100%"] : "0%" }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>
            <span className="text-[10px] font-mono tracking-widest hidden md:block uppercase font-bold text-zinc-500">
              {isAnimated ? <span className="text-cyan-400">RENDER_ACTIVE</span> : 'IDLE_STATE'}
            </span>
          </div>

          <div className="flex gap-3 md:gap-4">
            <button
              onClick={downloadLogo}
              disabled={!svgLogo}
              className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-[10px] uppercase font-bold text-cyan-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-cyan-500/30 flex items-center gap-2"
            >
              <Download className="w-3 h-3 md:hidden" />
              <span className="hidden md:inline">Export Vector</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
