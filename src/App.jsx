import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  RotateCcw, 
  Shield, 
  Heart, 
  Info,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Award
} from 'lucide-react';

const GRID_ROWS = 12;
const GRID_COLS = 23;

// Target words coordinates - PERFECT 45-DEGREE DIAGONALS (Disjoint coordinates, no overlap)
const WORD1_COORDS = [
  [0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10], [11, 11]
]; // BHUJANGASANA (12 cells)

const WORD2_COORDS = [
  [1, 21], [2, 20], [3, 19], [4, 18], [5, 17], [6, 16], [7, 15], [8, 14], [9, 13], [10, 12]
]; // MATSYASANA (10 cells)

const WORD1_KEYS = WORD1_COORDS.map(([r, c]) => `${r},${c}`);
const WORD2_KEYS = WORD2_COORDS.map(([r, c]) => `${r},${c}`);
const ALL_V_KEYS = Array.from(new Set([...WORD1_KEYS, ...WORD2_KEYS]));

const WORD1_LETTERS = "BHUJANGASANA".split("");
const WORD2_LETTERS = "MATSYASANA".split("");

// Static background letters generator to maintain layout constancy across renders
const createSymmetricGrid = () => {
  const letters = [];
  const filler = [
    "QWERTZUIOPASDFGHJKLYXCVBNM",
    "LKJHGFDSAMNBVCRXTZUIOPYWEQ",
    "POIUYTREWQLKJHGFDSAMNBVCXZ",
    "MNBVCXZLKJHGFDSAPOIUYTREWQ",
    "ASDFGHJKLPOIUYTREWQMNBVCXZ",
    "ZXCVBNMLKJHGFDSAPOIUYTREWQ",
    "POIUYTREWQZXCVBNMLKJHGFDSA",
    "QWERTYUIOPASDFGHJKLZXCVBNM",
    "LKJHGFDSAZXCVBNMQWERTYUIOP",
    "MNBVCXZQWERTYUIOPLKJHGFDSA",
    "ZXCVBNMASDFGHJKLPOIUYTREWQ",
    "POIUYTREWQASDFGHJKLZXCVBNM"
  ];
  
  for (let r = 0; r < GRID_ROWS; r++) {
    const row = [];
    for (let c = 0; c < GRID_COLS; c++) {
      row.push(filler[r].charAt(c % filler[r].length));
    }
    letters.push(row);
  }

  // Overlay word 1
  WORD1_COORDS.forEach(([r, c], idx) => {
    letters[r][c] = WORD1_LETTERS[idx];
  });

  // Overlay word 2
  WORD2_COORDS.forEach(([r, c], idx) => {
    letters[r][c] = WORD2_LETTERS[idx];
  });

  return letters;
};

const GRID_LETTERS = createSymmetricGrid();

