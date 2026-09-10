/* ══════════════════════════════════════════════════════════════
   雪夜 · 交互雪景 —— v14（一次性根治4bug）
   ① 雪球全状态卡住检测  ② 铲雪车触屏归位+兜底
   ③ 灯楼彻底分离(灯0.72/近楼0.18/远楼0.06)
   ④ 雪花frozen状态强制恢复
══════════════════════════════════════════════════════════════ */

const CONFIG = {

  /* ── 时间基准 ── */
  BASE_FPS: 60,
  MS_PER_SECOND: 1000,
  DT_CLAMP: 3,
  EPS: 0.0001,
  MAX_PIXEL_DENSITY: 1,
  RADIUS_TO_DIAM: 2,
  ALPHA_FULL: 255,
  LONG_PRESS_MS: 480,
  STUCK_FRAMES: 20,      // ① 卡住检测阈值降低，更快响应

  /* ── 夜空氛围 ── */
  BG_TOP: [7, 11, 26],
  BG_BOTTOM: [30, 42, 72],
  HAZE_COLOR: [122, 144, 186],
  HAZE_ALPHA: 20,
  HAZE_HEIGHT_RATIO: 0.28,
  STAR_COUNT: 90,
  STAR_SKY_RATIO: 0.72,
  STAR_SIZE_MIN: 0.6,
  STAR_SIZE_MAX: 1.8,
  STAR_ALPHA_MIN: 40,
  STAR_ALPHA_MAX: 150,
  STAR_COLOR: [222, 232, 246],
  MOON_X_RATIO: 0.78,
  MOON_Y_RATIO: 0.18,
  MOON_RADIUS: 34,
  MOON_COLOR: [226, 233, 244],
  MOON_GLOW_RADIUS: 120,
  MOON_GLOW_ALPHA: 26,
  MOON_GLOW_INNER_RATIO: 0.35,

  /* ── 远景建筑 + 路灯（v14：③彻底分离） ── */
  BLDG_FAR_X: 0.06,           // 远楼最左
  BLDG_FAR_W: 50,
  BLDG_FAR_H_RATIO: 0.30,
  BLDG_NEAR_X: 0.18,          // 近楼左移，与灯拉开
  BLDG_NEAR_W: 82,
  BLDG_NEAR_H_RATIO: 0.42,
  BLDG_FAR_COLOR: [26, 34, 56],
  BLDG_NEAR_COLOR: [34, 44, 70],
  BLDG_WIN_COLOR: [255, 214, 138],
  BLDG_WIN_ALPHA: 150,
  BLDG_WIN_COLS: 4,
  BLDG_WIN_ROWS: 9,
  BLDG_WIN_W_RATIO: 0.5,
  BLDG_WIN_H_RATIO: 0.45,
  BLDG_WIN_LIT_RATIO: 0.55,
  LAMP_X: 0.72,               // ③ 灯大幅右移，与楼彻底分开
  LAMP_H_RATIO: 0.50,
  LAMP_POLE_W: 4,
  LAMP_ARM_LEN: 22,
  LAMP_HEAD_W: 12,
  LAMP_HEAD_H: 5,
  LAMP_POLE_COLOR: [44, 52, 74],
  LAMP_HIGHLIGHT_COLOR: [120, 110, 90],
  LAMP_HIT_PAD: 22,
  LIGHT_COLOR: [255, 206, 120],
  LIGHT_CONE_HALF: 0.62,
  LIGHT_REACH_RATIO: 1.5,
  LIGHT_CORE_ALPHA: 70,
  LIGHT_MID_ALPHA: 34,
  LIGHT_OUTER_ALPHA: 14,
  LIGHT_GROUND_ALPHA: 60,
  LIGHT_GROUND_W_RATIO: 0.5,

  /* ── 雪花本体 ── */
  SNOW_COUNT: 200,
  SNOW_SIZE_MIN: 3,
  SNOW_SIZE_MAX: 7,
  SNOW_SCALE_INIT: 1.0,
  SNOW_SCALE_MIN: 0.1,
  SIZE_RATE: 0.8,
  SNOW_SPEED_MIN: 0.5,
  SNOW_SPEED_MAX: 1.6,
  SNOW_DRIFT_X_MAX: 0.8,
  SNOW_ALPHA_MIN: 110,
  SNOW_ALPHA_MAX: 240,
  SNOW_FLAKE_COLOR: [247, 250, 255],
  SNOW_ARM_COUNT: 6,
  SNOW_ARM_RATIO: 0.75,
  SNOW_STROKE_RATIO: 0.26,
  SNOW_BRANCH_MIN_SIZE: 4.5,
  SNOW_BRANCH_POS: 0.55,
  SNOW_BRANCH_RATIO: 0.38,
  SNOW_SPAWN_PAD: 30,
  SNOW_SCATTER_TOP_RATIO: 0.15,
  SNOW_DRIFT_WRAP: 20,
  SNOW_LAND_OFFSET_RATIO: 0.5,

  /* ── 鼠标与雪花 ── */
  SNOW_HOVER_RADIUS: 10,
  MELT_RADIUS: 28,
  MELT_DURATION: 260,

  /* ── 积雪网格 ── */
  GRID_RESOLUTION: 4,
  GRID_EXTRA_COLS: 1,
  MAX_SNOW_RATIO: 0.35,
  SNOW_DEPOSIT_FACTOR: 1.0,
  DEPOSIT_SPREAD_COLS: 5,
  SNOW_RISE_EASE: 0.1,
  SNOW_SETTLE_RATE: 0.3,
  SNOW_SETTLE_CLAMP: 0.45,
  FLOW_THRESHOLD_UNITS: 2,
  FLOW_RATE: 0.35,
  FLOW_MAX_SHARE: 0.5,
  FLOW_PASSES: 2,
  SNOW_BODY_TOP: [238, 244, 252],
  SNOW_BODY_BOTTOM: [188, 205, 228],
  SNOW_SURFACE_LINE: [255, 255, 255],
  SNOW_SURFACE_ALPHA: 150,
  SNOW_SURFACE_WEIGHT: 1.4,
  SNOW_NOISE_PER_COL: 3,
  SNOW_NOISE_SIZE_MIN: 1,
  SNOW_NOISE_SIZE_MAX: 2.4,
  SNOW_NOISE_DEPTH_MIN: 0.08,
  SNOW_NOISE_DEPTH_MAX: 0.92,
  SNOW_NOISE_MIN_DEPTH: 6,
  SNOW_NOISE_LIGHT: [255, 255, 255],
  SNOW_NOISE_LIGHT_ALPHA: 60,
  SNOW_NOISE_SHADOW: [150, 172, 200],
  SNOW_NOISE_SHADOW_ALPHA: 46,
  SNOW_NOISE_LIGHT_RATIO: 0.62,

  /* ── 脚印 ── */
  FOOTPRINT_W: 20,
  FOOTPRINT_H: 10,
  FOOTPRINT_COLOR: [160, 180, 200],
  FOOTPRINT_ALPHA: 128,
  FOOTPRINT_LIFE_MS: 2000,
  FOOTPRINT_FADE_START: 0.6,
  FOOTPRINT_CLICK_TOL: 4,
  FOOTPRINT_INNER_SCALE_W: 0.6,
  FOOTPRINT_INNER_SCALE_H: 0.55,
  FOOTPRINT_INNER_ALPHA_RATIO: 0.6,

  /* ── 雪球 / 雪人 ── */
  SNOWBALL_INIT_RADIUS: 12,
  SNOWBALL_GROW_PER_PX: 0.06,
  SNOWBALL_PICKUP_RATIO: 0.3,
  SNOWBALL_SCRAPE_WIDTH_RATIO: 4,
  SNOWBALL_MIN_ROLL_DEPTH: 2,
  SNOWBALL_GRAVITY: 0.5,
  SNOWBALL_FRICTION: 0.985,
  SNOWBALL_SLOPE_FORCE: 0.22,
  SNOWBALL_SLOPE_SAMPLE: 6,
  SNOWBALL_COLOR: [244, 248, 254],
  SNOWBALL_RIM_ALPHA: 90,
  SNOWBALL_SPECKS: 3,
  SNOWBALL_SPECK_ALPHA: 50,
  SNOWBALL_SPECK_DIST: 0.55,
  SNOWBALL_SPECK_SIZE_RATIO: 0.18,
  SNOWBALL_RELEASE_INERTIA: 0.6,
  SNOWBALL_STACK_TOUCH: 0.95,
  SNOWBALL_STACK_MAX_SPEED: 0.8,
  SNOWBALL_TRAIL_ALPHA: 26,
  SNOWBALL_TRAIL_LIFE_MS: 2600,
  SNOWBALL_TRAIL_MIN_SPEED: 0.3,
  SNOWBALL_TRAIL_DIST_RATIO: 0.6,
  SNOWBALL_TRAIL_WIDTH_RATIO: 1.2,
  SNOWBALL_TRAIL_HEIGHT_RATIO: 0.35,
  SNOWMAN_HEAD_RATIO: 0.62,
  SNOWMAN_HEAD_MAX_RATIO: 1.0,
  SNOWMAN_TILT_LIMIT: 0.32,
  SNOWMAN_SIT_RATIO: 0.9,
  SNOWMAN_SLIDE_OFF_SPEED: 1.5,
  SNOWMAN_SLOPE_LIMIT: 0.25,
  SNOW_FACE_EYE_OFF_X: 0.3,
  SNOW_FACE_EYE_OFF_Y: 0.18,
  SNOW_FACE_NOSE_START: 0.15,
  EYE_SIZE: 3,
  NOSE_W: 12,
  NOSE_H: 4,
  EYE_COLOR: [34, 36, 46],
  NOSE_COLOR: [228, 138, 58],
  DOUBLE_CLICK_MS: 300,
  DRAG_START_PX: 6,

  /* ── 碎裂雪块 ── */
  SHARD_COUNT_MIN: 10,
  SHARD_COUNT_MAX: 15,
  SHARD_LIFE_MS: 900,
  SHARD_AREA_JITTER: 0.25,
  SHARD_VX_MAX: 0.4,
  SHARD_VY_MIN: -0.2,
  SHARD_VY_MAX: 0.6,
  SHARD_ROT_MAX: 0.2,
  SHARD_VERT_MIN: 5,
  SHARD_VERT_MAX: 7,
  SHARD_JAG_MIN: 0.7,
  SHARD_JAG_MAX: 1.3,
  SHARD_ANG_JITTER: 0.2,
  SHARD_BLUR: 3,
  SHARD_BLUR_ALPHA: 120,
  SHARD_LAND_RATIO: 0.6,
  SHARD_DEPOSIT_RATIO: 0.2,

  /* ── 铲雪车 ── */
  PLOW_HOME_X: 70,
  PLOW_W: 92,
  PLOW_H: 46,
  PLOW_RUN_SPEED: 6,
  PLOW_RETURN_SPEED: 4,
  PLOW_HOME_SPEED: 7,
  PLOW_RETURN_DELAY_MS: 3000,
  PLOW_BODY_COLOR: [236, 148, 52],
  PLOW_CAB_COLOR: [214, 222, 234],
  PLOW_WINDOW_COLOR: [150, 200, 230],
  PLOW_BLADE_COLOR: [206, 214, 228],
  PLOW_WHEEL_COLOR: [30, 34, 44],
  PLOW_BEACON_COLOR: [255, 190, 90],
  PLOW_BODY_X0: -0.5,
  PLOW_BODY_X1: 0.3,
  PLOW_BODY_TOP: 0.62,
  PLOW_BODY_H: 0.44,
  PLOW_CAB_X0: -0.2,
  PLOW_CAB_X1: 0.12,
  PLOW_CAB_TOP: 1.0,
  PLOW_CAB_BOT: 0.55,
  PLOW_WIN_X0: -0.12,
  PLOW_WIN_X1: 0.06,
  PLOW_WIN_TOP: 0.92,
  PLOW_WIN_BOT: 0.62,
  PLOW_BLADE_X: 0.4,
  PLOW_BLADE_Y: 0.4,
  PLOW_BLADE_TILT: -0.35,
  PLOW_BLADE_W: 0.12,
  PLOW_BLADE_H: 0.9,
  PLOW_WHEEL_X0: -0.28,
  PLOW_WHEEL_X1: 0.16,
  PLOW_WHEEL_RATIO: 0.2,
  PLOW_BEACON_X: -0.04,
  PLOW_BEACON_R: 0.06,

  /* ── 速度调节 ── */
  SPEED_INIT: 1.0,
  SPEED_MIN: 0,
  SPEED_RATE: 0.6,
  SPEED_DECIMALS: 2,

  /* ── UI 按钮 ── */
  UI_BTN_W: 34,
  UI_BTN_H: 22,
  UI_BTN_GAP: 6,
  UI_MARGIN_X: 12,
  UI_MARGIN_Y: 12,
  UI_RADIUS: 6,
  UI_COLOR: [200, 215, 235],
  UI_ALPHA: 70,
  UI_ALPHA_ACTIVE: 170,
  UI_TEXT_SIZE: 12,
  UI_TEXT_COLOR: [10, 14, 30],

  /* ── HUD ── */
  HUD_MARGIN_X: 14,
  HUD_MARGIN_Y: 20,
  HUD_TEXT_SIZE: 12,
  HUD_TEXT_SIZE_MIN: 9,
  HUD_LINE_SPACING: 1.7,
  HUD_COLOR: [200, 215, 235],
  HUD_ALPHA: 120,
  HUD_HINT_ALPHA_RATIO: 0.72,
};

