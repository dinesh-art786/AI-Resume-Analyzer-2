
import React, { useState } from "react";
import "./Hero3D.css";

function Hero3D() {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setRotation({
      x: (0.5 - y) * 10,
      y: (x - 0.5) * 12,
    });
  };

  const resetRotation = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div
      className="hero3d-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={resetRotation}
    >
      <div className="hero3d-glow"></div>
      <div className="hero3d-orb"></div>

      <div
        className="hero3d-document"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        }}
      >
        <div className="resume-top">
          <div className="resume-avatar"></div>
          <div>
            <div className="resume-name"></div>
            <div className="resume-role"></div>
          </div>
        </div>

        <div className="resume-line long"></div>
        <div className="resume-line medium"></div>

        <div className="resume-heading">PROFESSIONAL SUMMARY</div>
        <div className="resume-line long"></div>
        <div className="resume-line long"></div>
        <div className="resume-line short"></div>

        <div className="resume-heading">SKILLS</div>
        <div className="resume-skills">
          <span>Python</span>
          <span>React</span>
          <span>SQL</span>
        </div>

        <div className="resume-heading">EXPERIENCE</div>
        <div className="resume-line long"></div>
        <div className="resume-line medium"></div>

        <div className="resume-score">
          <div className="score-icon">✓</div>
          <div>
            <strong>86%</strong>
            <small>ATS MATCH SCORE</small>
          </div>
        </div>
      </div>

      <div className="hero3d-floating-dot"></div>
      <div className="hero3d-shadow"></div>
    </div>
  );
}

export default Hero3D;
