/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "../../../services/supabase/supabaseClient";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({
    message: "",
    type: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({
      message: "",
      type: null,
    });

    try {
      if (!email) {
        throw new Error("Please enter your email address!");
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/live/reset-password`,
      });

      if (error) throw error;

      setMessage({
        message: "Password reset instructions have been sent to your email!",
        type: "success",
      });

      setEmail("");
    } catch (error) {
      setMessage({
        message: error.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Forgot Password?
            </h1>
            <p className="text-gray-600">
              Enter your email to reset your password
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            {/* Message Display */}
            <AnimatePresence>
              {message.message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-lg ${
                    message.type === "error"
                      ? "bg-red-50 text-red-600"
                      : "bg-green-50 text-green-600"
                  }`}
                >
                  {message.message}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Sending instructions...</span>
                </div>
              ) : (
                "Send Reset Instructions"
              )}
            </button>

            {/* Back to Login */}
            <div className="text-center text-sm text-gray-600">
              Remember your password?{" "}
              <Link
                to="/admin/live/login"
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
