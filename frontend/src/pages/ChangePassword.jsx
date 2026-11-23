
import React, { useState } from "react";
import "./ChangePassword.css";
import { JAVA_API_URL } from "../config";

function PasswordField({
  label,
  value,
  onChange,
  visible,
  setVisible,
  placeholder,
}) {
  return (
    <div className="cp-field">
      <label>{label}</label>

      <div className="cp-input-wrap">
        <span className="cp-lock">◆</span>

        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          maxLength={128}
        />

        <button
          type="button"
          className="cp-toggle"
          onClick={() => setVisible(!visible)}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

function ChangePassword({ token, onBack, onSuccess }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const strength = [
    newPassword.length >= 8,
    /[A-Z]/.test(newPassword),
    /[0-9]/.test(newPassword),
    /[^A-Za-z0-9]/.test(newPassword),
  ].filter(Boolean).length;

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (currentPassword.length === 0) {
      setError("Please enter your current password.");
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 128) {
      setError("New password must contain 8 to 128 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password.");
      return;
    }

    if (!token) {
      setError("Session expired. Please log in again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${JAVA_API_URL}/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
          data.message ||
          data.title ||
          "Unable to update password. Please check your current password."
        );
      }

      setSuccess(
        data.message || "Your password has been updated successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (err) {
      setError(
        err.message || "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cp-page">
      <div className="cp-decoration cp-decoration-one"></div>
      <div className="cp-decoration cp-decoration-two"></div>

      <div className="cp-card">

        <div className="cp-left">
          <div className="cp-brand">
            <span className="cp-brand-icon">R</span>
            ResumeAI
          </div>

          <div className="cp-left-content">
            <div className="cp-shield">✓</div>

            <h1>
              Your security.
              <br />
              <span>Your control.</span>
            </h1>

            <p>
              Protect your account with a strong password.
              A little security goes a long way.
            </p>

            <div className="cp-security-list">
              <div><span>✓</span> Secure password protection</div>
              <div><span>✓</span> Private account access</div>
              <div><span>✓</span> Simple account management</div>
            </div>
          </div>

          <div className="cp-left-footer">
            AI-powered career intelligence
          </div>
        </div>

        <div className="cp-right">

          <div className="cp-form-header">
            <span className="cp-eyebrow">ACCOUNT SECURITY</span>

            <h2>Change password</h2>

            <p>
              Update your password to keep your account secure.
            </p>
          </div>

          {success ? (
            <div className="cp-success-panel">
              <div className="cp-success-icon">✓</div>

              <h3>Password updated!</h3>

              <p>{success}</p>

              <button
                type="button"
                className="cp-submit"
                onClick={onSuccess}
              >
                Continue to Login →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>

              <PasswordField
                label="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                visible={showCurrent}
                setVisible={setShowCurrent}
                placeholder="Enter current password"
              />

              <PasswordField
                label="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                visible={showNew}
                setVisible={setShowNew}
                placeholder="Create a new password"
              />

              {newPassword && (
                <div className="cp-strength">

                  <div className="cp-strength-top">
                    <span>Password strength</span>
                    <strong>{strengthLabel}</strong>
                  </div>

                  <div className="cp-strength-bars">
                    {[1, 2, 3, 4].map((item) => (
                      <span
                        key={item}
                        className={item <= strength ? "active" : ""}
                      />
                    ))}
                  </div>

                  <small>
                    Use uppercase letters, numbers and symbols
                    for a stronger password.
                  </small>
                </div>
              )}

              <PasswordField
                label="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                visible={showConfirm}
                setVisible={setShowConfirm}
                placeholder="Enter new password again"
              />

              {error && (
                <div className="cp-error" role="alert">
                  <span>!</span> {error}
                </div>
              )}

              <button
                type="submit"
                className="cp-submit"
                disabled={loading}
              >
                {loading ? "Updating password..." : "Update Password →"}
              </button>

            </form>
          )}

          <button
            type="button"
            className="cp-back"
            onClick={onBack}
            disabled={loading}
          >
            ← Back to Dashboard
          </button>

          <div className="cp-privacy">
            <span>✓</span> Your account information stays protected
          </div>

        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
