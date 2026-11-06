/* Menú de Agile Home: desplegable en celular, sección activa y botón Volver arriba. */
(function () {
  var html = document.documentElement;
  html.classList.add('js');
  var GRUPOS = { gastos: 'documentos' };

  function menu() { return document.getElementById('menu'); }
  function boton() { return document.querySelector('.m-btn'); }

  function abrir(si) {
    var m = menu(), b = boton();
    if (!m || !b) return;
    m.classList.toggle('abierto', si);
    b.setAttribute('aria-expanded', si ? 'true' : 'false');
    b.setAttribute('aria-label', si ? 'Cerrar menú' : 'Abrir menú');
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('.m-btn')) { abrir(!menu().classList.contains('abierto')); return; }
    if (t.closest('#menu a') || !t.closest('#menu')) abrir(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu() && menu().classList.contains('abierto')) {
      abrir(false);
      boton().focus();
    }
  });

  function actualizar() {
    var secciones = document.querySelectorAll('section[id]');
    var barra = document.querySelector('.barra');
    if (!secciones.length || !barra) return;
    var limite = barra.getBoundingClientRect().bottom + 90;
    var actual = '';
    secciones.forEach(function (s) {
      if (s.getBoundingClientRect().top <= limite) actual = s.id;
    });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      actual = secciones[secciones.length - 1].id;
    }
    actual = GRUPOS[actual] || actual;
    document.querySelectorAll('.nl').forEach(function (a) {
      var on = a.getAttribute('href') === '#' + actual;
      a.classList.toggle('on', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    var arriba = document.querySelector('.arriba');
    if (arriba) arriba.classList.toggle('ver', window.scrollY > 600);
  }

  var pendiente = false;
  function pedir() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(function () { pendiente = false; actualizar(); });
  }
  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);
  window.addEventListener('load', actualizar);
  document.addEventListener('DOMContentLoaded', actualizar);
})();
