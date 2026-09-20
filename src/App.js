
import React, { useState, useEffect } from 'react';

// 1. Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-red-50 text-gray-900">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-10 space-y-4 border border-red-200 text-center">
            <h1 className="text-3xl font-extrabold text-red-600">UI Fault Recovered</h1>
            <p className="font-medium text-gray-700">A rendering error was caught. Your session data is safe.</p>
            <button onClick={() => window.location.reload()} className="w-full py-4 mt-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800">
              Reload Interface
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AppWrapper() {
  return <ErrorBoundary><App /></ErrorBoundary>;
}

// 2. Spotlight Card Component for Interactive Upload Zone
const SpotlightCard = ({ children, className = "", spotlightColor = "rgba(37, 99, 235, 0.12)" }) => {
  const divRef = React.useRef(null);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = React.useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0"
        style={{
          opacity,
          background: `radial-gradient(350px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

// 3. Truth Table Visualizer Component
const TruthTableVisualizer = ({ steps }) => {
  const vars = [...new Set(steps.join('').match(/[A-Z]/g) || [])].sort();
  if (vars.length === 0) return null;

  const numRows = Math.pow(2, vars.length);
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    const row = {};
    vars.forEach((v, idx) => {
      row[v] = (i >> (vars.length - 1 - idx)) & 1; 
    });
    rows.push(row);
  }

  const evaluate = (expr, row) => {
    let parsed = expr.replace(/([A-Z\)])\s*(?=[A-Z\(~])/g, '$1*');
    parsed = parsed
      .replace(/~/g, '!')
      .replace(/\*/g, '&&')
      .replace(/\+/g, '||')
      .replace(/\^/g, '!==');

    try {
      const fn = new Function(...vars, `return !!(${parsed});`);
      return fn(...vars.map(v => row[v])) ? 1 : 0;
    } catch {
      return '-';
    }
  };

  return (
    <div className="mt-8 border border-gray-200 rounded-xl overflow-hidden shadow-sm animate-fade-in">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Exhaustive Truth Table Evaluation</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        <table className="w-full text-sm text-center">
          <thead className="bg-white border-b border-gray-100 font-mono text-gray-400 sticky top-0">
            <tr>
              {vars.map(v => <th key={v} className="py-3 px-3 font-semibold bg-white">{v}</th>)}
              {steps.map((s, i) => <th key={i} className="py-3 px-3 border-l border-gray-100 font-semibold bg-white">Step {i+1}</th>)}
            </tr>
          </thead>
          <tbody className="font-mono text-lg bg-white">
            {rows.map((row, i) => {
              const stepResults = steps.map(s => evaluate(s, row));
              const isContradiction = !stepResults.every(val => val === stepResults[0]);
              
              return (
                <tr key={i} className={`border-b last:border-0 transition-colors ${isContradiction ? 'bg-red-50 text-red-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}>
                  {vars.map(v => <td key={v} className="py-3 px-3">{row[v]}</td>)}
                  {steps.map((s, idx) => (
                    <td key={idx} className={`py-3 px-3 border-l ${isContradiction ? 'border-red-100' : 'border-gray-100'}`}>
                      {stepResults[idx]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 4. Hardware Synthesizer Component (Verilog Output)
const HardwareSynthesizer = ({ steps, isValid }) => {
  if (!isValid || steps.length === 0) return null;

  const finalEquation = steps[steps.length - 1];
  const vars = [...new Set(finalEquation.match(/[A-Z]/g) || [])].sort();
  
  const verilogExpr = finalEquation
    .replace(/([A-Z\)])\s*(?=[A-Z\(~])/g, '$1 & ')
    .replace(/~/g, '~')
    .replace(/\+/g, ' | ')
    .replace(/\*/g, ' & ')
    .replace(/\^/g, ' ^ ');

  return (
    <div className="mt-8 border border-gray-800 bg-gray-900 rounded-xl overflow-hidden shadow-2xl animate-fade-in text-left">
      <div className="bg-black px-4 py-3 border-b border-gray-800 flex justify-between items-center">
        <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Hardware Synthesis Output (Verilog)
        </h3>
        <span className="text-[10px] text-gray-500 font-mono">TARGET: DIGITAL LOGIC GATE LEVEL</span>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-sm text-blue-300">
          <code>
            <span className="text-pink-500">module</span> <span className="text-green-300">synthesized_logic</span> ({"\n"}
            {"    "}<span className="text-pink-500">input wire</span> {vars.join(', ')},{"\n"}
            {"    "}<span className="text-pink-500">output wire</span> Y{"\n"}
            );{"\n\n"}
            {"    "}<span className="text-pink-500">assign</span> Y = {verilogExpr};{"\n\n"}
            <span className="text-pink-500">endmodule</span>;
          </code>
        </pre>
      </div>
    </div>
  );
};

function App() {
  const [status, setStatus] = useState('idle'); 
  const [result, setResult] = useState(null);
  const [steps, setSteps] = useState([]);
  const [mode, setMode] = useState('upload'); 
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const [manualInput, setManualInput] = useState(() => {
    return localStorage.getItem('stepcheck_input') || "";
  });
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('stepcheck_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('stepcheck_input', manualInput);
  }, [manualInput]);

  useEffect(() => {
    localStorage.setItem('stepcheck_history', JSON.stringify(history));
  }, [history]);

  const renderHighlightedLogic = (text) => {
    return text.split('').map((char, index) => {
      if (/[A-Z]/.test(char)) return <span key={index} className="text-green-600 font-bold">{char}</span>;
      if (char === '~') return <span key={index} className="text-red-500 font-black">{char}</span>;
      if (char === '+' || char === '*' || char === '^') return <span key={index} className="text-blue-600 font-black">{char}</span>;
      if (char === '(' || char === ')') return <span key={index} className="text-gray-400">{char}</span>;
      return <span key={index} className="text-gray-700">{char}</span>;
    });
  };

  const verifyMath = async (extractedSteps) => {
    setSteps(extractedSteps);
    setStatus('grading');
    setErrorMessage("");
    setCopied(false);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); 

    try {
      const safeSteps = extractedSteps.map(s => s.replace(/\^/g, '@').replace(/\s+/g, ''));

      const response = await fetch('https://stepcheck-backend.onrender.com/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps: safeSteps }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error("Backend server rejected the request.");
      
      const data = await response.json();
      setResult(data);
      setStatus('done');
      
      setHistory(prev => [
        { steps: extractedSteps, result: data, time: new Date().toLocaleTimeString() },
        ...prev
      ]);
      
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Backend failed:", error);
      if (error.name === 'AbortError') {
        setErrorMessage("Verification timed out. The C++ engine took too long to respond.");
      } else {
        setErrorMessage("Failed to connect to the Node.js verification server.");
      }
      setStatus('error');
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStatus('scanning');

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Data = reader.result.split(',')[1];
      
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-goog-api-key': 'AQ.Ab8RN6LcFSoCUCgBvHKlMyglwn0U7JSSVZijFHT7YunLz1MqCA' 
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: "Extract the Boolean algebra from this image. Return ONLY the mathematical equations, one per line. Do not include markdown, English words, or formatting. Preserve exact operators: ~, +, *, ^, (, )." },
                { inline_data: { mime_type: file.type, data: base64Data } }
              ]
            }]
          })
        });

        const data = await response.json();
        if (!response.ok) {
           throw new Error(data.error?.message || "Google API rejected the request.");
        }

        const extractedText = data.candidates[0].content.parts[0].text;
        const stepArray = extractedText.split('\n').map(s => s.trim()).filter(s => s !== '');

        if (stepArray.length < 2) {
          setErrorMessage(`AI Output: "${extractedText}". Not enough logic lines found.`);
          setStatus('error');
          return;
        }
        
        verifyMath(stepArray);

      } catch (error) {
        console.error("Gemini Vision API Failed:", error);
        setErrorMessage(error.message || "Vision extraction failed.");
        setStatus('error');
      }
    };
  };

  const handleManualSubmit = () => {
    const stepArray = manualInput.split('\n').map(s => s.trim()).filter(s => s !== '');
    if (stepArray.length < 2) {
      setErrorMessage("Enter at least 2 distinct steps to compare logic.");
      setStatus('error');
      return;
    }
    const isValid = stepArray.every(step => /^[A-Z~+*^()\s]+$/.test(step));
    if (!isValid) {
      setErrorMessage("Invalid characters detected. Only A-Z, ~, +, *, ^, (, ) are allowed.");
      setStatus('error');
      return;
    }
    verifyMath(stepArray);
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'Enter') handleManualSubmit();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(steps.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportLog = () => {
    if (history.length === 0) return;
    const logData = history.map((log) => 
      `[${log.time}]\nSteps Evaluated: ${log.steps.join(' -> ')}\nResult: ${log.result.valid ? 'VALID' : `CONTRADICTION at Step ${log.result.error_line}`}\n---`
    ).join('\n\n');
    const blob = new Blob([logData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'StepCheck_Audit_Log.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetApp = () => {
    setStatus('idle');
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-6 bg-gray-50 text-gray-900 font-sans">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-10 space-y-8 border border-gray-100">
        
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">StepCheck AI</h1>
          <p className="mt-3 text-gray-500 font-medium">Deterministic C++ verification for Boolean logic.</p>
        </div>

        {status === 'idle' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-center space-x-4 mb-6">
              <button onClick={() => setMode('upload')} className={`px-4 py-2 font-bold rounded-lg ${mode === 'upload' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Image Upload</button>
              <button onClick={() => setMode('manual')} className={`px-4 py-2 font-bold rounded-lg ${mode === 'manual' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Live Editor</button>
            </div>

            {mode === 'upload' ? (
              <SpotlightCard className="w-full rounded-2xl border-2 border-dashed border-gray-300 bg-white transition-all hover:border-gray-400 shadow-sm">
                <label className="flex flex-col items-center justify-center w-full h-56 cursor-pointer">
                  <div className="w-10 h-10 mb-3 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                    ↑
                  </div>
                  <span className="text-gray-600 font-semibold tracking-tight">
                    Drag & drop or click to upload photo
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    Supports PNG, JPG, or equation snapshots
                  </span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                </label>
              </SpotlightCard>
            ) : (
              <div className="space-y-4">
                <textarea 
                  value={manualInput} 
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full h-40 p-4 border border-gray-300 rounded-xl font-mono text-lg focus:ring-2 focus:ring-black focus:outline-none"
                  placeholder="Enter Boolean logic (e.g., A(B ^ C) or A ^ B)&#10;Press Ctrl + Enter to verify."
                />
                <button onClick={handleManualSubmit} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md">
                  Verify Logic Now
                </button>
              </div>
            )}
          </div>
        )}

        {(status === 'scanning' || status === 'grading') && (
          <div className="flex flex-col items-center space-y-6 py-12">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium text-lg animate-pulse">
              {status === 'scanning' ? "Extracting Math via Gemini 3.0 Flash..." : "C++ Engine evaluating truth tables..."}
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 rounded-xl font-bold text-center text-lg bg-red-100 text-red-800 border border-red-200 shadow-inner">
              ⚠️ {errorMessage}
            </div>
            <button onClick={resetApp} className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-md">
              Return to Editor
            </button>
          </div>
        )}

        {status === 'done' && (
          <div className="space-y-6 animate-fade-in">
            <div className={`p-4 rounded-xl font-bold text-center text-lg shadow-sm ${result?.valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {result?.valid ? "Success! All steps are mathematically valid." : `Contradiction Detected at Step ${result?.error_line}`}
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-inner relative">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Analyzed Logic</h3>
                <button onClick={copyToClipboard} className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                  {copied ? "COPIED!" : "COPY LOGIC"}
                </button>
              </div>
              <ul className="space-y-3 font-mono text-lg">
                {steps.map((step, index) => {
                  const isError = result?.valid === false && result?.error_line === index + 1;
                  return (
                    <li key={index} className={`flex items-center space-x-4 p-3 rounded-lg transition-colors ${isError ? 'bg-red-50 text-red-700 border border-red-200 shadow-sm' : 'bg-white border border-transparent shadow-sm'}`}>
                      <span className="text-gray-400 font-bold w-6">{index + 1}.</span>
                      <span className="tracking-widest">{renderHighlightedLogic(step)}</span>
                      {isError && <span className="ml-auto text-xs font-bold bg-red-600 text-white px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">Invalid Logic</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
            
            <TruthTableVisualizer steps={steps} />
            <HardwareSynthesizer steps={steps} isValid={result?.valid} />
            
            <button onClick={resetApp} className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-md mt-6">
              Run Another Test
            </button>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="max-w-2xl w-full mt-8 bg-white rounded-2xl shadow-md p-8 border border-gray-100 animate-fade-in">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-2">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Verification Session Log</h2>
            <button onClick={exportLog} className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
              EXPORT SESSION
            </button>
          </div>
          <div className="space-y-4">
            {history.map((log, index) => (
              <div key={index} className="flex items-start justify-between bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="font-mono text-sm space-y-1">
                  {log.steps.map((s, i) => <div key={i} className="tracking-widest">{renderHighlightedLogic(s)}</div>)}
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${log.result.valid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {log.result.valid ? 'Valid' : 'Failed'}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}