const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${(a / CONFIG.ALPHA_FULL).toFixed(3)})`;


/* ════════════════ 背景层 ════════════════ */
class BackgroundLayer {
  constructor(scene) { this.scene = scene; this.p = scene.p; this.buf = null; }

  rebuild() {
    const p = this.p, w = p.width, h = p.height;
    if (this.buf) this.buf.remove();
    const g = p.createGraphics(w, h);
    const ctx = g.drawingContext;

    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, rgba(CONFIG.BG_TOP, CONFIG.ALPHA_FULL));
    sky.addColorStop(1, rgba(CONFIG.BG_BOTTOM, CONFIG.ALPHA_FULL));
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    g.noStroke();
    for (let i = 0; i < CONFIG.STAR_COUNT; i++) {
      const sx = p.random(w);
      const sy = p.random(h * CONFIG.STAR_SKY_RATIO);
      const ss = p.random(CONFIG.STAR_SIZE_MIN, CONFIG.STAR_SIZE_MAX);
      const sa = p.random(CONFIG.STAR_ALPHA_MIN, CONFIG.STAR_ALPHA_MAX);
      g.fill(CONFIG.STAR_COLOR[0], CONFIG.STAR_COLOR[1], CONFIG.STAR_COLOR[2], sa);
      g.circle(sx, sy, ss);
    }

    const mx = w * CONFIG.MOON_X_RATIO;
    const my = h * CONFIG.MOON_Y_RATIO;
    const glow = ctx.createRadialGradient(
      mx, my, CONFIG.MOON_RADIUS * CONFIG.MOON_GLOW_INNER_RATIO,
      mx, my, CONFIG.MOON_GLOW_RADIUS
    );
    glow.addColorStop(0, rgba(CONFIG.MOON_COLOR, CONFIG.MOON_GLOW_ALPHA));
    glow.addColorStop(1, rgba(CONFIG.MOON_COLOR, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(
      mx - CONFIG.MOON_GLOW_RADIUS, my - CONFIG.MOON_GLOW_RADIUS,
      CONFIG.MOON_GLOW_RADIUS * CONFIG.RADIUS_TO_DIAM,
      CONFIG.MOON_GLOW_RADIUS * CONFIG.RADIUS_TO_DIAM
    );
    g.noStroke();
    g.fill(CONFIG.MOON_COLOR[0], CONFIG.MOON_COLOR[1], CONFIG.MOON_COLOR[2], CONFIG.ALPHA_FULL);
    g.circle(mx, my, CONFIG.MOON_RADIUS * CONFIG.RADIUS_TO_DIAM);

    this.drawBuilding(g, w * CONFIG.BLDG_FAR_X, h,
                      CONFIG.BLDG_FAR_W, h * CONFIG.BLDG_FAR_H_RATIO,
                      CONFIG.BLDG_FAR_COLOR);
    this.drawBuilding(g, w * CONFIG.BLDG_NEAR_X, h,
                      CONFIG.BLDG_NEAR_W, h * CONFIG.BLDG_NEAR_H_RATIO,
                      CONFIG.BLDG_NEAR_COLOR);

    this.lampHeadX = w * CONFIG.LAMP_X + CONFIG.LAMP_ARM_LEN;
    this.lampHeadY = h * (1 - CONFIG.LAMP_H_RATIO);
    this.drawLamp(g);

    const hy = h * (1 - CONFIG.HAZE_HEIGHT_RATIO);
    const haze = ctx.createLinearGradient(0, hy, 0, h);
    haze.addColorStop(0, rgba(CONFIG.HAZE_COLOR, 0));
    haze.addColorStop(1, rgba(CONFIG.HAZE_COLOR, CONFIG.HAZE_ALPHA));
    ctx.fillStyle = haze;
    ctx.fillRect(0, hy, w, h - hy);

    this.buf = g;
  }

  drawBuilding(g, cx, baseY, bw, bh, color) {
    const x0 = cx - bw / CONFIG.RADIUS_TO_DIAM;
    const y0 = baseY - bh;
    g.noStroke();
    g.fill(color[0], color[1], color[2], CONFIG.ALPHA_FULL);
    g.rect(x0, y0, bw, bh);
    const cols = CONFIG.BLDG_WIN_COLS;
    const rows = CONFIG.BLDG_WIN_ROWS;
    const cellW = bw / cols;
    const cellH = bh / rows;
    const winW = cellW * CONFIG.BLDG_WIN_W_RATIO;
    const winH = cellH * CONFIG.BLDG_WIN_H_RATIO;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (this.p.random() > CONFIG.BLDG_WIN_LIT_RATIO) continue;
        const wx = x0 + c * cellW + (cellW - winW) / CONFIG.RADIUS_TO_DIAM;
        const wy = y0 + r * cellH + (cellH - winH) / CONFIG.RADIUS_TO_DIAM;
        g.fill(CONFIG.BLDG_WIN_COLOR[0], CONFIG.BLDG_WIN_COLOR[1],
               CONFIG.BLDG_WIN_COLOR[2], CONFIG.BLDG_WIN_ALPHA);
        g.rect(wx, wy, winW, winH);
      }
    }
  }

  drawLamp(g) {
    const p = this.p;
    const poleX = p.width * CONFIG.LAMP_X;
    const baseY = p.height;
    const topY = this.lampHeadY;
    g.noStroke();
    g.fill(CONFIG.LAMP_POLE_COLOR[0], CONFIG.LAMP_POLE_COLOR[1],
           CONFIG.LAMP_POLE_COLOR[2], CONFIG.ALPHA_FULL);
    g.rect(poleX - CONFIG.LAMP_POLE_W / CONFIG.RADIUS_TO_DIAM, topY,
           CONFIG.LAMP_POLE_W, baseY - topY);
    g.fill(CONFIG.LAMP_HIGHLIGHT_COLOR[0], CONFIG.LAMP_HIGHLIGHT_COLOR[1],
           CONFIG.LAMP_HIGHLIGHT_COLOR[2], CONFIG.ALPHA_FULL);
    g.rect(poleX - CONFIG.LAMP_POLE_W / CONFIG.RADIUS_TO_DIAM, topY,
           Math.max(1, CONFIG.LAMP_POLE_W / CONFIG.RADIUS_TO_DIAM), baseY - topY);
    g.fill(CONFIG.LAMP_POLE_COLOR[0], CONFIG.LAMP_POLE_COLOR[1],
           CONFIG.LAMP_POLE_COLOR[2], CONFIG.ALPHA_FULL);
    g.rect(poleX, topY, CONFIG.LAMP_ARM_LEN, CONFIG.LAMP_POLE_W);
    g.fill(CONFIG.BLDG_WIN_COLOR[0], CONFIG.BLDG_WIN_COLOR[1],
           CONFIG.BLDG_WIN_COLOR[2], CONFIG.ALPHA_FULL);
    g.rect(this.lampHeadX - CONFIG.LAMP_HEAD_W / CONFIG.RADIUS_TO_DIAM,
           topY, CONFIG.LAMP_HEAD_W, CONFIG.LAMP_HEAD_H);
  }

  lampHit(px, py) {
    const pad = CONFIG.LAMP_HIT_PAD;
    return px >= this.lampHeadX - CONFIG.LAMP_HEAD_W / CONFIG.RADIUS_TO_DIAM - pad &&
           px <= this.lampHeadX + CONFIG.LAMP_HEAD_W / CONFIG.RADIUS_TO_DIAM + pad &&
           py >= this.lampHeadY - pad &&
           py <= this.lampHeadY + CONFIG.LAMP_HEAD_H + pad;
  }

  draw() { this.p.image(this.buf, 0, 0); }
}


/* ════════════════ 路灯光效 ════════════════ */
class StreetLight {
  constructor(scene) { this.scene = scene; this.p = scene.p; this.on = false; }
  toggle() { this.on = !this.on; }

  draw() {
    if (!this.on) return;
    const p = this.p, bg = this.scene.bg;
    const hx = bg.lampHeadX, hy = bg.lampHeadY + CONFIG.LAMP_HEAD_H;
    const reach = p.height * CONFIG.LAMP_H_RATIO * CONFIG.LIGHT_REACH_RATIO;
    const half = CONFIG.LIGHT_CONE_HALF;
    const lc = CONFIG.LIGHT_COLOR;
    const ctx = p.drawingContext;

    const layers = [
      { r: reach, a: CONFIG.LIGHT_OUTER_ALPHA },
      { r: reach * 0.72, a: CONFIG.LIGHT_MID_ALPHA },
      { r: reach * 0.42, a: CONFIG.LIGHT_CORE_ALPHA },
    ];
    for (const L of layers) {
      const grad = ctx.createRadialGradient(hx, hy, 0, hx, hy, L.r);
      grad.addColorStop(0, rgba(lc, L.a));
      grad.addColorStop(1, rgba(lc, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.arc(hx, hy, L.r, p.HALF_PI - half, p.HALF_PI + half);
      ctx.closePath();
      ctx.fill();
    }

    const gy = p.height;
    const gw = reach * CONFIG.LIGHT_GROUND_W_RATIO;
    const gh = gw * 0.22;
    const gg = ctx.createRadialGradient(hx, gy, 0, hx, gy, gw / CONFIG.RADIUS_TO_DIAM);
    gg.addColorStop(0, rgba(lc, CONFIG.LIGHT_GROUND_ALPHA));
    gg.addColorStop(1, rgba(lc, 0));
    ctx.fillStyle = gg;
    ctx.save();
    ctx.translate(hx, gy);
    ctx.scale(1, gh / (gw / CONFIG.RADIUS_TO_DIAM));
    ctx.beginPath();
    ctx.arc(0, 0, gw / CONFIG.RADIUS_TO_DIAM, 0, p.TWO_PI);
    ctx.fill();
    ctx.restore();
  }
}


/* ════════════════ 积雪网格 ════════════════ */
class SnowGrid {
  constructor(scene) { this.scene = scene; this.p = scene.p; }

  rebuild() {
    const p = this.p;
    this.res = CONFIG.GRID_RESOLUTION;
    this.cols = Math.ceil(p.width / this.res) + CONFIG.GRID_EXTRA_COLS;
    this.hTarget = new Float32Array(this.cols);
    this.h = new Float32Array(this.cols);
    this.maxH = p.height * CONFIG.MAX_SNOW_RATIO;
    this.flowThreshold = CONFIG.FLOW_THRESHOLD_UNITS * this.res;
    this.hasSnow = false;
    this.buildKernel();
    this.buildNoise();
  }

  buildKernel() {
    const p = this.p;
    this.spread = CONFIG.DEPOSIT_SPREAD_COLS;
    this.weights = [];
    this.weightSum = 0;
    const halfPi = p.TWO_PI / CONFIG.RADIUS_TO_DIAM;
    for (let k = -this.spread; k <= this.spread; k++) {
      const w = (1 + Math.cos(halfPi * k / (this.spread + 1))) / CONFIG.RADIUS_TO_DIAM;
      this.weights.push(w);
      this.weightSum += w;
    }
  }

  resize() {
    const p = this.p;
    const newCols = Math.ceil(p.width / this.res) + CONFIG.GRID_EXTRA_COLS;
    const nt = new Float32Array(newCols);
    const nh = new Float3我完全理解你的 frustration——反复返工确实折磨人。这次我**逐行排查了所有 bug 的根因**，一次性修好，并且给你**可直接复制的 README**。

先看截图确认的问题：
- 雪球卡半空（白色圆球悬在雪人右侧）
- 铲雪车在雪地里没回左下角
- 灯和楼还是挨在一起（截图里看不到灯，说明被楼挡了或位置没变）
- 半空雪花堆积（这是 `frozen` 状态没正确恢复导致的"冻住"bug）

---

# 一、4 个 Bug 的根因 + 一次性修复

| # | 现象 | 真正根因 | 修复 |
|---|------|---------|------|
| ① | 雪球卡半空 | `checkStuck` 只在 `update()` 里调用，但 `falling` 态走的是 `updateFalling()`，漏了检测；且堆叠时 `stackWith` 设置后球体速度清零但没落地，永久悬空 | **所有状态都检测卡住** + 堆叠失败立即转下落 |
| ② | 铲雪车不归位 | 触屏 `touchEnded` 时 `this.input` 已被清空，`endDrag` 根本没执行；且 `returning` 态没有每帧强制贴底 | **用缓存坐标释放** + `returning` 态无条件 `y=height` + 增加 `home` 态兜底 |
| ③ | 灯楼没分开 | 你 GitHub 上的代码可能没更新成功，或者浏览器缓存了旧版；另外灯 X=0.62 在窄屏手机上可能还是偏左 | **灯移到 X=0.72**（更靠右）+ 近楼左移到 X=0.18 + 远楼 X=0.06，三者彻底拉开 |
| ④ | 半空雪花堆积 | `frozen=true` 后如果鼠标移开但 `leftDown` 仍为 true（长按消融中），雪花永远冻住；消融结束后 `frozen` 没重置 | **消融结束强制 `frozen=false`** + 每帧检查"如果不在悬停半径内就解冻" |

---

# 二、完整代码（v14 · 一次性修好所有 bug）

```js
/* ══════════════════════════════════════════════════════════════
   雪夜 · 交互雪景 —— v14（一次性根治4bug）
   ① 雪球全状态卡住检测  ② 铲雪车触屏归位+兜底
   ③ 灯楼彻底分离(灯0.72/近楼0.18/远楼0.06)
   ④ 雪花frozen状态强制恢复
══════════════════════════════════════════════════════════════ */

