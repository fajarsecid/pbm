// ==UserScript==
// @name         PBWEB - VANGUARD ELITE
// @namespace    vanguardelite.local
// @version      2.0.0
// @description  VANGUARD ELITE (NOVA core: aimbot + ESP + full features + anti-kick, keyless)
// @match        *://pbmobile.app/*
// @match        *://*.pbmobile.app/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function (winArg) {
  'use strict';

  var window = (typeof unsafeWindow !== 'undefined' && unsafeWindow)
    ? unsafeWindow
    : ((typeof winArg !== 'undefined' && winArg) ? winArg : ((typeof globalThis !== 'undefined') ? globalThis : this));

  if (!window) window = globalThis;
  if (window.__pb) return;

  /* ============================================================================
1. TOP-LEFT TIKTOK BADGE (@pbmobile_id)
     ============================================================================ */
  function ensureLobbyBadge() {
    try {
      if (document.getElementById('vanguard-lobby-badge')) return;
      var badge = document.createElement('div');
      badge.id = 'vanguard-lobby-badge';
      badge.style.cssText = [
        'position:fixed;top:10px;left:12px;z-index:999999;pointer-events:none;user-select:none;',
        'display:inline-flex;align-items:center;gap:7px;',
        'font-family:"Segoe UI",Tahoma,system-ui,sans-serif;line-height:1.2;',
        'background:rgba(9,14,23,0.90);backdrop-filter:blur(10px);',
        'border:1px solid rgba(34,211,238,0.45);padding:6px 11px;border-radius:9px;',
        'box-shadow:0 4px 18px rgba(0,0,0,0.7),0 0 12px rgba(6,182,212,0.25);'
      ].join('');
      badge.innerHTML =
        '<span style="width:20px;height:20px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;' +
          'background:linear-gradient(135deg,#06b6d4,#10b981);color:#fff;font-size:11px;font-weight:900;' +
          'box-shadow:0 0 8px rgba(6,182,212,0.5);">♪</span>' +
        '<span style="font-size:11px;font-weight:800;color:#67e8f9;letter-spacing:0.35px;' +
          'text-shadow:0 0 8px rgba(103,232,249,0.4);">TikTok : @pbmobile_id</span>';
      (document.body || document.documentElement).appendChild(badge);
    } catch (e) {}
  }

  /* ============================================================================
2. CORE ENGINE
     ============================================================================ */
  function bootCore() {
    var V = '2.0.0';
    var BRAND = 'VANGUARD ELITE';

    function log() {
      try { console.log.apply(console, ['[VANGUARD]'].concat([].slice.call(arguments))); } catch (e) {}
    }

    /* --------------------------------------------------------------------------
       2.1 PREBOOT & BUNDLE PATCHER (ADAPTIVE)
       -------------------------------------------------------------------------- */
    (function preboot() {
      try {
        if (!/\/jogo|game\.html/.test(location.pathname)) return;
        if (window.G || window.HUDO || window.GAME_READY || window.__pbBoot) return;
        window.__pbBoot = 1;

        try {
          var nb = +sessionStorage.getItem('pb_noboot') || 0;
          if (nb && Date.now() - nb < 120000) return;
        } catch (e0) {}

        if (document.readyState === 'complete') return;

        function xget(url, accept) {
          var x = new XMLHttpRequest();
          x.open('GET', url, false);
          try { x.setRequestHeader('Accept', accept); } catch (e) {}
          x.send(null);
          if (x.status !== 200 || !x.responseText) throw new Error('xhr ' + x.status);
          return x.responseText;
        }

        var html = xget(location.href, 'text/html,*/*');
        var bm = /src="([^"]*\/static\/game\/bundle\.js[^"]*)"/.exec(html);
        if (!bm) return;

        var bsrc = xget(new URL(bm[1], location.href).href, '*/*');

        var integrityRe = /if\(!\(\(\)=>\{try\{const e=document\.currentScript,t=e&&e\.src&&new URL\(e\.src\);return!!t&&t\.origin===location\.origin&&"\/static\/game\/bundle\.js"===t\.pathname\}catch\(e\)\{return!1\}\}\)\(\)\)\{try\{location\.replace\("\/"\)\}catch\(t\)\{\}throw new Error\("pb"\)\}/;
        bsrc = bsrc.replace(/function kc\(\)\s*\{/, 'function kc(){return;');
        bsrc = bsrc.replace(/function R\(t\)\s*\{/, 'function R(t){if(t&&"acflag"===t.t)return;');

        if (integrityRe.test(bsrc)) {
          bsrc = bsrc.replace(integrityRe, 'if(0){}');
          log('integrity check disabled');
        } else {
          bsrc = bsrc.replace(/throw new Error\("pb"\)/g, 'void 0');
          log('integrity check fallback applied');
        }

        var gFlex = /!1&&\(window\.G=\{P:([A-Za-z_$][\w$]*),bots:([A-Za-z_$][\w$]*),CFG:([A-Za-z_$][\w$]*),camera:([A-Za-z_$][\w$]*),scene:([A-Za-z_$][\w$]*),cast:([A-Za-z_$][\w$]*),update:([A-Za-z_$][\w$]*),nades:([A-Za-z_$][\w$]*)/;
        if (gFlex.test(bsrc)) {
          bsrc = bsrc.replace(gFlex, '!0&&(window.G={P:$1,bots:$2,CFG:$3,camera:$4,scene:$5,cast:$6,update:$7,nades:$8');
          log('window.G expose re-enabled');
        }

        var gateFlex = /([A-Za-z_$][\w$]*)="localhost"===location\.hostname\|\|"127\.0\.0\.1"===location\.hostname\|\|"\[::1\]"===location\.hostname/g;
        var patched = false;
        var foundIds = [];
        bsrc = bsrc.replace(gateFlex, function (full, ident) {
          foundIds.push(ident);
          patched = true;
          return ident + '=!0';
        });

        if (!patched) {
          var gateUi = /const\s+([A-Za-z_$][\w$]*)="localhost"===location\.hostname\|\|"127\.0\.0\.1"===location\.hostname\|\|"\[::1\]"===location\.hostname,/;
          var mUi = gateUi.exec(bsrc);
          if (mUi) {
            bsrc = bsrc.replace(mUi[0], 'const ' + mUi[1] + '=!0,');
            foundIds.push(mUi[1] + '(legacy-comma)');
            patched = true;
          }
        }
        if (!patched) {
          log('gate baru terdeteksi, lanjut tanpa paksa tulis ulang dokumen');
          return;
        }
        log('gate patched:', foundIds.join(', '));

        var parsed = new DOMParser().parseFromString(html, 'text/html');
        var scripts = [].slice.call(parsed.querySelectorAll('script')).map(function (s) {
          return { src: s.getAttribute('src'), text: s.textContent, type: s.getAttribute('type') || '' };
        });
        if (!scripts.length) return;

        [].slice.call(parsed.querySelectorAll('script')).forEach(function (s) {
          if (s.parentNode) s.parentNode.removeChild(s);
        });

        var dt = parsed.doctype ? '<!doctype ' + parsed.doctype.name + '>' : '<!doctype html>';
        var clean = dt + parsed.documentElement.outerHTML;
        var burl = '';
        try { burl = URL.createObjectURL(new Blob([bsrc], { type: 'text/javascript' })); } catch (e1) {}

        try {
          if (document.referrer.indexOf('android-app://') === 0 ||
              matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches) {
            document.cookie = 'pbapp=1; max-age=31536000; path=/; secure; samesite=lax';
          }
        } catch (e4) {}

        try {
          document.open();
          document.write(clean);
          document.close();
        } catch (e2) {
          try { sessionStorage.setItem('pb_noboot', String(Date.now())); } catch (e3) {}
          location.reload();
          return;
        }

        var i = 0;
        function next() {
          while (i < scripts.length) {
            var s = scripts[i++];
            try {
              var t = (s.type || '').toLowerCase();
              if (t && t.indexOf('javascript') < 0 && t.indexOf('ecmascript') < 0) continue;
              var el = document.createElement('script');
              var head = document.head || document.documentElement;
              if (s.src) {
                var abs;
                try { abs = new URL(s.src, location.href).href; } catch (eU) { abs = s.src; }
                if (/\/static\/game\/bundle\.js(\?|$)/.test(abs)) abs = burl || '';
                if (abs) {
                  el.src = abs;
                  el.async = false;
                  var done = false;
                  var fin = function () { if (done) return; done = true; clearTimeout(to); next(); };
                  var to = setTimeout(fin, 20000);
                  el.onload = el.onerror = fin;
                  head.appendChild(el);
                  return;
                }
                el.textContent = bsrc;
                head.appendChild(el);
                continue;
              }
              el.textContent = s.text;
              head.appendChild(el);
            } catch (eL) {}
          }
        }
        next();

        setTimeout(function () {
          try {
            if (window.HUDO || window.GAME_READY || document.querySelector('canvas')) return;
            try { sessionStorage.setItem('pb_noboot', String(Date.now())); } catch (e) {}
            location.reload();
          } catch (e) {}
        }, 20000);
      } catch (e) {}
    })();

    /* --------------------------------------------------------------------------
       2.2 STATE & KONFIGURASI GLOBAL
       -------------------------------------------------------------------------- */
    var HIDDEN = { pb: null, pbvis: null, pbnade: null, pbqc: null, pbx: null };

    var P = {
      cone: 0.65,
      reach: 200,
      autoFire: 0,
      gain: 0.9,
      mode: 'near',
      bias: 0.35,
      aimMode: 'pov',
      povCircleR: 220,
      hitbox: 'head',
      aimbotOn: 0,
      aimbotGain: 1.1,
      aimbotHoldMs: 250,
      bulletSpeed: 350,
      leadFactor: 1.0,
      lockMode: 'pov'
    };

    var O = { sens: 0.5, fov: 70, invert: false };

    var FL = {
      wallbang: 1,
      infAmmo: 1,
      noRecoil: 1,
      godmode: 0,
      noclip: 0,
      antiKick: 1,
      noFall: 1,
      infNade: 1,
      infNadeMax: 99
    };

    var G = null;
    var aimOn = false;
    var fireHeld = 0;
    var nextTap = 0;
    var holding = false;
    var silentHolding = false;
    var lastPick = null;

    var st = {
      v: V, aim: false, G: false, bots: 0, enemies: 0,
      lock: 0, err: 0, fire: 0, dist: 0, hitbox: P.hitbox,
      aimbot: 0, lead: 0, lockMode: P.lockMode
    };

    var AB = { lockUntil: 0, target: null, lastShot: 0, freshFire: 0 };
    var SF = { on: 1 };
    var AIM = { dx: 0, dy: 0, queued: false };
    var AIMLOCK = { on: false, targetYaw: 0, targetPitch: 0, locked: false };

    function readOpts() {
      try {
        var s = localStorage.getItem('pbweb_opts');
        if (!s) return;
        var o = JSON.parse(s);
        if (typeof o.sens === 'number' && o.sens > 0) O.sens = o.sens;
        if (typeof o.fov === 'number' && o.fov > 0) O.fov = o.fov;
        O.invert = !!o.invert;
      } catch (e) {}
    }
    readOpts();
    try { addEventListener('pbopts', readOpts); } catch (e) {}

    try {
      var _pr = parseFloat(localStorage.getItem('ir_povcirc'));
      if (isFinite(_pr) && _pr >= 1) P.povCircleR = _pr;
      var _hb = localStorage.getItem('ir_hitbox');
      if (_hb === 'head' || _hb === 'body' || _hb === 'nearest') P.hitbox = _hb;
      var _ab = localStorage.getItem('ir_aimbot');
      if (_ab === '1' || _ab === '0') P.aimbotOn = +_ab;
      var _abg = parseFloat(localStorage.getItem('ir_aimbot_gain'));
      if (isFinite(_abg) && _abg > 0) P.aimbotGain = _abg;
      var _abh = parseFloat(localStorage.getItem('ir_aimbot_hold'));
      if (isFinite(_abh) && _abh >= 50) P.aimbotHoldMs = _abh;
      var _bs = parseFloat(localStorage.getItem('ir_bullet_speed'));
      if (isFinite(_bs) && _bs > 0) P.bulletSpeed = _bs;
      var _lf = parseFloat(localStorage.getItem('ir_lead'));
      if (isFinite(_lf) && _lf >= 0) P.leadFactor = _lf;
      var _lm = localStorage.getItem('ir_lockmode');
      if (_lm === 'legacy' || _lm === 'pov') P.lockMode = _lm;
    } catch (e) {}

    /* --------------------------------------------------------------------------
       2.3 UTILITAS UMUM, GAME INSTANCE & CANVAS HELPER
       -------------------------------------------------------------------------- */
    function game() {
      try {
        var g = window.G;
        if (g && g.P && g.P.s && g.camera && g.bots) return g;
      } catch (e) {}
      return null;
    }

    var _canvasCache = { el: null, at: 0 };
    function getGameCanvas() {
      var now = performance.now();
      if (_canvasCache.el && _canvasCache.el.parentNode && now - _canvasCache.at < 2500) {
        return _canvasCache.el;
      }
      _canvasCache.at = now;
      var best = null;
      var maxArea = 0;
      var cs = document.getElementsByTagName('canvas');
      for (var i = 0; i < cs.length; i++) {
        var c = cs[i];
        if (c.getAttribute('data-pb') || c.id === 'crossCv') continue;
        var area = c.offsetWidth * c.offsetHeight;
        if (area > maxArea) {
          maxArea = area;
          best = c;
        }
      }
      _canvasCache.el = best || null;
      return _canvasCache.el;
    }

    function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
    function wrap(a) {
      while (a > Math.PI) a -= 2 * Math.PI;
      while (a < -Math.PI) a += 2 * Math.PI;
      return a;
    }
    function wpos(bone, out) {
      if (!bone || !bone.matrixWorld || !bone.matrixWorld.elements) return false;
      var e = bone.matrixWorld.elements;
      out.x = e[12]; out.y = e[13]; out.z = e[14];
      return true;
    }
    function ms(text) {
      try {
        var c = document.getElementById('center');
        if (c) {
          c.textContent = text;
          c.style.display = '';
          setTimeout(function () { if (c.textContent === text) c.textContent = ''; }, 1500);
        } else {
          log(text);
        }
      } catch (e) { log(text); }
    }
    function buzz(pattern) {
      try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) {}
    }

    /* --------------------------------------------------------------------------
       2.4 KALKULASI TARGET, HITBOX & LINE OF SIGHT
       -------------------------------------------------------------------------- */
    var _hpOut = { x: 0, y: 0, z: 0 };
    var _leadOut = { x: 0, y: 0, z: 0 };
    var _pv = null;
    var _pDir = { x: 0, y: 0, z: 0 };
    var F = { x: 0, y: 0, z: 0 };
    var C = { x: 0, y: 0, z: 0 };

    function headPoint(p) {
      var by = p && p.c && p.c.byName;
      if (!by) return null;
      var h = by.Head || by.head;
      var g = by.Bone_HeadGearAttach;
      if (g && wpos(g, _hpOut)) { _hpOut.y -= 0.05; return _hpOut; }
      if (h && wpos(h, _hpOut)) { _hpOut.y += 0.11; return _hpOut; }
      var base = (p.obj && p.obj.position) ? p.obj.position : (p.mover && p.mover.pos);
      if (!base) return null;
      _hpOut.x = base.x;
      _hpOut.y = base.y + (p.mover && p.mover.crouch ? 1.18 : 1.68);
      _hpOut.z = base.z;
      return _hpOut;
    }

    function bodyPoint(p) {
      var by = p && p.c && p.c.byName;
      if (!by) return null;
      var h = by.Spine2 || by.Spine1 || by.Spine3 || by.Neck || by.Pelvis;
      if (h && wpos(h, _hpOut)) return _hpOut;
      var base = (p.obj && p.obj.position) ? p.obj.position : (p.mover && p.mover.pos);
      if (!base) return null;
      _hpOut.x = base.x;
      _hpOut.y = base.y + (p.mover && p.mover.crouch ? 0.82 : 1.15);
      _hpOut.z = base.z;
      return _hpOut;
    }

    function nearestPoint(p) {
      var hp = headPoint(p);
      if (!hp) return bodyPoint(p);
      var hx = hp.x, hy = hp.y, hz = hp.z;
      var bp = bodyPoint(p);
      if (!bp) return hp;
      var bx = bp.x, by = bp.y, bz = bp.z;
      var dh = (hx - C.x) * (hx - C.x) + (hy - C.y) * (hy - C.y) + (hz - C.z) * (hz - C.z);
      var db = (bx - C.x) * (bx - C.x) + (by - C.y) * (by - C.y) + (bz - C.z) * (bz - C.z);
      if (dh <= db) { _hpOut.x = hx; _hpOut.y = hy; _hpOut.z = hz; }
      else { _hpOut.x = bx; _hpOut.y = by; _hpOut.z = bz; }
      return _hpOut;
    }

    function getTargetPointLogical(p) {
      if (P.hitbox === 'head') return headPoint(p);
      if (P.hitbox === 'body') return bodyPoint(p);
      return nearestPoint(p);
    }

    function predictPoint(p, basePt, fromPt) {
      var dx = basePt.x - fromPt.x;
      var dy = basePt.y - fromPt.y;
      var dz = basePt.z - fromPt.z;
      var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < 1 || P.bulletSpeed <= 0) {
        _leadOut.x = basePt.x; _leadOut.y = basePt.y; _leadOut.z = basePt.z;
        return _leadOut;
      }
      var t = (dist / P.bulletSpeed) * P.leadFactor;
      var vx = 0, vy = 0, vz = 0;
      try {
        if (p.mover && p.mover.vel) {
          vx = +p.mover.vel.x || 0;
          vy = +p.mover.vel.y || 0;
          vz = +p.mover.vel.z || 0;
        }
      } catch (e) {}
      _leadOut.x = basePt.x + vx * t;
      _leadOut.y = basePt.y + vy * t * 0.5;
      _leadOut.z = basePt.z + vz * t;
      return _leadOut;
    }

    function getTargetPointLead(p, fromPt) {
      var base = getTargetPointLogical(p);
      if (!base) return null;
      return predictPoint(p, { x: base.x, y: base.y, z: base.z }, fromPt || C);
    }

    var _povCache = new WeakMap();
    function isInsidePOVCircle(cam, hp, p) {
      try {
        var now = performance.now();
        if (p) {
          var c = _povCache.get(p);
          if (c && now - c.t < 200) return c.v;
        }
        if (!_pv) _pv = cam.position.clone();
        var ndc = _pv.set(hp.x, hp.y, hp.z).project(cam);
        if (!(ndc.z > -1 && ndc.z < 1)) {
          if (p) _povCache.set(p, { t: now, v: false });
          return false;
        }
        var px = ndc.x * (innerWidth / 2);
        var py = -ndc.y * (innerHeight / 2);
        var v = Math.sqrt(px * px + py * py) <= P.povCircleR;
        if (p) _povCache.set(p, { t: now, v: v });
        return v;
      } catch (e) { return false; }
    }

    function hasLineOfSight(g, cam, hp) {
      try {
        if (typeof g.cast !== 'function') return true;
        var eye = cam.position;
        var dx = hp.x - eye.x, dy = hp.y - eye.y, dz = hp.z - eye.z;
        var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (!(dist > 0.5)) return false;
        _pDir.x = dx / dist; _pDir.y = dy / dist; _pDir.z = dz / dist;
        return !g.cast(eye, _pDir, dist - 0.35);
      } catch (e) { return true; }
    }

    var _losCache = new WeakMap();
    function hasLineOfSightThrottled(g, cam, p, point) {
      if (!p) return hasLineOfSight(g, cam, point);
      var now = performance.now();
      var c = _losCache.get(p);
      if (c && now - c.t < 300) return c.v;
      var v = hasLineOfSight(g, cam, point);
      _losCache.set(p, { t: now, v: v });
      return v;
    }

    function canLockTarget(g, cam, p, point) {
      if (P.lockMode !== 'pov') return true;
      if (!point) return false;
      if (!isInsidePOVCircle(cam, point, p)) return false;
      return hasLineOfSightThrottled(g, cam, p, point);
    }

    var _aimbotLosCache = new WeakMap();
    function canAimbotTarget(g, cam, p, point) {
      if (!point || !isInsidePOVCircle(cam, point, p)) return false;
      var now = performance.now();
      var c = _aimbotLosCache.get(p);
      if (c && now - c.t < 80) return c.v;
      var v = hasLineOfSight(g, cam, point);
      _aimbotLosCache.set(p, { t: now, v: v });
      return v;
    }

    function isBotReal(p) {
      if (!p || !p.obj || !p.c) return false;
      if (p.dead || !(p.hp > 0)) return false;
      if (!p.obj.parent || p.obj.visible === false) return false;
      return true;
    }

    function isInvulnerable(p) {
      if (!p) return true;
      try {
        if (p.god || p.godmode || p.invulnerable || p.immortal || p.shield) return true;
        if ((+p.flicker || 0) > 0 || (+p.spawnProtect || 0) > 0 || (+p.protect || 0) > 0) return true;
        if ((+p.invuln || 0) > 0 || (+p.invulnT || 0) > 0 || (+p.spawnT || 0) > 0) return true;
        if (p.mover && ((+p.mover.spawnT || 0) > 0 || (+p.mover.invulnT || 0) > 0)) return true;
      } catch (e) {}
      return false;
    }

    function isHumanEnemy(p, self) {
      if (!isBotReal(p) || !self || p === self) return false;
      if (p.team === self.team || p.isBot || p.bot) return false;
      var nm = String((p.name || p.nick || p.id || '')).trim().toLowerCase();
      if (/^(bot|ai)[_\-\s]?\d*$/i.test(nm)) return false;
      return !isInvulnerable(p);
    }

    function hitTestSafe(p, o, d, m) {
      if (!p || p.dead) return null;
      if (p.remote && !p.net && p.isBot) {
        var old = p.remote;
        p.remote = false;
        try { return p.hitTest(o, d, m); } finally { p.remote = old; }
      }
      return p.hitTest(o, d, m);
    }

    /* --------------------------------------------------------------------------
       2.5 INPUT MOUSE, TOUCH & YAW/PITCH LOCK
       -------------------------------------------------------------------------- */
    function aimWrite(dx, dy) {
      AIM.dx += dx;
      AIM.dy += dy;
      AIM.queued = true;
    }

    function aimFlush(g) {
      if (!AIM.queued) return;
      AIM.queued = false;
      var s = g && g.P && g.P.s;
      if (!s || s.dead) { AIM.dx = AIM.dy = 0; return; }
      if (AIMLOCK.locked && P.lockMode !== 'pov') { AIM.dx = AIM.dy = 0; return; }

      var sens = O.sens * ((g.camera && g.camera.fov || 70) / O.fov) * 0.005;
      var dyaw = -AIM.dx * sens;
      var dpitch = (O.invert ? 1 : -1) * AIM.dy * sens;
      var curY = (s.__pbYawRaw != null) ? s.__pbYawRaw : (+s.yaw || 0);
      var curP = (s.__pbPitchRaw != null) ? s.__pbPitchRaw : (+s.pitch || 0);
      var ny = wrap(curY + dyaw);
      var np = clamp(curP + dpitch, -1.4, 1.4);

      if (s.__pbYawLocked) {
        s.__pbYawRaw = ny;
        s.__pbPitchRaw = np;
      } else {
        s.yaw = ny;
        s.pitch = np;
      }
      AIM.dx = AIM.dy = 0;
    }

    function lockYawPitch(s) {
      if (!s || s.__pbYawLocked) return;
      s.__pbYawRaw = +s.yaw || 0;
      s.__pbPitchRaw = +s.pitch || 0;
      try {
        Object.defineProperty(s, 'yaw', {
          configurable: true,
          get: function () { return AIMLOCK.locked ? AIMLOCK.targetYaw : this.__pbYawRaw; },
          set: function (v) { this.__pbYawRaw = +v || 0; }
        });
        Object.defineProperty(s, 'pitch', {
          configurable: true,
          get: function () { return AIMLOCK.locked ? AIMLOCK.targetPitch : this.__pbPitchRaw; },
          set: function (v) { this.__pbPitchRaw = +v || 0; }
        });
        s.__pbYawLocked = true;
        log('yaw/pitch locked');
      } catch (e) { log('lockYawPitch fail', e); }
    }

    function down() {
      try {
        var g = G || game();
        if (g && g.P && g.P.s && !g.P.s.dead && typeof g.fire === 'function') {
          g.fire();
        }
      } catch (e) {}
      AB.freshFire = 1;
    }

    function up() {
      try {
        var g = G || game();
        if (g && typeof g.release === 'function') g.release();
      } catch (e) {}
      holding = false;
      silentHolding = false;
    }

    addEventListener('mousemove', function (e) {
      if (e.movementX || e.movementY) aimWrite(e.movementX, e.movementY);
    }, true);
    addEventListener('mousedown', function (e) {
      if (e.button === 0) { fireHeld = 1; AB.freshFire = 1; st.fire = 1; }
    }, true);
    addEventListener('mouseup', function (e) {
      if (e.button === 0) { fireHeld = 0; st.fire = 0; }
    }, true);
    addEventListener('blur', function () {
      fireHeld = 0; st.fire = 0; AB.freshFire = 0; FLY.jumpHeld = 0; FLY.crouchHeld = 0;
      if (silentHolding) up();
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { fireHeld = 0; st.fire = 0; if (silentHolding) up(); }
    });

    var fireIds = new Set();
    function inZone(t) { return t.clientX > innerWidth * 0.50 && t.clientY > innerHeight * 0.45; }
    function syncFire() { fireHeld = fireIds.size; st.fire = fireHeld; }

    addEventListener('touchstart', function (e) {
      for (var i = 0; i < e.changedTouches.length; i++) {
        var t = e.changedTouches[i];
        if (inZone(t)) { fireIds.add(t.identifier); AB.freshFire = 1; }
      }
      syncFire();
    }, true);
    addEventListener('touchmove', function (e) {
      for (var i = 0; i < e.changedTouches.length; i++) {
        var t = e.changedTouches[i];
        if (inZone(t)) fireIds.add(t.identifier);
        else fireIds.delete(t.identifier);
      }
      syncFire();
    }, true);
    function touchEnd(e) {
      for (var i = 0; i < e.changedTouches.length; i++) fireIds.delete(e.changedTouches[i].identifier);
      syncFire();
    }
    addEventListener('touchend', touchEnd, true);
    addEventListener('touchcancel', touchEnd, true);

    /* --------------------------------------------------------------------------
       2.6 MOVEMENT & SURVIVAL (FLY, NOCLIP, GODMODE, RESPAWN)
       -------------------------------------------------------------------------- */
    var FLY = { on: 0, mode: 'hover', jumpHeld: 0, crouchHeld: 0, riseSpeed: 7, maxHeight: 35, groundY: null, hoverY: null };
    var FLYB = { on: 1, last: 0, interval: 16, smooth: 1.0 };

    function flyPosObj(s) {
      if (!s) return null;
      if (s.mover && s.mover.pos && typeof s.mover.pos.y === 'number') return s.mover.pos;
      if (s.obj && s.obj.position && typeof s.obj.position.y === 'number') return s.obj.position;
      return null;
    }

    function flySyncBody(s, y) {
      try { if (s.mover && s.mover.pos && typeof s.mover.pos.y === 'number') s.mover.pos.y = y; } catch (e) {}
      try { if (s.obj && s.obj.position && typeof s.obj.position.y === 'number') s.obj.position.y = y; } catch (e) {}
    }

    function flyTick(dt) {
      if (!FLY.on) return false;
      var g = G || game();
      if (!g || !g.P || !g.P.s || g.P.s.dead) return false;
      var s = g.P.s, m = s.mover;
      var pos = flyPosObj(s);
      if (!pos || !isFinite(pos.y)) return false;

      var now = performance.now();
      var stepDt = (typeof dt === 'number' && isFinite(dt) && dt > 0) ? Math.min(0.05, dt) : 0.016;
      if (FLYB.on && FLYB.last > 0) {
        var elapsed = (now - FLYB.last) / 1000;
        if (elapsed > 0 && elapsed < 0.25) stepDt = Math.min(0.05, elapsed);
      }
      FLYB.last = now;

      if (FLY.groundY == null || !isFinite(FLY.groundY)) FLY.groundY = pos.y;
      if (FLY.hoverY == null || !isFinite(FLY.hoverY)) FLY.hoverY = pos.y;

      var verticalInput = (FLY.jumpHeld ? 1 : 0) - (FLY.crouchHeld ? 1 : 0);
      if (verticalInput !== 0) {
        var delta = verticalInput * FLY.riseSpeed * stepDt;
        if (FLYB.on) delta *= FLYB.smooth;
        FLY.hoverY += delta;
      }

      FLY.hoverY = clamp(FLY.hoverY, FLY.groundY, FLY.groundY + FLY.maxHeight);

      if (m) {
        try {
          m.noGrav = true; m.vy = 0; m.jt = -1; m.ft = 0; m.airT = 0; m.onGround = false;
          if (FL.noFall) { m.fallDmg = 0; m.fallT = 0; m.landT = 0; }
        } catch (e) {}
      }

      flySyncBody(s, FLY.hoverY);
      return true;
    }

    function flyToggle(on) {
      var g = G || game();
      var val = (on === undefined) ? (FLY.on ? 0 : 1) : (on ? 1 : 0);
      if (!val) {
        FLY.on = 0; FLY.jumpHeld = 0; FLY.crouchHeld = 0; FLY.groundY = null; FLY.hoverY = null;
        if (g && g.P && g.P.s && g.P.s.mover) {
          var m = g.P.s.mover;
          try { m.noGrav = false; m.vy = 0; m.jt = -1; m.ft = 0; m.onGround = false; } catch (e) {}
        }
        buzz(30);
        return 0;
      }

      var s = g && g.P && g.P.s;
      var pos = flyPosObj(s);
      if (!s || s.dead || !pos || !isFinite(pos.y)) {
        FLY.on = 0;
        return 0;
      }

      FLY.on = 1; FLY.groundY = pos.y; FLY.hoverY = pos.y;
      FLY.jumpHeld = 0; FLY.crouchHeld = 0; FLYB.last = performance.now();
      if (s.mover) {
        try { s.mover.noGrav = true; s.mover.jt = -1; s.mover.ft = 0; s.mover.vy = 0; } catch (e) {}
      }
      ms('Fly ON');
      buzz(30);
      return 1;
    }

    (function flyControls() {
      function isInputFocused() {
        var el = document.activeElement;
        return el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);
      }
      function setVertical(code, isDown) {
        if (code === 'Space') FLY.jumpHeld = isDown ? 1 : 0;
        if (code === 'ControlLeft' || code === 'ControlRight' || code === 'KeyC') FLY.crouchHeld = isDown ? 1 : 0;
      }
      addEventListener('keydown', function (e) {
        if (!FLY.on || isInputFocused()) return;
        if (e.code === 'Space' || e.code === 'ControlLeft' || e.code === 'ControlRight' || e.code === 'KeyC') {
          setVertical(e.code, true);
          e.preventDefault(); e.stopPropagation();
        }
        if (e.code === 'F9') { e.preventDefault(); flyToggle(); }
      }, true);
      addEventListener('keyup', function (e) { setVertical(e.code, false); }, true);

      setInterval(function bindMobileControls() {
        var jump = document.querySelectorAll('[data-action="jump"], .btn-jump, #btn-jump, #jump, [class*="jump"], [id*="jump"]');
        var crouch = document.querySelectorAll('[data-action="crouch"], .btn-crouch, #btn-crouch, #crouch, [class*="crouch"], [id*="crouch"], [data-action="duck"]');
        function bind(nodes, key) {
          for (var i = 0; i < nodes.length; i++) {
            var el = nodes[i], marker = key === 'jump' ? '__pbFlyJumpBound' : '__pbFlyCrouchBound';
            if (el[marker]) continue;
            el[marker] = 1;
            (function (node) {
              node.addEventListener('touchstart', function (e) {
                if (!FLY.on) return;
                if (key === 'jump') FLY.jumpHeld = 1; else FLY.crouchHeld = 1;
                e.preventDefault(); e.stopPropagation();
              }, { passive: false });
              function release(e) {
                if (key === 'jump') FLY.jumpHeld = 0; else FLY.crouchHeld = 0;
                if (FLY.on && e && e.cancelable) { e.preventDefault(); e.stopPropagation(); }
              }
              node.addEventListener('touchend', release, { passive: false });
              node.addEventListener('touchcancel', release, { passive: false });
            })(el);
          }
        }
        bind(jump, 'jump');
        bind(crouch, 'crouch');
      }, 1500);
    })();

    var NC = { active: 0, mover: null, origBlocked: null, origCrosses: null, origDepen: null };
    function ncInstall() {
      var g = G || game();
      var m = g && g.P && g.P.s && g.P.s.mover;
      if (!m) return false;
      if (NC.active && NC.mover === m) return true;
      ncUninstall();
      NC.mover = m;
      NC.origBlocked = m.blocked;
      NC.origCrosses = m.crosses;
      NC.origDepen = m.depenetrate;
      try { m.blocked = function () { return false; }; } catch (e) {}
      try { m.crosses = function () { return false; }; } catch (e) {}
      try { m.depenetrate = function () { return false; }; } catch (e) {}
      NC.active = 1;
      return true;
    }
    function ncUninstall() {
      if (!NC.active || !NC.mover) { NC.active = 0; return; }
      var m = NC.mover;
      try { m.blocked = NC.origBlocked; } catch (e) {}
      try { m.crosses = NC.origCrosses; } catch (e) {}
      try { m.depenetrate = NC.origDepen; } catch (e) {}
      NC.active = 0;
      NC.mover = null;
    }

    var GB = { s: null, field: null, patched: 0, origHT: null, lastApply: 0 };
    function gbBind(s) {
      if (!s || GB.s === s) return;
      GB.s = s; GB.field = null;
      var fields = ['flicker', 'spawnProtect', 'protect', 'invuln', 'invulnT', 'spawnT'];
      for (var i = 0; i < fields.length; i++) {
        if (typeof s[fields[i]] === 'number') { GB.field = fields[i]; break; }
      }
    }
    function gbTick(now) {
      if (!FL.godmode) {
        if (GB.patched && GB.s && GB.origHT) {
          try { GB.s.hitTest = GB.origHT; } catch (e) {}
          GB.patched = 0;
        }
        return;
      }
      var g = G || game();
      var s = g && g.P && g.P.s;
      if (!s || s.dead) return;
      if (s !== GB.s) gbBind(s);
      if (now - GB.lastApply < 150) return;
      GB.lastApply = now;

      if (GB.field) {
        try { s[GB.field] = 9e9; } catch (e) {}
      } else {
        ['flicker', 'spawnProtect', 'protect', 'invuln', 'invulnT', 'spawnT'].forEach(function (f) {
          try { if (typeof s[f] === 'number') s[f] = 9e9; } catch (e) {}
        });
      }
      if (!GB.patched && typeof s.hitTest === 'function') {
        GB.origHT = s.hitTest;
        s.hitTest = function () { return FL.godmode ? null : GB.origHT.apply(this, arguments); };
        GB.patched = 1;
      }
    }

    var IR = { on: 0, at: 0 };

    /* --------------------------------------------------------------------------
       2.7 SILENT NADE & UNLIMITED GRENADE
       -------------------------------------------------------------------------- */
    var SN = { on: 0, side: 'enemy', mode: 'aim', targetName: '', requireLOS: 0, homing: 1, lockedTarget: null, pinnedNameBot: null, nadeCount: 0, lastNadeAt: 0 };
    var SNB = { on: 1, last: 0, interval: 33 };
    var NG = { on: 1, max: 99, lastLog: 0, count: 0 };

    function snBotLabel(p, idxFallback) {
      var raw = (p && (p.name || p.nick)) ? String(p.name || p.nick).trim() : '';
      if (raw) return raw;
      if (p && p.id != null) return 'bot_' + String(p.id);
      return 'player_' + String(idxFallback || 0);
    }

    function snIsValidSide(p, self) {
      if (!p || p === self || p.dead || !(p.hp > 0) || !p.obj || !p.c || p.obj.visible === false) return false;
      var sameTeam = (p.team === self.team);
      return SN.side === 'ally' ? sameTeam : !sameTeam;
    }

    function snLock(g, from) {
      var list = g.bots || [];
      var self = g.P && g.P.s;
      var cam = g.camera;
      if (!self) return null;

      var candidates = [];
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        if (!snIsValidSide(p, self)) continue;
        var pt = getTargetPointLogical(p);
        if (!pt) continue;
        if (SN.requireLOS && cam && !hasLineOfSight(g, cam, pt)) continue;
        candidates.push({ bot: p, label: snBotLabel(p, i), pt: { x: pt.x, y: pt.y, z: pt.z } });
      }
      if (!candidates.length) return null;

      if (SN.mode === 'random') {
        return candidates[Math.floor(Math.random() * candidates.length)];
      }

      if (SN.mode === 'name_order') {
        if (SN.targetName) {
          var matched = candidates.find(function (c) { return c.label === SN.targetName; });
          if (matched) { SN.pinnedNameBot = matched.bot; return matched; }
          return null;
        }
        candidates.sort(function (a, b) {
          var cmp = a.label.localeCompare(b.label, undefined, { sensitivity: 'base' });
          return cmp !== 0 ? cmp : String(a.bot.id || '').localeCompare(String(b.bot.id || ''));
        });
        if (SN.pinnedNameBot && snIsValidSide(SN.pinnedNameBot, self)) {
          var pinnedPt = getTargetPointLogical(SN.pinnedNameBot);
          if (pinnedPt && (!SN.requireLOS || !cam || hasLineOfSight(g, cam, pinnedPt))) {
            return { bot: SN.pinnedNameBot, label: snBotLabel(SN.pinnedNameBot, 0), pt: { x: pinnedPt.x, y: pinnedPt.y, z: pinnedPt.z } };
          }
        }
        SN.pinnedNameBot = candidates[0].bot;
        return candidates[0];
      }

      var eye = (cam && cam.matrixWorld && cam.matrixWorld.elements)
        ? { x: cam.matrixWorld.elements[12], y: cam.matrixWorld.elements[13], z: cam.matrixWorld.elements[14] }
        : (from || { x: 0, y: 0, z: 0 });
      var yaw = +self.yaw || 0, pitch = +self.pitch || 0, cp = Math.cos(pitch);
      var fx = -Math.sin(yaw) * cp, fy = Math.sin(pitch), fz = -Math.cos(yaw) * cp;

      var best = null, bestScore = 1e9;
      for (var c = 0; c < candidates.length; c++) {
        var item = candidates[c];
        var dx = item.pt.x - eye.x, dy = item.pt.y - eye.y, dz = item.pt.z - eye.z;
        var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (!(dist > 0.01)) continue;
        var ang = Math.acos(clamp((dx * fx + dy * fy + dz * fz) / dist, -1, 1));
        var score = ang + dist * 0.002;
        if (score < bestScore) { bestScore = score; best = item; }
      }
      return best || candidates[0];
    }

    function snChaseNade(n) {
      if (!n || !n.__sn || !n.pos) return;
      var tgt = n.__snTarget;
      var g = G || game();
      var self = g && g.P && g.P.s;

      if (!tgt || !tgt.bot || !self || !snIsValidSide(tgt.bot, self)) {
        if (!g) { n.__snTarget = null; return; }
        var nt = snLock(g, n.pos);
        if (!nt) { n.__snTarget = null; return; }
        n.__snTarget = nt;
        tgt = nt;
        SN.lockedTarget = nt;
      }

      var pt = getTargetPointLogical(tgt.bot);
      if (!pt) return;
      tgt.pt.x = pt.x; tgt.pt.y = pt.y; tgt.pt.z = pt.z;

      try { n.pos.x = pt.x; n.pos.y = pt.y; n.pos.z = pt.z; } catch (e) { return; }
      try { if (n.mesh && n.mesh.position) n.mesh.position.set(pt.x, pt.y, pt.z); } catch (e) {}
      try { if (n.obj && n.obj.position) n.obj.position.set(pt.x, pt.y, pt.z); } catch (e) {}
      try { if (n.start && n.start.copy) n.start.copy(n.pos); } catch (e) {}
    }

    function snScanAndHoming(g) {
      if (!SN.on || !g.nades || !g.nades.length) return;
      var self = g.P && g.P.s;
      if (!self) return;

      for (var i = 0; i < g.nades.length; i++) {
        var n = g.nades[i];
        if (!n) continue;
        if (n.__sn) {
          if (!n.__snPatched) {
            n.__snPatched = 1;
            ['update', 'step', 'tick', 'integrate', 'move'].forEach(function (key) {
              if (typeof n[key] !== 'function') return;
              var orig = n[key];
              n[key] = function () {
                var r = orig.apply(this, arguments);
                try { snChaseNade(this); } catch (e) {}
                return r;
              };
            });
          }
          snChaseNade(n);
          continue;
        }

        var isMine = (n.owner === self);
        if (!isMine && n.owner == null && n.pos && self.mover && self.mover.pos) {
          try {
            var dx0 = n.pos.x - self.mover.pos.x;
            var dy0 = n.pos.y - self.mover.pos.y;
            var dz0 = n.pos.z - self.mover.pos.z;
            if (dx0 * dx0 + dy0 * dy0 + dz0 * dz0 < 16) isMine = true;
          } catch (e) {}
        }
        if (!isMine) continue;

        if (!n.pos && self.mover && self.mover.pos) {
          try { n.pos = self.mover.pos.clone(); n.pos.y += 1.4; } catch (e) { continue; }
        }
        if (!n.pos) continue;

        var target = snLock(g, n.pos);
        if (!target) continue;
        n.__snTarget = target;
        n.__sn = 1;
        SN.nadeCount++;
        SN.lastNadeAt = performance.now();
        SN.lockedTarget = target;
      }
    }

    function nadeTick() {
      if (!FL.infNade) return;
      var g = G || game();
      var inv = g && g.P && !g.P.s.dead && g.P.inv;
      if (!inv) return;

      var changed = false;
      for (var k in inv) {
        var slot = inv[k];
        if (!slot || typeof slot !== 'object' || !slot.w || !slot.w.grenade) continue;
        var maxAmmo = FL.infNadeMax;
        try { if (slot.ammo !== maxAmmo) { slot.ammo = maxAmmo; changed = true; } } catch (e) {}
        try { if (typeof slot.reserve === 'number' && slot.reserve < maxAmmo) { slot.reserve = maxAmmo; changed = true; } } catch (e) {}
      }
      if (changed) NG.count++;
    }

    /* --------------------------------------------------------------------------
       2.8 WEAPON & SILENT AIM (HOLD AUTO-SHOOT + 360 RAPID TAP)
       -------------------------------------------------------------------------- */
    var PR = { on: 0, ms: 120 };
    var RF = { on: 0, antiSpam: 1, lastFireAt: 0, minGapMs: 65 };
    var QC = { on: 1, fast: 0, slot: 0, ammo: -1, gate: {}, invRef: null, n: 0, sw: 0, dead: 0 };
    var IS = { on: 0 };
    var TB = { on: 0, at: 0 };
    var SL = { on: 0 };
    var DM = { at: 0, mult: 1.3 };
    var WB = 200;

    function rfCanFire(now) {
      return !RF.on || !RF.antiSpam || (now - RF.lastFireAt) >= RF.minGapMs;
    }

    function wbGun() {
      try {
        var g = G || game();
        var w = g && g.P && g.P.W;
        return !!(w && !w.melee && !w.grenade && !w.c4);
      } catch (e) { return false; }
    }

    function wbPatch() {
      if (!FL.wallbang) return;
      var g = G || game();
      var L = g && g.bots;
      if (!L || !L.length) return;
      for (var i = 0; i < L.length; i++) {
        var b = L[i];
        if (!b || b.__wb || typeof b.hitTest !== 'function') continue;
        b.__wb = 1;
        (function (bot, orig) {
          bot.hitTest = function (o, d, m) {
            var r = (FL.wallbang && wbGun() && typeof m === 'number') ? WB : m;
            try { return orig.call(this, o, d, r); } catch (e) { return null; }
          };
        })(b, b.hitTest);
      }
    }

    var SA = { on: 0, autoShoot: 0, tapShot: 0, fovRad: Math.PI * 2, target: 'head', lastShotAt: 0 };
    var SA_HEAD = { x: 0, y: 0, z: 0, bot: null, validUntil: 0 };

    function saGetPoint(bot, fromPt) {
      if (!bot) return null;
      var base = (SA.target === 'body') ? bodyPoint(bot) : headPoint(bot);
      if (!base) base = headPoint(bot) || bodyPoint(bot);
      if (!base) return null;
      return predictPoint(bot, { x: base.x, y: base.y, z: base.z }, fromPt || C);
    }

    function getTHREE() {
      if (window.THREE && window.THREE.Vector3) return window.THREE;
      try {
        var g = G || game();
        var V3 = g && g.camera && g.camera.position && g.camera.position.constructor;
        if (V3 && V3.prototype && V3.prototype.project) return { Vector3: V3 };
      } catch (e) {}
      return null;
    }

    function saUpdateHead(g) {
      if (!SA.on || !g || !g.P || !g.P.s || g.P.s.dead) { SA_HEAD.bot = null; return; }
      var s = g.P.s, cam = g.camera, list = g.bots || [];
      var me = cam && cam.matrixWorld && cam.matrixWorld.elements;
      var cx = me ? me[12] : 0, cy = me ? me[13] : 0, cz = me ? me[14] : 0;

      var best = null, bestScore = 1e9;
      if (SA_HEAD.bot && isHumanEnemy(SA_HEAD.bot, s)) {
        var prevHp = saGetPoint(SA_HEAD.bot, C);
        if (prevHp) {
          var pd = Math.hypot(prevHp.x - cx, prevHp.y - cy, prevHp.z - cz);
          if (pd >= 0.5 && pd <= P.reach + 80) { best = SA_HEAD.bot; bestScore = pd * 0.5; }
        }
      }

      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        if (!isHumanEnemy(p, s)) continue;
        var hp = saGetPoint(p, C);
        if (!hp) continue;
        var d = Math.hypot(hp.x - cx, hp.y - cy, hp.z - cz);
        if (d >= 0.5 && d <= P.reach + 80 && d < bestScore) {
          bestScore = d;
          best = p;
        }
      }

      if (!best) { SA_HEAD.bot = null; return; }
      var targetPt = saGetPoint(best, C);
      if (!targetPt) { SA_HEAD.bot = null; return; }
      SA_HEAD.x = targetPt.x; SA_HEAD.y = targetPt.y; SA_HEAD.z = targetPt.z;
      SA_HEAD.bot = best;
      SA_HEAD.validUntil = performance.now() + 500;
    }

    function forceResetCycleTimers(p) {
      if (!p) return;
      ['nextShot', 'chamberT', 'cockT', 'boltT', 'pumpT', 'cockingT', 'reloading', 'swapEnd'].forEach(function (k) {
        if (typeof p[k] === 'number' && p[k] > 0) p[k] = 0;
      });
    }

    function releaseSilentFire(g) {
      if (!silentHolding) return;
      try {
        var curG = g || G || game();
        if (curG && typeof curG.release === 'function') curG.release();
      } catch (e) {}
      silentHolding = false;
      holding = false;
    }

    function saFireStep(g) {
      var s = g && g.P && g.P.s;
      var p = g && g.P;
      var w = null;
      try { w = p && p.W; } catch (e) {}

      var hasValidTarget = !!(SA.on && SA_HEAD.bot && s && !s.dead && isHumanEnemy(SA_HEAD.bot, s));
      var invalidWeapon = !!(w && (w.melee || w.c4 || w.grenade));

      if (!hasValidTarget || invalidWeapon) {
        releaseSilentFire(g);
        return;
      }

      var now = performance.now();

      // Mode 1: Tap-tap cepat dengan jeda aman agar tidak banjir panggilan
      if (SA.tapShot) {
        forceResetCycleTimers(p);
        if (now < SA.lastShotAt + 22) return;
        SA.lastShotAt = now;
        try { if (typeof g.fire === 'function') g.fire(); } catch (e) {}
        silentHolding = true;
        holding = true;
        setTimeout(function () {
          try { if (typeof g.release === 'function') g.release(); } catch (e) {}
          silentHolding = false;
          holding = false;
        }, 10);
        return;
      }

      // Mode 2: Hold tembak terus selama ada target
      if (SA.autoShoot) {
        if (!silentHolding) {
          try { if (typeof g.fire === 'function') g.fire(); } catch (e) {}
          silentHolding = true;
          holding = true;
        }
        SA.lastShotAt = now;
      } else {
        releaseSilentFire(g);
      }
    }

    function saPatch() {
      var g = G || game();
      var L = g && g.bots;
      if (!L || !L.length) return;
      for (var i = 0; i < L.length; i++) {
        var b = L[i];
        if (!b || b.__sa || typeof b.hitTest !== 'function') continue;
        b.__sa = 1;
        (function (bot, origHT) {
          bot.hitTest = function (o, d, m) {
            if (!SA.on) return origHT.call(this, o, d, m);
            try {
              var g2 = G || game();
              if (!g2 || !g2.P || !g2.P.s || !isHumanEnemy(this, g2.P.s) || SA_HEAD.bot !== this) {
                return origHT.call(this, o, d, m);
              }
              var curHp = saGetPoint(this, C);
              if (!curHp) return origHT.call(this, o, d, m);
              SA_HEAD.x = curHp.x; SA_HEAD.y = curHp.y; SA_HEAD.z = curHp.z;

              var cam = g2.camera;
              var me = cam && cam.matrixWorld && cam.matrixWorld.elements;
              if (!me) return origHT.call(this, o, d, m);
              var ox = me[12], oy = me[13], oz = me[14];
              var tdx = SA_HEAD.x - ox, tdy = SA_HEAD.y - oy, tdz = SA_HEAD.z - oz;
              var tlen = Math.hypot(tdx, tdy, tdz);
              if (tlen < 0.5) return origHT.call(this, o, d, m);

              var THREE = getTHREE();
              var no, nd;
              if (THREE && THREE.Vector3) {
                no = new THREE.Vector3(ox, oy, oz);
                nd = new THREE.Vector3(tdx / tlen, tdy / tlen, tdz / tlen);
              } else {
                no = cam.position.clone(); no.set(ox, oy, oz);
                nd = cam.position.clone(); nd.set(tdx / tlen, tdy / tlen, tdz / tlen);
              }
              return origHT.call(this, no, nd, Math.max(tlen + 3, typeof m === 'number' ? m : 200));
            } catch (e) { return origHT.call(this, o, d, m); }
          };
        })(b, b.hitTest);
      }
    }

    /* --------------------------------------------------------------------------
       2.9 WEBSOCKET FILTER & ANTI-KICK (KICK-DROP + AUTO-RECONNECT)
       -------------------------------------------------------------------------- */
    function pbOut(d) {
      if (typeof d === 'string' && (d.indexOf('acflag') >= 0 || d.indexOf('ac\\u0066lag') >= 0)) return null;
      return d;
    }

    var KG = { on: 0, drop: 0 };
    function kgDrop(d) {
      if (!FL.antiKick) return false;
      if (typeof d !== 'string' || d.length < 8 || d.length > 900) return false;
      if (d.indexOf('"t"') < 0) return false;
      var low = d.toLowerCase();
      var m = low.match(/"t"\s*:\s*"([a-z_]+)"/);
      if (!m) return false;
      var t = m[1];
      if (t === 'kick' || t === 'kicked' || t === 'kickout' || t === 'ban' || t === 'banned' ||
          t === 'expel' || t === 'expulso' || t === 'removed' || t === 'removido') { KG.drop++; return true; }
      if ((t === 'error' || t === 'err') && /(kick|expuls|banid|banned|removid|removido)/.test(low)) { KG.drop++; return true; }
      return false;
    }
    (function kgInstall() {
      try {
        var OW = window.WebSocket;
        if (!OW || OW.__pbKG) return;
        var Pp = OW.prototype;
        var sendN = Pp.send, closeN = Pp.close;
        var rsGet = Object.getOwnPropertyDescriptor(Pp, 'readyState').get;
        function revive(rec, wait) {
          if (!FL.antiKick || rec.dead) return;
          clearTimeout(rec.timer);
          rec.timer = setTimeout(function () {
            if (!FL.antiKick || rec.dead) return;
            try { if (rec.live && rsGet.call(rec.live) === 1) return; } catch (e) {}
            var ns;
            try { ns = new OW(rec.url); } catch (e) { revive(rec, 1500); return; }
            rec.live = ns;
            try { ns.binaryType = rec.sock.binaryType || 'arraybuffer'; } catch (e) {}
            ns.onopen = function (ev) { rec.tries = 0; try { if (rec.onopen) rec.onopen.call(rec.sock, ev); } catch (e) {} };
            ns.onmessage = function (ev) { try { if (rec.onmessage) rec.onmessage.call(rec.sock, ev); } catch (e) {} };
            ns.onerror = function (ev) { try { if (rec.onerror) rec.onerror.call(rec.sock, ev); } catch (e) {} };
            ns.onclose = function (ev) {
              var code = ev ? ev.code : 0; rec.tries++;
              if (rec.tries > 40 || code === 1008) { rec.dead = 1; return; }
              revive(rec, Math.min(8000, 200 * Math.pow(1.3, Math.min(rec.tries, 12))));
            };
          }, wait == null ? 200 : wait);
        }
        function wrap(sock) {
          if (!sock || sock.__pbKG) return sock;
          var rec = { sock: sock, url: sock.url, bin: 'arraybuffer', live: null, tries: 0, dead: 0, timer: 0, onopen: null, onmessage: null, onerror: null, onclose: null };
          sock.__pbKG = rec;
          ['onopen', 'onmessage', 'onerror', 'onclose'].forEach(function (p) {
            try {
              Object.defineProperty(sock, p, {
                configurable: true,
                get: function () { return rec[p]; },
                set: function (fn) {
                  if (p === 'onmessage' && typeof fn === 'function') {
                    rec.onmessage = function (ev) { if (kgDrop(ev.data)) return; return fn.call(rec.sock, ev); };
                  } else rec[p] = fn;
                  try {
                    var d = Object.getOwnPropertyDescriptor(Pp, p);
                    if (rec.live && rsGet.call(rec.live) === 1) d.set.call(rec.live, rec[p]);
                    else d.set.call(sock, rec[p]);
                  } catch (e) {}
                }
              });
            } catch (e) {}
          });
          try { sock.send = function (d) { d = pbOut(d); if (d === null) return; try { if (rec.live && rsGet.call(rec.live) === 1) return sendN.call(rec.live, d); } catch (e) {} return sendN.call(sock, d); }; } catch (e) {}
          try { sock.close = function (c, r) { try { if (rec.live) closeN.call(rec.live, c, r); } catch (e) {} try { return closeN.call(sock, c, r); } catch (e) {} }; } catch (e) {}
          try { Object.defineProperty(sock, 'readyState', { configurable: true, get: function () { try { if (rec.live) return rsGet.call(rec.live); } catch (e) {} try { return rsGet.call(sock); } catch (e) { return 3; } } }); } catch (e) {}
          return sock;
        }
        function WSW(url, prot) {
          var s = arguments.length > 1 ? new OW(url, prot) : new OW(url);
          try { if (/[?&]k=|\/ws(\?|$)/.test(String(url))) return wrap(s); } catch (e) {}
          return s;
        }
        WSW.prototype = Pp;
        try { WSW.CONNECTING = 0; WSW.OPEN = 1; WSW.CLOSING = 2; WSW.CLOSED = 3; } catch (e) {}
        WSW.__pbKG = 1; window.WebSocket = WSW; KG.on = 1;
      } catch (e) {}
    })();

    /* --------------------------------------------------------------------------
       2.10 ESP & VISUAL OVERLAYS (BOX, BONE, RADAR, TRACER, POV RING)
       -------------------------------------------------------------------------- */
    var E = { on: 1, nameOn: 0, wrap: null, slots: [], last: 0, n: 0, v: null };
    var HPO = { on: 0 };

    function eInit() {
      if (E.wrap && E.wrap.parentNode) return true;
      var host = document.body || document.documentElement;
      if (!host) return false;
      var w = document.createElement('div');
      w.setAttribute('data-pb', '1');
      w.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;overflow:hidden;pointer-events:none;z-index:2147483000';
      host.appendChild(w);
      E.wrap = w;
      E.slots = [];
      return true;
    }

    function eSlot(i) {
      var s = E.slots[i];
      if (s) return s;
      var box = document.createElement('div');
      box.style.cssText = 'position:absolute;left:0;top:0;box-sizing:border-box;border:1px solid rgba(6,182,212,.92);border-radius:2px;display:none;will-change:transform;box-shadow:0 0 6px rgba(6,182,212,0.25)';

      var hb = document.createElement('div');
      hb.style.cssText = 'position:absolute;left:-1px;top:-5px;width:calc(100% + 2px);height:3px;background:rgba(0,0,0,.45)';
      var hf = document.createElement('div');
      hf.style.cssText = 'position:absolute;left:0;top:0;height:100%;width:100%;background:#10b981';
      hb.appendChild(hf);

      var dot = document.createElement('div');
      dot.style.cssText = 'position:absolute;left:50%;top:-4px;width:3px;height:3px;margin-left:-2px;background:#f43f5e;border-radius:50%';

      var tx = document.createElement('div');
      tx.style.cssText = 'position:absolute;right:0;top:-15px;font:10px/12px Tahoma,sans-serif;color:#67e8f9;text-shadow:0 1px 2px #000;white-space:nowrap;font-weight:700';

      var tx2 = document.createElement('div');
      tx2.style.cssText = 'position:absolute;left:0;top:-15px;font:10px/12px Tahoma,sans-serif;color:#fb7185;text-shadow:0 1px 2px #000;white-space:nowrap;font-weight:700;display:none';

      var nameEl = document.createElement('div');
      nameEl.style.cssText = 'position:absolute;left:50%;top:-26px;transform:translateX(-50%);font:10px/12px Tahoma,sans-serif;color:#38bdf8;text-shadow:0 1px 2px #000;white-space:nowrap;font-weight:800;display:none';

      box.appendChild(hb); box.appendChild(dot); box.appendChild(tx); box.appendChild(tx2); box.appendChild(nameEl);
      E.wrap.appendChild(box);
      s = { box: box, hp: hf, tx: tx, tx2: tx2, name: nameEl };
      E.slots[i] = s;
      return s;
    }

    function eClear() {
      for (var i = 0; i < E.slots.length; i++) E.slots[i].box.style.display = 'none';
      E.n = 0;
    }

    function eProj(cam, r, x, y, z) {
      if (!E.v) { try { E.v = cam.position.clone(); } catch (e) { return null; } }
      var d = E.v.set(x, y, z).project(cam);
      if (!(d.z > -1 && d.z < 1)) return null;
      return { x: r.left + (d.x * 0.5 + 0.5) * r.width, y: r.top + (-d.y * 0.5 + 0.5) * r.height };
    }

    function eDraw(g) {
      var cam = g.camera, list = g.bots, self = g.P && g.P.s;
      if (!list || !cam || !self || self.dead) { eClear(); return; }
      var host = getGameCanvas();
      if (!host) { eClear(); return; }
      var r = host.getBoundingClientRect();
      if (!(r.width > 0)) { eClear(); return; }

      var me = cam.matrixWorld && cam.matrixWorld.elements;
      var cx = me ? me[12] : 0, cy = me ? me[13] : 0, cz = me ? me[14] : 0;
      var my = self.team, idx = 0;

      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        if (!p || !p.obj || !p.c || p === self || p.team === my || p.dead || !(p.hp > 0)) continue;
        var hp = headPoint(p);
        if (!hp) continue;
        var mm = p.obj.matrixWorld && p.obj.matrixWorld.elements;
        if (!mm) continue;

        var a = eProj(cam, r, hp.x, hp.y, hp.z);
        var b = eProj(cam, r, mm[12], mm[13], mm[14]);
        if (!a || !b) continue;

        var bh = b.y - a.y;
        if (!(bh > 6)) continue;
        if (a.x < r.left - 60 || a.x > r.left + r.width + 60 || b.y < r.top - 60 || a.y > r.top + r.height + 60) continue;

        var bw = Math.min(400, bh * 0.42);
        var s = eSlot(idx++);
        s.box.style.display = 'block';
        s.box.style.transform = 'translate3d(' + (a.x - bw / 2).toFixed(1) + 'px,' + a.y.toFixed(1) + 'px,0)';
        s.box.style.width = bw.toFixed(1) + 'px';
        s.box.style.height = bh.toFixed(1) + 'px';

        var mxh = p.maxHp > 0 ? p.maxHp : 100;
        var f = clamp((p.hp || 0) / mxh, 0, 1);
        s.hp.style.width = (f * 100).toFixed(0) + '%';
        s.hp.style.background = f > 0.5 ? '#10b981' : (f > 0.25 ? '#f59e0b' : '#f43f5e');

        var dist = Math.hypot(hp.x - cx, hp.y - cy, hp.z - cz);
        s.tx.textContent = Math.round(dist) + 'm';

        if (HPO.on) {
          s.tx2.textContent = Math.round(p.hp) + ' HP';
          s.tx2.style.display = 'block';
        } else {
          s.tx2.style.display = 'none';
        }

        if (E.nameOn) {
          var nm = p.name || p.nick || ('bot' + (p.id != null ? p.id : ''));
          s.name.textContent = String(nm).slice(0, 20);
          s.name.style.display = 'block';
        } else {
          s.name.style.display = 'none';
        }
      }

      for (; idx < E.slots.length; idx++) {
        E.slots[idx].box.style.display = 'none';
      }
      E.n = idx;
    }

    var BE = { on: 0, wrap: null, ctx: null, range: 60, _v: null };
    var BONE_PAIRS = [
      ['Head', 'Neck'], ['Neck', 'Spine3'], ['Spine3', 'Spine2'], ['Spine2', 'Spine1'], ['Spine1', 'Pelvis'],
      ['Spine3', 'L_Clavicle'], ['L_Clavicle', 'L_UpperArm'], ['L_UpperArm', 'L_Forearm'], ['L_Forearm', 'L_Hand'],
      ['Spine3', 'R_Clavicle'], ['R_Clavicle', 'R_UpperArm'], ['R_UpperArm', 'R_Forearm'], ['R_Forearm', 'R_Hand'],
      ['Pelvis', 'L_Thigh'], ['L_Thigh', 'L_Calf'], ['L_Calf', 'L_Foot'],
      ['Pelvis', 'R_Thigh'], ['R_Thigh', 'R_Calf'], ['R_Calf', 'R_Foot']
    ];

    function beInit() {
      if (BE.wrap && BE.wrap.parentNode) return true;
      var host = document.body || document.documentElement;
      if (!host) return false;
      var w = document.createElement('canvas');
      w.setAttribute('data-pb', '1');
      w.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:2147482999';
      host.appendChild(w);
      BE.wrap = w;
      BE.ctx = w.getContext('2d');
      return true;
    }

    function beClear() {
      if (BE.ctx && BE.wrap) BE.ctx.clearRect(0, 0, BE.wrap.width, BE.wrap.height);
    }

    function beProject(cam, r, b, out) {
      if (!BE._v) { try { BE._v = cam.position.clone(); } catch (e) { return false; } }
      var e = b.matrixWorld.elements;
      var d = BE._v.set(e[12], e[13], e[14]).project(cam);
      if (!(d.z > -1 && d.z < 1)) return false;
      out.x = r.left + (d.x * 0.5 + 0.5) * r.width;
      out.y = r.top + (-d.y * 0.5 + 0.5) * r.height;
      return true;
    }

    function beDraw(g) {
      if (!BE.on) { beClear(); return; }
      var cam = g.camera, list = g.bots, self = g.P && g.P.s;
      if (!list || !cam || !self || self.dead || !beInit()) { beClear(); return; }
      var host = getGameCanvas();
      if (!host) { beClear(); return; }
      var r = host.getBoundingClientRect();
      if (!(r.width > 0)) { beClear(); return; }

      var dpr = Math.min(2, devicePixelRatio || 1);
      var w = Math.round(innerWidth * dpr), h = Math.round(innerHeight * dpr);
      if (BE.wrap.width !== w || BE.wrap.height !== h) { BE.wrap.width = w; BE.wrap.height = h; }

      var ctx = BE.ctx;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(56,189,248,0.75)';

      var my = self.team, me = cam.matrixWorld.elements;
      var cx = me[12], cy = me[13], cz = me[14];
      var pa = { x: 0, y: 0 }, pb = { x: 0, y: 0 };

      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        if (!p || !p.obj || !p.c || p === self || p.team === my || p.dead || !(p.hp > 0)) continue;
        var mm = p.obj.matrixWorld && p.obj.matrixWorld.elements;
        if (!mm || Math.hypot(mm[12] - cx, mm[13] - cy, mm[14] - cz) > BE.range) continue;
        var by = p.c.byName;
        if (!by) continue;

        for (var j = 0; j < BONE_PAIRS.length; j++) {
          var ba = by[BONE_PAIRS[j][0]], bb = by[BONE_PAIRS[j][1]];
          if (!ba || !bb || !beProject(cam, r, ba, pa) || !beProject(cam, r, bb, pb)) continue;
          if (pa.x < r.left - 200 || pa.x > r.left + r.width + 200 || pa.y < r.top - 200 || pa.y > r.top + r.height + 200) continue;
          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
          ctx.stroke();
        }
      }
    }

    var RD = { on: 0, el: null, dots: [], last: 0 };
    function rdInit() {
      if (RD.el && RD.el.parentNode) return true;
      var host = document.body || document.documentElement;
      if (!host) return false;
      var w = document.createElement('div');
      w.setAttribute('data-pb', '1');
      w.style.cssText = 'position:fixed;right:12px;bottom:12px;width:120px;height:120px;border-radius:50%;background:rgba(9,14,23,.82);backdrop-filter:blur(8px);border:1.5px solid rgba(6,182,212,.65);box-shadow:0 4px 16px rgba(0,0,0,0.6);z-index:2147483000;pointer-events:none;display:none';
      host.appendChild(w);
      RD.el = w;
      RD.dots = [];
      return true;
    }

    function rdDraw(g) {
      if (!RD.on) { if (RD.el) RD.el.style.display = 'none'; return; }
      if (!rdInit()) return;
      RD.el.style.display = 'block';
      var now = performance.now();
      if (now - RD.last < 50) return;
      RD.last = now;

      var s = g.P && g.P.s;
      if (!s || !s.mover || !s.mover.pos) return;
      var sx = s.mover.pos.x, sz = s.mover.pos.z, yaw = +s.yaw || 0, range = 60;
      var list = g.bots || [], idx = 0;

      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        if (!p || p === s || p.dead || !(p.hp > 0) || p.team === s.team) continue;
        var e = p.obj && p.obj.matrixWorld && p.obj.matrixWorld.elements;
        if (!e) continue;
        var dx = e[12] - sx, dz = e[14] - sz;
        if (Math.hypot(dx, dz) > range) continue;

        var ca = Math.cos(-yaw), sa = Math.sin(-yaw);
        var rx = dx * ca - dz * sa, rz = dx * sa + dz * ca;
        var cx = 60 + (rx / range) * 55, cz = 60 + (rz / range) * 55;

        var dot = RD.dots[idx];
        if (!dot) {
          dot = document.createElement('div');
          dot.style.cssText = 'position:absolute;width:5px;height:5px;margin:-2.5px 0 0 -2.5px;border-radius:50%;background:#f43f5e;box-shadow:0 0 5px #f43f5e';
          RD.el.appendChild(dot);
          RD.dots[idx] = dot;
        }
        dot.style.display = 'block';
        dot.style.left = cx.toFixed(1) + 'px';
        dot.style.top = cz.toFixed(1) + 'px';
        idx++;
      }
      for (; idx < RD.dots.length; idx++) RD.dots[idx].style.display = 'none';
    }

    var FC = { on: 0, el: null };
    function fcTick() {
      if (!FC.on) { if (FC.el) FC.el.style.display = 'none'; return; }
      if (!FC.el || !FC.el.parentNode) {
        var host = document.body || document.documentElement;
        if (!host) return;
        var w = document.createElement('div');
        w.setAttribute('data-pb', '1');
        w.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);border:1.5px dashed rgba(6,182,212,.85);border-radius:50%;z-index:2147482999;pointer-events:none;box-shadow:0 0 12px rgba(6,182,212,0.18)';
        host.appendChild(w);
        FC.el = w;
      }
      FC.el.style.display = 'block';
      var r = P.povCircleR;
      FC.el.style.width = (r * 2).toFixed(0) + 'px';
      FC.el.style.height = (r * 2).toFixed(0) + 'px';
    }

    var TR = { on: 0, wrap: null, slots: [], _v: null };
    function trClear() { for (var i = 0; i < TR.slots.length; i++) TR.slots[i].style.display = 'none'; }
    function trDraw(g) {
      if (!TR.on) { if (TR.wrap) trClear(); return; }
      var cam = g.camera, list = g.bots, self = g.P && g.P.s;
      if (!list || !cam || !self || self.dead) { trClear(); return; }

      if (!TR.wrap || !TR.wrap.parentNode) {
        var host = document.body || document.documentElement;
        if (!host) return;
        var w = document.createElement('div');
        w.setAttribute('data-pb', '1');
        w.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;overflow:hidden;pointer-events:none;z-index:2147482999';
        host.appendChild(w);
        TR.wrap = w;
        TR.slots = [];
      }

      var canvas = getGameCanvas();
      if (!canvas) { trClear(); return; }
      var r = canvas.getBoundingClientRect();
      if (!(r.width > 0)) { trClear(); return; }

      var ox = r.left + r.width / 2, oy = r.top;
      var my = self.team, idx = 0;

      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        if (!p || !p.obj || !p.c || p === self || p.team === my || p.dead || !(p.hp > 0)) continue;
        var hp = headPoint(p);
        if (!hp) continue;

        if (!TR._v) { try { TR._v = cam.position.clone(); } catch (e) { continue; } }
        var d = TR._v.set(hp.x, hp.y, hp.z).project(cam);
        if (!(d.z > -1 && d.z < 1)) continue;

        var tx = r.left + (d.x * 0.5 + 0.5) * r.width;
        var ty = r.top + (-d.y * 0.5 + 0.5) * r.height;
        if (tx < r.left - 40 || tx > r.left + r.width + 40 || ty < r.top - 40 || ty > r.top + r.height + 40) continue;

        var dx = tx - ox, dy = ty - oy, len = Math.hypot(dx, dy);
        if (len < 20) continue;

        var line = TR.slots[idx];
        if (!line) {
          line = document.createElement('div');
          line.style.cssText = 'position:absolute;left:0;top:0;height:1.5px;background:linear-gradient(90deg,rgba(6,182,212,.95),rgba(16,185,129,.35));transform-origin:0 50%;display:none;box-shadow:0 0 4px rgba(6,182,212,.6);border-radius:1px';
          TR.wrap.appendChild(line);
          TR.slots[idx] = line;
        }
        line.style.display = 'block';
        line.style.left = ox.toFixed(1) + 'px';
        line.style.top = oy.toFixed(1) + 'px';
        line.style.width = len.toFixed(1) + 'px';
        line.style.transform = 'rotate(' + (Math.atan2(dy, dx) * 180 / Math.PI).toFixed(2) + 'deg)';
        idx++;
      }
      for (; idx < TR.slots.length; idx++) TR.slots[idx].style.display = 'none';
    }

    /* --------------------------------------------------------------------------
       2.11 UNIFIED MAIN LOOP (rAF SCHEDULER)
       -------------------------------------------------------------------------- */
    var _timers = {
      wb: 0, esp: 0, bone: 0, tracer: 0, silentScan: 0, silentFire: 0,
      respawn: 0, trigger: 0, ammo: 0, dmg: 0, snade: 0
    };

    function mainLoop() {
      requestAnimationFrame(mainLoop);
      var now = performance.now();

      if (!G) {
        G = game();
        if (!G) return;
        st.G = true;
        log('G unlocked', V);
        buzz(30);
      }

      var g = G;
      var p = g.P;
      var self = p && p.s;
      var cam = g.camera;

      if (FLY.on) { try { flyTick(0.016); } catch (e) {} }
      if (FL.noclip) {
        try {
          ncInstall();
          if (self && self.mover && self.mover.pos && self.mover.pos.y < -50) {
            self.mover.pos.y = 5;
            self.mover.vy = 0;
          }
        } catch (e) {}
      } else if (NC.active) {
        ncUninstall();
      }
      try { gbTick(now); } catch (e) {}

      if (IR.on && now >= IR.at) {
        IR.at = now + 200;
        try { if (self && self.dead) self.dead = false; } catch (e) {}
      }

      if (p) {
        if (FL.noRecoil) {
          try {
            var r = p.rec;
            if (r) { r.v = 0; r.A = 0; r.t = 0; r.T = 0; r.hPend = 0; r.hRate = 0; r.hState = 0; }
            if (p.kick) p.kick = 0;
          } catch (e) {}
        }

        if (RF.on) {
          try {
            var w = p.W;
            if (w && !w.melee && !w.c4 && !w.grenade && (!RF.antiSpam || now - RF.lastFireAt >= RF.minGapMs)) {
              if (typeof p.nextShot === 'number' && p.nextShot > 0) p.nextShot = 0;
              if (typeof p.swapEnd === 'number' && p.swapEnd > 0) p.swapEnd = 0;
            }
          } catch (e) {}
        }

        if (IS.on) {
          try {
            if (p.fpActs && p.fpActs.zoom) p.fpActs.zoom.timeScale = 20;
            if (p.fpActs && p.fpActs.scope) p.fpActs.scope.timeScale = 20;
            if (typeof p.scopeT === 'number' && p.scopeT > 0 && p.scopeT < 0.2) p.scopeT = 0.05;
          } catch (e) {}
        }

        if (self && p.inv) {
          try {
            if (QC.invRef !== p.inv) { QC.invRef = p.inv; QC.gate = {}; QC.slot = p.slot; QC.ammo = p.ammo; }
            if (self.dead) {
              if (!QC.dead) { QC.dead = 1; QC.gate = {}; }
              QC.slot = p.slot; QC.ammo = p.ammo;
            } else {
              if (QC.dead) { QC.dead = 0; QC.gate = {}; QC.slot = p.slot; QC.ammo = p.ammo; }
              if (p.slot === QC.slot && typeof p.ammo === 'number' && QC.ammo >= 0 && p.ammo < QC.ammo) {
                QC.gate[p.slot] = +p.nextShot || 0;
                QC.n++;
              }
              if (p.slot !== QC.slot) {
                if (QC.on) {
                  p.swapEnd = 0;
                  p.nextShot = QC.fast ? 0 : (QC.gate[p.slot] || 0);
                  if (p.fpActs && p.fpActs.change) p.fpActs.change.timeScale = 8;
                  QC.sw++;
                }
                QC.slot = p.slot;
              }
              QC.ammo = p.ammo;
            }
          } catch (e) {}
        }
      }

      if (now - _timers.ammo >= 180) {
        _timers.ammo = now;
        try { nadeTick(); } catch (e) {}
        if (FL.infAmmo && p) {
          try {
            if (p.inv) {
              for (var k in p.inv) {
                var sInv = p.inv[k];
                if (sInv && typeof sInv === 'object' && (!sInv.w || !sInv.w.grenade) && typeof sInv.reserve === 'number') {
                  sInv.reserve = 999;
                }
              }
            }
            if (typeof p.extReserve === 'number') p.extReserve = 99;
            var wInf = p.W;
            if (wInf && !wInf.melee && !wInf.c4 && !wInf.grenade) {
              if (typeof p.ammo === 'number' && p.ammo !== 999) p.ammo = 999;
              if (typeof p.reserve === 'number' && p.reserve !== 999) p.reserve = 999;
            }
          } catch (e) {}
        }
      }

      if (now - _timers.dmg >= 500) {
        _timers.dmg = now;
        try {
          var wDmg = p && p.W;
          if (wDmg && !wDmg.melee && !wDmg.c4 && !wDmg.grenade && !wDmg.dmg && wDmg.damage > 0 && !wDmg.__pbD) {
            wDmg.damage = Math.round(wDmg.damage * DM.mult);
            wDmg.__pbD = 1;
          }
        } catch (e) {}
      }

      if (now - _timers.wb >= 1000) {
        _timers.wb = now;
        try { wbPatch(); } catch (e) {}
      }

      if (SN.on && now - _timers.snade >= SNB.interval) {
        _timers.snade = now;
        try { snScanAndHoming(g); } catch (e) {}
      }

      fcTick();
      if (RD.on) { try { rdDraw(g); } catch (e) {} } else if (RD.el) { RD.el.style.display = 'none'; }

      if (!E.on) {
        eClear();
      } else if (now - _timers.esp >= 33) {
        _timers.esp = now;
        if (eInit()) { try { eDraw(g); } catch (err) { eClear(); } }
      }

      if (now - _timers.bone >= 33) {
        _timers.bone = now;
        try { beDraw(g); } catch (e) { beClear(); }
      }

      if (TR.on && now - _timers.tracer >= 33) {
        _timers.tracer = now;
        try { trDraw(g); } catch (e) {}
      } else if (!TR.on && TR.wrap) {
        trClear();
      }

      if (SA.on) {
        if (now - _timers.silentScan >= 33) {
          _timers.silentScan = now;
          try {
            saUpdateHead(g);
            saPatch();
          } catch (e) {}
        }
        try { saFireStep(g); } catch (e) {}
      } else if (silentHolding) {
        releaseSilentFire(g);
      }

      if (!self || self.dead) {
        if (holding || silentHolding) up();
        lastPick = null;
        st.lock = 0;
        AB.target = null;
        AB.freshFire = 0;
        AIMLOCK.locked = false;
        return;
      }

      if (!self.__pbYawLocked) lockYawPitch(self);

      var m = cam.matrixWorld.elements;
      C.x = m[12]; C.y = m[13]; C.z = m[14];

      var yaw = +self.yaw || 0, pitch = +self.pitch || 0;
      var cp = Math.cos(pitch);
      F.x = -Math.sin(yaw) * cp;
      F.y = Math.sin(pitch);
      F.z = -Math.cos(yaw) * cp;

      if (TB.on && now >= _timers.trigger) {
        _timers.trigger = now + 40;
        try {
          var wTb = p && p.W;
          if (wTb && !wTb.melee && !wTb.grenade && !wTb.c4) {
            var origTb = { x: C.x, y: C.y, z: C.z };
            var dirTb = { x: F.x, y: F.y, z: F.z };
            var botsTb = g.bots || [];
            for (var ti = 0; ti < botsTb.length; ti++) {
              var bt = botsTb[ti];
              if (!isHumanEnemy(bt, self) || typeof bt.hitTest !== 'function') continue;
              var ht = hitTestSafe(bt, origTb, dirTb, 200);
              if (ht && ht.head && now >= nextTap && !holding) {
                down();
                holding = true;
                var hMs = 40 + Math.random() * 25;
                setTimeout(function () { if (holding) up(); }, hMs);
                nextTap = now + hMs + 80 + Math.random() * 60;
                break;
              }
            }
          }
        } catch (e) {}
      }

      var list = g.bots;
      var best = null, bestPt = null, bestA = 1e9, bestD = 1e9;
      var myTeam = self.team, n = 0, en = 0;

      for (var i = 0; i < list.length; i++) {
        var bot = list[i];
        if (!isBotReal(bot)) continue;
        n++;
        if (bot.team === myTeam || bot === self) continue;
        var hp = getTargetPointLead(bot, C);
        if (!hp) continue;
        var dx = hp.x - C.x, dy = hp.y - C.y, dz = hp.z - C.z;
        var d = Math.hypot(dx, dy, dz);
        if (d < 2 || d > P.reach) continue;
        en++;

        var ey = wrap(Math.atan2(-dx, -dz) - yaw);
        var ep = Math.asin(clamp(dy / d, -1, 1)) - pitch;
        var a = Math.hypot(ey, ep);
        if (a > P.cone || !canLockTarget(g, cam, bot, hp)) continue;

        var better = (P.mode === 'angle')
          ? (a < bestA)
          : (d < bestD - P.bias || (d <= bestD + P.bias && a < bestA));
        if (better) {
          bestA = a; bestD = d; best = bot;
          bestPt = { x: hp.x, y: hp.y, z: hp.z };
        }
      }
      st.bots = n;
      st.enemies = en;

      var doAimbot = false;
      var wantAcquire = P.aimbotOn && (AB.freshFire || (fireHeld > 0 && now >= AB.lockUntil));
      if (wantAcquire) {
        AB.freshFire = 0;
        var bestAb = null, bestAbD = 1e9;
        for (var j = 0; j < list.length; j++) {
          var q = list[j];
          if (!isBotReal(q) || q === self || q.team === myTeam) continue;
          var qp = getTargetPointLead(q, C);
          if (!qp) continue;
          var qd = Math.hypot(qp.x - C.x, qp.y - C.y, qp.z - C.z);
          if (qd >= 2 && qd <= P.reach && canAimbotTarget(g, cam, q, qp) && qd < bestAbD) {
            bestAbD = qd;
            bestAb = { bot: q, p: { x: qp.x, y: qp.y, z: qp.z } };
          }
        }
        if (bestAb) {
          AB.target = bestAb;
          AB.lockUntil = now + P.aimbotHoldMs;
          AB.lastShot = now;
        }
      }

      if (AB.target && now < AB.lockUntil) doAimbot = true;
      else AB.target = null;

      if (doAimbot && AB.target) {
        var curAp = getTargetPointLead(AB.target.bot, C) || AB.target.p;
        if (!canAimbotTarget(g, cam, AB.target.bot, curAp)) {
          AB.target = null; AB.lockUntil = 0; AIMLOCK.locked = false; st.aimbot = 0;
          aimFlush(g);
          return;
        }
        AB.target.p = { x: curAp.x, y: curAp.y, z: curAp.z };
        var ap = AB.target.p;
        var tYawAb = wrap(Math.atan2(-(ap.x - C.x), -(ap.z - C.z)));
        var tPitchAb = Math.asin(clamp((ap.y - C.y) / Math.max(0.001, Math.hypot(ap.x - C.x, ap.y - C.y, ap.z - C.z)), -1, 1));
        var rawY = self.__pbYawRaw != null ? self.__pbYawRaw : (+self.yaw || 0);
        var rawP = self.__pbPitchRaw != null ? self.__pbPitchRaw : (+self.pitch || 0);
        var k = clamp(P.aimbotGain * 0.7, 0.35, 1);

        AIMLOCK.on = true;
        AIMLOCK.locked = true;
        AIMLOCK.targetYaw = rawY + wrap(tYawAb - rawY) * k;
        AIMLOCK.targetPitch = rawP + (tPitchAb - rawP) * k;
        st.aimbot = 1;
      } else {
        st.aimbot = 0;
        if (!best || !aimOn) {
          AIMLOCK.locked = false; lastPick = null; st.lock = 0;
          if (holding && !silentHolding) up();
          aimFlush(g);
          return;
        }
        var tYaw = wrap(Math.atan2(-(bestPt.x - C.x), -(bestPt.z - C.z)));
        var tPitch = Math.asin(clamp((bestPt.y - C.y) / Math.max(0.001, bestD), -1, 1));
        var rawY2 = self.__pbYawRaw != null ? self.__pbYawRaw : (+self.yaw || 0);
        var rawP2 = self.__pbPitchRaw != null ? self.__pbPitchRaw : (+self.pitch || 0);
        var gainBase = (P.lockMode === 'pov') ? clamp(P.gain, 0.85, 1) : clamp(P.gain, 0.5, 1);

        AIMLOCK.on = true;
        AIMLOCK.locked = true;
        AIMLOCK.targetYaw = rawY2 + wrap(tYaw - rawY2) * gainBase;
        AIMLOCK.targetPitch = rawP2 + (tPitch - rawP2) * gainBase;
        st.err = bestA; st.dist = bestD; st.lock = 1; lastPick = best;
      }

      if (!(P.autoFire || fireHeld) || now < nextTap || holding) {
        if (P.aimbotOn && fireHeld > 0) AB.lastShot = now;
        aimFlush(g);
        return;
      }

      var fireTarget = (doAimbot && AB.target) ? AB.target.bot : best;
      var firePoint = (doAimbot && AB.target) ? AB.target.p : bestPt;
      if (!fireTarget || !firePoint) { aimFlush(g); return; }
      if (!doAimbot && !FL.wallbang && !hasLineOfSightThrottled(g, cam, fireTarget, firePoint)) { aimFlush(g); return; }

      var hit = null;
      try { hit = hitTestSafe(fireTarget, C, F, P.reach); } catch (e) {}
      if (!hit || (RF.on && !rfCanFire(now))) { aimFlush(g); return; }

      down();
      holding = true;
      RF.lastFireAt = now;

      var holdMs, gapMs;
      if (RF.on) {
        holdMs = 18 + Math.random() * 12;
        gapMs = RF.antiSpam ? (RF.minGapMs + Math.random() * 25) : (10 + Math.random() * 10);
      } else if (SF.on) {
        holdMs = 20 + Math.random() * 15;
        gapMs = 25 + Math.random() * 20;
      } else {
        holdMs = 45 + Math.random() * 30;
        gapMs = 90 + Math.random() * 70;
      }

      setTimeout(function () { if (holding && !silentHolding) up(); }, holdMs);
      nextTap = now + holdMs + gapMs;
      if (P.aimbotOn) AB.lastShot = now;
      aimFlush(g);
    }

    setInterval(function () {
      try { var g = G || game(); if (g) aimFlush(g); } catch (e) {}
    }, 8);

    setInterval(function () {
      try {
        var Bx = window.PBAndroid;
        var v = Bx && Bx.poll ? Bx.poll() : 0;
        if (v === 1) { aimOn = true; st.aim = true; buzz([20, 40, 20]); }
        else if (v === -1) { aimOn = false; st.aim = false; up(); buzz(60); }
      } catch (e) {}
    }, 120);

    /* --------------------------------------------------------------------------
       2.12 PUBLIC INTERNAL APIS (__pb, __pbvis, __pbqc, __pbx)
       -------------------------------------------------------------------------- */
    var PB_API = {
      state: function () {
        return {
          v: V, aim: aimOn, G: !!G, bots: st.bots, enemies: st.enemies, lock: st.lock,
          dist: +st.dist.toFixed(2), mode: P.mode, aimMode: P.aimMode,
          povCircleR: P.povCircleR, hitbox: P.hitbox,
          err: +(st.err * 57.2958).toFixed(2), fire: fireHeld, autoFire: P.autoFire,
          sens: O.sens, fov: O.fov, aimbot: P.aimbotOn, aimbotActive: st.aimbot,
          bulletSpeed: P.bulletSpeed, leadFactor: P.leadFactor, lockMode: P.lockMode
        };
      },
      cfg: function (o) { if (o) for (var k in o) if (k in P) P[k] = o[k]; return P; },
      on: function () { aimOn = true; st.aim = true; return 'on'; },
      off: function () { aimOn = false; st.aim = false; AIMLOCK.locked = false; up(); return 'off'; },
      aimMode: function () { P.aimMode = 'pov'; try { localStorage.setItem('ir_aimmode', 'pov'); } catch (e) {} return P.aimMode; },
      povCircle: function (v) { if (typeof v === 'number' && v >= 1) { P.povCircleR = v; try { localStorage.setItem('ir_povcirc', String(v)); } catch (e) {} } return P.povCircleR; },
      hitbox: function (v) { if (v === 'head' || v === 'body' || v === 'nearest') { P.hitbox = v; st.hitbox = v; try { localStorage.setItem('ir_hitbox', v); } catch (e) {} } return P.hitbox; },
      lockMode: function (m) {
        if (m === 'legacy' || m === 'pov') {
          P.lockMode = m; st.lockMode = m;
          try { localStorage.setItem('ir_lockmode', m); } catch (e) {}
          AIMLOCK.locked = false;
          _losCache = new WeakMap(); _povCache = new WeakMap(); _aimbotLosCache = new WeakMap();
        }
        return P.lockMode;
      },
      aimbot: function (on) {
        P.aimbotOn = on ? 1 : 0;
        if (!P.aimbotOn) { AB.target = null; AIMLOCK.locked = false; }
        _aimbotLosCache = new WeakMap();
        try { localStorage.setItem('ir_aimbot', P.aimbotOn ? '1' : '0'); } catch (e) {}
        return P.aimbotOn;
      },
      aimbotGain: function (v) { if (typeof v === 'number' && v > 0) { P.aimbotGain = v; try { localStorage.setItem('ir_aimbot_gain', String(v)); } catch (e) {} } return P.aimbotGain; },
      aimbotHold: function (v) { if (typeof v === 'number' && v >= 50) { P.aimbotHoldMs = v; try { localStorage.setItem('ir_aimbot_hold', String(v)); } catch (e) {} } return P.aimbotHoldMs; },
      bulletSpeed: function (v) { if (typeof v === 'number' && v > 0) { P.bulletSpeed = v; try { localStorage.setItem('ir_bullet_speed', String(v)); } catch (e) {} } return P.bulletSpeed; },
      leadFactor: function (v) { if (typeof v === 'number' && v >= 0) { P.leadFactor = v; try { localStorage.setItem('ir_lead', String(v)); } catch (e) {} } return P.leadFactor; },
      unlock: function () { AIMLOCK.locked = false; return 'unlocked'; }
    };

    var VIS_API = {
      on: function () { E.on = 1; return 'on'; },
      off: function () { E.on = 0; eClear(); return 'off'; },
      is: function () { return E.on; },
      name: function (on) { E.nameOn = on ? 1 : 0; return E.nameOn; },
      nameOn: function () { return E.nameOn; },
      dmg: function (m) { if (typeof m === 'number' && m >= 1 && m <= 3) DM.mult = m; return DM.mult; },
      bone: function (on, range) { BE.on = on ? 1 : 0; if (typeof range === 'number') BE.range = range; if (!on) beClear(); return { on: BE.on, range: BE.range }; }
    };

    var QC_API = {
      cfg: function (o) { if (o) for (var k in o) if (k === 'on' || k === 'fast') QC[k] = o[k]; return { on: QC.on, fast: QC.fast }; },
      on: function () { QC.on = 1; return 'on'; },
      off: function () { QC.on = 0; return 'off'; },
      swap: function () {
        try {
          var o = { code: 'KeyQ', key: 'KeyQ', bubbles: true, cancelable: true };
          window.dispatchEvent(new KeyboardEvent('keydown', o));
          window.dispatchEvent(new KeyboardEvent('keyup', o));
        } catch (e) {}
        return 'swap';
      },
      st: function () { return { v: V, on: QC.on, shots: QC.n, swaps: QC.sw, fast: QC.fast }; }
    };

    var PBX_API = {
      pred: function (on, ms) { PR.on = on ? 1 : 0; if (typeof ms === 'number') PR.ms = ms; return { on: PR.on, ms: PR.ms }; },
      rapid: function (on) { RF.on = on ? 1 : 0; return RF.on; },
      rapidAntiSpam: function (on) { RF.antiSpam = on ? 1 : 0; return RF.antiSpam; },
      instScope: function (on) { IS.on = on ? 1 : 0; return IS.on; },
      trig: function (on) { TB.on = on ? 1 : 0; return TB.on; },
      silent: function (on) {
        SA.on = on ? 1 : 0;
        if (!SA.on) { SA_HEAD.bot = null; releaseSilentFire(); }
        saPatch();
        return SA.on;
      },
      silentAutoShoot: function (on) {
        SA.autoShoot = on ? 1 : 0;
        if (!SA.autoShoot && !SA.tapShot) releaseSilentFire();
        return SA.autoShoot;
      },
      silentTapShot: function (on) {
        SA.tapShot = on ? 1 : 0;
        if (!SA.tapShot && !SA.autoShoot) releaseSilentFire();
        return SA.tapShot;
      },
      silentTarget: function (t) { if (t === 'head' || t === 'body') SA.target = t; return SA.target; },
      silentFov: function () { SA.fovRad = Math.PI * 2; return 360; },
      lob: function (on) { SL.on = on ? 1 : 0; return SL.on; },
      respawn: function (on) { IR.on = on ? 1 : 0; return IR.on; },
      radar: function (on) { RD.on = on ? 1 : 0; if (!on && RD.el) RD.el.style.display = 'none'; return RD.on; },
      hpo: function (on) { HPO.on = on ? 1 : 0; return HPO.on; },
      fovc: function (on) { FC.on = on ? 1 : 0; return FC.on; },
      tracer: function (on) { TR.on = on ? 1 : 0; if (!on) trClear(); return TR.on; },
      wallbang: function (on) { FL.wallbang = on ? 1 : 0; return FL.wallbang; },
      infAmmo: function (on) { FL.infAmmo = on ? 1 : 0; return FL.infAmmo; },
      noRecoil: function (on) { FL.noRecoil = on ? 1 : 0; return FL.noRecoil; },
      godmode: function (on) { FL.godmode = on ? 1 : 0; return FL.godmode; },
      noclip: function (on) { FL.noclip = on ? 1 : 0; if (!FL.noclip) ncUninstall(); else ncInstall(); return FL.noclip; },
      antiKick: function (on) { FL.antiKick = on ? 1 : 0; return FL.antiKick; },
      smoothFire: function (on) { SF.on = on ? 1 : 0; return SF.on; },
      fly: function (on) { return flyToggle(on); },
      flyMode: function (m) { if (m === 'jump' || m === 'hover') FLY.mode = m; return FLY.mode; },
      flyBypass: function (on) { FLYB.on = on ? 1 : 0; return FLYB.on; },
      noFall: function (on) { FL.noFall = on ? 1 : 0; return FL.noFall; },
      infNade: function (on) { FL.infNade = on ? 1 : 0; return FL.infNade; },
      infNadeMax: function (n) { if (typeof n === 'number' && n >= 1 && n <= 999) FL.infNadeMax = n | 0; return FL.infNadeMax; },
      infNadeSt: function () {
        var g = G || game();
        var out = { on: FL.infNade, max: FL.infNadeMax, count: NG.count, grenades: [] };
        try {
          var inv = g && g.P && g.P.inv;
          if (inv) for (var k in inv) {
            var s = inv[k];
            if (s && s.w && s.w.grenade) {
              out.grenades.push({ slot: +k, name: s.w.name || s.w.id, kind: s.w.kind, ammo: s.ammo, reserve: s.reserve });
            }
          }
        } catch (e) {}
        return out;
      },
      silentNade: function (on) { SN.on = on ? 1 : 0; return SN.on; },
      silentNadeSide: function (s) {
        if (s === 'enemy' || s === 'ally') { if (SN.side !== s) SN.pinnedNameBot = null; SN.side = s; }
        return SN.side;
      },
      silentNadeMode: function (m) {
        if (m === 'aim' || m === 'random' || m === 'name_order') { if (SN.mode !== m || m !== 'name_order') SN.pinnedNameBot = null; SN.mode = m; }
        return SN.mode;
      },
      silentNadeTarget: function (name) { SN.targetName = name ? String(name) : ''; SN.pinnedNameBot = null; return SN.targetName; },
      silentNadeTargets: function () {
        var g = G || game();
        if (!g || !g.bots || !g.P || !g.P.s) return [];
        var self = g.P.s, out = [], seen = {};
        for (var i = 0; i < g.bots.length; i++) {
          var p = g.bots[i];
          if (!snIsValidSide(p, self)) continue;
          var lbl = snBotLabel(p, i);
          if (!seen[lbl]) { seen[lbl] = 1; out.push(lbl); }
        }
        return out.sort(function (a, b) { return a.localeCompare(b, undefined, { sensitivity: 'base' }); });
      },
      silentNadeHoming: function (on) { SN.homing = on ? 1 : 0; return SN.homing; },
      silentNadeLOS: function (on) { SN.requireLOS = on ? 1 : 0; return SN.requireLOS; },
      silentNadeBypass: function (on) { SNB.on = on ? 1 : 0; return SNB.on; },
      silentNadeSt: function () {
        return {
          on: SN.on, side: SN.side, mode: SN.mode, targetName: SN.targetName,
          homing: SN.homing, nadeCount: SN.nadeCount, hasTarget: !!SN.lockedTarget,
          targetBotName: (SN.lockedTarget && SN.lockedTarget.bot && (SN.lockedTarget.bot.name || SN.lockedTarget.label)) || null,
          bypass: SNB.on
        };
      },
      st: function () {
        return {
          pred: PR.on, rapid: RF.on, rapidAntiSpam: RF.antiSpam,
          instScope: IS.on, trig: TB.on, silent: SA.on, silentAutoShoot: SA.autoShoot,
          silentTapShot: SA.tapShot, silentTarget: SA.target, silentFov: 360,
          lob: SL.on, respawn: IR.on, radar: RD.on, hpo: HPO.on, fovc: FC.on, tracer: TR.on,
          wallbang: FL.wallbang, infAmmo: FL.infAmmo, noRecoil: FL.noRecoil,
          godmode: FL.godmode, noclip: FL.noclip, antiKick: FL.antiKick,
          aimbot: P.aimbotOn, smoothFire: SF.on, bulletSpeed: P.bulletSpeed, leadFactor: P.leadFactor,
          lockMode: P.lockMode, flyOn: FLY.on, flyMode: FLY.mode, flyBypass: FLYB.on,
          noFall: FL.noFall, infNade: FL.infNade, infNadeMax: FL.infNadeMax,
          silentNade: SN.on, silentNadeSide: SN.side, silentNadeMode: SN.mode,
          silentNadeTarget: SN.targetName, silentNadeBypass: SNB.on, espName: E.nameOn,
          saHead: SA_HEAD.bot ? { x: +SA_HEAD.x.toFixed(2), y: +SA_HEAD.y.toFixed(2), z: +SA_HEAD.z.toFixed(2), name: SA_HEAD.bot.name, hp: SA_HEAD.bot.hp } : null
        };
      }
    };

    window.__pb = PB_API; HIDDEN.pb = PB_API;
    window.__pbvis = VIS_API; HIDDEN.pbvis = VIS_API;
    window.__pbqc = QC_API; HIDDEN.pbqc = QC_API;
    window.__pbx = PBX_API; HIDDEN.pbx = PBX_API;

    ['__pb', '__pbvis', '__pbnade', '__pbqc', '__pbx'].forEach(function (k) {
      try {
        var v = window[k];
        if (v) Object.defineProperty(window, k, { configurable: false, enumerable: false, get: function () { return v; } });
      } catch (e) {}
    });

    /* --------------------------------------------------------------------------
       2.13 SETTINGS PERSISTENCE
       -------------------------------------------------------------------------- */
    var SETTINGS_KEY = 'vanguard_settings_v3';
    function saveSettings() {
      try {
        var ps = PB_API.state();
        var xs = PBX_API.st();
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({
          version: 3, aim: ps.aim, povCircleR: ps.povCircleR, hitbox: ps.hitbox,
          aimbot: ps.aimbot, aimbotGain: P.aimbotGain, aimbotHoldMs: P.aimbotHoldMs,
          bulletSpeed: ps.bulletSpeed, leadFactor: ps.leadFactor, lockMode: ps.lockMode,
          autoFire: P.autoFire, invert: O.invert, flyOn: FLY.on, flyMode: FLY.mode,
          flyBypass: FLYB.on, noFall: FL.noFall, pred: xs.pred, predMs: PR.ms,
          rapid: xs.rapid, rapidAntiSpam: xs.rapidAntiSpam, instScope: xs.instScope,
          trig: xs.trig, silent: xs.silent, silentAutoShoot: SA.autoShoot,
          silentTapShot: SA.tapShot, silentTarget: xs.silentTarget, respawn: xs.respawn,
          radar: xs.radar, hpo: xs.hpo, fovc: xs.fovc, tracer: xs.tracer,
          wallbang: xs.wallbang, infAmmo: xs.infAmmo, noRecoil: xs.noRecoil,
          godmode: xs.godmode, noclip: xs.noclip, antiKick: xs.antiKick,
          smoothFire: xs.smoothFire, infNade: xs.infNade, infNadeMax: xs.infNadeMax,
          silentNade: SN.on, silentNadeSide: SN.side, silentNadeMode: SN.mode,
          silentNadeTarget: SN.targetName, silentNadeBypass: xs.silentNadeBypass,
          espName: xs.espName
        }));
      } catch (e) {}
    }

    (function restoreSettings() {
      var d;
      try { d = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null'); } catch (e) { d = null; }
      if (!d || d.version !== 3) return;
      try {
        if (d.aim != null) d.aim ? PB_API.on() : PB_API.off();
        if (d.povCircleR > 0) PB_API.povCircle(d.povCircleR);
        if (d.hitbox) PB_API.hitbox(d.hitbox);
        if (d.aimbot != null) PB_API.aimbot(d.aimbot);
        if (d.aimbotGain > 0) PB_API.aimbotGain(d.aimbotGain);
        if (d.aimbotHoldMs >= 50) PB_API.aimbotHold(d.aimbotHoldMs);
        if (d.bulletSpeed > 0) PB_API.bulletSpeed(d.bulletSpeed);
        if (d.leadFactor >= 0) PB_API.leadFactor(d.leadFactor);
        if (d.lockMode) PB_API.lockMode(d.lockMode);
        if (d.autoFire != null) P.autoFire = d.autoFire ? 1 : 0;
        if (d.invert != null) O.invert = !!d.invert;
        if (d.flyMode) PBX_API.flyMode(d.flyMode);
        if (d.flyBypass != null) PBX_API.flyBypass(d.flyBypass);
        if (d.noFall != null) PBX_API.noFall(d.noFall);

        var map = [
          'pred', 'rapid', 'rapidAntiSpam', 'instScope', 'trig', 'silent',
          'silentAutoShoot', 'silentTapShot', 'respawn', 'radar', 'hpo', 'fovc',
          'tracer', 'wallbang', 'infAmmo', 'noRecoil', 'godmode', 'noclip',
          'antiKick', 'smoothFire', 'infNade', 'silentNade', 'silentNadeBypass'
        ];
        map.forEach(function (k) {
          if (d[k] != null && typeof PBX_API[k] === 'function') PBX_API[k](d[k]);
        });

        if (d.silentTarget) PBX_API.silentTarget(d.silentTarget);
        if (d.silentNadeSide) PBX_API.silentNadeSide(d.silentNadeSide);
        if (d.silentNadeMode) PBX_API.silentNadeMode(d.silentNadeMode);
        if (d.silentNadeTarget != null) PBX_API.silentNadeTarget(d.silentNadeTarget);
        if (d.predMs != null) PBX_API.pred(!!d.pred, d.predMs);
        if (d.infNadeMax > 0) PBX_API.infNadeMax(d.infNadeMax);
        if (d.espName != null) VIS_API.name(d.espName);
      } catch (e) {}
    })();

    addEventListener('pagehide', saveSettings);
    addEventListener('beforeunload', saveSettings);
    setInterval(saveSettings, 2000);

    log(BRAND, V, 'up');
    requestAnimationFrame(mainLoop);

    /* ==========================================================================
3. UI SYSTEM (CYBER CYAN THEME & FULL DRAGGABLE PANEL)
       ========================================================================== */
    (function pbUI() {
      if (window.__pbUI) return;
      window.__pbUI = 1;

      if (!document.querySelector('link[data-fa]')) {
        var fa = document.createElement('link');
        fa.rel = 'stylesheet';
        fa.setAttribute('data-fa', '1');
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css';
        (document.head || document.documentElement).appendChild(fa);
      }

      var css = [
        '.fk{position:fixed;top:12px;right:14px;z-index:2147483600;font:11px/1.35 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#e2e8f0;',
        '  background:rgba(9,14,23,0.90);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(6,182,212,0.38);border-radius:12px;',
        '  box-shadow:0 12px 36px rgba(0,0,0,0.75),0 0 18px rgba(6,182,212,0.20),inset 0 1px 0 rgba(255,255,255,0.06);pointer-events:auto;user-select:none;touch-action:none;overflow:hidden}',
        '.fk:hover{border-color:rgba(34,211,238,0.6);box-shadow:0 16px 42px rgba(0,0,0,0.85),0 0 24px rgba(6,182,212,0.3)}',
        '.fk.expanded{display:flex;flex-direction:row}',
        '.fk.expanded .fk-rail{display:flex;flex-direction:column;background:rgba(5,9,16,0.82);border-right:1px solid rgba(6,182,212,0.2);width:44px;padding:6px 0;gap:3px;flex:0 0 44px;overflow-y:auto;max-height:86vh}',
        '.fk-rail::-webkit-scrollbar{width:2px}',
        '.fk-rail::-webkit-scrollbar-thumb{background:rgba(6,182,212,0.35);border-radius:2px}',
        '.fk.expanded .fk-body-col{width:262px;display:flex;flex-direction:column;min-width:0}',
        '.fk.expanded .fk-tabbar{display:none}',
        '.fk.collapsed{width:auto;border-radius:10px}',
        '.fk.collapsed .fk-rail,.fk.collapsed .fk-body-col{display:none}',
        '.fk.collapsed .fk-tabbar{display:flex;align-items:center;gap:8px;padding:6px 11px;cursor:grab;background:rgba(9,14,23,0.94)}',
        '.fk.collapsed .fk-tabbar:active{cursor:grabbing}',
        '.fk.collapsed .fk-tb-title{font:800 11px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#67e8f9;text-shadow:0 0 8px rgba(103,232,249,0.5);letter-spacing:.6px;white-space:nowrap}',
        '.fk.collapsed .fk-tb-title .dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#10b981;box-shadow:0 0 8px #10b981;margin-right:6px;vertical-align:middle}',
        '.fk-tb-open{width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff;cursor:pointer;background:linear-gradient(135deg,#0891b2,#10b981);box-shadow:0 0 8px rgba(6,182,212,0.5);font-weight:900;flex:0 0 22px}',
        '.fk-tb-open:hover{transform:scale(1.08)}',
        '.fk-rail-btn{width:36px;height:34px;margin:0 auto;border-radius:7px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;color:#94a3b8;cursor:pointer;transition:all .15s;flex:0 0 34px}',
        '.fk-rail-btn i{font-size:11px}',
        '.fk-rail-btn span{font-size:6.5px;font-weight:800;letter-spacing:.3px}',
        '.fk-rail-btn:hover{background:rgba(6,182,212,0.18);color:#67e8f9}',
        '.fk-rail-btn.on{background:linear-gradient(135deg,#0891b2 0%,#10b981 100%);color:#fff;box-shadow:0 0 12px rgba(6,182,212,0.55)}',
        '.fk-h{display:flex;align-items:center;gap:6px;padding:7px 10px;border-bottom:1px solid rgba(6,182,212,0.2);background:rgba(12,19,31,0.9);font-weight:700;cursor:grab}',
        '.fk-h:active{cursor:grabbing}',
        '.fk-h .dot{width:7px;height:7px;border-radius:50%;background:#10b981;box-shadow:0 0 8px #10b981;flex:0 0 7px}',
        '.fk-h .title{font-size:11.5px;font-weight:800;color:#67e8f9;text-shadow:0 0 10px rgba(103,232,249,0.45);letter-spacing:.5px}',
        '.fk-h .v{font-weight:600;font-size:9px;margin-left:auto;color:#38bdf8;font-family:monospace}',
        '.fk-toggle{cursor:pointer;margin-left:4px;color:#fff;border-radius:5px;width:20px;height:20px;display:flex;align-items:center;justify-content:center;flex:0 0 20px;font-size:10px;background:rgba(6,182,212,0.25);border:1px solid rgba(6,182,212,0.4)}',
        '.fk-toggle:hover{background:#0891b2}',
        '.fk-body{padding:7px 10px 10px;max-height:56vh;overflow-y:auto}',
        '.fk-body::-webkit-scrollbar{width:3px}',
        '.fk-body::-webkit-scrollbar-thumb{background:rgba(6,182,212,0.4);border-radius:2px}',
        '.fk-page{display:none}.fk-page.on{display:block}',
        '.fk-sec{margin:8px 0 4px;font-size:9px;letter-spacing:1px;color:#38bdf8;text-transform:uppercase;font-weight:800;display:flex;align-items:center;gap:5px}',
        '.fk-sec:first-child{margin-top:0}.fk-sec i{color:#10b981}',
        '.fk-row{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:3.5px 0;border-bottom:1px solid rgba(255,255,255,0.04)}',
        '.fk-row label{flex:1;color:#f1f5f9;font-size:11px;font-weight:500}',
        '.fk-row small{display:block;color:#94a3b8;font-size:8.5px;margin-top:1px}',
        '.risk-badge{display:inline-block;padding:0 4px;margin-left:4px;border-radius:3px;font-size:7px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;font-weight:900}',
        '.new-badge{display:inline-block;padding:0 4px;margin-left:4px;border-radius:3px;font-size:7px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;font-weight:900}',
        '.fk-sw{position:relative;width:30px;height:16px;flex:0 0 30px;border-radius:9px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.1);transition:all .15s;cursor:pointer}',
        '.fk-sw::after{content:"";position:absolute;top:1px;left:1px;width:12px;height:12px;border-radius:50%;background:#94a3b8;transition:transform .15s,background .15s}',
        '.fk-sw.on{background:linear-gradient(135deg,#0891b2,#10b981);border-color:rgba(34,211,238,0.65);box-shadow:0 0 10px rgba(6,182,212,0.5)}',
        '.fk-sw.on::after{transform:translateX(14px);background:#fff}',
        '.fk-slider{display:flex;align-items:center;gap:6px;padding:3px 0}',
        '.fk-slider label{flex:0 0 76px;font-size:9.5px;color:#cbd5e1}',
        '.fk-slider input[type=range]{flex:1;height:3px;-webkit-appearance:none;background:rgba(255,255,255,0.16);border-radius:2px;outline:none}',
        '.fk-slider input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;border-radius:50%;background:#22d3ee;box-shadow:0 0 8px #06b6d4;cursor:pointer}',
        '.fk-slider .n{flex:0 0 40px;text-align:right;font-size:9px;color:#67e8f9;font-weight:700}',
        '.fk-select{width:100%;box-sizing:border-box;padding:4px 7px;border:1px solid rgba(6,182,212,0.35);border-radius:6px;font:11px sans-serif;outline:none;background:rgba(15,23,42,0.9);color:#f1f5f9;cursor:pointer;margin-top:2px}',
        '.fk-select:focus{border-color:#22d3ee}',
        '.fk-btns{display:flex;gap:5px;margin-top:6px}',
        '.fk-btn{flex:1;padding:5px 0;text-align:center;border-radius:6px;background:rgba(15,23,42,0.85);border:1px solid rgba(6,182,212,0.35);color:#cbd5e1;cursor:pointer;font-size:10px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:4px}',
        '.fk-btn:hover{background:rgba(6,182,212,0.22);border-color:#22d3ee;color:#fff}',
        '.fk-btn.danger{border-color:rgba(244,63,94,0.45);background:rgba(244,63,94,0.15);color:#fda4af}',
        '.fk-btn.danger:hover{background:rgba(244,63,94,0.32);color:#fff}',
        '.fk-foot{margin-top:6px;padding-top:5px;border-top:1px solid rgba(6,182,212,0.2);font-size:8.5px;color:#94a3b8}',
        '.fk-warn{margin-top:5px;padding:4px 6px;border-radius:5px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.35);color:#fde047;font-size:8.5px}',
        '.fk-sa-tgt,.fk-nade-st{font-size:8.5px;color:#6ee7b7;padding:3px 6px;margin-top:4px;background:rgba(16,185,129,0.14);border-radius:4px;border:1px solid rgba(16,185,129,0.35)}'
      ].join('');

      var style = document.createElement('style');
      style.setAttribute('data-pb', '1');
      style.textContent = css;
      (document.head || document.documentElement).appendChild(style);

      function el(tag, cls, txt) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (txt != null) e.textContent = txt;
        return e;
      }

      function toggle(initial, onChange) {
        var sw = el('div', 'fk-sw' + (initial ? ' on' : ''));
        var state = !!initial;
        sw.addEventListener('click', function () {
          state = !state;
          sw.classList.toggle('on', state);
          try { onChange(state); } catch (e) {}
          saveSettings();
          refreshFoot();
        });
        return { node: sw, set: function (v) { state = !!v; sw.classList.toggle('on', state); } };
      }

      function slider(min, max, step, val, labelTxt, fmt, onChange) {
        var wrap = el('div', 'fk-slider');
        var lb = el('label', null, labelTxt);
        var inp = document.createElement('input');
        inp.type = 'range'; inp.min = min; inp.max = max; inp.step = step; inp.value = val;
        var num = el('div', 'n', fmt(val));
        wrap.appendChild(lb); wrap.appendChild(inp); wrap.appendChild(num);
        inp.addEventListener('input', function () {
          var v = parseFloat(inp.value);
          num.textContent = fmt(v);
          try { onChange(v); } catch (e) {}
          saveSettings();
        });
        return { node: wrap, set: function (v) { inp.value = v; num.textContent = fmt(v); } };
      }

      function row(label, node, smallTxt, badgeType) {
        var r = el('div', 'fk-row');
        var lb = el('label', null, label);
        if (badgeType === 'risk') lb.appendChild(el('span', 'risk-badge', 'RISK'));
        if (badgeType === 'new') lb.appendChild(el('span', 'new-badge', 'NEW'));
        if (smallTxt) lb.appendChild(el('small', null, smallTxt));
        r.appendChild(lb); r.appendChild(node);
        return r;
      }

      function sec(icon, text) {
        var s = el('div', 'fk-sec');
        s.innerHTML = '<i class="fa-solid ' + icon + '"></i> ' + text;
        return s;
      }

      var panel = el('div', 'fk expanded');
      panel.setAttribute('data-pb', '1');

      var rail = el('div', 'fk-rail');
      var bodyCol = el('div', 'fk-body-col');
      var head = el('div', 'fk-h');
      head.appendChild(el('div', 'dot'));
      head.appendChild(el('div', 'title', 'VANGUARD ELITE'));
      head.appendChild(el('div', 'v', 'V' + V));

      var toggleBtn = el('div', 'fk-toggle');
      toggleBtn.innerHTML = '<i class="fa-solid fa-minus"></i>';
      toggleBtn.title = 'Minimize';
      head.appendChild(toggleBtn);

      var body = el('div', 'fk-body');
      bodyCol.appendChild(head);
      bodyCol.appendChild(body);

      var tabbar = el('div', 'fk-tabbar');
      var tbTitle = el('div', 'fk-tb-title');
      tbTitle.innerHTML = '<span class="dot"></span>VANGUARD ELITE';
      tabbar.appendChild(tbTitle);

      var tbOpen = el('div', 'fk-tb-open', '+');
      tbOpen.title = 'Buka menu';
      tabbar.appendChild(tbOpen);

      panel.appendChild(rail);
      panel.appendChild(bodyCol);
      panel.appendChild(tabbar);

      function setCollapsed(collapsed) {
        panel.classList.toggle('collapsed', collapsed);
        panel.classList.toggle('expanded', !collapsed);
        try { localStorage.setItem('vanguard_collapsed', collapsed ? '1' : '0'); } catch (e) {}
      }

      toggleBtn.addEventListener('click', function (e) { e.stopPropagation(); setCollapsed(true); });
      tbOpen.addEventListener('click', function (e) { e.stopPropagation(); setCollapsed(false); });

      (function makeDraggable() {
        var dragging = false, moved = false, startX = 0, startY = 0, origLeft = 0, origTop = 0;

        function onStart(clientX, clientY, target) {
          if (target === toggleBtn || toggleBtn.contains(target) || target === tbOpen || tbOpen.contains(target)) return;
          dragging = true;
          moved = false;
          var r = panel.getBoundingClientRect();
          startX = clientX;
          startY = clientY;
          origLeft = r.left;
          origTop = r.top;
        }

        function onMove(clientX, clientY) {
          if (!dragging) return;
          var dx = clientX - startX;
          var dy = clientY - startY;
          if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
          var maxX = Math.max(8, innerWidth - panel.offsetWidth - 4);
          var maxY = Math.max(8, innerHeight - panel.offsetHeight - 4);
          var nx = clamp(origLeft + dx, 4, maxX);
          var ny = clamp(origTop + dy, 4, maxY);
          panel.style.left = nx + 'px';
          panel.style.top = ny + 'px';
          panel.style.right = 'auto';
        }

        function onEnd() {
          if (!dragging) return;
          dragging = false;
          if (moved) {
            try {
              localStorage.setItem('vanguard_pos', JSON.stringify({ left: panel.style.left, top: panel.style.top }));
            } catch (e) {}
          }
        }

        [head, tabbar].forEach(function (handle) {
          handle.addEventListener('mousedown', function (e) { onStart(e.clientX, e.clientY, e.target); });
          handle.addEventListener('touchstart', function (e) {
            if (e.touches && e.touches[0]) onStart(e.touches[0].clientX, e.touches[0].clientY, e.target);
          }, { passive: true });
        });

        addEventListener('mousemove', function (e) { onMove(e.clientX, e.clientY); });
        addEventListener('touchmove', function (e) {
          if (dragging && e.touches && e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });
        addEventListener('mouseup', onEnd);
        addEventListener('touchend', onEnd);

        try {
          var savedPos = JSON.parse(localStorage.getItem('vanguard_pos') || 'null');
          if (savedPos && savedPos.left && savedPos.top) {
            panel.style.left = savedPos.left;
            panel.style.top = savedPos.top;
            panel.style.right = 'auto';
          }
        } catch (e) {}
      })();

      var TAB_META = {
        aim:    { icon: 'fa-crosshairs',    label: 'AIM',    title: 'Aim Lock' },
        aimbot: { icon: 'fa-bullseye',      label: 'AIMBOT', title: 'Aimbot' },
        esp:    { icon: 'fa-eye',           label: 'ESP',    title: 'ESP' },
        silent: { icon: 'fa-crosshairs',    label: 'SILENT', title: 'Silent Aim' },
        shoot:  { icon: 'fa-gun',           label: 'SHOOT',  title: 'Shooting' },
        combat: { icon: 'fa-shield-halved', label: 'COMBAT', title: 'Combat' },
        fly:    { icon: 'fa-plane',         label: 'FLY',    title: 'Fly' },
        noclip: { icon: 'fa-ghost',         label: 'NOCLIP', title: 'Noclip' },
        nade:   { icon: 'fa-bomb',          label: 'NADE',   title: 'Grenade' },
        move:   { icon: 'fa-feather',       label: 'MOVE',   title: 'Movement' },
        misc:   { icon: 'fa-sliders',       label: 'MISC',   title: 'Misc' },
        info:   { icon: 'fa-circle-info',   label: 'INFO',   title: 'Info' }
      };

      var TAB_KEY = 'ir_ui_tab';
      var tabsRail = {}, pages = {}, order = [];

      function addTab(key, label) {
        var meta = TAB_META[key] || { icon: 'fa-circle', label: label, title: label };
        var tR = el('div', 'fk-rail-btn');
        tR.innerHTML = '<i class="fa-solid ' + meta.icon + '"></i><span>' + meta.label + '</span>';
        tR.title = meta.title;
        tR.addEventListener('click', function () { selectTab(key); });
        rail.appendChild(tR);
        tabsRail[key] = tR;

        var p = el('div', 'fk-page');
        body.appendChild(p);
        pages[key] = p;
        order.push(key);
        return p;
      }

      function selectTab(key) {
        order.forEach(function (k) {
          tabsRail[k].classList.toggle('on', k === key);
          pages[k].classList.toggle('on', k === key);
        });
        try { localStorage.setItem(TAB_KEY, key); } catch (e) {}
      }

      var pAim = addTab('aim', 'AIM');
      pAim.appendChild(sec('fa-crosshairs', 'Mode Aim Lock'));
      var lockModeSel = el('select', 'fk-select');
      lockModeSel.innerHTML = '<option value="pov">POV Circle</option><option value="legacy">Legacy Cone</option>';
      lockModeSel.value = P.lockMode;
      lockModeSel.addEventListener('change', function () { PB_API.lockMode(this.value); saveSettings(); });
      pAim.appendChild(lockModeSel);

      pAim.appendChild(sec('fa-bullseye', 'Titik Tembak'));
      var hitboxSelect = el('select', 'fk-select');
      hitboxSelect.innerHTML = '<option value="head">Head</option><option value="body">Body</option><option value="nearest">Nearest</option>';
      hitboxSelect.value = P.hitbox;
      hitboxSelect.addEventListener('change', function () { PB_API.hitbox(this.value); saveSettings(); });
      pAim.appendChild(hitboxSelect);

      pAim.appendChild(sec('fa-rocket', 'Lead Prediction'));
      var bsS = slider(100, 800, 10, P.bulletSpeed, 'Bullet speed', function (v) { return v.toFixed(0) + 'm/s'; }, function (v) { PB_API.bulletSpeed(v); });
      pAim.appendChild(bsS.node);
      var lfS = slider(0, 2, 0.05, P.leadFactor, 'Lead factor', function (v) { return 'x' + v.toFixed(2); }, function (v) { PB_API.leadFactor(v); });
      pAim.appendChild(lfS.node);

      pAim.appendChild(sec('fa-lock', 'Aim Lock'));
      var aimT = toggle(!!PB_API.state().aim, function (on) { on ? PB_API.on() : PB_API.off(); });
      pAim.appendChild(row('Aim lock', aimT.node, 'Auto aim ke target'));
      var autoFireT = toggle(!!P.autoFire, function (on) { P.autoFire = on ? 1 : 0; });
      pAim.appendChild(row('Auto fire', autoFireT.node, 'Tembak otomatis saat lock'));
      var invertT = toggle(!!O.invert, function (on) { O.invert = on; });
      pAim.appendChild(row('Invert Y', invertT.node, 'Balik arah vertikal'));

      var pAb = addTab('aimbot', 'AIMBOT');
      pAb.appendChild(sec('fa-bullseye', 'Aimbot'));
      var aimbotT = toggle(!!P.aimbotOn, function (on) { PB_API.aimbot(on); });
      pAb.appendChild(row('Enable aimbot', aimbotT.node, 'Snap saat fire + wajib POV', 'risk'));
      var abGainS = slider(0.5, 3.0, 0.05, P.aimbotGain, 'Snap speed', function (v) { return 'x' + v.toFixed(2); }, function (v) { PB_API.aimbotGain(v); });
      pAb.appendChild(abGainS.node);
      var abHoldS = slider(50, 800, 10, P.aimbotHoldMs, 'Lock duration', function (v) { return v.toFixed(0) + 'ms'; }, function (v) { PB_API.aimbotHold(v); });
      pAb.appendChild(abHoldS.node);

      pAb.appendChild(sec('fa-circle-notch', 'POV Circle'));
      var fcT = toggle(!!FC.on, function (on) { PBX_API.fovc(on); });
      pAb.appendChild(row('Show circle', fcT.node, 'Ring POV'));
      var povCircleS = slider(1, 1500, 1, P.povCircleR, 'Circle size', function (v) { return v.toFixed(0) + 'px'; }, function (v) { PB_API.povCircle(v); });
      pAb.appendChild(povCircleS.node);

      var pEsp = addTab('esp', 'ESP');
      pEsp.appendChild(sec('fa-layer-group', 'Overlay'));
      var espT = toggle(!!VIS_API.is(), function (on) { on ? VIS_API.on() : VIS_API.off(); });
      pEsp.appendChild(row('Enemy ESP', espT.node, 'Box + HP bar'));
      var espNameT = toggle(!!E.nameOn, function (on) { VIS_API.name(on); });
      pEsp.appendChild(row('ESP name', espNameT.node, 'Nama di atas box', 'new'));
      var boneT = toggle(!!BE.on, function (on) { VIS_API.bone(on, BE.range); });
      pEsp.appendChild(row('Bone ESP', boneT.node, 'Skeleton musuh', 'risk'));
      var boneRangeS = slider(20, 120, 5, BE.range, 'Bone range', function (v) { return v + 'm'; }, function (v) { BE.range = v; if (BE.on) VIS_API.bone(1, v); });
      pEsp.appendChild(boneRangeS.node);
      var hpoT = toggle(!!HPO.on, function (on) { PBX_API.hpo(on); });
      pEsp.appendChild(row('HP overlay', hpoT.node, 'Angka HP'));
      var rdT = toggle(!!RD.on, function (on) { PBX_API.radar(on); });
      pEsp.appendChild(row('Radar mini', rdT.node, 'Minimap musuh'));
      var trT = toggle(!!TR.on, function (on) { PBX_API.tracer(on); });
      pEsp.appendChild(row('ESP tracer', trT.node, 'Garis ke musuh'));

      pEsp.appendChild(sec('fa-heart-pulse', 'Damage'));
      var dmgS = slider(1.0, 3.0, 0.05, DM.mult, 'Damage', function (v) { return 'x' + v.toFixed(2); }, function (v) { VIS_API.dmg(v); });
      pEsp.appendChild(dmgS.node);

      var pSil = addTab('silent', 'SILENT');
      pSil.appendChild(sec('fa-crosshairs', 'Silent Aim 360°'));
      var saT = toggle(!!SA.on, function (on) { PBX_API.silent(on); });
      pSil.appendChild(row('Silent aim 360°', saT.node, 'Lawan hidup, non-bot', 'risk'));
      var saAutoT = toggle(!!SA.autoShoot, function (on) { PBX_API.silentAutoShoot(on); });
      pSil.appendChild(row('Auto shoot hold (360°)', saAutoT.node, 'Tahan tembak terus selama ada target', 'new'));
      var saTapT = toggle(!!SA.tapShot, function (on) { PBX_API.silentTapShot(on); });
      pSil.appendChild(row('Auto tap 360°', saTapT.node, 'Tap-tap cepat (semua senjata)', 'new'));

      var saHeadT, saBodyT;
      saHeadT = toggle(SA.target !== 'body', function (on) {
        if (on) { PBX_API.silentTarget('head'); if (saBodyT) saBodyT.set(false); }
        else if (SA.target === 'head') { PBX_API.silentTarget('body'); if (saBodyT) saBodyT.set(true); }
      });
      saBodyT = toggle(SA.target === 'body', function (on) {
        if (on) { PBX_API.silentTarget('body'); if (saHeadT) saHeadT.set(false); }
        else if (SA.target === 'body') { PBX_API.silentTarget('head'); if (saHeadT) saHeadT.set(true); }
      });
      pSil.appendChild(row('Target Head', saHeadT.node, 'Silent aim ke kepala'));
      pSil.appendChild(row('Target Body', saBodyT.node, 'Silent aim ke badan'));

      var saTgt = el('div', 'fk-sa-tgt', 'target: —');
      pSil.appendChild(saTgt);
      var tbT = toggle(!!TB.on, function (on) { PBX_API.trig(on); });
      pSil.appendChild(row('Auto trigger', tbT.node, 'Tembak saat crosshair pas', 'risk'));

      pSil.appendChild(sec('fa-bullseye', 'Prediction'));
      var predT = toggle(!!PR.on, function (on) { PBX_API.pred(on, PR.ms); });
      pSil.appendChild(row('Prediction (lead)', predT.node, 'Aim ke depan target', 'risk'));
      var predS = slider(0, 400, 10, PR.ms, 'Lead time', function (v) { return v.toFixed(0) + 'ms'; }, function (v) { PR.ms = v; if (PR.on) PBX_API.pred(1, v); });
      pSil.appendChild(predS.node);

      var pShoot = addTab('shoot', 'SHOOT');
      pShoot.appendChild(sec('fa-gun', 'Fire Rate'));
      var sfT = toggle(!!SF.on, function (on) { PBX_API.smoothFire(on); });
      pShoot.appendChild(row('Smooth fire', sfT.node, 'Anti macet'));
      var rapidT = toggle(!!RF.on, function (on) { PBX_API.rapid(on); });
      pShoot.appendChild(row('Rapid fire', rapidT.node, 'Hilangkan jeda tembak', 'risk'));
      var rfSpamT = toggle(!!RF.antiSpam, function (on) { PBX_API.rapidAntiSpam(on); });
      pShoot.appendChild(row('RF anti-spam pace', rfSpamT.node, 'Jeda aman cegah deteksi', 'new'));
      var isT2 = toggle(!!IS.on, function (on) { PBX_API.instScope(on); });
      pShoot.appendChild(row('Instant scope', isT2.node, 'Scope cepat', 'risk'));

      var pCombat = addTab('combat', 'COMBAT');
      pCombat.appendChild(sec('fa-shield-halved', 'Weapon'));
      var wallT = toggle(!!FL.wallbang, function (on) { PBX_API.wallbang(on); });
      pCombat.appendChild(row('Wallbang', wallT.node, 'Tembus dinding', 'risk'));
      var ammoT = toggle(!!FL.infAmmo, function (on) { PBX_API.infAmmo(on); });
      pCombat.appendChild(row('Infinite ammo', ammoT.node, 'Amunisi tak terbatas', 'risk'));
      var nrecT = toggle(!!FL.noRecoil, function (on) { PBX_API.noRecoil(on); });
      pCombat.appendChild(row('No recoil', nrecT.node, 'Tanpa hentakan', 'risk'));

      var pFly = addTab('fly', 'FLY');
      pFly.appendChild(sec('fa-plane', 'Fly'));
      var flyT = toggle(!!FLY.on, function (on) { flyT.set(!!PBX_API.fly(on)); });
      pFly.appendChild(row('Fly', flyT.node, 'Space = naik · Ctrl/C = turun', 'risk'));
      var flyBypassT = toggle(!!FLYB.on, function (on) { PBX_API.flyBypass(on); });
      pFly.appendChild(row('Fly bypass', flyBypassT.node, 'Anti deteksi fly', 'risk'));
      var flyModeSel = el('select', 'fk-select');
      flyModeSel.innerHTML = '<option value="hover">Hover stabil</option><option value="jump">Jump legacy</option>';
      flyModeSel.value = FLY.mode;
      flyModeSel.addEventListener('change', function () { PBX_API.flyMode(this.value); saveSettings(); });
      pFly.appendChild(flyModeSel);

      var pNc = addTab('noclip', 'NOCLIP');
      pNc.appendChild(sec('fa-ghost', 'Noclip'));
      var ncT = toggle(!!FL.noclip, function (on) { PBX_API.noclip(on); });
      pNc.appendChild(row('Noclip (real)', ncT.node, 'Menembus objek & dinding', 'risk'));

      var pNade = addTab('nade', 'NADE');
      pNade.appendChild(sec('fa-bomb', 'Silent Nade'));
      var snadeT = toggle(!!SN.on, function (on) { PBX_API.silentNade(on); });
      pNade.appendChild(row('Silent nade', snadeT.node, 'Granat mengejar target', 'risk'));

      var snadeSideSel = el('select', 'fk-select');
      snadeSideSel.innerHTML = '<option value="enemy">Sisi: Lawan</option><option value="ally">Sisi: Kawan</option>';
      snadeSideSel.value = SN.side;
      snadeSideSel.addEventListener('change', function () {
        PBX_API.silentNadeSide(this.value);
        saveSettings();
        refreshSnadeTargets();
      });
      pNade.appendChild(snadeSideSel);

      var snadeModeSel = el('select', 'fk-select');
      snadeModeSel.innerHTML =
        '<option value="aim">Mode: Dekat Aim</option>' +
        '<option value="name_order">Mode: Lock Nama Pilihan</option>' +
        '<option value="random">Mode: Random</option>';
      snadeModeSel.value = SN.mode;
      snadeModeSel.addEventListener('change', function () { PBX_API.silentNadeMode(this.value); saveSettings(); });
      pNade.appendChild(snadeModeSel);

      var snadeTargetSel = el('select', 'fk-select');
      snadeTargetSel.innerHTML = '<option value="">Pilih Nama Target: Auto Pertama</option>';
      snadeTargetSel.addEventListener('change', function () { PBX_API.silentNadeTarget(this.value); saveSettings(); });
      pNade.appendChild(snadeTargetSel);

      function escHtml(str) {
        return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
      }

      function refreshSnadeTargets() {
        var names = PBX_API.silentNadeTargets();
        var prevVal = snadeTargetSel.value || SN.targetName || '';
        var html = '<option value="">Pilih Nama Target: Auto Pertama</option>';
        for (var i = 0; i < names.length; i++) {
          var esc = escHtml(names[i]);
          html += '<option value="' + esc + '">' + esc + '</option>';
        }
        snadeTargetSel.innerHTML = html;
        if (prevVal && names.indexOf(prevVal) >= 0) {
          snadeTargetSel.value = prevVal;
        } else if (prevVal) {
          var keepEsc = escHtml(prevVal);
          snadeTargetSel.innerHTML += '<option value="' + keepEsc + '">' + keepEsc + ' (offline)</option>';
          snadeTargetSel.value = prevVal;
        }
      }
      setInterval(refreshSnadeTargets, 1200);

      var snadeBypassT = toggle(!!SNB.on, function (on) { PBX_API.silentNadeBypass(on); });
      pNade.appendChild(row('Nade bypass', snadeBypassT.node, 'Anti deteksi nade', 'risk'));
      var snadeHomeT = toggle(!!SN.homing, function (on) { PBX_API.silentNadeHoming(on); });
      pNade.appendChild(row('Homing', snadeHomeT.node, 'Teleport tiap frame', 'risk'));
      var snadeLosT = toggle(!!SN.requireLOS, function (on) { PBX_API.silentNadeLOS(on); });
      pNade.appendChild(row('Require LOS', snadeLosT.node, 'Hanya target terlihat', 'risk'));
      var snadeStat = el('div', 'fk-sa-tgt', 'snade: off');
      pNade.appendChild(snadeStat);

      pNade.appendChild(sec('fa-bomb', 'Unlimited Grenade'));
      var infNadeT = toggle(!!FL.infNade, function (on) { PBX_API.infNade(on); });
      pNade.appendChild(row('Unlimited Grenade', infNadeT.node, 'Semua granat tak habis', 'new'));
      var infNadeMaxS = slider(1, 999, 1, FL.infNadeMax, 'Max ammo', function (v) { return v.toFixed(0) + 'x'; }, function (v) { PBX_API.infNadeMax(v); });
      pNade.appendChild(infNadeMaxS.node);
      var infNadeSt = el('div', 'fk-nade-st', 'memuat…');
      pNade.appendChild(infNadeSt);

      var pMove = addTab('move', 'MOVE');
      pMove.appendChild(sec('fa-feather', 'Survival'));
      var noFallT = toggle(!!FL.noFall, function (on) { PBX_API.noFall(on); });
      pMove.appendChild(row('No fall damage', noFallT.node, 'Kebal jatuh dari ketinggian'));

      var pMisc = addTab('misc', 'MISC');
      pMisc.appendChild(sec('fa-right-left', 'Quick Swap'));
      var qcT = toggle(!!QC_API.st().on, function (on) { on ? QC_API.on() : QC_API.off(); });
      pMisc.appendChild(row('Quick swap', qcT.node, 'Ganti senjata instan'));
      var qcFastT = toggle(!!QC_API.st().fast, function (on) { QC_API.cfg({ fast: on ? 1 : 0 }); });
      pMisc.appendChild(row('Instant swap', qcFastT.node, 'Skip animasi ganti senjata'));

      var swapBtn = el('div', 'fk-btn');
      swapBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Swap (Q)';
      swapBtn.addEventListener('click', function () { QC_API.swap(); });
      var swapWrap = el('div', 'fk-btns');
      swapWrap.appendChild(swapBtn);
      pMisc.appendChild(swapWrap);

      pMisc.appendChild(sec('fa-heart', 'Survival'));
      var irT = toggle(!!IR.on, function (on) { PBX_API.respawn(on); });
      pMisc.appendChild(row('Instant respawn', irT.node, 'Hidup langsung'));
      var godT = toggle(!!FL.godmode, function (on) { PBX_API.godmode(on); });
      pMisc.appendChild(row('Godmode', godT.node, 'Unlimited spawn shield', 'risk'));

      pMisc.appendChild(sec('fa-toolbox', 'Utility'));
      var akT = toggle(!!FL.antiKick, function (on) { PBX_API.antiKick(on); });
      pMisc.appendChild(row('Anti-kick', akT.node, 'Blokir paket kick/ban', 'risk'));

      var pInfo = addTab('info', 'INFO');
      pInfo.appendChild(sec('fa-signal', 'Status'));
      var foot = el('div', 'fk-foot', '');
      pInfo.appendChild(foot);
      var statBox = el('div', 'fk-foot', '');
      statBox.style.marginTop = '3px';
      pInfo.appendChild(statBox);

      pInfo.appendChild(sec('fa-triangle-exclamation', 'Reset'));
      var resetBtn = el('div', 'fk-btn danger');
      resetBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i> Reset Semua & Posisi UI';
      resetBtn.addEventListener('click', function () {
        try {
          localStorage.removeItem(SETTINGS_KEY);
          localStorage.removeItem('vanguard_pos');
          panel.style.left = 'auto';
          panel.style.right = '14px';
          panel.style.top = '12px';
          location.reload();
        } catch (e) {}
      });
      var resetWrap = el('div', 'fk-btns');
      resetWrap.appendChild(resetBtn);
      pInfo.appendChild(resetWrap);
      pInfo.appendChild(el('div', 'fk-warn', 'Fitur berlabel RISK dapat terdeteksi oleh sistem server.'));

      function refreshFoot() {
        try {
          var s2 = PB_API.state();
          foot.textContent = [
            s2.aim ? 'AIM ✓' : 'AIM ✕',
            s2.aimbot ? 'AB ✓' : 'AB ✕',
            'G' + (s2.G ? '1' : '0'),
            'en ' + s2.enemies,
            'lk ' + s2.lock,
            s2.lock ? (s2.dist.toFixed(1) + 'm') : ''
          ].filter(Boolean).join(' · ');

          statBox.textContent = 'bots ' + s2.bots + ' · fire ' + s2.fire +
            ' · fly ' + (FLY.on ? '✓' : '✕') +
            ' · noclip ' + (FL.noclip ? '✓' : '✕') +
            ' · snade ' + (SN.on ? SN.nadeCount : '✕');

          var x2 = PBX_API.st();
          saTgt.textContent = x2.saHead
            ? 'target 360 (' + SA.target + '): ' + x2.saHead.name + ' (' + Math.round(x2.saHead.hp) + 'hp)'
            : (SA.on ? 'target 360 (' + SA.target + '): —' : 'target: off');

          var sns = PBX_API.silentNadeSt();
          var sideLabel = sns.side === 'ally' ? 'kawan' : 'lawan';
          var lockLabel = sns.targetBotName || (sns.mode === 'name_order' && sns.targetName ? sns.targetName : null);
          snadeStat.textContent = x2.silentNade
            ? 'snade [' + sideLabel + '/' + sns.mode + ']: ON · ' + sns.nadeCount + ' chase · ' + (lockLabel ? ('lock ' + lockLabel) : 'lock —')
            : 'snade [' + sideLabel + '/' + sns.mode + ']: off';

          var ngs = PBX_API.infNadeSt();
          infNadeSt.innerHTML = ngs.grenades.length
            ? 'unlimited: <b>' + (ngs.on ? 'ON' : 'OFF') + '</b> · max ' + ngs.max + 'x<br>' +
              ngs.grenades.map(function (g) { return 'slot ' + g.slot + ': ' + g.name + ' = ' + g.ammo; }).join('<br>')
            : 'unlimited: ' + (ngs.on ? 'ON' : 'OFF') + ' … belum ada granat';
        } catch (e) {}
      }
      setInterval(refreshFoot, 350);

      function mount() {
        var host = document.body || document.documentElement;
        if (!host) return setTimeout(mount, 100);
        host.appendChild(panel);
        var lastTab = 'aim';
        try { lastTab = localStorage.getItem(TAB_KEY) || 'aim'; } catch (e) {}
        selectTab(pages[lastTab] ? lastTab : 'aim');
        var collapsed = false;
        try { collapsed = localStorage.getItem('vanguard_collapsed') === '1'; } catch (e) {}
        setCollapsed(collapsed);
        refreshSnadeTargets();
        refreshFoot();
      }
      mount();
    })();
  }

  ensureLobbyBadge();
  bootCore();
})(typeof unsafeWindow !== 'undefined' ? unsafeWindow : (typeof window !== 'undefined' ? window : globalThis));
