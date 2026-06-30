let spriteTimerId = 0;

export function frameToBackgroundPosition(sprite, frame) {
  const [row, col] = frame;
  return `${-(col - 1) * sprite.frameWidth}px ${-(row - 1) * sprite.frameHeight}px`;
}

export function playSpriteAction(element, sprite, actionName) {
  const action = sprite.actions[actionName];
  if (!element || !action) return;

  clearInterval(spriteTimerId);
  element.classList.toggle("defending", actionName === "defend");
  element.style.setProperty("--sprite-image", `url("${sprite.image}")`);
  let frameIndex = 0;

  const showFrame = () => {
    const position = frameToBackgroundPosition(sprite, action.frames[frameIndex]);
    element.style.setProperty("--sprite-position", position);
    frameIndex += 1;

    if (frameIndex >= action.frames.length) {
      if (action.loop) {
        frameIndex = 0;
        return;
      }
      clearInterval(spriteTimerId);
      spriteTimerId = 0;
      setTimeout(() => {
        element.classList.remove("defending");
        playSpriteAction(element, sprite, "idle");
      }, action.frameDuration);
    }
  };

  showFrame();
  spriteTimerId = setInterval(showFrame, action.frameDuration);
}
