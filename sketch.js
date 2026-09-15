
/* ════════════════════════════════════════════════════════════════════
   雪夜 · 交互雪景
   ────────────────────────────────────────────────────────────────────
   【当前版本】v16（2026-09-10）

   【本版本改动】
   ① 雪球卡死彻底根治：卡住检测改用"毫秒计时"(STUCK_MS)替代帧数，
      不受速度档/dt 影响；贴面卡死也能救（强行按回雪面）；
      堆叠引用 stackWith 一律清除，杜绝永久悬空
   ② 半空雪花堆积根治：冻结加"最长冻结时间"(SNOW_FREEZE_MAX_MS=1500ms)
      硬上限，超时强制解冻，物理上不可能再永久悬停

   【本版本具备的全部功能】
   · 动态飘雪：200 片六角冰晶，大小/速度/透明度随纵深变化，恒定直线漂移
   · 真实积雪：面积守恒堆积 + 扩散沉降 + 流动找平，形成自然雪丘
   · 悬停冻结：指针靠近雪花暂停飘落，移开继续（最长冻 1.5 秒兜底）
   · 长按消融：按住贴近雪花使其融化消失
   · 滚雪球：拖拽雪面生成雪球，越滚越大无上限，消耗脚下积雪
   · 堆雪人：小雪球放到大雪球上组合成雪人（眼睛+胡萝卜鼻）
   · 双击碎裂：击碎成 10–15 块不规则软边雪块，自然下坠并少量回沉积
   · 铲雪车：拖拽擦雪、松手自动归位；双击触发全场悬空清场动画
   · 路灯开关：点击切换昏黄锥形灯光 + 地面光斑
   · 远景建筑：两栋随机亮窗高楼，电脑/手机自适应间距，手机端呼吸动画
   · 冷蓝脚印：单击雪面留痕，2 秒淡出
   · 调速调尺：↑↓键 + 右上按钮调节雪速/雪花大小（长按连续，加速无上限）
   · 全平台：桌面鼠标 + 手机/平板触屏，自适应屏幕，HUD 自动换行
   · 像素密度=1 统一坐标系，保交互兼容；描边加粗抗糊
   ────────────────────────────────────────────────────────────────────
   【技术】p5.js 1.9.4 实例模式 · 纯前端静态 · CONFIG 集中参数 · Class 封装
   【历史版本】v1~v15 见 GitHub Commits 记录，可随时回退
════════════════════════════════════════════════════════════════════ */

