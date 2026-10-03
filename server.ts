import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini if API key is present
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI with provided key:', err);
  }
}

// AI Visual Mentor endpoint
app.post('/api/mentor', async (req, res) => {
  const { question, topic, state, lang = 'ru' } = req.body;

  const systemPrompt = `You are the Interactive STEM Visual Mentor in "STEM Visualizer" (Mental Model Explorer).
Your key pedagogical philosophy:
- The user understands the textbook definition, but cannot picture what it means visually in 3D space.
- DO NOT produce long, dry textbook walls of text.
- Be concrete, vivid, and ALWAYS refer to the visual parameters currently on the screen.
- Say things like: "Notice the parameter ℓ on the right. When ℓ=0, the angular dependence vanishes, making it a sphere. Change ℓ to 1 to see the two opposite lobes with a nodal plane cutting through the nucleus."
- Speak in ${lang === 'ru' ? 'Russian' : 'English'}. Keep your answer under 120-150 words.
- Provide 1 actionable experiment the user can try with the sliders or buttons right now!`;

  const contextStr = `Current STEM Model: ${topic || 'Quantum Orbitals'}
Current Model State/Parameters: ${JSON.stringify(state || {})}
Student Question: ${question}`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `${systemPrompt}\n\n${contextStr}`,
      });
      return res.json({ answer: response.text });
    } catch (error: any) {
      console.error('Gemini API call failed, falling back to heuristic mentor response:', error);
    }
  }

  // Smart heuristic response tailored to the visual context
  let fallbackAnswer = '';
  if (lang === 'ru') {
    if (topic === 'orbitals') {
      fallbackAnswer = `Посмотри на квантовое число ℓ на панели справа. Сейчас ℓ = ${state?.l ?? 0}. Когда ℓ = 0 (s-орбиталь), угловой зависимости нет — волновая функция распределена одинаково во все стороны, поэтому получается идеальная сфера! Переключи ℓ на 1: появится узловая плоскость в центре ядра, а электронное облако разделится на две гантелевидные лопасти с противоположными фазами (+) и (-).`;
    } else if (topic === 'deconstruct_h2o') {
      fallbackAnswer = `Обрати внимание на шаг «Гибридизация и отталкивание». В молекуле воды кислород имеет sp³-гибридизацию с 4 электронными парами. Две из них — неподелённые (lone pairs), они сильнее отталкивают связывающие пары O–H, поэтому идеальный тетраэдрический угол 109.5° сжимается до 104.5°. Нажми шаг «Разбор на связи», чтобы увидеть перекрывание орбиталей!`;
    } else if (topic === 'gravity') {
      fallbackAnswer = `Взгляни на вектор силы F. Закон всемирного тяготения Ньютона квадратичен по расстоянию: F ~ 1 / r². Увеличь дистанцию в 2 раза с помощью ползунка — заметь, что стрелка силы станет не в 2, а ровно в 4 раза короче! Нажми режим «Сначала представь», чтобы проверить свою интуицию перед симуляцией.`;
    } else if (topic === 'revolution') {
      fallbackAnswer = `Посмотри на ось вращения X. Слева ты видишь 2D график f(x), а справа — трёхмерное тело вращения, собранное из бесконечно тонких цилиндрических дисков толщиной dx. Формула объёма V = π ∫ [f(x)]² dx — это просто сумма объёмов всех этих тонких дисков! Попробуй увеличить количество сечений n.`;
    } else if (topic === 'divergence') {
      fallbackAnswer = `Дивергенция ∇·F показывает, является ли точка «источником» (векторы выходят наружу, div > 0) или «стоком» (векторы втягиваются внутрь, div < 0). Подвигай пробную частицу в центр поля: если стрелки разлетаются во все стороны — в этой точке рождается поток!`;
    } else {
      fallbackAnswer = `Обрати внимание на параметры на панели управления. Измени ключевую величину и наблюдай, как пространственная 3D модель мгновенно перестраивается, отражая математический закон.`;
    }
  } else {
    fallbackAnswer = `Look at the parameter controls on the right. When you adjust the main values, observe how the 3D mental model shifts in real time. For orbitals, notice how changing ℓ from 0 to 1 introduces a nodal plane right through the nucleus!`;
  }

  return res.json({ answer: fallbackAnswer });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

startServer();
