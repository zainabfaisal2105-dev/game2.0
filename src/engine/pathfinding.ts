/**
 * Grid-based BFS pathfinding, swept line-of-sight, and collision sliding for Liminal Space entities
 */

import { StageConfig } from '../types';

/**
 * Checks thin ray line of sight between two positions (for vision, sightlines, and sounds)
 */
export function checkLineOfSight(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  stage: StageConfig
): boolean {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const dist = Math.hypot(dx, dy);
  if (dist < 0.05) return true;

  const steps = Math.ceil(dist / 0.06);
  const stepX = dx / steps;
  const stepY = dy / steps;

  let cx = x0;
  let cy = y0;

  for (let s = 1; s < steps; s++) {
    cx += stepX;
    cy += stepY;
    const mx = Math.floor(cx);
    const my = Math.floor(cy);

    if (mx >= 0 && mx < stage.mapWidth && my >= 0 && my < stage.mapHeight) {
      // Both walls (1) and locked doors (2) block line of sight
      if (stage.map[my][mx] === 1 || stage.map[my][mx] === 2) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Checks whether an entity with body radius can walk in a direct straight line without touching any wall or door
 */
export function checkWalkableLineOfSight(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  stage: StageConfig,
  radius = 0.22
): boolean {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const dist = Math.hypot(dx, dy);
  if (dist < 0.05) return true;

  const steps = Math.ceil(dist / 0.08);
  const stepX = dx / steps;
  const stepY = dy / steps;

  let cx = x0;
  let cy = y0;

  for (let s = 0; s <= steps; s++) {
    const minX = Math.floor(cx - radius);
    const maxX = Math.floor(cx + radius);
    const minY = Math.floor(cy - radius);
    const maxY = Math.floor(cy + radius);

    for (let my = minY; my <= maxY; my++) {
      for (let mx = minX; mx <= maxX; mx++) {
        if (mx < 0 || mx >= stage.mapWidth || my < 0 || my >= stage.mapHeight) {
          return false;
        }
        if (stage.map[my][mx] === 1 || stage.map[my][mx] === 2) {
          // Circle-to-AABB collision check
          const closestX = Math.max(mx, Math.min(mx + 1, cx));
          const closestY = Math.max(my, Math.min(my + 1, cy));
          const diffX = cx - closestX;
          const diffY = cy - closestY;
          if (diffX * diffX + diffY * diffY < radius * radius) {
            return false;
          }
        }
      }
    }

    cx += stepX;
    cy += stepY;
  }
  return true;
}

/**
 * Finds the next navigation waypoint for an entity moving towards targetX, targetY.
 * If direct straight path is completely clear with full body clearance, moves directly.
 * Otherwise, performs BFS grid navigation with corridor centering to prevent corner-clipping.
 */
export function getNextNavWaypoint(
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  stage: StageConfig,
  entityRadius = 0.20
): { x: number; y: number } {
  // If direct line of sight with body clearance exists, move straight to target
  if (checkWalkableLineOfSight(startX, startY, targetX, targetY, stage, entityRadius)) {
    return { x: targetX, y: targetY };
  }

  const sx = Math.floor(startX);
  const sy = Math.floor(startY);
  const tx = Math.max(0, Math.min(stage.mapWidth - 1, Math.floor(targetX)));
  const ty = Math.max(0, Math.min(stage.mapHeight - 1, Math.floor(targetY)));

  // If start and target are in the same tile, move directly
  if (sx === tx && sy === ty) {
    return { x: targetX, y: targetY };
  }

  const w = stage.mapWidth;
  const h = stage.mapHeight;
  const visited = new Uint8Array(w * h);
  const parent = new Int32Array(w * h);
  parent.fill(-1);

  const startIdx = sy * w + sx;
  const targetIdx = ty * w + tx;

  visited[startIdx] = 1;
  const queue: number[] = [startIdx];

  const DIRS = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ];

  let found = false;
  let head = 0;

  while (head < queue.length) {
    const cur = queue[head++];
    if (cur === targetIdx) {
      found = true;
      break;
    }

    const cx = cur % w;
    const cy = Math.floor(cur / w);

    for (const [dx, dy] of DIRS) {
      const nx = cx + dx;
      const ny = cy + dy;

      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const nIdx = ny * w + nx;
        // Cannot pass through solid walls (1) or locked exit doors (2)
        if (!visited[nIdx] && stage.map[ny][nx] !== 1 && stage.map[ny][nx] !== 2) {
          visited[nIdx] = 1;
          parent[nIdx] = cur;
          queue.push(nIdx);
        }
      }
    }
  }

  // Backtrack to find the very next tile along the path
  let nextTileIdx = -1;
  if (found) {
    let curr = targetIdx;
    while (parent[curr] !== -1 && parent[curr] !== startIdx) {
      curr = parent[curr];
    }
    nextTileIdx = curr;
  } else {
    // If target tile is unreachable (e.g. inside a blocked room), find closest reachable tile
    let closestDist = Infinity;
    let bestIdx = startIdx;
    for (let i = 0; i < queue.length; i++) {
      const idx = queue[i];
      const qx = idx % w;
      const qy = Math.floor(idx / w);
      const d = Math.hypot(qx - tx, qy - ty);
      if (d < closestDist) {
        closestDist = d;
        bestIdx = idx;
      }
    }

    if (bestIdx !== startIdx) {
      let curr = bestIdx;
      while (parent[curr] !== -1 && parent[curr] !== startIdx) {
        curr = parent[curr];
      }
      nextTileIdx = curr;
    }
  }

  if (nextTileIdx !== -1) {
    const nextTileX = nextTileIdx % w;
    const nextTileY = Math.floor(nextTileIdx / w);

    // Corridor centering to prevent corner clipping when turning:
    // If moving into next tile along X, make sure Y is aligned with hallway center
    // If moving into next tile along Y, make sure X is aligned with hallway center
    const curTileCenterX = sx + 0.5;
    const curTileCenterY = sy + 0.5;

    if (nextTileX !== sx && Math.abs(startY - curTileCenterY) > 0.16) {
      return { x: curTileCenterX, y: curTileCenterY };
    }
    if (nextTileY !== sy && Math.abs(startX - curTileCenterX) > 0.16) {
      return { x: curTileCenterX, y: curTileCenterY };
    }

    return { x: nextTileX + 0.5, y: nextTileY + 0.5 };
  }

  return { x: targetX, y: targetY };
}

/**
 * Move entity towards waypoint with circle-to-AABB collision sliding and anti-stuck recovery
 */
export function moveEntityWithSliding(
  curX: number,
  curY: number,
  wpX: number,
  wpY: number,
  speed: number,
  dt: number,
  stage: StageConfig,
  radius = 0.20
): { x: number; y: number } {
  const dx = wpX - curX;
  const dy = wpY - curY;
  const dist = Math.hypot(dx, dy);

  if (dist < 0.01) {
    return { x: curX, y: curY };
  }

  const step = Math.min(dist, speed * 60 * dt);
  const dirX = dx / dist;
  const dirY = dy / dist;

  const targetStepX = curX + dirX * step;
  const targetStepY = curY + dirY * step;

  const isPositionSafe = (px: number, py: number): boolean => {
    const minX = Math.floor(px - radius);
    const maxX = Math.floor(px + radius);
    const minY = Math.floor(py - radius);
    const maxY = Math.floor(py + radius);

    for (let my = minY; my <= maxY; my++) {
      for (let mx = minX; mx <= maxX; mx++) {
        if (mx < 0 || mx >= stage.mapWidth || my < 0 || my >= stage.mapHeight) {
          return false;
        }
        if (stage.map[my][mx] === 1 || stage.map[my][mx] === 2) {
          // Circle-to-AABB collision check
          const closestX = Math.max(mx, Math.min(mx + 1, px));
          const closestY = Math.max(my, Math.min(my + 1, py));
          const diffX = px - closestX;
          const diffY = py - closestY;
          if (diffX * diffX + diffY * diffY < radius * radius) {
            return false;
          }
        }
      }
    }
    return true;
  };

  // 1. Try full diagonal step
  if (isPositionSafe(targetStepX, targetStepY)) {
    return { x: targetStepX, y: targetStepY };
  }

  // 2. Try sliding along X only
  const safeX = isPositionSafe(targetStepX, curY);
  const safeY = isPositionSafe(curX, targetStepY);

  if (safeX && safeY) {
    // Both axes safe independently, pick the one aligned with greater movement
    if (Math.abs(dx) >= Math.abs(dy)) {
      return { x: targetStepX, y: curY };
    } else {
      return { x: curX, y: targetStepY };
    }
  }

  if (safeX) {
    return { x: targetStepX, y: curY };
  }

  if (safeY) {
    return { x: curX, y: targetStepY };
  }

  // 3. Anti-stuck recovery:
  // If the entity is pinched or pressed against a corner/wall, gently nudge toward current tile center
  const tileCenterX = Math.floor(curX) + 0.5;
  const tileCenterY = Math.floor(curY) + 0.5;
  const toCenterX = tileCenterX - curX;
  const toCenterY = tileCenterY - curY;
  const cDist = Math.hypot(toCenterX, toCenterY);
  if (cDist > 0.02) {
    const nudge = Math.min(cDist, step * 0.7);
    const nudgeX = curX + (toCenterX / cDist) * nudge;
    const nudgeY = curY + (toCenterY / cDist) * nudge;
    if (isPositionSafe(nudgeX, nudgeY)) {
      return { x: nudgeX, y: nudgeY };
    }
  }

  return { x: curX, y: curY };
}
