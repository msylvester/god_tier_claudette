import { Game } from '../src/game/Game';

let game: Game;

async function loadHighScores(): Promise<void> {
  const container = document.getElementById('scoresContainer');
  if (!container) return;

  try {
    const response = await fetch('/api/scores');
    const data = await response.json();

    if (data.success && data.scores.length > 0) {
      const scoreList = document.createElement('ul');
      scoreList.className = 'score-list';

      data.scores.forEach((entry: any, index: number) => {
        const li = document.createElement('li');
        li.innerHTML = `
          <span class="score-rank">#${index + 1}</span>
          <span class="score-name">${entry.playerName}</span>
          <span class="score-value">${entry.score.toLocaleString()}</span>
        `;
        scoreList.appendChild(li);
      });

      container.innerHTML = '';
      container.appendChild(scoreList);
    } else {
      container.innerHTML = '<p class="loading">No high scores yet. Be the first!</p>';
    }
  } catch (error) {
    container.innerHTML = '<p class="loading">Failed to load high scores</p>';
  }
}

function initGame(): void {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas not found');
    return;
  }

  game = new Game(canvas);

  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const resetBtn = document.getElementById('resetBtn');
  const refreshScoresBtn = document.getElementById('refreshScoresBtn');

  startBtn?.addEventListener('click', () => {
    game.start();
  });

  pauseBtn?.addEventListener('click', () => {
    game.pause();
  });

  resetBtn?.addEventListener('click', () => {
    game.reset();
    game.start();
  });

  refreshScoresBtn?.addEventListener('click', () => {
    loadHighScores();
  });

  loadHighScores();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}
