/**
 * Score handling for Asterix game
 * Manages current score, high scores, and score events
 */

export interface ScoreEvent {
  type: 'enemy_defeated' | 'item_collected' | 'level_complete' | 'bonus';
  points: number;
  timestamp: number;
}

export interface HighScoreEntry {
  score: number;
  playerName: string;
  date: string;
  level: number;
}

export class Score {
  private currentScore: number = 0;
  private multiplier: number = 1;
  private events: ScoreEvent[] = [];
  private readonly maxEvents: number = 100;

  constructor(initialScore: number = 0) {
    this.currentScore = initialScore;
  }

  /**
   * Add points to the current score
   */
  addPoints(points: number, type: ScoreEvent['type'] = 'bonus'): void {
    const actualPoints = Math.floor(points * this.multiplier);
    this.currentScore += actualPoints;

    this.events.push({
      type,
      points: actualPoints,
      timestamp: Date.now()
    });

    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
  }

  /**
   * Award points for defeating an enemy
   */
  enemyDefeated(enemyType: 'roman' | 'centurion' | 'lion' = 'roman'): void {
    const points = {
      roman: 100,
      centurion: 250,
      lion: 500
    };
    this.addPoints(points[enemyType], 'enemy_defeated');
  }

  /**
   * Award points for collecting an item
   */
  itemCollected(itemType: 'potion' | 'helmet' | 'shield' | 'coin' = 'coin'): void {
    const points = {
      potion: 50,
      helmet: 150,
      shield: 200,
      coin: 25
    };
    this.addPoints(points[itemType], 'item_collected');
  }

  /**
   * Award points for completing a level
   */
  levelComplete(level: number, timeBonus: number = 0): void {
    const basePoints = level * 1000;
    this.addPoints(basePoints + timeBonus, 'level_complete');
  }

  /**
   * Set the score multiplier
   */
  setMultiplier(multiplier: number): void {
    this.multiplier = Math.max(1, multiplier);
  }

  /**
   * Get the current multiplier
   */
  getMultiplier(): number {
    return this.multiplier;
  }

  /**
   * Reset multiplier to default
   */
  resetMultiplier(): void {
    this.multiplier = 1;
  }

  /**
   * Get current score
   */
  getScore(): number {
    return this.currentScore;
  }

  /**
   * Reset score to zero
   */
  reset(): void {
    this.currentScore = 0;
    this.multiplier = 1;
    this.events = [];
  }

  /**
   * Get recent score events
   */
  getRecentEvents(count: number = 10): ScoreEvent[] {
    return this.events.slice(-count);
  }

  /**
   * Serialize score data for storage
   */
  serialize(): string {
    return JSON.stringify({
      score: this.currentScore,
      multiplier: this.multiplier,
      events: this.events
    });
  }

  /**
   * Restore score from serialized data
   */
  static deserialize(data: string): Score {
    const parsed = JSON.parse(data);
    const score = new Score(parsed.score);
    score.multiplier = parsed.multiplier;
    score.events = parsed.events;
    return score;
  }
}

/**
 * High score manager for persistent storage
 */
export class HighScoreManager {
  private highScores: HighScoreEntry[] = [];
  private readonly maxEntries: number = 10;
  private storageKey: string = 'asterix_high_scores';

  constructor(maxEntries: number = 10) {
    this.maxEntries = maxEntries;
  }

  /**
   * Add a new high score entry
   */
  addScore(score: number, playerName: string, level: number): boolean {
    const entry: HighScoreEntry = {
      score,
      playerName,
      date: new Date().toISOString(),
      level
    };

    this.highScores.push(entry);
    this.highScores.sort((a, b) => b.score - a.score);

    if (this.highScores.length > this.maxEntries) {
      this.highScores = this.highScores.slice(0, this.maxEntries);
    }

    return this.highScores.includes(entry);
  }

  /**
   * Check if a score qualifies as a high score
   */
  isHighScore(score: number): boolean {
    if (this.highScores.length < this.maxEntries) {
      return true;
    }
    return score > this.highScores[this.highScores.length - 1].score;
  }

  /**
   * Get all high scores
   */
  getHighScores(): HighScoreEntry[] {
    return [...this.highScores];
  }

  /**
   * Get the highest score
   */
  getTopScore(): number {
    return this.highScores.length > 0 ? this.highScores[0].score : 0;
  }

  /**
   * Clear all high scores
   */
  clear(): void {
    this.highScores = [];
  }

  /**
   * Serialize high scores for storage
   */
  serialize(): string {
    return JSON.stringify(this.highScores);
  }

  /**
   * Load high scores from serialized data
   */
  deserialize(data: string): void {
    try {
      this.highScores = JSON.parse(data);
    } catch {
      this.highScores = [];
    }
  }

  /**
   * Save to localStorage (client-side)
   */
  saveToLocalStorage(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKey, this.serialize());
    }
  }

  /**
   * Load from localStorage (client-side)
   */
  loadFromLocalStorage(): void {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        this.deserialize(data);
      }
    }
  }
}
