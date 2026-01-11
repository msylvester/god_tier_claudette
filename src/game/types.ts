/**
 * Common types and interfaces for the Asterix game
 */

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  dx: number;
  dy: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface GameObject {
  position: Position;
  size: Size;
  velocity: Velocity;
  active: boolean;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  getBounds(): Bounds;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type EnemyType = 'roman' | 'centurion' | 'lion';
export type ItemType = 'potion' | 'helmet' | 'shield' | 'coin';

export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  playerSpeed: number;
  enemySpeed: number;
  gravity: number;
  jumpStrength: number;
}

export const DEFAULT_CONFIG: GameConfig = {
  canvasWidth: 800,
  canvasHeight: 600,
  playerSpeed: 5,
  enemySpeed: 2,
  gravity: 0.5,
  jumpStrength: -12
};
