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

    function initCharts(root) {
      chartInsts.forEach(function (c) { try { c.dispose(); } catch (e) { } });
      chartInsts = [];
      if (typeof echarts === 'undefined') return;
      root.querySelectorAll('[data-chart]').forEach(function (el) {
        var opt = CHART_OPTS[el.dataset.chart];
        if (!opt) return;
        try {
          var c = echarts.init(el);
          c.setOption(opt());
          chartInsts.push(c);
        } catch (e) { }
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
        if (isAI) {
          var bub = m.querySelector('.bub');
          [].slice.call(bub.children).forEach(function (el) {
            el.style.transition = 'opacity .3s ease, transform .3s ease';
            el.style.opacity = '0';
          });
        }
        m.style.display = '';
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
        '<div class="src disabled"><span class="s-t">等待探索</span><span class="s-d">更多场景·待您解锁</span></div>';
    }
    var srcs = [].slice.call(navEl.querySelectorAll('.src'));

    navEl.addEventListener('click', function (e) {
      var b = e.target.closest('.src');
      if (!b || b.classList.contains('disabled')) return;
      idx = ORDER.indexOf(b.dataset.k);
      show(b.dataset.k, { animate: true, manual: true });
    });

    window.addEventListener('resize', resizeCharts);

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
        return '<label class="bsk-opt"><input type="checkbox" data-s="' + s[0] + '" checked>' + s[1] + ' <code>' + s[2] + '</code></label>';
      }).join('');
      [].slice.call(optsBox.querySelectorAll('input')).forEach(function (b) { b.addEventListener('change', updCmd); });
    }
    function buildFeat() {
      feat.innerHTML =
        '<span><span class="tick">✓</span> 自动识别 Agent Skills 目录</span>' +
        '<span><span class="tick">✓</span> 校验发布包完整性</span>' +
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
    function copyText(txt) {
      if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(txt);
      var ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) { }
      document.body.removeChild(ta); return Promise.resolve();
    }

    buildFeat(); buildOpts();
    bskTabs.forEach(function (t) { t.addEventListener('click', function () { setMode(t.dataset.m); }); });
    copyBtn.addEventListener('click', function () {
      copyText(cmd.textContent).then(function () {
        copyBtn.textContent = '已复制 ✓'; copyBtn.classList.add('copied');
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

  function render(tab) {
    Object.keys(VIEWS).forEach(function (k) { VIEWS[k].style.display = (k === tab) ? '' : 'none'; });
    navTabs.forEach(function (t) { t.classList.toggle('active', t.dataset.tab === tab); });
    /* 隐藏容器里的 .reveal 不会被 IntersectionObserver 触发，切换后需重新挂载 */
    var cur = VIEWS[tab];
    if (cur) cur.querySelectorAll('.reveal:not(.visible)').forEach(function (el) { revealIO.observe(el); });

    /* Fix #4: 切走 home 时停止 hero 演示定时器，避免隐藏视图空转 */
    if (tab !== 'home' && heroDemo) heroDemo.stop();
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
      '<div class="mcmd"><div class="h">安装命令</div><div class="cmd">' + s.cmd + '</div>' +
      '<button class="copy" data-copy>复制命令</button></div>';
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
      if (c && c.textContent === '复制命令') {
        var txt = c.parentElement.querySelector('.cmd').textContent;
        (navigator.clipboard && window.isSecureContext ? navigator.clipboard.writeText(txt) : Promise.resolve()).then(function () {
          c.textContent = '已复制 ✓'; c.classList.add('copied');
          setTimeout(function () { c.textContent = '复制命令'; c.classList.remove('copied'); }, 2000);
        });
      }
    });
  }
  document.querySelectorAll('[data-skill]').forEach(function (c) { c.addEventListener('click', function () { openSkill(c.dataset.skill); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSkill(); });

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

  /* Fix #10: 重命名 io → scrollIO 避免与全局 revealIO 混淆 */
  var iDemoTerm = document.querySelector('#interact .term');
  if (iDemoTerm && 'IntersectionObserver' in window) {
    var scrollIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          iDemo.show('ask', { animate: true, manual: true });
          scrollIO.unobserve(e.target);
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
  function fit() {
    var w = window.innerWidth;
    if (w < BASE) {
      root.style.width = BASE + 'px';
      root.style.zoom = w / BASE;
    } else {
      root.style.width = '';
      root.style.zoom = '';
    }
  }
  window.addEventListener('resize', function () {
    clearTimeout(zoomTimer);
    zoomTimer = setTimeout(fit, 80);
  });
  fit();

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
        setTimeout(function () { qC.textContent = '⧉ 复制命令'; qC.classList.remove('copied'); }, 2000);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(txt).then(done);
      } else {
        var ta = document.createElement('textarea');
        ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        done();
      }
    });
  }

})();
