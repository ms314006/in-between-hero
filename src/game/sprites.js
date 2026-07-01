const spriteTimers = new WeakMap();

export function frameToBackgroundPosition(sprite, frame) {
  const [row, col] = frame;
  return `${-(col - 1) * sprite.frameWidth}px ${-(row - 1) * sprite.frameHeight}px`;
}

export function playSpriteAction(element, sprite, actionName) {
  const action = sprite.actions[actionName];
  if (!element || !action) return Promise.resolve();

  return new Promise(resolve => {
    clearTimeout(spriteTimers.get(element));
    element.classList.toggle("defending", actionName === "defend");
    element.classList.remove("dying");
    element.classList.remove("walking-in");
    if (["fallDown", "walkIn"].includes(action.effect?.type)) void element.offsetWidth;
    element.style.setProperty("--sprite-image", `url("${sprite.image}")`);
    let frameIndex = 0;

    const finish = () => {
      spriteTimers.delete(element);
      element.classList.remove("defending");
      element.classList.remove("walking-in");
      if (action.effect?.type !== "fallDown" || action.returnTo !== false) element.classList.remove("dying");
      if (action.returnTo !== false) playSpriteAction(element, sprite, "idle");
      resolve();
    };

    const showFrame = () => {
      const position = frameToBackgroundPosition(sprite, action.frames[frameIndex]);
      element.style.setProperty("--sprite-position", position);
      if (action.effect?.type === "fallDown") {
        element.classList.add("dying");
      }
      if (action.effect?.type === "walkIn") {
        element.classList.add("walking-in");
      }
      frameIndex += 1;

      if (frameIndex >= action.frames.length) {
        if (action.loop) {
          frameIndex = 0;
        } else {
          spriteTimers.set(element, setTimeout(finish, action.frameDuration));
          return;
        }
      }
      spriteTimers.set(element, setTimeout(showFrame, action.frameDuration));
    };

    showFrame();
  });
}
