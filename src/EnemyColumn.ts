import type { ArenaBounds, LaneInfo } from './Environment';
import enemyImage from './assets/enemies.png';

export class EnemyColumn {
  public x: number;
  private readonly lanes: number[];
  private readonly direction: 'left' | 'right';
  private readonly speed = 3;
  private readonly width = 40;
  private readonly height = 40;
  private readonly lanePositions: number[];

  // Sprite loading
  private static sprite: HTMLImageElement | null = null;
  private static spriteLoaded = false;

  static {
    if (typeof Image !== 'undefined') {
      EnemyColumn.sprite = new Image();
      EnemyColumn.sprite.onload = () => {
        EnemyColumn.spriteLoaded = true;
      };
      EnemyColumn.sprite.src = enemyImage;
    }
  }

  constructor(direction: 'left' | 'right', laneInfo: LaneInfo, bounds: ArenaBounds) {
    this.direction = direction;
    this.lanePositions = laneInfo.lanePositions;

    // Set starting X based on direction
    this.x = direction === 'left' ? bounds.left - 40 : bounds.right + 40;

    // Populate lanes based on direction:
    // 'left' (moves right) → even lanes: 0, 2, 6, 8 (skip middle lane 4)
    // 'right' (moves left) → odd lanes: 1, 3, 5, 7
    // Middle lane (4) is kept safe as player's home base
    const middleLane = Math.floor(laneInfo.laneCount / 2);
    this.lanes = [];
    for (let i = 0; i < laneInfo.laneCount; i++) {
      // Skip the middle lane to keep it safe
      if (i === middleLane) continue;

      if (direction === 'left' && i % 2 === 0) {
        this.lanes.push(i);
      } else if (direction === 'right' && i % 2 === 1) {
        this.lanes.push(i);
      }
    }
  }

  update(): void {
    if (this.direction === 'left') {
      this.x += this.speed; // Move right
    } else {
      this.x -= this.speed; // Move left
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const lane of this.lanes) {
      const y = this.lanePositions[lane];
      const drawX = this.x - this.width / 2;
      const drawY = y - this.height / 2;

      if (EnemyColumn.spriteLoaded && EnemyColumn.sprite) {
        // Flip sprite horizontally for enemies moving left (direction === 'right')
        if (this.direction === 'right') {
          ctx.save();
          ctx.translate(this.x, y);
          ctx.scale(-1, 1);
          ctx.drawImage(
            EnemyColumn.sprite,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
          );
          ctx.restore();
        } else {
          ctx.drawImage(EnemyColumn.sprite, drawX, drawY, this.width, this.height);
        }
      } else {
        // Fallback: Draw placeholder while image loads
        const fillColor = this.direction === 'left' ? '#0066FF' : '#FF3366';
        const strokeColor = this.direction === 'left' ? '#0044AA' : '#CC2952';

        ctx.fillStyle = fillColor;
        ctx.fillRect(drawX, drawY, this.width, this.height);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(drawX, drawY, this.width, this.height);
      }
    }
  }

  isOffScreen(bounds: ArenaBounds): boolean {
    if (this.direction === 'left') {
      return this.x - this.width / 2 > bounds.right; // Exited right side
    } else {
      return this.x + this.width / 2 < bounds.left; // Exited left side
    }
  }

  collidesWithPlayer(
    playerX: number,
    playerY: number,
    playerWidth: number,
    playerHeight: number
  ): boolean {
    for (const lane of this.lanes) {
      const y = this.lanePositions[lane];
      // AABB collision check
      if (
        this.x - this.width / 2 < playerX + playerWidth / 2 &&
        this.x + this.width / 2 > playerX - playerWidth / 2 &&
        y - this.height / 2 < playerY + playerHeight / 2 &&
        y + this.height / 2 > playerY - playerHeight / 2
      ) {
        return true;
      }
    }
    return false;
  }
}