const CONFIG = {

  /* ── 时间基准 ──────────────────────────────────────────── */
  BASE_FPS: 60,          // 基准帧率：所有"每帧"速度的换算锚点 ｜ 建议固定 60
  MS_PER_SECOND: 1000,   // 毫秒/秒：时间单位换算 ｜ 固定
  DT_CLAMP: 3,           // 帧时上限钳制：切后台回来雪花不会瞬移 ｜ 建议 2–4
  EPS: 0.0001,           // 除零保护常数 ｜ 固定
  MAX_PIXEL_DENSITY: 1,  // 像素密度上限：强制 1 统一坐标系保交互兼容 ｜ 固定 1
  RADIUS_TO_DIAM: 2,     // 半径→直径换算常数（几何） ｜ 固定
  ALPHA_FULL: 255,       // 不透明度满值常数 ｜ 固定
  LONG_PRESS_MS: 480,    // 触屏长按判定阈值(ms) ｜ 建议 350–600
  STUCK_MS: 500,         // 雪球连续不动超过此毫秒数强制重置下落（改用时间，不受帧率/速度档影响） ｜ 建议 300–800

  /* ── 夜空氛围 ──────────────────────────────────────────── */
  BG_TOP: [7, 11, 26],        // 天顶深钴蓝：压住全场、衬托白雪 ｜ 建议 [5,8,20]~[15,22,44]
  BG_BOTTOM: [30, 42, 72],    // 天际微亮蓝：与雪色呼应，避免死黑 ｜ 建议 [22,30,54]~[40,54,90]
  HAZE_COLOR: [122, 144, 186],// 地雾颜色：近地一层呼吸感冷雾 ｜ 冷蓝灰系
  HAZE_ALPHA: 20,             // 地雾透明度：若有若无才高级 ｜ 建议 10–40
  HAZE_HEIGHT_RATIO: 0.28,    // 地雾占屏高比例 ｜ 建议 0.15–0.4
  STAR_COUNT: 90,             // 星数：疏朗为宜，多则抢雪 ｜ 建议 40–160
  STAR_SKY_RATIO: 0.72,       // 星只分布在天空上段的比例 ｜ 建议 0.5–0.9
  STAR_SIZE_MIN: 0.6,         // 最小星径：远处微芒 ｜ 建议 0.4–1.0
  STAR_SIZE_MAX: 1.8,         // 最大星径：近景亮点 ｜ 建议 1.4–2.4
  STAR_ALPHA_MIN: 40,         // 最暗星透明度 ｜ 建议 20–80
  STAR_ALPHA_MAX: 150,        // 最亮星透明度：不可盖过雪 ｜ 建议 100–200
  STAR_COLOR: [222, 232, 246],// 星光色：微蓝冷白 ｜ 冷白系
  MOON_X_RATIO: 0.78,         // 冷月横向位置（宽占比） ｜ 建议 0.15–0.85
  MOON_Y_RATIO: 0.18,         // 冷月纵向位置（高占比） ｜ 建议 0.10–0.30
  MOON_RADIUS: 34,            // 月半径：小而清冷 ｜ 建议 22–56
  MOON_COLOR: [226, 233, 244],// 月色：偏蓝的冷白 ｜ 冷白系
  MOON_GLOW_RADIUS: 120,      // 月晕扩散半径：朦胧光域 ｜ 建议 80–180
  MOON_GLOW_ALPHA: 26,        // 月晕透明度：必须微弱 ｜ 建议 12–45
  MOON_GLOW_INNER_RATIO: 0.35,// 月晕渐变内圈起点比例 ｜ 建议 0.2–0.6

  /* ── 远景建筑 + 路灯（电脑手机自适应） ─────────────────── */
  BLDG_FAR_X_DESKTOP: 0.16,   // 电脑端远楼横向位置（恢复初版） ｜ 建议 0.12–0.22
  BLDG_FAR_X_MOBILE: 0.08,    // 手机端远楼横向位置（拉开间距） ｜ 建议 0.04–0.12
  BLDG_FAR_W: 70,             // 远楼宽(px) ｜ 建议 50–110
  BLDG_FAR_H_RATIO: 0.42,     // 远楼高=屏高×该比 ｜ 建议 0.3–0.5
  BLDG_NEAR_X_DESKTOP: 0.30,  // 电脑端近楼横向位置（恢复初版） ｜ 建议 0.24–0.36
  BLDG_NEAR_X_MOBILE: 0.22,   // 手机端近楼横向位置（拉开间距） ｜ 建议 0.16–0.28
  BLDG_NEAR_W: 116,           // 近楼宽(px) ｜ 建议 80–160
  BLDG_NEAR_H_RATIO: 0.60,    // 近楼高=屏高×该比 ｜ 建议 0.45–0.7
  BLDG_BREATH_AMP: 0.003,     // 手机端楼体呼吸振幅（宽占比） ｜ 建议 0.001–0.006
  BLDG_BREATH_SPEED: 0.0008,  // 手机端楼体呼吸频率 ｜ 建议 0.0004–0.0015
  BLDG_FAR_COLOR: [26, 34, 56],   // 远楼色（更暗更远） ｜ 深蓝灰系
  BLDG_NEAR_COLOR: [34, 44, 70],  // 近楼色 ｜ 蓝灰系
  BLDG_WIN_COLOR: [255, 214, 138],// 窗灯昏黄 ｜ 暖黄系
  BLDG_WIN_ALPHA: 150,        // 窗灯透明度 ｜ 建议 90–210
  BLDG_WIN_COLS: 4,           // 窗列数 ｜ 建议 3–6
  BLDG_WIN_ROWS: 9,           // 窗行数 ｜ 建议 6–14
  BLDG_WIN_W_RATIO: 0.5,      // 单窗宽=列距×该比 ｜ 建议 0.35–0.65
  BLDG_WIN_H_RATIO: 0.45,     // 单窗高=行距×该比 ｜ 建议 0.3–0.6
  BLDG_WIN_LIT_RATIO: 0.55,   // 亮窗占比 ｜ 建议 0.35–0.75
  LAMP_X_DESKTOP: 0.46,       // 电脑端路灯横向位置（恢复初版） ｜ 建议 0.4–0.52
  LAMP_X_MOBILE: 0.62,        // 手机端路灯横向位置（大幅右移分离） ｜ 建议 0.55–0.72
  LAMP_H_RATIO: 0.74,         // 灯杆高=屏高×该比（高于最高雪线35%） ｜ 建议 0.55–0.82
  LAMP_POLE_W: 5,             // 灯杆宽(px) ｜ 建议 3–8
  LAMP_ARM_LEN: 34,           // 灯臂长(px) ｜ 建议 20–50
  LAMP_HEAD_W: 16,            // 灯头宽(px) ｜ 建议 10–24
  LAMP_HEAD_H: 7,             // 灯头高(px) ｜ 建议 5–12
  LAMP_POLE_COLOR: [44, 52, 74],  // 灯杆色 ｜ 深灰蓝系
  LAMP_HIGHLIGHT_COLOR: [120, 110, 90], // 灯杆暖高光（与冷楼区分） ｜ 暖灰系
  LAMP_HIT_PAD: 22,           // 点击判定外扩（手机加大） ｜ 建议 14–30
  LIGHT_COLOR: [255, 206, 120],   // 灯光昏黄色 ｜ 暖黄系
  LIGHT_CONE_HALF: 0.62,      // 光锥半角(rad)：照射范围 ｜ 建议 0.4–0.9
   
/* ════════════════════════════════════════════════════════════════════
   雪夜 · 交互雪景
   ────────────────────────────────────────────────────────────────────
   【当前版本】v16（2026-09-10）

   【本版本改动】
   ① 雪球卡死彻底根治：卡住检测改用"毫秒计时"(STUCK_MS)替代帧数，
      不受速度档/dt 影响；贴面卡死也能救（强行按回雪面）；
      堆叠引用 stackWith 一律清除，杜绝永久悬空
   ② 半空雪花堆积根治：冻结加"最长冻结时间"(SNOW_FREEZE_MAX_MS=1500ms)
      硬上限，超时强制解冻，物理上不可能再永久悬停

   【本版本具备的全部功能】
   · 动态飘雪：200 片六角冰晶，大小/速度/透明度随纵深变化，恒定直线漂移
   · 真实积雪：面积守恒堆积 + 扩散沉降 + 流动找平，形成自然雪丘
   · 悬停冻结：指针靠近雪花暂停飘落，移开继续（最长冻 1.5 秒兜底）
   · 长按消融：按住贴近雪花使其融化消失
   · 滚雪球：拖拽雪面生成雪球，越滚越大无上限，消耗脚下积雪
   · 堆雪人：小雪球放到大雪球上组合成雪人（眼睛+胡萝卜鼻）
   · 双击碎裂：击碎成 10–15 块不规则软边雪块，自然下坠并少量回沉积
   · 铲雪车：拖拽擦雪、松手自动归位；双击触发全场悬空清场动画
   · 路灯开关：点击切换昏黄锥形灯光 + 地面光斑
   · 远景建筑：两栋随机亮窗高楼，电脑/手机自适应间距，手机端呼吸动画
   · 冷蓝脚印：单击雪面留痕，2 秒淡出
   · 调速调尺：↑↓键 + 右上按钮调节雪速/雪花大小（长按连续，加速无上限）
   · 全平台：桌面鼠标 + 手机/平板触屏，自适应屏幕，HUD 自动换行
   · 像素密度=1 统一坐标系，保交互兼容；描边加粗抗糊
   ────────────────────────────────────────────────────────────────────
   【技术】p5.js 1.9.4 实例模式 · 纯前端静态 · CONFIG 集中参数 · Class 封装
   【历史版本】v1~v15 见 GitHub Commits 记录，可随时回退
════════════════════════════════════════════════════════════════════ */

const CONFIG = {

  /* ── 时间基准 ──────────────────────────────────────────── */
  BASE_FPS: 60,          // 基准帧率：所有"每帧"速度的换算锚点 ｜ 建议固定 60
  MS_PER_SECOND: 1000,   // 毫秒/秒：时间单位换算 ｜ 固定
  DT_CLAMP: 3,           // 帧时上限钳制：切后台回来雪花不会瞬移 ｜ 建议 2–4
  EPS: 0.0001,           // 除零保护常数 ｜ 固定
  MAX_PIXEL_DENSITY: 1,  // 像素密度上限：强制 1 统一坐标系保交互兼容 ｜ 固定 1
  RADIUS_TO_DIAM: 2,     // 半径→直径换算常数（几何） ｜ 固定
  ALPHA_FULL: 255,       // 不透明度满值常数 ｜ 固定
  LONG_PRESS_MS: 480,    // 触屏长按判定阈值(ms) ｜ 建议 350–600
  STUCK_MS: 500,         // 雪球连续不动超过此毫秒数强制重置下落（改用时间，不受帧率/速度档影响） ｜ 建议 300–800

  /* ── 夜空氛围 ──────────────────────────────────────────── */
  BG_TOP: [7, 11, 26],        // 天顶深钴蓝：压住全场、衬托白雪 ｜ 建议 [5,8,20]~[15,22,44]
  BG_BOTTOM: [30, 42, 72],    // 天际微亮蓝：与雪色呼应，避免死黑 ｜ 建议 [22,30,54]~[40,54,90]
  HAZE_COLOR: [122, 144, 186],// 地雾颜色：近地一层呼吸感冷雾 ｜ 冷蓝灰系
  HAZE_ALPHA: 20,             // 地雾透明度：若有若无才高级 ｜ 建议 10–40
  HAZE_HEIGHT_RATIO: 0.28,    // 地雾占屏高比例 ｜ 建议 0.15–0.4
  STAR_COUNT: 90,             // 星数：疏朗为宜，多则抢雪 ｜ 建议 40–160
  STAR_SKY_RATIO: 0.72,       // 星只分布在天空上段的比例 ｜ 建议 0.5–0.9
  STAR_SIZE_MIN: 0.6,         // 最小星径：远处微芒 ｜ 建议 0.4–1.0
  STAR_SIZE_MAX: 1.8,         // 最大星径：近景亮点 ｜ 建议 1.4–2.4
  STAR_ALPHA_MIN: 40,         // 最暗星透明度 ｜ 建议 20–80
  STAR_ALPHA_MAX: 150,        // 最亮星透明度：不可盖过雪 ｜ 建议 100–200
  STAR_COLOR: [222, 232, 246],// 星光色：微蓝冷白 ｜ 冷白系
  MOON_X_RATIO: 0.78,         // 冷月横向位置（宽占比） ｜ 建议 0.15–0.85
  MOON_Y_RATIO: 0.18,         // 冷月纵向位置（高占比） ｜ 建议 0.10–0.30
  MOON_RADIUS: 34,            // 月半径：小而清冷 ｜ 建议 22–56
  MOON_COLOR: [226, 233, 244],// 月色：偏蓝的冷白 ｜ 冷白系
  MOON_GLOW_RADIUS: 120,      // 月晕扩散半径：朦胧光域 ｜ 建议 80–180
  MOON_GLOW_ALPHA: 26,        // 月晕透明度：必须微弱 ｜ 建议 12–45
  MOON_GLOW_INNER_RATIO: 0.35,// 月晕渐变内圈起点比例 ｜ 建议 0.2–0.6

  /* ── 远景建筑 + 路灯（电脑手机自适应） ─────────────────── */
  BLDG_FAR_X_DESKTOP: 0.16,   // 电脑端远楼横向位置（恢复初版） ｜ 建议 0.12–0.22
  BLDG_FAR_X_MOBILE: 0.08,    // 手机端远楼横向位置（拉开间距） ｜ 建议 0.04–0.12
  BLDG_FAR_W: 70,             // 远楼宽(px) ｜ 建议 50–110
  BLDG_FAR_H_RATIO: 0.42,     // 远楼高=屏高×该比 ｜ 建议 0.3–0.5
  BLDG_NEAR_X_DESKTOP: 0.30,  // 电脑端近楼横向位置（恢复初版） ｜ 建议 0.24–0.36
  BLDG_NEAR_X_MOBILE: 0.22,   // 手机端近楼横向位置（拉开间距） ｜ 建议 0.16–0.28
  BLDG_NEAR_W: 116,           // 近楼宽(px) ｜ 建议 80–160
  BLDG_NEAR_H_RATIO: 0.60,    // 近楼高=屏高×该比 ｜ 建议 0.45–0.7
  BLDG_BREATH_AMP: 0.003,     // 手机端楼体呼吸振幅（宽占比） ｜ 建议 0.001–0.006
  BLDG_BREATH_SPEED: 0.0008,  // 手机端楼体呼吸频率 ｜ 建议 0.0004–0.0015
  BLDG_FAR_COLOR: [26, 34, 56],   // 远楼色（更暗更远） ｜ 深蓝灰系
  BLDG_NEAR_COLOR: [34, 44, 70],  // 近楼色 ｜ 蓝灰系
  BLDG_WIN_COLOR: [255, 214, 138],// 窗灯昏黄 ｜ 暖黄系
  BLDG_WIN_ALPHA: 150,        // 窗灯透明度 ｜ 建议 90–210
  BLDG_WIN_COLS: 4,           // 窗列数 ｜ 建议 3–6
  BLDG_WIN_ROWS: 9,           // 窗行数 ｜ 建议 6–14
  BLDG_WIN_W_RATIO: 0.5,      // 单窗宽=列距×该比 ｜ 建议 0.35–0.65
  BLDG_WIN_H_RATIO: 0.45,     // 单窗高=行距×该比 ｜ 建议 0.3–0.6
  BLDG_WIN_LIT_RATIO: 0.55,   // 亮窗占比 ｜ 建议 0.35–0.75
  LAMP_X_DESKTOP: 0.46,       // 电脑端路灯横向位置（恢复初版） ｜ 建议 0.4–0.52
  LAMP_X_MOBILE: 0.62,        // 手机端路灯横向位置（大幅右移分离） ｜ 建议 0.55–0.72
  LAMP_H_RATIO: 0.74,         // 灯杆高=屏高×该比（高于最高雪线35%） ｜ 建议 0.55–0.82
  LAMP_POLE_W: 5,             // 灯杆宽(px) ｜ 建议 3–8
  LAMP_ARM_LEN: 34,           // 灯臂长(px) ｜ 建议 20–50
  LAMP_HEAD_W: 16,            // 灯头宽(px) ｜ 建议 10–24
  LAMP_HEAD_H: 7,             // 灯头高(px) ｜ 建议 5–12
  LAMP_POLE_COLOR: [44, 52, 74],  // 灯杆色 ｜ 深灰蓝系
  LAMP_HIGHLIGHT_COLOR: [120, 110, 90], // 灯杆暖高光（与冷楼区分） ｜ 暖灰系
  LAMP_HIT_PAD: 22,           // 点击判定外扩（手机加大） ｜ 建议 14–30
  LIGHT_COLOR: [255, 206, 120],   // 灯光昏黄色 ｜ 暖黄系
  LIGHT_CONE_HALF: 0.62,      // 光锥半角(rad)：照射范围 ｜ 建议 0.4–0.9
  LIGHT_REACH_RATIO: 1.5,     // 光照距离=灯高×该比 ｜ 建议 1.1–2.0
  LIGHT_CORE_ALPHA: 70,       // 光核透明度 ｜ 建议 40–110
  LIGHT_MID_ALPHA: 34,        // 光中圈透明度 ｜ 建议 18–60
  LIGHT_OUTER_ALPHA: 14,      // 光外圈透明度 ｜ 建议 6–30
  LIGHT_GROUND_ALPHA: 60,     // 地面光斑透明度 ｜ 建议 30–100
  LIGHT_GROUND_W_RATIO: 0.5,  // 地面光斑宽=Reach×该比 ｜ 建议 0.35–0.7

  /* ── 雪花本体 ──────────────────────────────────────────── */
  SNOW_COUNT: 200,            // 常驻雪花数：密度基石 ｜ 建议 100–400
  SNOW_SIZE_MIN: 3,           // 基准最小雪花：远景细雪 ｜ 建议 3–5
  SNOW_SIZE_MAX: 7,           // 基准最大雪花：近景鹅毛，制造纵深 ｜ 建议 5–9
  SNOW_SCALE_INIT: 1.0,       // 全局尺寸倍率初值（按钮统一缩放） ｜ 建议 1.0
  SNOW_SCALE_MIN: 0.1,        // 缩小下限：放大无上限，缩小到此为止防消失 ｜ 建议 0.05–0.2
  SIZE_RATE: 0.8,             // 长按按钮每秒尺寸增量 ｜ 建议 0.4–1.6
  SNOW_SPEED_MIN: 0.5,        // 最慢基准落速(px/帧)：小雪花飘 ｜ 建议 0.3–0.8
  SNOW_SPEED_MAX: 1.6,        // 最快基准落速：大雪花沉稳 ｜ 建议 1.2–2.4
  SNOW_DRIFT_X_MAX: 0.8,      // 水平漂移上限：恒定直线 ｜ 建议 0.4–1.2
  SNOW_ALPHA_MIN: 110,        // 小雪花透明度：朦胧雾感 ｜ 建议 80–150
  SNOW_ALPHA_MAX: 240,        // 大雪花透明度：清晰前景 ｜ 建议 200–255
  SNOW_FLAKE_COLOR: [247, 250, 255], // 雪花色：极淡冷白 ｜ 冷白系
  SNOW_ARM_COUNT: 6,          // 六角冰晶主臂数 ｜ 固定 6
  SNOW_ARM_RATIO: 0.75,       // 主臂长=尺寸×该比 ｜ 建议 0.6–0.9
  SNOW_STROKE_RATIO: 0.26,    // 晶臂线宽=尺寸×该比（加粗抗糊） ｜ 建议 0.18–0.32
  SNOW_BRANCH_MIN_SIZE: 4.5,  // 超过此尺寸画分叉枝晶 ｜ 建议 4–6
  SNOW_BRANCH_POS: 0.55,      // 分叉在主臂上的位置比例 ｜ 建议 0.4–0.7
  SNOW_BRANCH_RATIO: 0.38,    // 分叉长=主臂×该比 ｜ 建议 0.25–0.5
  SNOW_SPAWN_PAD: 30,         // 顶部生成缓冲区：从画外入场不突兀 ｜ 建议 16–60
  SNOW_SCATTER_TOP_RATIO: 0.15,// 初始铺雪向上延伸比例 ｜ 建议 0.05–0.3
  SNOW_DRIFT_WRAP: 20,        // 横向出界回绕余量(px) ｜ 建议 10–40
  SNOW_LAND_OFFSET_RATIO: 0.5,// 陷入半颗雪花判落地：视觉更服帖 ｜ 建议 0.3–0.7

  /* ── 鼠标与雪花 ────────────────────────────────────────── */
  SNOW_FREEZE_MAX_MS: 1500,   // 雪花最长冻结时间(ms)：超时强制解冻，杜绝半空永久堆积 ｜ 建议 800–2500
  SNOW_HOVER_RADIUS: 10,      // 指针尖冻结半径：互动的"呼吸感" ｜ 建议 6–16
  MELT_RADIUS: 28,            // 按住左键的消融半径：掌心温度 ｜ 建议 16–40
  MELT_DURATION: 260,         // 消融蜷缩时长(ms)：看得见"化掉" ｜ 建议 150–450

  /* ── 积雪网格 ──────────────────────────────────────────── */
  GRID_RESOLUTION: 4,         // 网格宽(px)：越小雪面越细腻，越大越省 ｜ 建议 2–8
  GRID_EXTRA_COLS: 1,         // 边缘冗余列数：保证右边界无缝 ｜ 固定 1
  MAX_SNOW_RATIO: 0.35,       // 积雪最高占屏比例：需求 35% ｜ 建议 0.2–0.5
  SNOW_DEPOSIT_FACTOR: 1.0,   // 面积守恒系数：雪体积=雪花投影面积×该比 ｜ 建议 0.6–1.5
  DEPOSIT_SPREAD_COLS: 5,     // 沉积扩散列数（余弦核） ｜ 建议 3–6
  SNOW_RISE_EASE: 0.1,        // 显示高度缓动逼近目标：消除"弹着上涨" ｜ 建议 0.06–0.15
  SNOW_SETTLE_RATE: 0.3,      // 全局沉降扩散强度：决定最大高差 ｜ 建议 0.15–0.45
  SNOW_SETTLE_CLAMP: 0.45,    // 单帧扩散稳定性上限 ｜ 固定 0.45
  FLOW_THRESHOLD_UNITS: 2,    // 流动触发高差(网格单位)：需求定死 2 ｜ 建议 1–3
  FLOW_RATE: 0.35,            // 流动传递率：大=快速找平，小=雪丘留形 ｜ 建议 0.2–0.5
  FLOW_MAX_SHARE: 0.5,        // 单次流动最多搬走高差的比例：防震荡 ｜ 建议 0.3–0.5
  FLOW_PASSES: 2,             // 每帧流动迭代次数：多则更顺滑 ｜ 建议 1–4
  SNOW_BODY_TOP: [238, 244, 252],   // 雪面亮色：微微偏蓝的白 ｜ 冷白系
  SNOW_BODY_BOTTOM: [188, 205, 228],// 雪底暗色：压出厚度感 ｜ 蓝灰系
  SNOW_SURFACE_LINE: [255, 255, 255],// 雪面高光线色 ｜ 白
  SNOW_SURFACE_ALPHA: 150,    // 雪面银边透明度：低调轮廓光 ｜ 建议 90–200
  SNOW_SURFACE_WEIGHT: 1.4,   // 雪面线宽 ｜ 建议 1–2
  SNOW_NOISE_PER_COL: 3,      // 每格噪点数：蓬松质感基石 ｜ 建议 1–6
  SNOW_NOISE_SIZE_MIN: 1,     // 噪点最小直径 ｜ 建议 0.5–1.5
  SNOW_NOISE_SIZE_MAX: 2.4,   // 噪点最大直径 ｜ 建议 1.8–3.0
  SNOW_NOISE_DEPTH_MIN: 0.08, // 噪点在雪深中的分布下限比例 ｜ 建议 0.02–0.15
  SNOW_NOISE_DEPTH_MAX: 0.92, // 噪点在雪深中的分布上限比例 ｜ 建议 0.8–1.0
  SNOW_NOISE_MIN_DEPTH: 6,    // 雪厚低于此值不画噪点(px) ｜ 建议 4–10
  SNOW_NOISE_LIGHT: [255, 255, 255],   // 亮噪点：冰晶闪光 ｜ 白
  SNOW_NOISE_LIGHT_ALPHA: 60,          // 亮噪点透明度 ｜ 建议 30–90
  SNOW_NOISE_SHADOW: [150, 172, 200],  // 暗噪点：蓬松凹陷阴影 ｜ 蓝灰
  SNOW_NOISE_SHADOW_ALPHA: 46,         // 暗噪点透明度 ｜ 建议 25–70
  SNOW_NOISE_LIGHT_RATIO: 0.62,        // 亮噪点占比 ｜ 建议 0.5–0.75

  /* ── 脚印 ──────────────────────────────────────────────── */
  FOOTPRINT_W: 20,            // 脚印宽(px)：需求定值 ｜ 建议 16–26
  FOOTPRINT_H: 10,            // 脚印高(px)：需求定值 ｜ 建议 8–14
  FOOTPRINT_COLOR: [160, 180, 200],  // 冷蓝脚印色：需求 rgba(160,180,200,0.5)
  FOOTPRINT_ALPHA: 128,       // 0.5 透明度 ≈ 128 ｜ 建议 90–160
  FOOTPRINT_LIFE_MS: 2000,    // 脚印寿命：需求 2 秒消散 ｜ 建议 1200–3500
  FOOTPRINT_FADE_START: 0.6,  // 寿命占比达此值开始淡出 ｜ 建议 0.4–0.8
  FOOTPRINT_CLICK_TOL: 4,     // 判定"点在雪面"的容差(px)：空中点击无效 ｜ 建议 2–8
  FOOTPRINT_INNER_SCALE_W: 0.6,  // 凹陷内阴影宽比例 ｜ 建议 0.4–0.75
  FOOTPRINT_INNER_SCALE_H: 0.55, // 凹陷内阴影高比例 ｜ 建议 0.4–0.75
  FOOTPRINT_INNER_ALPHA_RATIO: 0.6,// 内阴影透明度占比 ｜ 建议 0.4–0.8

  /* ── 雪球 / 雪人 ───────────────────────────────────────── */
  SNOWBALL_INIT_RADIUS: 12,   // 雪球初始半径：需求定值 ｜ 建议 8–18
  SNOWBALL_GROW_PER_PX: 0.06, // 每滚 1px 期望半径增量 ｜ 建议 0.03–0.10
  SNOWBALL_PICKUP_RATIO: 0.3, // 可拾取体积比例：雪薄滚不动 ｜ 建议 0.15–0.5
  SNOWBALL_SCRAPE_WIDTH_RATIO: 4, // 刮削宽度=半径×该比：宽幅薄刮无尖沟 ｜ 建议 2–6
  SNOWBALL_MIN_ROLL_DEPTH: 2, // 雪厚低于此值滚不动 ｜ 建议 1–4
  SNOWBALL_GRAVITY: 0.5,      // 雪球下坠/碎雪重力 ｜ 建议 0.3–0.8
  SNOWBALL_FRICTION: 0.985,   // 滚动摩擦：越大滚越远 ｜ 建议 0.96–0.995
  SNOWBALL_SLOPE_FORCE: 0.22, // 坡度下滑加速度 ｜ 建议 0.1–0.4
  SNOWBALL_SLOPE_SAMPLE: 6,   // 坡度采样半宽(px) ｜ 建议 4–10
  SNOWBALL_COLOR: [244, 248, 254],   // 雪球体色 ｜ 冷白系
  SNOWBALL_RIM_ALPHA: 90,     // 雪球轮廓透明度（加粗抗糊） ｜ 建议 60–130
  SNOWBALL_SPECKS: 3,         // 滚动指示斑点数 ｜ 建议 2–4
  SNOWBALL_SPECK_ALPHA: 50,   // 斑点透明度 ｜ 建议 30–80
  SNOWBALL_SPECK_DIST: 0.55,  // 斑点距心比例 ｜ 建议 0.4–0.7
  SNOWBALL_SPECK_SIZE_RATIO: 0.18, // 斑点大小=半径×该比 ｜ 建议 0.12–0.3
  SNOWBALL_RELEASE_INERTIA: 0.6,   // 松手时拖拽速度→初速比例 ｜ 建议 0.3–1.0
  SNOWBALL_STACK_TOUCH: 0.95, // 堆叠接触判定比例 ｜ 建议 0.85–1.0
  SNOWBALL_STACK_MAX_SPEED: 0.8,  // 允许堆叠的最大速度 ｜ 建议 0.5–1.5
  SNOWBALL_TRAIL_ALPHA: 26,   // 拖痕透明度：淡淡一道 ｜ 建议 12–50
  SNOWBALL_TRAIL_LIFE_MS: 2600,// 拖痕寿命 ｜ 建议 1500–4000
  SNOWBALL_TRAIL_MIN_SPEED: 0.3,  // 自由滚动留痕的最低速度 ｜ 建议 0.2–0.6
  SNOWBALL_TRAIL_DIST_RATIO: 0.6, // 留痕间隔=半径×该比 ｜ 建议 0.4–0.9
  SNOWBALL_TRAIL_WIDTH_RATIO: 1.2,  // 痕宽=半径×该比 ｜ 建议 0.9–1.6
  SNOWBALL_TRAIL_HEIGHT_RATIO: 0.35,// 痕高=半径×该比 ｜ 建议 0.2–0.5
  SNOWMAN_HEAD_RATIO: 0.62,   // 头/身审美锚 ｜ 建议 0.5–0.75
  SNOWMAN_HEAD_MAX_RATIO: 1.0,// 头半径≤身半径×该比才成雪人（大压小=无事） ｜ 建议 0.9–1.1
  SNOWMAN_TILT_LIMIT: 0.32,   // 重心偏移/身半径 超限即滑落 ｜ 建议 0.2–0.5
  SNOWMAN_SIT_RATIO: 0.9,     // 头坐落嵌入比例 ｜ 建议 0.8–1.0
  SNOWMAN_SLIDE_OFF_SPEED: 1.5,   // 失衡/拒叠滑开初速 ｜ 建议 1–3
  SNOWMAN_SLOPE_LIMIT: 0.25,  // 整体滑动坡度阈值 ｜ 建议 0.15–0.4
  SNOW_FACE_EYE_OFF_X: 0.3,   // 眼横偏=头半径×该比 ｜ 建议 0.2–0.4
  SNOW_FACE_EYE_OFF_Y: 0.18,  // 眼纵偏=头半径×该比 ｜ 建议 0.1–0.3
  SNOW_FACE_NOSE_START: 0.15, // 鼻起点=头半径×该比 ｜ 建议 0.05–0.3
  EYE_SIZE: 3,                // 眼睛直径：小巧五官 ｜ 建议 2–5
  NOSE_W: 12,                 // 胡萝卜鼻长 ｜ 建议 8–18
  NOSE_H: 4,                  // 胡萝卜鼻粗 ｜ 建议 3–6
  EYE_COLOR: [34, 36, 46],    // 眼睛/纽扣色 ｜ 深炭色系
  NOSE_COLOR: [228, 138, 58], // 胡萝卜橙：全场唯一暖色点缀 ｜ 暖橙系
  DOUBLE_CLICK_MS: 300,       // 双击判定间隔 ｜ 建议 220–400
  DRAG_START_PX: 6,           // 点击/拖拽判定阈值 ｜ 建议 4–10

  /* ── 碎裂雪块 ──────────────────────────────────────────── */
  SHARD_COUNT_MIN: 10,        // 碎裂最少块数：需求 10–15 ｜ 固定 10
  SHARD_COUNT_MAX: 15,        // 碎裂最多块数 ｜ 固定 15
  SHARD_LIFE_MS: 900,         // 碎雪寿命 ｜ 建议 600–1400
  SHARD_AREA_JITTER: 0.25,    // 单块面积抖动±（总量守恒） ｜ 建议 0.1–0.4
  SHARD_VX_MAX: 0.4,          // 碎块水平漂移上限（不外弹） ｜ 建议 0.2–0.8
  SHARD_VY_MIN: -0.2,         // 碎块初速纵向上限（微上） ｜ 建议 -0.5–0
  SHARD_VY_MAX: 0.6,          // 碎块初速纵向下限（向下） ｜ 建议 0.3–1.0
  SHARD_ROT_MAX: 0.2,         // 碎块自旋上限 ｜ 建议 0.1–0.3
  SHARD_VERT_MIN: 5,          // 不规则多边形最少顶点 ｜ 建议 4–6
  SHARD_VERT_MAX: 7,          // 不规则多边形最多顶点 ｜ 建议 6–9
  SHARD_JAG_MIN: 0.7,         // 顶点半径抖动下限：棱角感 ｜ 建议 0.55–0.85
  SHARD_JAG_MAX: 1.3,         // 顶点半径抖动上限 ｜ 建议 1.15–1.5
  SHARD_ANG_JITTER: 0.2,      // 顶点角度抖动(rad) ｜ 建议 0.1–0.35
  SHARD_BLUR: 3,              // 虚化软边宽度(px) ｜ 建议 2–6
  SHARD_BLUR_ALPHA: 120,      // 软边光晕透明度 ｜ 建议 60–180
  SHARD_LAND_RATIO: 0.6,      // 陷入自身半径×该比判触雪 ｜ 建议 0.4–0.8
  SHARD_DEPOSIT_RATIO: 0.2,   // 触雪回沉积比例：只涨一点点 ｜ 建议 0.1–0.3

  /* ── 铲雪车 ────────────────────────────────────────────── */
  PLOW_HOME_X: 70,            // 停放中心 x（左下角） ｜ 建议 40–140
  PLOW_W: 92,                 // 车体宽 ｜ 建议 60–140
  PLOW_H: 46,                 // 车体高 ｜ 建议 32–70
  PLOW_RUN_SPEED: 6,          // 清场巡行速(px/帧) ｜ 建议 4–10
  PLOW_RETURN_SPEED: 4,       // 进场回程速(px/帧) ｜ 建议 2–8
  PLOW_HOME_SPEED: 7,         // 拖拽后自动归位速(px/帧) ｜ 建议 4–12
  PLOW_RETURN_DELAY_MS: 3000, // 退场后等待(ms) ｜ 建议 2000–6000
  PLOW_BODY_COLOR: [236, 148, 52],   // 橙色车体 ｜ 工程橙系
  PLOW_CAB_COLOR: [214, 222, 234],   // 驾驶舱浅冷灰 ｜ 冷灰系
  PLOW_WINDOW_COLOR: [150, 200, 230],// 车窗冷蓝 ｜ 冷蓝系
  PLOW_BLADE_COLOR: [206, 214, 228], // 铲板钢色 ｜ 钢灰系
  PLOW_WHEEL_COLOR: [30, 34, 44],    // 轮色深炭 ｜ 深色系
  PLOW_BEACON_COLOR: [255, 190, 90], // 顶灯暖黄 ｜ 暖黄系
  PLOW_BODY_X0: -0.5,         // 车体左缘=宽×该比 ｜ 固定 -0.5
  PLOW_BODY_X1: 0.3,          // 车体右缘=宽×该比 ｜ 建议 0.2–0.4
  PLOW_BODY_TOP: 0.62,        // 车体顶=高×该比 ｜ 建议 0.5–0.75
  PLOW_BODY_H: 0.44,          // 车体高=高×该比 ｜ 建议 0.35–0.55
  PLOW_CAB_X0: -0.2,          // 舱左缘 ｜ 建议 -0.3–-0.1
  PLOW_CAB_X1: 0.12,          // 舱右缘 ｜ 建议 0.05–0.2
  PLOW_CAB_TOP: 1.0,          // 舱顶=高×该比 ｜ 固定 1.0
  PLOW_CAB_BOT: 0.55,         // 舱底=高×该比 ｜ 建议 0.45–0.65
  PLOW_WIN_X0: -0.12,         // 窗左缘 ｜ 建议 -0.2–-0.05
  PLOW_WIN_X1: 0.06,          // 窗右缘 ｜ 建议 0.0–0.12
  PLOW_WIN_TOP: 0.92,         // 窗顶 ｜ 建议 0.8–0.98
  PLOW_WIN_BOT: 0.62,         // 窗底 ｜ 建议 0.55–0.72
  PLOW_BLADE_X: 0.4,          // 铲板中心x=宽×该比 ｜ 建议 0.3–0.5
  PLOW_BLADE_Y: 0.4,          // 铲板中心y=高×该比 ｜ 建议 0.3–0.5
  PLOW_BLADE_TILT: -0.35,     // 铲板倾角(rad) ｜ 建议 -0.5–-0.2
  PLOW_BLADE_W: 0.12,         // 铲板宽=宽×该比 ｜ 建议 0.08–0.2
  PLOW_BLADE_H: 0.9,          // 铲板高=高×该比 ｜ 建议 0.7–1.1
  PLOW_WHEEL_X0: -0.28,       // 后轮x=宽×该比 ｜ 建议 -0.4–-0.2
  PLOW_WHEEL_X1: 0.16,        // 前轮x=宽×该比 ｜ 建议 0.05–0.25
  PLOW_WHEEL_RATIO: 0.2,      // 轮半径=高×该比 ｜ 建议 0.14–0.26
  PLOW_BEACON_X: -0.04,       // 顶灯x=宽×该比 ｜ 建议 -0.1–0.05
  PLOW_BEACON_R: 0.06,        // 顶灯半径=高×该比 ｜ 建议 0.04–0.1

  /* ── 速度调节 ──────────────────────────────────────────── */
  SPEED_INIT: 1.0,            // 初始倍速 ｜ 建议 1.0
  SPEED_MIN: 0,               // 减速下限 0 = 雪花悬停 ｜ 固定 0
  SPEED_RATE: 0.6,            // 长按每秒倍速增量（加速无上限） ｜ 建议 0.3–1.5
  SPEED_DECIMALS: 2,          // HUD 小数位 ｜ 建议 1–2

  /* ── UI 按钮 ───────────────────────────────────────────── */
  UI_BTN_W: 34,               // 按钮宽 ｜ 建议 28–44
  UI_BTN_H: 22,               // 按钮高 ｜ 建议 18–28
  UI_BTN_GAP: 6,              // 按钮间距 ｜ 建议 4–10
  UI_MARGIN_X: 12,            // 右上外边距 ｜ 建议 8–20
  UI_MARGIN_Y: 12,            // 右上外边距 ｜ 建议 8–20
  UI_RADIUS: 6,               // 圆角 ｜ 建议 4–10
  UI_COLOR: [200, 215, 235],  // 按钮底色 ｜ 冷色系
  UI_ALPHA: 70,               // 常态透明度 ｜ 建议 40–110
  UI_ALPHA_ACTIVE: 170,       // 按住透明度 ｜ 建议 120–220
  UI_TEXT_SIZE: 12,           // 按钮字号 ｜ 建议 10–14
  UI_TEXT_COLOR: [10, 14, 30],// 按钮字色 ｜ 深色系

  /* ── HUD ──────────────────────────────────────────────── */
  HUD_MARGIN_X: 14,           // HUD 左边距 ｜ 建议 10–24
  HUD_MARGIN_Y: 20,           // HUD 上边距 ｜ 建议 14–32
  HUD_TEXT_SIZE: 12,          // HUD 字号(桌面) ｜ 建议 11–14
  HUD_TEXT_SIZE_MIN: 9,       // HUD 最小字号(窄屏自动缩) ｜ 建议 8–11
  HUD_LINE_SPACING: 1.7,      // 行距倍数 ｜ 建议 1.4–2.0
  HUD_COLOR: [200, 215, 235], // HUD 字色 ｜ 冷色系
  HUD_ALPHA: 120,             // HUD 主透明度 ｜ 建议 70–170
  HUD_HINT_ALPHA_RATIO: 0.72, // 提示行透明度占比 ｜ 建议 0.5–0.9
};

/* 颜色工具：CONFIG 颜色数组 + 0–255 透明度 → CSS rgba 字符串 */
const rgba = (c, a) => "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + (a / CONFIG.ALPHA_FULL).toFixed(3) + ")";

