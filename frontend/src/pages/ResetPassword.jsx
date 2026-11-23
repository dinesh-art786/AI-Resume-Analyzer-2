
import React, { useState } from "react";
import { JAVA_API_URL } from "../config";

function ResetPassword({ onBack }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = new URLSearchParams(
    window.location.search
  ).get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${JAVA_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            new_password: password,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.detail ||
          "Password reset failed."
        );
      }

      setMessage(
        "Password changed successfully! You can now log in with your new password."
      );

      setPassword("");
      setConfirmPassword("");

    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot connect to the Java server. Please try again."
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
            ResumeAI
          </div>

          <div className="auth-brand-content">
            <span className="auth-eyebrow">
              SECURE ACCOUNT
            </span>

            <h1>
              Create Your
              <br />
              New Password.
            </h1>

            <p>
              Choose a strong new password to protect
              your account and continue your career journey.
            </p>
          </div>

          <div className="auth-brand-footer">
            AI Resume Analyzer · Secure Password Recovery
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-container">

            <div className="auth-form-heading">
              <span className="section-tag">
                PASSWORD RESET
              </span>

              <h2>Reset Password</h2>

              <p>
                Enter your new password below.
              </p>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="auth-field">
                <label htmlFor="new-password">
                  New Password
                </label>

                <input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  maxLength={128}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="confirm-password">
                  Confirm Password
                </label>

                <input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  minLength={8}
                  maxLength={128}
                  required
                />
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading
                  ? "Updating Password..."
                  : "Reset Password"}
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
              ← Back to Login
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

export default ResetPassword;
