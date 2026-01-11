import type { LaneInfo } from './Environment';

export class Item {
  public x: number;
  public y: number;
  public collected: boolean = false;

  public readonly width = 24;
  public readonly height = 24;
  public readonly points = 50;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update(speed: number): void {
    if (this.collected) return;
    this.x -= speed; // Move from right to left
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.collected) return;

    const drawX = this.x - this.width / 2;
    const drawY = this.y - this.height / 2;

    // Draw orange rectangle
    ctx.fillStyle = '#FFA500'; // Orange
    ctx.fillRect(drawX, drawY, this.width, this.height);

    // Add a darker orange border
    ctx.strokeStyle = '#FF8C00'; // Dark orange border
    ctx.lineWidth = 2;
    ctx.strokeRect(drawX, drawY, this.width, this.height);
  }

  // Check if this item collides with a player
  collidesWith(
    playerX: number,
    playerY: number,
    playerWidth: number,
    playerHeight: number
  ): boolean {
    if (this.collected) return false;

    const playerLeft = playerX - playerWidth / 2;
    const playerRight = playerX + playerWidth / 2;
    const playerTop = playerY - playerHeight / 2;
    const playerBottom = playerY + playerHeight / 2;

    const itemLeft = this.x - this.width / 2;
    const itemRight = this.x + this.width / 2;
    const itemTop = this.y - this.height / 2;
    const itemBottom = this.y + this.height / 2;

    // AABB collision detection
    return (
      playerLeft < itemRight &&
      playerRight > itemLeft &&
      playerTop < itemBottom &&
      playerBottom > itemTop
    );
  }

  // Static factory method to create an item at a specific x position in a lane
  static spawnInLane(laneIndex: number, laneInfo: LaneInfo, startX: number): Item {
    const laneY = laneInfo.lanePositions[laneIndex];
    return new Item(startX, laneY);
  }
}
