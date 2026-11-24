
import React, { useEffect, useState, useCallback } from "react";
import { PYTHON_API_URL, JAVA_BACKEND_URL } from "../config";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { useAuth } from "../context/AuthContext";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatActivityDate(dateString) {
  if (!dateString) return "Date unavailable";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function Dashboard() {
  const { token, user } = useAuth();

  const [history, setHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRange, setSelectedRange] = useState("all");

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${token}`
  });

  // LOAD DASHBOARD DATA
  const loadDashboard = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError("Please log in to view dashboard data.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      let query = "";
      const today = new Date();

      if (selectedRange !== "all") {
        const start = new Date(today);

        if (selectedRange === "7") {
          start.setDate(start.getDate() - 6);
        } else if (selectedRange === "30") {
          start.setDate(start.getDate() - 29);
        }

        query = `?start_date=${formatDate(start)}&end_date=${formatDate(today)}`;
      }

      const headers = getAuthHeaders();

      const [historyResponse, analyticsResponse] = await Promise.all([
        fetch(`${PYTHON_API_URL}/history${query}`, { headers }),
        fetch(`${PYTHON_API_URL}/analytics${query}`, { headers })
      ]);

      if (
        historyResponse.status === 401 ||
        analyticsResponse.status === 401
      ) {
        throw new Error("Your session has expired. Please log in again.");
      }

      if (!historyResponse.ok || !analyticsResponse.ok) {
        throw new Error("Unable to load dashboard data.");
      }

      const historyData = await historyResponse.json();
      const analyticsData = await analyticsResponse.json();

      setHistory(Array.isArray(historyData) ? historyData : []);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error("Dashboard Error:", err);
      setError(err.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [selectedRange, token]);

  useEffect(() => {
    loadDashboard();

    window.addEventListener("analysisDeleted", loadDashboard);

    return () => {
      window.removeEventListener("analysisDeleted", loadDashboard);
    };
  }, [loadDashboard]);

  // EXPORT DATE FILTER
  function getExportQuery() {
    if (selectedRange === "all") return "";

    const today = new Date();
    const start = new Date(today);

    if (selectedRange === "7") {
      start.setDate(start.getDate() - 6);
    } else if (selectedRange === "30") {
      start.setDate(start.getDate() - 29);
    }

    return `?start_date=${formatDate(start)}&end_date=${formatDate(today)}`;
  }

  // GET EXPORT DATA
  async function getExportData() {
    if (!token) {
      throw new Error("Please log in first.");
    }

    const response = await fetch(
      `${PYTHON_API_URL}/export${getExportQuery()}`,
      { headers: getAuthHeaders() }
    );

    if (response.status === 401) {
      throw new Error("Your session has expired. Please log in again.");
    }

    if (!response.ok) {
      throw new Error("Unable to export analytics data.");
    }

    return await response.json();
  }

  // PREPARE EXPORT DATA
  function prepareExportData(data) {
    return data.map((item) => ({
      ID: item.id,
      Filename: item.filename,
      "ATS Score": item.match_score,
      "Matched Skills": (item.matched_skills || []).join(", "),
      "Missing Skills": (item.missing_skills || []).join(", "),
      Suggestions: (item.suggestions || []).join("; "),
      "Created At": item.created_at
    }));
  }

  // CSV EXPORT
  async function exportCSV() {
    try {
      const data = await getExportData();

      if (!data.length) {
        alert("No analysis records available to export.");
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(
        prepareExportData(data)
      );

      const csv = XLSX.utils.sheet_to_csv(worksheet);

      const blob = new Blob(
        ["\uFEFF" + csv],
        { type: "text/csv;charset=utf-8;" }
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "resume_analytics.csv";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (err) {
      alert("CSV Export Failed: " + err.message);
    }
  }

  // EXCEL EXPORT
  async function exportExcel() {
    try {
      const data = await getExportData();

      if (!data.length) {
        alert("No analysis records available to export.");
        return;
      }

      const workbook = XLSX.utils.book_new();

      const analysisSheet = XLSX.utils.json_to_sheet(
        prepareExportData(data)
      );

      XLSX.utils.book_append_sheet(
        workbook,
        analysisSheet,
        "Resume Analyses"
      );

      const summaryData = [
        {
          Metric: "Total Analyses",
          Value: analytics?.total_analyses ?? 0
        },
        {
          Metric: "Average ATS Score",
          Value: analytics?.average_score ?? 0
        },
        {
          Metric: "Matched Skills",
          Value: analytics?.skill_summary?.matched ?? 0
        },
        {
          Metric: "Missing Skills",
          Value: analytics?.skill_summary?.missing ?? 0
        }
      ];

      const summarySheet = XLSX.utils.json_to_sheet(summaryData);

      XLSX.utils.book_append_sheet(
        workbook,
        summarySheet,
        "Analytics Summary"
      );

      XLSX.writeFile(workbook, "resume_analytics.xlsx");
    } catch (err) {
      alert("Excel Export Failed: " + err.message);
    }
  }

  // PDF EXPORT
  async function exportPDF() {
    try {
      const dashboard = document.getElementById("dashboard");

      if (!dashboard) {
        throw new Error("Dashboard not found.");
      }

      const canvas = await html2canvas(dashboard, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#EFF7F6",
        logging: false,
        ignoreElements: (element) =>
          element.hasAttribute("data-html2canvas-ignore")
      });

      const image = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;

      const imageWidth = pageWidth - margin * 2;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;
      const availableHeight = pageHeight - margin * 2;

      let heightLeft = imageHeight;
      let position = margin;

      pdf.addImage(image, "PNG", margin, position, imageWidth, imageHeight);

      heightLeft -= availableHeight;

      while (heightLeft > 0) {
        position -= availableHeight;
        pdf.addPage();

        pdf.addImage(
          image,
          "PNG",
          margin,
          position,
          imageWidth,
          imageHeight
        );

        heightLeft -= availableHeight;
      }

      pdf.save("resume_analytics_report.pdf");
    } catch (err) {
      console.error("PDF Export Error:", err);
      alert("PDF Export Failed: " + err.message);
    }
  }

  // LOADING STATE
  if (loading) {
    return (
      <section className="dashboard-section dashboard-status" id="dashboard">
        <div className="dashboard-loader"></div>
        <p>Loading your analytics...</p>
      </section>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <section className="dashboard-section dashboard-status" id="dashboard">
        <p className="history-error">{error}</p>
        <button className="dashboard-retry" onClick={loadDashboard}>
          Retry
        </button>
      </section>
    );
  }

  if (!analytics) {
    return (
      <section className="dashboard-section dashboard-status" id="dashboard">
        <p>No analytics data available.</p>
      </section>
    );
  }

  // DASHBOARD CALCULATIONS
  const total = Number(analytics.total_analyses || 0);
  const averageScore = Number(analytics.average_score || 0);

  const highestScore = history.length
    ? Math.max(
        ...history.map((item) => Number(item.match_score || 0))
      ).toFixed(1)
    : "0";

  const averageSkillCoverage = history.length
    ? (
        history.reduce((sum, item) => {
          const matched = item.matched_skills?.length || 0;
          const missing = item.missing_skills?.length || 0;
          const required = matched + missing;

          return sum + (required ? (matched / required) * 100 : 0);
        }, 0) / history.length
      ).toFixed(1)
    : "0";

  const stats = [
    {
      title: "Total Analyses",
      value: total,
      icon: "▤",
      description: "Resumes analyzed",
      color: "blue"
    },
    {
      title: "Average ATS Score",
      value: `${averageScore}%`,
      icon: "◉",
      description: "Overall compatibility",
      color: "cyan"
    },
    {
      title: "Highest ATS Score",
      value: `${highestScore}%`,
      icon: "♛",
      description: "In recent history",
      color: "purple"
    },
    {
      title: "Average Skill Match",
      value: `${averageSkillCoverage}%`,
      icon: "◎",
      description: "Skill coverage",
      color: "green"
    }
  ];

  const skillData = [
    {
      name: "Matched",
      value: Number(analytics.skill_summary?.matched || 0)
    },
    {
      name: "Missing",
      value: Number(analytics.skill_summary?.missing || 0)
    }
  ];

  const skillColors = ["#16c995", "#ff647c"];

  const trendData = (analytics.history_trend || []).map(
    (item, index) => ({
      name: `#${index + 1}`,
      score: Number(item.score || 0),
      date: item.date
    })
  );

  const scoreDistribution = analytics.score_distribution || [];
  const missingSkills = analytics.top_missing_skills || [];

  // DASHBOARD INSIGHTS
  const performanceLevel =
    averageScore >= 70
      ? "Advanced"
      : averageScore >= 40
      ? "Intermediate"
      : "Beginner";

  const performanceColor =
    averageScore >= 70
      ? "#16a36a"
      : averageScore >= 40
      ? "#d18b20"
      : "#e05263";

  let improvementTip = "";

  if (averageScore >= 80) {
    improvementTip =
      "Excellent performance! Keep tailoring your resume to each job description.";
  } else if (averageScore >= 60) {
    improvementTip =
      "Good progress! Add relevant keywords and measurable achievements to improve your ATS score.";
  } else if (averageScore >= 40) {
    improvementTip =
      "Work on matching your resume skills with the job description and improving your experience section.";
  } else {
    improvementTip =
      "Focus on adding relevant technical skills, projects, and keywords from the job description.";
  }

  const topMissingSkill = missingSkills.length
    ? missingSkills[0].skill
    : null;

  const progressMessage =
    total >= 5
      ? "Great consistency! You have analyzed multiple resumes. Keep improving your results."
      : total >= 2
      ? "Good start! Continue analyzing resumes to track your improvement."
      : "Analyze more resumes to build your performance history.";

  // DASHBOARD UI
  return (
    <section className="dashboard-section premium-dashboard" id="dashboard">

      <div className="dashboard-header">
        <div>
          <div className="dashboard-eyebrow">
            <span className="dashboard-live-dot"></span>
            PERFORMANCE OVERVIEW
          </div>

          <h2>
            Analytics <span>Dashboard</span>
          </h2>

          <p className="dashboard-description">
            Track your resume performance, skill gaps and ATS compatibility.
          </p>
        </div>

        <div className="dashboard-header-icon">
          <span>▥</span>
        </div>
      </div>

      {/* USER PROFILE */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
          padding: "20px",
          margin: "20px 0",
          background: "#ffffff",
          borderRadius: "14px",
          border: "1px solid #dcebea",
          boxShadow: "0 4px 15px rgba(0,0,0,0.04)"
        }}
      >
        {user?.profile_picture ? (
          <img
            src={
              user.profile_picture.startsWith("http")
                ? user.profile_picture
                : `${JAVA_BACKEND_URL}${user.profile_picture}`
            }
            alt="Profile"
            style={{
              width: "65px",
              height: "65px",
              borderRadius: "50%",
              objectFit: "cover"
            }}
          />
        ) : (
          <div
            style={{
              width: "65px",
              height: "65px",
              minWidth: "65px",
              borderRadius: "50%",
              background: "#B2F7EF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              fontWeight: "bold",
              color: "#173b45"
            }}
          >
            {(user?.name || "U").charAt(0).toUpperCase()}
          </div>
        )}

        <div>
          <h3 style={{ margin: "0 0 6px", color: "#263238" }}>
            Welcome, {user?.name || "User"}!
          </h3>

          <p style={{ margin: "0 0 5px", color: "#718096" }}>
            {user?.email || "Welcome to your analytics dashboard"}
          </p>

          <small style={{ color: "#287d91" }}>
            Your personal resume performance overview
          </small>
        </div>
      </div>

      {/* FILTERS AND EXPORTS */}
      <div className="dashboard-toolbar" data-html2canvas-ignore="true">
        <div className="dashboard-filter-group">
          <span className="toolbar-label">TIME PERIOD</span>

          <div className="date-filter">
            {[
              ["today", "Today"],
              ["7", "7 Days"],
              ["30", "30 Days"],
              ["all", "All Time"]
            ].map(([value, label]) => (
              <button
                key={value}
                className={selectedRange === value ? "active-filter" : ""}
                onClick={() => setSelectedRange(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="dashboard-export-group">
          <span className="toolbar-label">EXPORT REPORT</span>

          <div className="export-buttons">
            <button className="export-csv" onClick={exportCSV}>
              ↓ CSV
            </button>

            <button className="export-excel" onClick={exportExcel}>
              ↓ Excel
            </button>

            <button className="export-pdf" onClick={exportPDF}>
              ↓ PDF
            </button>
          </div>
        </div>
      </div>

      {total === 0 ? (
        <div className="dashboard-empty">
          <div className="empty-icon">▤</div>
          <h3>Your analytics will appear here</h3>
          <p>
            Upload and analyze your first resume to see your performance
            statistics, charts and skill insights.
          </p>
          <a href="#analyzer" className="empty-action">
            Analyze a Resume →
          </a>
        </div>
      ) : (
        <>
          {/* STATISTICS */}
          <div className="dashboard-section-heading">
            <div>
              <h3>Performance Summary</h3>
              <p>Your key resume analysis metrics</p>
            </div>

            <span className="summary-period">
              {selectedRange === "all"
                ? "All records"
                : selectedRange === "today"
                ? "Today"
                : `Last ${selectedRange} days`}
            </span>
          </div>

          <div className="dashboard-grid premium-stats-grid">
            {stats.map((stat) => (
              <div
                className={`dashboard-card premium-stat-card ${stat.color}`}
                key={stat.title}
              >
                <div className="stat-top">
                  <div className={`dashboard-icon ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <span className="stat-menu">•••</span>
                </div>

                <h3>{stat.title}</h3>
                <div className="dashboard-value">{stat.value}</div>

                <div className="stat-bottom">
                  <span>{stat.description}</span>
                  <span className="stat-indicator">↗</span>
                </div>
              </div>
            ))}
          </div>

          {/* FOUR CHARTS */}
          <div className="dashboard-section-heading charts-heading">
            <div>
              <h3>Analytics & Insights</h3>
              <p>Visualize your resume analysis results</p>
            </div>
          </div>

          <div className="charts-grid premium-charts-grid">

            {/* CHART 1: ATS SCORE DISTRIBUTION */}
            <div className="chart-card premium-chart-card">
              <div className="chart-title-row">
                <div>
                  <h3>ATS Score Distribution</h3>
                  <p>Resume compatibility breakdown</p>
                </div>
                <span className="chart-symbol blue">▥</span>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={scoreDistribution}
                  margin={{ top: 15, right: 10, left: -15, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,177,211,0.12)" />
                  <XAxis dataKey="range" tick={{ fill: "#9bb0ca", fontSize: 11 }} axisLine={{ stroke: "#29415e" }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: "#9bb0ca", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#10243b", border: "1px solid #29415e", borderRadius: "10px", color: "#ffffff" }} />
                  <Bar dataKey="count" name="Resumes" fill="#168cff" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* CHART 2: SKILL MATCH */}
            <div className="chart-card premium-chart-card">
              <div className="chart-title-row">
                <div>
                  <h3>Skill Match Overview</h3>
                  <p>Matched versus missing skills</p>
                </div>
                <span className="chart-symbol green">◎</span>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={skillData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={5}
                    label
                  >
                    {skillData.map((entry, index) => (
                      <Cell key={entry.name} fill={skillColors[index]} stroke="none" />
                    ))}
                  </Pie>

                  <Tooltip contentStyle={{ background: "#10243b", border: "1px solid #29415e", borderRadius: "10px", color: "#ffffff" }} />
                </PieChart>
              </ResponsiveContainer>

              <div className="chart-legend premium-legend">
                <span>
                  <i className="legend-dot matched-dot"></i>
                  Matched Skills
                </span>
                <span>
                  <i className="legend-dot missing-dot"></i>
                  Missing Skills
                </span>
              </div>
            </div>

            {/* CHART 3: PERFORMANCE TREND */}
            <div className="chart-card premium-chart-card">
              <div className="chart-title-row">
                <div>
                  <h3>Analysis Performance Trend</h3>
                  <p>ATS score across your analyses</p>
                </div>
                <span className="chart-symbol cyan">⌁</span>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,177,211,0.12)" />
                  <XAxis dataKey="name" tick={{ fill: "#9bb0ca", fontSize: 11 }} axisLine={{ stroke: "#29415e" }} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#9bb0ca", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.date || label}
                    contentStyle={{ background: "#10243b", border: "1px solid #29415e", borderRadius: "10px", color: "#ffffff" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="ATS Score"
                    stroke="#20baff"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#20baff", stroke: "#07111f", strokeWidth: 2 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* CHART 4: MISSING SKILLS */}
            <div className="chart-card premium-chart-card">
              <div className="chart-title-row">
                <div>
                  <h3>Frequently Missing Skills</h3>
                  <p>Skills that need more attention</p>
                </div>
                <span className="chart-symbol orange">↗</span>
              </div>

              {missingSkills.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={missingSkills} layout="vertical" margin={{ top: 10, right: 15, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,177,211,0.12)" />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: "#9bb0ca", fontSize: 11 }} axisLine={{ stroke: "#29415e" }} tickLine={false} />
                    <YAxis type="category" dataKey="skill" width={100} tick={{ fill: "#b5c8df", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#10243b", border: "1px solid #29415e", borderRadius: "10px", color: "#ffffff" }} />
                    <Bar dataKey="count" name="Missing count" fill="#ff9b55" radius={[0, 6, 6, 0]} maxBarSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="chart-empty">No missing skills recorded.</div>
              )}
            </div>
          </div>

          {/* ACTIVITY TIMELINE */}
          <div style={{ background: "#ffffff", border: "1px solid #dcebea", borderRadius: "16px", padding: "24px", marginTop: "28px", boxShadow: "0 4px 15px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "24px" }}>
              <div>
                <h3 style={{ margin: "0 0 6px", color: "#263238" }}>Resume Analysis Activity Timeline</h3>
                <p style={{ margin: 0, color: "#718096", fontSize: "14px" }}>Follow your recent resume analysis journey</p>
              </div>

              <span style={{ background: "#EFF7F6", color: "#287d91", padding: "7px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>
                Latest {Math.min(history.length, 8)} activities
              </span>
            </div>

            {history.length > 0 ? (
              <div style={{ position: "relative", paddingLeft: "12px" }}>
                {history.slice(0, 8).map((item, index) => {
                  const score = Number(item.match_score || 0);
                  const scoreColor = score >= 75 ? "#16a36a" : score >= 50 ? "#d18b20" : "#e05263";

                  return (
                    <div key={`timeline-${item.id}`} style={{ display: "flex", gap: "16px", position: "relative", paddingBottom: index === Math.min(history.length, 8) - 1 ? "0" : "24px" }}>
                      <div style={{ width: "16px", height: "16px", minWidth: "16px", borderRadius: "50%", background: "#7BDFF2", border: "3px solid #dff8fa", marginTop: "4px", zIndex: 1 }} />

                      {index !== Math.min(history.length, 8) - 1 && (
                        <div style={{ position: "absolute", left: "7px", top: "20px", bottom: "0", width: "2px", background: "#dcebea" }} />
                      )}

                      <div style={{ flex: 1, background: "#f8fcfc", border: "1px solid #e5f0ef", borderRadius: "12px", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ display: "block", color: "#263238", fontSize: "14px", overflowWrap: "anywhere" }}>
                            {item.filename || "Resume analysis"}
                          </strong>
                          <span style={{ display: "block", color: "#718096", fontSize: "12px", marginTop: "6px" }}>
                            {formatActivityDate(item.created_at)}
                          </span>
                          <span style={{ display: "inline-block", marginTop: "8px", color: "#287d91", fontSize: "12px", fontWeight: "600" }}>
                            ✓ Resume analyzed
                          </span>
                        </div>

                        <div style={{ textAlign: "center", background: "#ffffff", border: "1px solid #e5f0ef", borderRadius: "10px", padding: "9px 14px", minWidth: "85px" }}>
                          <strong style={{ display: "block", color: scoreColor, fontSize: "20px" }}>{score}%</strong>
                          <span style={{ fontSize: "11px", color: "#718096" }}>ATS Score</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: "#718096", textAlign: "center" }}>No activity available yet.</p>
            )}
          </div>

          {/* AI PERFORMANCE INSIGHTS */}
          <div style={{ marginTop: "28px", padding: "24px", background: "#ffffff", border: "1px solid #dcebea", borderRadius: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.04)" }}>
            <div style={{ marginBottom: "22px" }}>
              <h3 style={{ margin: "0 0 6px", color: "#263238" }}>AI Performance Insights</h3>
              <p style={{ margin: 0, color: "#718096", fontSize: "14px" }}>Personalized insights based on your resume analysis results</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
              <div style={{ padding: "18px", background: "#f8fcfc", borderRadius: "12px", border: "1px solid #e5f0ef" }}>
                <span style={{ fontSize: "13px", color: "#718096" }}>Performance Level</span>
                <h2 style={{ color: performanceColor, margin: "10px 0", fontSize: "25px" }}>{performanceLevel}</h2>
                <p style={{ color: "#718096", fontSize: "13px", margin: 0 }}>Based on your average ATS score of {averageScore}%</p>
              </div>

              <div style={{ padding: "18px", background: "#f8fcfc", borderRadius: "12px", border: "1px solid #e5f0ef" }}>
                <span style={{ fontSize: "13px", color: "#718096" }}>ATS Improvement Tip</span>
                <p style={{ color: "#263238", margin: "12px 0 0", fontSize: "14px", lineHeight: "1.6" }}>{improvementTip}</p>
              </div>

              <div style={{ padding: "18px", background: "#f8fcfc", borderRadius: "12px", border: "1px solid #e5f0ef" }}>
                <span style={{ fontSize: "13px", color: "#718096" }}>Skill Gap Alert</span>
                <h3 style={{ color: "#d18b20", margin: "10px 0", fontSize: "20px" }}>{topMissingSkill || "No major gaps"}</h3>
                <p style={{ color: "#718096", fontSize: "13px", margin: 0 }}>
                  {topMissingSkill
                    ? "Frequently missing skill. Consider adding relevant experience with this skill if you have it."
                    : "No frequently missing skills were reported."}
                </p>
              </div>

              <div style={{ padding: "18px", background: "#f8fcfc", borderRadius: "12px", border: "1px solid #e5f0ef" }}>
                <span style={{ fontSize: "13px", color: "#718096" }}>Your Progress</span>
                <h3 style={{ color: "#287d91", margin: "10px 0", fontSize: "20px" }}>{total} Analyses</h3>
                <p style={{ color: "#718096", fontSize: "13px", margin: 0 }}>{progressMessage}</p>
              </div>
            </div>
          </div>

          {/* RECENT ANALYSES */}
          <div className="dashboard-recent premium-recent">
            <div className="recent-heading">
              <div>
                <h3>Recent Resume Analyses</h3>
                <p>Your latest resume activity</p>
              </div>
              <span className="recent-count">{history.length} records</span>
            </div>

            {history.slice(0, 5).map((item) => (
              <div className="recent-item premium-recent-item" key={item.id}>
                <div className="recent-file-icon">PDF</div>
                <div className="recent-file-info">
                  <strong>{item.filename}</strong>
                  <span>{item.created_at}</span>
                </div>
                <div className="recent-score">
                  <strong>{item.match_score}%</strong>
                  <span>ATS Score</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default Dashboard;
