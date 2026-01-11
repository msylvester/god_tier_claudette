import { Canvas } from './Canvas';

// Pixel font data for retro-style text rendering
// Each character is defined as a 5x7 pixel grid (stored as array of rows)
const PIXEL_FONT: Record<string, number[]> = {
  A: [0b01110, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  B: [0b11110, 0b10001, 0b10001, 0b11110, 0b10001, 0b10001, 0b11110],
  C: [0b01110, 0b10001, 0b10000, 0b10000, 0b10000, 0b10001, 0b01110],
  D: [0b11110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b11110],
  E: [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b11111],
  F: [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b10000],
  G: [0b01110, 0b10001, 0b10000, 0b10111, 0b10001, 0b10001, 0b01110],
  H: [0b10001, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  I: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b11111],
  J: [0b00111, 0b00010, 0b00010, 0b00010, 0b00010, 0b10010, 0b01100],
  K: [0b10001, 0b10010, 0b10100, 0b11000, 0b10100, 0b10010, 0b10001],
  L: [0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b11111],
  M: [0b10001, 0b11011, 0b10101, 0b10101, 0b10001, 0b10001, 0b10001],
  N: [0b10001, 0b11001, 0b10101, 0b10011, 0b10001, 0b10001, 0b10001],
  O: [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  P: [0b11110, 0b10001, 0b10001, 0b11110, 0b10000, 0b10000, 0b10000],
  Q: [0b01110, 0b10001, 0b10001, 0b10001, 0b10101, 0b10010, 0b01101],
  R: [0b11110, 0b10001, 0b10001, 0b11110, 0b10100, 0b10010, 0b10001],
  S: [0b01110, 0b10001, 0b10000, 0b01110, 0b00001, 0b10001, 0b01110],
  T: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
  U: [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  V: [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01010, 0b00100],
  W: [0b10001, 0b10001, 0b10001, 0b10101, 0b10101, 0b10101, 0b01010],
  X: [0b10001, 0b10001, 0b01010, 0b00100, 0b01010, 0b10001, 0b10001],
  Y: [0b10001, 0b10001, 0b01010, 0b00100, 0b00100, 0b00100, 0b00100],
  Z: [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b10000, 0b11111],
  '0': [0b01110, 0b10001, 0b10011, 0b10101, 0b11001, 0b10001, 0b01110],
  '1': [0b00100, 0b01100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  '2': [0b01110, 0b10001, 0b00001, 0b00110, 0b01000, 0b10000, 0b11111],
  '3': [0b01110, 0b10001, 0b00001, 0b00110, 0b00001, 0b10001, 0b01110],
  '4': [0b00010, 0b00110, 0b01010, 0b10010, 0b11111, 0b00010, 0b00010],
  '5': [0b11111, 0b10000, 0b11110, 0b00001, 0b00001, 0b10001, 0b01110],
  '6': [0b00110, 0b01000, 0b10000, 0b11110, 0b10001, 0b10001, 0b01110],
  '7': [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b01000, 0b01000],
  '8': [0b01110, 0b10001, 0b10001, 0b01110, 0b10001, 0b10001, 0b01110],
  '9': [0b01110, 0b10001, 0b10001, 0b01111, 0b00001, 0b00010, 0b01100],
  ' ': [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000],
};

// Pixel art character - stylized figure similar to retro game splash screens
// This is a simplified crystal/character design
const CHARACTER_ART: string[] = [
  '      ####      ',
  '     ######     ',
  '    ## ## ##    ',
  '   ##  ##  ##   ',
  '  ##   ##   ##  ',
  '  #   ####   #  ',
  ' ##  ######  ## ',
  ' #  ######## #  ',
  '## ########## ##',
  '#  ##########  #',
  '# ############ #',
  '## ########## ##',
  ' # ########## # ',
  ' ## ######## ## ',
  '  ## ###### ##  ',
  '   ## #### ##   ',
  '    ###  ###    ',
  '   ##  ##  ##   ',
  '  ##   ##   ##  ',
  ' ##    ##    ## ',
  '##     ##     ##',
  '#      ##      #',
  '       ##       ',
  '      ####      ',
  '     ######     ',
  '    ########    ',
  '   ##########   ',
  '  ############  ',
  ' ############## ',
  '################',
];

export class SplashScreen {
  private canvas: Canvas;
  private animationFrame: number = 0;
  private startTime: number = 0;
  private fadeAlpha: number = 0;
  private onComplete: (() => void) | null = null;
  private inputHandler: ((e: KeyboardEvent | MouseEvent) => void) | null = null;
  private isComplete: boolean = false;

  // Colors matching the retro Atari style
  private readonly backgroundColor = '#c0c0c0';
  private readonly textColor = '#228b22';

  constructor(canvas: Canvas) {
    this.canvas = canvas;
  }

  show(onComplete: () => void): void {
    this.onComplete = onComplete;
    this.startTime = performance.now();
    this.isComplete = false;

    // Listen for key press or click to skip
    this.inputHandler = () => {
      if (!this.isComplete) {
        this.complete();
      }
    };
    window.addEventListener('keydown', this.inputHandler);
    window.addEventListener('click', this.inputHandler);

    this.animate();
  }

  private animate(): void {
    if (this.isComplete) return;

    const elapsed = performance.now() - this.startTime;

    // Fade in over 500ms
    if (elapsed < 500) {
      this.fadeAlpha = elapsed / 500;
    } else {
      this.fadeAlpha = 1;
    }

    this.render();
    this.animationFrame++;

    requestAnimationFrame(() => this.animate());
  }

  private complete(): void {
    this.isComplete = true;

    // Remove event listeners
    if (this.inputHandler) {
      window.removeEventListener('keydown', this.inputHandler);
      window.removeEventListener('click', this.inputHandler);
    }

    // Call completion callback
    if (this.onComplete) {
      this.onComplete();
    }
  }

  private render(): void {
    const ctx = this.canvas.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Clear with background color
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Apply fade effect
    ctx.globalAlpha = this.fadeAlpha;

    // Calculate scaling based on screen size
    const scale = Math.min(width / 400, height / 600);
    const pixelSize = Math.max(2, Math.floor(4 * scale));

    // Center everything
    const centerX = width / 2;
    const centerY = height / 2;

    // Draw character art
    this.drawCharacterArt(ctx, centerX, centerY - 120 * scale, pixelSize);

    // Draw title "KRYSTALMESS" with underline
    const titleY = centerY + 80 * scale;
    this.drawPixelText(ctx, 'KRYSTALMESS', centerX, titleY, pixelSize * 1.5);

    // Draw underline
    const titleWidth = 11 * 6 * pixelSize * 1.5; // 11 chars, 6 pixels wide each
    ctx.fillStyle = this.textColor;
    ctx.fillRect(centerX - titleWidth / 2, titleY + 12 * pixelSize, titleWidth, pixelSize * 2);

    // Draw copyright
    const copyrightY = titleY + 60 * scale;
    this.drawPixelText(ctx, '2025 MIKE ESS', centerX, copyrightY, pixelSize);

    // Draw "PRESS ANY KEY" with blinking effect
    if (this.fadeAlpha === 1 && Math.floor(this.animationFrame / 30) % 2 === 0) {
      const pressKeyY = height - 60 * scale;
      this.drawPixelText(ctx, 'PRESS ANY KEY', centerX, pressKeyY, pixelSize * 0.8);
    }

    ctx.globalAlpha = 1;
  }

  private drawCharacterArt(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    pixelSize: number
  ): void {
    ctx.fillStyle = this.textColor;

    const artWidth = CHARACTER_ART[0].length;
    const artHeight = CHARACTER_ART.length;
    const startX = centerX - (artWidth * pixelSize) / 2;
    const startY = centerY - (artHeight * pixelSize) / 2;

    for (let y = 0; y < artHeight; y++) {
      for (let x = 0; x < artWidth; x++) {
        if (CHARACTER_ART[y][x] === '#') {
          ctx.fillRect(startX + x * pixelSize, startY + y * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }

  private drawPixelText(
    ctx: CanvasRenderingContext2D,
    text: string,
    centerX: number,
    y: number,
    pixelSize: number
  ): void {
    const charWidth = 5;
    const charHeight = 7;
    const charSpacing = 1;
    const totalWidth = text.length * (charWidth + charSpacing) * pixelSize - charSpacing * pixelSize;
    let x = centerX - totalWidth / 2;

    ctx.fillStyle = this.textColor;

    for (const char of text.toUpperCase()) {
      const charData = PIXEL_FONT[char];
      if (charData) {
        for (let row = 0; row < charHeight; row++) {
          for (let col = 0; col < charWidth; col++) {
            if (charData[row] & (1 << (charWidth - 1 - col))) {
              ctx.fillRect(x + col * pixelSize, y + row * pixelSize, pixelSize, pixelSize);
            }
          }
        }
      }
      x += (charWidth + charSpacing) * pixelSize;
    }
  }
}
