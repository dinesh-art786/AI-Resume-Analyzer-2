
import React from "react";

function ScoreCard({ score }) {
  return (
    <div className="score-card">
      <h3>ATS Compatibility Score</h3>

      <div className="score-circle">
        <span>{score}%</span>
      </div>

      <p>
        {score >= 75
          ? "Excellent Match!"
          : score >= 50
          ? "Good Match! Needs Improvement."
          : "Your resume needs improvement."}
      </p>
    </div>
  );
}

export default ScoreCard;
