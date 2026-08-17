import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialize Gemini SDK client
let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured');
    }
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// 1. Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 2. AI Summarization Endpoint
app.post('/api/gemini/summarize', async (req, res) => {
  try {
    const { videoTitle, courseName, type = 'detailed', contextText = '' } = req.body;
    const ai = getGenAI();

    let prompt = `You are an expert academic tutor in StudyVault.
Please provide a high quality educational study summary for the lecture: "${videoTitle}" from course: "${courseName}".
`;

    if (contextText) {
      prompt += `\nLecture Notes / Transcript / Context:\n${contextText.slice(0, 8000)}\n`;
    }

    if (type === 'quick') {
      prompt += `\nFormat as a concise 3-5 bullet point quick summary highlighting core principles, key definitions, and practical takeaways.`;
    } else if (type === 'revision') {
      prompt += `\nFormat as an Exam Revision Sheet with:
1. Core Definitions
2. Must-Know Formulas / Theorems / Code Snippets
3. Common Exam Traps & Misconceptions
4. Quick Memory Mnemonics`;
    } else if (type === 'oneminute') {
      prompt += `\nFormat as a crisp "One-Minute Executive Recap" (2-3 paragraphs maximum) explaining the exact 'what', 'why', and 'how' of this topic.`;
    } else {
      prompt += `\nFormat as a comprehensive Study Guide:
- 📌 Overview & Core Problem Statement
- 🔑 Fundamental Concepts & Mechanisms
- 💡 Step-by-Step Breakdown with Examples
- 🎯 Real-World Applications & Industry Use Cases
- 📝 Summary Checklist for Mastery`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        temperature: 0.6,
      },
    });

    res.json({ summary: response.text || 'No summary generated.' });
  } catch (error: any) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: error.message || 'Failed to generate AI summary' });
  }
});

// 3. AI Tutor Contextual Chat Endpoint
app.post('/api/gemini/tutor', async (req, res) => {
  try {
    const { message, videoTitle, courseName, history = [], contextText = '' } = req.body;
    const ai = getGenAI();

    let systemInstruction = `You are the personal AI Study Tutor embedded inside StudyVault 2.0.
The user is currently studying the lecture: "${videoTitle || 'Current Video'}" within course: "${courseName || 'Study Course'}".
`;
    if (contextText) {
      systemInstruction += `Lecture Context / Transcript snippet:\n${contextText.slice(0, 4000)}\n`;
    }
    systemInstruction += `\nBe friendly, pedagogical, clear, and concise. Provide clear code examples, mathematical explanations, or step-by-step logic when applicable. Use Markdown formatting.`;

    const chat = ai.chats.create({
      model: 'gemini-3.7-flash',
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const response = await chat.sendMessage({ message });
    res.json({ reply: response.text || 'No reply received.' });
  } catch (error: any) {
    console.error('Error in AI tutor chat:', error);
    res.status(500).json({ error: error.message || 'AI Tutor failed to respond' });
  }
});

// 4. AI Flashcard Deck Generator Endpoint
app.post('/api/gemini/flashcards', async (req, res) => {
  try {
    const { videoTitle, courseName, count = 6, contextText = '' } = req.body;
    const ai = getGenAI();

    const prompt = `Generate ${count} high-yield flashcards for studying the lecture "${videoTitle}" (${courseName}).
${contextText ? `Context:\n${contextText.slice(0, 5000)}\n` : ''}

Respond ONLY with valid JSON array of objects with the following schema:
[
  {
    "front": "Question or concept on the front of the card",
    "back": "Clear, concise answer or explanation on the back",
    "difficulty": "Easy" | "Medium" | "Hard",
    "topic": "Subtopic name"
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '[]';
    const flashcards = JSON.parse(text);
    res.json({ flashcards });
  } catch (error: any) {
    console.error('Error generating flashcards:', error);
    res.status(500).json({ error: error.message || 'Failed to generate flashcards' });
  }
});

// 5. AI Quiz Generator Endpoint
app.post('/api/gemini/quiz', async (req, res) => {
  try {
    const { videoTitle, courseName, count = 5, contextText = '' } = req.body;
    const ai = getGenAI();

    const prompt = `Create a ${count}-question interactive knowledge check quiz for the lecture "${videoTitle}" (${courseName}).
${contextText ? `Context:\n${contextText.slice(0, 5000)}\n` : ''}

Respond ONLY with valid JSON array of objects with this exact schema:
[
  {
    "question": "Clear question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Detailed explanation of why this answer is correct and why other choices are wrong",
    "topic": "Key concept tested"
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '[]';
    const quiz = JSON.parse(text);
    res.json({ quiz });
  } catch (error: any) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ error: error.message || 'Failed to generate quiz' });
  }
});

// 6. AI Chapter & Key Moments Extractor Endpoint
app.post('/api/gemini/chapters', async (req, res) => {
  try {
    const { videoTitle, courseName, durationSec = 1800, contextText = '' } = req.body;
    const ai = getGenAI();

    const prompt = `Generate a timestamped chapter outline for a lecture video titled "${videoTitle}" in course "${courseName}" with total duration ${durationSec} seconds.
${contextText ? `Context/Notes:\n${contextText.slice(0, 4000)}\n` : ''}

Respond ONLY with valid JSON array:
[
  {
    "time": 0,
    "title": "Introduction & Agenda",
    "summary": "Brief 1-sentence description"
  },
  {
    "time": 240,
    "title": "First Key Concept...",
    "summary": "Brief 1-sentence description"
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '[]';
    const chapters = JSON.parse(text);
    res.json({ chapters });
  } catch (error: any) {
    console.error('Error extracting chapters:', error);
    res.status(500).json({ error: error.message || 'Failed to generate chapters' });
  }
});

// 7. AI Semantic Concept Search Endpoint
app.post('/api/gemini/semantic-search', async (req, res) => {
  try {
    const { query, libraryList } = req.body;
    const ai = getGenAI();

    const prompt = `Given the user's natural language search query: "${query}", find the most relevant lectures from the provided library list.
Library items:
${JSON.stringify(libraryList?.slice(0, 50) || [], null, 2)}

Respond with valid JSON:
{
  "matches": [
    {
      "id": "video id",
      "relevanceScore": 0.95,
      "reason": "Why this video matches the concept"
    }
  ],
  "conceptExplanation": "Short 1-2 sentence explanation of the concept searched"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const result = JSON.parse(text);
    res.json(result);
  } catch (error: any) {
    console.error('Error during semantic search:', error);
    res.status(500).json({ error: error.message || 'Failed to perform semantic search' });
  }
});

// Setup Vite middleware for development and static serving for production
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyVault 2.0 fullstack server running on port ${PORT}`);
  });
}

start();
