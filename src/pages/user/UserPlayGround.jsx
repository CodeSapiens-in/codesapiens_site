import React, { useEffect, useRef, useState } from "react";
import * as monaco from "monaco-editor";

const UserPlayGround = () => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [code, setCode] = useState(`#include <stdio.h>\nint main() {\n    printf("Hello from C!\\n");\n    return 0;\n}`);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editorRef.current) {
      // Initialize Monaco Editor
      monacoRef.current = monaco.editor.create(editorRef.current, {
        value: code,
        language: "c",
        theme: "vs-dark",
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 16,
        scrollBeyondLastLine: false,
      });

      // Update code state on edit
      monacoRef.current.onDidChangeModelContent(() => {
        setCode(monacoRef.current.getValue());
      });
    }

    // Cleanup editor on unmount
    return () => {
      if (monacoRef.current) {
        monacoRef.current.dispose();
      }
    };
  }, []);

  // Function to run code
  const runCode = async () => {
    setLoading(true);
    setOutput("Running...");
    try {
      const response = await fetch("http://140.245.241.182:1313/v1/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sandbox: "gcc",
          command: "run",
          files: { "main.c": code },
        }),
      });

      const result = await response.json();
      if (result.ok) {
        setOutput(result.stdout || "(no output)");
      } else {
        setOutput(`Error: ${result.stderr || "Unknown error"}`);
      }
    } catch (error) {
      setOutput(`❌ Failed to connect: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">C Code Playground</h1>

      <div className="flex-1 border rounded-lg overflow-hidden shadow-md mb-4">
        <div ref={editorRef} className="w-full h-full" />
      </div>

      <button
        onClick={runCode}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-fit self-start disabled:opacity-50"
      >
        {loading ? "Running..." : "Run Code"}
      </button>

      <div className="mt-4 bg-black text-green-400 p-3 rounded-md font-mono whitespace-pre-wrap">
        {output}
      </div>
    </div>
  );
};

export default UserPlayGround;
