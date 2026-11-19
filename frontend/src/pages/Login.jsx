
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Login({ onSwitch, onForgotPassword }) {
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await login({
                email: email.trim(),
                password: password
            });

            console.log("LOGIN SUCCESSFUL:", result);

        } catch (err) {
            console.error("LOGIN ERROR:", err);
            setError(err.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAccount = () => {
        console.log("CREATE ACCOUNT CLICKED");

        if (onSwitch) {
            onSwitch();
        }
    };

    const handleForgotPassword = () => {
        if (onForgotPassword) {
            onForgotPassword();
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-layout">

                {/* LEFT PANEL */}
                <div className="auth-brand-panel">

                    <div className="auth-logo">
                        <span className="auth-logo-icon">R</span>
                        <span>ResumeAI</span>
                    </div>

                    <div className="auth-brand-content">
                        <span className="auth-eyebrow">
                            YOUR CAREER, REIMAGINED
                        </span>

                        <h1>
                            Build a resume
                            <br />
                            that opens
                            <br />
                            <span>new doors.</span>
                        </h1>

                        <p>
                            Discover your strengths, improve your resume
                            and move closer to your dream career with
                            intelligent AI-powered insights.
                        </p>

                        <div className="auth-benefits">
                            <div>
                                <span>✓</span> Smart ATS score analysis
                            </div>
                            <div>
                                <span>✓</span> Intelligent skill matching
                            </div>
                            <div>
                                <span>✓</span> Personalized recommendations
                            </div>
                        </div>
                    </div>

                    <div className="auth-brand-footer">
                        <span>✦</span>
                        Your next opportunity starts here.
                    </div>

                    <div className="auth-decoration auth-decoration-one"></div>
                    <div className="auth-decoration auth-decoration-two"></div>
                </div>

                {/* RIGHT PANEL */}
                <div className="auth-form-panel">
                    <div className="auth-form-card">

                        <div className="auth-mobile-logo">
                            <span className="auth-logo-icon">R</span>
                            ResumeAI
                        </div>

                        <div className="auth-form-heading">
                            <span className="auth-form-tag">
                                WELCOME BACK
                            </span>

                            <h2>Sign in to your account</h2>

                            <p>
                                Enter your details to continue your
                                career journey.
                            </p>
                        </div>

                        {/* LOGIN FORM */}
                        <form onSubmit={handleSubmit}>

                            {/* EMAIL */}
                            <div className="auth-field">
                                <label htmlFor="login-email">
                                    Email address
                                </label>

                                <div className="auth-input-wrap">
                                    <span className="auth-input-icon">✉</span>

                                    <input
                                        id="login-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </div>

                            {/* PASSWORD */}
                            <div className="auth-field">
                                <label htmlFor="login-password">
                                    Password
                                </label>

                                <div className="auth-input-wrap">
                                    <span className="auth-input-icon">⌑</span>

                                    <input
                                        id="login-password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>

                                <div className="forgot-password-row">
                                    <button
                                        type="button"
                                        className="forgot-password-link"
                                        onClick={handleForgotPassword}
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            </div>

                            {/* ERROR */}
                            {error && (
                                <div className="auth-error">
                                    {error}
                                </div>
                            )}

                            {/* SIGN IN BUTTON */}
                            <button
                                type="submit"
                                className="auth-submit"
                                disabled={loading}
                            >
                                {loading ? "Signing in..." : "Sign In"}
                                {!loading && <span>→</span>}
                            </button>

                        </form>

                        {/* CREATE ACCOUNT */}
                        <div className="auth-switch">
                            Don't have an account?

                            <button
                                type="button"
                                onClick={handleCreateAccount}
                            >
                                Create account
                            </button>
                        </div>

                        {/* SECURITY */}
                        <div className="auth-security">
                            <span>🔒</span>
                            Your account and resume data are protected.
                        </div>

                    </div>

                    <div className="auth-copyright">
                        © 2026 ResumeAI. Designed for your career growth.
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Login;
