export const SPRITES = {
  swordsmanCyan: {
    image: "./assets/characters/SwordsmanCyan.png",
    frameWidth: 16,
    frameHeight: 16,
    scale: 2.5,
    actions: {
      idle: {
        frames: [[3, 1], [3, 2]],
        frameDuration: 300,
        loop: true
      },
      attack: {
        frames: [[7, 1], [7, 2], [7, 3], [7, 4]],
        frameDuration: 100,
        loop: false
      },
      defend: {
        frames: [[11, 2], [11, 3], [11, 4], [11, 5]],
        frameDuration: 100,
        loop: false,
        overlay: {
          color: "#e83f63",
          opacity: 0.65,
          flashCount: 3
        }
      }
    }
  }
};
