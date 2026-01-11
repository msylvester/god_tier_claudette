import { Player } from './Player';
import { Enemy } from './Enemy';
import { Score, HighScoreManager } from './Score';
import type { GameConfig, EnemyType, Bounds } from './types';
import { DEFAULT_CONFIG } from './types';

export class Game {
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private enemies: Enemy[] = [];
  private score: Score;
  private highScoreManager: HighScoreManager;
  private config: GameConfig;
  private isRunning: boolean = false;
  private lastTime: number = 0;
  private level: number = 1;
  private enemySpawnTimer: number = 0;
  private groundLevel: number;
  private keys: Set<string> = new Set();

  constructor(canvas: HTMLCanvasElement, config: Partial<GameConfig> = {}) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = ctx;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.groundLevel = this.config.canvasHeight - 100;

    this.player = new Player(100, this.groundLevel - 48);
    this.score = new Score();
    this.highScoreManager = new HighScoreManager();

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key);

      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.player.position.y >= this.groundLevel - this.player.size.height) {
          this.player.jump(this.config.jumpStrength);
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key);
    });
  }

  private handleInput(): void {
    if (this.keys.has('ArrowLeft') || this.keys.has('a')) {
      this.player.moveLeft();
    } else if (this.keys.has('ArrowRight') || this.keys.has('d')) {
      this.player.moveRight();
    } else {
      this.player.stop();
    }

    if (this.player.position.x < 0) {
      this.player.position.x = 0;
    }
    if (this.player.position.x > this.config.canvasWidth - this.player.size.width) {
      this.player.position.x = this.config.canvasWidth - this.player.size.width;
    }
  }

  private spawnEnemy(): void {
    const types: EnemyType[] = ['roman', 'centurion', 'lion'];
    const type = types[Math.floor(Math.random() * types.length)];
    const enemy = new Enemy(
      this.config.canvasWidth,
      this.groundLevel - 40,
      type
    );
    this.enemies.push(enemy);
  }

  private checkCollision(a: Bounds, b: Bounds): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  private handleCollisions(): void {
    const playerBounds = this.player.getBounds();

    for (const enemy of this.enemies) {
      if (!enemy.active) continue;

      const enemyBounds = enemy.getBounds();
      if (this.checkCollision(playerBounds, enemyBounds)) {
        const isDead = this.player.takeDamage();
        if (isDead) {
          this.gameOver();
        }
        enemy.active = false;
      }
    }
  }

  private update(deltaTime: number): void {
    if (!this.isRunning) return;

    const dt = deltaTime / 16.67;

    this.handleInput();

    this.player.applyGravity(this.config.gravity);
    this.player.update(dt);

    if (this.player.position.y >= this.groundLevel - this.player.size.height) {
      this.player.position.y = this.groundLevel - this.player.size.height;
      this.player.land();
    }

    this.enemySpawnTimer += deltaTime;
    if (this.enemySpawnTimer > 2000) {
      this.spawnEnemy();
      this.enemySpawnTimer = 0;
    }

    for (const enemy of this.enemies) {
      enemy.update(dt);
    }

    this.enemies = this.enemies.filter(e => e.active);

    this.handleCollisions();

    this.score.addPoints(1, 'bonus');
  }

  private render(): void {
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);

    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(0, this.groundLevel, this.config.canvasWidth, this.config.canvasHeight - this.groundLevel);

    this.player.render(this.ctx);

    for (const enemy of this.enemies) {
      enemy.render(this.ctx);
    }

    this.renderUI();
  }

  private renderUI(): void {
    this.ctx.fillStyle = '#000000';
    this.ctx.font = 'bold 24px monospace';
    this.ctx.fillText(`Score: ${this.score.getScore()}`, 10, 30);
    this.ctx.fillText(`Health: ${this.player.getHealth()}`, 10, 60);
    this.ctx.fillText(`Level: ${this.level}`, 10, 90);

    if (this.score.getMultiplier() > 1) {
      this.ctx.fillStyle = '#FFD700';
      this.ctx.fillText(`x${this.score.getMultiplier()}`, 10, 120);
    }
  }

  private gameLoop = (timestamp: number): void => {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.render();

    if (this.isRunning) {
      requestAnimationFrame(this.gameLoop);
    }
  };

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop);
  }

  pause(): void {
    this.isRunning = false;
  }

  resume(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop);
  }

  reset(): void {
    this.player.reset(100, this.groundLevel - 48);
    this.enemies = [];
    this.score.reset();
    this.level = 1;
    this.enemySpawnTimer = 0;
    this.keys.clear();
  }

  private async gameOver(): Promise<void> {
    this.pause();

    const finalScore = this.score.getScore();
    const playerName = prompt('Game Over! Enter your name:') || 'Anonymous';

    if (this.highScoreManager.isHighScore(finalScore)) {
      this.highScoreManager.addScore(finalScore, playerName, this.level);

      try {
        const response = await fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: finalScore,
            playerName,
            level: this.level
          })
        });

        const data = await response.json();
        if (data.isHighScore) {
          alert(`New High Score! Rank #${data.rank}`);
        }
      } catch {
        console.error('Failed to submit score to server');
      }
    }

    const playAgain = confirm('Play again?');
    if (playAgain) {
      this.reset();
      this.start();
    }
  }

  getScore(): Score {
    return this.score;
  }

  getHighScoreManager(): HighScoreManager {
    return this.highScoreManager;
  }

  defeatEnemy(enemy: Enemy): void {
    if (enemy.takeDamage()) {
      this.score.enemyDefeated(enemy.type);
    }
  }
}
