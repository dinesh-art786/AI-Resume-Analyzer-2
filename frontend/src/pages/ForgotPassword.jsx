
import React, { useState } from "react";
import { API_URL } from "../config";

function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email.trim() }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Something went wrong.");
      }

      setMessage(
        data.message ||
        "If your account exists, a reset link has been sent."
      );

    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot connect to the server. Please try again."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-layout">

        <div className="auth-brand-panel">
          <div className="auth-brand">
            <span className="brand-symbol">R</span>
            <span>ResumeAI</span>
          </div>

          <div className="auth-brand-content">
            <span className="auth-eyebrow">
              ACCOUNT RECOVERY
            </span>

            <h1>
              Your Career.
              <br />
              Your Next Chapter.
            </h1>

            <p>
              Forgot your password? No worries.
              Enter your registered email address
              and we'll help you securely recover
              your account.
            </p>
          </div>

          <div className="auth-brand-footer">
            AI Resume Analyzer · Secure Account Recovery
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-container">

            <div className="auth-form-heading">
              <span className="section-tag">
                PASSWORD RECOVERY
              </span>

              <h2>Forgot Password?</h2>

              <p>
                Enter your registered email address
                to receive a password reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="auth-field">
                <label htmlFor="forgot-email">
                  Email Address
                </label>

                <input
                  id="forgot-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              {message && (
                <div className="auth-success-message" role="status">
                  {message}
                </div>
              )}

              {error && (
                <div className="auth-error-message" role="alert">
                  {error}
                </div>
              )}

            </form>

            <button
              type="button"
              className="auth-back-button"
              onClick={onBack}
            >
              <span>←</span> Back to Login
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;
