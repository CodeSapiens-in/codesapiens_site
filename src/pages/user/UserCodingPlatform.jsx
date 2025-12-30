import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { debounce } from 'lodash';
import twoSumData from '../../data/dsa_questions/two_sum.json';
import palindromeData from '../../data/dsa_questions/palindrome_number.json';
import reverseStringData from '../../data/dsa_questions/reverse_string.json';
import validParenthesesData from '../../data/dsa_questions/valid_parentheses.json';
import bestTimeStockData from '../../data/dsa_questions/best_time_to_buy_and_sell_stock.json';
import validAnagramData from '../../data/dsa_questions/valid_anagram.json';
import maxSubArrayData from '../../data/dsa_questions/maximum_subarray.json';
import containsDuplicateData from '../../data/dsa_questions/contains_duplicate.json';
import climbingStairsData from '../../data/dsa_questions/climbing_stairs.json';
import singleNumberData from '../../data/dsa_questions/single_number.json';
import majorityElementData from '../../data/dsa_questions/majority_element.json';
import searchInsertData from '../../data/dsa_questions/search_insert_position.json';
import binarySearchData from '../../data/dsa_questions/binary_search.json';
import missingNumberData from '../../data/dsa_questions/missing_number.json';
import plusOneData from '../../data/dsa_questions/plus_one.json';
import powerOfTwoData from '../../data/dsa_questions/power_of_two.json';
import fibonacciData from '../../data/dsa_questions/fibonacci_number.json';
import validPalindromeData from '../../data/dsa_questions/valid_palindrome.json';
import lengthLastWordData from '../../data/dsa_questions/length_of_last_word.json';
import longestCommonPrefixData from '../../data/dsa_questions/longest_common_prefix.json';
import romanToIntData from '../../data/dsa_questions/roman_to_integer.json';
import removeDuplicatesData from '../../data/dsa_questions/remove_duplicates_from_sorted_array.json';
import mergeSortedArrayData from '../../data/dsa_questions/merge_sorted_array.json';
import { Loader2, Play, CheckCircle, XCircle, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { supabase } from "../../lib/supabaseClient";
import { toast } from 'react-hot-toast';

const UserCodingPlatform = () => {
  // Basic Editor State
  const [language, setLanguage] = useState('python');
  const [theme, setTheme] = useState('vs-dark');
  const [editorWidth, setEditorWidth] = useState(50);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  // DSA Logic State
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [code, setCode] = useState({}); // Stores code for each language

  // Execution State
  // Execution State
  const [output, setOutput] = useState(null); // Changed to object for structured results
  const [isRunning, setIsRunning] = useState(false);
  const [runtimes, setRuntimes] = useState([]);

  // User State
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [solvedQuestions, setSolvedQuestions] = useState(new Set());

  // Cooldown State
  const [runTimer, setRunTimer] = useState(0);
  const [submitTimer, setSubmitTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (runTimer > 0) {
      interval = setInterval(() => setRunTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [runTimer]);

  useEffect(() => {
    let interval;
    if (submitTimer > 0) {
      interval = setInterval(() => setSubmitTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [submitTimer]);

  const handleRun = () => {
    if (runTimer > 0 || isRunning) return;
    executeCode(false);
  };

  const handleSubmit = () => {
    if (submitTimer > 0 || isRunning) return;
    executeCode(true);
  };

  useEffect(() => {
    // Load Questions
    // Load Questions
    const loadedQuestions = [
      twoSumData, palindromeData, reverseStringData,
      validParenthesesData, bestTimeStockData, validAnagramData, maxSubArrayData, containsDuplicateData,
      climbingStairsData, singleNumberData, majorityElementData, searchInsertData, binarySearchData,
      missingNumberData, plusOneData, powerOfTwoData, fibonacciData, validPalindromeData,
      lengthLastWordData, longestCommonPrefixData, romanToIntData, removeDuplicatesData, mergeSortedArrayData
    ];
    setQuestions(loadedQuestions);
    setSelectedQuestion(loadedQuestions[0]);
    setCode(loadedQuestions[0].starterCode);

    // Fetch Runtimes
    const fetchRuntimes = async () => {
      try {
        const res = await fetch('https://emkc.org/api/v2/piston/runtimes');
        const data = await res.json();
        setRuntimes(data);
      } catch (e) {
        console.error("Failed to fetch runtimes", e);
      }
    }
    fetchRuntimes();

    // Fetch User, Points, and Solved Problems
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);

        // Get Points
        const { data: userData } = await supabase
          .from('users')
          .select('points')
          .eq('uid', user.id)
          .single();
        if (userData) setPoints(userData.points || 0);

        // Get Solved Problems
        const { data: solvedData } = await supabase
          .from('user_solved_problems')
          .select('question_id')
          .eq('user_id', user.id);

        if (solvedData) {
          setSolvedQuestions(new Set(solvedData.map(item => item.question_id)));
        }
      }
    };
    fetchUserData();

    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // When question changes, reset code to starter
  const handleQuestionChange = (q) => {
    setSelectedQuestion(q);
    setCode(q.starterCode);
    setOutput(null);
  };

  const toggleTheme = () => {
    setTheme(theme === 'vs-dark' ? 'vs-light' : 'vs-dark');
  };

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e) => {
    if (isDragging.current && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      setEditorWidth(Math.max(20, Math.min(80, newWidth)));
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const executeCode = async (isSubmit = false) => {
    if (!selectedQuestion) return;
    setIsRunning(true);
    setOutput(null); // Reset output but keep panel open logic implicitly via isRunning

    // ... (rest of executeCode remains same until setOutput) ...
    // Note: I need to duplicate the executeCode function content because replace_file_content replaces the whole block if I select it.
    // However, since I'm targeting the whole component render logic mostly, I will stick to editing the render return mainly.
    // Wait, I can't edit `activeTab` usage in `executeCode` without including it. 
    // Actually, `executeCode` just calls `setActiveTab('result')`. If I remove the state, that specific line will throw error if I don't remove it too.
    // So I need to replace `executeCode` as well to remove `setActiveTab`.

    const testCases = isSubmit
      ? [...selectedQuestion.testCases.public.map(tc => ({ ...tc, isHidden: false })), ...selectedQuestion.testCases.hidden.map(tc => ({ ...tc, isHidden: true }))]
      : selectedQuestion.testCases.public.map(tc => ({ ...tc, isHidden: false }));

    const languageMap = { python: 'python', c: 'c', cpp: 'c++', java: 'java', rust: 'rust' };
    const pistonLang = languageMap[language];
    const runtime = runtimes.find(r => r.language === pistonLang);
    const version = runtime ? runtime.version : '*';

    const results = [];
    let allPassed = true;

    // Check if driver code exists for the selected language
    if (!selectedQuestion.driverCode || !selectedQuestion.driverCode[language]) {
      setOutput({ error: `Automated testing for ${language} is not yet implemented for this question.` });
      setIsRunning(false);
      return;
    }

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      // Construct full code: User Code + Driver Code
      let fullCode = `${code[language]}\n${selectedQuestion.driverCode[language]}`;

      if (language === 'python') {
        fullCode = `from typing import List\n${fullCode}`;
      }

      try {
        const response = await fetch('https://emkc.org/api/v2/piston/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: pistonLang,
            version: version,
            files: [{ content: fullCode }],
            stdin: testCase.input
          }),
        });
        const data = await response.json();

        if (data.run) {
          const userOutput = data.run.stdout ? data.run.stdout.trim() : '';
          const error = data.run.stderr;
          const passed = !error && userOutput === testCase.expectedOutput;

          if (!passed) allPassed = false;

          results.push({
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: userOutput,
            error: error,
            passed: passed,
            isHidden: testCase.isHidden,
            status: passed ? 'Accepted' : (error ? 'Runtime Error' : 'Wrong Answer')
          });

        } else {
          allPassed = false;
          results.push({ status: 'API Error', error: 'No response from compiler', isHidden: false }); // Default isHidden false for connection errors
        }

      } catch (err) {
        allPassed = false;
        results.push({ status: 'Network Error', error: err.message, isHidden: false });
      }
    }

    setOutput({
      type: isSubmit ? 'submission' : 'run',
      results: results,
      allPassed: allPassed
    });
    setIsRunning(false);

    // Start Cooldown AFTER results are shown
    if (isSubmit) {
      setSubmitTimer(4);
    } else {
      setRunTimer(3);
    }

    // Award Points Logic (Keep existing logic)
    if (isSubmit && allPassed && user) {
      if (solvedQuestions.has(selectedQuestion.id)) {
        toast("You've already solved this question!", {
          icon: '✅',
          style: { borderRadius: '10px', background: '#333', color: '#fff' }
        });
        return;
      }

      try {
        const { error: insertError } = await supabase
          .from('user_solved_problems')
          .insert([{ user_id: user.id, question_id: selectedQuestion.id }]);

        if (insertError) console.error("Error verifying solved status:", insertError);

        const newPoints = points + 20;
        const { error: updateError } = await supabase
          .from('users')
          .update({ points: newPoints })
          .eq('uid', user.id);

        if (!updateError) {
          setPoints(newPoints);
          setSolvedQuestions(prev => new Set(prev).add(selectedQuestion.id));
          toast.success("Correct Answer! +20 Points", {
            icon: '🏆',
            style: { borderRadius: '10px', background: '#333', color: '#fff' },
          });
        } else {
          console.error("Error updating points:", updateError);
        }
      } catch (e) {
        console.error("Error updating points:", e);
      }
    }
  };

  // ... (continue to render) ...

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'vs-dark' ? 'bg-[#1E1E1E] text-white' : 'bg-gray-50 text-gray-900'}`}>

      {/* Top Bar (Keep existing) */}
      <div className="h-14 border-b border-gray-700 flex items-center justify-between px-4 bg-[#1E1E1E]">
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-lg text-white">CodeSapiens <span className="text-[#0061FE]">IDE</span></h1>
          <div className="h-6 w-[1px] bg-gray-600"></div>
          <select
            className="bg-transparent text-sm font-medium text-gray-300 focus:outline-none cursor-pointer max-w-[200px]"
            onChange={(e) => handleQuestionChange(questions.find(q => q.id === parseInt(e.target.value)))}
            value={selectedQuestion?.id || ''}
          >
            {questions.map(q => (
              <option key={q.id} value={q.id} className="bg-[#1E1E1E]">
                {q.id}. {q.title} {solvedQuestions.has(q.id) ? '✅' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-yellow-400 font-bold bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">
            <Trophy className="w-4 h-4" />
            <span>{points} pts</span>
          </div>



          <div className="flex items-center gap-3">
            <button
              onClick={handleRun}
              disabled={isRunning || runTimer > 0}
              className={`bg-[#2C2C2C] hover:bg-[#3C3C3C] text-gray-300 px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${runTimer > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {runTimer > 0 ? `Wait ${runTimer}s` : 'Run'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isRunning || submitTimer > 0}
              className={`bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-all ${submitTimer > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {submitTimer > 0 ? `Wait ${submitTimer}s` : 'Submit'}
            </button>
            <div className="h-6 w-[1px] bg-gray-600"></div>
            <button onClick={toggleTheme} className="text-gray-400 hover:text-white">
              {theme === 'vs-dark' ? '☀' : '🌙'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden" ref={containerRef}>

        {/* Left Panel: Description ONLY */}
        <div className="h-full overflow-y-auto bg-[#1E1E1E] border-r border-[#2C2C2C]" style={{ width: `${editorWidth}%` }}>
          <div className="px-6 py-4 border-b border-[#2C2C2C]">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Problem Description</h2>
          </div>

          <div className="p-6">
            {selectedQuestion && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-2xl font-bold mb-4">{selectedQuestion.id}. {selectedQuestion.title}</h2>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-6 ${selectedQuestion.difficulty === 'Easy' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                  {selectedQuestion.difficulty}
                </span>

                <div className="prose prose-invert max-w-none text-gray-300">
                  <p className="whitespace-pre-line mb-8">{selectedQuestion.description}</p>

                  <h3 className="text-white font-bold mb-3">Examples:</h3>
                  <div className="space-y-4 mb-8">
                    {selectedQuestion.examples.map((ex, idx) => (
                      <div key={idx} className="bg-[#2C2C2C] p-4 rounded-lg border-l-4 border-gray-600">
                        <div className="text-sm font-mono mb-1"><span className="text-gray-400">Input:</span> {ex.input}</div>
                        <div className="text-sm font-mono"><span className="text-gray-400">Output:</span> {ex.output}</div>
                        {ex.explanation && <div className="text-sm text-gray-400 mt-2 italic">{ex.explanation}</div>}
                      </div>
                    ))}
                  </div>

                  <h3 className="text-white font-bold mb-3">Constraints:</h3>
                  <ul className="list-disc list-inside text-gray-400 space-y-1">
                    {selectedQuestion.constraints.map((c, idx) => (
                      <li key={idx} className="font-mono text-sm">{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resizer */}
        <div
          className="w-1 bg-[#2C2C2C] hover:bg-[#0061FE] cursor-col-resize transition-colors z-10"
          onMouseDown={handleMouseDown}
        />

        {/* Right Panel: Code Editor (Top) & Results (Bottom) */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#1E1E1E]">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-gray-700 shrink-0">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-[#3C3C3C] text-white text-xs px-3 py-1.5 rounded border border-gray-600 focus:outline-none"
            >
              <option value="python">Python</option>
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="rust">Rust</option>
            </select>
            <span className="text-xs text-gray-500">Auto-saved</span>
          </div>

          {/* Editor Area */}
          <div className="flex-1 relative min-h-0">
            <Editor
              height="100%"
              language={language}
              value={code[language] || ''}
              onChange={(value) => setCode({ ...code, [language]: value })}
              theme={theme}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                padding: { top: 16 },
                fontFamily: 'JetBrains Mono, monospace'
              }}
            />
          </div>

          {/* Results Area (Bottom of Right Panel) */}
          {(output || isRunning) && (
            <div className="h-[40%] border-t border-gray-700 bg-[#1E1E1E] overflow-y-auto flex flex-col">
              <div className="px-4 py-2 bg-[#252526] border-b border-gray-700 font-bold text-sm text-gray-300 flex justify-between items-center sticky top-0 z-10">
                <span>Test Results</span>
                <button onClick={() => setOutput(null)} className="text-gray-500 hover:text-white"><XCircle className="w-4 h-4" /></button>
              </div>

              <div className="p-4 flex-1">
                {isRunning ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-[#0061FE]" />
                    <p>Running tests...</p>
                  </div>
                ) : output ? (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {output.error ? (
                      <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg text-red-200 font-mono text-sm whitespace-pre-wrap">
                        {output.error}
                      </div>
                    ) : (
                      <>
                        <div className={`flex items-center gap-3 mb-4 text-lg font-bold ${output.allPassed ? 'text-green-500' : 'text-red-500'}`}>
                          {output.allPassed ? <span className="flex items-center gap-2"><CheckCircle className="w-5 h-5" /> All Test Cases Passed</span> : <span className="flex items-center gap-2"><XCircle className="w-5 h-5" /> {output.results.find(r => !r.passed)?.status || 'Failed'}</span>}
                        </div>

                        <div className="space-y-3">
                          {output.results.map((res, idx) => (
                            <div key={idx} className={`p-3 rounded-lg border ${res.passed ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                              <div className="flex justify-between items-center mb-0">
                                <span className="font-mono text-xs text-gray-500">Case {idx + 1}</span>
                                <span className={`text-xs font-bold uppercase ${res.passed ? 'text-green-500' : 'text-red-500'}`}>{res.status}</span>
                              </div>

                              {!res.isHidden && (
                                res.error ? (
                                  <pre className="text-red-300 text-xs font-mono whitespace-pre-wrap mt-2">{res.error}</pre>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs mt-2">
                                    <div>
                                      <span className="text-gray-500 block mb-1">Input</span>
                                      <div className="bg-black/30 p-1.5 rounded font-mono text-gray-300 truncate" title={res.input}>{res.input}</div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 block mb-1">Output</span>
                                      <div className="bg-black/30 p-1.5 rounded font-mono text-gray-300 truncate" title={res.actual}>{res.actual}</div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default UserCodingPlatform;