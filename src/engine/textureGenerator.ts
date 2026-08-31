/**
 * Procedural Texture & Sprite Generator for Liminal Space Core Engine
 * Generates 64x64 pixel buffers for walls, floors, ceilings, items, and entities.
 */

export interface TextureData {
  width: number;
  height: number;
  data: Uint32Array; // ABGR / RGBA 32-bit color values for fast raycast sampling
}

export class TextureLibrary {
  private textures: Map<string, TextureData> = new Map();
  private isLoaded = false;

  public init() {
    if (this.isLoaded) return;
    const size = 64;

    // Helper to generate texture from offscreen canvas
    const makeTexture = (name: string, painter: (ctx: CanvasRenderingContext2D, s: number) => void) => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      painter(ctx, size);

      const imgData = ctx.getImageData(0, 0, size, size);
      const uint32Data = new Uint32Array(imgData.data.buffer);
      this.textures.set(name, {
        width: size,
        height: size,
        data: uint32Data,
      });
    };

    // 1. Mono-Yellow Backrooms Wall (Iconic damp yellow wallpaper with vertical lines & water stains)
    makeTexture('wall_backrooms', (ctx, s) => {
      // Base yellow damp tone
      ctx.fillStyle = '#caa54d';
      ctx.fillRect(0, 0, s, s);

      // Subtle vertical wallpaper stripes
      ctx.fillStyle = '#be983e';
      for (let x = 0; x < s; x += 8) {
        ctx.fillRect(x, 0, 4, s);
      }

      // Mold and water damage stains at base
      const gradient = ctx.createLinearGradient(0, s - 18, 0, s);
      gradient.addColorStop(0, 'rgba(85, 80, 45, 0)');
      gradient.addColorStop(1, 'rgba(65, 60, 30, 0.7)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, s - 18, s, 18);

      // Random damp specks
      ctx.fillStyle = '#8f7734';
      for (let i = 0; i < 40; i++) {
        const rx = Math.floor(Math.random() * s);
        const ry = Math.floor(Math.random() * s);
        ctx.fillRect(rx, ry, 1 + (i % 2), 1 + (i % 2));
      }
    });

    // 2. Yellow Damp Carpet Floor
    makeTexture('floor_carpet', (ctx, s) => {
      ctx.fillStyle = '#7a6738';
      ctx.fillRect(0, 0, s, s);

      // Carpet fiber noise
      for (let x = 0; x < s; x += 2) {
        for (let y = 0; y < s; y += 2) {
          const shade = ((x * 17 + y * 23) % 25) - 12;
          ctx.fillStyle = `rgb(${110 + shade}, ${95 + shade}, ${50 + shade})`;
          ctx.fillRect(x, y, 2, 2);
        }
      }
    });

    // 3. Drop Ceiling with Acoustic Tiles & Fluorescent Tube Fixtures
    makeTexture('ceil_office', (ctx, s) => {
      ctx.fillStyle = '#ded9c3';
      ctx.fillRect(0, 0, s, s);

      // Tile grid lines
      ctx.strokeStyle = '#9c9580';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, s, s);
      ctx.strokeRect(0, 0, s / 2, s);

      // Recessed fluorescent tube fixture in center
      ctx.fillStyle = '#3a3a38';
      ctx.fillRect(20, 4, 24, s - 8);

      ctx.fillStyle = '#fffdf0'; // Glowing tube
      ctx.fillRect(24, 6, 16, s - 12);
    });

    // 4. Poolrooms Wall: Clean 8x8 white-cyan tiles with dark grout
    makeTexture('wall_pool', (ctx, s) => {
      ctx.fillStyle = '#1c6f8a'; // Grout color
      ctx.fillRect(0, 0, s, s);

      const tileSize = 8;
      for (let x = 1; x < s; x += tileSize) {
        for (let y = 1; y < s; y += tileSize) {
          // Subtle tile variation
          const variation = ((x * 13 + y * 7) % 15);
          ctx.fillStyle = `rgb(${210 + variation}, ${242 + variation}, ${248})`;
          ctx.fillRect(x, y, tileSize - 1, tileSize - 1);
        }
      }
    });

    // 5. Poolrooms Floor: Submerged Shallow Turquoise Water
    makeTexture('floor_pool_water', (ctx, s) => {
      ctx.fillStyle = '#1e758a';
      ctx.fillRect(0, 0, s, s);

      // Water caustics
      ctx.strokeStyle = 'rgba(230, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(20, 25, 14, 0, Math.PI * 1.6);
      ctx.arc(45, 40, 18, 0, Math.PI * 1.8);
      ctx.stroke();
    });

