import { describe, it, expect } from 'vitest';
import type { ArenaBounds, LaneInfo } from './Environment';
import { Player } from './Player';

describe('Player horizontal boundary clamping', () => {
  const bounds: ArenaBounds = {
    left: 50,
    right: 750,
    top: 100,
    bottom: 500,
  };

  it('cannot move beyond left edge', () => {
    const player = new Player(100, 300);
    player.x = 0; // Try to go past left edge
    player.clampToBounds(bounds);

    expect(player.x).toBe(bounds.left + player.width / 2);
  });

  it('cannot move beyond right edge', () => {
    const player = new Player(100, 300);
    player.x = 900; // Try to go past right edge
    player.clampToBounds(bounds);

    expect(player.x).toBe(bounds.right - player.width / 2);
  });

  it('stays within bounds when already inside', () => {
    const player = new Player(400, 300);
    player.clampToBounds(bounds);

    expect(player.x).toBe(400);
  });
});

describe('Player vertical lane movement', () => {
  const laneInfo: LaneInfo = {
    lanePositions: [120, 180, 240, 300, 360, 420, 480],
    laneCount: 7,
  };

  it('cannot move above top lane (lane 0)', () => {
    const player = new Player(400, 300);
    player.currentLane = 0;
    player.setLane(-1, laneInfo); // Try to go above top lane

    expect(player.currentLane).toBe(0);
    expect(player.y).toBe(laneInfo.lanePositions[0]);
  });

  it('cannot move below bottom lane', () => {
    const player = new Player(400, 300);
    player.currentLane = laneInfo.laneCount - 1;
    player.setLane(laneInfo.laneCount + 5, laneInfo); // Try to go below bottom lane

    expect(player.currentLane).toBe(laneInfo.laneCount - 1);
    expect(player.y).toBe(laneInfo.lanePositions[laneInfo.laneCount - 1]);
  });

  it('snaps to lane center when set to valid lane', () => {
    const player = new Player(400, 300);
    player.setLane(3, laneInfo);

    expect(player.currentLane).toBe(3);
    expect(player.y).toBe(laneInfo.lanePositions[3]);
  });

  it('can move between lanes within bounds', () => {
    const player = new Player(400, 300);

    player.setLane(2, laneInfo);
    expect(player.currentLane).toBe(2);
    expect(player.y).toBe(laneInfo.lanePositions[2]);

    player.setLane(5, laneInfo);
    expect(player.currentLane).toBe(5);
    expect(player.y).toBe(laneInfo.lanePositions[5]);
  });
});
