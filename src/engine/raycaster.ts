/**
 * Raycasting 3D Rendering Engine for Liminal Space Core
 * Implements DDA raycasting, dynamic lighting, flashlight spotlight cone,
 * distance fog attenuation, and 2.5D billboard sprite projection.
 */

import { PlayerState, StageConfig, Entity, WorldItem } from '../types';
import { textureLibrary } from './textureGenerator';
import { checkLineOfSight } from './pathfinding';

export interface RaycastHit {
  distance: number;
  mapX: number;
  mapY: number;
  side: number; // 0 for vertical, 1 for horizontal
  wallType: number;
  wallX: number; // exact point where wall was hit (0..1)
}

export interface InteractionTarget {
  type: 'door' | 'terminal' | 'item' | 'none';
  distance: number;
  item?: WorldItem;
  doorUnlocked?: boolean;
}

export class RaycasterEngine {
  private zBuffer: number[] = [];

  /**
   * Main render method onto a 2D canvas context
   */
  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    player: PlayerState,
    stage: StageConfig,
    entities: Entity[],
    items: WorldItem[],
    doorUnlocked: boolean,
    flickerFactor: number = 1.0
  ) {
    if (this.zBuffer.length !== width) {
      this.zBuffer = new Array(width).fill(0);
    }

    // Camera Direction & Projection Plane vectors
    const dirX = Math.cos(player.angle);
    const dirY = Math.sin(player.angle);
    const fov = 0.72; // ~66 degree FOV
    const planeX = -dirY * fov;
    const planeY = dirX * fov;

    const map = stage.map;
    const mapW = stage.mapWidth;
    const mapH = stage.mapHeight;

    // Pitch adjustment (looking slightly up/down, e.g. head bob or crouch)
    const pitchOffset = Math.floor(player.pitch * height * 0.3) + (player.isCrouching ? -height * 0.08 : 0);
    const horizon = Math.floor(height / 2) + pitchOffset;

    // --- 1. RENDER CEILING AND FLOOR (Atmospheric Gradients & Fog) ---
    this.renderCeilingAndFloor(ctx, width, height, horizon, stage, player, flickerFactor);

    // --- 2. RAYCAST WALLS ---
    for (let x = 0; x < width; x++) {
      // Calculate ray position and direction
      const cameraX = (2 * x) / width - 1; // -1 to 1
      const rayDirX = dirX + planeX * cameraX;
      const rayDirY = dirY + planeY * cameraX;

      let mapX = Math.floor(player.x);
      let mapY = Math.floor(player.y);

      // Length of ray from current position to next x or y-side
      let sideDistX: number;
      let sideDistY: number;

      // Length of ray from one x or y-side to next x or y-side
      const deltaDistX = Math.abs(1 / rayDirX);
      const deltaDistY = Math.abs(1 / rayDirY);
      let perpWallDist: number;

      // Direction to step (+1 or -1)
      let stepX: number;
      let stepY: number;

      let hit = 0;
      let side = 0; // 0 = NS wall, 1 = EW wall
      let cellType = 1;

      if (rayDirX < 0) {
        stepX = -1;
        sideDistX = (player.x - mapX) * deltaDistX;
      } else {
        stepX = 1;
        sideDistX = (mapX + 1.0 - player.x) * deltaDistX;
      }
      if (rayDirY < 0) {
        stepY = -1;
        sideDistY = (player.y - mapY) * deltaDistY;
      } else {
        stepY = 1;
        sideDistY = (mapY + 1.0 - player.y) * deltaDistY;
      }

      // DDA Loop
      const maxSteps = 25;
      let steps = 0;
      while (hit === 0 && steps < maxSteps) {
        steps++;
        if (sideDistX < sideDistY) {
          sideDistX += deltaDistX;
          mapX += stepX;
          side = 0;
        } else {
          sideDistY += deltaDistY;
          mapY += stepY;
          side = 1;
        }

        // Check bounds
        if (mapX >= 0 && mapX < mapW && mapY >= 0 && mapY < mapH) {
          const val = map[mapY][mapX];
          if (val > 0) {
            hit = 1;
            cellType = val;
          }
        } else {
          hit = 1;
          cellType = 1;
        }
      }

      // Calculate distance projected on camera direction
      if (side === 0) {
        perpWallDist = (mapX - player.x + (1 - stepX) / 2) / rayDirX;
      } else {
        perpWallDist = (mapY - player.y + (1 - stepY) / 2) / rayDirY;
      }
      perpWallDist = Math.max(0.1, perpWallDist);

      // Record in zBuffer for sprite occlusion
      this.zBuffer[x] = perpWallDist;

      // Calculate height of line to draw on screen
      const lineHeight = Math.floor(height / perpWallDist);
      const drawStart = Math.max(0, -lineHeight / 2 + horizon);
      const drawEnd = Math.min(height - 1, lineHeight / 2 + horizon);

      // Texture coordinate calculation
      let wallX: number;
      if (side === 0) {
        wallX = player.y + perpWallDist * rayDirY;
      } else {
        wallX = player.x + perpWallDist * rayDirX;
      }
      wallX -= Math.floor(wallX);

      // Determine texture name based on level theme and cell type
      let texName = 'wall_backrooms';
      if (cellType === 2) {
        texName = doorUnlocked ? 'wall_door_open' : 'wall_door_locked';
      } else if (cellType === 3) {
        texName = 'wall_terminal';
      } else {
        switch (stage.theme) {
          case 'poolrooms': texName = 'wall_pool'; break;
          case 'hotel': texName = 'wall_hotel'; break;
          case 'tunnels': texName = 'wall_tunnels'; break;
          case 'void': texName = 'wall_void'; break;
          default: texName = 'wall_backrooms'; break;
        }
      }

      // Calculate light intensity for this column
      const lightFactor = this.calculateLighting(
        perpWallDist,
        cameraX,
        player.isFlashlightOn,
        player.flashlightBattery,
        stage,
        flickerFactor
      );

      // Render vertical slice
      this.renderWallSlice(ctx, x, drawStart, drawEnd, lineHeight, wallX, texName, side, lightFactor);
    }

    // --- 3. RENDER 2.5D BILLBOARD SPRITES (Entities & Items) ---
    this.renderSprites(ctx, width, height, horizon, player, stage, entities, items, dirX, dirY, planeX, planeY, flickerFactor);
  }

  /**
   * Renders shaded ceiling and floor with distance fog
   */
  private renderCeilingAndFloor(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    horizon: number,
    stage: StageConfig,
    player: PlayerState,
    flickerFactor: number
  ) {
    // Ceiling colors per theme
    let ceilTop = '#111';
    let ceilBottom = '#2a2822';
    let floorTop = '#221f15';
    let floorBottom = '#615433';

    if (stage.theme === 'poolrooms') {
      ceilTop = '#0a1a24';
      ceilBottom = '#1d3f4a';
      floorTop = '#0c2e36';
      floorBottom = '#1a5f6e';
    } else if (stage.theme === 'hotel') {
      ceilTop = '#0e0a0d';
      ceilBottom = '#21151a';
      floorTop = '#1c0b0e';
      floorBottom = '#42161b';
    } else if (stage.theme === 'tunnels') {
      ceilTop = '#0a0a0c';
      ceilBottom = '#1e2024';
      floorTop = '#191b1f';
      floorBottom = '#3c4047';
    } else if (stage.theme === 'void') {
      ceilTop = '#000000';
      ceilBottom = '#0b0c14';
      floorTop = '#07080f';
      floorBottom = '#141624';
    }

    // Ceiling gradient
    const ceilGrad = ctx.createLinearGradient(0, 0, 0, horizon);
    ceilGrad.addColorStop(0, ceilTop);
    ceilGrad.addColorStop(1, ceilBottom);
    ctx.fillStyle = ceilGrad;
    ctx.fillRect(0, 0, width, horizon);

    // Floor gradient
    const floorGrad = ctx.createLinearGradient(0, horizon, 0, height);
    floorGrad.addColorStop(0, floorTop);
    floorGrad.addColorStop(1, floorBottom);
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, horizon, width, height - horizon);

    // Flashlight beam glow cone on the floor
    if (player.isFlashlightOn && player.flashlightBattery > 0) {
      const batteryMult = Math.min(1.0, player.flashlightBattery / 20);
      const coneGrad = ctx.createRadialGradient(
        width / 2,
        horizon + (height - horizon) * 0.45,
        15,
        width / 2,
        horizon + (height - horizon) * 0.45,
        width * 0.48
      );
      coneGrad.addColorStop(0, `rgba(255, 250, 220, ${0.16 * batteryMult * flickerFactor})`);
      coneGrad.addColorStop(0.5, `rgba(230, 225, 180, ${0.07 * batteryMult * flickerFactor})`);
      coneGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = coneGrad;
      ctx.fillRect(0, horizon, width, height - horizon);
    }
  }

  /**
   * Fast vertical slice drawing with lighting tint
   */
  private renderWallSlice(
    ctx: CanvasRenderingContext2D,
    screenX: number,
    drawStart: number,
    drawEnd: number,
    lineHeight: number,
    wallX: number,
    texName: string,
    side: number,
    lightFactor: number
  ) {
    const tex = textureLibrary.getTexture(texName);
    if (!tex) {
      // Fallback solid color
      ctx.fillStyle = side === 1 ? '#444' : '#666';
      ctx.fillRect(screenX, drawStart, 1, drawEnd - drawStart);
      return;
    }

    const texX = Math.floor(wallX * tex.width);
    const sliceHeight = drawEnd - drawStart;
    if (sliceHeight <= 0) return;

    // Apply side shading (horizontal walls slightly dimmer for depth)
    const sideMult = side === 1 ? 0.78 : 1.0;
    const finalLight = Math.max(0.04, Math.min(1.0, lightFactor * sideMult));

    // Choose base color from texture center or fallback for 1px columns
    const pIdx = Math.floor(tex.height / 2) * tex.width + texX;
    const rawPixel = tex.data[pIdx] || 0xff888888;

    // Extract RGBA from 32-bit uint
    const r = (rawPixel & 0xff);
    const g = ((rawPixel >> 8) & 0xff);
    const b = ((rawPixel >> 16) & 0xff);

    // Render slice with lighting
    ctx.fillStyle = `rgb(${Math.floor(r * finalLight)}, ${Math.floor(g * finalLight)}, ${Math.floor(b * finalLight)})`;
    ctx.fillRect(screenX, drawStart, 1, sliceHeight);

    // Subtle edge highlight for door / terminal
    if (texName.startsWith('wall_door') && (wallX < 0.05 || wallX > 0.95)) {
      ctx.fillStyle = `rgba(20, 20, 20, ${0.6 * finalLight})`;
      ctx.fillRect(screenX, drawStart, 1, sliceHeight);
    }
  }

  /**
   * Calculate realistic lighting attenuation + flashlight spotlight cone
   */
  private calculateLighting(
    distance: number,
    cameraX: number, // -1 to 1 across screen width
    isFlashlightOn: boolean,
    battery: number,
    stage: StageConfig,
    flickerFactor: number
  ): number {
    // Base ambient falloff
    const baseFog = Math.max(0, 1 - distance / stage.lighting.fogDistance);
    let intensity = stage.lighting.ambientIntensity * baseFog * flickerFactor;

    // Flashlight spotlight beam cone (centralized around cameraX = 0)
    if (isFlashlightOn && battery > 0) {
      const beamAngleFactor = Math.max(0, 1 - Math.abs(cameraX) * 1.6); // Spotlight cone
      const beamDistFactor = Math.max(0, 1 - distance / stage.lighting.flashlightRange);
      const batteryMult = Math.min(1.0, battery / 20);

      const flashlightBoost = beamAngleFactor * beamDistFactor * 1.4 * batteryMult;
      intensity += flashlightBoost;
    }

    return Math.max(0.02, Math.min(1.0, intensity));
  }

  /**
   * Render 2.5D billboard sprites for entities and items
   */
  private renderSprites(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    horizon: number,
    player: PlayerState,
    stage: StageConfig,
    entities: Entity[],
    items: WorldItem[],
    dirX: number,
    dirY: number,
    planeX: number,
    planeY: number,
    flickerFactor: number
  ) {
    // Combine entities and uncollected items
    type SpriteItem = {
      x: number;
      y: number;
      dist: number;
      texName: string;
      scale: number;
      isEntity: boolean;
      entity?: Entity;
      item?: WorldItem;
    };

    const sprites: SpriteItem[] = [];

    // Entities
    for (const ent of entities) {
      const dx = ent.x - player.x;
      const dy = ent.y - player.y;
      const dist = dx * dx + dy * dy;

      let tex = 'sprite_smiler';
      if (ent.type === 'hound') tex = 'sprite_hound';
      else if (ent.type === 'shade') tex = 'sprite_shade';
      else if (ent.type === 'stalker') tex = 'sprite_stalker';
      else if (ent.type === 'glitch') tex = 'sprite_glitch';

      sprites.push({
        x: ent.x,
        y: ent.y,
        dist,
        texName: tex,
        scale: ent.type === 'hound' ? 0.8 : 1.15,
        isEntity: true,
        entity: ent,
      });
    }

    // Items
    for (const item of items) {
      if (item.collected) continue;
      const dx = item.x - player.x;
      const dy = item.y - player.y;
      const dist = dx * dx + dy * dy;

      let tex = 'sprite_battery';
      let itemScale = 0.6;
      if (item.type === 'keycard') {
        tex = 'sprite_keycard';
        itemScale = 0.65;
      } else if (item.type === 'note') {
        tex = 'sprite_note';
        itemScale = 0.62;
      } else if (item.type === 'fuse') {
        tex = 'sprite_fuse';
        itemScale = 0.65;
      } else if (item.type === 'valve_wheel') {
        tex = 'sprite_valve';
        itemScale = 0.78; // Larger and distinct in water corridors
      }

      sprites.push({
        x: item.x,
        y: item.y,
        dist,
        texName: tex,
        scale: itemScale,
        isEntity: false,
        item,
      });
    }

    // Sort sprites back-to-front
    sprites.sort((a, b) => b.dist - a.dist);

    const invDet = 1.0 / (planeX * dirY - dirX * planeY);

    for (const sp of sprites) {
      const spriteX = sp.x - player.x;
      const spriteY = sp.y - player.y;

      // Transform with camera matrix
      const transformX = invDet * (dirY * spriteX - dirX * spriteY);
      const transformY = invDet * (-planeY * spriteX + planeX * spriteY);

      if (transformY <= 0.2) continue; // Behind camera or too close

      const spriteScreenX = Math.floor((width / 2) * (1 + transformX / transformY));
      const spriteDist = transformY;

      // Sprite dimensions
      const spriteHeight = Math.abs(Math.floor((height / transformY) * sp.scale));
      const spriteWidth = spriteHeight;

      const drawStartY = Math.max(0, Math.floor(-spriteHeight / 2 + horizon + (sp.isEntity ? 0 : spriteHeight * 0.35)));
      const drawEndY = Math.min(height - 1, Math.floor(spriteHeight / 2 + horizon + (sp.isEntity ? 0 : spriteHeight * 0.35)));

      const drawStartX = Math.max(0, Math.floor(-spriteWidth / 2 + spriteScreenX));
      const drawEndX = Math.min(width - 1, Math.floor(spriteWidth / 2 + spriteScreenX));

      const tex = textureLibrary.getTexture(sp.texName);
      if (!tex) continue;

      // Center lighting calculation for sprite
      const cameraXNorm = (spriteScreenX / width) * 2 - 1;
      let lightFactor = this.calculateLighting(
        spriteDist,
        cameraXNorm,
        player.isFlashlightOn,
        player.flashlightBattery,
        stage,
        flickerFactor
      );

      // Give uncollected items an emissive minimum glow so valves & fuses don't vanish in shadows
      if (!sp.isEntity && sp.item) {
        const isObjectiveItem = sp.item.type === 'valve_wheel' || sp.item.type === 'fuse' || sp.item.type === 'keycard';
        const minGlow = isObjectiveItem ? 0.48 : 0.36;
        lightFactor = Math.max(minGlow, lightFactor);
      }

      // Draw sprite columns
      for (let stripe = drawStartX; stripe < drawEndX; stripe++) {
        if (stripe >= 0 && stripe < width && transformY < this.zBuffer[stripe]) {
          const texX = Math.floor(((stripe - (-spriteWidth / 2 + spriteScreenX)) * tex.width) / spriteWidth);
          if (texX < 0 || texX >= tex.width) continue;

          for (let y = drawStartY; y < drawEndY; y++) {
            const d = (y - (sp.isEntity ? 0 : spriteHeight * 0.35) - horizon) * 256 + spriteHeight * 128;
            const texY = Math.floor((d * tex.height) / (spriteHeight * 256));
            if (texY < 0 || texY >= tex.height) continue;

            const pIdx = texY * tex.width + texX;
            const rawPixel = tex.data[pIdx];
            const a = ((rawPixel >> 24) & 0xff);
            if (a < 20) continue; // Transparent

            const r = (rawPixel & 0xff);
            const g = ((rawPixel >> 8) & 0xff);
            const b = ((rawPixel >> 16) & 0xff);

            // Stun or alert glow on entity
            let alertTintR = 1.0;
            let alertTintG = 1.0;
            let alertTintB = 1.0;

            if (sp.isEntity && sp.entity) {
              if (sp.entity.state === 'chase') {
                alertTintR = 1.4;
                alertTintG = 0.8;
                alertTintB = 0.8;
              } else if (sp.entity.state === 'stunned') {
                alertTintR = 1.3;
                alertTintG = 1.3;
                alertTintB = 0.7;
              }
            }

            ctx.fillStyle = `rgb(${Math.floor(r * lightFactor * alertTintR)}, ${Math.floor(g * lightFactor * alertTintG)}, ${Math.floor(b * lightFactor * alertTintB)})`;
            ctx.fillRect(stripe, y, 1, 1);
          }
        }
      }
    }
  }

  /**
   * Check if player is facing an interactable target (item, terminal, or unlocked door)
   * Only returns an interaction target when directly looking at it without wall obstruction.
   */
  public checkInteractionTarget(
    player: PlayerState,
    stage: StageConfig,
    items: WorldItem[],
    doorUnlocked: boolean
  ): InteractionTarget {
    const dirX = Math.cos(player.angle);
    const dirY = Math.sin(player.angle);

    // 1. Check nearby items in front with strict view cone and line of sight
    let bestItem: { item: WorldItem; dist: number } | null = null;

    for (const item of items) {
      if (item.collected) continue;
      const dx = item.x - player.x;
      const dy = item.y - player.y;
      const dist = Math.hypot(dx, dy);

      // Must be within interaction distance (<= 2.2m)
      if (dist <= 2.2) {
        const angleToItem = Math.atan2(dy, dx);
        let diff = Math.abs(player.angle - angleToItem);
        while (diff > Math.PI) diff -= Math.PI * 2;
        diff = Math.abs(diff);

        // Player must be facing the item with natural field of view
        const inCone = (dist <= 1.2 && diff <= 0.85) || (dist <= 2.2 && diff <= 0.58);

        if (inCone) {
          // Must have clear line of sight (not obstructed by any wall)
          if (checkLineOfSight(player.x, player.y, item.x, item.y, stage)) {
            if (!bestItem || dist < bestItem.dist) {
              bestItem = { item, dist };
            }
          }
        }
      }
    }

    if (bestItem) {
      return {
        type: 'item',
        distance: bestItem.dist,
        item: bestItem.item,
      };
    }

    // 2. Cast forward ray into map for Door or Puzzle Terminal
    let rayX = player.x;
    let rayY = player.y;
    const stepSize = 0.05;
    const maxRange = 2.2; // Realistic arm's reach distance

    for (let d = 0; d < maxRange; d += stepSize) {
      rayX += dirX * stepSize;
      rayY += dirY * stepSize;

      const mx = Math.floor(rayX);
      const my = Math.floor(rayY);

      if (mx >= 0 && mx < stage.mapWidth && my >= 0 && my < stage.mapHeight) {
        const cell = stage.map[my][mx];
        if (cell === 1) {
          // Solid wall blocks forward ray
          break;
        } else if (cell === 2) {
          // Exit Door: ONLY return interactable when unlocked so [E] button is not shown when locked
          if (doorUnlocked) {
            return {
              type: 'door',
              distance: d,
              doorUnlocked: true,
            };
          }
          // If locked, stop ray (sealed fire door cannot be opened via [E])
          break;
        } else if (cell === 3) {
          // Breaker / Terminal Puzzle
          return {
            type: 'terminal',
            distance: d,
          };
        }
      }
    }

    return { type: 'none', distance: 999 };
  }
}

export const raycasterEngine = new RaycasterEngine();
