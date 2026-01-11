export class InputManager {
  private keysPressed: Set<string> = new Set();

  constructor() {
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  private onKeyDown(e: KeyboardEvent): void {
    this.keysPressed.add(e.key);
  }

  private onKeyUp(e: KeyboardEvent): void {
    this.keysPressed.delete(e.key);
  }

  isKeyDown(key: string): boolean {
    return this.keysPressed.has(key);
  }

  isUpPressed(): boolean {
    return this.isKeyDown('ArrowUp') || this.isKeyDown('w') || this.isKeyDown('W');
  }

  isDownPressed(): boolean {
    return this.isKeyDown('ArrowDown') || this.isKeyDown('s') || this.isKeyDown('S');
  }

  isLeftPressed(): boolean {
    return this.isKeyDown('ArrowLeft') || this.isKeyDown('a') || this.isKeyDown('A');
  }

  isRightPressed(): boolean {
    return this.isKeyDown('ArrowRight') || this.isKeyDown('d') || this.isKeyDown('D');
  }
}
