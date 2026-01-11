import express from 'express';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = join(__dirname, '..', 'data');
const SCORES_FILE = join(DATA_DIR, 'high_scores.json');

app.use(express.json());
app.use(express.static(join(__dirname, '..', 'public')));

interface HighScoreEntry {
  score: number;
  playerName: string;
  date: string;
  level: number;
}

async function ensureDataDir(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function loadHighScores(): Promise<HighScoreEntry[]> {
  try {
    await ensureDataDir();
    if (!existsSync(SCORES_FILE)) {
      return [];
    }
    const data = await readFile(SCORES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveHighScores(scores: HighScoreEntry[]): Promise<void> {
  await ensureDataDir();
  await writeFile(SCORES_FILE, JSON.stringify(scores, null, 2));
}

app.get('/api/scores', async (_req, res) => {
  try {
    const scores = await loadHighScores();
    res.json({ success: true, scores });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load high scores'
    });
  }
});

app.post('/api/scores', async (req, res) => {
  try {
    const { score, playerName, level } = req.body;

    if (typeof score !== 'number' || !playerName || typeof level !== 'number') {
      res.status(400).json({
        success: false,
        error: 'Invalid score data'
      });
      return;
    }

    const scores = await loadHighScores();

    const newEntry: HighScoreEntry = {
      score,
      playerName: playerName.substring(0, 20),
      date: new Date().toISOString(),
      level
    };

    scores.push(newEntry);
    scores.sort((a, b) => b.score - a.score);

    const maxEntries = 10;
    const trimmedScores = scores.slice(0, maxEntries);

    await saveHighScores(trimmedScores);

    const isHighScore = trimmedScores.includes(newEntry);
    const rank = isHighScore ? trimmedScores.indexOf(newEntry) + 1 : null;

    res.json({
      success: true,
      isHighScore,
      rank,
      scores: trimmedScores
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to save high score'
    });
  }
});

app.delete('/api/scores', async (_req, res) => {
  try {
    await saveHighScores([]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear scores'
    });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🎮 Asterix game server running on http://localhost:${PORT}`);
  console.log(`📊 High scores stored at: ${SCORES_FILE}`);
});
