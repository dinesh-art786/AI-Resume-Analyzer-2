
import React, { useState } from "react";

const BACKEND_URL = "http://127.0.0.1:8000";

function Navbar({
    user,
    onLogout,
    onAccountSettings,
    onChangePassword,
    onNavigate
}) {
    const [showProfile, setShowProfile] = useState(false);

    const userName = user?.name || user?.username || "User";
    const userEmail = user?.email || "";

    const profilePicture = user?.profile_picture
        ? `${BACKEND_URL}${user.profile_picture}`
        : null;

    function handleNavigation(event, page) {
        event.preventDefault();
        setShowProfile(false);
        onNavigate?.(page);
    }

    return (
        <nav className="navbar">

            <a
                href="#home"
                className="logo"
                onClick={(event) => handleNavigation(event, "analyzer")}
            >
                <span>AI</span> Resume Analyzer
            </a>

            <div className="nav-links">

                <a
                    href="#analyzer"
                    onClick={(event) => handleNavigation(event, "analyzer")}
                >
                    Analyze
                </a>

                <a
                    href="#dashboard"
                    onClick={(event) => handleNavigation(event, "dashboard")}
                >
                    Dashboard
                </a>

                <a
                    href="#history"
                    onClick={(event) => handleNavigation(event, "history")}
                >
                    History
                </a>

            </div>

            <div className="navbar-actions">

                <a
                    href="#analyzer"
                    className="nav-button"
                    onClick={(event) => handleNavigation(event, "analyzer")}
                >
                    + New Analysis
                </a>

                <div className="profile-container">

                    <button
                        className="profile-button"
                        type="button"
                        onClick={() => setShowProfile(!showProfile)}
                    >
                        {profilePicture ? (
                            <img
                                src={profilePicture}
                                alt="Profile"
                                className="profile-avatar-image"
                            />
                        ) : (
                            <span className="profile-avatar">
                                {userName.charAt(0).toUpperCase()}
                            </span>
                        )}

                        <span>{userName}</span>
                        <span>⌄</span>
                    </button>

                    {showProfile && (
                        <div className="profile-dropdown">

                            <div className="profile-info">
                                <strong>{userName}</strong>
                                <small>{userEmail}</small>
                            </div>

                            <hr />

                            <button
                                type="button"
                                onClick={() => {
                                    setShowProfile(false);
                                    onAccountSettings?.();
                                }}
                            >
                                Account Settings
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowProfile(false);
                                    onChangePassword?.();
                                }}
                            >
                                Change Password
                            </button>

                            <hr />

                            <button
                                type="button"
                                className="logout-button"
                                onClick={() => {
                                    setShowProfile(false);
                                    onLogout?.();
                                }}
                            >
                                Logout
                            </button>

                        </div>
                    )}

                </div>
            </div>

        </nav>
    );
}

export default Navbar;
