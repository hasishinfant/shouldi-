import React, { useState, useRef, useEffect } from 'react';
import { analyzeDecision } from './services/geminiService.ts';
import { DecisionAnalysis, AppStatus, ChatMessage } from './types.ts';
import DecisionPanel from './components/DecisionPanel.tsx';

const SCENARIOS = [
  { label: "Coffee Roastery", text: "Should I quit my stable engineering job to start a boutique coffee roastery?", color: "bg-orange-400" },
  { label: "Non-Profit Pivot", text: "I've been offered a stable corporate role vs starting a non-profit.", color: "bg-green-400" },
  { label: "Japan Residency", text: "Should I move to Japan for a year-long art residency?", color: "bg-pink-400" }
];

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<AppStatus>('idle');
  const [analysis, setAnalysis] = useState<DecisionAnalysis | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'lab' | 'quick'>('map');
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleAnalyze = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const msg = customMsg || input.trim();
    if (!msg) return;

    setStatus('loading');
    setError(null);
    setIsUsingFallback(false);

    try {
      // keep history short (important for Groq)
      const newHistory: ChatMessage[] = [
        ...history,
        { role: 'user', text: msg }
      ].slice(-6);

      const response = await analyzeDecision(newHistory);

      setAnalysis(response.analysis);
      setIsUsingFallback(response.usedFallback);

      setHistory([
        ...newHistory,
        {
          role: 'assistant',
          text: response.analysis.chatResponse || 'Strategy map updated.'
        }
      ]);

      setStatus('analyzed');
      setInput('');
      setActiveTab('map');
    } catch (err: any) {
      if (err.message === 'QUOTA_LIMIT') {
        setError('Decision engine is at capacity. Please try again shortly.');
      } else if (err.message === 'KEY_NOT_FOUND') {
        setError('Groq API key not found. Check your .env.local file.');
      } else {
        setError('Critical failure. The paths are unclear right now.');
      }
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen pb-20 text-black">
      {/* HEADER */}
      <header className="bg-white p-6 comic-border border-t-0 border-l-0 border-r-0 flex justify-between sticky top-0 z-50">
        <div
          className="bg-yellow-400 comic-border px-4 py-1 comic-font text-4xl -rotate-2 cursor-pointer"
          onClick={() => {
            setStatus('idle');
            setAnalysis(null);
            setHistory([]);
          }}
        >
          SHOULDI?
        </div>
        <div className="flex items-center gap-4">
          <div className="marker-font italic">Strategic Simulation</div>
          {isUsingFallback && (
            <div className="bg-blue-600 text-white px-2 py-1 text-[10px] comic-font uppercase comic-border">
              Optimized Engine Active
            </div>
          )}
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 mt-10">
        {status === 'idle' && (
          <div className="max-w-4xl mx-auto space-y-16">
            <div className="bg-white comic-border p-10">
              <h2 className="comic-font text-6xl uppercase">
                The <span className="text-red-600">Crossroads</span>
              </h2>
              <p className="text-2xl font-bold mt-4">
                What choice haunts you?
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {SCENARIOS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleAnalyze(undefined, s.text)}
                  className="relative hover:scale-105 transition-transform"
                >
                  <div className={`absolute inset-0 ${s.color} translate-x-2 translate-y-2 comic-border`} />
                  <div className="relative bg-white comic-border p-4">
                    <h3 className="comic-font text-2xl">{s.label}</h3>
                    <p className="text-xs italic">"{s.text}"</p>
                  </div>
                </button>
              ))}
            </div>

            <form onSubmit={handleAnalyze} className="space-y-6">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your dilemma..."
                className="w-full h-48 p-8 comic-border text-xl"
              />
              <button className="w-full py-6 bg-yellow-400 comic-border comic-font text-4xl uppercase">
                Begin Simulation
              </button>
            </form>
          </div>
        )}

        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center p-20">
            <div className="w-24 h-24 border-8 border-black border-t-yellow-400 rounded-full animate-spin" />
            <p className="comic-font text-3xl mt-6">Running Simulation…</p>
          </div>
        )}

        {status === 'error' && (
          <div className="max-w-xl mx-auto bg-red-100 comic-border p-10 text-center">
            <h2 className="comic-font text-5xl text-red-600 mb-4">
              System Panic!
            </h2>
            <p className="font-bold">{error}</p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-6 bg-black text-white px-8 py-4 comic-font text-2xl uppercase"
            >
              Retry
            </button>
          </div>
        )}

        {analysis && status === 'analyzed' && (
          <div className="space-y-10">
            {/* TAB BAR */}
            <div className="flex justify-center mb-6">
              <div className="bg-black p-2 comic-border flex gap-4">
                {['map', 'lab', 'quick'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t as any)}
                    className={`px-6 py-2 comic-font text-2xl uppercase ${
                      activeTab === t
                        ? 'bg-yellow-400 text-black'
                        : 'text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* MAP VIEW */}
            {activeTab === 'map' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Panel 1: The Situation */}
                <DecisionPanel title={analysis.panel1.title} accentColor="bg-blue-400 text-black">
                  <p className="text-lg leading-relaxed">{analysis.panel1.narration}</p>
                </DecisionPanel>

                {/* Panel 2: Key Questions */}
                <DecisionPanel title={analysis.panel2.title} accentColor="bg-purple-400 text-white">
                  <ul className="space-y-3">
                    {analysis.panel2.questions.map((q, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="comic-font text-2xl text-purple-600">?</span>
                        <span className="font-bold">{q}</span>
                      </li>
                    ))}
                  </ul>
                </DecisionPanel>

                {/* Panel 3: Options */}
                {analysis.panel3.options.map((opt, i) => (
                  <DecisionPanel 
                    key={i} 
                    title={opt.name} 
                    accentColor="bg-green-400 text-black"
                    className="col-span-1"
                  >
                    <p className="italic mb-4">{opt.description}</p>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-bold text-green-700 mb-1">Pros:</h4>
                        <ul className="text-sm space-y-1">
                          {opt.pros.map((p, j) => (
                            <li key={j}>+ {p}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-red-700 mb-1">Cons:</h4>
                        <ul className="text-sm space-y-1">
                          {opt.cons.map((c, j) => (
                            <li key={j}>- {c}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="pt-2 border-t-2 border-black">
                        <p className="text-xs font-bold">Trade-off: {opt.tradeOff}</p>
                      </div>
                    </div>
                  </DecisionPanel>
                ))}

                {/* Panel 4: Verdict */}
                <DecisionPanel 
                  title={analysis.panel4.title} 
                  accentColor="bg-red-600 text-white"
                  variant="verdict"
                  className="md:col-span-2"
                >
                  <div className="stamp mb-6">{analysis.panel4.verdict}</div>
                  <p className="text-lg font-bold mb-4">{analysis.panel4.reasoning}</p>
                  <div className="mt-6 pt-4 border-t-4 border-black">
                    <h4 className="font-bold mb-2">Key Assumptions:</h4>
                    <ul className="text-sm space-y-1">
                      {analysis.panel4.assumptions.map((a, i) => (
                        <li key={i}>• {a}</li>
                      ))}
                    </ul>
                  </div>
                </DecisionPanel>

                {/* Panel 5: Confidence */}
                <DecisionPanel title={analysis.panel5.title} accentColor="bg-yellow-400 text-black">
                  <div className="text-center">
                    <div className="text-7xl comic-font mb-4">{analysis.panel5.confidenceScore}%</div>
                    <p className="text-sm">{analysis.panel5.explanation}</p>
                  </div>
                </DecisionPanel>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-40 bg-white p-12 text-center border-t-8 border-black">
        <div className="comic-font text-4xl">SHOULDI? ENGINE</div>
        <p className="marker-font uppercase tracking-widest text-xs">
          Logic Simulation Powered by Groq
        </p>
      </footer>
    </div>
  );
};

export default App;