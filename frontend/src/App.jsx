import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { API_URL } from "./config";
import React, { useState, useEffect } from "react";

import Navbar from "./components/Navbar";
import ResumeUpload from "./components/ResumeUpload";
import AnalysisResult from "./components/AnalysisResult";
import Dashboard from "./components/Dashboard";
import History from "./components/History";
import CinematicExperience from "./components/CinematicExperience";


import "./App.css";

function App() {
    const {
        user,
        loading: authLoading,
        isAuthenticated,
        logout,
        token,
        updateUser
    } = useAuth();

    const [authMode, setAuthMode] = useState("login");
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showAccountSettings, setShowAccountSettings] = useState(false);
    const [activePage, setActivePage] = useState("analyzer");

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =====================================
    // WHOLE WEBSITE SCROLL ANIMATIONS
    // =====================================

    useEffect(() => {
        const elements = document.querySelectorAll(`
            .welcome-header,
            .workspace-tabs,
            .workspace-heading,
            .analyzer-panel,
            .analysis-output,
            .site-footer,
            [class*="card"],
            [class*="Card"],
            .recharts-wrapper,
            .history-item,
            .stat-card
        `);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("scroll-3d-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -40px 0px"
            }
        );

        elements.forEach((element, index) => {
            element.classList.add("scroll-3d");

            element.style.setProperty(
                "--reveal-delay",
                `${(index % 5) * 90}ms`
            );

            observer.observe(element);
        });

        return () => observer.disconnect();
    }, [activePage, result]);

    // =====================================
    // AUTHENTICATION LOADING
    // =====================================

    if (authLoading) {
        return (
            <div className="auth-loading">
                Checking login...
            </div>
        );
    }

    // =====================================
    // PASSWORD RESET PAGE
    // =====================================

    if (window.location.pathname === "/reset-password") {
        return (
            <ResetPassword
                onBack={() => {
                    logout();
                    window.history.replaceState({}, "", "/");
                    setAuthMode("login");
                }}
            />
        );
    }

    // =====================================
    // AUTHENTICATION
    // =====================================

    if (!isAuthenticated) {
        if (authMode === "register") {
            return (
                <Register
                    onSwitch={() => setAuthMode("login")}
                />
            );
        }

        if (authMode === "forgot") {
            return (
                <ForgotPassword
                    onBack={() => setAuthMode("login")}
                />
            );
        }

        return (
            <Login
                onSwitch={() => setAuthMode("register")}
                onForgotPassword={() => setAuthMode("forgot")}
            />
        );
    }

    // =====================================
    // ACCOUNT SETTINGS
    // =====================================

    if (showAccountSettings) {
        return (
            <AccountSettings
                user={user}
                token={token}
                onBack={() => setShowAccountSettings(false)}
                onProfileUpdated={updateUser}
            />
        );
    }

    // =====================================
    // CHANGE PASSWORD
    // =====================================

    if (showChangePassword) {
        return (
            <ChangePassword
                token={token}
                onBack={() => setShowChangePassword(false)}
                onSuccess={logout}
            />
        );
    }

    // =====================================
    // ANALYZE RESUME
    // =====================================

    async function analyzeResume(file, jobDescription) {
        if (!file || !jobDescription.trim()) {
            setError(
                "Please upload your resume and enter a job description."
            );
            return;
        }

        if (!token) {
            setError(
                "Your session has expired. Please log in again."
            );
            logout();
            return;
        }

        if (loading) return;

        setLoading(true);
        setError("");
        setResult(null);

        const formData = new FormData();

        formData.append("file", file);
        formData.append("job_description", jobDescription);

        try {
            const response = await fetch(
    `${API_URL}/analyze`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                }
            );

            const data = await response.json().catch(() => null);

            if (response.status === 401) {
                logout();
                throw new Error(
                    "Your session expired. Please log in again."
                );
            }

            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                    "Resume analysis failed. Please try again."
                );
            }

            if (!data) {
                throw new Error(
                    "Invalid response received from the server."
                );
            }

            setResult(data);

            setTimeout(() => {
                document
                    .getElementById("analysis-output")
                    ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
            }, 100);

        } catch (err) {
            console.error("Resume Analysis Error:", err);

            setError(
                err instanceof TypeError
                    ? "Cannot connect to the backend. Check whether your server is running."
                    : err.message || "Unable to analyze resume."
            );

        } finally {
            setLoading(false);
        }
    }

    // =====================================
    // ANALYZE ANOTHER RESUME
    // =====================================

    function analyzeAnotherResume() {
        setResult(null);
        setError("");
        changePage("analyzer");
    }

    // =====================================
    // NAVIGATION
    // =====================================

    function changePage(page) {
        setActivePage(page);
        setError("");

        setTimeout(() => {
            const target = document.getElementById(page);

            if (target) {
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            } else {
                document
                    .querySelector(".workspace-tabs")
                    ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
            }
        }, 150);
    }

    // =====================================
    // MAIN WEBSITE
    // =====================================

    return (
        <div className="app">

            {/* CINEMATIC BACKGROUND */}

            <div
                className="cinematic-background"
                aria-hidden="true"
            >
                <div className="background-scene scene-one"></div>
                <div className="background-scene scene-two"></div>
                <div className="background-scene scene-three"></div>
                <div className="background-scene scene-four"></div>
            </div>

            {/* NAVBAR */}

            <Navbar
                user={user}
                onLogout={logout}
                onAccountSettings={() => setShowAccountSettings(true)}
                onChangePassword={() => setShowChangePassword(true)}
                onNavigate={changePage}
            />

            {/* CINEMATIC EXPERIENCE */}

            <div id="home">
                <CinematicExperience />
            </div>

            {/* MAIN WORKSPACE */}

            <main
                className="main-content"
                id="resume-workspace"
            >

                {/* WELCOME HEADER */}

                <div className="welcome-header">

                    <div>
                        <span className="welcome-label">
                            YOUR WORKSPACE
                        </span>

                        <h1>
                            Hello, {user?.name || "there"} 👋
                        </h1>

                        <p>
                            Your career journey starts here.
                        </p>
                    </div>

                </div>

                {/* WORKSPACE NAVIGATION */}

                <div className="workspace-tabs">

                    <button
                        type="button"
                        className={
                            activePage === "analyzer" ? "active" : ""
                        }
                        onClick={() => changePage("analyzer")}
                    >
                        ✦ Analyze
                    </button>

                    <button
                        type="button"
                        className={
                            activePage === "dashboard" ? "active" : ""
                        }
                        onClick={() => changePage("dashboard")}
                    >
                        ▦ Dashboard
                    </button>

                    <button
                        type="button"
                        className={
                            activePage === "history" ? "active" : ""
                        }
                        onClick={() => changePage("history")}
                    >
                        ◷ History
                    </button>

                </div>

                {/* ANALYZER */}

                {activePage === "analyzer" && (

                    <section
                        className="workspace-section analyzer-area"
                        id="analyzer"
                    >

                        <div className="workspace-heading">

                            <div>
                                <h2>Resume Analyzer</h2>

                                <p>
                                    Upload your resume and job description.
                                </p>
                            </div>

                        </div>

                        <div className="analyzer-panel">

                            <ResumeUpload
                                onAnalyze={analyzeResume}
                                loading={loading}
                            />

                        </div>

                        {loading && (
                            <div
                                className="loading-message"
                                role="status"
                            >
                                <span className="loading-spinner"></span>

                                <p>
                                    Analyzing your resume...
                                </p>
                            </div>
                        )}

                        {error && (
                            <div
                                className="error-message"
                                role="alert"
                            >
                                <strong>
                                    Something went wrong
                                </strong>

                                <p>{error}</p>
                            </div>
                        )}

                        {result && (

                            <div
                                className="analysis-output"
                                id="analysis-output"
                            >

                                <div className="result-top-actions">

                                    <button
                                        type="button"
                                        className="analyze-another-button"
                                        onClick={analyzeAnotherResume}
                                    >
                                        + New Analysis
                                    </button>

                                </div>

                                <AnalysisResult result={result} />

                            </div>

                        )}

                    </section>

                )}

                {/* DASHBOARD */}

                {activePage === "dashboard" && (

                    <section
                        className="workspace-section data-area"
                        id="dashboard"
                    >

                        <div className="workspace-heading">

                            <div>
                                <h2>Your Dashboard</h2>

                                <p>
                                    Your resume performance at a glance.
                                </p>
                            </div>

                        </div>

                        <Dashboard />

                    </section>

                )}

                {/* HISTORY */}

                {activePage === "history" && (

                    <section
                        className="workspace-section data-area"
                        id="history"
                    >

                        <div className="workspace-heading">

                            <div>
                                <h2>Analysis History</h2>

                                <p>
                                    Your previous resume analyses.
                                </p>
                            </div>

                        </div>

                        <History />

                    </section>

                )}

            </main>

            {/* FOOTER */}

            <footer className="site-footer">

                <div className="footer-main">

                    <div className="footer-brand">

                        <h2>✦ ResumeAI</h2>

                        <p>
                            Smarter resumes. Better opportunities.
                        </p>

                    </div>

                    <div className="footer-links">

                        <h3>Workspace</h3>

                        <button
                            type="button"
                            onClick={() => changePage("analyzer")}
                        >
                            Analyze Resume
                        </button>

                        <button
                            type="button"
                            onClick={() => changePage("dashboard")}
                        >
                            Dashboard
                        </button>

                        <button
                            type="button"
                            onClick={() => changePage("history")}
                        >
                            History
                        </button>

                    </div>

                </div>

                <div className="footer-bottom">

                    <p>
                        © {new Date().getFullYear()} ResumeAI
                    </p>

                    <span>
                        Made for smarter career decisions ✨
                    </span>

                </div>

            </footer>

        </div>
    );
}

export default App;