/* ════════════════ 背景层（静态：星月+楼+灯，电脑手机自适应） ════════════════ */
class BackgroundLayer {
  constructor(scene) { this.scene = scene; this.p = scene.p; this.buf = null; this.breathPhase = 0; }

  /* 判断是否为移动端（窄屏） */
  isMobile() { return this.p.width < 768; }

  rebuild() {
    const p = this.p, w = p.width, h = p.height;
    if (this.buf) this.buf.remove();
    const g = p.createGraphics(w, h);
    const ctx = g.drawingContext;

    /* 夜空纵向渐变 */
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, rgba(CONFIG.BG_TOP, CONFIG.ALPHA_FULL));
    sky.addColorStop(1, rgba(CONFIG.BG_BOTTOM, CONFIG.ALPHA_FULL));
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    /* 疏星（只铺天空上段） */
    g.noStroke();
    for (let i = 0; i < CONFIG.STAR_COUNT; i++) {
      const sx = p.random(w);
      const sy = p.random(h * CONFIG.STAR_SKY_RATIO);
      const ss = p.random(CONFIG.STAR_SIZE_MIN, CONFIG.STAR_SIZE_MAX);
      const sa = p.random(CONFIG.STAR_ALPHA_MIN, CONFIG.STAR_ALPHA_MAX);
      g.fill(CONFIG.STAR_COLOR[0], CONFIG.STAR_COLOR[1], CONFIG.STAR_COLOR[2], sa);
      g.circle(sx, sy, ss);
    }

