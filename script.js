(function () {
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

    bar.style.height = p * 100 + '%';
    hint.style.opacity = p > 0.03 ? 0 : '';

    /* ----- transisi antar scene ----- */
    scenes.forEach(function (s, i) {
      var d = x - i;
      var o = (d < -1 || d > 1) ? 0 : 1 - Math.abs(d);

      s.style.opacity = ease(Math.min(1, o * 1.6));
      s.style.pointerEvents = 'none';

      var z = 1 + (d + 1) * 0.18;                         // dolly zoom
      s.querySelector('.bg').style.transform =
        'scale(' + z.toFixed(3) + ') translateY(' + (-d * 3) + '%)';

      s.querySelector('.txt').style.transform =
        'translateY(' + (d * 60) + 'px)';                 // parallax teks
    });

    /* ----- Scene 1: burung terbang ke kanan ----- */
    var d1 = x - 1;
    birds.forEach(function (b) {
      var sx = +b.dataset.x;       // posisi awal (vw)
      var sy = +b.dataset.y;       // tinggi (vh)
      var sp = +b.dataset.s;       // kecepatan
      var bx = sx + (d1 + 1) * sp;
      var by = sy - Math.sin((d1 + 1) * 3 + sx) * 2;      // naik turun halus
      b.style.transform = 'translate(' + bx + 'vw,' + by + 'vh)';
    });

    /* ----- Scene 3: roda gigi berputar ----- */
    if (gear) gear.style.transform = 'rotate(' + (p * 720) + 'deg)';

    /* ----- Scene 4: perahu berlayar ke kanan ----- */
    if (boat) {
      var d4 = x - 4;
      var bobY = Math.sin(p * 60) * 0.8;                  // goyang di air
      boat.style.transform =
        'translate(' + ((d4 + 0.5) * 70) + 'vw,' + bobY + 'vh)';
    }

    /* ----- Scene 5: pesawat terbang ke kanan lalu hilang ----- */
    if (plane) {
      var t  = clamp(x - 4, 0, 1);                        // 0..1 di scene terakhir
      var tt = clamp((t - 0.1) / 0.9, 0, 1);
      plane.style.transform =
        'translate(' + (tt * 125) + 'vw,' + (-tt * 22) + 'vh) ' +
        'rotate(' + (90 - tt * 12) + 'deg) ' +             // hidung menghadap kanan
        'scale(' + (1.35 - tt * 0.5) + ')';
    }
  }

  addEventListener('scroll', function () { requestAnimationFrame(tick); }, { passive: true });
  addEventListener('resize', tick);
  tick();
})();