    // 6. Hotel Damask Wallpaper Wall (Vintage crimson damask & dark walnut wainscoting)
    makeTexture('wall_hotel', (ctx, s) => {
      // Top 65%: Crimson damask
      ctx.fillStyle = '#5c171e';
      ctx.fillRect(0, 0, s, 42);

      // Damask diamond patterns
      ctx.fillStyle = '#7a222c';
      for (let x = 4; x < s; x += 16) {
        for (let y = 4; y < 40; y += 16) {
          ctx.beginPath();
          ctx.moveTo(x + 8, y);
          ctx.lineTo(x + 16, y + 8);
          ctx.lineTo(x + 8, y + 16);
          ctx.lineTo(x, y + 8);
          ctx.fill();
        }
      }

      // Brass dividing molding trim
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(0, 42, s, 3);

      // Bottom 35%: Dark polished walnut panel
      ctx.fillStyle = '#26120b';
      ctx.fillRect(0, 45, s, s - 45);

      ctx.fillStyle = '#3a1b10';
      ctx.fillRect(4, 48, 24, 12);
      ctx.fillRect(36, 48, 24, 12);
    });

    // 7. Hotel Floor Carpet: Deep vintage geometric runner
    makeTexture('floor_hotel_carpet', (ctx, s) => {
      ctx.fillStyle = '#3d161a';
      ctx.fillRect(0, 0, s, s);

      // Hexagonal / diamond orange-gold runner pattern
      ctx.fillStyle = '#c76e2a';
      for (let x = 0; x < s; x += 16) {
        ctx.fillRect(x + 4, 4, 8, 8);
        ctx.fillRect(x + 12, 12, 4, 4);
      }
    });

    // 8. Industrial Sub-Level Concrete & Hazard Stripes Wall
    makeTexture('wall_tunnels', (ctx, s) => {
      ctx.fillStyle = '#545657';
      ctx.fillRect(0, 0, s, s);

      // Concrete grit
      for (let i = 0; i < 80; i++) {
        const x = (i * 29) % s;
        const y = (i * 47) % s;
        ctx.fillStyle = i % 2 === 0 ? '#383a3b' : '#6f7173';
        ctx.fillRect(x, y, 2, 2);
      }

      // Yellow / Black caution warning band at eye level
      for (let x = 0; x < s; x += 8) {
        ctx.fillStyle = (x / 8) % 2 === 0 ? '#e6b800' : '#1a1a1a';
        ctx.fillRect(x, 26, 8, 12);
      }

      // Heavy industrial metal rust rivets
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(4, 4, 4, 4);
      ctx.fillRect(s - 8, 4, 4, 4);
      ctx.fillRect(4, s - 8, 4, 4);
      ctx.fillRect(s - 8, s - 8, 4, 4);
    });

    // 9. Void / Threshold Glitch Wall
    makeTexture('wall_void', (ctx, s) => {
      ctx.fillStyle = '#101014';
      ctx.fillRect(0, 0, s, s);

      // Glitch color shift lines
      ctx.fillStyle = '#00ffc4';
      ctx.fillRect(0, 18, s, 2);
      ctx.fillStyle = '#ff0055';
      ctx.fillRect(8, 22, s - 16, 2);

      // Static noise
      for (let i = 0; i < 100; i++) {
        const x = (i * 37) % s;
        const y = (i * 59) % s;
        ctx.fillStyle = i % 3 === 0 ? '#ffffff' : '#2d3748';
        ctx.fillRect(x, y, 1, 1);
      }
    });

