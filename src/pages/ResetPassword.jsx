import React, { useState } from "react";
import { Mail } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({ email: "" });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const redirectTo =
        process.env.NODE_ENV === "production"
          ? "https://codesapiens-management-website.vercel.app/reset-password"
          : `${window.location.origin}/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(
        formData.email,
        { redirectTo }
      );
      if (error) throw error;

      setMessage("✅ Password reset link has been sent to your email!");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
        <p className="text-gray-600 mb-6">
          Enter your email to receive a password reset link
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="admin@example.com"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Back to{" "}
              <button
                type="button"
                onClick={() => navigate("/")}
                disabled={loading}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign In
              </button>
            </p>
          </div>
          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
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
    </div>
  );
}
