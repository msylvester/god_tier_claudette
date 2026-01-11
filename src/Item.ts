import type { LaneInfo } from './Environment';
import collectableImage from './assets/blue_collectable.png';

export class Item {
  public x: number;
  public y: number;
  public collected: boolean = false;

  public readonly width = 24;
  public readonly height = 24;
  public readonly points = 50;

  // Sprite loading
  private static sprite: HTMLImageElement | null = null;
  private static spriteLoaded = false;

  static {
    if (typeof Image !== 'undefined') {
      Item.sprite = new Image();
      Item.sprite.onload = () => {
        Item.spriteLoaded = true;
      };
      Item.sprite.src = collectableImage;
    }
  }

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

    if (Item.spriteLoaded && Item.sprite) {
      ctx.drawImage(Item.sprite, drawX, drawY, this.width, this.height);
    } else {
      // Fallback: Draw placeholder while image loads
      ctx.fillStyle = '#FFA500';
      ctx.fillRect(drawX, drawY, this.width, this.height);
      ctx.strokeStyle = '#FF8C00';
      ctx.lineWidth = 2;
      ctx.strokeRect(drawX, drawY, this.width, this.height);
    }
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
