(function (root) {
  const games = root.GraduationGames || (root.GraduationGames = {});

  games.football = {
    title: "PENALTY",
    instruction: "K\u00e9o b\u00f3ng theo h\u01b0\u1edbng mu\u1ed1n s\u00fat r\u1ed3i th\u1ea3. S\u00fat tr\u00fang th\u1ee7 m\u00f4n l\u00e0 thua.",
    moveKeeper(x, direction, width, dt) {
      x += direction * width * .22 * dt;
      if (x > width * .70) return { x: width * .70, direction: -1 };
      if (x < width * .30) return { x: width * .30, direction: 1 };
      return { x, direction };
    },
    step({ shot, ball, width, height, gravity, keeperX, score, result }, dt) {
      if (!shot) return null;
      const previous = { x: shot.x, y: shot.y };
      shot.height = (shot.height || 0) + shot.vz * dt;
      shot.vz -= gravity * .52 * dt;
      shot.x += shot.vx * dt;
      shot.y += shot.vy * dt;
      shot.rotation += shot.vx * dt / 50;

      const goal = { x: width * .17, y: height * .25, w: width * .66, h: height * .25 };
      const keeperY = goal.y + goal.h * .58;
      shot.keeperX = keeperX;
      const keeperContact = shot.y < keeperY + 24 && shot.y > keeperY - 24 && Math.abs(shot.x - keeperX) < ball.r + 22 && shot.height < ball.r * 2.3;
      if (keeperContact) {
        ball.x = width * .5; ball.y = height * .78;
        result("SAVED!");
        return null;
      }

      const plane = goal.y + goal.h * .65;
      if (previous.y > plane && shot.y <= plane) {
        const fraction = (previous.y - plane) / (previous.y - shot.y || 1);
        const crossX = previous.x + (shot.x - previous.x) * fraction;
        const inside = crossX > goal.x + ball.r && crossX < goal.x + goal.w - ball.r;
        if (inside && Math.abs(crossX - keeperX) > ball.r + 19 && shot.height > ball.r * .8) score();
      }
      if (shot.y < goal.y - 30 || shot.x < goal.x - 30 || shot.x > goal.x + goal.w + 30 || shot.y > height * .84) {
        ball.x = width * .5; ball.y = height * .78;
        result("MISS!");
        return null;
      }
      ball.x = shot.x; ball.y = shot.y;
      return shot;
    }
  };
})(window);
