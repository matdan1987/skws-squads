/* SKWS Squads – Bildausschnitt für Profilbilder wählen (verschieben + zoomen), Ergebnis als quadratisches JPEG */
var Zuschnitt = (function(){
  var OUT = 320, MAXLEN = 76000;
  var TXT = {
    de:{ t:'Ausschnitt wählen', h:'Bild verschieben und mit dem Regler (oder zwei Fingern) zoomen. Der Kreis zeigt, was später zu sehen ist.', ok:'Übernehmen', no:'Abbrechen', z:'Zoom' },
    en:{ t:'Choose the crop', h:'Drag the picture and zoom with the slider (or two fingers). The circle shows what will be visible.', ok:'Apply', no:'Cancel', z:'Zoom' },
    fr:{ t:'Choisir le cadrage', h:'Déplace l’image et zoome avec le curseur (ou deux doigts). Le cercle montre ce qui sera visible.', ok:'Appliquer', no:'Annuler', z:'Zoom' },
    es:{ t:'Elegir el recorte', h:'Mueve la imagen y haz zoom con el control (o dos dedos). El círculo muestra lo que se verá.', ok:'Aplicar', no:'Cancelar', z:'Zoom' },
    pt:{ t:'Escolher o recorte', h:'Arraste a imagem e dê zoom com o controle (ou dois dedos). O círculo mostra o que ficará visível.', ok:'Aplicar', no:'Cancelar', z:'Zoom' },
    it:{ t:'Scegli il ritaglio', h:'Sposta l’immagine e ingrandisci con il cursore (o due dita). Il cerchio mostra cosa si vedrà.', ok:'Applica', no:'Annulla', z:'Zoom' },
    tr:{ t:'Kırpma alanını seç', h:'Resmi sürükle ve kaydırıcıyla (veya iki parmakla) yakınlaştır. Daire, görünecek alanı gösterir.', ok:'Uygula', no:'İptal', z:'Yakınlaştır' },
    ru:{ t:'Выбрать область', h:'Перетащи картинку и масштабируй ползунком (или двумя пальцами). Круг показывает, что будет видно.', ok:'Применить', no:'Отмена', z:'Масштаб' },
    pl:{ t:'Wybierz kadr', h:'Przesuń obraz i powiększ suwakiem (lub dwoma palcami). Koło pokazuje, co będzie widoczne.', ok:'Zastosuj', no:'Anuluj', z:'Powiększenie' }
  };
  function css(){
    if (document.getElementById('zsCss')) return;
    var s = document.createElement('style'); s.id = 'zsCss';
    s.textContent = '.zs-ov{position:fixed;inset:0;z-index:300;background:rgba(3,6,12,.88);display:flex;align-items:center;justify-content:center;padding:16px}' +
      '.zs-box{width:100%;max-width:400px;background:#111a2e;border:1px solid rgba(92,200,255,.35);border-radius:16px;padding:16px;color:#e6edf7;font:15px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;box-shadow:0 10px 40px rgba(0,0,0,.6)}' +
      '.zs-box b{display:block;font-size:16px;margin-bottom:4px}.zs-box p{margin:0 0 12px;color:#8a9bb8;font-size:13px}' +
      '.zs-stage{position:relative;width:100%;aspect-ratio:1/1;border-radius:12px;overflow:hidden;background:#0b1220;touch-action:none;cursor:grab;user-select:none}' +
      '.zs-stage canvas{width:100%;height:100%;display:block}' +
      '.zs-ring{position:absolute;inset:0;pointer-events:none;border-radius:50%;box-shadow:0 0 0 9999px rgba(3,6,12,.55);outline:2px solid rgba(92,200,255,.8);outline-offset:-2px}' +
      '.zs-z{display:flex;align-items:center;gap:10px;margin:12px 0 4px;font-size:13px;color:#8a9bb8}.zs-z input{flex:1}' +
      '.zs-btns{display:flex;gap:8px;margin-top:12px}.zs-btns button{flex:1;padding:11px;border-radius:10px;font:inherit;font-weight:700;cursor:pointer;border:1px solid rgba(92,200,255,.35);background:none;color:#e6edf7}' +
      '.zs-btns .zs-ok{border:0;background:linear-gradient(135deg,#5cc8ff,#7c5cff);color:#081020}';
    document.head.appendChild(s);
  }
  // file: Bilddatei · lang: Sprachcode · cb(url | null, abgebrochen)
  function open(file, lang, cb){
    var L = TXT[lang] || TXT.en, rd = new FileReader();
    rd.onerror = function(){ cb(null); };
    rd.onload = function(){
      var im = new Image();
      im.onerror = function(){ cb(null); };
      im.onload = function(){ show(im, L, cb); };
      im.src = rd.result;
    };
    rd.readAsDataURL(file);
  }
  function show(im, L, cb){
    css();
    var ov = document.createElement('div'); ov.className = 'zs-ov';
    ov.innerHTML = '<div class="zs-box"><b></b><p></p><div class="zs-stage"><canvas></canvas><div class="zs-ring"></div></div>' +
      '<label class="zs-z"><span></span><input type="range" min="1" max="4" step="0.01" value="1"></label>' +
      '<div class="zs-btns"><button type="button" class="zs-no"></button><button type="button" class="zs-ok"></button></div></div>';
    ov.querySelector('b').textContent = L.t; ov.querySelector('p').textContent = L.h; ov.querySelector('.zs-z span').textContent = L.z;
    ov.querySelector('.zs-no').textContent = L.no; ov.querySelector('.zs-ok').textContent = L.ok;
    document.body.appendChild(ov);
    var stage = ov.querySelector('.zs-stage'), cv = ov.querySelector('canvas'), rng = ov.querySelector('input[type=range]'), g = cv.getContext('2d');
    var V = 600; cv.width = cv.height = V;                      // Arbeitsfläche in Pixeln
    var base = V / Math.min(im.width, im.height);                // Maßstab, bei dem das Bild die Fläche gerade füllt
    var z = 1, cx = im.width / 2, cy = im.height / 2;            // Zoom und Bildmittelpunkt des Ausschnitts (Bildkoordinaten)
    function clamp(){ var half = V / (2 * base * z); cx = Math.min(Math.max(cx, half), im.width - half); cy = Math.min(Math.max(cy, half), im.height - half); }
    function draw(ctx, size){ var s = base * z * size / V; ctx.fillStyle = '#0b1220'; ctx.fillRect(0, 0, size, size);
      ctx.drawImage(im, size / 2 - cx * s, size / 2 - cy * s, im.width * s, im.height * s); }
    function render(){ clamp(); draw(g, V); }
    render();
    // Verschieben und Zoomen mit Maus/Finger
    var pts = {}, last = null, pinch = null;
    function px(){ return V / stage.getBoundingClientRect().width; }   // Bildschirm- → Arbeitsflächen-Pixel
    stage.addEventListener('pointerdown', function(e){ stage.setPointerCapture(e.pointerId); pts[e.pointerId] = { x: e.clientX, y: e.clientY }; last = { x: e.clientX, y: e.clientY }; pinch = null; });
    stage.addEventListener('pointermove', function(e){
      if (!pts[e.pointerId]) return; pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pts);
      if (ids.length >= 2) { var a = pts[ids[0]], b = pts[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch) { z = Math.min(4, Math.max(1, pinch.z * d / pinch.d)); rng.value = z; render(); } else pinch = { d: d, z: z }; return; }
      if (!last) return; var k = px() / (base * z);
      cx -= (e.clientX - last.x) * k; cy -= (e.clientY - last.y) * k; last = { x: e.clientX, y: e.clientY }; render();
    });
    function up(e){ delete pts[e.pointerId]; last = null; pinch = null; var ids = Object.keys(pts); if (ids.length === 1) last = pts[ids[0]]; }
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
    stage.addEventListener('wheel', function(e){ e.preventDefault(); z = Math.min(4, Math.max(1, z * (e.deltaY < 0 ? 1.08 : 1 / 1.08))); rng.value = z; render(); }, { passive: false });
    rng.addEventListener('input', function(){ z = +rng.value; render(); });
    function close(url, cancel){ ov.remove(); cb(url, !!cancel); }
    ov.querySelector('.zs-no').addEventListener('click', function(){ close(null, true); });
    ov.querySelector('.zs-ok').addEventListener('click', function(){
      var c = document.createElement('canvas'); c.width = c.height = OUT; draw(c.getContext('2d'), OUT);
      var q = .85, url = c.toDataURL('image/jpeg', q); while (url.length > MAXLEN && q > .3) { q -= .1; url = c.toDataURL('image/jpeg', q); }
      close(url);
    });
  }
  return { open: open };
})();
