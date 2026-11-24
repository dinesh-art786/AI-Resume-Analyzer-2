
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { PYTHON_API_URL } from "../config";

function History() {
  const { token } = useAuth();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [clearing, setClearing] = useState(false);

  // AUTHENTICATION HEADERS
  const getAuthHeaders = () => ({
    Authorization: `Bearer ${token}`
  });

  // FETCH RESUME HISTORY
  const fetchHistory = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError("Please log in to view resume history.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${PYTHON_API_URL}/history`, {
        headers: getAuthHeaders()
      });

      if (response.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
      }

      if (!response.ok) {
        throw new Error("Failed to fetch resume history.");
      }

      const data = await response.json();

      setHistory(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error("History Error:", err);
      setError(err.message || "Unable to load history.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // LOAD HISTORY AND AUTO REFRESH
  useEffect(() => {
    fetchHistory();

    window.addEventListener("analysisDeleted", fetchHistory);

    return () => {
      window.removeEventListener("analysisDeleted", fetchHistory);
    };
  }, [fetchHistory]);

  // DELETE SINGLE RESUME HISTORY
  async function deleteHistory(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this resume analysis?"
    );

    if (!confirmDelete) return;

    setDeletingId(id);
    setError("");

    try {
      const response = await fetch(`${API_URL}/history/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to delete resume analysis."
        );
      }

      setHistory((previousHistory) =>
        previousHistory.filter((item) => item.id !== id)
      );

      if (selectedId === id) {
        setSelectedId(null);
      }

      window.dispatchEvent(new Event("analysisDeleted"));

      alert("Resume analysis deleted successfully!");

    } catch (err) {
      console.error("Delete History Error:", err);
      setError(err.message || "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  }

  // CLEAR ALL RESUME HISTORY
  async function clearAllHistory() {
    if (history.length === 0) {
      alert("No resume history available to delete.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete ALL your resume analysis history?"
    );

    if (!confirmDelete) return;

    setClearing(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/history`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to clear resume history."
        );
      }

      setHistory([]);
      setSelectedId(null);

      window.dispatchEvent(new Event("analysisDeleted"));

      alert("All your resume analysis history deleted successfully!");

    } catch (err) {
      console.error("Clear History Error:", err);
      setError(err.message || "Unable to clear history.");
    } finally {
      setClearing(false);
    }
  }

  // VIEW / HIDE DETAILS
  function toggleDetails(id) {
    setSelectedId(selectedId === id ? null : id);
  }

  // FORMAT DATE
  function formatDate(date) {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleString();
  }

  // UI
  return (
    <section className="history-section" id="history">

      <h2>Resume Analysis History</h2>

      <p className="history-description">
        View, manage, and review your previous resume analyses.
      </p>

      <button
        className="refresh-button"
        onClick={fetchHistory}
        disabled={loading || clearing}
      >
        {loading ? "Refreshing..." : "↻ Refresh History"}
      </button>

      <button
        className="delete-button"
        onClick={clearAllHistory}
        disabled={clearing || loading || history.length === 0}
        style={{ marginLeft: "10px" }}
      >
        {clearing ? "Clearing..." : "Clear All History"}
      </button>

      {loading && (
        <p className="history-message">
          Loading resume history...
        </p>
      )}

      {error && (
        <p className="history-error">
          {error}
        </p>
      )}

      {!loading && !error && history.length === 0 && (
        <p className="history-message">
          No resume analysis records found.
        </p>
      )}

      <div className="history-list">

        {history.map((item) => (

          <div className="history-card" key={item.id}>

            <div className="history-info">

              <h3>{item.filename}</h3>

              <p>Analysis ID: {item.id}</p>

              <p>Date: {formatDate(item.created_at)}</p>

            </div>

            <div className="history-score">
              <strong>{item.match_score}%</strong>
              <span>ATS Match</span>
            </div>

            <div className="history-actions">

              <button onClick={() => toggleDetails(item.id)}>
                {selectedId === item.id
                  ? "Hide Details"
                  : "View Details"}
              </button>

              <button
                className="delete-button"
                onClick={() => deleteHistory(item.id)}
                disabled={deletingId === item.id || clearing}
              >
                {deletingId === item.id ? "Deleting..." : "Delete"}
              </button>

            </div>

            {selectedId === item.id && (

              <div className="history-details">

                <h4>Matched Skills</h4>

                <p>
                  {item.matched_skills?.length
                    ? item.matched_skills.join(", ")
                    : "No matched skills found."}
                </p>

                <h4>Missing Skills</h4>

                <p>
                  {item.missing_skills?.length
                    ? item.missing_skills.join(", ")
                    : "No missing skills found."}
                </p>

                <h4>Suggestions</h4>

                {item.suggestions?.length ? (
                  <ul>
                    {item.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No suggestions available.</p>
                )}

              </div>

            )}

          </div>

        ))}

      </div>

    </section>
  );
}

export default History;
