import type { ArenaBounds, LaneInfo } from './Environment';

export class Enemy {
  public x: number;
  public y: number;
  public readonly lane: number;

  public readonly width = 40;
  public readonly height = 40;
  private readonly speed = 3;

  constructor(x: number, lane: number, laneInfo: LaneInfo) {
    this.x = x;
    this.lane = lane;
    this.y = laneInfo.lanePositions[lane];
  }

  update(): void {
    this.x -= this.speed;
  }

  isOffScreen(bounds: ArenaBounds): boolean {
    return this.x + this.width / 2 < bounds.left;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const drawX = this.x - this.width / 2;
    const drawY = this.y - this.height / 2;

    ctx.fillStyle = '#0066FF';
    ctx.fillRect(drawX, drawY, this.width, this.height);

    ctx.strokeStyle = '#0044AA';
    ctx.lineWidth = 2;
    ctx.strokeRect(drawX, drawY, this.width, this.height);
  }

  collidesWithPlayer(playerX: number, playerY: number, playerWidth: number, playerHeight: number): boolean {
    const enemyLeft = this.x - this.width / 2;
    const enemyRight = this.x + this.width / 2;
    const enemyTop = this.y - this.height / 2;
    const enemyBottom = this.y + this.height / 2;

    const playerLeft = playerX - playerWidth / 2;
    const playerRight = playerX + playerWidth / 2;
    const playerTop = playerY - playerHeight / 2;
    const playerBottom = playerY + playerHeight / 2;

    return (
      enemyLeft < playerRight &&
      enemyRight > playerLeft &&
      enemyTop < playerBottom &&
      enemyBottom > playerTop
    );
  }
}
