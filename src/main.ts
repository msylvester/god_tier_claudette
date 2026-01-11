import { Game } from './Game';

function main(): void {
  const game = new Game('game-canvas');

  try {
    game.init();
    game.start();
    console.log('Game started successfully');
  } catch (error) {
    console.error('Failed to initialize game:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
