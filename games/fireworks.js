(function () {
  "use strict";

  const canvas = document.getElementById("fireworksCanvas");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  const palette = [
    ["#b3ff81", "#00ff91"],
    ["#4567ff", "#64d9ff"],
    ["#ff4d5e", "#fff06a"],
    ["#a43ce0", "#fb90cc"],
    ["#fff0bd", "#ff9e45"],
  ];
  const fireworks = [];
  const maxFireworks = 8;
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let active = false;
  let animationFrame = 0;
  let previousPointer = null;
  let lastPointerLaunch = 0;

  function resize() {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function createBurst(x, y, colors) {
    const particles = [];
    const count = 42 + Math.floor(Math.random() * 27);
    for (let index = 0; index < count; index++) {
      const angle = (Math.PI * 2 * index) / count + Math.random() * 0.12;
      const speed = 1.3 + Math.random() * 4.4;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.025 + Math.random() * 0.035,
        alpha: 0.9,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 1.1 + Math.random() * 1.3,
      });
    }
    return { particles };
  }

  function launch(targetX, targetY) {
    if (!active) return;
    while (fireworks.length >= maxFireworks) fireworks.shift();

    const colors = palette[Math.floor(Math.random() * palette.length)];
    const startX = Math.max(20, Math.min(width - 20, targetX + (Math.random() - 0.5) * 150));
    const startY = height + 10;
    const dx = targetX - startX;
    const dy = targetY - startY;
    const distance = Math.hypot(dx, dy) || 1;
    const speed = 13 + Math.random() * 4;
    fireworks.push({
      rocket: true,
      x: startX,
      y: startY,
      vx: (dx / distance) * speed,
      vy: (dy / distance) * speed,
      targetX,
      targetY,
      colors,
    });
    requestFrame();
  }

  function updateAndDraw() {
    context.clearRect(0, 0, width, height);
    const activeFireworks = [];

    for (const firework of fireworks) {
      if (firework.rocket) {
        const previousX = firework.x;
        const previousY = firework.y;
        firework.x += firework.vx;
        firework.y += firework.vy;
        context.beginPath();
        context.moveTo(previousX, previousY);
        context.lineTo(firework.x, firework.y);
        context.strokeStyle = "rgba(255,255,255,.8)";
        context.lineWidth = 2;
        context.stroke();

        if (Math.hypot(firework.targetX - firework.x, firework.targetY - firework.y) < 20) {
          activeFireworks.push(createBurst(firework.targetX, firework.targetY, firework.colors));
        } else {
          activeFireworks.push(firework);
        }
        continue;
      }

      let hasParticles = false;
      for (const particle of firework.particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += particle.gravity;
        particle.vx *= 0.992;
        particle.vy *= 0.992;
        particle.alpha -= 0.012;
        if (particle.alpha <= 0) continue;
        hasParticles = true;
        context.globalAlpha = particle.alpha;
        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
      if (hasParticles) activeFireworks.push(firework);
    }

    fireworks.splice(0, fireworks.length, ...activeFireworks);
  }

  function requestFrame() {
    if (!animationFrame && active) animationFrame = window.requestAnimationFrame(tick);
  }

  function tick() {
    animationFrame = 0;
    if (!active) return;
    updateAndDraw();
    if (fireworks.length) requestFrame();
  }

  function onPointerMove(event) {
    if (!active) return;
    const current = { x: event.clientX, y: event.clientY };
    const now = performance.now();
    const moved = !previousPointer || Math.hypot(current.x - previousPointer.x, current.y - previousPointer.y) > 42;
    previousPointer = current;
    if (moved && now - lastPointerLaunch > 220) {
      lastPointerLaunch = now;
      launch(current.x, current.y);
    }
  }

  function onClick(event) {
    if (active) launch(event.clientX, event.clientY);
  }

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("click", onClick, { passive: true });
  resize();

  window.InvitationFireworks = {
    start() {
      active = true;
    },
    stop() {
      active = false;
      fireworks.length = 0;
      previousPointer = null;
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      context.clearRect(0, 0, width, height);
    },
  };
})();
