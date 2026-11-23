
import React, { useEffect, useRef } from "react";

const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');

.cinematic {
  --bg: #080b12;
  --panel: #101725;
  --text: #f5f7ff;
  --muted: #9ba8bd;
  --cyan: #50e5dc;
  --purple: #9b83ff;
  background: var(--bg);
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
  overflow: hidden;
}

.cinematic * { box-sizing: border-box; }

.cinematic h1,
.cinematic h2,
.cinematic h3 {
  font-family: 'Space Grotesk', sans-serif;
  margin: 0;
}

.cinematic .scene {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  padding: 100px 8%;
  isolation: isolate;
}

.cinematic .scene-inner {
  width: 100%;
  max-width: 1250px;
  margin: auto;
  position: relative;
  z-index: 2;
}

.cinematic .eyebrow {
  color: var(--cyan);
  text-transform: uppercase;
  letter-spacing: 3px;
  font-size: 11px;
  font-weight: 800;
  margin-bottom: 22px;
}

.cinematic .gradient-text {
  background: linear-gradient(100deg, #ffffff, #65e9df 55%, #a58cff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.cinematic .muted { color: var(--muted); }

.cinematic .scene-one {
  background:
    radial-gradient(ellipse at 75% 40%, #153b4b 0%, transparent 35%),
    radial-gradient(ellipse at 20% 90%, #28204b 0%, transparent 40%),
    var(--bg);
}

.cinematic .scene-one::before,
.cinematic .scene-two::before,
.cinematic .scene-three::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: .2;
  background-image:
    linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
  background-size: 55px 55px;
  mask-image: linear-gradient(to bottom, black, transparent);
}

.cinematic .hero-grid {
  display: grid;
  grid-template-columns: 1.1fr .9fr;
  gap: 65px;
  align-items: center;
}

.cinematic .hero-title {
  font-size: clamp(48px, 6.8vw, 88px);
  line-height: .99;
  letter-spacing: -5px;
  max-width: 720px;
  margin-bottom: 28px;
}

.cinematic .hero-description {
  max-width: 520px;
  font-size: 17px;
  line-height: 1.8;
  color: var(--muted);
}

.cinematic .hero-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 35px;
  flex-wrap: wrap;
}

.cinematic .primary-button {
  border: 0;
  border-radius: 9px;
  padding: 15px 23px;
  color: #071313;
  background: linear-gradient(110deg, #50e5dc, #9b83ff);
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  transition: transform .25s, box-shadow .25s;
}

.cinematic .primary-button:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 35px #50e5dc35;
}

.cinematic .secondary-button {
  border: 1px solid #ffffff30;
  border-radius: 9px;
  padding: 14px 21px;
  color: white;
  background: transparent;
  font-weight: 600;
  cursor: pointer;
}

.cinematic .hero-note {
  color: #8290a5;
  font-size: 12px;
  margin-top: 22px;
}

.cinematic .resume-stage {
  min-height: 440px;
  position: relative;
  display: grid;
  place-items: center;
  perspective: 1000px;
}

.cinematic .resume-card {
  width: min(300px, 80%);
  min-height: 370px;
  background: linear-gradient(145deg, #182335, #0c111c);
  border: 1px solid #ffffff28;
  border-radius: 15px;
  padding: 30px;
  transform: rotateY(-13deg) rotateX(5deg);
  box-shadow: 0 35px 100px #000b, 0 0 55px #50e5dc16;
  animation: resumeFloat 5s ease-in-out infinite;
  position: relative;
  z-index: 2;
}

.cinematic .resume-heading {
  font-size: 25px;
  font-weight: 800;
  margin-bottom: 7px;
}

.cinematic .resume-sub {
  font-size: 10px;
  color: var(--cyan);
  letter-spacing: 2px;
}

.cinematic .resume-line {
  height: 6px;
  border-radius: 10px;
  background: #65758d38;
  margin-top: 17px;
}

.cinematic .resume-line.short { width: 50%; }
.cinematic .resume-line.medium { width: 75%; }

.cinematic .resume-section {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #a8b8d0;
  margin-top: 28px;
}

.cinematic .floating-chip {
  position: absolute;
  z-index: 3;
  background: #172638e8;
  border: 1px solid #50e5dc55;
  border-radius: 10px;
  padding: 13px 17px;
  color: #dffefa;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 15px 40px #0008;
  animation: chipFloat 4s ease-in-out infinite;
}

.cinematic .chip-one { top: 12%; right: 0; }
.cinematic .chip-two { bottom: 14%; left: 0; animation-delay: -2s; }

.cinematic .orb {
  position: absolute;
  width: 340px;
  height: 340px;
  border-radius: 50%;
  background: #50e5dc;
  opacity: .08;
  filter: blur(85px);
}

.cinematic .scroll-cue {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  color: #8290a5;
  font-size: 11px;
  letter-spacing: 3px;
  text-transform: uppercase;
}

.cinematic .scene-two {
  background:
    radial-gradient(ellipse at 15% 45%, #26305a 0%, transparent 40%),
    #0b101a;
}

.cinematic .section-title {
  font-size: clamp(38px, 5vw, 64px);
  letter-spacing: -3px;
  line-height: 1.08;
  margin-bottom: 20px;
}

.cinematic .section-description {
  color: var(--muted);
  line-height: 1.8;
  max-width: 650px;
  font-size: 16px;
}

.cinematic .analysis-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 65px;
  align-items: center;
  margin-top: 55px;
}

.cinematic .analysis-window {
  background: #111a29;
  border: 1px solid #ffffff1a;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 30px 80px #0005;
  position: relative;
  overflow: hidden;
}

.cinematic .window-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #ffffff15;
  font-size: 12px;
  color: #aab7ca;
}

.cinematic .window-dots {
  display: flex;
  gap: 6px;
}

.cinematic .window-dots span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #607087;
}

.cinematic .document-preview {
  padding: 25px 12px;
  position: relative;
}

.cinematic .scan-line {
  height: 2px;
  position: absolute;
  left: 0;
  right: 0;
  top: 20px;
  background: var(--cyan);
  box-shadow: 0 0 15px var(--cyan);
  animation: scan 4s ease-in-out infinite;
  z-index: 2;
}

.cinematic .document-preview .resume-line {
  margin-top: 16px;
  background: #63748c38;
}

.cinematic .detected {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid #ffffff10;
  font-size: 13px;
}

.cinematic .detected strong { color: var(--cyan); }

.cinematic .analysis-features {
  display: grid;
  gap: 25px;
  margin-top: 32px;
}

.cinematic .feature {
  display: flex;
  gap: 17px;
  align-items: flex-start;
}

.cinematic .feature-icon {
  width: 43px;
  height: 43px;
  flex-shrink: 0;
  border-radius: 11px;
  display: grid;
  place-items: center;
  color: var(--cyan);
  background: #50e5dc12;
  border: 1px solid #50e5dc28;
  font-size: 19px;
}

.cinematic .feature h3 {
  font-size: 17px;
  margin-bottom: 7px;
}

.cinematic .feature p {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.7;
  margin: 0;
}

.cinematic .scene-three {
  background:
    radial-gradient(ellipse at 80% 20%, #29214d 0%, transparent 40%),
    radial-gradient(ellipse at 10% 80%, #123b42 0%, transparent 35%),
    #080b12;
}

.cinematic .results-header {
  display: flex;
  justify-content: space-between;
  gap: 25px;
  align-items: flex-end;
  margin-bottom: 45px;
}

.cinematic .results-grid {
  display: grid;
  grid-template-columns: .8fr 1.2fr;
  gap: 22px;
}

.cinematic .result-card {
  background: linear-gradient(145deg, #151e2d, #0e1521);
  border: 1px solid #ffffff18;
  border-radius: 15px;
  padding: 26px;
  box-shadow: 0 20px 50px #0003;
}

.cinematic .score-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 280px;
}

.cinematic .score-ring {
  width: 170px;
  height: 170px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: conic-gradient(var(--cyan) 0 87%, #ffffff13 87% 100%);
  position: relative;
  margin: 20px 0;
  animation: scoreReveal 2s ease-out both;
}

.cinematic .score-ring::before {
  content: "";
  position: absolute;
  inset: 11px;
  border-radius: 50%;
  background: #111a29;
}

.cinematic .score-value {
  position: relative;
  font-size: 47px;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
}

.cinematic .score-value small {
  font-size: 17px;
  color: var(--muted);
}

.cinematic .score-label {
  color: var(--cyan);
  font-size: 12px;
  letter-spacing: 2px;
  font-weight: 800;
}

.cinematic .skill-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
}

.cinematic .skill-title {
  font-size: 14px;
  margin-bottom: 20px;
}

.cinematic .skill-tag {
  display: inline-block;
  margin: 0 6px 9px 0;
  border-radius: 7px;
  padding: 8px 11px;
  font-size: 11px;
  font-weight: 700;
}

.cinematic .skill-tag.good {
  background: #50e5dc15;
  border: 1px solid #50e5dc35;
  color: #75eee5;
}

.cinematic .skill-tag.missing {
  background: #ffb86b12;
  border: 1px solid #ffb86b35;
  color: #ffc58b;
}

.cinematic .recommendation {
  margin-top: 22px;
  padding: 19px;
  border-radius: 10px;
  background: #9b83ff10;
  border: 1px solid #9b83ff30;
}

.cinematic .recommendation h3 {
  font-size: 14px;
  color: #b6a4ff;
  margin-bottom: 8px;
}

.cinematic .recommendation p {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.7;
  margin: 0;
}

.cinematic .closing {
  text-align: center;
  margin-top: 65px;
}

.cinematic .closing h2 {
  font-size: clamp(32px, 4.5vw, 54px);
  letter-spacing: -2px;
  margin-bottom: 16px;
}

.cinematic .closing p {
  color: var(--muted);
  line-height: 1.7;
  margin-bottom: 25px;
}

.cinematic .reveal {
  opacity: 0;
  transform: translateY(35px);
  transition: opacity .8s ease, transform .8s ease;
}

.cinematic .reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

.cinematic .page-indicator {
  position: fixed;
  right: 25px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 20;
  display: grid;
  gap: 12px;
}

.cinematic .page-indicator a {
  width: 8px;
  height: 8px;
  border-radius: 20px;
  background: #ffffff40;
  transition: .3s;
  cursor: pointer;
}

.cinematic .page-indicator a.active {
  height: 28px;
  background: var(--cyan);
}

@keyframes resumeFloat {
  0%, 100% { transform: translateY(0) rotateY(-13deg) rotateX(5deg); }
  50% { transform: translateY(-18px) rotateY(-8deg) rotateX(2deg); }
}

@keyframes chipFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-13px); }
}

