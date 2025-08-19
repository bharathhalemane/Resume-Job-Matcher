import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import OpenAI from "openai";
import pdfParse from "pdf-parse";
import bodyParser from "body-parser"

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

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
        Analyze the resume and job description and return STRICT JSON with exactly these keys:
        {
            "match_percentage" : <integer 0-100>,
            "strengths" : [<strings> , ...],
            "missing_skills" : [<string>, ...],
            "improvement_tips" : [<string>, ...]
        }
        
        - No markdown, no extra keys, no commentary outside JSON.
        
        Resume:
        ${resumeText}

        Job Description:
        ${jobDescription}
        `;

        // Send to OpenAI
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.2
        });

        // Send response to frontend
        const content = response.choices[0]?.message?.content ?? "{}";
        const parsed = JSON.parse(content);

        // Delete uploaded file
        fs.unlinkSync(req.file.path);

        return res.json(parsed);
        

    } catch (error) {
        console.error(error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(500).json({ error: "Error processing request" });
    }
});

app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{
                role: "user",
                content: `
                    Answer as a clean step-by-step text.
                    - Use plain numbers (1, 2, 3...) instead of * or markdown.
                    - Each point must be on a new line.
                    - No extra symbols.
                    User asked: ${message}
                ` }],
            temperature: 0.7
        });

        res.json({ reply: response.choices[0].message.content });
    } catch (error) {
        res.status(500).send("Error fetching chatbot response");
    }
    
});

app.listen(5000, () => console.log("Backend running on port 5000"));