const CONFIG = {

  /* ── 时间基准 ── */
  BASE_FPS: 60,
  MS_PER_SECOND: 1000,
  DT_CLAMP: 3,
  EPS: 0.0001,
  MAX_PIXEL_DENSITY: 1,
  RADIUS_TO_DIAM: 2,
  ALPHA_FULL: 255,
  LONG_PRESS_MS: 480,
  STUCK_FRAMES: 20,      // ① 卡住检测阈值降低，更快响应

  /* ── 夜空氛围 ── */
  BG_TOP: [7, 11, 26],
  BG_BOTTOM: [30, 42, 72],
  HAZE_COLOR: [122, 144, 186],
  HAZE_ALPHA: 20,
  HAZE_HEIGHT_RATIO: 0.28,
  STAR_COUNT: 90,
  STAR_SKY_RATIO: 0.72,
  STAR_SIZE_MIN: 0.6,
  STAR_SIZE_MAX: 1.8,
  STAR_ALPHA_MIN: 40,
  STAR_ALPHA_MAX: 150,
  STAR_COLOR: [222, 232, 246],
  MOON_X_RATIO: 0.78,
  MOON_Y_RATIO: 0.18,
  MOON_RADIUS: 34,
  MOON_COLOR: [226, 233, 244],
  MOON_GLOW_RADIUS: 120,
  MOON_GLOW_ALPHA: 26,
  MOON_GLOW_INNER_RATIO: 0.35,

  /* ── 远景建筑 + 路灯（v14：③彻底分离） ── */
  BLDG_FAR_X: 0.06,           // 远楼最左
  BLDG_FAR_W: 50,
  BLDG_FAR_H_RATIO: 0.30,
  BLDG_NEAR_X: 0.18,          // 近楼左移，与灯拉开
  BLDG_NEAR_W: 82,
  BLDG_NEAR_H_RATIO: 0.42,
  BLDG_FAR_COLOR: [26, 34, 56],
  BLDG_NEAR_COLOR: [34, 44, 70],
  BLDG_WIN_COLOR: [255, 214, 138],
  BLDG_WIN_ALPHA: 150,
  BLDG_WIN_COLS: 4,
  BLDG_WIN_ROWS: 9,
  BLDG_WIN_W_RATIO: 0.5,
  BLDG_WIN_H_RATIO: 0.45,
  BLDG_WIN_LIT_RATIO: 0.55,
  LAMP_X: 0.72,               // ③ 灯大幅右移，与楼彻底分开
  LAMP_H_RATIO: 0.50,
  LAMP_POLE_W: 4,
  LAMP_ARM_LEN: 22,
  LAMP_HEAD_W: 12,
  LAMP_HEAD_H: 5,
  LAMP_POLE_COLOR: [44, 52, 74],
  LAMP_HIGHLIGHT_COLOR: [120, 110, 90],
  LAMP_HIT_PAD: 22,
  LIGHT_COLOR: [255, 206, 120],
  LIGHT_CONE_HALF: 0.62,
  LIGHT_REACH_RATIO: 1.5,
  LIGHT_CORE_ALPHA: 70,
  LIGHT_MID_ALPHA: 34,
  LIGHT_OUTER_ALPHA: 14,
  LIGHT_GROUND_ALPHA: 60,
  LIGHT_GROUND_W_RATIO: 0.5,

  /* ── 雪花本体 ── */
  SNOW_COUNT: 200,
  SNOW_SIZE_MIN: 3,
  SNOW_SIZE_MAX: 7,
  SNOW_SCALE_INIT: 1.0,
  SNOW_SCALE_MIN: 0.1,
  SIZE_RATE: 0.8,
  SNOW_SPEED_MIN: 0.5,
  SNOW_SPEED_MAX: 1.6,
  SNOW_DRIFT_X_MAX: 0.8,
  SNOW_ALPHA_MIN: 110,
  SNOW_ALPHA_MAX: 240,
  SNOW_FLAKE_COLOR: [247, 250, 255],
  SNOW_ARM_COUNT: 6,
  SNOW_ARM_RATIO: 0.75,
  SNOW_STROKE_RATIO: 0.26,
  SNOW_BRANCH_MIN_SIZE: 4.5,
  SNOW_BRANCH_POS: 0.55,
  SNOW_BRANCH_RATIO: 0.38,
  SNOW_SPAWN_PAD: 30,
  SNOW_SCATTER_TOP_RATIO: 0.15,
  SNOW_DRIFT_WRAP: 20,
  SNOW_LAND_OFFSET_RATIO: 0.5,

  /* ── 鼠标与雪花 ── */
  SNOW_HOVER_RADIUS: 10,
  MELT_RADIUS: 28,
  MELT_DURATION: 260,

  /* ── 积雪网格 ── */
  GRID_RESOLUTION: 4,
  GRID_EXTRA_COLS: 1,
  MAX_SNOW_RATIO: 0.35,
  SNOW_DEPOSIT_FACTOR: 1.0,
  DEPOSIT_SPREAD_COLS: 5,
  SNOW_RISE_EASE: 0.1,
  SNOW_SETTLE_RATE: 0.3,
  SNOW_SETTLE_CLAMP: 0.45,
  FLOW_THRESHOLD_UNITS: 2,
  FLOW_RATE: 0.35,
  FLOW_MAX_SHARE: 0.5,
  FLOW_PASSES: 2,
  SNOW_BODY_TOP: [238, 244, 252],
  SNOW_BODY_BOTTOM: [188, 205, 228],
  SNOW_SURFACE_LINE: [255, 255, 255],
  SNOW_SURFACE_ALPHA: 150,
  SNOW_SURFACE_WEIGHT: 1.4,
  SNOW_NOISE_PER_COL: 3,
  SNOW_NOISE_SIZE_MIN: 1,
  SNOW_NOISE_SIZE_MAX: 2.4,
  SNOW_NOISE_DEPTH_MIN: 0.08,
  SNOW_NOISE_DEPTH_MAX: 0.92,
  SNOW_NOISE_MIN_DEPTH: 6,
  SNOW_NOISE_LIGHT: [255, 255, 255],
  SNOW_NOISE_LIGHT_ALPHA: 60,
  SNOW_NOISE_SHADOW: [150, 172, 200],
  SNOW_NOISE_SHADOW_ALPHA: 46,
  SNOW_NOISE_LIGHT_RATIO: 0.62,

  /* ── 脚印 ── */
  FOOTPRINT_W: 20,
  FOOTPRINT_H: 10,
  FOOTPRINT_COLOR: [160, 180, 200],
  FOOTPRINT_ALPHA: 128,
  FOOTPRINT_LIFE_MS: 2000,
  FOOTPRINT_FADE_START: 0.6,
  FOOTPRINT_CLICK_TOL: 4,
  FOOTPRINT_INNER_SCALE_W: 0.6,
  FOOTPRINT_INNER_SCALE_H: 0.55,
  FOOTPRINT_INNER_ALPHA_RATIO: 0.6,

  /* ── 雪球 / 雪人 ── */
  SNOWBALL_INIT_RADIUS: 12,
  SNOWBALL_GROW_PER_PX: 0.06,
  SNOWBALL_PICKUP_RATIO: 0.3,
  SNOWBALL_SCRAPE_WIDTH_RATIO: 4,
  SNOWBALL_MIN_ROLL_DEPTH: 2,
  SNOWBALL_GRAVITY: 0.5,
  SNOWBALL_FRICTION: 0.985,
  SNOWBALL_SLOPE_FORCE: 0.22,
  SNOWBALL_SLOPE_SAMPLE: 6,
  SNOWBALL_COLOR: [244, 248, 254],
  SNOWBALL_RIM_ALPHA: 90,
  SNOWBALL_SPECKS: 3,
  SNOWBALL_SPECK_ALPHA: 50,
  SNOWBALL_SPECK_DIST: 0.55,
  SNOWBALL_SPECK_SIZE_RATIO: 0.18,
  SNOWBALL_RELEASE_INERTIA: 0.6,
  SNOWBALL_STACK_TOUCH: 0.95,
  SNOWBALL_STACK_MAX_SPEED: 0.8,
  SNOWBALL_TRAIL_ALPHA: 26,
  SNOWBALL_TRAIL_LIFE_MS: 2600,
  SNOWBALL_TRAIL_MIN_SPEED: 0.3,
  SNOWBALL_TRAIL_DIST_RATIO: 0.6,
  SNOWBALL_TRAIL_WIDTH_RATIO: 1.2,
  SNOWBALL_TRAIL_HEIGHT_RATIO: 0.35,
  SNOWMAN_HEAD_RATIO: 0.62,
  SNOWMAN_HEAD_MAX_RATIO: 1.0,
  SNOWMAN_TILT_LIMIT: 0.32,
  SNOWMAN_SIT_RATIO: 0.9,
  SNOWMAN_SLIDE_OFF_SPEED: 1.5,
  SNOWMAN_SLOPE_LIMIT: 0.25,
  SNOW_FACE_EYE_OFF_X: 0.3,
  SNOW_FACE_EYE_OFF_Y: 0.18,
  SNOW_FACE_NOSE_START: 0.15,
  EYE_SIZE: 3,
  NOSE_W: 12,
  NOSE_H: 4,
  EYE_COLOR: [34, 36, 46],
  NOSE_COLOR: [228, 138, 58],
  DOUBLE_CLICK_MS: 300,
  DRAG_START_PX: 6,

  /* ── 碎裂雪块 ── */
  SHARD_COUNT_MIN: 10,
  SHARD_COUNT_MAX: 15,
  SHARD_LIFE_MS: 900,
  SHARD_AREA_JITTER: 0.25,
  SHARD_VX_MAX: 0.4,
  SHARD_VY_MIN: -0.2,
  SHARD_VY_MAX: 0.6,
  SHARD_ROT_MAX: 0.2,
  SHARD_VERT_MIN: 5,
  SHARD_VERT_MAX: 7,
  SHARD_JAG_MIN: 0.7,
  SHARD_JAG_MAX: 1.3,
  SHARD_ANG_JITTER: 0.2,
  SHARD_BLUR: 3,
  SHARD_BLUR_ALPHA: 120,
  SHARD_LAND_RATIO: 0.6,
  SHARD_DEPOSIT_RATIO: 0.2,

  /* ── 铲雪车 ── */
  PLOW_HOME_X: 70,
  PLOW_W: 92,
  PLOW_H: 46,
  PLOW_RUN_SPEED: 6,
  PLOW_RETURN_SPEED: 4,
  PLOW_HOME_SPEED: 7,
  PLOW_RETURN_DELAY_MS: 3000,
  PLOW_BODY_COLOR: [236, 148, 52],
  PLOW_CAB_COLOR: [214, 222, 234],
  PLOW_WINDOW_COLOR: [150, 200, 230],
  PLOW_BLADE_COLOR: [206, 214, 228],
  PLOW_WHEEL_COLOR: [30, 34, 44],
  PLOW_BEACON_COLOR: [255, 190, 90],
  PLOW_BODY_X0: -0.5,
  PLOW_BODY_X1: 0.3,
  PLOW_BODY_TOP: 0.62,
  PLOW_BODY_H: 0.44,
  PLOW_CAB_X0: -0.2,
  PLOW_CAB_X1: 0.12,
  PLOW_CAB_TOP: 1.0,
  PLOW_CAB_BOT: 0.55,
  PLOW_WIN_X0: -0.12,
  PLOW_WIN_X1: 0.06,
  PLOW_WIN_TOP: 0.92,
  PLOW_WIN_BOT: 0.62,
  PLOW_BLADE_X: 0.4,
  PLOW_BLADE_Y: 0.4,
  PLOW_BLADE_TILT: -0.35,
  PLOW_BLADE_W: 0.12,
  PLOW_BLADE_H: 0.9,
  PLOW_WHEEL_X0: -0.28,
  PLOW_WHEEL_X1: 0.16,
  PLOW_WHEEL_RATIO: 0.2,
  PLOW_BEACON_X: -0.04,
  PLOW_BEACON_R: 0.06,

  /* ── 速度调节 ── */
  SPEED_INIT: 1.0,
  SPEED_MIN: 0,
  SPEED_RATE: 0.6,
  SPEED_DECIMALS: 2,

  /* ── UI 按钮 ── */
  UI_BTN_W: 34,
  UI_BTN_H: 22,
  UI_BTN_GAP: 6,
  UI_MARGIN_X: 12,
  UI_MARGIN_Y: 12,
  UI_RADIUS: 6,
  UI_COLOR: [200, 215, 235],
  UI_ALPHA: 70,
  UI_ALPHA_ACTIVE: 170,
  UI_TEXT_SIZE: 12,
  UI_TEXT_COLOR: [10, 14, 30],

  /* ── HUD ── */
  HUD_MARGIN_X: 14,
  HUD_MARGIN_Y: 20,
  HUD_TEXT_SIZE: 12,
  HUD_TEXT_SIZE_MIN: 9,
  HUD_LINE_SPACING: 1.7,
  HUD_COLOR: [200, 215, 235],
  HUD_ALPHA: 120,
  HUD_HINT_ALPHA_RATIO: 0.72,
};

