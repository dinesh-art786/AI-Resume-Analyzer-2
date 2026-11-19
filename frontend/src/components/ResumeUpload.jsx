
import React, { useState } from "react";

function ResumeUpload({ onAnalyze, loading }) {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!file) {
      alert("Please upload your resume!");
      return;
    }

    if (!jobDescription.trim()) {
      alert("Please enter a job description!");
      return;
    }

    onAnalyze(file, jobDescription);
  }

  return (
    <section className="upload-section" id="analyzer">
      <h2>Analyze Your Resume</h2>

      <p>
        Upload your resume and compare it with your desired job.
      </p>

      <form onSubmit={handleSubmit}>
        <label className="upload-box">
          <span className="upload-icon">📄</span>
          <h3>Upload Your Resume</h3>
          <p>Choose your PDF or DOCX file</p>

          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>

        {file && (
          <p className="file-name">
            Selected file: {file.name}
          </p>
        )}

        <label className="input-label">
          Job Description
        </label>

        <textarea
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={6}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
      </form>
    </section>
  );
}

export default ResumeUpload;
