import { Canvas } from './Canvas';
import { Environment } from './Environment';
import { InputManager } from './InputManager';
import { Player } from './Player';

export class Game {
  private canvas: Canvas;
  private environment: Environment | null = null;
  private input: InputManager | null = null;
  private player: Player | null = null;
  private running: boolean = false;

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
    }
  }

  private render(): void {
    this.canvas.clear('#000000');

    if (this.environment) {
      this.environment.draw(this.canvas.ctx, this.canvas.width, this.canvas.height);
    }

    if (this.player) {
      this.player.draw(this.canvas.ctx);
    }
  }
}
