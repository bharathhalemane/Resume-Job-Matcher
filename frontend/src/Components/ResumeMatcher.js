import React, { useState } from 'react';
import styles from './ResumeMatcher.module.css';

function ResumeMatcher() {
    const [resume, setResume] = useState(null);
    const [jobDescription, setJobDescription] = useState("");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setResume(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!resume || !jobDescription) {
            alert("Please upload a resume and enter job description");
        }

        const formData = new FormData();
        formData.append("resume", resume);
        formData.append("jobDescription", jobDescription);

        try {
            setLoading(true);
            const response = await fetch("http://localhost:5000/match", { method: "POST", body: formData });
            const json = await response.json();
            setResult(json);
        } catch (error) {
            console.error(error);
            setResult("Error matching resume and job description");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles["body"]}>
            <div className={styles["card"]}>
                <h1>Enter Here:</h1>
                <form onSubmit={handleSubmit}>
                    <div className={styles["file-card"]}>
                        <label className={styles["file-label"]}>Upload Resume (PDF):</label><br />
                        <input className={styles["file-input"]} type="file" accept='application/pdf' onChange={handleFileChange} /> <br /><br />
                    </div>

                    <label className={styles["desc-label"]}>Job Description:</label><br />
                    <textarea rows={5} cols={50} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} /> <br /> <br />

                    <button className={styles["submit-btn"]} type='submit' disabled={loading}>
                        {loading ? "Matching...." : "Match Resume"}
                    </button>
                </form>
            </div>

            {result && (
                <div className={styles["result"]}>
                    <h3>Results:</h3>
                    <div className={styles['metric']}>
                        <span>Match Percentage: </span>
                        <strong>{result.match_percentage}%</strong>
                    </div>
                    <Section title="1. Strengths" items={result.strengths} />
                    <Section title="2. Missing Skills" items={result.missing_skills} />
                    <Section title="3. Improvement Tips" items={result.improvement_tips}/>
                </div>
            )}
        </div>
    );
}

function Section({ title, items }) {
    if (!items || !items.length) return null;
    return (
        <div className={styles['section']}>
            <h3>{title}</h3>
            <ol>
                {items.map((t, i) => (<li key={i}>{t}</li>))}
            </ol>
        </div>
    )
}

export default ResumeMatcher;