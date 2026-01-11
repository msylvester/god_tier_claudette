import { Canvas } from './Canvas';
import { Enemy } from './Enemy';
import { Environment } from './Environment';
import { InputManager } from './InputManager';
import { Player } from './Player';

export class Game {
  private canvas: Canvas;
  private environment: Environment | null = null;
  private input: InputManager | null = null;
  private player: Player | null = null;
  private enemies: Enemy[] = [];
  private running: boolean = false;
  private spawnTimer: number = 0;
  private readonly spawnInterval: number = 60; // frames between spawns

  constructor(canvasId: string) {
    this.canvas = new Canvas(canvasId);
  }

  init(): void {
    this.environment = new Environment();
    this.input = new InputManager();
    this.resetGame();
  }

  private resetGame(): void {
    if (!this.environment) return;

    this.player = new Player(this.canvas.centerX, this.canvas.centerY);
    this.enemies = [];
    this.spawnTimer = 0;

    // Start player in the middle lane
    const laneInfo = this.environment.getLaneInfo(this.canvas.width, this.canvas.height);
    const middleLane = Math.floor(laneInfo.laneCount / 2);
    this.player.setLane(middleLane, laneInfo);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    requestAnimationFrame(() => this.gameLoop());
  }

  private gameLoop(): void {
    if (!this.running) return;

    this.update();
    this.render();

    requestAnimationFrame(() => this.gameLoop());
  }

  private update(): void {
    if (this.player && this.input && this.environment) {
      const bounds = this.environment.getBounds(this.canvas.width, this.canvas.height);
      const laneInfo = this.environment.getLaneInfo(this.canvas.width, this.canvas.height);
      this.player.update(this.input, bounds, laneInfo);

      // Spawn enemies
      this.spawnTimer++;
      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnTimer = 0;
        this.spawnEnemy(bounds, laneInfo);
      }

      // Update enemies
      for (const enemy of this.enemies) {
        enemy.update();
      }

      // Remove off-screen enemies
      this.enemies = this.enemies.filter((enemy) => !enemy.isOffScreen(bounds));

      // Check collisions
      for (const enemy of this.enemies) {
        if (enemy.collidesWithPlayer(this.player.x, this.player.y, this.player.width, this.player.height)) {
          this.resetGame();
          return;
        }
      }
    }
  }

  private spawnEnemy(bounds: { right: number }, laneInfo: { laneCount: number }): void {
    const lane = Math.floor(Math.random() * laneInfo.laneCount);
    const fullLaneInfo = this.environment!.getLaneInfo(this.canvas.width, this.canvas.height);
    const enemy = new Enemy(bounds.right + 20, lane, fullLaneInfo);
    this.enemies.push(enemy);
  }

  private render(): void {
    this.canvas.clear('#000000');

    if (this.environment) {
      this.environment.draw(this.canvas.ctx, this.canvas.width, this.canvas.height);
    }

    for (const enemy of this.enemies) {
      enemy.draw(this.canvas.ctx);
    }

    if (this.player) {
      this.player.draw(this.canvas.ctx);
    }
  }
}