@keyframes scan {
  0% { top: 10px; opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { top: 95%; opacity: 0; }
}

@keyframes scoreReveal {
  from { transform: rotate(-90deg) scale(.8); }
  to { transform: rotate(0) scale(1); }
}

@media (max-width: 850px) {
  .cinematic .scene { padding: 85px 6%; }
  .cinematic .hero-grid,
  .cinematic .analysis-grid,
  .cinematic .results-grid {
    grid-template-columns: 1fr;
  }
  .cinematic .hero-grid { gap: 25px; }
  .cinematic .resume-stage { min-height: 390px; }
  .cinematic .analysis-grid { gap: 30px; }
  .cinematic .results-header { align-items: flex-start; flex-direction: column; }
}

@media (max-width: 550px) {
  .cinematic .hero-title { letter-spacing: -2px; }
  .cinematic .skill-columns { grid-template-columns: 1fr; }
  .cinematic .page-indicator { right: 10px; }
  .cinematic .scene { padding: 75px 22px; }
  .cinematic .analysis-window { padding: 17px; }
  .cinematic .resume-card { width: 250px; }
}
`;

export default function CinematicExperience() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const elements = root.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((element) => observer.observe(element));

    const sections = root.querySelectorAll(".scene");
    const links = root.querySelectorAll(".page-indicator a");

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(sections).indexOf(entry.target);
            links.forEach((link, i) => {
              link.classList.toggle("active", i === index);
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach((section) => sectionObserver.observe(section));

    return () => {
      observer.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  const scrollToSection = (id) => {
    rootRef.current?.querySelector(`#${id}`)?.scrollIntoView({
      behavior: "smooth"
    });
  };

  return (
    <div className="cinematic" ref={rootRef}>
      <style>{styles}</style>

      <nav className="page-indicator" aria-label="Page navigation">
        <a className="active" aria-label="Introduction"
          onClick={() => scrollToSection("cinematic-intro")} />
        <a aria-label="AI analysis"
          onClick={() => scrollToSection("cinematic-analysis")} />
        <a aria-label="Results"
          onClick={() => scrollToSection("cinematic-results")} />
      </nav>

      {/* PAGE 1: INTRODUCTION */}

      <section className="scene scene-one" id="cinematic-intro">
        <div className="orb" />

        <div className="scene-inner hero-grid">
          <div className="reveal">
            <div className="eyebrow">The future of resume intelligence</div>

            <h1 className="hero-title">
              Your career.
              <br />
              <span className="gradient-text">Decoded.</span>
            </h1>

            <p className="hero-description">
              Your resume is more than a document. It is your professional
              story. Discover how intelligent analysis can help you make
              every opportunity count.
            </p>

            <div className="hero-actions">
              <button
                className="primary-button"
                onClick={() => scrollToSection("cinematic-analysis")}
              >
                Explore the experience →
              </button>

              <button
                className="secondary-button"
                onClick={() => scrollToSection("cinematic-results")}
              >
                See the results
              </button>
            </div>

            <div className="hero-note">
              INTELLIGENT ANALYSIS · SKILL MATCHING · CAREER INSIGHTS
            </div>
          </div>

          <div className="resume-stage reveal">
            <div className="orb" />

            <div className="resume-card">
              <div className="resume-heading">YOUR NAME</div>
              <div className="resume-sub">SOFTWARE PROFESSIONAL</div>

              <div className="resume-section">PROFILE</div>
              <div className="resume-line" />
              <div className="resume-line medium" />
              <div className="resume-line short" />

              <div className="resume-section">EXPERIENCE</div>
              <div className="resume-line" />
              <div className="resume-line medium" />
              <div className="resume-line" />

              <div className="resume-section">TECHNICAL SKILLS</div>
              <div className="resume-line medium" />
              <div className="resume-line short" />
            </div>

            <div className="floating-chip chip-one">
              ✦ AI Resume Intelligence
            </div>

            <div className="floating-chip chip-two">
              ✓ Profile detected
            </div>
          </div>
        </div>

        <div className="scroll-cue">Scroll to explore ↓</div>
      </section>

      {/* PAGE 2: AI ANALYSIS */}

      <section className="scene scene-two" id="cinematic-analysis">
        <div className="scene-inner">
          <div className="reveal">
            <div className="eyebrow">Behind the intelligence</div>

            <h2 className="section-title">
              Every detail matters.
              <br />
              <span className="gradient-text">Every skill counts.</span>
            </h2>

            <p className="section-description">
              Transform an ordinary resume into meaningful career insights.
              Our analysis experience examines your professional profile
              and compares it with your target job description.
            </p>
          </div>

          <div className="analysis-grid">
            <div className="analysis-window reveal">
              <div className="window-top">
                <span>RESUME ANALYSIS ENGINE</span>
                <div className="window-dots">
                  <span /><span /><span />
                </div>
              </div>

              <div className="document-preview">
                <div className="scan-line" />

                <div className="resume-heading">Professional Profile</div>
                <div className="resume-line" />
                <div className="resume-line medium" />
                <div className="resume-line short" />

                <div className="resume-section">WORK EXPERIENCE</div>
                <div className="resume-line" />
                <div className="resume-line medium" />
                <div className="resume-line" />

                <div className="resume-section">TECHNICAL SKILLS</div>
                <div className="resume-line medium" />
                <div className="resume-line short" />
              </div>

              <div className="detected">
                <span>Skills identified</span>
                <strong>✓ Detected</strong>
              </div>
              <div className="detected">
                <span>Job description comparison</span>
                <strong>✓ Compared</strong>
              </div>
              <div className="detected">
                <span>Improvement opportunities</span>
                <strong>✓ Generated</strong>
              </div>
            </div>

            <div className="analysis-features reveal">
              <div className="feature">
                <div className="feature-icon">⌕</div>
                <div>
                  <h3>Intelligent text analysis</h3>
                  <p>
                    Extract meaningful information from PDF and DOCX
                    resumes to understand a candidate's profile.
                  </p>
                </div>
              </div>

              <div className="feature">
                <div className="feature-icon">◈</div>
                <div>
                  <h3>Skill matching</h3>
                  <p>
                    Compare resume content against job requirements
                    to identify matched and missing skills.
                  </p>
                </div>
              </div>

              <div className="feature">
                <div className="feature-icon">✧</div>
                <div>
                  <h3>Actionable recommendations</h3>
                  <p>
                    Highlight areas that candidates can improve
                    to make their resumes more relevant.
                  </p>
                </div>
              </div>

              <div className="feature">
                <div className="feature-icon">▥</div>
                <div>
                  <h3>Data-driven insights</h3>
                  <p>
                    Present analysis results through scores,
                    dashboards and historical reports.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PAGE 3: RESULTS */}

      <section className="scene scene-three" id="cinematic-results">
        <div className="scene-inner">
          <div className="results-header reveal">
            <div>
              <div className="eyebrow">The result of intelligence</div>

              <h2 className="section-title">
                From information
                <br />
                to <span className="gradient-text">opportunity.</span>
              </h2>

              <p className="section-description">
                A clear view of where your resume stands and
                what you can improve next.
              </p>
            </div>
          </div>

          <div className="results-grid">
            <div className="result-card score-card reveal">
              <div className="muted">ILLUSTRATIVE ATS MATCH SCORE</div>

              <div className="score-ring">
                <div className="score-value">
                  87<small>%</small>
                </div>
              </div>

              <div className="score-label">STRONG MATCH</div>
              <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
                Example analysis visualization
              </p>
            </div>

            <div className="result-card reveal">
              <div className="skill-columns">
                <div>
                  <h3 className="skill-title">
                    <span style={{ color: "#75eee5" }}>✓</span> Matched skills
                  </h3>

                  {["Python", "React", "SQL", "FastAPI", "Git", "Data Analysis"].map(
                    (skill) => (
                      <span className="skill-tag good" key={skill}>
                        {skill}
                      </span>
                    )
                  )}
                </div>

                <div>
                  <h3 className="skill-title">
                    <span style={{ color: "#ffc58b" }}>＋</span> Skills to improve
                  </h3>

                  {["Docker", "AWS", "Testing", "Kubernetes"].map(
                    (skill) => (
                      <span className="skill-tag missing" key={skill}>
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="recommendation">
                <h3>✧ Improvement insight</h3>
                <p>
                  Consider adding relevant project experience,
                  measurable achievements and evidence of the
                  technical skills required by your target role.
                </p>
              </div>
            </div>
          </div>

          <div className="closing reveal">
            <h2>
              Build a stronger
              <span className="gradient-text"> professional story.</span>
            </h2>

            <p>
              Understand your strengths. Discover opportunities.
              Take the next step in your career.
            </p>

            <button
              className="primary-button"
              onClick={() => scrollToSection("cinematic-intro")}
            >
              Explore again ↑
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
