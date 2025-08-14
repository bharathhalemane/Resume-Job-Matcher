import React, { useState } from 'react';
import axios from 'axios';
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
            const response = await axios.post("http://localhost:5000/match", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setResult(response.data.result);
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
                    {result}
                </div>
            )}
        </div>
    );
}

export default ResumeMatcher;