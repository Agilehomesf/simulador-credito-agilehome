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

/* Formulario "Quiero Asesoría": usa el mismo destino y las mismas validaciones de Agile Match. */
(function () {
  var DESTINO = 'https://script.google.com/macros/s/AKfycbx0-N-hv7v45HoEwT96HzbHfGzNIxnVJCC4P5e3UaLRkUAxqfwWuZ85RowlkpUKBvq6/exec';
  var TEXTO = 'Quiero mi asesoría gratuita';
  var NIVEL = {
    total: ['Tiene los recursos completos'],
    proyecto: ['La está pagando en un proyecto'],
    parcial: ['Tiene una parte'],
    no: ['Aún no tiene recursos']
  };
  var enVivo = /(^|\.)agilehomesf\.(com|github\.io)$/.test(location.hostname);

  function $(id) { return document.getElementById(id); }
  function error(m) { var e = $('as-err'); e.textContent = m; e.hidden = !m; }
  function marcada(n) {
    var o = document.querySelector('input[name="' + n + '"]:checked');
    return o ? o.value : '';
  }
  function reiniciar() {
    var f = $('as-form');
    f.reset(); f.hidden = false; $('as-ok').hidden = true; $('as-n').hidden = true; $('as-nr').hidden = true; error('');
    $('as-send').disabled = false; $('as-send').textContent = TEXTO;
  }

  document.addEventListener('click', function (e) {
    var t = e.target, d = $('asesoria');
    if (!d || !t || !t.closest) return;
    if (t.closest('[data-asesoria]')) { reiniciar(); d.showModal(); return; }
    if (t.closest('.as-x') || t === d) d.close();
  });

  document.addEventListener('change', function (e) {
    if (!e.target) return;
    if (e.target.name === 'as-ci') $('as-n').hidden = e.target.value !== 'no';
    if (/^as-(rep|dem|ing)$/.test(e.target.name)) {
      var r = marcada('as-rep'), d = marcada('as-dem'), i = marcada('as-ing');
      $('as-nr').hidden = !(r === 'si' || d === 'no' || i === 'no');
    }
  });

  document.addEventListener('submit', function (e) {
    if (!e.target || e.target.id !== 'as-form') return;
    e.preventDefault(); error('');
    if ($('as-hp').value) return;
    var nombre = $('as-name').value.trim(), correo = $('as-mail').value.trim();
    var celular = $('as-tel').value.replace(/[^\d+]/g, '').replace(/^\+?57/, '');
    if (nombre.length < 3 || nombre.indexOf(' ') < 0) { error('Escribe tu nombre y apellido.'); return; }
    if (!/^3\d{9}$/.test(celular)) { error('Escribe un celular colombiano de 10 dígitos, por ejemplo 300 123 4567.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) { error('Revisa tu correo electrónico.'); return; }
    var rep = marcada('as-rep'), dem = marcada('as-dem'), ing = marcada('as-ing'), ci = marcada('as-ci');
    if (!rep) { error('Cuéntanos si tienes reportes negativos en centrales de riesgo.'); return; }
    if (!dem) { error('Cuéntanos si puedes demostrar tus ingresos con documentos.'); return; }
    if (!ing) { error('Cuéntanos si tus ingresos suman al menos $3.501.810 al mes.'); return; }
    if (!ci) { error('Cuéntanos si cuentas con la cuota inicial.'); return; }
    var dato = NIVEL[ci];
    var noCumple = [];
    if (rep === 'si') noCumple.push('Tiene reportes en centrales de riesgo');
    if (dem === 'no') noCumple.push('No puede demostrar sus ingresos');
    if (ing === 'no') noCumple.push('Ingresos menores a 2 SMLV');
    if (ci === 'no') noCumple.push('No tiene recursos para la cuota inicial');
    var calif = noCumple.length ? 'D: No calificado' : 'C: Por perfilar';
    var falta = noCumple.length ? noCumple : ['Simular en Agile Match'].concat(ci === 'parcial' ? ['Completar la cuota inicial'] : []);
    var queFalta = falta.join('; ');
    if (!$('as-acepta').checked) { error('Debes autorizar el tratamiento de tus datos para continuar.'); return; }
    var btn = $('as-send');
    btn.disabled = true; btn.textContent = 'Enviando…';
    var listo = function () { e.target.hidden = true; $('as-ok').hidden = false; };
    if (!enVivo) { listo(); return; }
    var fallo = function () {
      btn.disabled = false; btn.textContent = TEXTO;
      error('No pudimos confirmar el envío de tus datos. Intenta de nuevo o escríbenos por WhatsApp al 312 310 9099.');
    };
    var control = window.AbortController ? new AbortController() : null;
    var espera = setTimeout(function () { if (control) control.abort(); }, 25000);
    fetch(DESTINO, {
      signal: control ? control.signal : undefined,
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        fecha: new Date().toISOString(), nombre: nombre, celular: celular, correo: correo,
        autorizacion: 'Sí', version_politica: '1.0', origen: location.href.split('#')[0], producto: 'Asesoría desde la página web', top3: '[]', cuota_inicial: dato[0], reportes: rep === 'si' ? 'Sí' : 'No', ingresos_demostrables: dem === 'si' ? 'Sí' : 'No', ingresos_2_smlv: ing === 'si' ? 'Sí' : 'No', calificacion: calif, que_falta: queFalta
      })
    }).then(function (r) { return r.text(); }).then(function (texto) {
      clearTimeout(espera);
      if (String(texto).trim() === 'ok') listo(); else fallo();
    }).catch(function () {
      clearTimeout(espera); fallo();
    });
  });
})();

