import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post('/api/generate-logo', async (req, res) => {
    try {
      const { description } = req.body;
      if (!description) {
        return res.status(400).json({ error: 'Description is required' });
      }

      const prompt = `You are an expert vector graphic designer. Create a clean, modern, and minimalist SVG logo based on the company description provided below.

Company Description: "${description}"

IMPORTANT CONSTRAINTS:
1. Respond ONLY with the raw <svg>...</svg> code.
2. Do NOT wrap in markdown blocks like \`\`\`svg or \`\`\`html.
3. The SVG must be fully self-contained with no external dependencies (no external fonts or images).
4. Use a viewBox of "0 0 500 500".
5. Use modern color palettes, gradients, and aesthetic layouts.
6. The SVG should be valid and well-formed. Do not add any text before or after the SVG tag.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });

      let svgCode = response.text || '';
      
      // Clean up any potential markdown formatting just in case the model ignores the instruction
      if (svgCode.startsWith('```svg')) {
        svgCode = svgCode.replace(/^```svg\n/, '').replace(/\n```$/, '');
      } else if (svgCode.startsWith('```html')) {
        svgCode = svgCode.replace(/^```html\n/, '').replace(/\n```$/, '');
      } else if (svgCode.startsWith('```')) {
        svgCode = svgCode.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      res.json({ svg: svgCode });
    } catch (error) {
      console.error('Error generating logo:', error);
      res.status(500).json({ error: 'Failed to generate logo' });
    }
  });

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
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
