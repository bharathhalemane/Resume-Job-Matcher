import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import OpenAI from "openai";
import pdfParse from "pdf-parse";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post("/match", upload.single("resume"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No resume file uploaded");
        }


        // Read resume PDF
        const resumeBuffer = fs.readFileSync(req.file.path);
        const resumeData = await pdfParse(resumeBuffer);
        const resumeText = resumeData.text;

        const { jobDescription } = req.body;
        if (!jobDescription) {
            return res.status(400).send("Job Description is required");
        }

        // Create prompt
        const prompt = `
        Compare the following resume and job description.
        Provide:
        1. Match percentage
        2. Key strengths
        3. Missing skills
        4. Resume improvement tips

        Resume:
        ${resumeText}

        Job Description:
        ${jobDescription}
        `;

        // Send to OpenAI
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }]
        });

        // Delete uploaded file
        fs.unlinkSync(req.file.path);

        // Send response to frontend
        res.json({ result: response.choices[0].message.content });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error processing request");
    }
});

app.listen(5000, () => console.log("Backend running on port 5000"));
