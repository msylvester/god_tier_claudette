import type { ArenaBounds, LaneInfo } from './Environment';
import { InputManager } from './InputManager';

export class Player {
  public x: number;
  public y: number;
  public currentLane: number = 0;

  public readonly width = 32;
  public readonly height = 48;
  private readonly speed = 5;

  // Track if keys were just pressed (for discrete lane movement)
  private upWasPressed = false;
  private downWasPressed = false;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update(input: InputManager, bounds: ArenaBounds, laneInfo: LaneInfo): void {
    // Horizontal movement is still smooth
    if (input.isLeftPressed()) {
      this.x -= this.speed;
    }
    if (input.isRightPressed()) {
      this.x += this.speed;
    }

    // Vertical movement is discrete - step one lane at a time
    const upPressed = input.isUpPressed();
    const downPressed = input.isDownPressed();

    // Move up one lane on key press (not hold)
    if (upPressed && !this.upWasPressed) {
      if (this.currentLane > 0) {
        this.currentLane--;
      }
    }

    // Move down one lane on key press (not hold)
    if (downPressed && !this.downWasPressed) {
      if (this.currentLane < laneInfo.laneCount - 1) {
        this.currentLane++;
      }
    }

    this.upWasPressed = upPressed;
    this.downWasPressed = downPressed;

    // Snap Y position to current lane center
    this.y = laneInfo.lanePositions[this.currentLane];

    // Clamp horizontal position to bounds
    this.clampToBounds(bounds);
  }

  setLane(laneIndex: number, laneInfo: LaneInfo): void {
    this.currentLane = Math.max(0, Math.min(laneIndex, laneInfo.laneCount - 1));
    this.y = laneInfo.lanePositions[this.currentLane];
  }

  clampToBounds(bounds: ArenaBounds): void {
    const halfWidth = this.width / 2;

    if (this.x < bounds.left + halfWidth) {
      this.x = bounds.left + halfWidth;
    }
    if (this.x > bounds.right - halfWidth) {
      this.x = bounds.right - halfWidth;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const drawX = this.x - this.width / 2;
    const drawY = this.y - this.height / 2;

    // Draw Asterix placeholder - yellow/orange color scheme
    ctx.fillStyle = '#FFD700'; // Gold for body
    ctx.fillRect(drawX, drawY, this.width, this.height);

    // Add a simple border to make it visible
    ctx.strokeStyle = '#FFA500'; // Orange border
    ctx.lineWidth = 2;
    ctx.strokeRect(drawX, drawY, this.width, this.height);
  }
}
