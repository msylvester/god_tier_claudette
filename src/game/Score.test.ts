import { describe, it, expect, beforeEach } from 'vitest';
import { Score, HighScoreManager } from './Score';

describe('Score', () => {
  let score: Score;

  beforeEach(() => {
    score = new Score();
  });

  describe('Basic Score Operations', () => {
    it('should initialize with zero score', () => {
      expect(score.getScore()).toBe(0);
    });

    it('should initialize with custom score', () => {
      const customScore = new Score(1000);
      expect(customScore.getScore()).toBe(1000);
    });

    it('should add points correctly', () => {
      score.addPoints(100);
      expect(score.getScore()).toBe(100);

      score.addPoints(50);
      expect(score.getScore()).toBe(150);
    });

    it('should reset score to zero', () => {
      score.addPoints(500);
      score.reset();
      expect(score.getScore()).toBe(0);
    });
  });

  describe('Score Multiplier', () => {
    it('should have default multiplier of 1', () => {
      expect(score.getMultiplier()).toBe(1);
    });

    it('should apply multiplier to points', () => {
      score.setMultiplier(2);
      score.addPoints(100);
      expect(score.getScore()).toBe(200);
    });

    it('should handle fractional multipliers', () => {
      score.setMultiplier(1.5);
      score.addPoints(100);
      expect(score.getScore()).toBe(150);
    });

    it('should not allow multiplier less than 1', () => {
      score.setMultiplier(0.5);
      expect(score.getMultiplier()).toBe(1);
    });

    it('should reset multiplier', () => {
      score.setMultiplier(3);
      score.resetMultiplier();
      expect(score.getMultiplier()).toBe(1);
    });
  });

  describe('Enemy Defeat Scoring', () => {
    it('should award 100 points for roman', () => {
      score.enemyDefeated('roman');
      expect(score.getScore()).toBe(100);
    });

    it('should award 250 points for centurion', () => {
      score.enemyDefeated('centurion');
      expect(score.getScore()).toBe(250);
    });

    it('should award 500 points for lion', () => {
      score.enemyDefeated('lion');
      expect(score.getScore()).toBe(500);
    });

    it('should apply multiplier to enemy defeats', () => {
      score.setMultiplier(2);
      score.enemyDefeated('roman');
      expect(score.getScore()).toBe(200);
    });
  });

  describe('Item Collection Scoring', () => {
    it('should award 25 points for coin', () => {
      score.itemCollected('coin');
      expect(score.getScore()).toBe(25);
    });

    it('should award 50 points for potion', () => {
      score.itemCollected('potion');
      expect(score.getScore()).toBe(50);
    });

    it('should award 150 points for helmet', () => {
      score.itemCollected('helmet');
      expect(score.getScore()).toBe(150);
    });

    it('should award 200 points for shield', () => {
      score.itemCollected('shield');
      expect(score.getScore()).toBe(200);
    });
  });

  describe('Level Completion', () => {
    it('should award base points for level completion', () => {
      score.levelComplete(1);
      expect(score.getScore()).toBe(1000);
    });

    it('should scale points with level number', () => {
      score.levelComplete(5);
      expect(score.getScore()).toBe(5000);
    });

    it('should include time bonus', () => {
      score.levelComplete(1, 500);
      expect(score.getScore()).toBe(1500);
    });
  });

  describe('Score Events', () => {
    it('should track score events', () => {
      score.addPoints(100, 'enemy_defeated');
      const events = score.getRecentEvents(1);

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('enemy_defeated');
      expect(events[0].points).toBe(100);
    });

    it('should limit event history', () => {
      for (let i = 0; i < 150; i++) {
        score.addPoints(10);
      }

      const events = score.getRecentEvents(200);
      expect(events.length).toBeLessThanOrEqual(100);
    });

    it('should get recent events', () => {
      score.addPoints(10);
      score.addPoints(20);
      score.addPoints(30);

      const recent = score.getRecentEvents(2);
      expect(recent).toHaveLength(2);
      expect(recent[1].points).toBe(30);
    });
  });

  describe('Serialization', () => {
    it('should serialize score data', () => {
      score.addPoints(500);
      score.setMultiplier(2);

      const serialized = score.serialize();
      expect(serialized).toBeTruthy();
      expect(typeof serialized).toBe('string');
    });

    it('should deserialize score data', () => {
      score.addPoints(500);
      score.setMultiplier(2);

      const serialized = score.serialize();
      const deserialized = Score.deserialize(serialized);

      expect(deserialized.getScore()).toBe(500);
      expect(deserialized.getMultiplier()).toBe(2);
    });
  });
});