/* Aparición progresiva de bloques marcados con .rev */
(function () {
  var els = document.querySelectorAll('.rev');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('visto'); }); return; }
  var io = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (en) { if (en.isIntersecting) { var t = en.target; t.classList.add('visto'); io.unobserve(t); setTimeout(function () { t.style.transitionDelay = ''; }, 1100); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (e, i) { e.style.transitionDelay = (Math.min(i % 6, 5) * 70) + 'ms'; io.observe(e); });
})();

/* Regresar: "Volver" lleva al punto exacto donde estabas (historial del navegador); si llegaste directo, va al inicio. */
(function () {
  var barra = document.querySelector('.volver');
  if (!barra) return;
  var mismoSitio = false;
  try { mismoSitio = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch (e) {}
  var saltoInterno = false;
  window.addEventListener('hashchange', function () { saltoInterno = true; });
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target : null;
    if (!t) return;
    if (t.closest('.v-atras') && (mismoSitio || saltoInterno) && history.length > 1) { e.preventDefault(); history.back(); }
    if (t.closest('.v-arriba')) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  });
  function ver() { barra.classList.toggle('subio', window.scrollY > 500); }
  window.addEventListener('scroll', ver, { passive: true });
  ver();
})();

/* Sección "Tu financiación en 3 pasos": cada tarjeta abre su detalle debajo; "Volver a los 3 pasos" lo cierra. */
(function () {
  var cards = document.querySelectorAll('.p5-card');
  if (!cards.length) return;
  var suave = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function link(n) { return document.querySelector('.p5-mas[href="#paso-' + n + '"]'); }
  function abrir(n, mover) {
    document.querySelectorAll('.p5-det').forEach(function (d) { d.classList.toggle('abierto', d.id === 'paso-' + n); });
    cards.forEach(function (c) {
      var on = c.getAttribute('data-paso') === String(n);
      c.classList.toggle('activa', on);
      var a = c.querySelector('.p5-mas'); if (a) a.setAttribute('aria-expanded', on ? 'true' : 'false');
    });
    var d = document.getElementById('paso-' + n);
    if (d && mover) { d.scrollIntoView({ behavior: suave ? 'smooth' : 'auto', block: 'start' }); d.focus({ preventScroll: true }); }
    try { history.replaceState(null, '', '#paso-' + n); } catch (e) {}
  }
  function cerrar(d) {
    var n = d.id.replace('paso-', '');
    d.classList.remove('abierto');
    cards.forEach(function (c) { c.classList.remove('activa'); var a = c.querySelector('.p5-mas'); if (a) a.setAttribute('aria-expanded', 'false'); });
    var a = link(n);
    if (a) { a.closest('.p5-card').scrollIntoView({ behavior: suave ? 'smooth' : 'auto', block: 'center' }); a.focus({ preventScroll: true }); }
    try { history.replaceState(null, '', '#pasos'); } catch (e) {}
  }
  document.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    var card = t.closest('.p5-card');
    if (card) { e.preventDefault(); abrir(card.getAttribute('data-paso'), true); return; }
    var x = t.closest('.p5-cerrar');
    if (x) cerrar(x.closest('.p5-det'));
  });
  var m = /^#paso-([123])$/.exec(location.hash);
  if (m) abrir(m[1], true);
})();

