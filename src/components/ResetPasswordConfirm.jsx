import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ResetPasswordConfirm() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage("✅ Password updated successfully! Redirecting...");
      setTimeout(() => {
        navigate("/?type=signIn");
      }, 2000);
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleReset}
        className="bg-white p-6 rounded-xl shadow-lg border w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold">Set a New Password</h2>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
        {message && (
          <div
            className={`p-2 rounded-lg text-sm ${
              message.startsWith("✅")
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
