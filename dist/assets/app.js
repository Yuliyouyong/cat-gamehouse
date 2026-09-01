/**
 * 猫猫游戏屋 · 小红书小工具标准离线脚本 (dist/assets/app.js)
 * - 纯 ES2017 经典脚本规范（无 module / 无 import）
 * - 零外部网络请求、零被禁端能力 API
 * - 单页视图切换路由与多游戏手账系统
 */

"use strict";

(function () {
  // ================= 视图路由管理器 (SPA View Router) =================
  let currentActiveView = "view-lobby";

  function switchView(viewId) {
    const target = document.getElementById(viewId);
    if (!target) return;

    document.querySelectorAll(".view-section").forEach(function (v) {
      v.classList.remove("active");
    });
    target.classList.add("active");
    currentActiveView = viewId;
    window.scrollTo(0, 0);

    // 视图特定生命周期初始化
    if (viewId === "view-fishing") {
      startFishingGame();
    } else if (viewId === "view-catch") {
      startCatchGame();
    }
  }

  // 绑定所有返回大厅按钮
  document.querySelectorAll("[data-back='true']").forEach(function (btn) {
    btn.addEventListener("click", function () {
      switchView("view-lobby");
    });
  });

  // ================= 漂浮金粉背景粒子 =================
  const dustCanvas = document.getElementById("dustCanvas");
  if (dustCanvas) {
    const ctx = dustCanvas.getContext("2d");
    let particles = [];

    function resizeCanvas() {
      dustCanvas.width = window.innerWidth;
      dustCanvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    for (let i = 0; i < 24; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: 1 + Math.random() * 1.8,
        speedY: -0.15 - Math.random() * 0.25,
        speedX: (Math.random() - 0.5) * 0.2,
        alpha: 0.2 + Math.random() * 0.5,
        pulse: Math.random() * Math.PI
      });
    }

    function renderDust() {
      ctx.clearRect(0, 0, dustCanvas.width, dustCanvas.height);
      particles.forEach(function (p) {
        p.y += p.speedY;
        p.x += p.speedX;
        p.pulse += 0.03;
        const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));

        if (p.y < -10) { p.y = dustCanvas.height + 10; p.x = Math.random() * dustCanvas.width; }
        if (p.x < -10) p.x = dustCanvas.width + 10;
        if (p.x > dustCanvas.width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(226, 207, 168, " + a + ")";
        ctx.fill();
      });
      requestAnimationFrame(renderDust);
    }
    renderDust();
  }

  // ================= 大厅章节展示与绘本导览 =================
  const CHAPTERS = [
    {
      id: "house",
      room: "roomDiary",
      viewId: "view-house",
      name: "珠珠与猫咪的小屋",
      tagline: "莫兰迪粉绿 · 治愈温室 · 每日心灵签",
      badge: "✦ 镇屋主殿",
      desc: "每日抽一张法式大阿卡纳心灵签，写下水彩心绪日记，盖上猫爪印章，抚养那只超大星星眼的白猫。「你的存在对我而言是珍珠」。",
      tags: ["治愈手账", "心灵签语", "灵猫养成", "日记手账"]
    },
    {
      id: "clicker",
      room: "roomLiving",
      viewId: "view-clicker",
      name: "喵喵点击器",
      tagline: "客厅猫爬架 · 狂欢蹦蹦跳",
      badge: "🐾 极度解压",
      desc: "在客厅猫爬架上轻抚点触小猫！随着连击数飙升，小猫会触发弹跳、欢笑、眼花头晕等多种进化表情，伴随欢快金币数字飞舞！",
      tags: ["连击爽感", "多重表情", "轻度解压", "手速狂人"]
    },
    {
      id: "guess",
      room: "roomGuess",
      viewId: "view-guess",
      name: "猫猫猜数字",
      tagline: "温暖小茶几 · 灵犀一点通",
      badge: "🎯 默契考验",
      desc: "小橘把一个 1~100 的幸运数字藏在了小茶几的盒子里。根据小猫的傲娇提示推断高了还是低了，看看你能用几步测出心有灵犀！",
      tags: ["逻辑推演", "暖心对话", "轻松休闲", "记录挑战"]
    },
    {
      id: "fishing",
      room: "roomPond",
      viewId: "view-fishing",
      name: "猫猫钓鱼",
      tagline: "庭院荷塘 · 涟漪抓鱼抓抓抓",
      badge: "🎣 限时挑战",
      desc: "庭院池塘里波光粼粼，三条滑溜溜的小鱼同时游曳！45 秒紧张刺激的限时抓鱼挑战，配合全新加入的暂停控制台，体验灵动水波！",
      tags: ["水面波光", "手速捕鱼", "暂停支持", "最高连战"]
    },
    {
      id: "catch",
      room: "roomFishRoof",
      viewId: "view-catch",
      name: "猫猫接鱼干",
      tagline: "天台晒鱼架 · 天降鱼干雨",
      badge: "🐟 惊险接接乐",
      desc: "天台上在下一场金黄鱼干雨！左右滑动敏捷的小橘接住美味鱼干，小心淘气老鼠与炸弹！全手势操控，带来满满手账趣味。",
      tags: ["动作敏捷", "连击加分", "暂停控制", "刺激爽快"]
    },
    {
      id: "tarot",
      room: "roomAttic",
      viewId: "view-tarot",
      name: "猫猫占星阁",
      tagline: "阁楼占星天窗 · 22张大阿卡纳",
      badge: "🔮 深度运势",
      desc: "收录愚者、魔术师、女祭司等全部 22 张经典手绘大阿卡纳牌。静心洗牌抽牌，解读来自星辰与猫咪的温柔箴言。",
      tags: ["22张大阿卡纳", "精雕手绘", "星象哲学", "今日启示"]
    },
    {
      id: "doodle",
      room: "roomAttic",
      viewId: "view-doodle",
      name: "涂鸦灵签",
      tagline: "随身口袋灵签 · 轻松随心抽",
      badge: "✨ 每日小确幸",
      desc: "手绘水彩白猫眨着灵动的星星大眼，随时随地陪你无限抽签！享受轻松明快的运势絮语与撒娇互动。",
      tags: ["手绘治愈", "无限翻牌", "星星眼白猫", "轻松解闷"]
    }
  ];

  let currentIndex = 0;
  const chapterBox = document.getElementById("chapterBox");
  const navDots = document.getElementById("navDots");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  function renderChapter(index) {
    currentIndex = (index + CHAPTERS.length) % CHAPTERS.length;
    const ch = CHAPTERS[currentIndex];

    chapterBox.innerHTML = `
      <div>
        <div class="chapter-header">
          <span class="chapter-badge">${ch.badge}</span>
          <span class="chapter-number">篇章 0${currentIndex + 1} / 07 ✦</span>
        </div>

        <div class="polaroid-card">
          <div class="polaroid-top">
            <div class="polaroid-icon-box">
              ${ch.icon}
            </div>
            <div class="polaroid-title-wrap">
              <h2>${ch.name}</h2>
              <div class="polaroid-tagline">${ch.tagline}</div>
            </div>
          </div>

          <p class="polaroid-desc">${ch.desc}</p>

          <div class="polaroid-tags">
            ${ch.tags.map(t => `<span class="p-tag">#${t}</span>`).join("")}
          </div>
        </div>
      </div>

      <div class="action-box">
        <div style="font-family:var(--font-reading);font-size:12px;color:var(--ink-muted);">
          ✦ 提示：可点击房间或下方翻页
        </div>
        <button class="play-bookmark-btn" id="openChapterBtn">
          <span>翻开开玩</span>
          <svg class="play-btn-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    `;

    document.getElementById("openChapterBtn").addEventListener("click", function () {
      switchView(ch.viewId);
    });

    document.querySelectorAll(".house-room").forEach(function (r) {
      r.classList.remove("active");
    });
    const activeRoom = document.getElementById(ch.room);
    if (activeRoom) activeRoom.classList.add("active");

    // 更新移动端 7 大房间功能胶囊高亮
    document.querySelectorAll(".room-pill").forEach(function (pill) {
      const pIdx = parseInt(pill.dataset.index, 10);
      const isAct = (pIdx === currentIndex);
      pill.classList.toggle("active", isAct);
      if (isAct && pill.scrollIntoView) {
        pill.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    });

    document.querySelectorAll(".nav-dot").forEach(function (d, i) {
      d.classList.toggle("active", i === currentIndex);
    });
  }

  // 生成导航圆点
  CHAPTERS.forEach(function (_, i) {
    const dot = document.createElement("div");
    dot.className = "nav-dot" + (i === 0 ? " active" : "");
    dot.addEventListener("click", function () { renderChapter(i); });
    navDots.appendChild(dot);
  });

  if (prevBtn) prevBtn.addEventListener("click", function () { renderChapter(currentIndex - 1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { renderChapter(currentIndex + 1); });

  // 点击左侧小屋房间交互：第一次翻至简介，第二次点击同一房间进入游戏
  document.querySelectorAll(".house-room").forEach(function (room) {
    room.addEventListener("click", function (e) {
      e.stopPropagation();
      const idx = parseInt(room.dataset.index, 10);
      if (!isNaN(idx) && CHAPTERS[idx]) {
        if (currentIndex === idx) {
          switchView(CHAPTERS[idx].viewId);
        } else {
          renderChapter(idx);
          const cBtn = document.getElementById("tabBtnCard");
          if (cBtn && window.innerWidth <= 768) cBtn.click();
        }
      }
    });
  });

  // 移动端 7 大房间功能胶囊：第一次简介，第二次跳转
  document.querySelectorAll(".room-pill").forEach(function (pill) {
    pill.addEventListener("click", function () {
      const idx = parseInt(pill.dataset.index, 10);
      if (!isNaN(idx) && CHAPTERS[idx]) {
        if (currentIndex === idx) {
          switchView(CHAPTERS[idx].viewId);
        } else {
          renderChapter(idx);
          const cBtn = document.getElementById("tabBtnCard");
          if (cBtn && window.innerWidth <= 768) cBtn.click();
        }
      }
    });
  });

  // 移动端专属双视图切换药丸 (卡片展台 vs 小屋全景)
  const tabBtnCard = document.getElementById("tabBtnCard");
  const tabBtnHouse = document.getElementById("tabBtnHouse");
  const pageLeft = document.querySelector(".book-page.left");
  const pageRight = document.querySelector(".book-page.right");

  if (tabBtnCard && tabBtnHouse) {
    tabBtnCard.addEventListener("click", function () {
      tabBtnCard.classList.add("active");
      tabBtnHouse.classList.remove("active");
      if (pageLeft) pageLeft.classList.remove("mobile-active");
      if (pageRight) pageRight.classList.remove("mobile-hidden");
    });
    tabBtnHouse.addEventListener("click", function () {
      tabBtnHouse.classList.add("active");
      tabBtnCard.classList.remove("active");
      if (pageLeft) pageLeft.classList.add("mobile-active");
      if (pageRight) pageRight.classList.add("mobile-hidden");
    });
  }

  // 移动端 7 大房间触控胶囊点击即翻开对应篇章
  document.querySelectorAll(".room-pill").forEach(function (pill) {
    pill.addEventListener("click", function () {
      const idx = parseInt(pill.dataset.index, 10);
      if (!isNaN(idx)) {
        renderChapter(idx);
        if (tabBtnCard && window.innerWidth <= 768) tabBtnCard.click();
      }
    });
  });

  const liveStatusBtn = document.getElementById("liveStatusBtn");
  if (liveStatusBtn) {
    liveStatusBtn.addEventListener("click", function () {
      switchView("view-house");
    });
  }

  // ================= 灵猫自主漫步生命系统 (原版 110x165 长颈猫) =================
  // ================= 灵猫侧边悬浮伴侣系统 (可拖拽 · 侧边活动 · 不遮挡中间内容) =================
  var floatingCat = document.getElementById("floatingCat");
  var catSpriteSvg = document.getElementById("catSpriteSvg");
  var catSpriteWrapper = document.getElementById("catSpriteWrapper");
  var catThoughtBubble = document.getElementById("catThoughtBubble");
  var thoughtText = document.getElementById("thoughtText");
  var thoughtTimer = null;
  var currentPose = "sit";
  var facing = 1;

  function getCatPoseSVG(pose) {
    var commonHeadAndBow = '<circle cx="55" cy="72" r="38" fill="#FFFDF9" stroke="#CFBEB8" stroke-width="3.5"/>' +
      '<path d="M30,52 L40,18 L62,38 Z" fill="#FFFDF9" stroke="#CFBEB8" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<path d="M80,52 L70,18 L48,38 Z" fill="#FFFDF9" stroke="#CFBEB8" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<path d="M36,46 L42,27 L56,39 Z" fill="#F4DFE4"/>' +
      '<path d="M74,46 L68,27 L54,39 Z" fill="#F4DFE4"/>' +
      '<g transform="translate(55, 27)">' +
        '<path d="M-2,0 C-15,-8 -26,-3 -26,6 C-26,14 -13,10 -2,0" fill="#9B8AA5" stroke="#786882" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M2,0 C15,-8 26,-3 26,6 C26,14 13,10 2,0" fill="#9B8AA5" stroke="#786882" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<circle r="5.5" fill="#FFFDF9" stroke="#D4C4A8" stroke-width="1.8"/>' +
        '<circle cx="-1.5" cy="-1.5" r="1.5" fill="#FFF"/>' +
      '</g>' +
      '<circle cx="26" cy="88" r="7" fill="#F0CDD5" opacity="0.65"/>' +
      '<circle cx="84" cy="88" r="7" fill="#F0CDD5" opacity="0.65"/>' +
      '<g stroke="#D1C3BE" stroke-width="1.8" stroke-linecap="round" opacity="0.75">' +
        '<path d="M16,86 L4,82"/><path d="M16,92 L2,92"/><path d="M17,98 L5,102"/>' +
        '<path d="M94,86 L106,82"/><path d="M94,92 L108,92"/><path d="M93,98 L105,102"/>' +
      '</g>';

    var eyesAndMouth = '<ellipse cx="40" cy="72" rx="10.5" ry="11.5" fill="#433B4A"/>' +
      '<ellipse cx="70" cy="72" rx="10.5" ry="11.5" fill="#433B4A"/>' +
      '<circle cx="43" cy="68" r="3.6" fill="#FFFDF9"/>' +
      '<circle cx="73" cy="68" r="3.6" fill="#FFFDF9"/>' +
      '<path d="M30,65 Q33,54 26,49 M40,61 Q42,50 42,45 M49,66 Q52,56 57,51" stroke="#5E5252" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M80,65 Q77,54 84,49 M70,61 Q68,50 68,45 M61,66 Q58,56 53,51" stroke="#5E5252" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M55,84 l4,4 l-8,0 Z" fill="#E8A6B6"/>' +
      '<path d="M48,90 q7,5 14,0" stroke="#CFBEB8" stroke-width="2.5" fill="none" stroke-linecap="round"/>';

    if (pose === "happy") {
      eyesAndMouth = '<path d="M30,73 Q40,62 50,73" fill="none" stroke="#433B4A" stroke-width="3.5" stroke-linecap="round"/>' +
        '<path d="M60,73 Q70,62 80,73" fill="none" stroke="#433B4A" stroke-width="3.5" stroke-linecap="round"/>' +
        '<circle cx="26" cy="88" r="8" fill="#F0CDD5" opacity="0.85"/>' +
        '<circle cx="84" cy="88" r="8" fill="#F0CDD5" opacity="0.85"/>' +
        '<path d="M55,83 l3.5,3.5 l-7,0 Z" fill="#E8A6B6"/>' +
        '<path d="M48,87 q7,8 14,0" stroke="#CFBEB8" stroke-width="3" fill="none" stroke-linecap="round"/>';
    }

    if (pose === "walk") {
      return '<g transform="rotate(-2 55 120)">' +
        '<path d="M88,136 C108,126 116,108 110,95 C106,86 96,85 92,94" fill="none" stroke="#D1C3BE" stroke-width="6.5" stroke-linecap="round"/>' +
        '<ellipse cx="55" cy="130" rx="34" ry="28" fill="#FFFDF9" stroke="#CFBEB8" stroke-width="3.5"/>' +
        '<ellipse cx="34" cy="153" rx="9" ry="7" fill="#FFFDF9" stroke="#CFBEB8" stroke-width="3.5"/>' +
        '<ellipse cx="68" cy="151" rx="9" ry="7" fill="#FFFDF9" stroke="#CFBEB8" stroke-width="3.5"/>' +
        commonHeadAndBow + eyesAndMouth + '</g>';
    }

    return '<path d="M88,136 C108,134 114,120 110,105 C107,96 98,93 92,100" fill="none" stroke="#D1C3BE" stroke-width="6.5" stroke-linecap="round"/>' +
      '<ellipse cx="55" cy="132" rx="36" ry="28" fill="#FFFDF9" stroke="#CFBEB8" stroke-width="3.5"/>' +
      '<ellipse cx="38" cy="151" rx="9.5" ry="7" fill="#FFFDF9" stroke="#CFBEB8" stroke-width="3.5"/>' +
      '<ellipse cx="72" cy="151" rx="9.5" ry="7" fill="#FFFDF9" stroke="#CFBEB8" stroke-width="3.5"/>' +
      commonHeadAndBow + eyesAndMouth;
  }

  function setPose(pose) {
    currentPose = pose;
    if (catSpriteSvg) catSpriteSvg.innerHTML = getCatPoseSVG(pose);
  }

  function showThought(text, duration) {
    if (!catThoughtBubble) return;
    if (thoughtText) thoughtText.textContent = text;
    catThoughtBubble.classList.add("show");
    clearTimeout(thoughtTimer);
    thoughtTimer = setTimeout(function () {
      catThoughtBubble.classList.remove("show");
    }, duration || 3600);
  }

  var THOUGHTS = [
    "珠珠，你在这里我就觉得整个屋子好亮堂呀～",
    "天台晒鱼架的味道好香，吸一口精神百倍！",
    "今天的心情是粉红色的，因为有你陪伴。",
    "伸个大大的懒腰，今天也要对自己好一点。",
    "在手账本上踩了个小梅花印，盖章认证啦！",
    "无论外面吹多大的风，这里永远风平浪静。",
    "今天阳光闻起来，好像刚烤熟的小黄油饼干～",
    "摸摸我的耳朵，今天就会有一整天的好运气！",
    "呼噜呼噜……听星辰说，今天会有一份小确幸降临。"
  ];

  // 拖拽事件
  if (floatingCat) {
    var isDragging = false;
    var hasMoved = false;
    var initLeft = 0, initTop = 0, startX = 0, startY = 0;

    floatingCat.addEventListener("pointerdown", function (e) {
      isDragging = true;
      hasMoved = false;
      floatingCat.classList.add("dragging");
      floatingCat.setPointerCapture(e.pointerId);
      var rect = floatingCat.getBoundingClientRect();
      initLeft = rect.left;
      initTop = rect.top;
      startX = e.clientX;
      startY = e.clientY;
    });

    floatingCat.addEventListener("pointermove", function (e) {
      if (!isDragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasMoved = true;
      var newX = Math.max(6, Math.min(initLeft + dx, window.innerWidth - floatingCat.offsetWidth - 6));
      var newY = Math.max(6, Math.min(initTop + dy, window.innerHeight - floatingCat.offsetHeight - 6));
      floatingCat.style.left = newX + "px";
      floatingCat.style.top = newY + "px";
      floatingCat.style.right = "auto";
      floatingCat.style.bottom = "auto";
    });

    function endDrag(e) {
      if (!isDragging) return;
      isDragging = false;
      floatingCat.classList.remove("dragging");
      try { floatingCat.releasePointerCapture(e.pointerId); } catch(_) {}
      if (!hasMoved) { petCat(); }
    }

    floatingCat.addEventListener("pointerup", endDrag);
    floatingCat.addEventListener("pointercancel", endDrag);
  }

  function petCat() {
    setPose("happy");
    showThought("喵呜～最喜欢被珠珠这样温柔抚摸啦！💖", 3000);
    if (floatingCat) {
      var rect = floatingCat.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + 30;
      for (var i = 0; i < 4; i++) {
        (function() {
          var heart = document.createElement("div");
          heart.className = "heart-pop";
          heart.textContent = Math.random() < 0.6 ? "💖" : "✨";
          heart.style.left = cx + "px";
          heart.style.top = cy + "px";
          heart.style.setProperty("--dx", ((Math.random() - 0.5) * 50) + "px");
          document.body.appendChild(heart);
          setTimeout(function() { heart.remove(); }, 800);
        })();
      }
    }
    setTimeout(function() { if (currentPose === "happy") setPose("sit"); }, 2200);
  }

  function scheduleCatAction() {
    var delay = 3500 + Math.random() * 4000;
    setTimeout(function() {
      var r = Math.random();
      if (r < 0.35) {
        facing = facing === 1 ? -1 : 1;
        if (catSpriteWrapper) catSpriteWrapper.style.transform = "scaleX(" + facing + ")";
        setPose("walk");
        setTimeout(function() {
          setPose("sit");
          if (Math.random() < 0.4) showThought(THOUGHTS[Math.floor(Math.random() * THOUGHTS.length)]);
          scheduleCatAction();
        }, 1200);
      } else if (r < 0.65) {
        setPose("sit");
        showThought(THOUGHTS[Math.floor(Math.random() * THOUGHTS.length)]);
        scheduleCatAction();
      } else {
        setPose("happy");
        showThought(THOUGHTS[Math.floor(Math.random() * THOUGHTS.length)], 4500);
        setTimeout(function() {
          if (currentPose === "happy") setPose("sit");
          scheduleCatAction();
        }, 2000);
      }
    }, delay);
  }


  // ================= 游戏 1：日记小屋逻辑 =================
  const houseCardInner = document.getElementById("houseCardInner");
  const houseCardTitle = document.getElementById("houseCardTitle");
  const houseCardDesc = document.getElementById("houseCardDesc");
  const feedFishBtn = document.getElementById("feedFishBtn");
  const houseCatMood = document.getElementById("houseCatMood");

  const TAROT_CARDS = [
    { title: "太阳 · The Sun", desc: "「每一个微小的努力，都在手账里开出一朵温柔的花。」" },
    { title: "星星 · The Star", desc: "「在安静的夜空里，总有一颗星辰为你亮起希望的光芒。」" },
    { title: "月亮 · The Moon", desc: "「温柔拥抱自己的脆弱，月光会照亮幽秘心灵的每一个角落。」" },
    { title: "力量 · Strength", desc: "「真正的强大不是锋芒毕露，而是如水抚摸猫咪般的从容柔韧。」" },
    { title: "女皇 · The Empress", desc: "「生活里处处是繁茂的丰饶与爱，去感受身边的草木芳香吧。」" }
  ];

  if (houseCardInner) {
    houseCardInner.addEventListener("click", function () {
      houseCardInner.classList.toggle("flipped");
      if (houseCardInner.classList.contains("flipped")) {
        const pick = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
        houseCardTitle.textContent = pick.title;
        houseCardDesc.textContent = pick.desc;
      }
    });
  }

  if (feedFishBtn) {
    feedFishBtn.addEventListener("click", function () {
      houseCatMood.textContent = "幸福感满溢！(100% 呼噜呼噜~)";
      feedFishBtn.textContent = "✨ 灵猫心满意足";
      feedFishBtn.disabled = true;
      setTimeout(function () {
        feedFishBtn.disabled = false;
        feedFishBtn.textContent = "🐟 喂食小鱼干";
      }, 3500);
    });
  }

  document.querySelectorAll(".stamp-pill").forEach(function (pill) {
    pill.addEventListener("click", function () {
      document.querySelectorAll(".stamp-pill").forEach(function (p) { p.classList.remove("active"); });
      pill.classList.add("active");
    });
  });

  // ================= 游戏 2：喵喵点击器逻辑 =================
  let clickCount = 0;
  let comboCount = 0;
  let comboTimer = null;
  const clickCountEl = document.getElementById("clickCount");
  const comboBannerEl = document.getElementById("comboBanner");
  const clickCatStage = document.getElementById("clickCatStage");

  if (clickCatStage) {
    clickCatStage.addEventListener("click", function (e) {
      clickCount++;
      comboCount++;
      clickCountEl.textContent = clickCount;
      comboBannerEl.textContent = "连击 x" + comboCount + " ✦ 呼噜暴击！";

      clearTimeout(comboTimer);
      comboTimer = setTimeout(function () {
        comboCount = 0;
        comboBannerEl.textContent = "连击已冷却 ✦ 轻抚继续";
      }, 1500);

      // 飘字金币
      const coin = document.createElement("div");
      coin.className = "flying-coin";
      coin.textContent = "+1 🐾";
      coin.style.left = e.clientX + "px";
      coin.style.top = e.clientY + "px";
      coin.style.setProperty("--dx", ((Math.random() - 0.5) * 40) + "px");
      document.body.appendChild(coin);
      setTimeout(function () { coin.remove(); }, 750);
    });
  }

  // ================= 游戏 3：猜心小茶几逻辑 =================
  let targetNumber = Math.floor(Math.random() * 100) + 1;
  let currentGuessStr = "";
  const guessTipEl = document.getElementById("guessTip");
  const guessInputValEl = document.getElementById("guessInputVal");
  const guessHistoryEl = document.getElementById("guessHistory");

  document.querySelectorAll(".keypad-btn[data-num]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (currentGuessStr.length < 3) {
        currentGuessStr += btn.dataset.num;
        guessInputValEl.textContent = currentGuessStr;
      }
    });
  });

  const keypadClear = document.getElementById("keypadClear");
  if (keypadClear) {
    keypadClear.addEventListener("click", function () {
      currentGuessStr = "";
      guessInputValEl.textContent = "--";
    });
  }

  const keypadSubmit = document.getElementById("keypadSubmit");
  if (keypadSubmit) {
    keypadSubmit.addEventListener("click", function () {
      const val = parseInt(currentGuessStr, 10);
      if (isNaN(val)) return;

      const tag = document.createElement("div");
      tag.className = "history-tag";

      if (val === targetNumber) {
        tag.textContent = val + " ✓ 猜中啦！灵犀相通！";
        tag.style.background = "var(--green-pale)";
        tag.style.color = "var(--green-deep)";
        guessTipEl.textContent = "🎉 哇！完全猜中啦！小猫打了个滚～";
        targetNumber = Math.floor(Math.random() * 100) + 1;
      } else if (val < targetNumber) {
        tag.textContent = val + " ↑ 猜小啦";
        guessTipEl.textContent = "小猫摇摇头：太小啦，数字还要更大些哦！";
      } else {
        tag.textContent = val + " ↓ 猜大啦";
        guessTipEl.textContent = "小猫眨眨眼：猜太大啦，数字更小一点～";
      }

      guessHistoryEl.appendChild(tag);
      currentGuessStr = "";
      guessInputValEl.textContent = "--";
    });
  }

  // ================= 游戏 4：猫猫钓鱼逻辑 =================
  let fishingScore = 0;
  let fishingTime = 45;
  let fishingTimerId = null;
  let isFishingPaused = false;
  let fishList = [];
  const pondCanvas = document.getElementById("pondCanvas");
  const fishScoreEl = document.getElementById("fishScore");
  const fishTimerEl = document.getElementById("fishTimer");
  const fishPauseBtn = document.getElementById("fishPauseBtn");
  const fishPauseOverlay = document.getElementById("fishPauseOverlay");
  const fishResumeBtn = document.getElementById("fishResumeBtn");

  function startFishingGame() {
    fishingScore = 0;
    fishingTime = 45;
    isFishingPaused = false;
    fishScoreEl.textContent = fishingScore;
    fishTimerEl.textContent = fishingTime;
    fishList = [
      { x: 50, y: 100, vx: 1.8, vy: 0.5, color: "#E08A2E", size: 14 },
      { x: 120, y: 180, vx: -1.4, vy: -0.4, color: "#3D9EC6", size: 16 },
      { x: 200, y: 260, vx: 1.2, vy: 0.3, color: "#D97706", size: 12 }
    ];

    clearInterval(fishingTimerId);
    fishingTimerId = setInterval(function () {
      if (!isFishingPaused && currentActiveView === "view-fishing") {
        fishingTime--;
        fishTimerEl.textContent = fishingTime;
        if (fishingTime <= 0) {
          clearInterval(fishingTimerId);
          alert("时间到！本次垂钓收获了 " + fishingScore + " 条美味小鱼！");
          switchView("view-lobby");
        }
      }
    }, 1000);
  }

  if (fishPauseBtn) {
    fishPauseBtn.addEventListener("click", function () {
      isFishingPaused = true;
      fishPauseOverlay.classList.add("active");
    });
  }
  if (fishResumeBtn) {
    fishResumeBtn.addEventListener("click", function () {
      isFishingPaused = false;
      fishPauseOverlay.classList.remove("active");
    });
  }

  if (pondCanvas) {
    const pCtx = pondCanvas.getContext("2d");
    function resizePond() {
      pondCanvas.width = pondCanvas.parentElement.clientWidth;
      pondCanvas.height = 360;
    }
    window.addEventListener("resize", resizePond);
    resizePond();

    pondCanvas.addEventListener("pointerdown", function (e) {
      if (isFishingPaused) return;
      const rect = pondCanvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      for (let i = 0; i < fishList.length; i++) {
        const f = fishList[i];
        const dist = Math.hypot(f.x - mx, f.y - my);
        if (dist < 28) {
          fishingScore += 10;
          fishScoreEl.textContent = fishingScore;
          f.x = f.vx > 0 ? -20 : pondCanvas.width + 20;
          f.y = 60 + Math.random() * (pondCanvas.height - 120);
          break;
        }
      }
    });

    function drawPond() {
      if (currentActiveView === "view-fishing") {
        pCtx.clearRect(0, 0, pondCanvas.width, pondCanvas.height);

        // 绘制游鱼
        fishList.forEach(function (f) {
          if (!isFishingPaused) {
            f.x += f.vx;
            f.y += f.vy;
            if (f.x > pondCanvas.width + 30) f.x = -30;
            if (f.x < -30) f.x = pondCanvas.width + 30;
            if (f.y < 40 || f.y > pondCanvas.height - 40) f.vy *= -1;
          }

          pCtx.save();
          pCtx.translate(f.x, f.y);
          if (f.vx < 0) pCtx.scale(-1, 1);
          pCtx.fillStyle = f.color;
          pCtx.beginPath();
          pCtx.ellipse(0, 0, f.size, f.size * 0.55, 0, 0, Math.PI * 2);
          pCtx.fill();
          // 鱼尾
          pCtx.beginPath();
          pCtx.moveTo(-f.size * 0.8, 0);
          pCtx.lineTo(-f.size * 1.5, -f.size * 0.5);
          pCtx.lineTo(-f.size * 1.5, f.size * 0.5);
          pCtx.closePath();
          pCtx.fill();
          pCtx.restore();
        });
      }
      requestAnimationFrame(drawPond);
    }
    drawPond();
  }

  // ================= 游戏 5：猫猫接鱼干逻辑 =================
  let catchScore = 0;
  let catchLives = 3;
  let isCatchPaused = false;
  let drops = [];
  let basketX = 150;
  const roofCanvas = document.getElementById("roofCanvas");
  const catchScoreEl = document.getElementById("catchScore");
  const catchLivesEl = document.getElementById("catchLives");
  const catchPauseBtn = document.getElementById("catchPauseBtn");
  const catchPauseOverlay = document.getElementById("catchPauseOverlay");
  const catchResumeBtn = document.getElementById("catchResumeBtn");

  function startCatchGame() {
    catchScore = 0;
    catchLives = 3;
    isCatchPaused = false;
    catchScoreEl.textContent = catchScore;
    catchLivesEl.textContent = catchLives;
    drops = [];
  }

  if (catchPauseBtn) {
    catchPauseBtn.addEventListener("click", function () {
      isCatchPaused = true;
      catchPauseOverlay.classList.add("active");
    });
  }
  if (catchResumeBtn) {
    catchResumeBtn.addEventListener("click", function () {
      isCatchPaused = false;
      catchPauseOverlay.classList.remove("active");
    });
  }

  if (roofCanvas) {
    const rCtx = roofCanvas.getContext("2d");
    function resizeRoof() {
      roofCanvas.width = roofCanvas.parentElement.clientWidth;
      roofCanvas.height = 360;
    }
    window.addEventListener("resize", resizeRoof);
    resizeRoof();

    roofCanvas.addEventListener("pointermove", function (e) {
      if (isCatchPaused) return;
      const rect = roofCanvas.getBoundingClientRect();
      basketX = e.clientX - rect.left;
    });

    let dropSpawnTimer = 0;
    function drawRoof() {
      if (currentActiveView === "view-catch") {
        rCtx.clearRect(0, 0, roofCanvas.width, roofCanvas.height);

        if (!isCatchPaused) {
          dropSpawnTimer++;
          if (dropSpawnTimer > 45) {
            dropSpawnTimer = 0;
            drops.push({
              x: 20 + Math.random() * (roofCanvas.width - 40),
              y: -10,
              speed: 2 + Math.random() * 2,
              isBomb: Math.random() < 0.25
            });
          }

          // 掉落物下落与碰撞检测
          for (let i = drops.length - 1; i >= 0; i--) {
            const d = drops[i];
            d.y += d.speed;

            if (d.y > roofCanvas.height - 50 && d.y < roofCanvas.height - 20) {
              if (Math.abs(d.x - basketX) < 35) {
                if (d.isBomb) {
                  catchLives--;
                  catchLivesEl.textContent = catchLives;
                  if (catchLives <= 0) {
                    alert("游戏结束！踩到小炸弹啦，总接鱼分：" + catchScore);
                    switchView("view-lobby");
                  }
                } else {
                  catchScore += 10;
                  catchScoreEl.textContent = catchScore;
                }
                drops.splice(i, 1);
                continue;
              }
            }

            if (d.y > roofCanvas.height) {
              drops.splice(i, 1);
            }
          }
        }

        // 绘制掉落物
        drops.forEach(function (d) {
          rCtx.font = "20px sans-serif";
          rCtx.fillText(d.isBomb ? "💣" : "🐟", d.x - 10, d.y);
        });

        // 绘制小猫接盘
        rCtx.fillStyle = "#A3B899";
        rCtx.beginPath();
        rCtx.ellipse(basketX, roofCanvas.height - 30, 36, 12, 0, 0, Math.PI * 2);
        rCtx.fill();
        rCtx.font = "12px sans-serif";
        rCtx.fillStyle = "#FFF";
        rCtx.textAlign = "center";
        rCtx.fillText("🐾", basketX, roofCanvas.height - 26);
      }
      requestAnimationFrame(drawRoof);
    }
    drawRoof();
  }

  // ================= 游戏 6：占星阁画廊 =================
  const tarotGalleryGrid = document.getElementById("tarotGalleryGrid");
  const shuffleTarotBtn = document.getElementById("shuffleTarotBtn");

  const ALL_TAROT_22 = [
    { num: "0", name: "愚者 · The Fool", kw: "纯真起点" },
    { num: "I", name: "魔术师 · The Magician", kw: "潜能创造" },
    { num: "II", name: "女祭司 · High Priestess", kw: "直觉洞察" },
    { num: "III", name: "女皇 · The Empress", kw: "丰饶丰盛" },
    { num: "IV", name: "皇帝 · The Emperor", kw: "秩序稳固" },
    { num: "V", name: "教皇 · The Hierophant", kw: "信仰指引" },
    { num: "VI", name: "恋人 · The Lovers", kw: "美好共鸣" },
    { num: "VII", name: "战车 · The Chariot", kw: "坚定向前" },
    { num: "VIII", name: "力量 · Strength", kw: "以柔克刚" },
    { num: "IX", name: "隐士 · The Hermit", kw: "向内探寻" },
    { num: "X", name: "命运之轮 · Fortune", kw: "转机降临" },
    { num: "XI", name: "正义 · Justice", kw: "明心见性" },
    { num: "XII", name: "倒吊人 · Hanged Man", kw: "换位顿悟" },
    { num: "XIII", name: "死神 · Death", kw: "蜕变重生" },
    { num: "XIV", name: "节制 · Temperance", kw: "平衡和谐" },
    { num: "XV", name: "恶魔 · The Devil", kw: "破除执念" },
    { num: "XVI", name: "高塔 · The Tower", kw: "惊雷洗礼" },
    { num: "XVII", name: "星星 · The Star", kw: "希望永驻" },
    { num: "XVIII", name: "月亮 · The Moon", kw: "潜意识光" },
    { num: "XIX", name: "太阳 · The Sun", kw: "万物明朗" },
    { num: "XX", name: "审判 · Judgement", kw: "唤醒新生" },
    { num: "XXI", name: "世界 · The World", kw: "圆满绽放" }
  ];

  if (tarotGalleryGrid) {
    ALL_TAROT_22.forEach(function (card) {
      const item = document.createElement("div");
      item.className = "tarot-card-item";
      item.innerHTML = `
        <div style="font-size:22px;margin-bottom:4px;">✦</div>
        <div style="font-family:var(--font-serif);font-size:14px;font-weight:700;color:var(--pink-deep);">${card.name}</div>
        <div style="font-family:var(--font-reading);font-size:11px;color:var(--green-deep);margin-top:2px;">「${card.kw}」</div>
      `;
      item.addEventListener("click", function () {
        alert(card.name + "：今日与你有特殊的星宿感应！");
      });
      tarotGalleryGrid.appendChild(item);
    });
  }

  if (shuffleTarotBtn) {
    shuffleTarotBtn.addEventListener("click", function () {
      const picked = ALL_TAROT_22[Math.floor(Math.random() * ALL_TAROT_22.length)];
      alert("星辰为你揭晓今日指引：\n\n【" + picked.name + "】\n核心词： " + picked.kw + "\n愿灵猫守护你今天所有的温柔与好运！🐾");
    });
  }

  // ================= 游戏 7：涂鸦灵签 =================
  const doodleCardInner = document.getElementById("doodleCardInner");
  const doodleSignTitle = document.getElementById("doodleSignTitle");
  const doodleSignText = document.getElementById("doodleSignText");

  const DOODLE_SIGNS = [
    { title: "大吉 · 幸福洋溢", text: "「今天你所期待的好消息，正乘着微风奔向你。」" },
    { title: "上上签 · 心想事成", text: "「手账本上的小小心愿，不知不觉就全部实现啦～」" },
    { title: "中吉 · 悠然自得", text: "「给自己泡一杯热茶，慢下来的时光最珍贵。」" },
    { title: "元气签 · 活力满满", text: "「像猫咪伸大懒腰一样，精神饱满地开启今天吧！」" }
  ];

  if (doodleCardInner) {
    doodleCardInner.addEventListener("click", function () {
      doodleCardInner.classList.toggle("flipped");
      if (doodleCardInner.classList.contains("flipped")) {
        const sign = DOODLE_SIGNS[Math.floor(Math.random() * DOODLE_SIGNS.length)];
        doodleSignTitle.textContent = sign.title;
        doodleSignText.textContent = sign.text;
      }
    });
  }

  // ================= 初始化启动 =================
  renderChapter(0);
  setPose("sit");
  showThought("珠珠，你在这里我就很安心～", 4000);
  scheduleCatAction();

})();