    // 10. Heavy Locked Security Exit Door
    makeTexture('wall_door_locked', (ctx, s) => {
      ctx.fillStyle = '#2b2d30';
      ctx.fillRect(0, 0, s, s);

      // Door frame
      ctx.strokeStyle = '#4a4d52';
      ctx.lineWidth = 3;
      ctx.strokeRect(6, 4, s - 12, s - 6);

      // Illuminated Red "EXIT - LOCKED" Sign
      ctx.fillStyle = '#400';
      ctx.fillRect(16, 8, 32, 10);
      ctx.fillStyle = '#ff2222';
      ctx.fillRect(18, 10, 28, 6);

      // Heavy reinforced bars
      ctx.fillStyle = '#1c1d1f';
      ctx.fillRect(12, 24, s - 24, 6);
      ctx.fillRect(12, 42, s - 24, 6);

      // Keypad/Scanner module
      ctx.fillStyle = '#ff3333';
      ctx.beginPath();
      ctx.arc(s - 14, 34, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // 11. Heavy Exit Door UNLOCKED (Glowing Green)
    makeTexture('wall_door_open', (ctx, s) => {
      ctx.fillStyle = '#18191b';
      ctx.fillRect(0, 0, s, s);

      // Door frame
      ctx.strokeStyle = '#4a4d52';
      ctx.lineWidth = 3;
      ctx.strokeRect(6, 4, s - 12, s - 6);

      // Glowing Green "EXIT - UNLOCKED"
      ctx.fillStyle = '#040';
      ctx.fillRect(16, 8, 32, 10);
      ctx.fillStyle = '#00ff66';
      ctx.fillRect(18, 10, 28, 6);

      // Open ajar center slit showing bright daylight/hallway
      ctx.fillStyle = '#faffdb';
      ctx.fillRect(26, 18, 12, s - 20);

      // Green scanner light
      ctx.fillStyle = '#00ff66';
      ctx.beginPath();
      ctx.arc(s - 14, 34, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // 12. Interactive Puzzle Terminal Wall
    makeTexture('wall_terminal', (ctx, s) => {
      ctx.fillStyle = '#3a3e42';
      ctx.fillRect(0, 0, s, s);

      // Metal breaker/junction box housing
      ctx.fillStyle = '#222528';
      ctx.fillRect(10, 8, s - 20, s - 16);
      ctx.strokeStyle = '#626870';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 8, s - 20, s - 16);

      // Screen or gauge dial
      ctx.fillStyle = '#0d1b1e';
      ctx.fillRect(16, 14, 32, 16);

      // Glowing status LED & interface prompts
      ctx.fillStyle = '#f5a623';
      ctx.fillRect(18, 18, 14, 4);
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath();
      ctx.arc(42, 20, 3, 0, Math.PI * 2);
      ctx.fill();

      // Industrial switches/valve dials
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(16, 36, 8, 12);
      ctx.fillStyle = '#2980b9';
      ctx.fillRect(28, 36, 8, 12);
      ctx.fillStyle = '#27ae60';
      ctx.fillRect(40, 36, 8, 12);
    });

    // --- SPRITES (Entities and Items) ---

    // 13. Sprite: The Smiler / Lurker (Silhouette with eerie wide toothy smile and luminous eyes)
    makeTexture('sprite_smiler', (ctx, s) => {
      ctx.clearRect(0, 0, s, s);
      // Dark smoky vapor silhouette
      ctx.fillStyle = 'rgba(10, 10, 12, 0.95)';
      ctx.beginPath();
      ctx.ellipse(32, 34, 18, 28, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glowing white piercing eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(24, 22, 3.5, 0, Math.PI * 2);
      ctx.arc(40, 22, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Luminescent broad grin with jagged teeth
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(32, 32, 12, 0.15, Math.PI - 0.15, false);
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Vertical tooth cuts
      ctx.fillStyle = '#0a0a0c';
      for (let x = 24; x <= 40; x += 4) {
        ctx.fillRect(x, 38, 1.5, 5);
      }
    });

    // 14. Sprite: The Hound / Murmur (Poolrooms aquatic crawler)
    makeTexture('sprite_hound', (ctx, s) => {
      ctx.clearRect(0, 0, s, s);
      ctx.fillStyle = '#1c1e24';

      // Low quadrupedal hunched body
      ctx.beginPath();
      ctx.ellipse(32, 40, 22, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Long creeping spidery limbs
      ctx.strokeStyle = '#14161a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(18, 42); ctx.lineTo(6, 60);
      ctx.moveTo(46, 42); ctx.lineTo(58, 60);
      ctx.moveTo(26, 44); ctx.lineTo(16, 62);
      ctx.moveTo(38, 44); ctx.lineTo(48, 62);
      ctx.stroke();

      // Head with pale yellow reflective eyes
      ctx.fillStyle = '#fff59d';
      ctx.beginPath();
      ctx.arc(26, 34, 2.5, 0, Math.PI * 2);
      ctx.arc(38, 34, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 15. Sprite: The Bellhop Shade (Hotel Entity with lantern)
    makeTexture('sprite_shade', (ctx, s) => {
      ctx.clearRect(0, 0, s, s);
      // Tall slender silhouette
      ctx.fillStyle = '#110d14';
      ctx.fillRect(25, 14, 14, 46);

      // Vintage pillbox hat
      ctx.fillStyle = '#611624';
      ctx.fillRect(24, 6, 16, 6);

      // Swinging lantern in hand
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(39, 32);
      ctx.lineTo(48, 42);
      ctx.stroke();

      // Lantern glow
      ctx.fillStyle = '#ffaa33';
      ctx.beginPath();
      ctx.arc(48, 46, 7, 0, Math.PI * 2);
      ctx.fill();
    });

    // 16. Sprite: The Stalker (Sub-level mechanical entity)
    makeTexture('sprite_stalker', (ctx, s) => {
      ctx.clearRect(0, 0, s, s);
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.ellipse(32, 28, 12, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sharp wire legs
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(24, 40); ctx.lineTo(10, 62);
      ctx.moveTo(40, 40); ctx.lineTo(54, 62);
      ctx.stroke();

      // Red single searching eye lens
      ctx.fillStyle = '#ff0033';
      ctx.beginPath();
      ctx.arc(32, 20, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(31, 19, 2, 2);
    });

    // 17. Sprite: The Glitch Entity (Void level shifting artifact)
    makeTexture('sprite_glitch', (ctx, s) => {
      ctx.clearRect(0, 0, s, s);
      ctx.fillStyle = 'rgba(0, 255, 200, 0.7)';
      ctx.fillRect(20, 10, 24, 44);

      ctx.fillStyle = 'rgba(255, 0, 100, 0.7)';
      ctx.fillRect(24, 14, 20, 40);

      ctx.fillStyle = '#fff';
      ctx.fillRect(28, 20, 8, 8);
    });

    // 18. Sprite: Flashlight Battery Pickup
    makeTexture('sprite_battery', (ctx, s) => {
      ctx.clearRect(0, 0, s, s);
      // Battery cylinder
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(22, 20, 20, 32);

      // Terminal nub
      ctx.fillStyle = '#d97706';
      ctx.fillRect(27, 16, 10, 4);

      // Acid green glow charge label
      ctx.fillStyle = '#10b981';
      ctx.fillRect(24, 28, 16, 16);

      // Bolt icon
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(33, 30);
      ctx.lineTo(29, 36);
      ctx.lineTo(34, 36);
      ctx.lineTo(31, 42);
      ctx.stroke();
    });

    // 19. Sprite: Keycard Pickup
    makeTexture('sprite_keycard', (ctx, s) => {
      ctx.clearRect(0, 0, s, s);
      // Yellow security badge
      ctx.fillStyle = '#eab308';
      ctx.fillRect(18, 24, 28, 36);

      // Magnetic black stripe
      ctx.fillStyle = '#111827';
      ctx.fillRect(20, 28, 24, 8);

      // Photo / chip
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(22, 40, 10, 12);
    });

    // 20. Sprite: Survivor Note Document
    makeTexture('sprite_note', (ctx, s) => {
      ctx.clearRect(0, 0, s, s);
      // Aged paper with curled corner
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(18, 18, 28, 36);

      // Black text lines
      ctx.fillStyle = '#78350f';
      ctx.fillRect(22, 24, 20, 2);
      ctx.fillRect(22, 28, 18, 2);
      ctx.fillRect(22, 32, 20, 2);
      ctx.fillRect(22, 36, 14, 2);

      // Red tape on top
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(28, 15, 8, 5);
    });

    // 21. Sprite: Electrical Fuse Pickup
    makeTexture('sprite_fuse', (ctx, s) => {
      ctx.clearRect(0, 0, s, s);
      // Glass cylinder
      ctx.fillStyle = 'rgba(186, 230, 253, 0.8)';
      ctx.fillRect(22, 22, 20, 28);

      // Copper metallic caps
      ctx.fillStyle = '#b45309';
      ctx.fillRect(20, 16, 24, 6);
      ctx.fillRect(20, 50, 24, 6);

      // Glowing filament wire
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(32, 22);
      ctx.lineTo(32, 50);
      ctx.stroke();
    });

    // 22. Sprite: High-Visibility Hydro Valve Wheel Pickup (Full 64x64 scale)
    makeTexture('sprite_valve', (ctx, s) => {
      ctx.clearRect(0, 0, s, s);

      // Outer glowing rim aura
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(32, 32, 27, 0, Math.PI * 2);
      ctx.stroke();

      // Heavy industrial red outer wheel rim
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.arc(32, 32, 25, 0, Math.PI * 2);
      ctx.stroke();

      // Polished brass inner beveled ring
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(32, 32, 22, 0, Math.PI * 2);
      ctx.stroke();

      // 4 Heavy-duty spokes
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(29, 8, 6, 48);
      ctx.fillRect(8, 29, 48, 6);

      // Brass spoke trim
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(30.5, 9, 3, 46);
      ctx.fillRect(9, 30.5, 46, 3);

      // Diagonal spokes for classic valve wheel look
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(16, 16);
      ctx.lineTo(48, 48);
      ctx.moveTo(48, 16);
      ctx.lineTo(16, 48);
      ctx.stroke();

      // Center heavy brass hub
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(32, 32, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(32, 32, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // Center chrome axle bolt
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(30.5, 30.5, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    this.isLoaded = true;
  }

  public getTexture(name: string): TextureData | undefined {
    return this.textures.get(name);
  }
}

export const textureLibrary = new TextureLibrary();