    /* 冷月 + 径向月晕 */
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

    /* 电脑端用初版楼距，手机端用拉开后的楼距 */
    const farX = this.isMobile() ? CONFIG.BLDG_FAR_X_MOBILE : CONFIG.BLDG_FAR_X_DESKTOP;
    const nearX = this.isMobile() ? CONFIG.BLDG_NEAR_X_MOBILE : CONFIG.BLDG_NEAR_X_DESKTOP;
    this.drawBuilding(g, w * farX, h, CONFIG.BLDG_FAR_W, h * CONFIG.BLDG_FAR_H_RATIO, CONFIG.BLDG_FAR_COLOR);
    this.drawBuilding(g, w * nearX, h, CONFIG.BLDG_NEAR_W, h * CONFIG.BLDG_NEAR_H_RATIO, CONFIG.BLDG_NEAR_COLOR);

    /* 电脑端用初版灯位，手机端用右移后的灯位 */
    const lampX = this.isMobile() ? CONFIG.LAMP_X_MOBILE : CONFIG.LAMP_X_DESKTOP;
    this.lampHeadX = w * lampX + CONFIG.LAMP_ARM_LEN;
    this.lampHeadY = h * (1 - CONFIG.LAMP_H_RATIO);
    this.drawLamp(g);

    /* 地雾压在最前，柔化建筑底部 */
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
    /* 窗格：部分亮昏黄灯 */
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

