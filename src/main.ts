import { Canvas } from './Canvas';
import { Game } from './Game';
import { SplashScreen } from './SplashScreen';

function main(): void {
  // Create a temporary canvas for the splash screen
  const canvas = new Canvas('game-canvas');
  const splash = new SplashScreen(canvas);

  // Show splash screen first, then start game
  splash.show(() => {
    const game = new Game('game-canvas');

    try {
      game.init();
      game.start();
      console.log('Game started successfully');
    } catch (error) {
      console.error('Failed to initialize game:', error);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
