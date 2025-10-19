import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { debounce } from 'lodash';

const UserCodingPlatform = () => {
  const [code, setCode] = useState({
    typescript: '// Write your TypeScript code here\nconsole.log("Hello, World!");',
    python: '# Write your Python code here\ndef hello():\n    print("Hello, World!")\n\nhello()',
    go: '// Write your Go code here\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
    c: '// Write your C code here\n#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
    cpp: '// Write your C++ code here\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
    java: '// Write your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
    rust: '// Write your Rust code here\nfn main() {\n    println!("Hello, World!");\n}',
  });
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [theme, setTheme] = useState('vs-dark');
  const [editorWidth, setEditorWidth] = useState(50);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const toggleTheme = () => {
    setTheme(theme === 'vs-dark' ? 'vs-light' : 'vs-dark');
  };

  const runCode = async () => {
    setOutput('Running...');
    const sandboxMap = {
      typescript: 'typescript',
      python: 'python',
      go: 'go',
      c: 'gcc',
      cpp: 'cpp',
      java: 'java', // Fixed from 'java' to 'java11'
      rust: 'rust',
    };
    const sandbox = sandboxMap[language];

    try {
      const response = await fetch('https://codapi.jayasurya.digital:443/v1/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sandbox: sandbox,
          command: 'run',
          files: {
            '': code[language],
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.stdout) {
        setOutput(`${data.stdout}Execution time: ${data.duration}ms`);
      } else if (data.stderr) {
        setOutput(`Error: ${data.stderr}\nExecution time: ${data.duration}ms`);
      } else {
        setOutput(`No output or error received.\nExecution time: ${data.duration}ms`);
      }
    } catch (error) {
      setOutput(`${language.charAt(0).toUpperCase() + language.slice(1)} Error: ${error.message}`);
    }
  };

  const debouncedRunCode = debounce(runCode, 500);

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

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'vs-dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <h1 className="text-3xl font-bold text-center py-4">Codesapiens Project NEO</h1>
      <div className="flex justify-center gap-4 py-2">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className={`px-4 py-2 rounded-lg ${theme === 'vs-dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800 border border-gray-800'}`}
        >
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="go">Go</option>
          <option value="c">C</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
          <option value="rust">Rust</option>
        </select>
        <button
          onClick={debouncedRunCode}
          className={`px-4 py-2 rounded-lg ${theme === 'vs-dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white border border-gray-800'}`}
        >
          Run Code
        </button>
        <button
          onClick={toggleTheme}
          className={`px-4 py-2 rounded-lg ${theme === 'vs-dark' ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800 border border-gray-800'}`}
        >
          {theme === 'vs-dark' ? 'Light Theme' : 'Dark Theme'}
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-4 p-4 h-[calc(100vh-120px)]" ref={containerRef}>
        <div
          className={`rounded-lg shadow ${theme === 'vs-dark' ? '' : 'border border-gray-800'}`}
          style={{ width: `${editorWidth}%` }}
        >
          <Editor
            height="100%"
            language={language}
            value={code[language]}
            onChange={(value) => setCode({ ...code, [language]: value })}
            theme={theme}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
            }}
          />
        </div>
        <div
          className={`w-2 cursor-col-resize ${theme === 'vs-dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'}`}
          onMouseDown={handleMouseDown}
        />
        <div className="flex-1 flex flex-col">
          <pre
            className={`flex-1 p-4 rounded-lg overflow-auto ${theme === 'vs-dark' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800 border border-gray-800'}`}
          >
            {output || 'Output will appear here...'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default UserCodingPlatform;