  /* 灯杆加暖色高光边，与冷色楼区分 */
  drawLamp(g) {
    const p = this.p;
    const poleX = p.width * (this.isMobile() ? CONFIG.LAMP_X_MOBILE : CONFIG.LAMP_X_DESKTOP);
    const baseY = p.height;
    const topY = this.lampHeadY;
    g.noStroke();
    g.fill(CONFIG.LAMP_POLE_COLOR[0], CONFIG.LAMP_POLE_COLOR[1],
           CONFIG.LAMP_POLE_COLOR[2], CONFIG.ALPHA_FULL);
    g.rect(poleX - CONFIG.LAMP_POLE_W / CONFIG.RADIUS_TO_DIAM, topY,
           CONFIG.LAMP_POLE_W, baseY - topY);
    /* 暖高光细条 */
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

  /* 手机端呼吸动画：每帧微调楼体宽度 */
  updateBreath(dtMs) {
    if (!this.isMobile()) return;
    this.breathPhase += dtMs * CONFIG.BLDG_BREATH_SPEED;
  }

  draw() {
    this.p.image(this.buf, 0, 0);
    /* 手机端呼吸效果：在静态缓冲上叠加一层微动的楼体轮廓（极淡） */
    if (this.isMobile()) {
      const p = this.p, w = p.width, h = p.height;
      const breathOffset = Math.sin(this.breathPhase) * w * CONFIG.BLDG_BREATH_AMP;
      const ctx = p.drawingContext;
      ctx.save();
      ctx.globalAlpha = 0.08;
      const farX = w * CONFIG.BLDG_FAR_X_MOBILE + breathOffset;
      const nearX = w * CONFIG.BLDG_NEAR_X_MOBILE - breathOffset;
      ctx.fillStyle = rgba(CONFIG.BLDG_FAR_COLOR, CONFIG.ALPHA_FULL);
      ctx.fillRect(farX - CONFIG.BLDG_FAR_W / CONFIG.RADIUS_TO_DIAM, h - h * CONFIG.BLDG_FAR_H_RATIO,
                   CONFIG.BLDG_FAR_W, h * CONFIG.BLDG_FAR_H_RATIO);
      ctx.fillStyle = rgba(CONFIG.BLDG_NEAR_COLOR, CONFIG.ALPHA_FULL);
      ctx.fillRect(nearX - CONFIG.BLDG_NEAR_W / CONFIG.RADIUS_TO_DIAM, h - h * CONFIG.BLDG_NEAR_H_RATIO,
                   CONFIG.BLDG_NEAR_W, h * CONFIG.BLDG_NEAR_H_RATIO);
      ctx.restore();
    }
  }
}


/* ════════════════ 路灯光效（开关式） ════════════════ */
class StreetLight {
  constructor(scene) { this.scene = scene; this.p = scene.p; this.on = false; }

