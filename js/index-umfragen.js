/* SKWS Squads – Umfragen auf der Spielerseite (Tab „Events“): abstimmen; R4/R5 und Mentoren können Umfragen starten */
var POLL_I18N = {
  de: { title:'📊 Umfragen', add:'➕ Neue Umfrage', q:'Frage', opts:'Antworten – eine pro Zeile', multi:'Mehrere Antworten erlaubt', other:'Eigene Antwort erlauben', anon:'Anonym – niemand sieht, wer was gewählt hat',
    res:'Ergebnis sichtbar', resLive:'nach der eigenen Stimme', resEnd:'erst nach dem Ende', resLead:'nur für R4/R5 und mich', ends:'Endet am (optional)', who:'Für wen', all:'Ganze Allianz', ranks:'Nur diese Ränge (nichts angekreuzt = alle)', grpOnly:'Für deine Mentorengruppe',
    create:'Umfrage starten', cancel:'Abbrechen', vote:'Abstimmen', change:'Stimme ändern', remove:'Stimme zurückziehen', otherPh:'Eigene Antwort …', votes:'{n} Stimmen', saved:'Deine Stimme ist gespeichert.', endsAt:'endet {d}', closed:'beendet', by:'von {n}',
    hideEnd:'Das Ergebnis gibt es nach dem Ende.', hideLead:'Das Ergebnis sehen nur R4/R5.', hideVote:'Das Ergebnis siehst du nach deiner Stimme.', close:'Beenden', reopen:'Wieder öffnen', del:'Löschen', delQ:'Umfrage wirklich löschen?', grp:'Mentorengruppe {g}', only:'nur {r}', anonT:'anonym', multiT:'Mehrfachauswahl', othersT:'Eigene Antworten', notFor:'Nicht für dich – du siehst sie als Leitung.', need:'Bitte eine Frage und mindestens eine Antwort eingeben.', err:'Das hat nicht geklappt – bitte nochmal versuchen.', pick:'Wähle eine Antwort.' },
  en: { title:'📊 Polls', add:'➕ New poll', q:'Question', opts:'Answers – one per line', multi:'Allow several answers', other:'Allow own answer', anon:'Anonymous – nobody sees who chose what',
    res:'Results visible', resLive:'after voting', resEnd:'only after the end', resLead:'only to R4/R5 and me', ends:'Ends on (optional)', who:'For whom', all:'Whole alliance', ranks:'Only these ranks (none ticked = all)', grpOnly:'For your mentor group',
    create:'Start poll', cancel:'Cancel', vote:'Vote', change:'Change vote', remove:'Withdraw vote', otherPh:'Own answer …', votes:'{n} votes', saved:'Your vote is saved.', endsAt:'ends {d}', closed:'ended', by:'by {n}',
    hideEnd:'Results are shown after the end.', hideLead:'Only R4/R5 see the results.', hideVote:'You see the results after voting.', close:'End', reopen:'Reopen', del:'Delete', delQ:'Really delete this poll?', grp:'Mentor group {g}', only:'only {r}', anonT:'anonymous', multiT:'multiple choice', othersT:'Own answers', notFor:'Not for you – you see it as a leader.', need:'Please enter a question and at least one answer.', err:'That didn’t work – please try again.', pick:'Pick an answer.' },
  fr: { title:'📊 Sondages', add:'➕ Nouveau sondage', q:'Question', opts:'Réponses – une par ligne', multi:'Plusieurs réponses possibles', other:'Autoriser une réponse libre', anon:'Anonyme – personne ne voit qui a choisi quoi',
    res:'Résultats visibles', resLive:'après avoir voté', resEnd:'seulement après la fin', resLead:'seulement pour R4/R5 et moi', ends:'Se termine le (facultatif)', who:'Pour qui', all:'Toute l’alliance', ranks:'Seulement ces rangs (rien coché = tous)', grpOnly:'Pour ton groupe de mentorat',
    create:'Lancer le sondage', cancel:'Annuler', vote:'Voter', change:'Modifier mon vote', remove:'Retirer mon vote', otherPh:'Ta réponse …', votes:'{n} votes', saved:'Ton vote est enregistré.', endsAt:'se termine {d}', closed:'terminé', by:'par {n}',
    hideEnd:'Les résultats seront visibles après la fin.', hideLead:'Seuls R4/R5 voient les résultats.', hideVote:'Tu verras les résultats après avoir voté.', close:'Terminer', reopen:'Rouvrir', del:'Supprimer', delQ:'Vraiment supprimer ce sondage ?', grp:'Groupe de mentorat {g}', only:'seulement {r}', anonT:'anonyme', multiT:'choix multiple', othersT:'Réponses libres', notFor:'Pas pour toi – tu le vois en tant que responsable.', need:'Saisis une question et au moins une réponse.', err:'Ça n’a pas marché – réessaie.', pick:'Choisis une réponse.' },
  es: { title:'📊 Encuestas', add:'➕ Nueva encuesta', q:'Pregunta', opts:'Respuestas – una por línea', multi:'Permitir varias respuestas', other:'Permitir respuesta propia', anon:'Anónima – nadie ve quién eligió qué',
    res:'Resultados visibles', resLive:'después de votar', resEnd:'solo al terminar', resLead:'solo para R4/R5 y yo', ends:'Termina el (opcional)', who:'Para quién', all:'Toda la alianza', ranks:'Solo estos rangos (ninguno marcado = todos)', grpOnly:'Para tu grupo de mentoría',
    create:'Iniciar encuesta', cancel:'Cancelar', vote:'Votar', change:'Cambiar voto', remove:'Retirar voto', otherPh:'Respuesta propia …', votes:'{n} votos', saved:'Tu voto está guardado.', endsAt:'termina {d}', closed:'terminada', by:'de {n}',
    hideEnd:'Los resultados se ven al terminar.', hideLead:'Solo R4/R5 ven los resultados.', hideVote:'Verás los resultados después de votar.', close:'Terminar', reopen:'Reabrir', del:'Eliminar', delQ:'¿Eliminar esta encuesta?', grp:'Grupo de mentoría {g}', only:'solo {r}', anonT:'anónima', multiT:'selección múltiple', othersT:'Respuestas propias', notFor:'No es para ti – la ves como líder.', need:'Escribe una pregunta y al menos una respuesta.', err:'No funcionó – inténtalo de nuevo.', pick:'Elige una respuesta.' },
  pt: { title:'📊 Enquetes', add:'➕ Nova enquete', q:'Pergunta', opts:'Respostas – uma por linha', multi:'Permitir várias respostas', other:'Permitir resposta própria', anon:'Anônima – ninguém vê quem escolheu o quê',
    res:'Resultados visíveis', resLive:'depois de votar', resEnd:'só depois do fim', resLead:'só para R4/R5 e eu', ends:'Termina em (opcional)', who:'Para quem', all:'Aliança inteira', ranks:'Só estes ranks (nenhum marcado = todos)', grpOnly:'Para o seu grupo de mentoria',
    create:'Iniciar enquete', cancel:'Cancelar', vote:'Votar', change:'Mudar voto', remove:'Retirar voto', otherPh:'Resposta própria …', votes:'{n} votos', saved:'Seu voto foi salvo.', endsAt:'termina {d}', closed:'encerrada', by:'por {n}',
    hideEnd:'Os resultados aparecem depois do fim.', hideLead:'Só R4/R5 veem os resultados.', hideVote:'Você vê os resultados depois de votar.', close:'Encerrar', reopen:'Reabrir', del:'Excluir', delQ:'Excluir esta enquete?', grp:'Grupo de mentoria {g}', only:'só {r}', anonT:'anônima', multiT:'múltipla escolha', othersT:'Respostas próprias', notFor:'Não é para você – você vê como líder.', need:'Digite uma pergunta e pelo menos uma resposta.', err:'Não funcionou – tente de novo.', pick:'Escolha uma resposta.' },
  it: { title:'📊 Sondaggi', add:'➕ Nuovo sondaggio', q:'Domanda', opts:'Risposte – una per riga', multi:'Consenti più risposte', other:'Consenti risposta libera', anon:'Anonimo – nessuno vede chi ha scelto cosa',
    res:'Risultati visibili', resLive:'dopo aver votato', resEnd:'solo alla fine', resLead:'solo per R4/R5 e me', ends:'Termina il (facoltativo)', who:'Per chi', all:'Tutta l’alleanza', ranks:'Solo questi gradi (nessuno spuntato = tutti)', grpOnly:'Per il tuo gruppo di mentori',
    create:'Avvia sondaggio', cancel:'Annulla', vote:'Vota', change:'Cambia voto', remove:'Ritira voto', otherPh:'Risposta libera …', votes:'{n} voti', saved:'Il tuo voto è salvato.', endsAt:'termina {d}', closed:'terminato', by:'di {n}',
    hideEnd:'I risultati si vedono alla fine.', hideLead:'Solo R4/R5 vedono i risultati.', hideVote:'Vedrai i risultati dopo aver votato.', close:'Termina', reopen:'Riapri', del:'Elimina', delQ:'Eliminare davvero questo sondaggio?', grp:'Gruppo mentori {g}', only:'solo {r}', anonT:'anonimo', multiT:'scelta multipla', othersT:'Risposte libere', notFor:'Non è per te – lo vedi come leader.', need:'Inserisci una domanda e almeno una risposta.', err:'Non ha funzionato – riprova.', pick:'Scegli una risposta.' },
  tr: { title:'📊 Anketler', add:'➕ Yeni anket', q:'Soru', opts:'Cevaplar – her satıra bir tane', multi:'Birden fazla cevaba izin ver', other:'Kendi cevabına izin ver', anon:'Anonim – kimin neyi seçtiğini kimse görmez',
    res:'Sonuçlar görünür', resLive:'oy verdikten sonra', resEnd:'sadece bitince', resLead:'sadece R4/R5 ve bana', ends:'Bitiş (isteğe bağlı)', who:'Kimin için', all:'Tüm ittifak', ranks:'Sadece bu rütbeler (hiçbiri = hepsi)', grpOnly:'Mentor grubun için',
    create:'Anketi başlat', cancel:'İptal', vote:'Oy ver', change:'Oyu değiştir', remove:'Oyu geri çek', otherPh:'Kendi cevabın …', votes:'{n} oy', saved:'Oyun kaydedildi.', endsAt:'bitiş {d}', closed:'bitti', by:'{n} tarafından',
    hideEnd:'Sonuçlar bitince görünür.', hideLead:'Sonuçları sadece R4/R5 görür.', hideVote:'Sonuçları oy verdikten sonra görürsün.', close:'Bitir', reopen:'Yeniden aç', del:'Sil', delQ:'Bu anket gerçekten silinsin mi?', grp:'Mentor grubu {g}', only:'sadece {r}', anonT:'anonim', multiT:'çoklu seçim', othersT:'Kendi cevaplar', notFor:'Senin için değil – yönetici olarak görüyorsun.', need:'Bir soru ve en az bir cevap gir.', err:'Olmadı – tekrar dene.', pick:'Bir cevap seç.' },
  ru: { title:'📊 Опросы', add:'➕ Новый опрос', q:'Вопрос', opts:'Ответы – по одному в строке', multi:'Можно выбрать несколько', other:'Разрешить свой ответ', anon:'Анонимно – никто не видит, кто что выбрал',
    res:'Результаты видны', resLive:'после голосования', resEnd:'только после окончания', resLead:'только R4/R5 и мне', ends:'Заканчивается (необязательно)', who:'Для кого', all:'Весь альянс', ranks:'Только эти ранги (ничего не отмечено = все)', grpOnly:'Для твоей группы наставников',
    create:'Запустить опрос', cancel:'Отмена', vote:'Голосовать', change:'Изменить голос', remove:'Отозвать голос', otherPh:'Свой ответ …', votes:'голосов: {n}', saved:'Твой голос сохранён.', endsAt:'до {d}', closed:'завершён', by:'от {n}',
    hideEnd:'Результаты будут после окончания.', hideLead:'Результаты видят только R4/R5.', hideVote:'Результаты увидишь после голосования.', close:'Завершить', reopen:'Открыть снова', del:'Удалить', delQ:'Точно удалить опрос?', grp:'Группа наставников {g}', only:'только {r}', anonT:'анонимно', multiT:'несколько ответов', othersT:'Свои ответы', notFor:'Не для тебя – ты видишь его как руководство.', need:'Введи вопрос и хотя бы один ответ.', err:'Не получилось – попробуй ещё раз.', pick:'Выбери ответ.' },
  pl: { title:'📊 Ankiety', add:'➕ Nowa ankieta', q:'Pytanie', opts:'Odpowiedzi – jedna w wierszu', multi:'Można wybrać kilka', other:'Zezwól na własną odpowiedź', anon:'Anonimowa – nikt nie widzi, kto co wybrał',
    res:'Wyniki widoczne', resLive:'po oddaniu głosu', resEnd:'dopiero po zakończeniu', resLead:'tylko dla R4/R5 i mnie', ends:'Kończy się (opcjonalnie)', who:'Dla kogo', all:'Cały sojusz', ranks:'Tylko te rangi (nic nie zaznaczone = wszystkie)', grpOnly:'Dla twojej grupy mentorskiej',
    create:'Rozpocznij ankietę', cancel:'Anuluj', vote:'Głosuj', change:'Zmień głos', remove:'Wycofaj głos', otherPh:'Własna odpowiedź …', votes:'głosów: {n}', saved:'Twój głos został zapisany.', endsAt:'kończy się {d}', closed:'zakończona', by:'od {n}',
    hideEnd:'Wyniki będą po zakończeniu.', hideLead:'Wyniki widzą tylko R4/R5.', hideVote:'Wyniki zobaczysz po oddaniu głosu.', close:'Zakończ', reopen:'Otwórz ponownie', del:'Usuń', delQ:'Na pewno usunąć ankietę?', grp:'Grupa mentorska {g}', only:'tylko {r}', anonT:'anonimowa', multiT:'wielokrotny wybór', othersT:'Własne odpowiedzi', notFor:'Nie dla ciebie – widzisz ją jako lider.', need:'Wpisz pytanie i co najmniej jedną odpowiedź.', err:'Nie udało się – spróbuj ponownie.', pick:'Wybierz odpowiedź.' }
};
var Umfragen = (function(){
  var A = null, D = null, FOR = null, FORM = false, SEL = {}, MSG = {};
  function T(){ return POLL_I18N[A.lang()] || POLL_I18N.en; }
  function el(tag, cls, txt){ var x = document.createElement(tag); if (cls) x.className = cls; if (txt !== undefined && txt !== null) x.textContent = txt; return x; }
  function fmt(d){ return new Date(d).toLocaleString(A.lang(), { weekday:'short', day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }); }
  function load(){
    var me = A.me(); if (!me) { D = null; FOR = null; render(); return; }
    FOR = me;
    rpc('polls_list', { p_token: A.tok() }).then(function(r){ if (FOR !== me) return; D = r && r.ok ? r : null; render(); A.changed(); }).catch(function(){ D = null; render(); });
  }
  function pending(){ return D ? D.items.filter(function(p){ return p.open && p.can && !p.mine; }).length : 0; }
  function canCreate(){ return D && (D.lv === 'lead' || D.lv === 'mentor'); }
  function render(){
    var box = document.getElementById('pollBox'); if (!box) return; box.innerHTML = '';
    if (!D || !A.me() || (!D.items.length && !canCreate())) return;
    var L = T(), head = el('div', 'card poll-head');
    var h = el('div', 'sq-h'); h.appendChild(el('b', '', L.title)); head.appendChild(h);
    if (canCreate()) {
      if (FORM) head.appendChild(form(L));
      else { var nb = el('button', 'ghost poll-new', L.add); nb.type = 'button'; nb.addEventListener('click', function(){ FORM = true; render(); }); head.appendChild(nb); }
    }
    box.appendChild(head);
    D.items.forEach(function(p){ box.appendChild(card(p, L)); });
  }
  function form(L){
    var f = el('div', 'poll-form');
    function row(lbl, inp){ var w = el('label', 'poll-l'); w.appendChild(el('span', '', lbl)); w.appendChild(inp); f.appendChild(w); return inp; }
    function chk(lbl){ var w = el('label', 'poll-c'), c = el('input'); c.type = 'checkbox'; w.appendChild(c); w.appendChild(el('span', '', lbl)); f.appendChild(w); return c; }
    var q = row(L.q, el('input')); q.maxLength = 300;
    var o = row(L.opts, el('textarea')); o.rows = 4;
    var mu = chk(L.multi), ot = chk(L.other), an = chk(L.anon);
    var rs = row(L.res, el('select')); [['live', L.resLive], ['end', L.resEnd], ['lead', L.resLead]].forEach(function(x){ var op = el('option', '', x[1]); op.value = x[0]; rs.appendChild(op); });
    var en = row(L.ends, el('input')); en.type = 'datetime-local';
    var rk = [];
    if (D.lv === 'lead') {
      f.appendChild(el('div', 'poll-l', L.ranks));
      var rw = el('div', 'poll-ranks'); ['R1','R2','R3','R4','R5'].forEach(function(r){ var w = el('label', 'poll-c'), c = el('input'); c.type = 'checkbox'; c.value = r; rk.push(c); w.appendChild(c); w.appendChild(el('span', '', r)); rw.appendChild(w); }); f.appendChild(rw);
    } else f.appendChild(el('div', 'hint', L.grpOnly));
    var msg = el('div', 'hint'), bw = el('div', 'poll-btns'), ok = el('button', 'btn', L.create), no = el('button', 'ghost', L.cancel); ok.type = no.type = 'button';
    no.addEventListener('click', function(){ FORM = false; render(); });
    ok.addEventListener('click', function(){
      var opts = o.value.split('\n').map(function(s){ return s.trim(); }).filter(Boolean);
      if (!q.value.trim() || !opts.length) { msg.textContent = L.need; return; }
      ok.disabled = true;
      var data = { q: q.value.trim(), opts: opts, multi: mu.checked, other: ot.checked, anon: an.checked, results: rs.value,
        closes_at: en.value ? new Date(en.value).toISOString() : '', ranks: rk.filter(function(c){ return c.checked; }).map(function(c){ return c.value; }) };
      rpc('poll_create', { p_token: A.tok(), p_data: data }).then(function(r){ if (!r || !r.ok) throw new Error(r && r.err); FORM = false; load(); })
        .catch(function(e){ ok.disabled = false; if (String(e && e.message).indexOf('SESSION') >= 0) { A.expired(); return; } msg.textContent = L.err; });
    });
    bw.appendChild(ok); bw.appendChild(no); f.appendChild(bw); f.appendChild(msg);
    return f;
  }
  function card(p, L){
    var c = el('div', 'card poll' + (p.open ? '' : ' poll-done'));
    c.appendChild(el('div', 'poll-q', p.q));
    var tags = [L.by.replace('{n}', p.by)];
    if (!p.open) tags.push(L.closed); else if (p.closes_at) tags.push(L.endsAt.replace('{d}', fmt(p.closes_at)));
    if (p.grp !== null && p.grp !== undefined) tags.push(L.grp.replace('{g}', p.grp + 1));
    if (p.ranks && p.ranks.length) tags.push(L.only.replace('{r}', p.ranks.join(', ')));
    if (p.multi) tags.push(L.multiT); if (p.anon) tags.push(L.anonT);
    tags.push(L.votes.replace('{n}', p.n));
    c.appendChild(el('div', 'hint poll-tags', tags.join(' · ')));
    if (!p.can) c.appendChild(el('div', 'hint', L.notFor));
    var sel = SEL[p.id] || (SEL[p.id] = { c: p.mine ? p.mine.c.slice() : [], o: p.mine && p.mine.o || '' });
    var res = p.res, tot = res ? Math.max(1, p.n) : 1;
    p.opts.forEach(function(txt, i){
      var on = sel.c.indexOf(i) >= 0, b = el('button', 'evopt poll-opt' + (on ? ' on' : '')); b.type = 'button';
      b.appendChild(el('span', 'poll-mark', p.multi ? (on ? '☑' : '☐') : (on ? '◉' : '○')));
      b.appendChild(el('span', 'poll-t', txt));
      if (res) {
        var k = res.counts[i] || 0; b.appendChild(el('span', 'poll-n', k + ' · ' + Math.round(k * 100 / tot) + ' %'));
        var bar = el('span', 'poll-bar'); bar.style.width = Math.round(k * 100 / tot) + '%'; b.appendChild(bar);
        if (res.voters) { var who = res.voters.filter(function(v){ return v.c.indexOf(i) >= 0; }).map(function(v){ return v.n; }); if (who.length) b.appendChild(el('span', 'poll-who', who.join(', '))); }
      }
      b.disabled = !p.open || !p.can;
      b.addEventListener('click', function(){
        var j = sel.c.indexOf(i);
        if (p.multi) { if (j >= 0) sel.c.splice(j, 1); else sel.c.push(i); }
        else { sel.c = j >= 0 ? [] : [i]; sel.o = ''; }
        render();
      });
      c.appendChild(b);
    });
    var oi = null;
    if (p.other && p.open && p.can) {
      oi = el('input', 'poll-other'); oi.type = 'text'; oi.maxLength = 120; oi.placeholder = L.otherPh; oi.value = sel.o;
      oi.addEventListener('input', function(){ sel.o = oi.value; if (!p.multi && oi.value.trim() && sel.c.length) { sel.c = []; Array.prototype.forEach.call(c.querySelectorAll('.poll-opt'), function(x){ x.classList.remove('on'); x.firstChild.textContent = '○'; }); } });
      c.appendChild(oi);
    }
    if (res && res.other && res.other.length) {
      var ow = el('div', 'poll-others'); ow.appendChild(el('b', '', L.othersT));
      res.other.forEach(function(x){ ow.appendChild(el('div', '', '„' + x.t + '“' + (x.n ? ' – ' + x.n : ''))); }); c.appendChild(ow);
    }
    if (!res) c.appendChild(el('div', 'hint', p.results === 'lead' ? L.hideLead : p.results === 'end' ? L.hideEnd : L.hideVote));
    if (p.open && p.can) {
      var bw = el('div', 'poll-btns'), vb = el('button', 'btn', p.mine ? L.change : L.vote); vb.type = 'button';
      vb.addEventListener('click', function(){
        if (!sel.c.length && !(sel.o || '').trim()) { MSG[p.id] = L.pick; render(); return; }
        send(p, sel.c, sel.o);
      });
      bw.appendChild(vb);
      if (p.mine) { var rb = el('button', 'ghost', L.remove); rb.type = 'button'; rb.addEventListener('click', function(){ SEL[p.id] = { c: [], o: '' }; send(p, [], ''); }); bw.appendChild(rb); }
      c.appendChild(bw);
    }
    if (MSG[p.id]) c.appendChild(el('div', 'hint poll-msg', MSG[p.id]));
    if (D.lv === 'lead' || p.by === A.me()) {
      var mw = el('div', 'poll-admin');
      [[p.open ? 'close' : 'reopen', p.open ? L.close : L.reopen], ['delete', L.del]].forEach(function(x){
        var m = el('button', 'mini' + (x[0] === 'delete' ? ' danger' : ''), x[1]); m.type = 'button';
        m.addEventListener('click', function(){ if (x[0] === 'delete' && !confirm(L.delQ)) return; m.disabled = true;
          rpc('poll_manage', { p_token: A.tok(), p_id: p.id, p_action: x[0] }).then(load).catch(function(){ m.disabled = false; MSG[p.id] = L.err; render(); }); });
        mw.appendChild(m);
      });
      c.appendChild(mw);
    }
    return c;
  }
  function send(p, choices, other){
    var L = T();
    rpc('poll_vote', { p_token: A.tok(), p_id: p.id, p_choices: choices, p_other: other || null }).then(function(r){
      if (r && r.ok === false) throw new Error(r.err || 'ERR');
      MSG[p.id] = choices.length || (other || '').trim() ? L.saved : ''; delete SEL[p.id]; load();
    }).catch(function(e){ if (String(e && e.message).indexOf('SESSION') >= 0) { A.expired(); return; } MSG[p.id] = L.err; render(); });
  }
  return { init: function(api){ A = api; }, ready: function(){ return !!A; }, who: function(){ return FOR; }, load: load, render: render, pending: pending };
})();