describe('HighScoreManager', () => {
  let manager: HighScoreManager;

  beforeEach(() => {
    manager = new HighScoreManager(5);
  });

  describe('High Score Management', () => {
    it('should initialize with empty scores', () => {
      expect(manager.getHighScores()).toHaveLength(0);
    });

    it('should add high score', () => {
      manager.addScore(1000, 'Player1', 1);
      expect(manager.getHighScores()).toHaveLength(1);
    });

    it('should sort scores in descending order', () => {
      manager.addScore(500, 'Player1', 1);
      manager.addScore(1000, 'Player2', 2);
      manager.addScore(750, 'Player3', 1);

      const scores = manager.getHighScores();
      expect(scores[0].score).toBe(1000);
      expect(scores[1].score).toBe(750);
      expect(scores[2].score).toBe(500);
    });

    it('should limit number of high scores', () => {
      for (let i = 0; i < 10; i++) {
        manager.addScore(i * 100, `Player${i}`, 1);
      }

      expect(manager.getHighScores()).toHaveLength(5);
    });

    it('should keep only top scores', () => {
      manager.addScore(100, 'Player1', 1);
      manager.addScore(200, 'Player2', 1);
      manager.addScore(300, 'Player3', 1);
      manager.addScore(400, 'Player4', 1);
      manager.addScore(500, 'Player5', 1);
      manager.addScore(50, 'Player6', 1);

      const scores = manager.getHighScores();
      expect(scores).toHaveLength(5);
      expect(scores[scores.length - 1].score).toBe(100);
    });
  });

  describe('High Score Qualification', () => {
    beforeEach(() => {
      manager.addScore(1000, 'Player1', 1);
      manager.addScore(900, 'Player2', 1);
      manager.addScore(800, 'Player3', 1);
      manager.addScore(700, 'Player4', 1);
      manager.addScore(600, 'Player5', 1);
    });

    it('should identify qualifying high scores', () => {
      expect(manager.isHighScore(1100)).toBe(true);
      expect(manager.isHighScore(650)).toBe(true);
      expect(manager.isHighScore(500)).toBe(false);
    });

    it('should always qualify if not full', () => {
      const newManager = new HighScoreManager(10);
      newManager.addScore(100, 'Player1', 1);
      expect(newManager.isHighScore(50)).toBe(true);
    });
  });

  describe('Top Score', () => {
    it('should return 0 for empty list', () => {
      expect(manager.getTopScore()).toBe(0);
    });

    it('should return highest score', () => {
      manager.addScore(500, 'Player1', 1);
      manager.addScore(1000, 'Player2', 1);
      manager.addScore(750, 'Player3', 1);

      expect(manager.getTopScore()).toBe(1000);
    });
  });

  describe('Clear Scores', () => {
    it('should clear all high scores', () => {
      manager.addScore(1000, 'Player1', 1);
      manager.addScore(900, 'Player2', 1);

      manager.clear();
      expect(manager.getHighScores()).toHaveLength(0);
    });
  });

  describe('Serialization', () => {
    it('should serialize high scores', () => {
      manager.addScore(1000, 'Player1', 1);
      const serialized = manager.serialize();

      expect(serialized).toBeTruthy();
      expect(typeof serialized).toBe('string');
    });

    it('should deserialize high scores', () => {
      manager.addScore(1000, 'Player1', 1);
      manager.addScore(900, 'Player2', 1);

      const serialized = manager.serialize();

      const newManager = new HighScoreManager();
      newManager.deserialize(serialized);

      expect(newManager.getHighScores()).toHaveLength(2);
      expect(newManager.getTopScore()).toBe(1000);
    });

    it('should handle invalid serialized data', () => {
      manager.deserialize('invalid json');
      expect(manager.getHighScores()).toHaveLength(0);
    });
  });
});
