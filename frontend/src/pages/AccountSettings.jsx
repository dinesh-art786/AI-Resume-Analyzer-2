
import React, { useState, useRef, useEffect } from "react";
import "./AccountSettings.css";
import { JAVA_API_URL, JAVA_BACKEND_URL } from "../config";

function AccountSettings({ user, token, onBack, onProfileUpdated }) {

    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");

    const [profilePicture, setProfilePicture] = useState(
        user?.profile_picture
            ? `${JAVA_BACKEND_URL}${user.profile_picture}`
            : ""
    );

    const [selectedFile, setSelectedFile] = useState(null);

    const [loading, setLoading] = useState(false);
    const [pictureLoading, setPictureLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fileInputRef = useRef(null);

    useEffect(() => {
        setName(user?.name || "");
        setEmail(user?.email || "");
        setProfilePicture(
            user?.profile_picture
                ? `${JAVA_BACKEND_URL}${user.profile_picture}`
                : ""
        );
    }, [user]);

    // UPDATE PROFILE DETAILS
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (name.trim().length < 2) {
            setError("Name must contain at least 2 characters.");
            return;
        }

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${JAVA_API_URL}/auth/profile`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        email: email.trim(),
                    }),
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.detail ||
                    "Unable to update profile."
                );
            }

            onProfileUpdated?.(data.user);

            setSuccess(
                "Your account details have been updated successfully."
            );

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // SELECT PROFILE PICTURE
    const handleFileChange = (e) => {
        setError("");
        setSuccess("");

        const file = e.target.files?.[0];

        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/png"];

        if (!allowedTypes.includes(file.type)) {
            setError("Only JPG, JPEG and PNG images are allowed.");
            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must not exceed 5 MB.");
            e.target.value = "";
            return;
        }

        if (selectedFile && profilePicture.startsWith("blob:")) {
            URL.revokeObjectURL(profilePicture);
        }

        setSelectedFile(file);
        setProfilePicture(URL.createObjectURL(file));
    };

    // UPLOAD PROFILE PICTURE
    const handlePictureUpload = async () => {
        if (!selectedFile) {
            setError("Please select an image first.");
            return;
        }

        setError("");
        setSuccess("");

        try {
            setPictureLoading(true);

            const formData = new FormData();
            formData.append("file", selectedFile);

            const response = await fetch(
                `${JAVA_API_URL}/auth/profile-picture`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.detail ||
                    "Unable to upload profile picture."
                );
            }

            const updatedPicture = data.profile_picture
                ? `${JAVA_BACKEND_URL}${data.profile_picture}`
                : "";

            setProfilePicture(updatedPicture);
            setSelectedFile(null);

            onProfileUpdated?.({
                ...user,
                profile_picture: data.profile_picture
            });

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            setSuccess("Profile picture uploaded successfully.");

        } catch (err) {
            setError(err.message);
        } finally {
            setPictureLoading(false);
        }
    };

    // DELETE PROFILE PICTURE
    const handlePictureDelete = async () => {
        setError("");
        setSuccess("");

        try {
            setDeleteLoading(true);

            const response = await fetch(
                `${JAVA_API_URL}/auth/profile-picture`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.detail ||
                    "Unable to remove profile picture."
                );
            }

            if (selectedFile && profilePicture.startsWith("blob:")) {
                URL.revokeObjectURL(profilePicture);
            }

            setProfilePicture("");
            setSelectedFile(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            onProfileUpdated?.({
                ...user,
                profile_picture: null
            });

            setSuccess("Profile picture removed successfully.");

        } catch (err) {
            setError(err.message);
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="account-page">
            <div className="account-card">

                {/* LEFT PANEL */}
                <div className="account-left">

                    <div className="account-brand">
                        <span>AI</span> Resume Analyzer
                    </div>

                    <div className="account-left-content">

                        <div className="account-icon">👤</div>

                        <h1>Account Settings</h1>

                        <p>
                            Manage your personal information and keep
                            your account details up to date.
                        </p>

                        <div className="account-feature">
                            <span>✓</span>
                            Update your personal details
                        </div>

                        <div className="account-feature">
                            <span>✓</span>
                            Upload your profile picture
                        </div>

                        <div className="account-feature">
                            <span>✓</span>
                            Keep your account secure
                        </div>

                    </div>

                    <div className="account-left-footer">
                        AI Resume Analyzer
                    </div>

                </div>

                {/* RIGHT PANEL */}
                <div className="account-right">

                    <button
                        type="button"
                        className="account-back"
                        onClick={onBack}
                    >
                        ← Back to Dashboard
                    </button>

                    <div className="account-heading">

                        <span className="account-subtitle">
                            PERSONAL INFORMATION
                        </span>

                        <h2>Edit Your Profile</h2>

                        <p>
                            Manage your profile picture, name and email.
                        </p>

                    </div>

                    {/* PROFILE PICTURE */}
                    <div className="profile-picture-section">

                        <div className="profile-picture-preview">

                            {profilePicture ? (
                                <img
                                    src={profilePicture}
                                    alt="Profile"
                                    className="profile-picture-image"
                                />
                            ) : (
                                <div className="profile-picture-placeholder">
                                    {name
                                        ? name.trim().charAt(0).toUpperCase()
                                        : "U"}
                                </div>
                            )}

                        </div>

                        <h3>{name || "Your Name"}</h3>

                        <p>Profile Picture</p>

                        <input
                            type="file"
                            accept="image/jpeg,image/png"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                        />

                        <div className="profile-picture-buttons">

                            <button
                                type="button"
                                className="choose-picture-button"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Choose Image
                            </button>

                            {selectedFile && (
                                <button
                                    type="button"
                                    className="upload-picture-button"
                                    onClick={handlePictureUpload}
                                    disabled={pictureLoading}
                                >
                                    {pictureLoading
                                        ? "Uploading..."
                                        : "Upload Picture"}
                                </button>
                            )}

                            {(user?.profile_picture || selectedFile) && (
                                <button
                                    type="button"
                                    className="remove-picture-button"
                                    onClick={handlePictureDelete}
                                    disabled={deleteLoading}
                                >
                                    {deleteLoading
                                        ? "Removing..."
                                        : "Remove Picture"}
                                </button>
                            )}

                        </div>

                        <small>
                            JPG or PNG. Maximum size: 5 MB.
                        </small>

                    </div>

                    {/* PROFILE FORM */}
                    <form onSubmit={handleSubmit}>

                        <div className="account-field">

                            <label htmlFor="account-name">
                                Full Name
                            </label>

                            <input
                                id="account-name"
                                type="text"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                minLength={2}
                                maxLength={100}
                                required
                            />

                        </div>

                        <div className="account-field">

                            <label htmlFor="account-email">
                                Email Address
                            </label>

                            <input
                                id="account-email"
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                        </div>

                        {error && (
                            <div className="account-error">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="account-success">
                                ✓ {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="account-save"
                            disabled={loading}
                        >
                            {loading
                                ? "Saving Changes..."
                                : "Save Changes"}
                        </button>

                    </form>

                    <p className="account-note">
                        Your updated profile details will appear
                        automatically in the navigation bar.
                    </p>

                </div>

            </div>
        </div>
    );
}

export default AccountSettings;
