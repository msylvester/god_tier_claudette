import { Canvas } from './Canvas';
import { Environment } from './Environment';
import { InputManager } from './InputManager';
import { Item } from './Item';
import { Player } from './Player';

export class Game {
  private canvas: Canvas;
  private environment: Environment | null = null;
  private input: InputManager | null = null;
  private player: Player | null = null;
  private running: boolean = false;

  // Score and items
  private score: number = 0;
  private items: Item[] = [];
  private readonly itemSpeed: number = 2; // pixels per frame - all items move together

  constructor(canvasId: string) {
    this.canvas = new Canvas(canvasId);
  }

  init(): void {
    this.environment = new Environment();
    this.input = new InputManager();
    this.player = new Player(this.canvas.centerX, this.canvas.centerY);

    // Start player in the middle lane
    const laneInfo = this.environment.getLaneInfo(this.canvas.width, this.canvas.height);
    const middleLane = Math.floor(laneInfo.laneCount / 2);
    this.player.setLane(middleLane, laneInfo);

    // Reset score and items
    this.score = 0;
    this.items = [];

    // Spawn initial column of items
    this.spawnItemColumn();
  }

  // Spawn a vertical column of items (one per lane) at the left side
  private spawnItemColumn(): void {
    if (!this.environment) return;

    const bounds = this.environment.getBounds(this.canvas.width, this.canvas.height);
    const laneInfo = this.environment.getLaneInfo(this.canvas.width, this.canvas.height);

    // Start items at the left edge of the arena
    const startX = bounds.left;

    // Create one item per lane, forming a vertical column
    for (let laneIndex = 0; laneIndex < laneInfo.laneCount; laneIndex++) {
      const item = Item.spawnInLane(laneIndex, laneInfo, startX);
      this.items.push(item);
    }
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

      // Move all items together from left to right
      for (const item of this.items) {
        item.update(this.itemSpeed);
      }

      // Check collision with items
      this.checkItemCollisions();

      // Check if all items have gone off screen or been collected - respawn column
      const allOffScreenOrCollected = this.items.every(
        (item) => item.collected || item.x > bounds.right + item.width
      );
      if (allOffScreenOrCollected) {
        this.items = [];
        this.spawnItemColumn();
      }
    }
  }

  private checkItemCollisions(): void {
    if (!this.player) return;

    for (const item of this.items) {
      if (item.collidesWith(this.player.x, this.player.y, this.player.width, this.player.height)) {
        item.collected = true;
        this.score += item.points;
      }
    }
  }

  private render(): void {
    this.canvas.clear('#000000');

    if (this.environment) {
      this.environment.draw(this.canvas.ctx, this.canvas.width, this.canvas.height);
    }

    // Draw items
    for (const item of this.items) {
      item.draw(this.canvas.ctx);
    }

    if (this.player) {
      this.player.draw(this.canvas.ctx);
    }

    // Draw score
    this.drawScore();
  }

  private drawScore(): void {
    const ctx = this.canvas.ctx;

    ctx.save();
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Score: ${this.score}`, 20, 20);
    ctx.restore();
  }
}
