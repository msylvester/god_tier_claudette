import { Canvas } from './Canvas';
import { EnemyColumn } from './EnemyColumn';
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

  // Enemy columns
  private enemyColumns: EnemyColumn[] = [];
  private columnSpawnTimer: number = 0;
  private readonly columnSpawnInterval: number = 120; // frames between column spawns

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

    // Reset enemy columns
    this.enemyColumns = [];
    this.columnSpawnTimer = 0;

    // Spawn initial column of items
    this.spawnItemColumn();
  }

  // Spawn a vertical column of items (one per lane) at the right side
  private spawnItemColumn(): void {
    if (!this.environment) return;

    const bounds = this.environment.getBounds(this.canvas.width, this.canvas.height);
    const laneInfo = this.environment.getLaneInfo(this.canvas.width, this.canvas.height);

    // Start items at the right edge of the arena
    const startX = bounds.right;

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

      // Move all items together from right to left
      for (const item of this.items) {
        item.update(this.itemSpeed);
      }

      // Check collision with items
      this.checkItemCollisions();

      // Check if all items have gone off screen (left side) or been collected - respawn column
      const allOffScreenOrCollected = this.items.every(
        (item) => item.collected || item.x < bounds.left - item.width
      );
      if (allOffScreenOrCollected) {
        this.items = [];
        this.spawnItemColumn();
      }

      // Spawn enemy columns
      this.columnSpawnTimer++;
      if (this.columnSpawnTimer >= this.columnSpawnInterval) {
        this.columnSpawnTimer = 0;
        // Spawn both tranches at the same time
        this.enemyColumns.push(new EnemyColumn('left', laneInfo, bounds));
        this.enemyColumns.push(new EnemyColumn('right', laneInfo, bounds));
      }

      // Update columns
      for (const column of this.enemyColumns) {
        column.update();
      }

      // Remove off-screen columns
      this.enemyColumns = this.enemyColumns.filter((column) => !column.isOffScreen(bounds));

      // Check collisions with enemy columns
      for (const column of this.enemyColumns) {
        if (
          column.collidesWithPlayer(this.player.x, this.player.y, this.player.width, this.player.height)
        ) {
          this.init(); // Reset game on collision
          return;
        }
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

    // Draw enemy columns
    for (const column of this.enemyColumns) {
      column.draw(this.canvas.ctx);
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
    ctx.fillStyle = '#FFFF00';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Score: ${this.score}`, 20, 20);
    ctx.restore();
  }
}