/* Preguntas frecuentes del inicio: acordeón con botones, se puede abrir y cerrar cada pregunta. */
(function () {
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('.f7-q') : null;
    if (!b) return;
    var abierta = b.getAttribute('aria-expanded') === 'true';
    b.setAttribute('aria-expanded', abierta ? 'false' : 'true');
    var r = document.getElementById(b.getAttribute('aria-controls'));
    if (r) r.classList.toggle('abierta', !abierta);
  });
})();

/* Centro de ayuda: buscador que filtra las preguntas por palabras, sin servicios externos. */
(function () {
  var q = document.getElementById('ay-q');
  if (!q) return;
  var items = Array.prototype.slice.call(document.querySelectorAll('.ay-q'));
  var cats = document.querySelectorAll('.ay-cat');
  var estado = document.getElementById('ay-estado'), vacio = document.getElementById('ay-vacio');
  var total = items.length;
  function norm(t) { return (t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  items.forEach(function (d) { d._txt = norm(d.textContent); d._abierto = d.open; });
  function filtrar() {
    var palabras = norm(q.value).split(/\s+/).filter(function (w) { return w.length > 1; });
    var n = 0;
    items.forEach(function (d) {
      var ok = palabras.every(function (w) { return d._txt.indexOf(w) >= 0; });
      d.hidden = !ok;
      if (ok) n++;
      if (palabras.length) d.open = ok && n <= 3; else d.open = false;
    });
    cats.forEach(function (c) { c.hidden = !c.querySelector('.ay-q:not([hidden])'); });
    vacio.hidden = n > 0;
    estado.textContent = palabras.length ? (n === 1 ? '1 pregunta coincide con tu búsqueda.' : n + ' preguntas coinciden con tu búsqueda.') : total + ' preguntas en 5 categorías.';
  }
  var t;
  q.addEventListener('input', function () { clearTimeout(t); t = setTimeout(filtrar, 120); });
  var m = /[?&]q=([^&]+)/.exec(location.search);
  if (m) { q.value = decodeURIComponent(m[1].replace(/\+/g, ' ')); filtrar(); }
})();

/* Formulario de contacto (sección 8): mismo destino de registro que Agile Match y "Habla con un asesor". */
(function () {
  var f = document.getElementById('c8-form');
  if (!f) return;
  var DESTINO = 'https://script.google.com/macros/s/AKfycbx0-N-hv7v45HoEwT96HzbHfGzNIxnVJCC4P5e3UaLRkUAxqfwWuZ85RowlkpUKBvq6/exec';
  var TEXTO_AUT = 'Autorizo a Agile Home para tratar mis datos personales con el fin de gestionar mi solicitud de asesoría y contactarme, de acuerdo con su Política de Tratamiento de Datos Personales.';
  var WA_BASE = 'https://wa.me/573123109099?text=';
  var enVivo = /(^|\.)agilehomesf\.(com|github\.io)$/.test(location.hostname) || window.AGILE_PRUEBA_ENVIO === true;
  var inicio = Date.now(), enviando = false;
  function $(id) { return document.getElementById(id); }
  function limpio(t, max) { return String(t || '').replace(/[<>]/g, '').replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max); }
  function marcar(id, msg) {
    var e = $(id + '-e'), campo = $(id), caja = campo && campo.closest('.c8-in');
    if (e) { e.textContent = msg || ''; e.hidden = !msg; }
    if (campo) campo.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (caja) caja.classList.toggle('mal', !!msg);
    return !msg;
  }
  function telefono() {
    var raw = $('c8-tel').value.replace(/[\s().-]/g, '');
    if (/^3\d{9}$/.test(raw)) raw = '+57' + raw;
    if (/^57 ?3\d{9}$/.test(raw)) raw = '+' + raw;
    if (!/^\+\d{7,15}$/.test(raw)) return null;
    if (/^\+57/.test(raw) && !/^\+57[36]\d{9}$/.test(raw)) return null;
    return raw;
  }
  var reglas = {
    'c8-nombre': function () { var v = limpio($('c8-nombre').value, 80); return v.length >= 5 && v.indexOf(' ') > 0 && /^[\p{L}\s'.-]+$/u.test(v) ? '' : 'Escribe tu nombre y apellido.'; },
    'c8-tel': function () { return telefono() ? '' : 'Escribe un número de WhatsApp válido, por ejemplo +57 300 123 4567.'; },
    'c8-mail': function () { return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test($('c8-mail').value.trim()) ? '' : 'Escribe un correo válido, por ejemplo tunombre@correo.com.'; },
    'c8-prod': function () { return $('c8-prod').value ? '' : 'Selecciona qué necesitas financiar.'; },
    'c8-acepta': function () { return $('c8-acepta').checked ? '' : 'Para enviar tu solicitud debes autorizar el tratamiento de tus datos.'; }
  };
  Object.keys(reglas).forEach(function (id) {
    var el = $(id);
    el.addEventListener(id === 'c8-acepta' || id === 'c8-prod' ? 'change' : 'blur', function () { marcar(id, reglas[id]()); });
    el.addEventListener('input', function () { if (el.getAttribute('aria-invalid') === 'true') marcar(id, reglas[id]()); });
  });
  $('c8-prod').addEventListener('change', function () {
    var p = $('c8-prod').value, t = 'Hola, quiero recibir asesoría sobre financiación de vivienda con Agile Home.';
    if (p) t = 'Hola, quiero recibir asesoría sobre financiación de vivienda con Agile Home. Me interesa: ' + p + '.';
    $('c8-wa').href = WA_BASE + encodeURIComponent(t);
  });
  function estado(cargando) {
    var b = $('c8-send');
    b.disabled = cargando; b.setAttribute('aria-busy', cargando ? 'true' : 'false');
    b.querySelector('span').textContent = cargando ? 'Enviando…' : 'Enviar solicitud';
  }
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    if (enviando) return;
    $('c8-err').hidden = true; $('c8-prev').hidden = true;
    var primero = null;
    Object.keys(reglas).forEach(function (id) { if (!marcar(id, reglas[id]()) && !primero) primero = $(id); });
    if (primero) { primero.focus(); return; }
    if ($('c8-hp').value || Date.now() - inicio < 2500) return;
    var ultimo = 0; try { ultimo = +localStorage.getItem('ah_c8_ultimo') || 0; } catch (x) {}
    if (Date.now() - ultimo < 60000) { $('c8-err').hidden = false; return; }
    if (!enVivo) { $('c8-prev').hidden = false; return; }
    enviando = true; estado(true);
    var datos = {
      fecha: new Date().toISOString(), nombre: limpio($('c8-nombre').value, 80), celular: telefono().replace(/^\+57(?=[36]\d{9}$)/, ''), correo: limpio($('c8-mail').value, 100).toLowerCase(),
      producto: limpio($('c8-prod').value, 80), mensaje: limpio($('c8-msg').value, 500),
      autorizacion: 'Sí', version_politica: '1.0', texto_autorizacion: TEXTO_AUT,
      origen: 'Formulario de contacto del sitio web · ' + location.href.split('#')[0].split('?')[0],
      top3: '[]', calificacion: 'C: Por perfilar', que_falta: 'Simular en Agile Match'
    };
    var control = window.AbortController ? new AbortController() : null;
    var espera = setTimeout(function () { if (control) control.abort(); }, 25000);
    function fallo() { clearTimeout(espera); enviando = false; estado(false); $('c8-err').hidden = false; }
    fetch(DESTINO, { signal: control ? control.signal : undefined, method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(datos) })
      .then(function (r) { return r.text(); })
      .then(function (t) {
        clearTimeout(espera);
        if (String(t).trim() !== 'ok') { fallo(); return; }
        try { localStorage.setItem('ah_c8_ultimo', String(Date.now())); } catch (x) {}
        f.hidden = true; $('c8-ok').hidden = false; $('c8-ok').focus();
      })
      .catch(fallo);
  });
  /* El botón flotante de WhatsApp y la barra para subir se ocultan mientras el formulario está en pantalla, para no tapar los campos ni el botón de envío (el formulario tiene su propio botón de WhatsApp). */
  if ('IntersectionObserver' in window && window.matchMedia) {
    var mq = { matches: true };
    new IntersectionObserver(function (en) { document.body.classList.toggle('form-visible', mq.matches && en[0].isIntersecting); }, { threshold: 0.05 }).observe(document.querySelector('.c8-card'));
  }
})();