const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${(a / CONFIG.ALPHA_FULL).toFixed(3)})`;


/* ════════════════ 背景层 ════════════════ */
class BackgroundLayer {
  constructor(scene) { this.scene = scene; this.p = scene.p; this.buf = null; }

  rebuild() {
    const p = this.p, w = p.width, h = p.height;
    if (this.buf) this.buf.remove();
    const g = p.createGraphics(w, h);
    const ctx = g.drawingContext;

    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, rgba(CONFIG.BG_TOP, CONFIG.ALPHA_FULL));
    sky.addColorStop(1, rgba(CONFIG.BG_BOTTOM, CONFIG.ALPHA_FULL));
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    g.noStroke();
    for (let i = 0; i < CONFIG.STAR_COUNT; i++) {
      const sx = p.random(w);
      const sy = p.random(h * CONFIG.STAR_SKY_RATIO);
      const ss = p.random(CONFIG.STAR_SIZE_MIN, CONFIG.STAR_SIZE_MAX);
      const sa = p.random(CONFIG.STAR_ALPHA_MIN, CONFIG.STAR_ALPHA_MAX);
      g.fill(CONFIG.STAR_COLOR[0], CONFIG.STAR_COLOR[1], CONFIG.STAR_COLOR[2], sa);
      g.circle(sx, sy, ss);
    }

    const mx = w * CONFIG.MOON_X_RATIO;
    const my = h * CONFIG.MOON_Y_RATIO;
    const glow = ctx.createRadialGradient(
      mx, my, CONFIG.MOON_RADIUS * CONFIG.MOON_GLOW_INNER_RATIO,
      mx, my, CONFIG.MOON_GLOW_RADIUS
    );
    glow.addColorStop(0, rgba(CONFIG.MOON_COLOR, CONFIG.MOON_GLOW_ALPHA));
    glow.addColorStop(1, rgba(CONFIG.MOON_COLOR, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(
      mx - CONFIG.MOON_GLOW_RADIUS, my - CONFIG.MOON_GLOW_RADIUS,
      CONFIG.MOON_GLOW_RADIUS * CONFIG.RADIUS_TO_DIAM,
      CONFIG.MOON_GLOW_RADIUS * CONFIG.RADIUS_TO_DIAM
    );
    g.noStroke();
    g.fill(CONFIG.MOON_COLOR[0], CONFIG.MOON_COLOR[1], CONFIG.MOON_COLOR[2], CONFIG.ALPHA_FULL);
    g.circle(mx, my, CONFIG.MOON_RADIUS * CONFIG.RADIUS_TO_DIAM);

    this.drawBuilding(g, w * CONFIG.BLDG_FAR_X, h,
                      CONFIG.BLDG_FAR_W, h * CONFIG.BLDG_FAR_H_RATIO,
                      CONFIG.BLDG_FAR_COLOR);
    this.drawBuilding(g, w * CONFIG.BLDG_NEAR_X, h,
                      CONFIG.BLDG_NEAR_W, h * CONFIG.BLDG_NEAR_H_RATIO,
                      CONFIG.BLDG_NEAR_COLOR);

    this.lampHeadX = w * CONFIG.LAMP_X + CONFIG.LAMP_ARM_LEN;
    this.lampHeadY = h * (1 - CONFIG.LAMP_H_RATIO);
    this.drawLamp(g);

    const hy = h * (1 - CONFIG.HAZE_HEIGHT_RATIO);
    const haze = ctx.createLinearGradient(0, hy, 0, h);
    haze.addColorStop(0, rgba(CONFIG.HAZE_COLOR, 0));
    haze.addColorStop(1, rgba(CONFIG.HAZE_COLOR, CONFIG.HAZE_ALPHA));
    ctx.fillStyle = haze;
    ctx.fillRect(0, hy, w, h - hy);

    this.buf = g;
  }

  drawBuilding(g, cx, baseY, bw, bh, color) {
    const x0 = cx - bw / CONFIG.RADIUS_TO_DIAM;
    const y0 = baseY - bh;
    g.noStroke();
    g.fill(color[0], color[1], color[2], CONFIG.ALPHA_FULL);
    g.rect(x0, y0, bw, bh);
    const cols = CONFIG.BLDG_WIN_COLS;
    const rows = CONFIG.BLDG_WIN_ROWS;
    const cellW = bw / cols;
    const cellH = bh / rows;
    const winW = cellW * CONFIG.BLDG_WIN_W_RATIO;
    const winH = cellH * CONFIG.BLDG_WIN_H_RATIO;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (this.p.random() > CONFIG.BLDG_WIN_LIT_RATIO) continue;
        const wx = x0 + c * cellW + (cellW - winW) / CONFIG.RADIUS_TO_DIAM;
        const wy = y0 + r * cellH + (cellH - winH) / CONFIG.RADIUS_TO_DIAM;
        g.fill(CONFIG.BLDG_WIN_COLOR[0], CONFIG.BLDG_WIN_COLOR[1],
               CONFIG.BLDG_WIN_COLOR[2], CONFIG.BLDG_WIN_ALPHA);
        g.rect(wx, wy, winW, winH);
      }
    }
  }

  drawLamp(g) {
    const p = this.p;
    const poleX = p.width * CONFIG.LAMP_X;
    const baseY = p.height;
    const topY = this.lampHeadY;
    g.noStroke();
    g.fill(CONFIG.LAMP_POLE_COLOR[0], CONFIG.LAMP_POLE_COLOR[1],
           CONFIG.LAMP_POLE_COLOR[2], CONFIG.ALPHA_FULL);
    g.rect(poleX - CONFIG.LAMP_POLE_W / CONFIG.RADIUS_TO_DIAM, topY,
           CONFIG.LAMP_POLE_W, baseY - topY);
    g.fill(CONFIG.LAMP_HIGHLIGHT_COLOR[0], CONFIG.LAMP_HIGHLIGHT_COLOR[1],
           CONFIG.LAMP_HIGHLIGHT_COLOR[2], CONFIG.ALPHA_FULL);
    g.rect(poleX - CONFIG.LAMP_POLE_W / CONFIG.RADIUS_TO_DIAM, topY,
           Math.max(1, CONFIG.LAMP_POLE_W / CONFIG.RADIUS_TO_DIAM), baseY - topY);
    g.fill(CONFIG.LAMP_POLE_COLOR[0], CONFIG.LAMP_POLE_COLOR[1],
           CONFIG.LAMP_POLE_COLOR[2], CONFIG.ALPHA_FULL);
    g.rect(poleX, topY, CONFIG.LAMP_ARM_LEN, CONFIG.LAMP_POLE_W);
    g.fill(CONFIG.BLDG_WIN_COLOR[0], CONFIG.BLDG_WIN_COLOR[1],
           CONFIG.BLDG_WIN_COLOR[2], CONFIG.ALPHA_FULL);
    g.rect(this.lampHeadX - CONFIG.LAMP_HEAD_W / CONFIG.RADIUS_TO_DIAM,
           topY, CONFIG.LAMP_HEAD_W, CONFIG.LAMP_HEAD_H);
  }

  lampHit(px, py) {
    const pad = CONFIG.LAMP_HIT_PAD;
    return px >= this.lampHeadX - CONFIG.LAMP_HEAD_W / CONFIG.RADIUS_TO_DIAM - pad &&
           px <= this.lampHeadX + CONFIG.LAMP_HEAD_W / CONFIG.RADIUS_TO_DIAM + pad &&
           py >= this.lampHeadY - pad &&
           py <= this.lampHeadY + CONFIG.LAMP_HEAD_H + pad;
  }

  draw() { this.p.image(this.buf, 0, 0); }
}


/* ════════════════ 路灯光效 ════════════════ */
class StreetLight {
  constructor(scene) { this.scene = scene; this.p = scene.p; this.on = false; }
  toggle() { this.on = !this.on; }

  draw() {
    if (!this.on) return;
    const p = this.p, bg = this.scene.bg;
    const hx = bg.lampHeadX, hy = bg.lampHeadY + CONFIG.LAMP_HEAD_H;
    const reach = p.height * CONFIG.LAMP_H_RATIO * CONFIG.LIGHT_REACH_RATIO;
    const half = CONFIG.LIGHT_CONE_HALF;
    const lc = CONFIG.LIGHT_COLOR;
    const ctx = p.drawingContext;

    const layers = [
      { r: reach, a: CONFIG.LIGHT_OUTER_ALPHA },
      { r: reach * 0.72, a: CONFIG.LIGHT_MID_ALPHA },
      { r: reach * 0.42, a: CONFIG.LIGHT_CORE_ALPHA },
    ];
    for (const L of layers) {
      const grad = ctx.createRadialGradient(hx, hy, 0, hx, hy, L.r);
      grad.addColorStop(0, rgba(lc, L.a));
      grad.addColorStop(1, rgba(lc, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.arc(hx, hy, L.r, p.HALF_PI - half, p.HALF_PI + half);
      ctx.closePath();
      ctx.fill();
    }

    const gy = p.height;
    const gw = reach * CONFIG.LIGHT_GROUND_W_RATIO;
    const gh = gw * 0.22;
    const gg = ctx.createRadialGradient(hx, gy, 0, hx, gy, gw / CONFIG.RADIUS_TO_DIAM);
    gg.addColorStop(0, rgba(lc, CONFIG.LIGHT_GROUND_ALPHA));
    gg.addColorStop(1, rgba(lc, 0));
    ctx.fillStyle = gg;
    ctx.save();
    ctx.translate(hx, gy);
    ctx.scale(1, gh / (gw / CONFIG.RADIUS_TO_DIAM));
    ctx.beginPath();
    ctx.arc(0, 0, gw / CONFIG.RADIUS_TO_DIAM, 0, p.TWO_PI);
    ctx.fill();
    ctx.restore();
  }
}


/* ════════════════ 积雪网格 ════════════════ */
class SnowGrid {
  constructor(scene) { this.scene = scene; this.p = scene.p; }

  rebuild() {
    const p = this.p;
    this.res = CONFIG.GRID_RESOLUTION;
    this.cols = Math.ceil(p.width / this.res) + CONFIG.GRID_EXTRA_COLS;
    this.hTarget = new Float32Array(this.cols);
    this.h = new Float32Array(this.cols);
    this.maxH = p.height * CONFIG.MAX_SNOW_RATIO;
    this.flowThreshold = CONFIG.FLOW_THRESHOLD_UNITS * this.res;
    this.hasSnow = false;
    this.buildKernel();
    this.buildNoise();
  }

  buildKernel() {
    const p = this.p;
    this.spread = CONFIG.DEPOSIT_SPREAD_COLS;
    this.weights = [];
    this.weightSum = 0;
    const halfPi = p.TWO_PI / CONFIG.RADIUS_TO_DIAM;
    for (let k = -this.spread; k <= this.spread; k++) {
      const w = (1 + Math.cos(halfPi * k / (this.spread + 1))) / CONFIG.RADIUS_TO_DIAM;
      this.weights.push(w);
      this.weightSum += w;
    }
  }

  resize() {
    const p = this.p;
    const newCols = Math.ceil(p.width / this.res) + CONFIG.GRID_EXTRA_COLS;
    const nt = new Float32Array(newCols);
    const nh = new Float32Array(newCols);
    const copy = Math.min(this.cols, newCols);
    for (let i = 0; i < copy; i++) { nt[i] = this.hTarget[i]; nh[i] = this.h[i]; }
    for (let i = copy; i < newCols; i++) {
      nt[i] = copy > 0 ? nt[copy - 1] : 0;
      nh[i] = copy > 0 ? nh[copy - 1] : 0;
    }
    this.cols = newCols;
    this.hTarget = nt;
    this.h = nh;
    this.maxH = p.height * CONFIG.MAX_SNOW_RATIO;
    this.flowThreshold = CONFIG.FLOW_THRESHOLD_UNITS * this.res;
    this.buildNoise();
  }

  buildNoise() {
    const p = this.p;
    this.dotsLight = [];
    this.dotsShadow = [];
    for (let i = 0; i < this.cols; i++) {
      for (let k = 0; k < CONFIG.SNOW_NOISE_PER_COL; k++) {
        const dot = {
          x: (i + p.random()) * this.res,
          frac: p.random(CONFIG.SNOW_NOISE_DEPTH_MIN, CONFIG.SNOW_NOISE_DEPTH_MAX),
          size: p.random(CONFIG.SNOW_NOISE_SIZE_MIN, CONFIG.SNOW_NOISE_SIZE_MAX),
        };
        (p.random() < CONFIG.SNOW_NOISE_LIGHT_RATIO ? this.dotsLight : this.dotsShadow).push(dot);
      }
    }
  }

  indexAt(x) { return this.p.constrain(Math.floor(x / this.res), 0, this.cols - 1); }

  heightAt(x) {
    const gx = this.p.constrain(x / this.res, 0, this.cols - 1);
    const i = Math.floor(gx);
    const f = gx - i;
    const j = Math.min(i + 1, this.cols - 1);
    return this.h[i] * (1 - f) + this.h[j] * f;
  }
  surfaceYAt(x) { return this.p.height - this.heightAt(x); }

  slopeAt(x) {
    const s = CONFIG.SNOWBALL_SLOPE_SAMPLE;
    const hL = this.heightAt(x - s);
    const hR = this.heightAt(x + s);
    return (hR - hL) / (s * CONFIG.RADIUS_TO_DIAM);
  }

  depositAt(x, volume) {
    const c = this.indexAt(x);
    const centerH = volume / (this.res * this.weightSum);
    for (let k = -this.spread; k <= this.spread; k++) {
      const idx = c + k;
      if (idx < 0 || idx >= this.cols) continue;
      this.hTarget[idx] = Math.min(
        this.hTarget[idx] + centerH * this.weights[k + this.spread], this.maxH
      );
    }
    this.hasSnow = true;
  }

  scrapeUniform(x, width, volume) {
    const i0 = this.indexAt(x - width / CONFIG.RADIUS_TO_DIAM);
    const i1 = this.indexAt(x + width / CONFIG.RADIUS_TO_DIAM);
    const n = i1 - i0 + 1;
    if (n <= 0) return;
    const perCol = volume / (n * this.res);
    for (let i = i0; i <= i1; i++) {
      this.hTarget[i] = Math.max(0, this.hTarget[i] - perCol);
    }
  }

  eraseBox(x0, x1, yTop, yBottom) {
    const i0 = this.indexAt(x0);
    const i1 = this.indexAt(x1);
    for (let i = i0; i <= i1; i++) {
      const surfY = this.p.height - this.hTarget[i];
      const top = Math.max(yTop, surfY);
      const bot = Math.min(yBottom, this.p.height);
      const overlap = bot - top;
      if (overlap > 0) this.hTarget[i] = Math.max(0, this.hTarget[i] - overlap);
    }
  }

  clearLeftOf(x) {
    const iMax = this.indexAt(x);
    for (let i = 0; i <= iMax; i++) {
      this.hTarget[i] = 0;
      this.h[i] = 0;
    }
  }

  clearAll() {
    this.hTarget.fill(0);
    this.h.fill(0);
    this.hasSnow = false;
  }

  update(dt) {
    if (!this.hasSnow) return;

    const settle = Math.min(CONFIG.SNOW_SETTLE_RATE * dt, CONFIG.SNOW_SETTLE_CLAMP);
    for (let i = 1; i < this.cols - 1; i++) {
      const lap = this.hTarget[i - 1] + this.hTarget[i + 1] -
                  CONFIG.RADIUS_TO_DIAM * this.hTarget[i];
      this.hTarget[i] += lap * settle;
    }

    const ease = 1 - Math.pow(1 - CONFIG.SNOW_RISE_EASE, dt);
    for (let i = 0; i < this.cols; i++) {
      this.h[i] += (this.hTarget[i] - this.h[i]) * ease;
    }

    const ht = this.hTarget, n = this.cols, thr = this.flowThreshold;
    const rate = CONFIG.FLOW_RATE * dt;
    for (let pass = 0; pass < CONFIG.FLOW_PASSES; pass++) {
      for (let i = 0; i < n - 1; i++) {
        const diff = ht[i] - ht[i + 1];
        if (diff > thr) {
          const mv = Math.min((diff - thr) * rate, diff * CONFIG.FLOW_MAX_SHARE);
          ht[i] -= mv;
          ht[i + 1] = Math.min(ht[i + 1] + mv, this.maxH);
        } else if (diff < -thr) {
          const mv = Math.min((-diff - thr) * rate, -diff * CONFIG.FLOW_MAX_SHARE);
          ht[i + 1] -= mv;
          ht[i] = Math.min(ht[i] + mv, this.maxH);
        }
      }
    }
  }

  draw() {
    if (!this.hasSnow) return;
    const p = this.p, ctx = p.drawingContext;

    ctx.save();
    const grad = ctx.createLinearGradient(0, p.height - this.maxH, 0, p.height);
    grad.addColorStop(0, rgba(CONFIG.SNOW_BODY_TOP, CONFIG.ALPHA_FULL));
    grad.addColorStop(1, rgba(CONFIG.SNOW_BODY_BOTTOM, CONFIG.ALPHA_FULL));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, p.height);
    for (let i = 0; i < this.cols; i++) ctx.lineTo(i * this.res, p.height - this.h[i]);
    ctx.lineTo(p.width, p.height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    this.drawNoise();

    p.noFill();
    p.stroke(CONFIG.SNOW_SURFACE_LINE[0], CONFIG.SNOW_SURFACE_LINE[1],
             CONFIG.SNOW_SURFACE_LINE[2], CONFIG.SNOW_SURFACE_ALPHA);
    p.strokeWeight(CONFIG.SNOW_SURFACE_WEIGHT);
    p.beginShape();
    for (let i = 0; i < this.cols; i++) p.vertex(i * this.res, p.height - this.h[i]);
    p.endShape();
  }

  drawNoise() {
    const p = this.p;
    p.noStroke();
    p.fill(CONFIG.SNOW_NOISE_LIGHT[0], CONFIG.SNOW_NOISE_LIGHT[1],
           CONFIG.SNOW_NOISE_LIGHT[2], CONFIG.SNOW_NOISE_LIGHT_ALPHA);
    for (const d of this.dotsLight) this.plotDot(d);
    p.fill(CONFIG.SNOW_NOISE_SHADOW[0], CONFIG.SNOW_NOISE_SHADOW[1],
           CONFIG.SNOW_NOISE_SHADOW[2], CONFIG.SNOW_NOISE_SHADOW_ALPHA);
    for (const d of this.dotsShadow) this.plotDot(d);
  }

  plotDot(d) {
    const p = this.p;
    const colH = this.heightAt(d.x);
    if (colH < CONFIG.SNOW_NOISE_MIN_DEPTH) return;
    const y = p.height - colH + d.frac * colH;
    p.circle(d.x, y, d.size);
  }
}


/* ════════════════ 雪花（v14：④frozen强制恢复） ════════════════ */
class Snowflake {
  constructor(scene, scatter) {
    this.scene = scene;
    this.p = scene.p;
    this.reset(scatter);
  }

  reset(scatter = false) {
    const p = this.p;
    this.baseSize = p.random(CONFIG.SNOW_SIZE_MIN, CONFIG.SNOW_SIZE_MAX);
    this.size = this.baseSize * this.scene.sizeScale;
    const t = (this.baseSize - CONFIG.SNOW_SIZE_MIN) /
              Math.max(CONFIG.SNOW_SIZE_MAX - CONFIG.SNOW_SIZE_MIN, CONFIG.EPS);
    this.vy = p.lerp(CONFIG.SNOW_SPEED_MIN, CONFIG.SNOW_SPEED_MAX, t);
    this.alpha = p.lerp(CONFIG.SNOW_ALPHA_MIN, CONFIG.SNOW_ALPHA_MAX, t);
    this.vx = p.random(-CONFIG.SNOW_DRIFT_X_MAX, CONFIG.SNOW_DRIFT_X_MAX);
    this.angle = p.random(0, p.TWO_PI);
    this.x = p.random(-CONFIG.SNOW_DRIFT_WRAP, p.width + CONFIG.SNOW_DRIFT_WRAP);
    this.y = scatter
      ? p.random(-p.height * CONFIG.SNOW_SCATTER_TOP_RATIO, p.height)
      : -p.random(0, CONFIG.SNOW_SPAWN_PAD);
    this.frozen = false;
    this.melting = false; this.meltT = 0;
  }

  startMelt() { if (!this.melting) { this.melting = true; this.meltT = 0; this.frozen = false; } }

  update(dt, dtMs, speedMult) {
    const p = this.p, s = this.scene;
    this.size = this.baseSize * s.sizeScale;

    /* ④ 消融触发时强制解冻 */
    if (s.mouseActive && s.leftDown && !s.uiHold) {
      const dx = this.x - s.mx, dy = this.y - s.my;
      if (dx * dx + dy * dy < CONFIG.MELT_RADIUS * CONFIG.MELT_RADIUS) {
        this.frozen = false;   // ④ 关键：消融前必须解冻
        this.startMelt();
      }
    }

    if (this.melting) {
      this.meltT += dtMs;
      if (this.meltT >= CONFIG.MELT_DURATION) this.reset(false);
      return;
    }

    /* ④ 每帧检查：如果不在悬停半径内，强制解冻（防止永久冻住） */
    if (this.frozen) {
      const dx = this.x - s.mx, dy = this.y - s.my;
      const inRadius = dx * dx + dy * dy < CONFIG.SNOW_HOVER_RADIUS * CONFIG.SNOW_HOVER_RADIUS;
      const shouldFreeze = s.mouseActive && !s.leftDown && !s.uiHold && inRadius;
      if (!shouldFreeze) this.frozen = false;
    }

    if (s.mouseActive && !s.leftDown && !s.uiHold && !this.frozen) {
      const dx = this.x - s.mx, dy = this.y - s.my;
      if (dx * dx + dy * dy < CONFIG.SNOW_HOVER_RADIUS * CONFIG.SNOW_HOVER_RADIUS) {
        this.frozen = true;
        return;
      }
    }

    if (this.frozen) return;   // 冻住时不更新位置

    this.x += this.vx * dt * speedMult;
    this.y += this.vy * dt * speedMult;

    if (this.x < -CONFIG.SNOW_DRIFT_WRAP) this.x = p.width + CONFIG.SNOW_DRIFT_WRAP;
    else if (this.x > p.width + CONFIG.SNOW_DRIFT_WRAP) this.x = -CONFIG.SNOW_DRIFT_WRAP;

    if (this.y + this.size * CONFIG.SNOW_LAND_OFFSET_RATIO >= s.grid.surfaceYAt(this.x)) {
      const r = this.size / CONFIG.RADIUS_TO_DIAM;
      const volume = (p.TWO_PI / CONFIG.RADIUS_TO_DIAM) * r * r * CONFIG.SNOW_DEPOSIT_FACTOR;
      s.grid.depositAt(this.x, volume);
      this.reset(false);
    }
  }

  draw() {
    const p = this.p;
    let k = 1;
    if (this.melting) k = Math.max(0, 1 - this.meltT / CONFIG.MELT_DURATION);
    const size = this.size * k;
    if (size <= CONFIG.EPS) return;
    const a = this.alpha * k;
    const c = CONFIG.SNOW_FLAKE_COLOR;

    const ctx = p.drawingContext;
    const arm = size * CONFIG.SNOW_ARM_RATIO;
    const arms = CONFIG.SNOW_ARM_COUNT;
    const step = p.TWO_PI / arms;
    ctx.strokeStyle = rgba(c, a);
    ctx.lineWidth = Math.max(size * CONFIG.SNOW_STROKE_RATIO, CONFIG.EPS);
    ctx.beginPath();
    for (let i = 0; i < arms; i++) {
      const ang = this.angle + i * step;
      const ca = Math.cos(ang), sa = Math.sin(ang);
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + ca * arm, this.y + sa * arm);
      if (size >= CONFIG.SNOW_BRANCH_MIN_SIZE) {
        const bx = this.x + ca * arm * CONFIG.SNOW_BRANCH_POS;
        const by = this.y + sa * arm * CONFIG.SNOW_BRANCH_POS;
        const bl = arm * CONFIG.SNOW_BRANCH_RATIO;
        for (let sgn = -1; sgn <= 1; sgn += CONFIG.RADIUS_TO_DIAM) {
          const ba = ang + sgn * step;
          ctx.moveTo(bx, by);
          ctx.lineTo(bx + Math.cos(ba) * bl, by + Math.sin(ba) * bl);
        }
      }
    }
    ctx.stroke();
  }
}


/* ════════════════ 雪花场 ════════════════ */
class SnowField {
  constructor(scene) { this.scene = scene; this.p = scene.p; this.flakes = []; }

  rebuild() {
    this.flakes = Array.from(
      { length: CONFIG.SNOW_COUNT },
      () => new Snowflake(this.scene, true)
    );
  }

  update(dt, dtMs) {
    const sm = this.scene.speedMult;
    for (const f of this.flakes) f.update(dt, dtMs, sm);
  }

  draw() { for (const f of this.flakes) f.draw(); }
}


/* ════════════════ 脚印系统 ════════════════ */
class FootprintSystem {
  constructor(scene) { this.scene = scene; this.p = scene.p; this.items = []; }

  rebuild() { this.items.length = 0; }

  tryAdd(x, y) {
    const p = this.p;
    const surf = this.scene.grid.surfaceYAt(x);
    if (y < surf - CONFIG.FOOTPRINT_CLICK_TOL || y > p.height) return false;
    this.items.push({ x, y, born: p.millis() });
    return true;
  }

  update() {
    const now = this.p.millis();
    for (let i = this.items.length - 1; i >= 0; i--) {
      if (now - this.items[i].born > CONFIG.FOOTPRINT_LIFE_MS) this.items.splice(i, 1);
    }
  }

  draw() {
    const p = this.p, now = p.millis();
    const fc = CONFIG.FOOTPRINT_COLOR, sc = CONFIG.SNOW_NOISE_SHADOW;
    p.noStroke();
    for (const fp of this.items) {
      const age = now - fp.born;
      const fadeStart = CONFIG.FOOTPRINT_LIFE_MS * CONFIG.FOOTPRINT_FADE_START;
      let fade = 1;
      if (age > fadeStart) {
        fade = Math.max(0, 1 - (age - fadeStart) / (CONFIG.FOOTPRINT_LIFE_MS - fadeStart));
      }
      p.fill(fc[0], fc[1], fc[2], CONFIG.FOOTPRINT_ALPHA * fade);
      p.ellipse(fp.x, fp.y, CONFIG.FOOTPRINT_W, CONFIG.FOOTPRINT_H);
      p.fill(sc[0], sc[1], sc[2],
             CONFIG.FOOTPRINT_ALPHA * fade * CONFIG.FOOTPRINT_INNER_ALPHA_RATIO);
      p.ellipse(fp.x, fp.y,
                CONFIG.FOOTPRINT_W * CONFIG.FOOTPRINT_INNER_SCALE_W,
                CONFIG.FOOTPRINT_H * CONFIG.FOOTPRINT_INNER_SCALE_H);
    }
  }
}


/* ════════════════ 雪球（v14：①全状态卡住检测） ════════════════ */
class Snowball {
  constructor(scene, x, r) {
    this.scene = scene;
    this.p = scene.p;
    this.r = r;
    this.x = x;
    this.vx = 0;
    this.vy = 0;
    this.angle = 0;
    this.dragVx = 0;
    this.state = 'free';
    this.stackWith = null;
    this.justLanded = false;
    this.lastTrailX = null;
    this.stuckCount = 0;
    this.lastY = 0;
    this.sit();
    this.lastY = this.y;
  }

  sit() { this.y = this.scene.grid.surfaceYAt(this.x) - this.r; }

  pickup(dist) {
    const p = this.p, g = this.scene.grid;
    if (dist <= CONFIG.EPS) return;
    const depth = g.heightAt(this.x);
    if (depth < CONFIG.SNOWBALL_MIN_ROLL_DEPTH) return;
    const desired = this.r + dist * CONFIG.SNOWBALL_GROW_PER_PX;
    if (desired <= this.r) return;
    const pi = p.TWO_PI / CONFIG.RADIUS_TO_DIAM;
    const need = pi * (desired * desired - this.r * this.r);
    const avail = dist * depth * CONFIG.SNOWBALL_PICKUP_RATIO;
    const dV = Math.min(need, avail);
    if (dV <= CONFIG.EPS) return;
    this.r = Math.sqrt(this.r * this.r + dV / pi);
    g.scrapeUniform(this.x, this.r * CONFIG.SNOWBALL_SCRAPE_WIDTH_RATIO, dV);
  }

  /* ① 通用卡住检测：所有状态都可调用 */
  checkStuck() {
    if (Math.abs(this.y - this.lastY) < CONFIG.EPS) {
      this.stuckCount++;
    } else {
      this.stuckCount = 0;
    }
    this.lastY = this.y;
    if (this.stuckCount > CONFIG.STUCK_FRAMES) {
      const surfY = this.scene.grid.surfaceYAt(this.x);
      if (this.y + this.r < surfY - CONFIG.EPS) {
        this.state = 'falling';
        this.vy = CONFIG.SNOWBALL_GRAVITY;
        this.stackWith = null;   // ① 清除堆叠引用，防止永久悬空
      }
      this.stuckCount = 0;
    }
  }

  update(dt) {
    const p = this.p, g = this.scene.grid;
    const dhdx = g.slopeAt(this.x);
    this.vx += -dhdx * CONFIG.SNOWBALL_SLOPE_FORCE * dt;
    this.vx *= Math.pow(CONFIG.SNOWBALL_FRICTION, dt);
    this.x += this.vx * dt;

    const surfY = g.surfaceYAt(this.x);
    if (this.y + this.r >= surfY) {
      this.y = surfY - this.r;
      this.x = p.constrain(this.x, this.r, p.width - this.r);
      this.stuckCount = 0;
    } else {
      this.x = p.constrain(this.x, this.r, p.width - this.r);
      this.checkStuck();   // ① 悬空时检测
    }
    this.angle += (this.vx / Math.max(this.r, CONFIG.EPS)) * dt;
  }

  updateFalling(dt, system) {
    const p = this.p, g = this.scene.grid;
    this.vy += CONFIG.SNOWBALL_GRAVITY * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    const surfY = g.surfaceYAt(this.x);
    if (this.y + this.r >= surfY) {
      this.y = surfY - this.r;
      this.x = p.constrain(this.x, this.r, p.width - this.r);
      this.vy = 0;
      this.state = 'free';
      this.justLanded = true;
      this.stuckCount = 0;
      return;
    }
    this.x = p.constrain(this.x, this.r, p.width - this.r);
    this.checkStuck();   // ① 下落时也检测（防止极端情况卡住）
    this.angle += (this.vx / Math.max(this.r, CONFIG.EPS)) * dt;

    for (const other of system.balls) {
      if (other === this || other.state !== 'free') continue;
      if (Math.abs(other.vx) > CONFIG.SNOWBALL_STACK_MAX_SPEED) continue;
      const dx = this.x - other.x, dy = this.y - other.y;
      const rr = (this.r + other.r) * CONFIG.SNOWBALL_STACK_TOUCH;
      if (dy < 0 && dx * dx + dy * dy < rr * rr) {
        if (this.r <= other.r * CONFIG.SNOWMAN_HEAD_MAX_RATIO &&
            Math.abs(dx) <= other.r * CONFIG.SNOWMAN_TILT_LIMIT) {
          this.stackWith = other;
          this.vx = 0; this.vy = 0;
        } else {
          this.vx = (dx >= 0 ? 1 : -1) * CONFIG.SNOWMAN_SLIDE_OFF_SPEED;
        }
        return;
      }
    }
  }

  draw() {
    const p = this.p;
    const c = CONFIG.SNOWBALL_COLOR, sc = CONFIG.SNOW_NOISE_SHADOW;
    p.noStroke();
    p.fill(c[0], c[1], c[2], CONFIG.ALPHA_FULL);
    p.circle(this.x, this.y, this.r * CONFIG.RADIUS_TO_DIAM);
    p.noFill();
    p.stroke(sc[0], sc[1], sc[2], CONFIG.SNOWBALL_RIM_ALPHA);
    p.strokeWeight(CONFIG.SNOW_SURFACE_WEIGHT + 1);
    p.circle(this.x, this.y, this.r * CONFIG.RADIUS_TO_DIAM);
    p.noStroke();
    p.fill(sc[0], sc[1], sc[2], CONFIG.SNOWBALL_SPECK_ALPHA);
    const sp = this.r * CONFIG.SNOWBALL_SPECK_DIST;
    const ss = Math.max(this.r * CONFIG.SNOWBALL_SPECK_SIZE_RATIO, CONFIG.EPS);
    for (let i = 0; i < CONFIG.SNOWBALL_SPECKS; i++) {
      const ang = this.angle + i * p.TWO_PI / CONFIG.SNOWBALL_SPECKS;
      p.circle(this.x + Math.cos(ang) * sp, this.y + Math.sin(ang) * sp, ss);
    }
  }
}


/* ════════════════ 雪人 ════════════════ */
class Snowman {
  constructor(scene, body, head, offset) {
    this.scene = scene;
    this.p = scene.p;
    this.body = body;
    this.head = head;
    this.offset = offset;
    this.facing = offset >= 0 ? 1 : -1;
    body.state = 'stacked';
    head.state = 'stacked';
  }

  update(dt) {
    const p = this.p, g = this.scene.grid;
    const b = this.body;
    const dhdx = g.slopeAt(b.x);
    if (Math.abs(dhdx) > CONFIG.SNOWMAN_SLOPE_LIMIT) {
      b.vx += -dhdx * CONFIG.SNOWBALL_SLOPE_FORCE * dt;
      b.vx *= Math.pow(CONFIG.SNOWBALL_FRICTION, dt);
      b.x += b.vx * dt;
      b.x = p.constrain(b.x, b.r, p.width - b.r);
      if (Math.abs(b.vx) > CONFIG.SNOWBALL_STACK_MAX_SPEED) this.facing = b.vx > 0 ? 1 : -1;
    } else {
      b.vx = 0;
    }
    b.sit();
    this.head.x = b.x + this.offset;
    this.head.y = b.y - (b.r + this.head.r) * CONFIG.SNOWMAN_SIT_RATIO;
    return Math.abs(this.offset) <= b.r * CONFIG.SNOWMAN_TILT_LIMIT;
  }

  draw() {
    const p = this.p;
    this.body.draw();
    this.head.draw();
    const h = this.head, f = this.facing;
    p.noStroke();
    p.fill(CONFIG.EYE_COLOR[0], CONFIG.EYE_COLOR[1], CONFIG.EYE_COLOR[2], CONFIG.ALPHA_FULL);
    p.circle(h.x - h.r * CONFIG.SNOW_FACE_EYE_OFF_X,
             h.y - h.r * CONFIG.SNOW_FACE_EYE_OFF_Y, CONFIG.EYE_SIZE);
    p.circle(h.x + h.r * CONFIG.SNOW_FACE_EYE_OFF_X,
             h.y - h.r * CONFIG.SNOW_FACE_EYE_OFF_Y, CONFIG.EYE_SIZE);
    p.fill(CONFIG.NOSE_COLOR[0], CONFIG.NOSE_COLOR[1], CONFIG.NOSE_COLOR[2], CONFIG.ALPHA_FULL);
    const nx = h.x + f * h.r * CONFIG.SNOW_FACE_NOSE_START;
    p.triangle(
      nx, h.y - CONFIG.NOSE_H / CONFIG.RADIUS_TO_DIAM,
      nx, h.y + CONFIG.NOSE_H / CONFIG.RADIUS_TO_DIAM,
      nx + f * CONFIG.NOSE_W, h.y
    );
  }
}


/* ════════════════ 雪球系统 ════════════════ */
class SnowballSystem {
  constructor(scene) { this.scene = scene; this.p = scene.p; this.rebuild(); }

  rebuild() {
    this.balls = [];
    this.snowmen = [];
    this.shards = [];
    this.trails = [];
  }

  ballAt(x, y) {
    for (let i = this.snowmen.length - 1; i >= 0; i--) {
      const sm = this.snowmen[i];
      if (this.hit(sm.head, x, y)) return { kind: 'head', ball: sm.head, snowman: sm };
      if (this.hit(sm.body, x, y)) return { kind: 'body', ball: sm.body, snowman: sm };
    }
    for (let i = this.balls.length - 1; i >= 0; i--) {
      if (this.hit(this.balls[i], x, y)) return { kind: 'ball', ball: this.balls[i], snowman: null };
    }
    return null;
  }
  hit(b, x, y) {
    const dx = x - b.x, dy = y - b.y;
    return dx * dx + dy * dy <= b.r * b.r;
  }

  dragUpdate(ball, mx, my, dt) {
    const p = this.p;
    const nx = p.constrain(mx, ball.r, p.width - ball.r);
    const ny = p.constrain(my, ball.r, p.height - ball.r);
    const dx = nx - ball.x;
    ball.x = nx;
    const surfY = this.scene.grid.surfaceYAt(nx);
    if (ny + ball.r >= surfY) {
      ball.y = surfY - ball.r;
      ball.pickup(Math.abs(dx));
      this.emitTrail(ball);
    } else {
      ball.y = ny;
    }
    ball.angle += dx / Math.max(ball.r, CONFIG.EPS);
    ball.dragVx = dx / Math.max(dt, CONFIG.EPS);
  }

  release(ball) {
    const surfY = this.scene.grid.surfaceYAt(ball.x);
    ball.vx = ball.dragVx * CONFIG.SNOWBALL_RELEASE_INERTIA;
    if (ball.y + ball.r < surfY - CONFIG.EPS) {
      ball.state = 'falling';
      ball.vy = 0;
    } else {
      ball.state = 'free';
      ball.sit();
      this.tryStack(ball);
    }
  }

  formSnowman(head, body) {
    const ib = this.balls.indexOf(body);
    if (ib >= 0) this.balls.splice(ib, 1);
    const ih = this.balls.indexOf(head);
    if (ih >= 0) this.balls.splice(ih, 1);
    head.stackWith = null;
    this.snowmen.push(new Snowman(this.scene, body, head, head.x - body.x));
  }

  tryStack(ball) {
    if (Math.abs(ball.vx) > CONFIG.SNOWBALL_STACK_MAX_SPEED) return;
    for (const other of this.balls) {
      if (other === ball || other.state !== 'free') continue;
      if (Math.abs(other.vx) > CONFIG.SNOWBALL_STACK_MAX_SPEED) continue;
      const dx = ball.x - other.x, dy = ball.y - other.y;
      if (dy >= 0) continue;
      const touch = (ball.r + other.r) * CONFIG.SNOWBALL_STACK_TOUCH;
      if (dx * dx + dy * dy < touch * touch) {
        if (ball.r <= other.r * CONFIG.SNOWMAN_HEAD_MAX_RATIO &&
            Math.abs(dx) <= other.r * CONFIG.SNOWMAN_TILT_LIMIT) {
          this.formSnowman(ball, other);
        } else {
          ball.vx = (dx >= 0 ? 1 : -1) * CONFIG.SNOWMAN_SLIDE_OFF_SPEED;
        }
        return;
      }
    }
  }

  shatter(target) {
    const p = this.p;
    const ball = target.ball;
    if (target.snowman) {
      const sm = target.snowman;
      this.snowmen.splice(this.snowmen.indexOf(sm), 1);
      const survivor = target.kind === 'head' ? sm.body : sm.head;
      survivor.state = 'free';
      survivor.vx = 0;
      this.balls.push(survivor);
    } else {
      this.balls.splice(this.balls.indexOf(ball), 1);
    }

    const count = Math.floor(p.random(CONFIG.SHARD_COUNT_MIN, CONFIG.SHARD_COUNT_MAX + 1));
    const pi = p.TWO_PI / CONFIG.RADIUS_TO_DIAM;
    const area = pi * ball.r * ball.r;
    const weights = [];
    let wsum = 0;
    for (let i = 0; i < count; i++) {
      const w = 1 + p.random(-CONFIG.SHARD_AREA_JITTER, CONFIG.SHARD_AREA_JITTER);
      weights.push(w);
      wsum += w;
    }

    for (let i = 0; i < count; i++) {
      const aFrag = area * weights[i] / wsum;
      const K = Math.floor(p.random(CONFIG.SHARD_VERT_MIN, CONFIG.SHARD_VERT_MAX + 1));
      const verts = [];
      for (let v = 0; v < K; v++) {
        verts.push({
          ang: (v / K) * p.TWO_PI + p.random(-CONFIG.SHARD_ANG_JITTER, CONFIG.SHARD_ANG_JITTER),
          rad: p.random(CONFIG.SHARD_JAG_MIN, CONFIG.SHARD_JAG_MAX),
        });
      }
      let unit = 0;
      for (let v = 0; v < K; v++) {
        const a = verts[v], b = verts[(v + 1) % K];
        unit += (a.rad * Math.cos(a.ang)) * (b.rad * Math.sin(b.ang)) -
                (b.rad * Math.cos(b.ang)) * (a.rad * Math.sin(a.ang));
      }
      unit = Math.abs(unit) / CONFIG.RADIUS_TO_DIAM;
      const scale = Math.sqrt(aFrag / Math.max(unit, CONFIG.EPS));
      let rSum = 0;
      for (const vt of verts) {
        vt.px = Math.cos(vt.ang) * vt.rad * scale;
        vt.py = Math.sin(vt.ang) * vt.rad * scale;
        rSum += vt.rad * scale;
      }
      const ang = p.random(0, p.TWO_PI);
      const rad0 = ball.r * Math.sqrt(p.random(0, 1));
      this.shards.push({
        x: ball.x + Math.cos(ang) * rad0,
        y: ball.y + Math.sin(ang) * rad0,
        vx: p.random(-CONFIG.SHARD_VX_MAX, CONFIG.SHARD_VX_MAX),
        vy: p.random(CONFIG.SHARD_VY_MIN, CONFIG.SHARD_VY_MAX),
        rot: p.random(0, p.TWO_PI),
        vr: p.random(-CONFIG.SHARD_ROT_MAX, CONFIG.SHARD_ROT_MAX),
        verts,
        area: aFrag,
        rEff: rSum / K,
        born: p.millis(),
      });
    }
  }

  emitTrail(ball) {
    if (ball.lastTrailX !== null &&
        Math.abs(ball.x - ball.lastTrailX) < ball.r * CONFIG.SNOWBALL_TRAIL_DIST_RATIO) return;
    ball.lastTrailX = ball.x;
    this.trails.push({
      x: ball.x,
      y: this.scene.grid.surfaceYAt(ball.x),
      r: ball.r,
      born: this.p.millis(),
    });
  }

  update(dt) {
    const p = this.p;

    for (const b of this.balls) {
      if (b.state === 'dragged') continue;
      if (b.state === 'falling') {
        b.updateFalling(dt, this);
      } else {
        b.update(dt);
        if (Math.abs(b.vx) > CONFIG.SNOWBALL_TRAIL_MIN_SPEED) this.emitTrail(b);
      }
    }

    const snapshot = this.balls.slice();
    for (const b of snapshot) {
      if (!this.balls.includes(b)) continue;
      if (b.stackWith) {
        if (this.balls.includes(b.stackWith)) this.formSnowman(b, b.stackWith);
        else b.stackWith = null;
        continue;
      }
      if (b.justLanded) { b.justLanded = false; this.tryStack(b); }
      else if (b.state === 'free' && Math.abs(b.vx) < CONFIG.SNOWBALL_STACK_MAX_SPEED) {
        this.tryStack(b);
      }
    }

    for (let i = this.snowmen.length - 1; i >= 0; i--) {
      const sm = this.snowmen[i];
      if (!sm.update(dt)) {
        sm.body.state = 'free';
        sm.head.state = 'free';
        sm.head.vx = (sm.offset >= 0 ? 1 : -1) * CONFIG.SNOWMAN_SLIDE_OFF_SPEED;
        this.balls.push(sm.body, sm.head);
        this.snowmen.splice(i, 1);
      }
    }

    const now = p.millis();
    for (let i = this.shards.length - 1; i >= 0; i--) {
      const s = this.shards[i];
      s.vy += CONFIG.SNOWBALL_GRAVITY * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.rot += s.vr * dt;
      const surf = this.scene.grid.surfaceYAt(s.x);
      if (s.y + s.rEff * CONFIG.SHARD_LAND_RATIO >= surf) {
        this.scene.grid.depositAt(s.x, s.area * CONFIG.SHARD_DEPOSIT_RATIO);
        this.shards.splice(i, 1);
        continue;
      }
      if (now - s.born > CONFIG.SHARD_LIFE_MS) this.shards.splice(i, 1);
    }

    for (let i = this.trails.length - 1; i >= 0; i--) {
      if (now - this.trails[i].born > CONFIG.SNOWBALL_TRAIL_LIFE_MS) this.trails.splice(i, 1);
    }
  }

  drawTrails() {
    const p = this.p, now = p.millis();
    const sc = CONFIG.SNOW_NOISE_SHADOW;
    p.noStroke();
    for (const t of this.trails) {
      const fade = Math.max(0, 1 - (now - t.born) / CONFIG.SNOWBALL_TRAIL_LIFE_MS);
      p.fill(sc[0], sc[1], sc[2], CONFIG.SNOWBALL_TRAIL_ALPHA * fade);
      p.ellipse(t.x, t.y + t.r * CONFIG.SNOWBALL_TRAIL_HEIGHT_RATIO,
                t.r * CONFIG.SNOWBALL_TRAIL_WIDTH_RATIO,
                t.r * CONFIG.SNOWBALL_TRAIL_HEIGHT_RATIO);
    }
  }

  draw() {
    const p = this.p, now = p.millis();
    const ctx = p.drawingContext;
    for (const b of this.balls) b.draw();
    for (const sm of this.snowmen) sm.draw();

    for (const s of this.shards) {
      const fade = Math.max(0, 1 - (now - s.born) / CONFIG.SHARD_LIFE_MS);
      p.push();
      p.translate(s.x, s.y);
      p.rotate(s.rot);
      ctx.shadowBlur = CONFIG.SHARD_BLUR;
      ctx.shadowColor = rgba(CONFIG.SNOW_BODY_TOP, CONFIG.SHARD_BLUR_ALPHA * fade);
      ctx.fillStyle = rgba(CONFIG.SNOW_BODY_TOP, CONFIG.ALPHA_FULL * fade);
      ctx.beginPath();
      ctx.moveTo(s.verts[0].px, s.verts[0].py);
      for (let v = 1; v < s.verts.length; v++) ctx.lineTo(s.verts[v].px, s.verts[v].py);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      p.pop();
    }
  }
}


/* ════════════════ 铲雪车（v14：②触屏归位+兜底） ════════════════ */
class SnowPlow {
  constructor(scene) {
    this.scene = scene;
    this.p = scene.p;
    this.state = 'home';
    this.x = CONFIG.PLOW_HOME_X;
    this.y = this.p.height;
    this.offT = 0;
  }

  reset() {
    this.state = 'home';
    this.x = CONFIG.PLOW_HOME_X;
    this.y = this.p.height;
    this.offT = 0;
  }

  rect() {
    return {
      x0: this.x - CONFIG.PLOW_W / CONFIG.RADIUS_TO_DIAM,
      x1: this.x + CONFIG.PLOW_W / CONFIG.RADIUS_TO_DIAM,
      y0: this.y - CONFIG.PLOW_H,
      y1: this.y,
    };
  }
  hit(px, py) {
    const r = this.rect();
    return px >= r.x0 && px <= r.x1 && py >= r.y0 && py <= r.y1;
  }

  startRun() {
    if (this.state !== 'home') return;
    this.state = 'run';
    this.y = this.p.height;
  }
  beginDrag() { if (this.state === 'home') this.state = 'drag'; }
  endDrag() {
    this.state = 'returning';
    this.y = this.p.height;
  }

  dragTo(mx, my) {
    const p = this.p;
    this.x = p.constrain(mx, CONFIG.PLOW_W / CONFIG.RADIUS_TO_DIAM,
                         p.width - CONFIG.PLOW_W / CONFIG.RADIUS_TO_DIAM);
    this.y = p.constrain(my, CONFIG.PLOW_H, p.height);
    const r = this.rect();
    this.scene.grid.eraseBox(r.x0, r.x1, r.y0, r.y1);
  }

  sweepObjects(lim) {
    const ss = this.scene.snowSystem;
    for (let i = ss.balls.length - 1; i >= 0; i--) {
      if (ss.balls[i].x < lim) ss.balls.splice(i, 1);
    }
    for (let i = ss.snowmen.length - 1; i >= 0; i--) {
      if (ss.snowmen[i].body.x < lim) ss.snowmen.splice(i, 1);
    }
    for (let i = ss.shards.length - 1; i >= 0; i--) {
      if (ss.shards[i].x < lim) ss.shards.splice(i, 1);
    }
    for (let i = ss.trails.length - 1; i >= 0; i--) {
      if (ss.trails[i].x < lim) ss.trails.splice(i, 1);
    }
    const fp = this.scene.footprints;
    for (let i = fp.items.length - 1; i >= 0; i--) {
      if (fp.items[i].x < lim) fp.items.splice(i, 1);
    }
  }

  update(dt, dtMs) {
    const p = this.p, g = this.scene.grid;

    /* ② 兜底：任何非拖拽、非巡行态，强制贴底 */
    if (this.state !== 'drag' && this.state !== 'run') {
      this.y = p.height;
    }

    if (this.state === 'returning') {
      this.x -= CONFIG.PLOW_HOME_SPEED * dt;
      if (this.x <= CONFIG.PLOW_HOME_X) {
        this.x = CONFIG.PLOW_HOME_X;
        this.state = 'home';
      }
    } else if (this.state === 'run') {
      this.x += CONFIG.PLOW_RUN_SPEED * dt;
      g.clearLeftOf(this.x);
      this.sweepObjects(this.x);
      if (this.x - CONFIG.PLOW_W / CONFIG.RADIUS_TO_DIAM > p.width) {
        g.clearAll();
        this.sweepObjects(Number.MAX_VALUE);
        this.state = 'off';
        this.offT = 0;
      }
    } else if (this.state === 'off') {
      this.offT += dtMs;
      if (this.offT >= CONFIG.PLOW_RETURN_DELAY_MS) {
        this.state = 'return';
        this.x = -CONFIG.PLOW_W / CONFIG.RADIUS_TO_DIAM;
        this.y = p.height;
      }
    } else if (this.state === 'return') {
      this.x += CONFIG.PLOW_RETURN_SPEED * dt;
      if (this.x >= CONFIG.PLOW_HOME_X) {
        this.x = CONFIG.PLOW_HOME_X;
        this.y = p.height;
        this.state = 'home';
      }
    }
  }

  draw() {
    if (this.state === 'off') return;
    const p = this.p, g = CONFIG;
    const W = g.PLOW_W, H = g.PLOW_H, x = this.x, y = this.y;
    p.noStroke();

    p.push();
    p.translate(x + W * g.PLOW_BLADE_X, y - H * g.PLOW_BLADE_Y);
    p.rotate(g.PLOW_BLADE_TILT);
    p.fill(g.PLOW_BLADE_COLOR[0], g.PLOW_BLADE_COLOR[1], g.PLOW_BLADE_COLOR[2], CONFIG.ALPHA_FULL);
    p.rect(-W * g.PLOW_BLADE_W / CONFIG.RADIUS_TO_DIAM,
           -H * g.PLOW_BLADE_H / CONFIG.RADIUS_TO_DIAM,
           W * g.PLOW_BLADE_W, H * g.PLOW_BLADE_H);
    p.pop();

    p.fill(g.PLOW_BODY_COLOR[0], g.PLOW_BODY_COLOR[1], g.PLOW_BODY_COLOR[2], CONFIG.ALPHA_FULL);
    p.rect(x + W * g.PLOW_BODY_X0, y - H * g.PLOW_BODY_TOP,
           W * (g.PLOW_BODY_X1 - g.PLOW_BODY_X0), H * g.PLOW_BODY_H);

    p.fill(g.PLOW_CAB_COLOR[0], g.PLOW_CAB_COLOR[1], g.PLOW_CAB_COLOR[2], CONFIG.ALPHA_FULL);
    p.rect(x + W * g.PLOW_CAB_X0, y - H * g.PLOW_CAB_TOP,
           W * (g.PLOW_CAB_X1 - g.PLOW_CAB_X0), H * (g.PLOW_CAB_TOP - g.PLOW_CAB_BOT));
    p.fill(g.PLOW_WINDOW_COLOR[0], g.PLOW_WINDOW_COLOR[1], g.PLOW_WINDOW_COLOR[2], CONFIG.ALPHA_FULL);
    p.rect(x + W * g.PLOW_WIN_X0, y - H * g.PLOW_WIN_TOP,
           W * (g.PLOW_WIN_X1 - g.PLOW_WIN_X0), H * (g.PLOW_WIN_TOP - g.PLOW_WIN_BOT));

    const wr = H * g.PLOW_WHEEL_RATIO;
    p.fill(g.PLOW_WHEEL_COLOR[0], g.PLOW_WHEEL_COLOR[1], g.PLOW_WHEEL_COLOR[2], CONFIG.ALPHA_FULL);
    p.circle(x + W * g.PLOW_WHEEL_X0, y - wr, wr * CONFIG.RADIUS_TO_DIAM);
    p.circle(x + W * g.PLOW_WHEEL_X1, y - wr, wr * CONFIG.RADIUS_TO_DIAM);

    p.fill(g.PLOW_BEACON_COLOR[0], g.PLOW_BEACON_COLOR[1], g.PLOW_BEACON_COLOR[2], CONFIG.ALPHA_FULL);
    p.circle(x + W * g.PLOW_BEACON_X, y - H * g.PLOW_CAB_TOP - H * g.PLOW_BEACON_R,
             H * g.PLOW_BEACON_R * CONFIG.RADIUS_TO_DIAM);
  }
}


/* ════════════════ 场景总控（v14：②触屏释放确保endDrag） ════════════════ */
class SnowScene {
  constructor(p) {
    this.p = p;
    this.speedMult = CONFIG.SPEED_INIT;
    this.sizeScale = CONFIG.SNOW_SCALE_INIT;
    this.mx = 0; this.my = 0;
    this.mouseActive = false;
    this.leftDown = false;
    this.uiHold = null;
    this.keyUp = false;
    this.keyDown = false;
    this.input = null;
    this.lastClickTime = 0;

    this.touchId = null;
    this.touchStart = 0;
    this.touchAnchor = { x: 0, y: 0 };
    this.longPressFired = false;
    this.lastTouch = { x: 0, y: 0 };

    this.uiButtons = [
      { id: 'size-',  label: '雪−', kind: 'size',  dir: -1 },
      { id: 'size+',  label: '雪+', kind: 'size',  dir: 1 },
      { id: 'speed-', label: '速−', kind: 'speed', dir: -1 },
      { id: 'speed+', label: '速+', kind: 'speed', dir: 1 },
    ];

    this.bg = new BackgroundLayer(this);
    this.grid = new SnowGrid(this);
    this.field = new SnowField(this);
    this.footprints = new FootprintSystem(this);
    this.snowSystem = new SnowballSystem(this);
    this.plow = new SnowPlow(this);
    this.streetLight = new StreetLight(this);
    this.reset();
  }

  reset() {
    this.bg.rebuild();
    this.grid.rebuild();
    this.field.rebuild();
    this.footprints.rebuild();
    this.snowSystem.rebuild();
    this.plow.reset();
    this.streetLight.on = false;
    this.input = null;
    this.lastClickTime = 0;
  }

  onResize() {
    const p = this.p;
    this.bg.rebuild();
    this.grid.resize();
    for (const b of this.snowSystem.balls) {
      b.x = p.constrain(b.x, b.r, p.width - b.r);
      b.sit();
    }
    for (const sm of this.snowSystem.snowmen) {
      sm.body.x = p.constrain(sm.body.x, sm.body.r, p.width - sm.body.r);
      sm.body.sit();
      sm.head.x = sm.body.x + sm.offset;
    }
    this.plow.x = p.constrain(this.plow.x, CONFIG.PLOW_W / CONFIG.RADIUS_TO_DIAM, p.width);
    if (this.plow.state !== 'drag') this.plow.y = p.height;
  }

  get dtScale() {
    const frameMs = CONFIG.MS_PER_SECOND / CONFIG.BASE_FPS;
    return this.p.constrain(this.p.deltaTime / frameMs, 0, CONFIG.DT_CLAMP);
  }

  uiRect(i) {
    const p = this.p;
    const total = this.uiButtons.length * CONFIG.UI_BTN_W +
                  (this.uiButtons.length - 1) * CONFIG.UI_BTN_GAP;
    const startX = p.width - CONFIG.UI_MARGIN_X - total;
    return {
      x: startX + i * (CONFIG.UI_BTN_W + CONFIG.UI_BTN_GAP),
      y: CONFIG.UI_MARGIN_Y,
      w: CONFIG.UI_BTN_W,
      h: CONFIG.UI_BTN_H,
    };
  }
  uiButtonAt(x, y) {
    for (let i = 0; i < this.uiButtons.length; i++) {
      const r = this.uiRect(i);
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return this.uiButtons[i];
    }
    return null;
  }

  frame() {
    const p = this.p;
    const dt = this.dtScale;
    const frameMs = CONFIG.MS_PER_SECOND / CONFIG.BASE_FPS;
    const dtMs = Math.min(p.deltaTime, CONFIG.DT_CLAMP * frameMs);
    const dtSec = dtMs / CONFIG.MS_PER_SECOND;

    this.mx = p.mouseX;
    this.my = p.mouseY;
    if (p.movedX !== 0 || p.movedY !== 0) this.mouseActive = true;

    if (this.longPressFired && this.touchId !== null) {
      this.leftDown = true;
      this.mouseActive = true;
    }

    if (this.uiHold && this.leftDown) {
      const btn = this.uiButtons.find(b => b.id === this.uiHold);
      if (btn) {
        if (btn.kind === 'size') {
          this.sizeScale = Math.max(CONFIG.SNOW_SCALE_MIN,
            this.sizeScale + btn.dir * CONFIG.SIZE_RATE * dtSec);
        } else {
          this.speedMult = Math.max(CONFIG.SPEED_MIN,
            this.speedMult + btn.dir * CONFIG.SPEED_RATE * dtSec);
        }
      }
    }
    const dirK = (this.keyUp ? 1 : 0) - (this.keyDown ? 1 : 0);
    if (dirK !== 0) {
      this.speedMult = Math.max(CONFIG.SPEED_MIN,
        this.speedMult + dirK * CONFIG.SPEED_RATE * dtSec);
    }

    this.handleDragFrame(dt);
    this.field.update(dt, dtMs);
    this.grid.update(dt);
    this.snowSystem.update(dt);
    this.plow.update(dt, dtMs);
    this.footprints.update();
    this.render();
  }

  handleDragFrame(dt) {
    const p = this.p;
    const inp = this.input;
    if (!inp || !this.leftDown || this.uiHold) return;
    if (!inp.isDrag) {
      const dx = p.mouseX - inp.ax, dy = p.mouseY - inp.ay;
      if (dx * dx + dy * dy > CONFIG.DRAG_START_PX * CONFIG.DRAG_START_PX) inp.isDrag = true;
    }
    if (!inp.isDrag) return;

    if (inp.plowTarget) {
      if (this.plow.state === 'home') this.plow.beginDrag();
      if (this.plow.state === 'drag') this.plow.dragTo(p.mouseX, p.mouseY);
      return;
    }

    if (!inp.dragged) {
      if (inp.ball) {
        inp.dragged = inp.ball;
        inp.dragged.state = 'dragged';
      } else {
        const surf = this.grid.surfaceYAt(inp.ax);
        if (inp.ay >= surf - CONFIG.FOOTPRINT_CLICK_TOL) {
          const b = new Snowball(this, inp.ax, CONFIG.SNOWBALL_INIT_RADIUS);
          b.state = 'dragged';
          this.snowSystem.balls.push(b);
          inp.dragged = b;
        }
      }
    }
    if (inp.dragged) this.snowSystem.dragUpdate(inp.dragged, p.mouseX, p.mouseY, dt);
  }

  pressAt(x, y) {
    const p = this.p;
    this.leftDown = true;
    this.mouseActive = true;
    this.lastTouch = { x, y };
    const btn = this.uiButtonAt(x, y);
    if (btn) { this.uiHold = btn.id; this.input = null; return; }
    const plowHit = this.plow.state === 'home' && this.plow.hit(x, y);
    const t = plowHit ? null : this.snowSystem.ballAt(x, y);
    this.input = {
      ax: x, ay: y,
      isDrag: false, dragged: null,
      ball: t ? t.ball : null,
      plowTarget: plowHit,
      lampTarget: !plowHit && !t && this.bg.lampHit(x, y),
    };
  }

  releaseAt(x, y) {
    const p = this.p;
    this.leftDown = false;
    if (this.uiHold) { this.uiHold = null; this.input = null; return; }
    const inp = this.input;
    this.input = null;
    if (!inp) return;

    if (inp.plowTarget) {
      if (inp.isDrag) { this.plow.endDrag(); return; }
      const now = p.millis();
      const isDouble = (now - this.lastClickTime) < CONFIG.DOUBLE_CLICK_MS;
      this.lastClickTime = isDouble ? 0 : now;
      if (isDouble) this.plow.startRun();
      return;
    }

    if (inp.isDrag && inp.dragged) {
      this.snowSystem.release(inp.dragged);
      return;
    }

    const now = p.millis();
    const target = this.snowSystem.ballAt(x, y);
    const isDouble = (now - this.lastClickTime) < CONFIG.DOUBLE_CLICK_MS;
    this.lastClickTime = isDouble ? 0 : now;

    if (inp.lampTarget && !inp.isDrag) {
      this.streetLight.toggle();
      return;
    }

    if (isDouble && target) {
      this.snowSystem.shatter(target);
    } else if (!target) {
      this.footprints.tryAdd(x, y);
    }
  }

  onPress() { if (this.p.mouseButton === this.p.LEFT) this.pressAt(this.p.mouseX, this.p.mouseY); }
  onRelease() { if (this.p.mouseButton === this.p.LEFT) this.releaseAt(this.p.mouseX, this.p.mouseY); }

  onTouchStart() {
    const p = this.p;
    if (this.touchId !== null) return;
    this.touchId = p.touches.length ? p.touches[0].id : 0;
    this.touchStart = p.millis();
    this.touchAnchor = { x: p.mouseX, y: p.mouseY };
    this.lastTouch = { x: p.mouseX, y: p.mouseY };
    this.longPressFired = false;
    this.pressAt(p.mouseX, p.mouseY);
  }
  onTouchMove() {
    const p = this.p;
    this.lastTouch = { x: p.mouseX, y: p.mouseY };
    if (this.longPressFired) return;
    const dx = p.mouseX - this.touchAnchor.x;
    const dy = p.mouseY - this.touchAnchor.y;
    if (dx * dx + dy * dy > CONFIG.DRAG_START_PX * CONFIG.DRAG_START_PX) {
      this.longPressFired = true;
    }
  }
  onTouchEnd() {
    const wasLong = this.longPressFired &&
                    (this.p.millis() - this.touchStart) >= CONFIG.LONG_PRESS_MS;
    const x = this.lastTouch.x, y = this.lastTouch.y;
    this.touchId = null;
    this.longPressFired = false;
    if (wasLong) {
      /* ② 长按结束也要确保铲雪车归位 */
      if (this.input && this.input.plowTarget && this.input.isDrag) this.plow.endDrag();
      this.leftDown = false;
      this.input = null;
      return;
    }
    this.releaseAt(x, y);
  }
  checkLongPress() {
    if (this.longPressFired || this.touchId === null) return;
    if (this.p.millis() - this.touchStart >= CONFIG.LONG_PRESS_MS) {
      this.longPressFired = true;
    }
  }

  onKeyPress() {
    const p = this.p;
    if (p.keyCode === p.UP_ARROW)   { this.keyUp = true; return true; }
    if (p.keyCode === p.DOWN_ARROW) { this.keyDown = true; return true; }
    return false;
  }
  onKeyRelease() {
    const p = this.p;
    if (p.keyCode === p.UP_ARROW)   { this.keyUp = false; return true; }
    if (p.keyCode === p.DOWN_ARROW) { this.keyDown = false; return true; }
    return false;
  }

  clearPointer() {
    this.leftDown = false;
    this.uiHold = null;
    this.input = null;
    this.keyUp = false;
    this.keyDown = false;
    this.touchId = null;
    this.longPressFired = false;
    if (this.plow.state === 'drag') this.plow.endDrag();
  }

  render() {
    this.bg.draw();
    this.streetLight.draw();
    this.grid.draw();
    this.footprints.draw();
    this.snowSystem.drawTrails();
    this.snowSystem.draw();
    this.plow.draw();
    this.field.draw();
    this.drawUI();
    this.drawHUD();
  }

  drawUI() {
    const p = this.p;
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(CONFIG.UI_TEXT_SIZE);
    for (let i = 0; i < this.uiButtons.length; i++) {
      const b = this.uiButtons[i];
      const r = this.uiRect(i);
      const active = this.uiHold === b.id;
      p.noStroke();
      p.fill(CONFIG.UI_COLOR[0], CONFIG.UI_COLOR[1], CONFIG.UI_COLOR[2],
             active ? CONFIG.UI_ALPHA_ACTIVE : CONFIG.UI_ALPHA);
      p.rect(r.x, r.y, r.w, r.h, CONFIG.UI_RADIUS);
      p.fill(CONFIG.UI_TEXT_COLOR[0], CONFIG.UI_TEXT_COLOR[1], CONFIG.UI_TEXT_COLOR[2],
             CONFIG.ALPHA_FULL);
      p.text(b.label, r.x + r.w / CONFIG.RADIUS_TO_DIAM, r.y + r.h / CONFIG.RADIUS_TO_DIAM);
    }
    p.textAlign(p.LEFT, p.TOP);
  }

  drawHUD() {
    const p = this.p, c = CONFIG.HUD_COLOR;
    const maxW = p.width - CONFIG.HUD_MARGIN_X * CONFIG.RADIUS_TO_DIAM;
    let fs = CONFIG.HUD_TEXT_SIZE;
    p.textSize(fs);
    while (fs > CONFIG.HUD_TEXT_SIZE_MIN && p.textWidth('❄ 雪速 ×0.00 · 雪尺 ×0.00') > maxW) {
      fs -= 1;
      p.textSize(fs);
    }
    p.noStroke();
    p.textFont('system-ui, "PingFang SC", "Microsoft YaHei", sans-serif');
    p.textAlign(p.LEFT, p.TOP);
    p.fill(c[0], c[1], c[2], CONFIG.HUD_ALPHA);
    p.text(`❄ 雪速 ×${this.speedMult.toFixed(CONFIG.SPEED_DECIMALS)} · 雪尺 ×${this.sizeScale.toFixed(CONFIG.SPEED_DECIMALS)}`,
           CONFIG.HUD_MARGIN_X, CONFIG.HUD_MARGIN_Y);
    p.fill(c[0], c[1], c[2], CONFIG.HUD_ALPHA * CONFIG.HUD_HINT_ALPHA_RATIO);
    p.textSize(Math.max(fs - 1, CONFIG.HUD_TEXT_SIZE_MIN));
    const hint = '点路灯开关·长按消融·拖铲雪车擦雪·双击清场·滚球/堆雪人/双击碎裂';
    this.drawWrappedText(hint, CONFIG.HUD_MARGIN_X,
                         CONFIG.HUD_MARGIN_Y + fs * CONFIG.HUD_LINE_SPACING,
                         maxW, fs * CONFIG.HUD_LINE_SPACING);
  }

  drawWrappedText(str, x, y, maxW, lineH) {
    const p = this.p;
    let line = '';
    let cy = y;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (p.textWidth(line + ch) > maxW && line.length > 0) {
        p.text(line, x, cy);
        line = ch;
        cy += lineH;
      } else {
        line += ch;
      }
    }
    if (line) p.text(line, x, cy);
  }
}


/* ════════════════ 实例模式入口 ════════════════ */
const snowSketch = (p) => {
  let scene = null;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.pixelDensity(1);
    scene = new SnowScene(p);
    p.drawingContext.lineCap = 'round';
    p.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('blur', () => scene.clearPointer());
  };

  p.draw = () => {
    if (scene) {
      scene.checkLongPress();
      scene.frame();
    }
  };

  p.mousePressed  = () => { if (scene) scene.onPress(); };
  p.mouseReleased = () => { if (scene) scene.onRelease(); };

  p.touchStarted = () => { if (scene) { scene.onTouchStart(); return false; } };
  p.touchMoved   = () => { if (scene) { scene.onTouchMove(); return false; } };
  p.touchEnded   = () => { if (scene) { scene.onTouchEnd(); return false; } };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    if (scene) scene.onResize();
  };

  p.keyPressed  = () => { if (scene && scene.onKeyPress()) return false; };
  p.keyReleased = () => { if (scene && scene.onKeyRelease()) return false; };
};

new p5(snowSketch);
