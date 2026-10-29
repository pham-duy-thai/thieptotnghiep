(function (root) {
  const games = root.GraduationGames || (root.GraduationGames = {});

  games.basketball = {
    title: "BASKETBALL",
    instruction: "K\u00e9o b\u00f3ng ng\u01b0\u1ee3c h\u01b0\u1edbng mu\u1ed1n n\u00e9m r\u1ed3i th\u1ea3.",
    step({ shot, ball, hoop, width, height, gravity, score, resetBall }, dt) {
      if (!shot) return null;
      shot.previousY = shot.y;
      shot.vy += gravity * dt;
      shot.x += shot.vx * dt;
      shot.y += shot.vy * dt;
      shot.rotation += shot.vx * dt / 65;

      const inHoop = shot.x > hoop.x - hoop.width * .25 && shot.x < hoop.x + hoop.width * .25;
      if (inHoop && shot.previousY < hoop.y && shot.y >= hoop.y && shot.vy > 0) score();
      if (shot.x + ball.r > hoop.backboardX && shot.x - ball.r < hoop.backboardX + 10 && shot.y < hoop.backboardY + 100 && shot.y > hoop.backboardY) {
        shot.vx = -Math.abs(shot.vx) * .55;
        shot.x = hoop.backboardX - ball.r;
      }
      if (shot.y + ball.r > height * .84 && shot.vy > 0) {
        shot.y = height * .84 - ball.r;
        shot.vy *= -.52;
        shot.vx *= .76;
        if (Math.abs(shot.vy) < 150) { resetBall(); return null; }
      }
      if (shot.x < -50 || shot.x > width + 60 || shot.y > height + 60) { resetBall(); return null; }
      ball.x = shot.x;
      ball.y = shot.y;
      return shot;
    }
  };
})(window);
