[12.55, 23/11/2026] brndnsn: (function () {
  var scenes = [].slice.call(document.querySelectorAll('.scene'));
  var N      = scenes.length;
  var bar    = document.querySelector('#bar i');
  var gear   = document.getElementById('gear');
  var plane  = document.getElementById('plane');
  var boat   = document.getElementById('boat');
  var birds  = [].slice.call(document.querySelectorAll('.bird'));
  var hint   = document.querySelector('.hint');

  function ease(t)  { return t * t * (3 - 2 * t); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

  function tick() {
    var max = document.documentElement.scrollHeight - innerHeight;
    var p   = max > 0 ? clamp(scrollY / max, 0, 1) : 0;   // 0..1
    var x   = p * (N - 1);                                // posisi scene

…
[13.16, 23/11/2026] brndnsn: (function () {
  var scenes = [].slice.call(document.querySelectorAll('.scene')).map(function (el) {
    return { el: el, bg: el.querySelector('.bg'), txt: el.querySelector('.txt') };
  });
  var N     = scenes.length;
  var bar   = document.querySelector('#bar i');
  var gear  = document.getElementById('gear');
  var plane = document.getElementById('plane');
  var boat  = document.getElementById('boat');
  var hint  = document.querySelector('.hint');
  var birds = [].slice.call(document.querySelectorAll('.bird')).map(function (b) {
    return { el: b, x: +b.dataset.x, y: +b.dataset.y, s: +b.dataset.s };
  });

  var DUR = 1400;                 // lama pindah halaman (ms)
  var idx = 0, from = 0, to = 0, t0 = 0;
  var cur = 0;                    // posisi 0..1
  var moving = false, locked = false, running = false;
  var arrAt = [];                 // waktu halaman i mulai tampil
  var lastGo = 0;

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function ease(t)  { return t * t * (3 - 2 * t); }
  function easeIO(t){ return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2; }

  /* progres animasi "saat tiba" di sebuah halaman */
  function arr(i, delay, dur, now) {
    if (arrAt[i] == null) return 0;
    return clamp((now - arrAt[i] - delay) / dur, 0, 1);
  }

  /* pindah halaman */
  function go(dir) {
    var n = clamp(idx + dir, 0, N - 1);
    if (n === idx || locked) return;
    idx = n;
    from = cur; to = idx / (N - 1);
    t0 = performance.now();
    arrAt[idx] = t0;
    lastGo = t0;
    moving = locked = true;
    setTimeout(function () { locked = false; }, DUR + 150);
    start();
  }

  function start() {
    if (!running) { running = true; requestAnimationFrame(loop); }
  }

  function loop(now) {
    if (moving) {
      var k = clamp((now - t0) / DUR, 0, 1);
      cur = from + (to - from) * easeIO(k);
      if (k >= 1) { cur = to; moving = false; }
    }
    render(cur, now);
    if (moving || now - lastGo < 8000) requestAnimationFrame(loop);
    else running = false;
  }

  function render(p, now) {
    var x = p * (N - 1);
    bar.style.transform = 'scaleY(' + p.toFixed(3) + ')';
    hint.style.opacity = idx > 0 ? 0 : '';

    for (var i = 0; i < N; i++) {
      var s = scenes[i], d = x - i;
      var o = (d < -1 || d > 1) ? 0 : 1 - Math.abs(d);
      var on = o > 0;
      s.el.classList.toggle('on', on);
      if (!on) continue;
      s.el.style.opacity = ease(Math.min(1, o * 1.6)).toFixed(3);
      var z = 1 + (d + 1) * 0.18;
      s.bg.style.transform  = 'translate3d(0,' + (-d * 3).toFixed(2) + '%,0) scale(' + z.toFixed(3) + ')';
      s.txt.style.transform = 'translate3d(0,' + (d * 60).toFixed(1) + 'px,0)';
    }

    /* Halaman 1: burung terbang ke kanan */
    var tb = arr(1, 300, 6000, now);
    birds.forEach(function (b) {
      var bx = b.x + tb * b.s * 2.2;
      var by = b.y + Math.sin(now / 500 + b.x) * 2;
      b.el.style.transform = 'translate3d(' + bx.toFixed(2) + 'vw,' + by.toFixed(2) + 'vh,0)';
    });

    /* Halaman 3: roda gigi berputar */
    if (gear) gear.style.transform = 'rotate(' + (p * 720).toFixed(1) + 'deg)';

    /* Halaman 4: perahu berlayar ke kanan */
    if (boat) {
      var tc = arr(4, 600, 5000, now);
      var bob = Math.sin(now / 400) * 0.8;
      boat.style.transform =
        'translate3d(' + (tc * tc * 115).toFixed(2) + 'vw,' + bob.toFixed(2) + 'vh,0)';
    }

    /* Halaman 5: pesawat terbang ke kanan lalu hilang */
    if (plane) {
      var tp = arr(5, 700, 3500, now);
      var q  = tp * tp;
      plane.style.transform =
        'translate3d(' + (q * 125).toFixed(2) + 'vw,' + (-q * 22).toFixed(2) + 'vh,0) ' +
        'rotate(' + (90 - q * 12).toFixed(1) + 'deg) ' +
        'scale(' + (1.35 - q * 0.5).toFixed(3) + ')';
    }
  }

  /* ===== Input: 1 gerakan = 1 halaman ===== */
  addEventListener('wheel', function (e) {
    e.preventDefault();
    if (locked || Math.abs(e.deltaY) < 8) return;
    go(e.deltaY > 0 ? 1 : -1);
  }, { passive: false });

  var ty = null;
  addEventListener('touchstart', function (e) { ty = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchend', function (e) {
    if (ty == null) return;
    var dy = ty - e.changedTouches[0].clientY;
    ty = null;
    if (Math.abs(dy) > 40) go(dy > 0 ? 1 : -1);
  }, { passive: true });

  addEventListener('keydown', function (e) {
    if (['ArrowDown', 'PageDown', ' '].indexOf(e.key) > -1) { e.preventDefault(); go(1); }
    if (['ArrowUp', 'PageUp'].indexOf(e.key) > -1)           { e.preventDefault(); go(-1); }
  });

  arrAt[0] = lastGo = performance.now();
  start();
})();
