import type { GameObject, Position, Velocity, Size, Bounds, EnemyType } from './types';

export class Enemy implements GameObject {
  position: Position;
  velocity: Velocity;
  size: Size;
  active: boolean = true;
  type: EnemyType;
  private health: number;

  constructor(x: number, y: number, type: EnemyType = 'roman') {
    this.position = { x, y };
    this.type = type;

    const speeds = {
      roman: 2,
      centurion: 1.5,
      lion: 3
    };

    const sizes = {
      roman: { width: 24, height: 40 },
      centurion: { width: 28, height: 44 },
      lion: { width: 32, height: 28 }
    };

    const healthValues = {
      roman: 1,
      centurion: 2,
      lion: 1
    };

    this.velocity = { dx: -speeds[type], dy: 0 };
    this.size = sizes[type];
    this.health = healthValues[type];
  }

  update(deltaTime: number): void {
    if (!this.active) return;

    this.position.x += this.velocity.dx * deltaTime;
    this.position.y += this.velocity.dy * deltaTime;

    if (this.position.x < -this.size.width) {
      this.active = false;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    const colors = {
      roman: '#8B4513',
      centurion: '#CD853F',
      lion: '#DEB887'
    };

    ctx.fillStyle = colors[this.type];
    ctx.fillRect(
      this.position.x,
      this.position.y,
      this.size.width,
      this.size.height
    );

    ctx.fillStyle = '#000000';
    ctx.fillRect(
      this.position.x + 5,
      this.position.y + 5,
      6,
      6
    );
    ctx.fillRect(
      this.position.x + this.size.width - 11,
      this.position.y + 5,
      6,
      6
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

  takeDamage(): boolean {
    this.health--;
    if (this.health <= 0) {
      this.active = false;
      return true;
    }
    return false;
  }

  getHealth(): number {
    return this.health;
  }

  reverseDirection(): void {
    this.velocity.dx = -this.velocity.dx;
  }
}
