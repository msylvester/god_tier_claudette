export interface ArenaBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface LaneInfo {
  lanePositions: number[]; // Y positions of each lane center (between rails)
  laneCount: number;
}

export class Environment {
  private readonly railCount = 8;
  private readonly domeLayerCount = 7;

  // Arena proportions (relative to canvas size)
  private readonly arenaWidthRatio = 0.85;
  private readonly arenaHeightRatio = 0.9;
  private readonly domeHeightRatio = 0.15; // Height of each dome as ratio of arena height

  // Colors
  private readonly violetColor = { r: 75, g: 0, b: 130 }; // #4B0082
  private readonly blueColor = { r: 0, g: 191, b: 255 }; // #00BFFF
  private readonly railColor = '#00FFFF';

  draw(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number): void {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    const arenaWidth = canvasWidth * this.arenaWidthRatio;
    const arenaHeight = canvasHeight * this.arenaHeightRatio;
    const domeHeight = arenaHeight * this.domeHeightRatio;

    const arenaLeft = centerX - arenaWidth / 2;
    const arenaRight = centerX + arenaWidth / 2;
    const arenaTop = centerY - arenaHeight / 2;
    const arenaBottom = centerY + arenaHeight / 2;

    // Draw top dome
    this.drawDome(ctx, centerX, arenaTop, arenaWidth, domeHeight, false);

    // Draw bottom dome (inverted)
    this.drawDome(ctx, centerX, arenaBottom, arenaWidth, domeHeight, true);

    // Draw horizontal rails
    const playAreaTop = arenaTop + domeHeight;
    const playAreaBottom = arenaBottom - domeHeight;
    this.drawRails(ctx, arenaLeft, arenaRight, playAreaTop, playAreaBottom);
  }

  private drawDome(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    baseY: number,
    baseWidth: number,
    height: number,
    inverted: boolean
  ): void {
    const layerHeight = height / this.domeLayerCount;

    for (let i = 0; i < this.domeLayerCount; i++) {
      // Calculate layer position and width
      const layerIndex = inverted ? this.domeLayerCount - 1 - i : i;
      const progress = layerIndex / (this.domeLayerCount - 1); // 0 at tip, 1 at base

      // Width grows from narrow (tip) to wide (base)
      const layerWidth = baseWidth * (0.2 + 0.8 * progress);

      // Color interpolation: violet at tip → blue at base
      const r = Math.round(this.violetColor.r + (this.blueColor.r - this.violetColor.r) * progress);
      const g = Math.round(this.violetColor.g + (this.blueColor.g - this.violetColor.g) * progress);
      const b = Math.round(this.violetColor.b + (this.blueColor.b - this.violetColor.b) * progress);

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

      // Calculate Y position
      let y: number;
      if (inverted) {
        y = baseY + i * layerHeight;
      } else {
        y = baseY + (this.domeLayerCount - 1 - i) * layerHeight;
      }

      // Draw trapezoid layer
      const halfWidth = layerWidth / 2;
      const nextProgress = Math.min(1, (layerIndex + 1) / (this.domeLayerCount - 1));
      const nextLayerWidth = baseWidth * (0.2 + 0.8 * nextProgress);
      const nextHalfWidth = nextLayerWidth / 2;

      ctx.beginPath();
      if (inverted) {
        // Inverted: wider at top, narrower at bottom
        ctx.moveTo(centerX - halfWidth, y);
        ctx.lineTo(centerX + halfWidth, y);
        ctx.lineTo(centerX + nextHalfWidth, y + layerHeight);
        ctx.lineTo(centerX - nextHalfWidth, y + layerHeight);
      } else {
        // Normal: narrower at top, wider at bottom
        ctx.moveTo(centerX - halfWidth, y);
        ctx.lineTo(centerX + halfWidth, y);
        ctx.lineTo(centerX + nextHalfWidth, y + layerHeight);
        ctx.lineTo(centerX - nextHalfWidth, y + layerHeight);
      }
      ctx.closePath();
      ctx.fill();
    }
  }

  private drawRails(
    ctx: CanvasRenderingContext2D,
    left: number,
    right: number,
    top: number,
    bottom: number
  ): void {
    const playAreaHeight = bottom - top;
    const railSpacing = playAreaHeight / (this.railCount + 1);

    ctx.strokeStyle = this.railColor;
    ctx.lineWidth = 2;
    ctx.shadowColor = this.railColor;
    ctx.shadowBlur = 6;

    for (let i = 1; i <= this.railCount; i++) {
      const y = top + i * railSpacing;

      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
    }

    // Reset shadow
    ctx.shadowBlur = 0;
  }

  getBounds(canvasWidth: number, canvasHeight: number): ArenaBounds {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    const arenaWidth = canvasWidth * this.arenaWidthRatio;
    const arenaHeight = canvasHeight * this.arenaHeightRatio;
    const domeHeight = arenaHeight * this.domeHeightRatio;

    return {
      left: centerX - arenaWidth / 2,
      right: centerX + arenaWidth / 2,
      top: centerY - arenaHeight / 2 + domeHeight,
      bottom: centerY + arenaHeight / 2 - domeHeight,
    };
  }

  getLaneInfo(canvasWidth: number, canvasHeight: number): LaneInfo {
    const centerY = canvasHeight / 2;
    const arenaHeight = canvasHeight * this.arenaHeightRatio;
    const domeHeight = arenaHeight * this.domeHeightRatio;

    const playAreaTop = centerY - arenaHeight / 2 + domeHeight;
    const playAreaBottom = centerY + arenaHeight / 2 - domeHeight;
    const playAreaHeight = playAreaBottom - playAreaTop;
    const railSpacing = playAreaHeight / (this.railCount + 1);

    // Lanes are the spaces between rails (and above first / below last rail)
    // There are railCount + 1 lanes (one more lane than rails)
    const lanePositions: number[] = [];
    for (let i = 0; i <= this.railCount; i++) {
      // Lane center is halfway between two rails
      // First lane: between top edge and first rail
      // Last lane: between last rail and bottom edge
      const laneTop = playAreaTop + i * railSpacing;
      const laneBottom = playAreaTop + (i + 1) * railSpacing;
      lanePositions.push((laneTop + laneBottom) / 2);
    }

    return {
      lanePositions,
      laneCount: this.railCount + 1,
    };
  }
}
