
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Register({ onSwitch }) {
    const { register } = useAuth();

    const [name, setName] = useState("");
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
            await register({ name, email, password });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-layout">

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
                            Your next
                            <br />
                            chapter starts
                            <br />
                            <span>with you.</span>
                        </h1>

                        <p>
                            Create your account and discover how
                            intelligent resume analysis can help
                            you become job-ready.
                        </p>

                        <div className="auth-benefits">
                            <div><span>✓</span> Analyze your resume</div>
                            <div><span>✓</span> Discover missing skills</div>
                            <div><span>✓</span> Track your improvement</div>
                        </div>
                    </div>

                    <div className="auth-brand-footer">
                        <span>✦</span>
                        Take the first step toward your goals.
                    </div>

                    <div className="auth-decoration auth-decoration-one"></div>
                    <div className="auth-decoration auth-decoration-two"></div>
                </div>

                <div className="auth-form-panel">
                    <div className="auth-form-card">

                        <div className="auth-mobile-logo">
                            <span className="auth-logo-icon">R</span>
                            ResumeAI
                        </div>

                        <div className="auth-form-heading">
                            <span className="auth-form-tag">
                                GET STARTED
                            </span>

                            <h2>Create your account</h2>

                            <p>
                                Join ResumeAI and take control of your
                                career journey.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="auth-field">
                                <label htmlFor="register-name">Full name</label>

                                <div className="auth-input-wrap">
                                    <span className="auth-input-icon">♙</span>
                                    <input
                                        id="register-name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your full name"
                                        minLength={2}
                                        maxLength={100}
                                        autoComplete="name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="auth-field">
                                <label htmlFor="register-email">Email address</label>

                                <div className="auth-input-wrap">
                                    <span className="auth-input-icon">✉</span>
                                    <input
                                        id="register-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="auth-field">
                                <label htmlFor="register-password">Password</label>

                                <div className="auth-input-wrap">
                                    <span className="auth-input-icon">⌑</span>
                                    <input
                                        id="register-password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Minimum 8 characters"
                                        minLength={8}
                                        maxLength={128}
                                        autoComplete="new-password"
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="auth-error">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="auth-submit"
                                disabled={loading}
                            >
                                {loading ? "Creating account..." : "Create Account"}
                                {!loading && <span>→</span>}
                            </button>
                        </form>

                        <div className="auth-switch">
                            Already have an account?
                            <button type="button" onClick={onSwitch}>
                                Sign in
                            </button>
                        </div>

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

export default Register;