  /* 单击切换，直到下次单击 */
  toggle() { this.on = !this.on; }

  draw() {
    if (!this.on) return;
    const p = this.p, bg = this.scene.bg;
    const hx = bg.lampHeadX, hy = bg.lampHeadY + CONFIG.LAMP_HEAD_H;
    const reach = p.height * CONFIG.LAMP_H_RATIO * CONFIG.LIGHT_REACH_RATIO;
    const half = CONFIG.LIGHT_CONE_HALF;
    const lc = CONFIG.LIGHT_COLOR;
    const ctx = p.drawingContext;

    /* 锥形光束（三层衰减模拟距离衰减） */
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

    /* 地面椭圆光斑 */
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

  /* 窗口缩放：保留雪高，仅重排网格与噪点 */
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


/* ════════════════ 雪花（v16：冻结加最长时长兜底，杜绝半空堆积） ════════════════ */
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
    this.frozenAt = 0;          // 开始冻结的时刻(ms)
    this.melting = false; this.meltT = 0;
  }

  startMelt() { if (!this.melting) { this.melting = true; this.meltT = 0; this.frozen = false; } }

  update(dt, dtMs, speedMult) {
    const p = this.p, s = this.scene;
    this.size = this.baseSize * s.sizeScale;
    const nowMs = p.millis();

    /* 消融触发时强制解冻 */
    if (s.mouseActive && s.leftDown && !s.uiHold) {
      const dx = this.x - s.mx, dy = this.y - s.my;
      if (dx * dx + dy * dy < CONFIG.MELT_RADIUS * CONFIG.MELT_RADIUS) {
        this.frozen = false;
        this.startMelt();
      }
    }

    if (this.melting) {
      this.meltT += dtMs;
      if (this.meltT >= CONFIG.MELT_DURATION) this.reset(false);
      return;
    }

    /* 已冻结：不在半径内 或 超过最长冻结时间 → 强制解冻（杜绝半空永久堆积） */
    if (this.frozen) {
      const dx = this.x - s.mx, dy = this.y - s.my;
      const inRadius = dx * dx + dy * dy < CONFIG.SNOW_HOVER_RADIUS * CONFIG.SNOW_HOVER_RADIUS;
      const shouldKeep = s.mouseActive && !s.leftDown && !s.uiHold && inRadius;
      const frozenTooLong = (nowMs - this.frozenAt) > CONFIG.SNOW_FREEZE_MAX_MS;
      if (!shouldKeep || frozenTooLong) this.frozen = false;
    }

    /* 未冻结且满足条件 → 进入冻结，并记录开始时刻 */
    if (!this.frozen && s.mouseActive && !s.leftDown && !s.uiHold) {
      const dx = this.x - s.mx, dy = this.y - s.my;
      if (dx * dx + dy * dy < CONFIG.SNOW_HOVER_RADIUS * CONFIG.SNOW_HOVER_RADIUS) {
        this.frozen = true;
        this.frozenAt = nowMs;
        return;
      }
    }

    if (this.frozen) return;

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


/* ════════════════ 雪球（v16：卡住检测改用毫秒计时，贴面卡死也能救） ════════════════ */
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
    this.stuckSince = 0;   // 开始卡住的时刻（ms），0=未在卡
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

  /* 卡住检测（改用时间）：连续 STUCK_MS 毫秒 Y 几乎不变 → 强制下落。
     无论是否悬空都兜底：哪怕贴着面卡死也强行重置到雪面并清零速度 */
  checkStuck(now) {
    const moved = Math.abs(this.y - this.lastY) > 0.05;   // 阈值放宽到 0.05px，避免浮点抖动误判
    if (moved) {
      this.stuckSince = 0;       // 在动 → 重置计时
    } else if (this.stuckSince === 0) {
      this.stuckSince = now;     // 刚开始不动 → 记录时刻
    }
    this.lastY = this.y;

    const stuckTooLong = this.stuckSince > 0 && (now - this.stuckSince) > CONFIG.STUCK_MS;
    if (!stuckTooLong) return;

    const surfY = this.scene.grid.surfaceYAt(this.x);
    this.stackWith = null;       // 一律清除堆叠引用
    if (this.y + this.r < surfY - 0.5) {
      this.state = 'falling';    // 悬空卡住 → 转为下落
      this.vy = CONFIG.SNOWBALL_GRAVITY;
    } else {
      this.y = surfY - this.r;   // 贴面卡死 → 强行按到雪面
      this.vx = 0; this.vy = 0;
      this.state = 'free';
    }
    this.stuckSince = 0;
  }

  update(dt) {
    const p = this.p, g = this.scene.grid;
    const dhdx = g.slopeAt(this.x);
    this.vx += -dhdx * CONFIG.SNOWBALL_SLOPE_FORCE * dt;
    this.vx *= Math.pow(CONFIG.SNOWBALL_FRICTION, dt);
    this.x += this.vx * dt;

    /* 落地绝对优先：只要底部触及雪面，立即贴地 */
    const surfY = g.surfaceYAt(this.x);
    if (this.y + this.r >= surfY) {
      this.y = surfY - this.r;
      this.x = p.constrain(this.x, this.r, p.width - this.r);
      this.stuckSince = 0;
    } else {
      this.x = p.constrain(this.x, this.r, p.width - this.r);
      this.checkStuck(this.p.millis());   // 悬空时检测（传当前时间）
    }
    this.angle += (this.vx / Math.max(this.r, CONFIG.EPS)) * dt;
  }

  updateFalling(dt, system) {
    const p = this.p, g = this.scene.grid;
    this.vy += CONFIG.SNOWBALL_GRAVITY * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    /* 落地绝对优先 */
    const surfY = g.surfaceYAt(this.x);
    if (this.y + this.r >= surfY) {
      this.y = surfY - this.r;
      this.x = p.constrain(this.x, this.r, p.width - this.r);
      this.vy = 0;
      this.state = 'free';
      this.justLanded = true;
      this.stuckSince = 0;
      return;
    }
    this.x = p.constrain(this.x, this.r, p.width - this.r);
    this.checkStuck(this.p.millis());   // 下落时也检测（传当前时间）
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


/* ════════════════ 铲雪车（触屏归位+兜底） ════════════════ */
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

    /* 兜底：任何非拖拽、非巡行态，强制贴底 */
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


/* ════════════════ 场景总控（触屏释放确保endDrag + 呼吸动画更新） ════════════════ */
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

    /* 更新呼吸动画相位 */
    this.bg.updateBreath(dtMs);

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
