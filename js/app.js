/* ============================================================
 * app.js — 全部页面逻辑
 *
 * 修复清单（对应代码审查报告）：
 *   #2  document.write → 动态 script 元素加载
 *   #4  隐藏视图 hero 演示空转 → render 切走时 stop()
 *   #5  缩放闪烁 → 删除内联脚本，单一缩放源
 *   #6  ECharts 无 try-catch → init/setOption 包裹
 *   #9  show() 重复 → createDemoPlayer 工厂统一
 *   #10 io 命名碰撞 → 重命名为 scrollIO
 * ============================================================ */

(function () {
  'use strict';

  /* ---- Fix #2: ECharts fallback（替代 document.write） ---- */
  function ensureEcharts() {
    if (typeof echarts !== 'undefined') return;
    var s = document.createElement('script');
    s.src = 'https://rrc.58cdn.com.cn/xinghuo_apply/echarts.6.0.0.min.js';
    s.async = false;
    document.head.appendChild(s);
  }

  /* ---- Reveal IntersectionObserver（全局，供路由切换后重新挂载） ---- */
  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { revealIO.observe(el); });

  /* ============================================================
   * Demo Player 工厂（Fix #9: 统一 hero + interactive 演示）
   * Fix #6: ECharts init/setOption 包裹 try-catch
   * ============================================================ */
  function createDemoPlayer(opts) {
    var container = opts.container;
    var navEl = opts.navEl;
    var autoLoop = opts.autoLoop || false;
    var hold = opts.hold || 1500;
    var renderNav = opts.renderNav || false;

    var timer = null, stepTimer = null, flow = null, idx = 0;
    var chartInsts = [];
    var pending = [];

    function initCharts(root) {
      chartInsts.forEach(function (c) { try { c.dispose(); } catch (e) { } });
      chartInsts = [];
      pending = [];
      if (typeof echarts === 'undefined') return;
      root.querySelectorAll('[data-chart]').forEach(function (el) {
        var opt = CHART_OPTS[el.dataset.chart];
        if (opt) pending.push(el);
      });
    }

    function startCharts(scope) {
      pending = pending.filter(function (el) {
        var opt = CHART_OPTS[el.dataset.chart];
        if (!opt) return false;
        if (scope && !scope.contains(el)) return true;
        try {
          var c = echarts.init(el);
          c.setOption(opt());
          chartInsts.push(c);
          return false;
        } catch (e) { return true; }
      });
    }

    function resizeCharts() {
      chartInsts.forEach(function (c) { try { c.resize(); } catch (e) { } });
    }

    function scrollBottom() { container.scrollTop = container.scrollHeight; }

    var LINE_MIN = 85, LINE_MAX = 150, MSG_GAP = 290;
    function ri(a, b) { return a + Math.random() * (b - a); }

    function show(k, cfg) {
      cfg = cfg || {};
      var animate = cfg.animate !== false;
      var manual = cfg.manual || false;

      clearTimeout(timer);
      clearTimeout(stepTimer);

      if (!flow) {
        flow = document.createElement('div');
        flow.className = 'flow';
        container.appendChild(flow);
      }
      flow.innerHTML = DEMO[k] || '';
      initCharts(flow);
      srcs.forEach(function (b) { b.classList.toggle('active', b.dataset.k === k); });

      var items = [].slice.call(flow.querySelectorAll('.msg'));
      items.forEach(function (m) { m.style.display = 'none'; });

      function revealRows(bub, done) {
        var rows = [].slice.call(bub.children);
        var li = 0;
        function next() {
          if (li >= rows.length) { done(); return; }
          var el = rows[li++];
          el.style.opacity = '1';
          el.style.transform = 'none';
          startCharts(el);
          scrollBottom();
          stepTimer = setTimeout(next, ri(LINE_MIN, LINE_MAX));
        }
        stepTimer = setTimeout(next, 90);
      }

      var i = 0;
      function step() {
        if (i >= items.length) {
          if (autoLoop && !manual) {
            timer = setTimeout(function () {
              idx = (idx + 1) % ORDER.length;
              show(ORDER[idx], { animate: true, manual: false });
            }, hold);
          }
          return;
        }
        var m = items[i++];
        var isAI = m.classList.contains('ai');
        m.style.display = '';
        if (isAI) {
          var bub = m.querySelector('.bub');
          [].slice.call(bub.children).forEach(function (el) {
            el.style.transition = 'opacity .3s ease, transform .3s ease';
            el.style.opacity = '0';
          });
        }
        if (!isAI) m.style.animation = 'msgUp .4s ease';
        scrollBottom();
        if (isAI) {
          revealRows(m.querySelector('.bub'), function () {
            stepTimer = setTimeout(step, 180);
          });
        } else {
          stepTimer = setTimeout(step, MSG_GAP);
        }
      }

      if (animate) {
        stepTimer = setTimeout(step, 260);
      } else {
        items.forEach(function (m) { m.style.display = ''; });
        flow.querySelectorAll('.bub').forEach(function (b) {
          [].slice.call(b.children).forEach(function (el) {
            el.style.opacity = '1';
            el.style.transform = 'none';
          });
        });
        startCharts(flow);
        scrollBottom();
      }
    }

    function stop() {
      clearTimeout(timer);
      clearTimeout(stepTimer);
    }

    if (renderNav) {
      navEl.innerHTML = ORDER.map(function (k) {
        return '<button class="src" data-k="' + k + '">' +
          '<span class="s-t">' + LABELS[k] + '</span>' +
          '<span class="s-d">' + DESC[k] + '</span></button>';
      }).join('') +
        '<button class="src disabled" disabled><span class="s-t">等待探索</span><span class="s-d">更多场景·待您解锁</span></button>';
    }
    var srcs = [].slice.call(navEl.querySelectorAll('.src'));

    navEl.addEventListener('click', function (e) {
      var b = e.target.closest('.src');
      if (!b || b.classList.contains('disabled')) return;
      idx = ORDER.indexOf(b.dataset.k);
      show(b.dataset.k, { animate: true, manual: true });
    });

    return { show: show, stop: stop, resizeCharts: resizeCharts };
  }

  /* ============================================================
   * Beike-style 安装器
   * ============================================================ */
  (function () {
    var ALL = 'curl -fsSL https://raw.githubusercontent.com/58hbg/wenshu-hbg/main/skills/install.sh | bash';
    var bskTabs = [].slice.call(document.querySelectorAll('.bsk-tab'));
    var title = document.getElementById('bskTitle');
    var sub = document.getElementById('bskSub');
    var cmd = document.getElementById('bskCmd');
    var copyBtn = document.getElementById('bskCopy');
    var feat = document.getElementById('bskFeat');
    var optsBox = document.getElementById('bskOpts');
    var next = document.getElementById('bskNext');
    var mode = 'pkg';

    function buildOpts() {
      optsBox.innerHTML = INSTALL_SKILLS.map(function (s) {
        return '<label class="bsk-opt"><input type="checkbox" data-s="' + s[0] + '" checked><span class="nm">' + s[1] + '</span><code>' + s[2] + '</code></label>';
      }).join('');
      [].slice.call(optsBox.querySelectorAll('input')).forEach(function (b) { b.addEventListener('change', updCmd); });
    }
    function buildFeat() {
      feat.innerHTML =
        '<span><span class="tick">✓</span> 自动识别 Agent Skills 目录</span>' +
        '<span><span class="tick">✓</span> 校验发布包完整性</span>' +
        '<span><span class="tick">✓</span> 自动更新到最新版</span>' +
        '<span class="rt">校验方式：<b>SHA-256</b></span>';
    }
    function updCmd() {
      var sel = [].slice.call(optsBox.querySelectorAll('input:checked')).map(function (b) { return b.dataset.s; }).join(' ');
      cmd.textContent = (mode === 'pkg') ? ALL : (ALL + ' -s -- ' + (sel || '<请至少选择一个>'));
    }
    function setMode(m) {
      mode = m;
      bskTabs.forEach(function (t) { t.classList.toggle('active', t.dataset.m === m); });
      if (mode === 'pkg') {
        title.textContent = '一个整合技能，装完全部能力';
        sub.textContent = '将 6 个数据入口封装为单一的 HBG DataHub 整合技能，默认安装命令一键完成，无需关心内部结构。';
        feat.style.display = ''; optsBox.style.display = 'none';
      } else {
        title.textContent = '独立安装 Skills';
        sub.textContent = '默认勾选全部 6 个数据能力；取消勾选即按需安装，命令会自动拼接所选 Skills 的 ID。';
        feat.style.display = 'none'; optsBox.style.display = '';
      }
      updCmd();
      copyBtn.textContent = '⧉ 复制'; copyBtn.classList.remove('copied');
    }

    buildFeat(); buildOpts();
    bskTabs.forEach(function (t) { t.addEventListener('click', function () { setMode(t.dataset.m); }); });
    copyBtn.addEventListener('click', function () {
      copyText(cmd.textContent).then(function () {
        copyBtn.textContent = '已复制 ✓'; copyBtn.classList.add('copied');
        setTimeout(function () { copyBtn.textContent = '⧉ 复制'; copyBtn.classList.remove('copied'); }, 2000);
      }).catch(function () {
        copyBtn.textContent = '复制失败'; copyBtn.classList.add('copied');
        setTimeout(function () { copyBtn.textContent = '⧉ 复制'; copyBtn.classList.remove('copied'); }, 2000);
      });
    });
    if (next) {
      next.addEventListener('click', function () {
        var c = document.getElementById('catalog'); if (c) c.scrollIntoView({ behavior: 'smooth' });
      });
    }
    setMode('pkg');
  })();

  function copyText(txt) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(txt);
    var ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { }
    document.body.removeChild(ta);
    return ok ? Promise.resolve() : Promise.reject(new Error('copy failed'));
  }

  /* ============================================================
   * 路由 + FAQ 导航 + Skill 弹窗 + Demo 初始化
   * ============================================================ */
  var navTabs = [].slice.call(document.querySelectorAll('.tab'));
  var VIEWS = {
    home: document.getElementById('view-home'),
    skills: document.getElementById('view-skills'),
    faq: document.getElementById('view-faq'),
    changelog: document.getElementById('view-changelog')
  };
  var ROUTES = ['home', 'skills', 'faq', 'changelog'];
  var heroDemo = null;

  function fromHash() {
    var h = (location.hash || '').replace(/^#\/?/, '');
    return ROUTES.indexOf(h) !== -1 ? h : 'home';
  }

  var firstRender = true;
  function render(tab) {
    Object.keys(VIEWS).forEach(function (k) { VIEWS[k].style.display = (k === tab) ? '' : 'none'; });
    navTabs.forEach(function (t) { t.classList.toggle('active', t.dataset.tab === tab); });
    /* 隐藏容器里的 .reveal 不会被 IntersectionObserver 触发，切换后需重新挂载 */
    var cur = VIEWS[tab];
    if (cur) cur.querySelectorAll('.reveal:not(.visible)').forEach(function (el) { revealIO.observe(el); });

    /* Fix #4: 切走 home 时停止演示定时器，避免隐藏视图空转 */
    if (tab !== 'home') {
      if (heroDemo) heroDemo.stop();
      if (iDemo) iDemo.stop();
    } else if (!firstRender && heroDemo) {
      /* 切回 home 时重启 hero 演示（stop 已清掉递归 setTimeout 链，不重启会停在最后一帧） */
      heroDemo.show('ask', { animate: true, manual: false });
    }
    firstRender = false;
  }

  function go(tab) {
    if (tab === fromHash()) { render(tab); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    else location.hash = '/' + tab;
  }
  navTabs.forEach(function (t) { t.addEventListener('click', function () { go(t.dataset.tab); }); });
  document.querySelectorAll('[data-goto]').forEach(function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); go(b.dataset.goto); });
  });
  window.addEventListener('hashchange', function () {
    render(fromHash());
    var h = (location.hash || '').replace(/^#\/?/, '');
    var anchor = (h && ROUTES.indexOf(h) === -1) ? document.getElementById(h) : null;
    if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* FAQ 快速定位目录：由各问题标题生成可点击标签 */
  (function () {
    var nav = document.getElementById('faqNav');
    if (!nav) return;
    document.querySelectorAll('.fq').forEach(function (fq) {
      var text = (fq.querySelector('summary').firstChild.nodeValue || '').trim();
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = text;
      b.title = text;
      b.addEventListener('click', function () {
        if (!fq.open) fq.open = true;
        setTimeout(function () { fq.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50);
      });
      nav.appendChild(b);
    });
  })();

  /* Skill 弹窗 */
  var ov = document.getElementById('ov');
  var dv = document.getElementById('dv');
  function openSkill(key) {
    var s = SKILLS[key]; if (!s) return;
    dv.innerHTML =
      '<button class="dv-x" aria-label="关闭">✕</button>' +
      '<div class="dv-eyebrow">SKILL · ' + s.en + '</div>' +
      '<h3>' + s.name + ' <span class="s-code" style="font-family:var(--mono);font-size:12px;color:var(--faint);background:var(--alt);border:1px solid var(--line);padding:1px 6px;border-radius:5px">' + s.code + '</span><span class="st ' + s.st + '">' + s.stt + '</span></h3>' +
      '<div class="dd">' + s.desc + '</div>' +
      '<div class="dv-h">核心能力</div><ul>' + s.uses.map(function (u) { return '<li>' + u + '</li>'; }).join('') + '</ul>' +
      '<div class="dv-h">示例问题</div><div class="ask">' + s.ex + '</div>' +
      '<div class="mcmd"><div class="mcmd-h"><span class="lang">bash</span><button class="copy" data-copy>⧉ 复制</button></div><div class="cmd">' + s.cmd + '</div></div>';
    ov.classList.add('open');
    ov.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeSkill() {
    ov.classList.remove('open');
    ov.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  if (ov) {
    ov.addEventListener('click', function (e) { if (e.target === ov) closeSkill(); });
    dv.addEventListener('click', function (e) {
      if (e.target.closest('.dv-x')) return closeSkill();
      var c = e.target.closest('[data-copy]');
      if (c && !c.classList.contains('copied')) {
        var txt = c.closest('.mcmd').querySelector('.cmd').textContent;
        copyText(txt).then(function () {
          c.textContent = '已复制 ✓'; c.classList.add('copied');
          setTimeout(function () { c.textContent = '⧉ 复制'; c.classList.remove('copied'); }, 2000);
        }).catch(function () {
          c.textContent = '复制失败'; c.classList.add('copied');
          setTimeout(function () { c.textContent = '⧉ 复制'; c.classList.remove('copied'); }, 2000);
        });
      }
    });
  }
  /* Fix #5: 从首页克隆技能卡片到 Skills 视图，避免重复 HTML */
  /* 同时用 SKILLS 对象的 desc 统一注入卡片描述，消除两处维护 */
  var homeCards = document.querySelectorAll('#view-home .map-grid .mcard');
  var catalogGrid = document.getElementById('catalogGrid');
  if (catalogGrid && homeCards.length) {
    homeCards.forEach(function (card) {
      catalogGrid.appendChild(card.cloneNode(true));
    });
  }
  /* 统一注入卡片描述 */
  document.querySelectorAll('[data-skill]').forEach(function (c) {
    var s = SKILLS[c.dataset.skill];
    if (s) {
      var desc = c.querySelector('.mc-desc');
      if (desc) desc.textContent = s.desc;
    }
    c.addEventListener('click', function () { openSkill(c.dataset.skill); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ov.classList.contains('open')) closeSkill(); });

  /* ---- Hero 演示（自动轮播） ---- */
  heroDemo = createDemoPlayer({
    container: document.getElementById('tA'),
    navEl: document.getElementById('sw'),
    autoLoop: true,
    hold: 1500
  });
  heroDemo.show('ask', { animate: true, manual: false });

  /* ---- Interactive 演示（无轮播，滚动触发播放） ---- */
  var iDemo = createDemoPlayer({
    container: document.getElementById('idemoBody'),
    navEl: document.getElementById('idemoNav'),
    autoLoop: false,
    renderNav: true
  });
  iDemo.show('ask', { animate: false });

  /* Fix #10: 统一一个 resize 监听器调用两个 demo 的 resizeCharts */
  window.addEventListener('resize', function () { if (heroDemo) heroDemo.resizeCharts(); if (iDemo) iDemo.resizeCharts(); });

  /* Fix #10: 重命名 io → scrollIO 避免与全局 revealIO 混淆 */
  var iDemoTerm = document.querySelector('#interact .term');
  if (iDemoTerm && 'IntersectionObserver' in window) {
    var scrollIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          iDemo.show('ask', { animate: true, manual: true });
        } else {
          iDemo.stop();
        }
      });
    }, { threshold: 0.3 });
    scrollIO.observe(iDemoTerm);
  }

  /* ---- 首次路由 ---- */
  render(fromHash());

  /* ============================================================
   * Fix #5: 缩放逻辑（单一源，删除原内联脚本避免闪烁）
   * ============================================================ */
  var root = document.getElementById('top');
  var BASE = 1600;
  var zoomTimer;
  var sideDir = document.getElementById('sideDir');
  var toTopBtn = document.getElementById('toTop');
  var sideDirSkills = document.getElementById('sideDirSkills');
  var toTopBtnSkills = document.getElementById('toTopSkills');
  var toTopBtnChangelog = document.getElementById('toTopChangelog');
  function fit() {
    var w = window.innerWidth;
    var z = 1;
    if (w < BASE) {
      root.style.width = BASE + 'px';
      root.style.zoom = w / BASE;
      z = w / BASE;
    } else {
      root.style.width = '';
      root.style.zoom = '';
    }
    /* 用 rAF 等浏览器重排后，读取 section 内容区实际留白来定位 */
    requestAnimationFrame(function () {
      /* 选第一个可见的 .wrap，跳过 display:none 的 view 内的元素 */
      var wraps = document.querySelectorAll('section:not(.hero) .wrap');
      var wrap = null;
      for (var i = 0; i < wraps.length; i++) {
        if (wraps[i].getBoundingClientRect().width > 0) { wrap = wraps[i]; break; }
      }
      if (!wrap) return;
      /* 重读当前 zoom，避免多次 fit 调用的闭包 z 过时 */
      var cz = parseFloat(root.style.zoom) || z;
      var wr = wrap.getBoundingClientRect();
      var leftGap = wr.left;
      var rightGap = window.innerWidth - wr.right;
      if (sideDir) {
        sideDir.style.left = ((leftGap - 90 * cz) / 2 / cz) + 'px';
      }
      if (toTopBtn) {
        toTopBtn.style.right = ((rightGap - 46 * cz) / 2 / cz) + 'px';
      }
      if (sideDirSkills) {
        sideDirSkills.style.left = ((leftGap - 90 * cz) / 2 / cz) + 'px';
      }
      if (toTopBtnSkills) {
        toTopBtnSkills.style.right = ((rightGap - 46 * cz) / 2 / cz) + 'px';
      }
      if (toTopBtnChangelog) {
        toTopBtnChangelog.style.right = ((rightGap - 46 * cz) / 2 / cz) + 'px';
      }
    });
  }
  window.addEventListener('resize', function () {
    clearTimeout(zoomTimer);
    zoomTimer = setTimeout(fit, 80);
  });
  fit();
  setTimeout(fit, 200); /* 确保字体/布局完全就绪后再算一次 */

  /* ---- ECharts fallback（最后执行，不阻塞主逻辑） ---- */
  ensureEcharts();

  /* ---- 快速安装命令复制 ---- */
  var qC = document.getElementById('qCopy');
  var qCmd = document.getElementById('qCmd');
  if (qC && qCmd) {
    qC.addEventListener('click', function () {
      var txt = qCmd.textContent;
      var done = function () {
        qC.textContent = '已复制 ✓'; qC.classList.add('copied');
        setTimeout(function () { qC.textContent = '⧉ 复制'; qC.classList.remove('copied'); }, 2000);
      };
      var fail = function () {
        qC.textContent = '复制失败'; qC.classList.add('copied');
        setTimeout(function () { qC.textContent = '⧉ 复制'; qC.classList.remove('copied'); }, 2000);
      };
      copyText(txt).then(done).catch(fail);
    });
  }

  /* ============================================================
   * 悬浮目录（首页）+ 返回顶部按钮
   * 出现时机：滚过 Hero 后 + 页脚露出前 + 宽屏 + 首页视图
   * ============================================================ */
  (function () {
    var dirNav = document.getElementById('sideDir');
    var toTop = document.getElementById('toTop');
    if (!dirNav || !toTop) return;

    /* Skills 视图目录项 */
    var skillsDirNav = document.getElementById('sideDirSkills');
    var skillsToTop = document.getElementById('toTopSkills');

    var hero = document.querySelector('.hero');
    var footer = document.querySelector('footer');
    var home = document.getElementById('view-home');
    var skillsView = document.getElementById('view-skills');
    var nav = document.querySelector('header.nav');

    var dirItems = [].slice.call(dirNav.querySelectorAll('li[data-goto-sec]')).map(function (li) {
      return { li: li, el: document.getElementById(li.dataset.gotoSec) };
    }).filter(function (x) { return x.el; });

    /* Skills 视图的 section（install + catalog） */
    var skillsItems = [];
    if (skillsDirNav) {
      var sLabels = { install: '一键安装', catalog: '技能目录' };
      var sHead = document.createElement('div');
      sHead.className = 'dir-head';
      sHead.innerHTML = '<span class="dir-dot"></span>目录';
      skillsDirNav.appendChild(sHead);
      var sUl = document.createElement('ul');
      sUl.className = 'dir-list';
      Object.keys(sLabels).forEach(function (sec) {
        var el = document.getElementById(sec);
        if (!el) return;
        var li = document.createElement('li');
        li.dataset.gotoSec = sec;
        li.innerHTML = '<button type="button">' + sLabels[sec] + '<i class="dir-bar"></i></button>';
        sUl.appendChild(li);
        skillsItems.push({ li: li, el: el });
      });
      skillsDirNav.appendChild(sUl);
    }
    /* Skills 返回顶部克隆 SVG */
    if (skillsToTop) skillsToTop.innerHTML = toTop.innerHTML;
    /* Changelog 返回顶部克隆 SVG */
    if (toTopBtnChangelog) toTopBtnChangelog.innerHTML = toTop.innerHTML;

    /* 宽屏检测：zoom 缩放时内容居中、两侧有留白，目录也跟随 zoom 缩小，空间足够 */
    function wide() {
      /* zoom 激活说明窄屏等比缩放，目录也缩小，留白足够 */
      if (root.style.zoom) return true;
      /* viewport=1600 的移动端，innerWidth 会是 1600，直接返回 true */
      if (window.innerWidth >= 1520) return true;
      /* pinch-zoom 缩小到 0.5 以下才隐藏 */
      var vv = window.visualViewport;
      if (vv && (vv.scale || 1) < 0.5) return false;
      return false;
    }

    function navH() { return nav ? nav.getBoundingClientRect().bottom : 0; }

    var raf = 0, cur = -2, curSkills = -2;
    var ring = toTop.querySelector('.ring .fg'), RC = 135.1;
    var ringSkills = skillsToTop ? skillsToTop.querySelector('.ring .fg') : null;
    var ringChangelog = toTopBtnChangelog ? toTopBtnChangelog.querySelector('.ring .fg') : null;
    /* 缓存深色区域和浮层元素，避免每帧 querySelectorAll */
    var darkZones = [].slice.call(document.querySelectorAll('.closing, footer'));
    var floatingEls = [toTop, skillsToTop, toTopBtnChangelog, dirNav, skillsDirNav].filter(Boolean);

    function update() {
      raf = 0;
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      var vh = window.innerHeight;
      var max = Math.max(1, document.documentElement.scrollHeight - vh);
      var onHome = home && home.style.display !== 'none';
      var onSkills = skillsView && skillsView.style.display !== 'none';
      var changelogView = document.getElementById('view-changelog');
      var onChangelog = changelogView && changelogView.style.display !== 'none';

      /* 返回顶部：滚过半屏后出现 */
      toTop.classList.toggle('show', onHome && y > vh * 0.5);
      if (skillsToTop) skillsToTop.classList.toggle('show', onSkills && y > vh * 0.5);
      if (toTopBtnChangelog) toTopBtnChangelog.classList.toggle('show', onChangelog && y > vh * 0.5);

      /* 检测返回顶部按钮和目录是否在深色区域（closing section + footer）上 */
      floatingEls.forEach(function (el) {
        var br = el.getBoundingClientRect();
        var cx = br.left + br.width / 2;
        var cy = br.top + br.height / 2;
        var onDark = false;
        darkZones.forEach(function (zone) {
          var zr = zone.getBoundingClientRect();
          if (cx >= zr.left && cx <= zr.right && cy >= zr.top && cy <= zr.bottom) onDark = true;
        });
        el.classList.toggle('dark', onDark);
      });
      /* 进度环 */
      var ringOffset = RC * (1 - Math.min(1, y / max));
      if (ring) ring.style.strokeDashoffset = ringOffset;
      if (ringSkills) ringSkills.style.strokeDashoffset = ringOffset;
      if (ringChangelog) ringChangelog.style.strokeDashoffset = ringOffset;

      /* 首页目录：滚过 Hero 后显示，页脚区域也能适应深色 */
      var heroBottom = hero ? (y + hero.getBoundingClientRect().bottom) : vh;
      dirNav.classList.toggle('show', wide() && onHome && y > heroBottom - 120);

      /* Skills 目录：无 hero，直接显示 */
      if (skillsDirNav) {
        skillsDirNav.classList.toggle('show', wide() && onSkills);
      }

      /* 高亮当前 section - 首页 */
      var n = navH(), idx = -1;
      for (var i = 0; i < dirItems.length; i++) {
        if (dirItems[i].el.getBoundingClientRect().top - n - 120 <= 0) idx = i;
      }
      if (y >= max - 4) idx = dirItems.length - 1;
      if (idx !== cur) {
        cur = idx;
        dirItems.forEach(function (x, i) { x.li.classList.toggle('active', i === idx); });
      }

      /* 高亮当前 section - Skills */
      if (skillsItems.length) {
        var sIdx = -1;
        for (var j = 0; j < skillsItems.length; j++) {
          if (skillsItems[j].el.getBoundingClientRect().top - n - 120 <= 0) sIdx = j;
        }
        if (y >= max - 4) sIdx = skillsItems.length - 1;
        if (sIdx !== curSkills) {
          curSkills = sIdx;
          skillsItems.forEach(function (x, i) { x.li.classList.toggle('active', i === sIdx); });
        }
      }
    }

    function onScroll() { if (!raf) raf = requestAnimationFrame(update); }

    /* 点击目录跳转 - 首页 */
    dirNav.addEventListener('click', function (e) {
      var li = e.target.closest('li[data-goto-sec]');
      if (!li) return;
      var secId = li.dataset.gotoSec;
      var t = document.getElementById(secId);
      if (!t) return;
      var y;
      if (secId === 'provenance') {
        /* 出品团队：让 section 中心对齐视口中心，目录(50%)与之平行 */
        /* 用 offsetTop（原始值，不受 zoom 影响）+ offsetHeight/2 算 section 中心 */
        var tOff = t.offsetTop;
        for (var p = t.offsetParent; p && p !== document.body; p = p.offsetParent) tOff += p.offsetTop;
        y = tOff + t.offsetHeight / 2 - (window.innerHeight / 2) / (parseFloat(root.style.zoom) || 1);
      } else {
        y = (window.scrollY || 0) + t.getBoundingClientRect().top - navH() - 16;
      }
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    });

    /* 点击目录跳转 - Skills */
    if (skillsDirNav) {
      skillsDirNav.addEventListener('click', function (e) {
        var li = e.target.closest('li[data-goto-sec]');
        if (!li) return;
        var t = document.getElementById(li.dataset.gotoSec);
        if (!t) return;
        var y = (window.scrollY || 0) + t.getBoundingClientRect().top - navH() - 16;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      });
    }

    toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    if (skillsToTop) skillsToTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    if (toTopBtnChangelog) toTopBtnChangelog.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('hashchange', onScroll);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', onScroll);
    update();
  })();

})();
