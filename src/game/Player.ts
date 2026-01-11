import type { GameObject, Position, Velocity, Size, Bounds } from './types';

export class Player implements GameObject {
  position: Position;
  velocity: Velocity;
  size: Size;
  active: boolean = true;
  private isJumping: boolean = false;
  private health: number = 3;
  private invulnerable: boolean = false;
  private invulnerableTimer: number = 0;

  constructor(x: number, y: number) {
    this.position = { x, y };
    this.velocity = { dx: 0, dy: 0 };
    this.size = { width: 32, height: 48 };
  }

  update(deltaTime: number): void {
    if (!this.active) return;

    this.position.x += this.velocity.dx * deltaTime;
    this.position.y += this.velocity.dy * deltaTime;

    if (this.invulnerable) {
      this.invulnerableTimer -= deltaTime;
      if (this.invulnerableTimer <= 0) {
        this.invulnerable = false;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    if (this.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
      return;
    }

    ctx.fillStyle = '#FFD700';
    ctx.fillRect(
      this.position.x,
      this.position.y,
      this.size.width,
      this.size.height
    );

    ctx.fillStyle = '#FF0000';
    ctx.fillRect(
      this.position.x + 10,
      this.position.y + 5,
      12,
      12
    );
  }

  getBounds(): Bounds {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.size.width,
      height: this.size.height
    };
  }

  moveLeft(): void {
    this.velocity.dx = -5;
  }

  moveRight(): void {
    this.velocity.dx = 5;
  }

  stop(): void {
    this.velocity.dx = 0;
  }

  jump(jumpStrength: number): void {
    if (!this.isJumping) {
      this.velocity.dy = jumpStrength;
      this.isJumping = true;
    }
  }

  applyGravity(gravity: number): void {
    this.velocity.dy += gravity;
  }

  land(): void {
    this.isJumping = false;
    this.velocity.dy = 0;
  }

  takeDamage(): boolean {
    if (this.invulnerable) return false;

    this.health--;
    this.invulnerable = true;
    this.invulnerableTimer = 2000;

    if (this.health <= 0) {
      this.active = false;
      return true;
    }
    return false;
  }

  getHealth(): number {
    return this.health;
  }

  heal(): void {
    this.health = Math.min(this.health + 1, 3);
  }

  reset(x: number, y: number): void {
    this.position = { x, y };
    this.velocity = { dx: 0, dy: 0 };
    this.health = 3;
    this.active = true;
    this.isJumping = false;
    this.invulnerable = false;
    this.invulnerableTimer = 0;
  }
}