function App() {
  const [screen, setScreen] = useState(1);
  const [selectedCells, setSelectedCells] = useState([]);
  const [foundWords, setFoundWords] = useState({ bhujangasana: false, matsyasana: false });
  const [foundCells, setFoundCells] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isFadingOut, setIsFadingOut] = useState(false);
  
  const gridRef = useRef(null);

  // Transition to Screen 3 when both are found
  useEffect(() => {
    if (foundWords.bhujangasana && foundWords.matsyasana) {
      // 1.2 seconds delay for a premium locking presentation before fading out
      const lockTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 1200);

      const screenTimer = setTimeout(() => {
        setScreen(3);
        setIsFadingOut(false);
      }, 2200); // 1.2s delay + 1s fade duration

      return () => {
        clearTimeout(lockTimer);
        clearTimeout(screenTimer);
      };
    }
  }, [foundWords]);

  const triggerSuccessFeedback = (msg) => {
    setSuccessMessage(msg);
    const timer = setTimeout(() => setSuccessMessage(""), 2000);
    return () => clearTimeout(timer);
  };

  // Check if current selection matches a target word
  const checkSelection = (cells) => {
    if (cells.length === 0) return;
    
    const selectedKeys = cells.map(c => `${c.r},${c.c}`);
    
    // Check BHUJANGASANA
    const matchesWord1 = WORD1_KEYS.length === selectedKeys.length && 
      WORD1_KEYS.every(k => selectedKeys.includes(k));
      
    // Check MATSYASANAA
    const matchesWord2 = WORD2_KEYS.length === selectedKeys.length && 
      WORD2_KEYS.every(k => selectedKeys.includes(k));
      
    if (matchesWord1) {
      if (!foundWords.bhujangasana) {
        setFoundWords(prev => ({ ...prev, bhujangasana: true }));
        setFoundCells(prev => Array.from(new Set([...prev, ...WORD1_KEYS])));
        triggerSuccessFeedback("Bhujangasana (Cobra Pose) Found!");
      }
    } else if (matchesWord2) {
      if (!foundWords.matsyasana) {
        setFoundWords(prev => ({ ...prev, matsyasana: true }));
        setFoundCells(prev => Array.from(new Set([...prev, ...WORD2_KEYS])));
        triggerSuccessFeedback("Matsyasana (Fish Pose) Found!");
      }
    }
    
    setSelectedCells([]);
  };

  // Mouse selection logic (Desktop)
  const handleMouseDown = (r, c) => {
    if (foundWords.bhujangasana && foundWords.matsyasana) return;
    setIsDragging(true);
    setSelectedCells([{ r, c }]);
  };

  const handleMouseEnter = (r, c) => {
    if (!isDragging || (foundWords.bhujangasana && foundWords.matsyasana)) return;
    setSelectedCells(prev => {
      if (prev.some(cell => cell.r === r && cell.c === c)) return prev;
      return [...prev, { r, c }];
    });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    checkSelection(selectedCells);
  };

  // Touch selection logic (iPad)
  const handleTouchStart = (e, r, c) => {
    if (foundWords.bhujangasana && foundWords.matsyasana) return;
    setIsDragging(true);
    setSelectedCells([{ r, c }]);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || (foundWords.bhujangasana && foundWords.matsyasana)) return;
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return;

    const rAttr = element.getAttribute('data-row');
    const cAttr = element.getAttribute('data-col');

    if (rAttr !== null && cAttr !== null) {
      const r = parseInt(rAttr, 10);
      const c = parseInt(cAttr, 10);

      setSelectedCells(prev => {
        const last = prev[prev.length - 1];
        if (last && last.r === r && last.c === c) return prev;
        if (prev.some(cell => cell.r === r && cell.c === c)) return prev;
        return [...prev, { r, c }];
      });
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    checkSelection(selectedCells);
  };

  // Global mouse up / touch end handler to catch releases outside the grid
  useEffect(() => {
    const handleGlobalRelease = () => {
      if (isDragging) {
        setIsDragging(false);
        checkSelection(selectedCells);
      }
    };
    window.addEventListener('mouseup', handleGlobalRelease);
    window.addEventListener('touchend', handleGlobalRelease);
    return () => {
      window.removeEventListener('mouseup', handleGlobalRelease);
      window.removeEventListener('touchend', handleGlobalRelease);
    };
  }, [isDragging, selectedCells]);

  const resetExperience = () => {
    setScreen(1);
    setSelectedCells([]);
    setFoundWords({ bhujangasana: false, matsyasana: false });
    setFoundCells([]);
    setIsDragging(false);
    setSuccessMessage("");
    setIsFadingOut(false);
  };

  const isBothFound = foundWords.bhujangasana && foundWords.matsyasana;

  return (
    <div className="relative w-screen h-screen bg-[#080d1a] text-white flex flex-col items-center justify-between p-6 select-none overflow-hidden">
      
      {/* Decorative Brand Ambient Background */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none animate-float-slow"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none animate-float-slower"></div>

      {/* HEADER SECTION (Global Logo/Brand bar) */}
      <header className="w-full max-w-6xl flex justify-between items-center border-b border-slate-800/40 pb-4 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <span className="text-white font-extrabold text-xl tracking-tighter">V</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-white">Vylda</h1>
            <p className="text-[10px] text-teal-400/70 tracking-widest uppercase font-semibold">Glycemic Harmony</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-slate-900/40 border border-slate-800/50 px-4 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-semibold text-slate-300 tracking-wider">World Yoga Day Special Edition</span>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="w-full flex-grow flex items-center justify-center z-10 max-w-6xl">
        
        {/* SCREEN 1: WELCOME & CHALLENGE */}
        {screen === 1 && (
          <div className="w-full max-w-4xl flex flex-col items-center justify-center text-center space-y-8 animate-fade-in px-4">
            
            {/* Serene Circle Art */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-teal-500/20 animate-spin" style={{ animationDuration: '30s' }}></div>
              <div className="absolute inset-2 rounded-full border border-emerald-500/30 animate-spin" style={{ animationDuration: '20s', animationDirection: 'reverse' }}></div>
              <div className="absolute inset-6 rounded-full bg-gradient-to-br from-teal-900/50 to-slate-900/70 border border-teal-500/40 backdrop-blur-md flex items-center justify-center shadow-2xl">
                <Activity className="w-16 h-16 text-teal-300 animate-pulse" />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-semibold tracking-widest uppercase text-teal-400">Welcome to a Journey of Balance</h2>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-100 to-slate-300 leading-tight">
                Vylda welcomes you to World Yoga Day
              </h1>
              <p className="text-xl text-teal-100 font-medium max-w-2xl mx-auto leading-relaxed">
                Achieving Internal Harmony & Metabolic Balance
              </p>
            </div>

            <div className="max-w-xl bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
              <p className="text-slate-300 leading-relaxed text-base font-medium">
                "Doctor, can you spot the two key therapeutic Asanas that help your Type 2 Diabetes patients fight Glycemic Variability?"
              </p>
            </div>

            <button
              onClick={() => setScreen(2)}
              className="px-10 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl text-white font-bold text-lg tracking-wide hover:shadow-2xl transition-all duration-300 transform active:scale-95 animate-teal-pulse flex items-center space-x-2"
            >
              <span>Start Activity</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* SCREEN 2: THE GRAND SYMMETRICAL "V" WORD SEARCH */}
        {screen === 2 && (
          <div className={`w-full flex flex-col md:flex-row items-center justify-between gap-8 px-4 transition-opacity duration-1000 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
            
            {/* Checklist Container */}
            <div className="w-full md:w-5/12 flex flex-col space-y-6">
              <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Activity className="w-20 h-20 text-teal-500" />
                </div>
                
                <h3 className="text-lg font-bold tracking-wide text-teal-400 mb-2">Therapeutic Asanas checklist</h3>
                <p className="text-xs text-slate-400 mb-5 leading-normal">
                  Find the two key Asanas in the word search. They will lock together to represent Glycemic Harmony.
                </p>

                <div className="space-y-4">
                  {/* Item 1 */}
                  <div className={`flex items-start space-x-4 p-4 rounded-xl transition-all duration-300 border ${
                    foundWords.bhujangasana 
                      ? 'bg-emerald-500/10 border-emerald-500/40' 
                      : 'bg-slate-800/20 border-slate-700/30'
                  }`}>
                    <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center border ${
                      foundWords.bhujangasana 
                        ? 'bg-emerald-500 border-emerald-400 text-white' 
                        : 'border-slate-500 text-transparent'
                    }`}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className={`text-base font-bold tracking-wide ${foundWords.bhujangasana ? 'line-through text-emerald-400' : 'text-white'}`}>
                        1. BHUJANGASANA
                      </h4>
                      <p className="text-xs text-slate-300 mt-1">Cobra Pose - Massages the pancreas to stimulate insulin release & improve glucose uptake</p>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className={`flex items-start space-x-4 p-4 rounded-xl transition-all duration-300 border ${
                    foundWords.matsyasana 
                      ? 'bg-emerald-500/10 border-emerald-500/40' 
                      : 'bg-slate-800/20 border-slate-700/30'
                  }`}>
                    <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center border ${
                      foundWords.matsyasana 
                        ? 'bg-emerald-500 border-emerald-400 text-white' 
                        : 'border-slate-500 text-transparent'
                    }`}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className={`text-base font-bold tracking-wide ${foundWords.matsyasana ? 'line-through text-emerald-400' : 'text-white'}`}>
                        2. MATSYASANA
                      </h4>
                      <p className="text-xs text-slate-300 mt-1">Fish Pose - Regulates adrenal glands & lowers cortisol to control stress-induced spikes</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback Board / Quick Tip */}
              <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex items-center space-x-4">
                <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-400">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-teal-300 uppercase tracking-widest">How to play</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-normal">
                    Drag your finger or tap letters sequentially to highlight. Found words turn green.
                  </p>
                </div>
              </div>
              
              {/* Active Match Banner */}
              {successMessage && (
                <div className="py-3 px-5 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-300 font-bold text-center text-sm tracking-wide shadow-lg animate-bounce">
                  {successMessage}
                </div>
              )}
            </div>

            {/* Grid Container */}
            <div className="w-full md:w-7/12 flex items-center justify-center">
              <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-4 shadow-2xl backdrop-blur-lg">
                
                {/* 12x23 Letter Grid */}
                <div 
                  ref={gridRef}
                  className="grid grid-cols-23 gap-1 p-2 bg-[#050912] rounded-2xl shadow-inner border border-slate-800/30 select-none touch-none"
                  style={{ width: '610px', height: '320px' }}
                  onTouchMove={handleTouchMove}
                >
                  {GRID_LETTERS.map((row, rIdx) => 
                    row.map((letter, cIdx) => {
                      const key = `${rIdx},${cIdx}`;
                      
                      // Determine visual state
                      const isFound = foundCells.includes(key);
                      const isCurrentSelection = selectedCells.some(cell => cell.r === rIdx && cell.c === cIdx);
                      
                      // Highlight matching target "V" once complete
                      const isVPart = ALL_V_KEYS.includes(key);
                      
                      let cellClass = "w-[22px] h-[22px] text-xs font-bold flex items-center justify-center rounded-md cursor-pointer select-none transition-all duration-150 grid-cell ";
                      
                      if (isBothFound && isVPart) {
                        cellClass += "bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-extrabold shadow-[0_0_12px_rgba(16,185,129,0.7)] border border-emerald-400 scale-[1.05] cell-locked-v";
                      } else if (isFound) {
                        cellClass += "bg-emerald-500 text-white font-extrabold border border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]";
                      } else if (isCurrentSelection) {
                        cellClass += "bg-teal-500 text-white font-extrabold border border-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.6)] scale-[1.05]";
                      } else if (isVPart) {
                        cellClass += "text-teal-200 border border-teal-500/60 bg-teal-950/15 shadow-[0_0_6px_rgba(20,184,166,0.2)] hover:bg-teal-900/30";
                      } else {
                        cellClass += "text-slate-400 border border-slate-800/40 bg-slate-900/40 hover:bg-slate-800/50 hover:text-white";
                      }

                      return (
                        <div
                          key={key}
                          data-row={rIdx}
                          data-col={cIdx}
                          className={cellClass}
                          onMouseDown={() => handleMouseDown(rIdx, cIdx)}
                          onMouseEnter={() => handleMouseEnter(rIdx, cIdx)}
                          onMouseUp={handleMouseUp}
                          onTouchStart={(e) => handleTouchStart(e, rIdx, cIdx)}
                          onTouchEnd={handleTouchEnd}
                        >
                          {letter}
                        </div>
                      );
                    })
                  )}
                </div>
                
              </div>
            </div>
            
          </div>
        )}

        {/* SCREEN 3: THE CLINICAL CLINCH */}
        {screen === 3 && (
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center px-4 animate-fade-in">
            
            {/* Left side detail panel (7 cols) */}
            <div className="md:col-span-7 flex flex-col space-y-6">
              
              <div className="space-y-3">
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold tracking-widest uppercase">
                  Clinical Integration
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  VOV: Victory Over Glycemic Variability with Vylda
                </h1>
              </div>

              <div className="bg-gradient-to-br from-slate-900/60 to-slate-900/30 border border-slate-800/75 rounded-2xl p-6 shadow-xl backdrop-blur-md">
                <p className="text-slate-200 text-[15px] font-medium leading-relaxed">
                  "Just as targeted Asanas like <strong className="text-teal-300">Bhujangasana</strong> and <strong className="text-teal-300">Matsyasana</strong> bring physical stability and internal rhythm to the body, <strong className="text-emerald-400">Vylda</strong> brings biochemical harmony to your patient's daily profile—flattening post-prandial spikes and minimizing daily fluctuations for complete long-term protection."
                </p>
              </div>

              {/* Three Clinical Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/30 border border-slate-800/50 p-4 rounded-xl flex items-start space-x-3 shadow-md">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 mt-0.5">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Flatten Spikes</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Reduces post-prandial excursions significantly.</p>
                  </div>
                </div>

                <div className="bg-slate-900/30 border border-slate-800/50 p-4 rounded-xl flex items-start space-x-3 shadow-md">
                  <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400 mt-0.5">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Stability Lock</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Minimizes daily glycemic variations.</p>
                  </div>
                </div>

                <div className="bg-slate-900/30 border border-slate-800/50 p-4 rounded-xl flex items-start space-x-3 shadow-md">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Target Range</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Maintains patients within healthy parameters.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right side graphical panel (5 cols) */}
            <div className="md:col-span-5 flex flex-col space-y-4">
              
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col items-center">
                
                {/* Panel Title */}
                <div className="w-full flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-extrabold tracking-wide text-slate-100">Patient Glycemic Profile</h3>
                    <p className="text-[10px] text-slate-400">Simulated 24hr Glucose Monitoring</p>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                    Stable Profile
                  </span>
                </div>

                {/* SVG Graph container */}
                <div className="w-full h-48 bg-[#040810] border border-slate-800/60 rounded-2xl relative p-4 flex items-center justify-center">
                  
                  {/* Target Range Band (Shaded zone) */}
                  <div className="absolute top-[35%] bottom-[35%] left-0 right-0 bg-teal-500/5 border-y border-teal-500/10 flex items-center justify-end px-3">
                    <span className="text-[8px] font-bold text-teal-500/50 uppercase tracking-widest">Ideal Target Zone</span>
                  </div>

                  <svg className="w-full h-full" viewBox="0 0 300 150">
                    {/* Grid lines */}
                    <line x1="0" y1="35" x2="300" y2="35" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
                    <line x1="0" y1="75" x2="300" y2="75" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
                    <line x1="0" y1="115" x2="300" y2="115" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
                    
                    {/* High Variability Curve (Unstable spike profile) */}
                    <path
                      d="M 10,75 Q 40,15 80,120 T 150,75 T 220,135 T 290,25"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      className="opacity-40"
                    />
                    
                    {/* Stable Glycemic Curve with Vylda (VOV) */}
                    <path
                      d="M 10,75 Q 45,70 80,78 T 150,72 T 220,77 T 290,75"
                      fill="none"
                      stroke="url(#emerald-grad)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      className="animate-draw"
                      style={{ filter: 'drop-shadow(0px 0px 8px rgba(16,185,129,0.8))' }}
                    />
                    
                    {/* SVG Gradient definitions */}
                    <defs>
                      <linearGradient id="emerald-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#14b8a6" />
                        <stop offset="50%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* High Spike Indicator Tag */}
                  <div className="absolute top-[8%] left-[20%] flex items-center space-x-1 opacity-60">
                    <TrendingUp className="w-3 h-3 text-red-500" />
                    <span className="text-[8px] text-red-400 font-bold">PP Spike without Vylda</span>
                  </div>

                  {/* Stable Indicator Tag */}
                  <div className="absolute bottom-[28%] right-[22%] flex items-center space-x-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-wide">Vylda Protection</span>
                  </div>
                </div>

                {/* Legend and stats */}
                <div className="w-full grid grid-cols-2 gap-4 mt-5 border-t border-slate-800/40 pt-4 text-center">
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-semibold">Glycemic Variation</p>
                    <p className="text-lg font-extrabold text-red-400 mt-0.5">-68%</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-semibold">Time in Range</p>
                    <p className="text-lg font-extrabold text-emerald-400 mt-0.5">&gt;85%</p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* FOOTER SECTION (Reset button & Copy info) */}
      <footer className="w-full max-w-6xl border-t border-slate-800/40 pt-4 flex justify-between items-center text-xs text-slate-500 z-10">
        <p>© 2026 Vylda. All rights reserved. Confidential for Medical Professionals only.</p>
        
        {screen === 3 && (
          <button
            onClick={resetExperience}
            className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-slate-300 font-semibold hover:bg-slate-800 hover:text-white transition-all transform active:scale-95 shadow-md"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Experience</span>
          </button>
        )}
      </footer>
      
    </div>
  );
}

export default App;
