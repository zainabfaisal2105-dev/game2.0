/**
 * Procedural Texture & Sprite Generator for Liminal Space Core Engine
 * Generates 64x64 pixel buffers for walls, floors, ceilings, items, and entities.
 */

export interface TextureData {
  width: number;
  height: number;
  data: Uint32Array; // ABGR / RGBA 32-bit color values for fast raycast sampling
  canvas: HTMLCanvasElement; // Offscreen canvas for fast hardware-accelerated slice rendering
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
        canvas: canvas,
      });
    };

    // 1. Mono-Yellow Backrooms Wall (Iconic damp yellow wallpaper with vertical lines, damask motifs & mold stains)
    makeTexture('wall_backrooms', (ctx, s) => {
      // Base yellow damp wallpaper tone
      ctx.fillStyle = '#caa54d';
      ctx.fillRect(0, 0, s, s);

      // Subtle vertical wallpaper repeat seams
      ctx.fillStyle = '#be983e';
      for (let x = 0; x < s; x += 8) {
        ctx.fillRect(x, 0, 4, s);
      }

      // Iconic repeating damask diamond wallpaper motifs
      ctx.fillStyle = '#b38d34';
      for (let x = 4; x < s; x += 16) {
        for (let y = 8; y < s - 10; y += 16) {
          ctx.beginPath();
          ctx.moveTo(x + 4, y);
          ctx.lineTo(x + 8, y + 4);
          ctx.lineTo(x + 4, y + 8);
          ctx.lineTo(x, y + 4);
          ctx.fill();
        }
      }

      // Mold and water damage stains rising from base
      const gradient = ctx.createLinearGradient(0, s - 24, 0, s);
      gradient.addColorStop(0, 'rgba(85, 80, 45, 0)');
      gradient.addColorStop(0.7, 'rgba(65, 55, 25, 0.6)');
      gradient.addColorStop(1, 'rgba(45, 38, 18, 0.9)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, s - 24, s, 24);

      // Dark mold spore specks
      ctx.fillStyle = '#5c4820';
      for (let i = 0; i < 35; i++) {
        const rx = (i * 17) % s;
        const ry = s - 16 + ((i * 23) % 16);
        ctx.fillRect(rx, ry, 1 + (i % 2), 1 + (i % 2));
      }

      // Pale cream acoustic ceiling trim at very top
      ctx.fillStyle = '#ded9c3';
      ctx.fillRect(0, 0, s, 3);
      ctx.fillStyle = '#8f8870';
      ctx.fillRect(0, 3, s, 1);

      // Dark wooden/rubber baseboard along bottom
      ctx.fillStyle = '#302213';
      ctx.fillRect(0, s - 6, s, 6);
      ctx.fillStyle = '#523c24';
      ctx.fillRect(0, s - 6, s, 1.5);
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

    // 4. Poolrooms Wall: Pristine 8x8 white-and-aqua glazed ceramic tiles with dark grout
    makeTexture('wall_pool', (ctx, s) => {
      ctx.fillStyle = '#0f4c5c'; // Dark cyan grout
      ctx.fillRect(0, 0, s, s);

      const tileSize = 8;
      for (let x = 1; x < s; x += tileSize) {
        for (let y = 1; y < s; y += tileSize) {
          // Subtle porcelain tile gradient
          const variation = ((x * 13 + y * 7) % 18);
          ctx.fillStyle = `rgb(${210 + variation}, ${240 + variation}, ${248})`;
          ctx.fillRect(x, y, tileSize - 1, tileSize - 1);

          // Specular glaze reflection corner on each tile
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.fillRect(x + 1, y + 1, 2, 2);
        }
      }

      // Top clean architectural crown tile border
      ctx.fillStyle = '#00a896';
      ctx.fillRect(0, 0, s, 3);

      // Submerged waterline caustics scum line near bottom
      const waterGrad = ctx.createLinearGradient(0, s - 16, 0, s);
      waterGrad.addColorStop(0, 'rgba(0, 168, 150, 0)');
      waterGrad.addColorStop(0.5, 'rgba(15, 76, 92, 0.45)');
      waterGrad.addColorStop(1, 'rgba(10, 40, 50, 0.7)');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, s - 16, s, 16);

      // Subtle waterline ripples
      ctx.fillStyle = '#e0fbfc';
      ctx.fillRect(0, s - 16, s, 1.5);
    });

    // 5. Poolrooms Floor: Submerged Shallow Turquoise Water
    makeTexture('floor_pool_water', (ctx, s) => {
      ctx.fillStyle = '#1e758a';
      ctx.fillRect(0, 0, s, s);

      // Underwater tile grid
      ctx.strokeStyle = 'rgba(10, 50, 65, 0.5)';
      ctx.lineWidth = 1;
      for (let i = 0; i < s; i += 16) {
        ctx.beginPath();
        ctx.moveTo(i, 0); ctx.lineTo(i, s);
        ctx.moveTo(0, i); ctx.lineTo(s, i);
        ctx.stroke();
      }

      // Water caustics
      ctx.strokeStyle = 'rgba(230, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(20, 25, 14, 0, Math.PI * 1.6);
      ctx.arc(45, 40, 18, 0, Math.PI * 1.8);
      ctx.stroke();
    });

    // 6. Abandoned Mall Wall (Shuttered Corrugated Steel Security Grille & Storefront)
    makeTexture('wall_mall', (ctx, s) => {
      // Background dark storefront void
      ctx.fillStyle = '#181a1f';
      ctx.fillRect(0, 0, s, s);

      // Upper storefront signage header (1990s beige/white stucco panel)
      ctx.fillStyle = '#e2ded5';
      ctx.fillRect(0, 0, s, 16);
      ctx.fillStyle = '#b8b2a3';
      ctx.fillRect(0, 15, s, 1);

      // Faded retro mall store sign: "STORE" / "ARCADE"
      ctx.fillStyle = '#ff007f'; // Retro neon pink
      ctx.fillRect(12, 4, 18, 7);
      ctx.fillStyle = '#00f0ff'; // Retro neon cyan
      ctx.fillRect(34, 4, 18, 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(14, 6, 14, 3);
      ctx.fillRect(36, 6, 14, 3);

      // Middle: Corrugated roll-down metal security gate
      ctx.fillStyle = '#32353b';
      ctx.fillRect(4, 16, s - 8, s - 24);

      // Horizontal metal grille slats
      for (let y = 18; y < s - 8; y += 4) {
        ctx.fillStyle = '#4c5058';
        ctx.fillRect(6, y, s - 12, 1.5);
        ctx.fillStyle = '#1e2024';
        ctx.fillRect(6, y + 1.5, s - 12, 1);
      }

      // Security padlock latch on gate center
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(s / 2 - 3, s - 14, 6, 5);

      // Side polished marble / granite pillars
      ctx.fillStyle = '#7a7e85';
      ctx.fillRect(0, 16, 4, s - 16);
      ctx.fillRect(s - 4, 16, 4, s - 16);
      for (let y = 16; y < s; y += 12) {
        ctx.fillStyle = '#52565c';
        ctx.fillRect(0, y, 4, 1);
        ctx.fillRect(s - 4, y, 4, 1);
      }

      // Bottom polished black terrazzo kickplate
      ctx.fillStyle = '#111214';
      ctx.fillRect(0, s - 8, s, 8);
      ctx.fillStyle = '#71757d';
      ctx.fillRect(0, s - 8, s, 1);
    });

    // 7. Abandoned Mall Wall Variant (Luminous Neon Signage & Display Window)
    makeTexture('wall_mall_neon', (ctx, s) => {
      ctx.fillStyle = '#14151a';
      ctx.fillRect(0, 0, s, s);

      // Upper facade
      ctx.fillStyle = '#2d2f38';
      ctx.fillRect(0, 0, s, 18);

      // Glowing pink and cyan neon sign with soft glow
      ctx.fillStyle = 'rgba(255, 0, 128, 0.35)';
      ctx.fillRect(6, 3, s - 12, 12);
      ctx.fillStyle = '#ff007f';
      ctx.fillRect(10, 5, 20, 8);
      ctx.fillStyle = '#00f5ff';
      ctx.fillRect(34, 5, 20, 8);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(12, 7, 16, 4);
      ctx.fillRect(36, 7, 16, 4);

      // Dark shop display glass window
      ctx.fillStyle = '#0b0d13';
      ctx.fillRect(4, 18, s - 8, s - 26);

      // Mannequin / clothing rack silhouettes in shadows
      ctx.fillStyle = '#181b22';
      ctx.beginPath();
      ctx.ellipse(22, 38, 6, 14, 0, 0, Math.PI * 2);
      ctx.ellipse(42, 38, 6, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glass reflection highlights
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(8, 20); ctx.lineTo(36, 52);
      ctx.moveTo(26, 20); ctx.lineTo(54, 52);
      ctx.stroke();

      // Brass window mullions
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(4, 18, s - 8, s - 26);

      // Bottom terrazzo kickplate
      ctx.fillStyle = '#0f1012';
      ctx.fillRect(0, s - 8, s, 8);
    });

    // 8. Abandoned Hospital Wall (Sterile Mint Tiles & Emergency Triage Guide Stripes)
    makeTexture('wall_hospital', (ctx, s) => {
      // Upper wall: Pale seafoam / mint institutional hospital paint
      ctx.fillStyle = '#c5ded5';
      ctx.fillRect(0, 0, s, 26);

      // Subtle horizontal paint lines & room sign plaque: "WARD 304 - ICU"
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(20, 8, 24, 10);
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(22, 10, 20, 2);
      ctx.fillStyle = '#dc2626'; // Biohazard red dot
      ctx.beginPath();
      ctx.arc(38, 14, 2, 0, Math.PI * 2);
      ctx.fill();

      // Middle: Bold Emergency Guide Line Stripe (Blue = ICU / Red = Emergency Trauma)
      ctx.fillStyle = '#0284c7'; // Blue guide line
      ctx.fillRect(0, 26, s, 4);
      ctx.fillStyle = '#dc2626'; // Red guide line
      ctx.fillRect(0, 30, s, 3);

      // Stainless steel protective wall crash rail / handrail
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(0, 33, s, 3);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, 35, s, 1);

      // Lower wall: White glazed ceramic subway tiles
      ctx.fillStyle = '#475569'; // Grout
      ctx.fillRect(0, 36, s, s - 42);

      const tW = 12;
      const tH = 6;
      for (let y = 37; y < s - 6; y += tH) {
        const row = Math.floor((y - 37) / tH);
        const xOffset = (row % 2) * (tW / 2);
        for (let x = -xOffset; x < s; x += tW) {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(Math.max(0, x), y, tW - 1, tH - 1);
        }
      }

      // Heavy dark rubber hospital cove baseboard
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, s - 6, s, 6);
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, s - 6, s, 1);
    });

    // 9. Abandoned Hospital Ward Door (Frosted Wire-Mesh Glass & Biohazard Sign)
    makeTexture('wall_hospital_door', (ctx, s) => {
      // Aluminum door frame
      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, 0, s, s);

      // Clinical green door face
      ctx.fillStyle = '#8fad9e';
      ctx.fillRect(4, 4, s - 8, s - 4);

      // Narrow vertical observation window
      ctx.fillStyle = '#334155';
      ctx.fillRect(24, 10, 16, 26);
      ctx.fillStyle = '#dbeafe'; // Frosted glass
      ctx.fillRect(26, 12, 12, 22);

      // Chicken-wire reinforcement grid inside window
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.6)';
      ctx.lineWidth = 1;
      for (let i = 14; i < 34; i += 4) {
        ctx.beginPath();
        ctx.moveTo(26, i); ctx.lineTo(38, i + 3);
        ctx.moveTo(38, i); ctx.lineTo(26, i + 3);
        ctx.stroke();
      }

      // Faint dark silhouette visible behind frosted glass!
      ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
      ctx.beginPath();
      ctx.ellipse(32, 22, 3.5, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Red Biohazard / Authorized Personnel Warning Sign
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(18, 38, 28, 8);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(20, 40, 24, 4);

      // Stainless steel push plate / handle
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(s - 12, 34, 5, 14);

      // Heavy metal kickplate along bottom
      ctx.fillStyle = '#475569';
      ctx.fillRect(4, s - 10, s - 8, 10);
    });

    // 10. Infinite School Wall (Olive-Green Metal Lockers & Classroom Door)
    makeTexture('wall_school', (ctx, s) => {
      // Hallway top: Institutional beige cinderblock / plaster
      ctx.fillStyle = '#d4cbb8';
      ctx.fillRect(0, 0, s, 10);
      ctx.fillStyle = '#9c927f';
      ctx.fillRect(0, 9, s, 1);

      // Left half: Classic school metal lockers
      ctx.fillStyle = '#3b5e43'; // Olive green locker
      ctx.fillRect(0, 10, 28, s - 16);

      // Locker vertical seam and border
      ctx.fillStyle = '#263d2b';
      ctx.fillRect(28, 10, 2, s - 16);
      ctx.fillRect(0, 10, 2, s - 16);

      // Stamped ventilation louvers at top and bottom
      ctx.fillStyle = '#1c2d20';
      for (let y = 14; y <= 20; y += 2) {
        ctx.fillRect(6, y, 16, 1);
      }
      for (let y = s - 24; y <= s - 18; y += 2) {
        ctx.fillRect(6, y, 16, 1);
      }

      // Chrome combination dial lock & locker number
      ctx.fillStyle = '#f59e0b'; // Number plate
      ctx.fillRect(10, 24, 8, 4);
      ctx.fillStyle = '#94a3b8'; // Chrome dial
      ctx.beginPath();
      ctx.arc(14, 34, 3, 0, Math.PI * 2);
      ctx.fill();

      // Right half: Golden oak classroom wooden door
      ctx.fillStyle = '#8a5d3b';
      ctx.fillRect(30, 10, s - 30, s - 16);
      ctx.strokeStyle = '#573a24';
      ctx.lineWidth = 1;
      ctx.strokeRect(32, 12, s - 36, s - 20);

      // Classroom wire-mesh glass viewing window
      ctx.fillStyle = '#dbeafe';
      ctx.fillRect(36, 16, 18, 18);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(36, 16, 18, 18);
      // Chicken wire diagonals
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
      ctx.beginPath();
      ctx.moveTo(36, 18); ctx.lineTo(54, 32);
      ctx.moveTo(36, 26); ctx.lineTo(54, 20);
      ctx.stroke();

      // Round brass classroom door knob
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(38, 40, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Bottom dark brown baseboard
      ctx.fillStyle = '#2b1b12';
      ctx.fillRect(0, s - 6, s, 6);
      ctx.fillStyle = '#4a3020';
      ctx.fillRect(0, s - 6, s, 1);
    });

    // 11. School Lockers Bank Variant (3 Continuous Full-Height Metal Lockers)
    makeTexture('wall_school_locker', (ctx, s) => {
      // Top wall trim
      ctx.fillStyle = '#cfc5b0';
      ctx.fillRect(0, 0, s, 8);

      // 3 side-by-side lockers
      const lW = 20;
      for (let i = 0; i < 3; i++) {
        const lx = 2 + i * lW;
        // Locker face
        ctx.fillStyle = i % 2 === 0 ? '#38593f' : '#2f4f37';
        ctx.fillRect(lx, 8, lW - 2, s - 14);

        // Frame line
        ctx.fillStyle = '#1c3022';
        ctx.strokeRect(lx, 8, lW - 2, s - 14);

        // Louvers
        ctx.fillStyle = '#18261b';
        for (let y = 12; y <= 18; y += 2) {
          ctx.fillRect(lx + 3, y, lW - 8, 1);
        }
        for (let y = s - 20; y <= s - 14; y += 2) {
          ctx.fillRect(lx + 3, y, lW - 8, 1);
        }

        // Brass number plate: 201, 202, 203
        ctx.fillStyle = '#eab308';
        ctx.fillRect(lx + 6, 22, 6, 3);

        // Combination dial
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(lx + 9, 32, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Baseboard
      ctx.fillStyle = '#22150e';
      ctx.fillRect(0, s - 6, s, 6);
    });

    // 12. Hotel Damask Wallpaper Wall (Vintage crimson damask & dark walnut wainscoting)
    makeTexture('wall_hotel', (ctx, s) => {
      ctx.fillStyle = '#5c171e';
      ctx.fillRect(0, 0, s, 42);

      // Damask patterns
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

      ctx.fillStyle = '#d4af37';
      ctx.fillRect(0, 42, s, 3);

      ctx.fillStyle = '#26120b';
      ctx.fillRect(0, 45, s, s - 45);
      ctx.fillStyle = '#3a1b10';
      ctx.fillRect(4, 48, 24, 12);
      ctx.fillRect(36, 48, 24, 12);
    });

    // 13. Industrial Sub-Level Concrete & Hazard Stripes Wall
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

    // 14. Void / Threshold Glitch Wall
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

    // 14b. Infinite Dilapidated Corporate Office Wall (Fabric Cubicle Partitions & Corkboard Memos)
    makeTexture('wall_office', (ctx, s) => {
      // Upper office dry-wall: dingy beige/taupe
      ctx.fillStyle = '#c7beaf';
      ctx.fillRect(0, 0, s, 22);

      // Aluminum ceiling edge channel
      ctx.fillStyle = '#8c867b';
      ctx.fillRect(0, 0, s, 2);

      // Fluorescent electrical switch plate
      ctx.fillStyle = '#f3eee4';
      ctx.fillRect(16, 6, 8, 12);
      ctx.fillStyle = '#5c574f';
      ctx.fillRect(19, 10, 2, 4);

      // Mid section: Modular acoustic tweed cubicle fabric partition
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(0, 22, s, s - 30);

      // Fabric weave texture
      for (let x = 0; x < s; x += 2) {
        for (let y = 22; y < s - 8; y += 2) {
          const v = ((x * 19 + y * 29) % 20) - 10;
          ctx.fillStyle = `rgb(${105 + v}, ${112 + v}, ${125 + v})`;
          ctx.fillRect(x, y, 1.5, 1.5);
        }
      }

      // Aluminum frame dividing vertical struts
      ctx.fillStyle = '#4b5563';
      ctx.fillRect(0, 22, 3, s - 28);
      ctx.fillRect(s - 3, 22, 3, s - 28);

      // Lower rubber dark gray office baseboard
      ctx.fillStyle = '#1f242d';
      ctx.fillRect(0, s - 8, s, 8);
      ctx.fillStyle = '#374151';
      ctx.fillRect(0, s - 8, s, 1.5);
    });

    makeTexture('wall_office_cubicle', (ctx, s) => {
      // Dry-wall header
      ctx.fillStyle = '#c0b7a8';
      ctx.fillRect(0, 0, s, 18);

      // Cubicle partition
      ctx.fillStyle = '#5c6470';
      ctx.fillRect(0, 18, s, s - 26);

      // Cork notice board with pinned sticky notes
      ctx.fillStyle = '#b48a52';
      ctx.fillRect(8, 22, 48, 26);
      ctx.strokeStyle = '#6b4f2c';
      ctx.lineWidth = 1;
      ctx.strokeRect(8, 22, 48, 26);

      // Yellow sticky notes pinned on board
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(12, 26, 12, 10);
      ctx.fillRect(28, 28, 14, 12);
      ctx.fillStyle = '#fbcfe8'; // Pink memo
      ctx.fillRect(14, 38, 12, 8);
      // Red pushpins
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(17, 24, 2, 2);
      ctx.fillRect(34, 26, 2, 2);

      // Dark rubber baseboard
      ctx.fillStyle = '#181c24';
      ctx.fillRect(0, s - 8, s, 8);
    });

    // 15. Heavy Locked Security Exit Door
    makeTexture('wall_door_locked', (ctx, s) => {
      ctx.fillStyle = '#2b2d30';
      ctx.fillRect(0, 0, s, s);

      // Door frame
      ctx.strokeStyle = '#4a4d52';
      ctx.lineWidth = 3;
      ctx.strokeRect(6, 4, s - 12, s - 6);

      // Illuminated Red "EXIT - LOCKED" Sign
      ctx.fillStyle = '#400';
      ctx.fillRect(14, 8, 36, 12);
      ctx.fillStyle = '#ff2222';
      ctx.fillRect(16, 10, 32, 8);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(20, 13, 24, 2);

      // Heavy reinforced steel bars
      ctx.fillStyle = '#1c1d1f';
      ctx.fillRect(10, 24, s - 20, 6);
      ctx.fillRect(10, 42, s - 20, 6);

      // Keypad/Scanner module with glowing red indicator
      ctx.fillStyle = '#111';
      ctx.fillRect(s - 16, 30, 8, 12);
      ctx.fillStyle = '#ff3333';
      ctx.beginPath();
      ctx.arc(s - 12, 36, 3, 0, Math.PI * 2);
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

    // 17B. Sprite: The Storefront Mannequin (Abandoned 90s Mall Entity)
    makeTexture('sprite_mannequin', (ctx, s) => {
      ctx.clearRect(0, 0, s, s);

      // Chrome circular floor display stand
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.ellipse(32, 60, 14, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Slender matte pale ivory mannequin torso & legs
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(28, 36, 8, 24); // Legs
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(31.5, 36, 1, 24); // Leg division

      // Dark vintage 90s retail blazer / silhouette
      ctx.fillStyle = '#1e1b4b'; // Dark indigo blazer
      ctx.fillRect(22, 16, 20, 22);

      // Featureless sculpted mannequin head
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(32, 11, 6, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Neck joint
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(30.5, 17, 3, 2);

      // Subtle shadow accents along cheek contour
      ctx.fillStyle = 'rgba(100, 116, 139, 0.3)';
      ctx.beginPath();
      ctx.arc(30, 12, 2.5, 0, Math.PI * 2);
      ctx.arc(34, 12, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 17C. Sprite: The Night Orderly (Sanatorium Hospital Entity)
    makeTexture('sprite_orderly', (ctx, s) => {
      ctx.clearRect(0, 0, s, s);

      // Hospital scrubs pants
      ctx.fillStyle = '#0d9488'; // Faded clinical teal
      ctx.fillRect(26, 38, 5, 22);
      ctx.fillRect(33, 38, 5, 22);

      // Scrub top with tilted, slouching shoulders
      ctx.fillStyle = '#14b8a6';
      ctx.beginPath();
      ctx.moveTo(18, 20);
      ctx.lineTo(46, 18);
      ctx.lineTo(44, 40);
      ctx.lineTo(20, 40);
      ctx.closePath();
      ctx.fill();

      // Head tilted unnaturally
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.ellipse(33, 11, 6.5, 7.5, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Surgical face mask
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(28, 12, 10, 6);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(28, 12, 10, 6);

      // Dark sunken eye sockets
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(30, 9, 1.8, 0, Math.PI * 2);
      ctx.arc(36, 9.5, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Hanging stethoscope or ID lanyard
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(27, 20);
      ctx.lineTo(32, 28);
      ctx.lineTo(37, 20);
      ctx.stroke();
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
