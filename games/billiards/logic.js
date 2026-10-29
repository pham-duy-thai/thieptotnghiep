(function (root) {
  const games = root.GraduationGames || (root.GraduationGames = {});
  const rackRows = [[1], [2, 3], [4, 9, 5], [6, 7], [8]];

  function lowestBall(balls) {
    return balls.filter(ball => ball.active && !ball.pocketed)
      .reduce((lowest, ball) => !lowest || ball.number < lowest.number ? ball : lowest, null);
  }

  function rack(width, height, radius) {
    const vertical = height > width * 1.25;
    const top = vertical ? 196 : 150, bottom = 22;
    const longSide = vertical ? Math.min(width * .89 * 2, Math.max(120, height - top - bottom)) : Math.min(width * .89, Math.max(120, (height - top - bottom) * 2));
    const table = vertical
      ? { x: (width - longSide / 2) / 2, y: top, w: longSide / 2, h: longSide, rail: Math.max(10, longSide / 2 * .032), pocket: Math.max(14, longSide / 2 * .043) }
      : { x: (width - longSide) / 2, y: top, w: longSide, h: longSide / 2, rail: Math.max(10, longSide * .032), pocket: Math.max(14, longSide * .043) };
    const spacing = radius * 2.04;
    const centerX = table.x + table.w * (vertical ? .5 : .70), centerY = table.y + table.h * (vertical ? .70 : .5);
    const balls = [];
    for (let row = 0; row < rackRows.length; row++) {
      for (let col = 0; col < rackRows[row].length; col++) {
        const number = rackRows[row][col];
        balls.push({ id: "object-ball-" + number, number, x: centerX + (vertical ? col - (rackRows[row].length - 1) / 2 : row * .87) * spacing, y: centerY + (vertical ? row * .87 : col - (rackRows[row].length - 1) / 2) * spacing, vx: 0, vy: 0, rotation: 0, active: true, pocketed: false, sink: 0 });
      }
    }
    return { balls, cue: { id: "cue-ball", number: 0, x: table.x + table.w * (vertical ? .5 : .23), y: table.y + table.h * (vertical ? .23 : .5), vx: 0, vy: 0, vz: 0, z: 0, active: true, pocketed: false }, table };
  }

  function placeNine(balls, table, radius) {
    const nine = balls.find(ball => ball.number === 9);
    if (!nine) return null;
    const bounds = { left: table.x + table.rail + radius, right: table.x + table.w - table.rail - radius, top: table.y + table.rail + radius, bottom: table.y + table.h - table.rail - radius };
    let x = table.x + table.w * (table.h > table.w ? .5 : .70), y = table.y + table.h * (table.h > table.w ? .70 : .5);
    const clear = (px, py) => balls.every(ball => ball === nine || !ball.active || ball.pocketed || Math.hypot(ball.x - px, ball.y - py) >= radius * 2.05);
    if (!clear(x, y)) {
      for (let distance = radius * 2; distance < Math.min(table.w, table.h); distance += radius) {
        let found = false;
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 12) {
          const px = Math.max(bounds.left, Math.min(bounds.right, x + Math.cos(angle) * distance));
          const py = Math.max(bounds.top, Math.min(bounds.bottom, y + Math.sin(angle) * distance));
          if (clear(px, py)) { x = px; y = py; found = true; break; }
        }
        if (found) break;
      }
    }
    Object.assign(nine, { x, y, vx: 0, vy: 0, active: true, pocketed: false, sink: 0 });
    return nine;
  }

  function step({ cue, balls, table, radius, shot }, dt) {
    const vertical = table.h > table.w;
    const pockets = vertical
      ? [[table.x, table.y], [table.x + table.w, table.y], [table.x, table.y + table.h / 2], [table.x + table.w, table.y + table.h / 2], [table.x, table.y + table.h], [table.x + table.w, table.y + table.h]]
      : [[table.x, table.y], [table.x + table.w / 2, table.y], [table.x + table.w, table.y], [table.x, table.y + table.h], [table.x + table.w / 2, table.y + table.h], [table.x + table.w, table.y + table.h]];
    const all = [cue, ...balls];
    const steps = Math.max(1, Math.ceil(dt / (1 / 120))), sub = dt / steps;
    for (let frame = 0; frame < steps; frame++) {
      for (const b of all) {
        if (b.pocketed) { b.sink = Math.min(1, (b.sink || 0) + sub * 2.5); continue; }
        if (!b.active) continue;
        b.x += b.vx * sub; b.y += b.vy * sub;
        if (b === cue && ((b.z || 0) > 0 || (b.vz || 0) > 0)) {
          b.z = Math.max(0, (b.z || 0) + b.vz * sub);
          b.vz -= 980 * sub;
          if (b.z === 0) b.vz = 0;
        }
      }
      for (let i = 0; i < all.length; i++) {
        const a = all[i]; if (!a.active || a.pocketed) continue;
        for (let j = i + 1; j < all.length; j++) {
          const b = all[j]; if (!b.active || b.pocketed) continue;
          if (Math.abs((a.z || 0) - (b.z || 0)) > radius * 1.35) continue;
          const dx = b.x - a.x, dy = b.y - a.y, distance = Math.hypot(dx, dy), minDistance = radius * 2;
          if (!distance || distance >= minDistance) continue;
          const nx = dx / distance, ny = dy / distance;
          const relative = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
          if (relative > 0) { a.vx -= relative * nx; a.vy -= relative * ny; b.vx += relative * nx; b.vy += relative * ny; }
          const overlap = minDistance - distance;
          a.x -= nx * (overlap / 2 + .02); a.y -= ny * (overlap / 2 + .02);
          b.x += nx * (overlap / 2 + .02); b.y += ny * (overlap / 2 + .02);
          if ((a === cue || b === cue) && relative > 0) {
            const target = a === cue ? b : a;
            if (shot.firstHitNumber == null) shot.firstHitNumber = target.number;
            shot.hasContact = true;
          }
        }
      }
      for (const b of all) {
        if (!b.active || b.pocketed) continue;
        const hole = (b.z || 0) <= radius * .55 && pockets.find(([hx, hy]) => Math.hypot(b.x - hx, b.y - hy) < table.pocket * .82);
        if (hole) {
          b.active = false; b.pocketed = true; b.sink = 0; b.vx = b.vy = 0;
          if (b === cue) shot.scratch = true; else if (!shot.pocketed.includes(b.number)) shot.pocketed.push(b.number);
          continue;
        }
        const left = table.x + table.rail * .55, right = table.x + table.w - table.rail * .55;
        const top = table.y + table.rail * .55, bottom = table.y + table.h - table.rail * .55, gap = table.pocket * 1.08;
        const nearMouth = vertical
          ? ((Math.abs(b.y - top) < gap || Math.abs(b.y - bottom) < gap) && [left, right].some(px => Math.abs(b.x - px) < gap)) || ((Math.abs(b.x - left) < gap || Math.abs(b.x - right) < gap) && [top, (top + bottom) / 2, bottom].some(py => Math.abs(b.y - py) < gap))
          : ((Math.abs(b.y - top) < gap || Math.abs(b.y - bottom) < gap) && [left, (left + right) / 2, right].some(px => Math.abs(b.x - px) < gap)) || ((Math.abs(b.x - left) < gap || Math.abs(b.x - right) < gap) && [top, bottom].some(py => Math.abs(b.y - py) < gap));
        let rail = false;
        if (!nearMouth) {
          if (b.x < left + radius) { b.x = left + radius; b.vx = Math.abs(b.vx) * .78; rail = true; }
          else if (b.x > right - radius) { b.x = right - radius; b.vx = -Math.abs(b.vx) * .78; rail = true; }
          if (b.y < top + radius) { b.y = top + radius; b.vy = Math.abs(b.vy) * .78; rail = true; }
          else if (b.y > bottom - radius) { b.y = bottom - radius; b.vy = -Math.abs(b.vy) * .78; rail = true; }
        }
        if (rail && shot.hasContact) {
          shot.railAfterContact = true;
          if (b !== cue && !shot.railBalls.includes(b.id)) shot.railBalls.push(b.id);
        }
      }
      for (const b of all) {
        if (!b.active || b.pocketed) continue;
        const friction = Math.pow(.986, sub * 60); b.vx *= friction; b.vy *= friction;
        if (Math.hypot(b.vx, b.vy) < 5) b.vx = b.vy = 0;
      }
    }
    const moving = all.some(b => !b.pocketed && (Math.hypot(b.vx, b.vy) > 5 || Math.abs(b.vz || 0) > 5 || (b.z || 0) > 0)) || all.some(b => b.pocketed && (b.sink || 0) < 1);
    return { moving };
  }

  function resolve({ shot, balls, lowestNumber, breakShot, player }) {
    const pocketedObjects = shot.pocketed;
    const ninePocketed = pocketedObjects.includes(9);
    const legalFirstHit = shot.firstHitNumber === lowestNumber;
    const breakFoul = breakShot && pocketedObjects.length === 0 && shot.railBalls.length < 4;
    const foul = shot.scratch || !legalFirstHit || (!pocketedObjects.length && !shot.railAfterContact) || breakFoul;
    if (ninePocketed && !foul) return { result: "WON", player, foul: false, continueTurn: false };
    if (ninePocketed) placeNine(balls, shot.table, shot.radius);
    return { result: foul ? "FOUL" : pocketedObjects.length ? "CONTINUE" : "NEXT_PLAYER", player: foul || !pocketedObjects.length ? player === 1 ? 2 : 1 : player, foul, continueTurn: !foul && pocketedObjects.length > 0 };
  }

  games.billiards = { title: "PRECISION POOL - 9-BALL", instruction: "Kéo cơ ngược hướng đánh. Bật NHẢY để vượt bi cản; chuột phải để đặt bi cái sau lỗi.", rack, lowestBall, placeNine, step, resolve };
})(window);
