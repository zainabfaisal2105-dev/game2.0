/**
 * Grid-based BFS pathfinding and Line-of-Sight utilities for Liminal Space entities
 */

import { StageConfig } from '../types';

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
      if (stage.map[my][mx] === 1) {
        return false; // Solid wall blocks line of sight
      }
    }
  }
  return true;
}

/**
 * Finds the next waypoint for an entity moving towards targetX, targetY.
 * If direct line of sight is clear, returns target directly.
 * Otherwise, performs a fast BFS through passable tiles to find the next corridor step.
 */
export function getNextNavWaypoint(
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  stage: StageConfig
): { x: number; y: number } {
  // 1. If direct line of sight exists, move straight toward target
  if (checkLineOfSight(startX, startY, targetX, targetY, stage)) {
    return { x: targetX, y: targetY };
  }

  const sx = Math.floor(startX);
  const sy = Math.floor(startY);
  const tx = Math.max(0, Math.min(stage.mapWidth - 1, Math.floor(targetX)));
  const ty = Math.max(0, Math.min(stage.mapHeight - 1, Math.floor(targetY)));

  // If start and target are in the same tile, move directly to target coordinates
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
        if (!visited[nIdx] && stage.map[ny][nx] !== 1) {
          visited[nIdx] = 1;
          parent[nIdx] = cur;
          queue.push(nIdx);
        }
      }
    }
  }

  // If path found to target, backtrack to find the first step from start
  if (found) {
    let curr = targetIdx;
    while (parent[curr] !== -1 && parent[curr] !== startIdx) {
      curr = parent[curr];
    }
    const stepX = (curr % w) + 0.5;
    const stepY = Math.floor(curr / w) + 0.5;
    return { x: stepX, y: stepY };
  }

  // If target tile is unreachable (e.g. wall or closed area), find closest visited tile
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
    return { x: (curr % w) + 0.5, y: Math.floor(curr / w) + 0.5 };
  }

  return { x: targetX, y: targetY };
}

/**
 * Move entity towards waypoint with smooth collision sliding and wall padding
 */
export function moveEntityWithSliding(
  curX: number,
  curY: number,
  wpX: number,
  wpY: number,
  speed: number,
  dt: number,
  stage: StageConfig,
  radius = 0.22
): { x: number; y: number } {
  const dx = wpX - curX;
  const dy = wpY - curY;
  const dist = Math.hypot(dx, dy);

  if (dist < 0.02) {
    return { x: curX, y: curY };
  }

  const step = Math.min(dist, speed * 60 * dt);
  const dirX = dx / dist;
  const dirY = dy / dist;

  const targetStepX = curX + dirX * step;
  const targetStepY = curY + dirY * step;

  const isWalkable = (x: number, y: number): boolean => {
    const minX = Math.floor(x - radius);
    const maxX = Math.floor(x + radius);
    const minY = Math.floor(y - radius);
    const maxY = Math.floor(y + radius);

    for (let my = minY; my <= maxY; my++) {
      for (let mx = minX; mx <= maxX; mx++) {
        if (mx < 0 || mx >= stage.mapWidth || my < 0 || my >= stage.mapHeight) {
          return false;
        }
        if (stage.map[my][mx] === 1) {
          return false;
        }
      }
    }
    return true;
  };

  let nextX = curX;
  let nextY = curY;

  // Try moving both axes
  if (isWalkable(targetStepX, targetStepY)) {
    return { x: targetStepX, y: targetStepY };
  }

  // Try X only (wall sliding)
  if (isWalkable(targetStepX, curY)) {
    nextX = targetStepX;
  }

  // Try Y only (wall sliding)
  if (isWalkable(curX, targetStepY)) {
    nextY = targetStepY;
  }

  return { x: nextX, y: nextY };
}
