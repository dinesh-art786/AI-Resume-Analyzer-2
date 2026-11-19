
import React from "react";
import jsPDF from "jspdf";
import ScoreCard from "./ScoreCard";

function AnalysisResult({ result }) {
    if (!result) return null;

    // DATA
    const quality = result.resume_quality || {};
    const qualityScore = quality.quality_score ?? 0;
    const qualityLevel = quality.quality_level || "Not Available";
    const qualityChecks = quality.checks || {};
    const qualityStrengths = quality.strengths || [];
    const qualityImprovements = quality.improvements || [];

    const strengthsWeaknesses = result.strengths_weaknesses || {};
    const resumeStrengths = strengthsWeaknesses.strengths || [];
    const resumeWeaknesses = strengthsWeaknesses.weaknesses || [];
    const priorityImprovements =
        strengthsWeaknesses.priority_improvements || [];

    const matchedSkills = result.matched_skills || [];
    const missingSkills = result.missing_skills || [];
    const suggestions = result.suggestions || [];

    const matchScore = Number(result.match_score) || 0;

    const getScoreLabel = (score) => {
        if (score >= 80) return "Excellent Match";
        if (score >= 60) return "Good Match";
        if (score >= 40) return "Needs Improvement";
        return "Low Match";
    };

    const getPriorityClass = (priority) => {
        const value = (priority || "medium").toLowerCase();

        if (value === "high") return "priority-high";
        if (value === "low") return "priority-low";

        return "priority-medium";
    };

    // PDF REPORT
    const downloadReport = () => {
        const pdf = new jsPDF("p", "mm", "a4");

        const pageWidth = 210;
        const margin = 18;
        const contentWidth = pageWidth - margin * 2;

        let y = 20;

        const colors = {
            navy: [38, 55, 70],
            blue: [65, 155, 190],
            lightBlue: [225, 246, 249],
            green: [220, 244, 232],
            gray: [100, 116, 129],
            white: [255, 255, 255]
        };

        const checkPage = (height = 15) => {
            if (y + height > 270) {
                pdf.addPage();
                y = 22;
            }
        };

        const addHeader = () => {
            pdf.setFillColor(...colors.navy);
            pdf.rect(0, 0, pageWidth, 38, "F");

            pdf.setTextColor(...colors.white);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(19);
            pdf.text("AI RESUME ANALYZER", margin, 17);

            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(10);
            pdf.text("Professional Resume Analysis Report", margin, 27);

            y = 49;
        };

        const addSection = (title) => {
            checkPage(20);

            pdf.setFillColor(...colors.lightBlue);
            pdf.roundedRect(
                margin, y - 5, contentWidth, 11, 2, 2, "F"
            );

            pdf.setTextColor(...colors.navy);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(12);
            pdf.text(title, margin + 4, y + 2);

            y += 15;
        };

        const addText = (text, bullet = false) => {
            const value = (bullet ? "- " : "") + String(text);

            const lines = pdf.splitTextToSize(
                value,
                contentWidth - 8
            );

            const height = lines.length * 6 + 3;
            checkPage(height);

            pdf.setTextColor(...colors.navy);
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(10);
            pdf.text(lines, margin + 4, y);

            y += height;
        };

        const addList = (title, items) => {
            addSection(title);

            if (!items || items.length === 0) {
                addText("None identified");
            } else {
                items.forEach((item) => addText(item, true));
            }

            y += 4;
        };

        // REPORT CONTENT
        addHeader();

        addSection("RESUME INFORMATION");
        addText(`Resume Name: ${result.filename || "Resume"}`);
        addText(`Analysis ID: ${result.analysis_id || "N/A"}`);

        addSection("ATS COMPATIBILITY");
        checkPage(35);

        pdf.setFillColor(...colors.lightBlue);
        pdf.roundedRect(margin, y - 3, contentWidth, 25, 3, 3, "F");

        pdf.setTextColor(...colors.navy);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text("ATS MATCH SCORE", margin + 5, y + 6);

        pdf.setFontSize(21);
        pdf.setTextColor(...colors.blue);
        pdf.text(
            `${matchScore}%`,
            pageWidth - margin - 5,
            y + 10,
            { align: "right" }
        );

        y += 32;

        addText(`Text Similarity: ${result.text_similarity ?? "N/A"}%`);
        addText(`Skill Coverage: ${result.skill_coverage ?? "N/A"}%`);

        addSection("JOB READINESS");
        checkPage(18);

        pdf.setFillColor(...colors.green);
        pdf.roundedRect(margin, y - 4, contentWidth, 13, 2, 2, "F");

        pdf.setTextColor(...colors.navy);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text(result.job_readiness || "Not Available", margin + 5, y + 4);

        y += 17;

        addSection("RESUME QUALITY");
        addText(`Quality Score: ${qualityScore}/100`);
        addText(`Quality Level: ${qualityLevel}`);

        Object.entries(qualityChecks).forEach(([name, passed]) => {
            addText(`${name}: ${passed ? "Passed" : "Needs Improvement"}`);
        });

        addList("QUALITY STRENGTHS", qualityStrengths);
        addList("QUALITY IMPROVEMENTS", qualityImprovements);

        addList("RESUME STRENGTHS", resumeStrengths);
        addList("RESUME WEAKNESSES", resumeWeaknesses);

        addSection("PRIORITY IMPROVEMENTS");

        if (priorityImprovements.length > 0) {
            priorityImprovements.forEach((item, index) => {
                addText(
                    `${index + 1}. ${item.priority || "Medium"} Priority - ${item.issue || "Improvement"}`
                );
                addText(
                    `Recommendation: ${item.recommendation || "Review this area."}`,
                    true
                );
            });
        } else {
            addText("No priority improvements identified.");
        }

        addList(
            "PRESENT RESUME SECTIONS",
            result.resume_sections?.present_sections
        );

        addList(
            "MISSING RESUME SECTIONS",
            result.resume_sections?.missing_sections
        );

        addList("MATCHED SKILLS", matchedSkills);
        addList("MISSING SKILLS", missingSkills);
        addList("STRONG ACTION VERBS", result.action_verbs || []);

        addSection("MEASURABLE ACHIEVEMENTS");

        addText(
            result.has_measurable_achievements
                ? "Measurable achievements were detected in your resume."
                : "No measurable achievements were detected."
        );

        addList("IMPROVEMENT SUGGESTIONS", suggestions);

        // FOOTER
        const totalPages = pdf.internal.getNumberOfPages();

        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);

            pdf.setDrawColor(220, 230, 235);
            pdf.line(margin, 283, pageWidth - margin, 283);

            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(8);
            pdf.setTextColor(...colors.gray);

            pdf.text("AI Resume Analyzer", margin, 289);
            pdf.text(
                `Page ${i} of ${totalPages}`,
                pageWidth - margin,
                289,
                { align: "right" }
            );
        }

        pdf.save("Professional_AI_Resume_Report.pdf");
    };

    return (
        <section className="result-section compact-results">

            {/* TOP HEADING */}
            <div className="compact-result-heading">
                <div>
                    <span className="section-tag">YOUR RESULTS</span>
                    <h2>Resume Analysis</h2>
                    <p>{result.filename || "Your uploaded resume"}</p>
                </div>

                <button
                    className="download-report-button"
                    onClick={downloadReport}
                    type="button"
                >
                    ↓ Download PDF
                </button>
            </div>

            {/* MAIN SCORE */}
            <div className="quick-score-card">
                <div className="quick-score-main">
                    <ScoreCard score={matchScore} />
                </div>

                <div className="quick-score-info">
                    <span className="quick-result-label">
                        JOB MATCH
                    </span>

                    <h3>{getScoreLabel(matchScore)}</h3>

                    <p>
                        {matchScore >= 80
                            ? "Your resume matches this job well. Keep strengthening it."
                            : matchScore >= 60
                            ? "Your resume has a good match. A few changes may help."
                            : matchScore >= 40
                            ? "Your resume needs some improvements for this job."
                            : "Your resume currently has a low match with this job."}
                    </p>

                    <div className="readiness-chip">
                        Job Readiness: {result.job_readiness || "Not Available"}
                    </div>
                </div>
            </div>

            {/* SKILL SUMMARY */}
            <div className="quick-stats-grid">
                <div className="quick-stat-card">
                    <span className="quick-stat-icon">✓</span>
                    <strong>{matchedSkills.length}</strong>
                    <span>Matching Skills</span>
                </div>

                <div className="quick-stat-card">
                    <span className="quick-stat-icon">!</span>
                    <strong>{missingSkills.length}</strong>
                    <span>Missing Skills</span>
                </div>

                <div className="quick-stat-card">
                    <span className="quick-stat-icon">★</span>
                    <strong>{qualityScore}/100</strong>
                    <span>Resume Quality</span>
                </div>
            </div>

            {/* MATCHED SKILLS */}
            <div className="quick-result-card">
                <h3>✓ Skills you already have</h3>

                {matchedSkills.length > 0 ? (
                    <div className="skill-tags">
                        {matchedSkills.slice(0, 8).map((skill, index) => (
                            <span className="skill-tag matched-tag" key={index}>
                                {skill}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p>No matching skills detected.</p>
                )}
            </div>

            {/* MISSING SKILLS */}
            <div className="quick-result-card">
                <h3>! Skills to check</h3>

                <p className="quick-card-description">
                    These skills appear in the job description but were not found
                    in your resume. Add them only if you genuinely have them.
                </p>

                {missingSkills.length > 0 ? (
                    <div className="skill-tags">
                        {missingSkills.slice(0, 8).map((skill, index) => (
                            <span className="skill-tag missing-tag" key={index}>
                                {skill}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p>Great! No missing skills detected.</p>
                )}

                {missingSkills.length > 8 && (
                    <p className="quick-card-description">
                        And {missingSkills.length - 8} more. See full details below.
                    </p>
                )}
            </div>

            {/* TOP IMPROVEMENTS */}
            <div className="quick-result-card">
                <h3>💡 What should you improve?</h3>

                {suggestions.length > 0 ? (
                    <ul className="quick-suggestions-list">
                        {suggestions.slice(0, 3).map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No additional suggestions available.</p>
                )}
            </div>

            {/* PRIORITY IMPROVEMENTS */}
            {priorityImprovements.length > 0 && (
                <div className="quick-result-card">
                    <h3>🚀 Important improvements</h3>

                    {priorityImprovements.slice(0, 3).map((item, index) => (
                        <div className="quick-priority-item" key={index}>
                            <div className="quick-priority-heading">
                                <strong>{item.issue}</strong>

                                <span className={`priority-badge ${getPriorityClass(item.priority)}`}>
                                    {item.priority || "Medium"}
                                </span>
                            </div>

                            <p>{item.recommendation}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* EXPANDABLE DETAILS */}
            <div className="additional-results">

                <h3>Want more details?</h3>
                <p>Open any section to see your complete analysis.</p>

                <details className="result-details">
                    <summary>Resume Quality Details</summary>

                    <div className="details-content">
                        <h4>{qualityScore}/100 — {qualityLevel}</h4>

                        <h4>Quality Checks</h4>

                        {Object.entries(qualityChecks).map(([name, passed]) => (
                            <p key={name}>
                                {passed ? "✓" : "!"} {name}:{" "}
                                {passed ? "Passed" : "Needs improvement"}
                            </p>
                        ))}

                        <h4>Quality Strengths</h4>
                        <ul>
                            {qualityStrengths.length > 0
                                ? qualityStrengths.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))
                                : <li>No strengths identified.</li>}
                        </ul>

                        <h4>Quality Improvements</h4>
                        <ul>
                            {qualityImprovements.length > 0
                                ? qualityImprovements.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))
                                : <li>No improvements identified.</li>}
                        </ul>
                    </div>
                </details>

                <details className="result-details">
                    <summary>Resume Strengths and Weaknesses</summary>

                    <div className="details-content">
                        <h4>Strengths</h4>
                        <ul>
                            {resumeStrengths.length > 0
                                ? resumeStrengths.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))
                                : <li>No strengths identified.</li>}
                        </ul>

                        <h4>Weaknesses</h4>
                        <ul>
                            {resumeWeaknesses.length > 0
                                ? resumeWeaknesses.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))
                                : <li>No major weaknesses detected.</li>}
                        </ul>
                    </div>
                </details>

                <details className="result-details">
                    <summary>All Matching and Missing Skills</summary>

                    <div className="details-content">
                        <h4>Matched Skills ({matchedSkills.length})</h4>
                        <ul>
                            {matchedSkills.length > 0
                                ? matchedSkills.map((skill, index) => (
                                    <li key={index}>{skill}</li>
                                ))
                                : <li>None detected.</li>}
                        </ul>

                        <h4>Missing Skills ({missingSkills.length})</h4>
                        <ul>
                            {missingSkills.length > 0
                                ? missingSkills.map((skill, index) => (
                                    <li key={index}>{skill}</li>
                                ))
                                : <li>None detected.</li>}
                        </ul>
                    </div>
                </details>

                <details className="result-details">
                    <summary>Resume Sections</summary>

                    <div className="details-content">
                        <h4>Present Sections</h4>
                        <ul>
                            {(result.resume_sections?.present_sections || []).map(
                                (item, index) => <li key={index}>{item}</li>
                            )}
                        </ul>

                        <h4>Missing Sections</h4>
                        <ul>
                            {(result.resume_sections?.missing_sections || []).map(
                                (item, index) => <li key={index}>{item}</li>
                            )}
                        </ul>
                    </div>
                </details>

                <details className="result-details">
                    <summary>Action Verbs and Achievements</summary>

                    <div className="details-content">
                        <h4>Strong Action Verbs</h4>
                        <ul>
                            {(result.action_verbs || []).map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>

                        <h4>Measurable Achievements</h4>
                        <p>
                            {result.has_measurable_achievements
                                ? "Measurable achievements were detected."
                                : "No measurable achievements were detected."}
                        </p>
                    </div>
                </details>

                <details className="result-details">
                    <summary>All Improvement Suggestions</summary>

                    <div className="details-content">
                        <ul>
                            {suggestions.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </details>

                <details className="result-details">
                    <summary>All Priority Improvements</summary>

                    <div className="details-content">
                        {priorityImprovements.length > 0
                            ? priorityImprovements.map((item, index) => (
                                <div key={index} className="quick-priority-item">
                                    <strong>
                                        {item.issue} — {item.priority || "Medium"}
                                    </strong>
                                    <p>{item.recommendation}</p>
                                </div>
                            ))
                            : <p>No priority improvements identified.</p>}
                    </div>
                </details>

            </div>

            <p className="analysis-id">
                Analysis ID: {result.analysis_id || "N/A"}
            </p>

        </section>
    );
}

export default AnalysisResult;
