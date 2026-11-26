/* SKWS Squads – Spielerseite: Abwesenheit, Entwicklung (Diagramm), Allianz-Duell, Willkommens-Checkliste, Kalender, Hilfe & Fragen */
var MEHR_I18N = {
  de: { awayT:'🏖️ Abwesenheit', awayHint:'Trag ein, wann du nicht spielen kannst (Urlaub, Krankheit …). R4/R5 sehen es bei der Einteilung – fürs Fehlen in dieser Zeit gibt es keinen Malus.', awayFrom:'Von', awayTo:'Bis', awayNote:'Grund (optional, sehen nur R4/R5)', awayAdd:'Abwesenheit eintragen', awayNone:'Keine Abwesenheit eingetragen.', awayDel:'Löschen', awayBad:'Bitte gültige Daten wählen (Ende heute oder später, höchstens 180 Tage).', awayUntil:'🏖️ abwesend bis {d}', awaySoon:'🏖️ abwesend ab {d}',
    devT:'📈 Entwicklung', devHint:'Gesamtstärke der Trupps laut den Meldungen (Mio.).', devNone:'Noch zu wenige Meldungen für ein Diagramm.', devChg:'{p} seit {d}',
    vsT:'⚔️ Allianz-Duell', vsHint:'Trag deine Tagespunkte aus dem Allianz-Duell ein. R4/R5 können sie korrigieren.', vsSum:'Woche', vsRank:'Platz {r} von {n}', vsSave:'Speichern', vsSaved:'Gespeichert.', vsLocked:'Diesen Tag haben R4/R5 schon eingetragen.', vsNone:'Diese Woche noch keine Punkte.', vsTop:'⚔️ Allianz-Duell – diese Woche', vsMore:'Alle {n} anzeigen', vsLess:'Weniger anzeigen', days:['Mo','Di','Mi','Do','Fr','Sa','So'],
    onbT:'👋 Deine ersten Schritte', onbHint:'Wird automatisch abgehakt – dein Mentor sieht deinen Fortschritt.', onbDone:'{a} von {b} erledigt', steps:{ pin:'Mit PIN angemeldet', entry:'Trupps eingetragen', group:'In einer Mentorengruppe', joined:'Der Gruppe im Spiel beigetreten', avatar:'Profilbild hochgeladen', signup:'Bei einem Event angemeldet', played:'Bei einem Event mitgespielt' },
    calT:'📅 Kalender', calTz:'Zeiten in deutscher Zeit, in Klammern deine Ortszeit.', calNone:'Keine Termine in den nächsten 14 Tagen.', today:'Heute', tomorrow:'Morgen', weekly:'jede Woche', calYou:'bei dir {t}', calMine:'dein Einsatz', calTeam:'Team {t}', kinds:{ ds:'Wüstensturm', cs:'Schluchtsturm', zombie:'Zombie-Belagerung', vs:'Allianz-Duell', meet:'Treffen', other:'Termin' },
    hlpT:'🤝 Hilfe & Fragen', hlpHint:'Frag die Allianz, such Mitspieler für Rallyes oder Events oder teil einen Tipp. (Ressourcen lassen sich im Spiel nicht tauschen – hier geht es um Wissen und Zusammenspiel.)', kindsH:{ ask:'❓ Frage', team:'👥 Suche Mitspieler', tip:'💡 Tipp' }, hlpPh:'Was möchtest du fragen oder teilen?', hlpPost:'Posten', hlpReply:'Antworten', hlpReplyPh:'Deine Antwort …', hlpDone:'✓ Erledigt', hlpReopen:'Wieder öffnen', hlpDel:'Löschen', hlpDelQ:'Beitrag löschen?', hlpNone:'Noch keine Beiträge – stell die erste Frage!', hlpSolved:'erledigt', hlpLimit:'Du hast heute schon 5 Beiträge geschrieben.', err:'Das hat nicht geklappt – bitte nochmal versuchen.' },
  en: { awayT:'🏖️ Absence', awayHint:'Enter when you can’t play (holiday, illness …). R4/R5 see it when assigning teams – missing during that time gives no penalty.', awayFrom:'From', awayTo:'To', awayNote:'Reason (optional, only R4/R5 see it)', awayAdd:'Add absence', awayNone:'No absence entered.', awayDel:'Delete', awayBad:'Please pick valid dates (ending today or later, at most 180 days).', awayUntil:'🏖️ away until {d}', awaySoon:'🏖️ away from {d}',
    devT:'📈 Progress', devHint:'Total squad power according to the reports (M).', devNone:'Not enough reports yet for a chart.', devChg:'{p} since {d}',
    vsT:'⚔️ Alliance Duel', vsHint:'Enter your daily Alliance Duel points. R4/R5 can correct them.', vsSum:'Week', vsRank:'Rank {r} of {n}', vsSave:'Save', vsSaved:'Saved.', vsLocked:'R4/R5 have already entered this day.', vsNone:'No points this week yet.', vsTop:'⚔️ Alliance Duel – this week', vsMore:'Show all {n}', vsLess:'Show less', days:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    onbT:'👋 Your first steps', onbHint:'Ticked automatically – your mentor sees your progress.', onbDone:'{a} of {b} done', steps:{ pin:'Signed in with PIN', entry:'Squads entered', group:'In a mentor group', joined:'Joined the group in the game', avatar:'Profile picture uploaded', signup:'Signed up for an event', played:'Played in an event' },
    calT:'📅 Calendar', calTz:'Times are German time, your local time in brackets.', calNone:'No dates in the next 14 days.', today:'Today', tomorrow:'Tomorrow', weekly:'every week', calYou:'your time {t}', calMine:'your assignment', calTeam:'Team {t}', kinds:{ ds:'Desert Storm', cs:'Canyon Storm', zombie:'Zombie Siege', vs:'Alliance Duel', meet:'Meeting', other:'Date' },
    hlpT:'🤝 Help & questions', hlpHint:'Ask the alliance, look for teammates for rallies or events, or share a tip. (Resources can’t be traded in the game – this is about knowledge and teamwork.)', kindsH:{ ask:'❓ Question', team:'👥 Looking for teammates', tip:'💡 Tip' }, hlpPh:'What would you like to ask or share?', hlpPost:'Post', hlpReply:'Reply', hlpReplyPh:'Your answer …', hlpDone:'✓ Solved', hlpReopen:'Reopen', hlpDel:'Delete', hlpDelQ:'Delete this post?', hlpNone:'No posts yet – ask the first question!', hlpSolved:'solved', hlpLimit:'You have already written 5 posts today.', err:'That didn’t work – please try again.' },
  fr: { awayT:'🏖️ Absence', awayHint:'Indique quand tu ne peux pas jouer (vacances, maladie …). R4/R5 le voient lors de l’affectation – pas de malus pour une absence pendant cette période.', awayFrom:'Du', awayTo:'Au', awayNote:'Raison (facultatif, visible seulement par R4/R5)', awayAdd:'Ajouter une absence', awayNone:'Aucune absence saisie.', awayDel:'Supprimer', awayBad:'Choisis des dates valides (fin aujourd’hui ou plus tard, 180 jours max.).', awayUntil:'🏖️ absent jusqu’au {d}', awaySoon:'🏖️ absent à partir du {d}',
    devT:'📈 Évolution', devHint:'Puissance totale des escouades selon les relevés (M).', devNone:'Pas encore assez de relevés pour un graphique.', devChg:'{p} depuis le {d}',
    vsT:'⚔️ Duel d’alliance', vsHint:'Saisis tes points quotidiens du duel d’alliance. R4/R5 peuvent les corriger.', vsSum:'Semaine', vsRank:'Place {r} sur {n}', vsSave:'Enregistrer', vsSaved:'Enregistré.', vsLocked:'R4/R5 ont déjà saisi ce jour.', vsNone:'Pas encore de points cette semaine.', vsTop:'⚔️ Duel d’alliance – cette semaine', vsMore:'Afficher les {n}', vsLess:'Afficher moins', days:['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'],
    onbT:'👋 Tes premiers pas', onbHint:'Coché automatiquement – ton mentor voit ta progression.', onbDone:'{a} sur {b} faits', steps:{ pin:'Connecté avec le PIN', entry:'Escouades saisies', group:'Dans un groupe de mentorat', joined:'Groupe rejoint dans le jeu', avatar:'Photo de profil ajoutée', signup:'Inscrit à un événement', played:'A joué un événement' },
    calT:'📅 Calendrier', calTz:'Heures en heure allemande, ton heure locale entre parenthèses.', calNone:'Aucun rendez-vous dans les 14 prochains jours.', today:'Aujourd’hui', tomorrow:'Demain', weekly:'chaque semaine', calYou:'chez toi {t}', calMine:'ton affectation', calTeam:'Équipe {t}', kinds:{ ds:'Tempête du désert', cs:'Tempête du canyon', zombie:'Siège zombie', vs:'Duel d’alliance', meet:'Réunion', other:'Rendez-vous' },
    hlpT:'🤝 Aide & questions', hlpHint:'Pose une question à l’alliance, cherche des coéquipiers pour des rallyes ou des événements, ou partage une astuce. (On ne peut pas échanger de ressources dans le jeu – ici, il s’agit de savoir et d’entraide.)', kindsH:{ ask:'❓ Question', team:'👥 Cherche coéquipiers', tip:'💡 Astuce' }, hlpPh:'Que veux-tu demander ou partager ?', hlpPost:'Publier', hlpReply:'Répondre', hlpReplyPh:'Ta réponse …', hlpDone:'✓ Résolu', hlpReopen:'Rouvrir', hlpDel:'Supprimer', hlpDelQ:'Supprimer ce message ?', hlpNone:'Pas encore de messages – pose la première question !', hlpSolved:'résolu', hlpLimit:'Tu as déjà écrit 5 messages aujourd’hui.', err:'Ça n’a pas marché – réessaie.' },
  es: { awayT:'🏖️ Ausencia', awayHint:'Indica cuándo no puedes jugar (vacaciones, enfermedad …). R4/R5 lo ven al asignar equipos – faltar en ese tiempo no da penalización.', awayFrom:'Desde', awayTo:'Hasta', awayNote:'Motivo (opcional, solo lo ven R4/R5)', awayAdd:'Añadir ausencia', awayNone:'No hay ausencias.', awayDel:'Eliminar', awayBad:'Elige fechas válidas (fin hoy o más tarde, máximo 180 días).', awayUntil:'🏖️ ausente hasta {d}', awaySoon:'🏖️ ausente desde {d}',
    devT:'📈 Progreso', devHint:'Poder total de las escuadras según los registros (M).', devNone:'Aún no hay suficientes registros para un gráfico.', devChg:'{p} desde {d}',
    vsT:'⚔️ Duelo de alianza', vsHint:'Anota tus puntos diarios del duelo de alianza. R4/R5 pueden corregirlos.', vsSum:'Semana', vsRank:'Puesto {r} de {n}', vsSave:'Guardar', vsSaved:'Guardado.', vsLocked:'R4/R5 ya anotaron este día.', vsNone:'Aún no hay puntos esta semana.', vsTop:'⚔️ Duelo de alianza – esta semana', vsMore:'Mostrar los {n}', vsLess:'Mostrar menos', days:['Lu','Ma','Mi','Ju','Vi','Sá','Do'],
    onbT:'👋 Tus primeros pasos', onbHint:'Se marca automáticamente – tu mentor ve tu progreso.', onbDone:'{a} de {b} hechos', steps:{ pin:'Sesión iniciada con PIN', entry:'Escuadras registradas', group:'En un grupo de mentoría', joined:'Unido al grupo en el juego', avatar:'Foto de perfil subida', signup:'Inscrito en un evento', played:'Jugó un evento' },
    calT:'📅 Calendario', calTz:'Horas en hora alemana, tu hora local entre paréntesis.', calNone:'No hay citas en los próximos 14 días.', today:'Hoy', tomorrow:'Mañana', weekly:'cada semana', calYou:'tu hora {t}', calMine:'tu misión', calTeam:'Equipo {t}', kinds:{ ds:'Tormenta del desierto', cs:'Tormenta del cañón', zombie:'Asedio zombi', vs:'Duelo de alianza', meet:'Reunión', other:'Cita' },
    hlpT:'🤝 Ayuda y preguntas', hlpHint:'Pregunta a la alianza, busca compañeros para rallies o eventos, o comparte un consejo. (Los recursos no se pueden intercambiar en el juego – aquí se trata de conocimiento y trabajo en equipo.)', kindsH:{ ask:'❓ Pregunta', team:'👥 Busco compañeros', tip:'💡 Consejo' }, hlpPh:'¿Qué quieres preguntar o compartir?', hlpPost:'Publicar', hlpReply:'Responder', hlpReplyPh:'Tu respuesta …', hlpDone:'✓ Resuelto', hlpReopen:'Reabrir', hlpDel:'Eliminar', hlpDelQ:'¿Eliminar esta publicación?', hlpNone:'Aún no hay publicaciones – ¡haz la primera pregunta!', hlpSolved:'resuelto', hlpLimit:'Ya escribiste 5 publicaciones hoy.', err:'No funcionó – inténtalo de nuevo.' },
  pt: { awayT:'🏖️ Ausência', awayHint:'Informe quando você não pode jogar (férias, doença …). R4/R5 veem isso na escalação – faltar nesse período não gera penalidade.', awayFrom:'De', awayTo:'Até', awayNote:'Motivo (opcional, só R4/R5 veem)', awayAdd:'Adicionar ausência', awayNone:'Nenhuma ausência registrada.', awayDel:'Excluir', awayBad:'Escolha datas válidas (fim hoje ou depois, no máximo 180 dias).', awayUntil:'🏖️ ausente até {d}', awaySoon:'🏖️ ausente a partir de {d}',
    devT:'📈 Evolução', devHint:'Poder total dos esquadrões segundo os registros (M).', devNone:'Ainda poucos registros para um gráfico.', devChg:'{p} desde {d}',
    vsT:'⚔️ Duelo da aliança', vsHint:'Registre seus pontos diários do duelo da aliança. R4/R5 podem corrigi-los.', vsSum:'Semana', vsRank:'{r}º de {n}', vsSave:'Salvar', vsSaved:'Salvo.', vsLocked:'R4/R5 já registraram este dia.', vsNone:'Ainda sem pontos esta semana.', vsTop:'⚔️ Duelo da aliança – esta semana', vsMore:'Mostrar todos os {n}', vsLess:'Mostrar menos', days:['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'],
    onbT:'👋 Seus primeiros passos', onbHint:'Marcado automaticamente – seu mentor vê seu progresso.', onbDone:'{a} de {b} feitos', steps:{ pin:'Entrou com PIN', entry:'Esquadrões registrados', group:'Em um grupo de mentoria', joined:'Entrou no grupo no jogo', avatar:'Foto de perfil enviada', signup:'Inscrito em um evento', played:'Jogou um evento' },
    calT:'📅 Calendário', calTz:'Horários no horário alemão, seu horário local entre parênteses.', calNone:'Nenhum compromisso nos próximos 14 dias.', today:'Hoje', tomorrow:'Amanhã', weekly:'toda semana', calYou:'seu horário {t}', calMine:'sua missão', calTeam:'Equipe {t}', kinds:{ ds:'Tempestade do deserto', cs:'Tempestade do cânion', zombie:'Cerco zumbi', vs:'Duelo da aliança', meet:'Reunião', other:'Compromisso' },
    hlpT:'🤝 Ajuda e perguntas', hlpHint:'Pergunte à aliança, procure parceiros para rallies ou eventos, ou compartilhe uma dica. (Recursos não podem ser trocados no jogo – aqui o foco é conhecimento e trabalho em equipe.)', kindsH:{ ask:'❓ Pergunta', team:'👥 Procuro parceiros', tip:'💡 Dica' }, hlpPh:'O que você quer perguntar ou compartilhar?', hlpPost:'Publicar', hlpReply:'Responder', hlpReplyPh:'Sua resposta …', hlpDone:'✓ Resolvido', hlpReopen:'Reabrir', hlpDel:'Excluir', hlpDelQ:'Excluir esta publicação?', hlpNone:'Ainda sem publicações – faça a primeira pergunta!', hlpSolved:'resolvido', hlpLimit:'Você já escreveu 5 publicações hoje.', err:'Não funcionou – tente de novo.' },
  it: { awayT:'🏖️ Assenza', awayHint:'Indica quando non puoi giocare (vacanza, malattia …). R4/R5 lo vedono nelle assegnazioni – mancare in quel periodo non dà malus.', awayFrom:'Dal', awayTo:'Al', awayNote:'Motivo (facoltativo, lo vedono solo R4/R5)', awayAdd:'Aggiungi assenza', awayNone:'Nessuna assenza inserita.', awayDel:'Elimina', awayBad:'Scegli date valide (fine oggi o dopo, massimo 180 giorni).', awayUntil:'🏖️ assente fino al {d}', awaySoon:'🏖️ assente dal {d}',
    devT:'📈 Andamento', devHint:'Potenza totale delle squadre secondo le segnalazioni (M).', devNone:'Ancora troppo poche segnalazioni per un grafico.', devChg:'{p} dal {d}',
    vsT:'⚔️ Duello d’alleanza', vsHint:'Inserisci i tuoi punti giornalieri del duello d’alleanza. R4/R5 possono correggerli.', vsSum:'Settimana', vsRank:'{r}° di {n}', vsSave:'Salva', vsSaved:'Salvato.', vsLocked:'R4/R5 hanno già inserito questo giorno.', vsNone:'Ancora nessun punto questa settimana.', vsTop:'⚔️ Duello d’alleanza – questa settimana', vsMore:'Mostra tutti i {n}', vsLess:'Mostra meno', days:['Lun','Mar','Mer','Gio','Ven','Sab','Dom'],
    onbT:'👋 I tuoi primi passi', onbHint:'Spuntato automaticamente – il tuo mentore vede i tuoi progressi.', onbDone:'{a} di {b} fatti', steps:{ pin:'Accesso con PIN', entry:'Squadre inserite', group:'In un gruppo di mentori', joined:'Entrato nel gruppo nel gioco', avatar:'Foto profilo caricata', signup:'Iscritto a un evento', played:'Ha giocato un evento' },
    calT:'📅 Calendario', calTz:'Orari in ora tedesca, la tua ora locale tra parentesi.', calNone:'Nessun appuntamento nei prossimi 14 giorni.', today:'Oggi', tomorrow:'Domani', weekly:'ogni settimana', calYou:'ora tua {t}', calMine:'il tuo incarico', calTeam:'Squadra {t}', kinds:{ ds:'Tempesta del deserto', cs:'Tempesta del canyon', zombie:'Assedio zombie', vs:'Duello d’alleanza', meet:'Incontro', other:'Appuntamento' },
    hlpT:'🤝 Aiuto e domande', hlpHint:'Chiedi all’alleanza, cerca compagni per rally o eventi, o condividi un consiglio. (Le risorse non si possono scambiare nel gioco – qui si parla di conoscenze e gioco di squadra.)', kindsH:{ ask:'❓ Domanda', team:'👥 Cerco compagni', tip:'💡 Consiglio' }, hlpPh:'Cosa vuoi chiedere o condividere?', hlpPost:'Pubblica', hlpReply:'Rispondi', hlpReplyPh:'La tua risposta …', hlpDone:'✓ Risolto', hlpReopen:'Riapri', hlpDel:'Elimina', hlpDelQ:'Eliminare questo post?', hlpNone:'Ancora nessun post – fai la prima domanda!', hlpSolved:'risolto', hlpLimit:'Hai già scritto 5 post oggi.', err:'Non ha funzionato – riprova.' },
  tr: { awayT:'🏖️ Yokluk', awayHint:'Oynayamayacağın zamanı gir (tatil, hastalık …). R4/R5 takım dağıtırken görür – bu sürede katılmamak ceza getirmez.', awayFrom:'Başlangıç', awayTo:'Bitiş', awayNote:'Sebep (isteğe bağlı, sadece R4/R5 görür)', awayAdd:'Yokluk ekle', awayNone:'Girilmiş yokluk yok.', awayDel:'Sil', awayBad:'Geçerli tarihler seç (bitiş bugün veya sonrası, en fazla 180 gün).', awayUntil:'🏖️ {d} tarihine kadar yok', awaySoon:'🏖️ {d} tarihinden itibaren yok',
    devT:'📈 Gelişim', devHint:'Kayıtlara göre birliklerin toplam gücü (M).', devNone:'Grafik için henüz yeterli kayıt yok.', devChg:'{d} tarihinden beri {p}',
    vsT:'⚔️ İttifak Düellosu', vsHint:'İttifak düellosundaki günlük puanlarını gir. R4/R5 düzeltebilir.', vsSum:'Hafta', vsRank:'{n} kişide {r}.', vsSave:'Kaydet', vsSaved:'Kaydedildi.', vsLocked:'Bu günü R4/R5 zaten girdi.', vsNone:'Bu hafta henüz puan yok.', vsTop:'⚔️ İttifak Düellosu – bu hafta', vsMore:'{n} kişinin hepsini göster', vsLess:'Daha az göster', days:['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'],
    onbT:'👋 İlk adımların', onbHint:'Otomatik işaretlenir – mentorun ilerlemeni görür.', onbDone:'{b} adımın {a} tanesi tamam', steps:{ pin:'PIN ile giriş yapıldı', entry:'Birlikler girildi', group:'Bir mentor grubunda', joined:'Oyunda gruba katıldı', avatar:'Profil resmi yüklendi', signup:'Bir etkinliğe kayıt oldu', played:'Bir etkinlikte oynadı' },
    calT:'📅 Takvim', calTz:'Saatler Alman saatiyle, parantez içinde senin yerel saatin.', calNone:'Önümüzdeki 14 günde etkinlik yok.', today:'Bugün', tomorrow:'Yarın', weekly:'her hafta', calYou:'senin saatin {t}', calMine:'görevin', calTeam:'Takım {t}', kinds:{ ds:'Çöl Fırtınası', cs:'Kanyon Fırtınası', zombie:'Zombi Kuşatması', vs:'İttifak Düellosu', meet:'Toplantı', other:'Etkinlik' },
    hlpT:'🤝 Yardım ve sorular', hlpHint:'İttifaka sor, ralli veya etkinlikler için takım arkadaşı ara ya da bir ipucu paylaş. (Oyunda kaynak takası yapılamaz – burada bilgi ve takım çalışması önemli.)', kindsH:{ ask:'❓ Soru', team:'👥 Takım arkadaşı arıyorum', tip:'💡 İpucu' }, hlpPh:'Ne sormak veya paylaşmak istiyorsun?', hlpPost:'Paylaş', hlpReply:'Cevapla', hlpReplyPh:'Cevabın …', hlpDone:'✓ Çözüldü', hlpReopen:'Yeniden aç', hlpDel:'Sil', hlpDelQ:'Bu gönderi silinsin mi?', hlpNone:'Henüz gönderi yok – ilk soruyu sen sor!', hlpSolved:'çözüldü', hlpLimit:'Bugün zaten 5 gönderi yazdın.', err:'Olmadı – tekrar dene.' },
  ru: { awayT:'🏖️ Отсутствие', awayHint:'Укажи, когда не можешь играть (отпуск, болезнь …). R4/R5 видят это при распределении – за пропуск в это время штрафа нет.', awayFrom:'С', awayTo:'По', awayNote:'Причина (необязательно, видят только R4/R5)', awayAdd:'Добавить отсутствие', awayNone:'Отсутствий нет.', awayDel:'Удалить', awayBad:'Выбери корректные даты (конец сегодня или позже, не более 180 дней).', awayUntil:'🏖️ отсутствует до {d}', awaySoon:'🏖️ отсутствует с {d}',
    devT:'📈 Развитие', devHint:'Общая мощь отрядов по отчётам (млн).', devNone:'Пока мало отчётов для графика.', devChg:'{p} с {d}',
    vsT:'⚔️ Дуэль альянсов', vsHint:'Вноси свои дневные очки дуэли альянсов. R4/R5 могут их исправить.', vsSum:'Неделя', vsRank:'Место {r} из {n}', vsSave:'Сохранить', vsSaved:'Сохранено.', vsLocked:'Этот день уже внесли R4/R5.', vsNone:'На этой неделе ещё нет очков.', vsTop:'⚔️ Дуэль альянсов – эта неделя', vsMore:'Показать всех ({n})', vsLess:'Показать меньше', days:['Пн','Вт','Ср','Чт','Пт','Сб','Вс'],
    onbT:'👋 Твои первые шаги', onbHint:'Отмечается автоматически – наставник видит твой прогресс.', onbDone:'Выполнено {a} из {b}', steps:{ pin:'Вход с PIN', entry:'Отряды внесены', group:'В группе наставников', joined:'Вступил в группу в игре', avatar:'Аватар загружен', signup:'Записался на событие', played:'Сыграл в событии' },
    calT:'📅 Календарь', calTz:'Время по Германии, в скобках твоё местное время.', calNone:'В ближайшие 14 дней событий нет.', today:'Сегодня', tomorrow:'Завтра', weekly:'каждую неделю', calYou:'у тебя {t}', calMine:'твоё задание', calTeam:'Команда {t}', kinds:{ ds:'Буря в пустыне', cs:'Буря в каньоне', zombie:'Осада зомби', vs:'Дуэль альянсов', meet:'Встреча', other:'Событие' },
    hlpT:'🤝 Помощь и вопросы', hlpHint:'Спроси альянс, найди напарников для ралли или событий или поделись советом. (Обмениваться ресурсами в игре нельзя – здесь речь о знаниях и командной игре.)', kindsH:{ ask:'❓ Вопрос', team:'👥 Ищу напарников', tip:'💡 Совет' }, hlpPh:'О чём хочешь спросить или чем поделиться?', hlpPost:'Опубликовать', hlpReply:'Ответить', hlpReplyPh:'Твой ответ …', hlpDone:'✓ Решено', hlpReopen:'Открыть снова', hlpDel:'Удалить', hlpDelQ:'Удалить сообщение?', hlpNone:'Пока нет сообщений – задай первый вопрос!', hlpSolved:'решено', hlpLimit:'Сегодня ты уже написал 5 сообщений.', err:'Не получилось – попробуй ещё раз.' },
  pl: { awayT:'🏖️ Nieobecność', awayHint:'Wpisz, kiedy nie możesz grać (urlop, choroba …). R4/R5 widzą to przy przydziale – za nieobecność w tym czasie nie ma kary.', awayFrom:'Od', awayTo:'Do', awayNote:'Powód (opcjonalnie, widzą tylko R4/R5)', awayAdd:'Dodaj nieobecność', awayNone:'Brak wpisanych nieobecności.', awayDel:'Usuń', awayBad:'Wybierz poprawne daty (koniec dziś lub później, maks. 180 dni).', awayUntil:'🏖️ nieobecny do {d}', awaySoon:'🏖️ nieobecny od {d}',
    devT:'📈 Rozwój', devHint:'Łączna siła oddziałów według zgłoszeń (mln).', devNone:'Za mało zgłoszeń na wykres.', devChg:'{p} od {d}',
    vsT:'⚔️ Pojedynek sojuszy', vsHint:'Wpisuj swoje dzienne punkty z pojedynku sojuszy. R4/R5 mogą je poprawić.', vsSum:'Tydzień', vsRank:'Miejsce {r} z {n}', vsSave:'Zapisz', vsSaved:'Zapisano.', vsLocked:'Ten dzień wpisali już R4/R5.', vsNone:'W tym tygodniu brak punktów.', vsTop:'⚔️ Pojedynek sojuszy – ten tydzień', vsMore:'Pokaż wszystkich ({n})', vsLess:'Pokaż mniej', days:['Pn','Wt','Śr','Cz','Pt','So','Nd'],
    onbT:'👋 Twoje pierwsze kroki', onbHint:'Zaznaczane automatycznie – twój mentor widzi postępy.', onbDone:'Zrobione {a} z {b}', steps:{ pin:'Zalogowano PIN-em', entry:'Oddziały wpisane', group:'W grupie mentorskiej', joined:'Dołączono do grupy w grze', avatar:'Zdjęcie profilowe dodane', signup:'Zapisano na wydarzenie', played:'Zagrano w wydarzeniu' },
    calT:'📅 Kalendarz', calTz:'Godziny według czasu niemieckiego, w nawiasie twój czas lokalny.', calNone:'Brak terminów w najbliższych 14 dniach.', today:'Dziś', tomorrow:'Jutro', weekly:'co tydzień', calYou:'u ciebie {t}', calMine:'twoje zadanie', calTeam:'Drużyna {t}', kinds:{ ds:'Burza na pustyni', cs:'Burza w kanionie', zombie:'Oblężenie zombie', vs:'Pojedynek sojuszy', meet:'Spotkanie', other:'Termin' },
    hlpT:'🤝 Pomoc i pytania', hlpHint:'Zapytaj sojusz, poszukaj partnerów do rajdów lub wydarzeń albo podziel się wskazówką. (W grze nie można wymieniać się surowcami – tu chodzi o wiedzę i współpracę.)', kindsH:{ ask:'❓ Pytanie', team:'👥 Szukam partnerów', tip:'💡 Wskazówka' }, hlpPh:'O co chcesz zapytać lub czym się podzielić?', hlpPost:'Opublikuj', hlpReply:'Odpowiedz', hlpReplyPh:'Twoja odpowiedź …', hlpDone:'✓ Rozwiązane', hlpReopen:'Otwórz ponownie', hlpDel:'Usuń', hlpDelQ:'Usunąć wpis?', hlpNone:'Brak wpisów – zadaj pierwsze pytanie!', hlpSolved:'rozwiązane', hlpLimit:'Napisałeś już dziś 5 wpisów.', err:'Nie udało się – spróbuj ponownie.' }
};
var Mehr = (function(){
  var A = null, VS_MSG = '', HIST = {}, VS = null, VS_AT = 0, VS_ALL = false, ABS = null, ABS_FOR = null, ONB = {}, HLP = null, HLP_FOR = null, HLP_KIND = 'ask', HLP_OPEN = {};
  var DAYMS = 86400000, TZ = 'Europe/Berlin';
  function L(){ return MEHR_I18N[A.lang()] || MEHR_I18N.en; }
  function el(tag, cls, txt){ var x = document.createElement(tag); if (cls) x.className = cls; if (txt !== undefined && txt !== null) x.textContent = txt; return x; }
  function btn(cls, txt, fn){ var b = el('button', cls, txt); b.type = 'button'; b.addEventListener('click', fn); return b; }
  function sess(){ return window.Funk && Funk.session(); }
  function card(title){ var c = el('div', 'card mehr'), h = el('div', 'sq-h'); h.appendChild(el('b', '', title)); c.appendChild(h); return c; }
  function ymd(d){ return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function dLocal(s){ var p = String(s).split('-'); return new Date(+p[0], p[1] - 1, +p[2]); }
  function fmtDay(s){ return dLocal(s).toLocaleDateString(A.lang(), { day:'2-digit', month:'2-digit' }); }
  function num(n){ return Number(n || 0).toLocaleString(A.lang() === 'en' ? 'en-GB' : A.lang()); }
  // deutsche Wanduhrzeit → Zeitpunkt
  function tzOff(d){ var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }).formatToParts(d).forEach(function(x){ o[x.type] = x.value; });
    return Math.round((Date.UTC(+o.year, o.month - 1, +o.day, +o.hour % 24, +o.minute) - Math.floor(d.getTime() / 60000) * 60000) / 60000); }
  function berlin(y, m, d, hh, mm){ var w = Date.UTC(y, m, d, hh, mm); return new Date(w - tzOff(new Date(w)) * 60000); }
  function berlinToday(){ var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short' }).formatToParts(new Date()).forEach(function(x){ o[x.type] = x.value; });
    return { y: +o.year, m: o.month - 1, d: +o.day, wd: { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 }[o.weekday] }; }
  function sameOffset(d){ try { return tzOff(d) === -d.getTimezoneOffset(); } catch(e){ return true; } }

  /* ---------- Abwesenheit ---------- */
  function awayOf(n){ var D = A.data(), l = D && D.away && D.away[n]; return l && l.length ? l : null; }
  function awayText(n){
    var l = awayOf(n); if (!l) return ''; var t = ymd(new Date()), x = l[0];
    return x.from <= t ? L().awayUntil.replace('{d}', fmtDay(x.to)) : L().awaySoon.replace('{d}', fmtDay(x.from));
  }
  function loadAway(){ var s = sess(); if (!s) return; ABS_FOR = s.name; rpc('absence_mine', { p_token: s.tok }).then(function(r){ ABS = r && r.ok ? r.items : false; A.reProfile(); }).catch(function(){ ABS = false; }); }
  function awayCard(n){
    var s = sess(); if (!s || s.name !== n) return null;
    if (ABS_FOR !== n) { ABS = null; loadAway(); }
    if (ABS === false) return null;                 // Datenbank-Erweiterung fehlt
    var T = L(), c = card(T.awayT); c.appendChild(el('div', 'hint', T.awayHint));
    (ABS || []).forEach(function(x){
      var r = el('div', 'mehr-row'); r.appendChild(el('span', '', fmtDay(x.from) + ' – ' + fmtDay(x.to) + (x.note ? ' · ' + x.note : '')));
      r.appendChild(btn('mini danger', T.awayDel, function(){ rpc('absence_del', { p_token: s.tok, p_id: x.id }).then(function(){ loadAway(); A.reload(); }); }));
      c.appendChild(r);
    });
    if (ABS && !ABS.length) c.appendChild(el('div', 'hint', T.awayNone));
    var f = el('div', 'mehr-form'), a = el('input'), b = el('input'), nt = el('input'), msg = el('div', 'hint');
    a.type = b.type = 'date'; a.value = b.value = ymd(new Date()); nt.type = 'text'; nt.maxLength = 200; nt.placeholder = T.awayNote;
    function lab(t, i){ var w = el('label', 'mehr-l'); w.appendChild(el('span', '', t)); w.appendChild(i); return w; }
    var two = el('div', 'mehr-two'); two.appendChild(lab(T.awayFrom, a)); two.appendChild(lab(T.awayTo, b)); f.appendChild(two); f.appendChild(nt);
    f.appendChild(btn('btn', T.awayAdd, function(){
      if (!a.value || !b.value || b.value < a.value || b.value < ymd(new Date())) { msg.textContent = T.awayBad; return; }
      rpc('absence_add', { p_token: s.tok, p_from: a.value, p_to: b.value, p_note: nt.value || null }).then(function(r){ if (!r || !r.ok) throw 0; loadAway(); A.reload(); })
        .catch(function(){ msg.textContent = T.awayBad; });
    }));
    f.appendChild(msg); c.appendChild(f);
    return c;
  }

  /* ---------- Entwicklung (Diagramm) ---------- */
  function devCard(n){
    if (HIST[n] === undefined) { HIST[n] = null; rpc('player_history', { p_name: n }).then(function(r){ HIST[n] = Array.isArray(r) ? r : false; A.reProfile(); }).catch(function(){ HIST[n] = false; }); }
    var h = HIST[n]; if (h === false || h === null) return null;
    var T = L(), c = card(T.devT);
    if (h.length < 2) { c.appendChild(el('div', 'hint', T.devNone)); return c; }
    var W = 320, H = 120, P = 6, vs = h.map(function(x){ return +x.v; }), mn = Math.min.apply(null, vs), mx = Math.max.apply(null, vs); if (mx === mn) { mx += 1; mn -= 1; }
    var t0 = dLocal(h[0].t).getTime(), t1 = dLocal(h[h.length - 1].t).getTime() || t0 + 1;
    var pts = h.map(function(x){ var X = P + (dLocal(x.t).getTime() - t0) / Math.max(1, t1 - t0) * (W - 2 * P), Y = H - P - (x.v - mn) / (mx - mn) * (H - 2 * P); return X.toFixed(1) + ',' + Y.toFixed(1); });
    var ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('class', 'mehr-chart');
    var ar = document.createElementNS(ns, 'polygon'); ar.setAttribute('points', P + ',' + (H - P) + ' ' + pts.join(' ') + ' ' + (W - P) + ',' + (H - P)); ar.setAttribute('class', 'mc-area'); svg.appendChild(ar);
    var pl = document.createElementNS(ns, 'polyline'); pl.setAttribute('points', pts.join(' ')); pl.setAttribute('class', 'mc-line'); svg.appendChild(pl);
    var lp = pts[pts.length - 1].split(','), dot = document.createElementNS(ns, 'circle'); dot.setAttribute('cx', lp[0]); dot.setAttribute('cy', lp[1]); dot.setAttribute('r', 4); dot.setAttribute('class', 'mc-dot'); svg.appendChild(dot);
    c.appendChild(svg);
    var a = vs[0], z = vs[vs.length - 1], pc = a ? (z - a) / a * 100 : 0;
    var row = el('div', 'mehr-legend'); row.appendChild(el('span', '', fmtDay(h[0].t) + ': ' + num(a) + ' M'));
    row.appendChild(el('b', pc >= 0 ? 'up' : 'down', T.devChg.replace('{p}', (pc >= 0 ? '+' : '') + pc.toFixed(1) + ' %').replace('{d}', fmtDay(h[0].t))));
    row.appendChild(el('span', '', fmtDay(h[h.length - 1].t) + ': ' + num(z) + ' M')); c.appendChild(row);
    c.appendChild(el('div', 'hint', T.devHint));
    return c;
  }

  /* ---------- Allianz-Duell ---------- */
  function loadVs(force, cb){
    if (VS && !force && Date.now() - VS_AT < 120000) return cb && cb();
    VS_AT = Date.now();
    rpc('vs_week', {}).then(function(r){ VS = r && r.rows ? r : false; cb && cb(); }).catch(function(){ VS = false; cb && cb(); });
  }
  function vsTotals(){ var o = []; Object.keys(VS.rows || {}).forEach(function(n){ var t = 0; Object.keys(VS.rows[n]).forEach(function(k){ t += +VS.rows[n][k] || 0; }); o.push({ n: n, t: t }); }); o.sort(function(a, b){ return b.t - a.t; }); return o; }
  function vsCard(n){
    if (VS === null) { loadVs(false, A.reProfile); return null; } if (!VS) return null;
    var T = L(), s = sess(), own = s && s.name === n, row = (VS.rows || {})[n] || {}, tot = vsTotals(), me = tot.filter(function(x){ return x.n === n; })[0];
    if (!own && !me) return null;
    var c = card(T.vsT);
    if (me) c.appendChild(el('div', 'mehr-big', num(me.t) + ' · ' + T.vsRank.replace('{r}', tot.indexOf(me) + 1).replace('{n}', tot.length)));
    var mon = dLocal(VS.monday), today = ymd(new Date()), g = el('div', 'mehr-vs' + (own ? ' own' : ''));
    for (var i = 0; i < 6; i++) {
      var d = new Date(mon.getTime() + i * DAYMS), k = String(i), cell = el('div', 'mehr-vsd');
      cell.appendChild(el('small', '', T.days[i]));
      if (own && ymd(d) <= today) {
        var inp = el('input'); inp.type = 'number'; inp.min = '0'; inp.inputMode = 'numeric'; inp.value = row[k] !== undefined ? row[k] : ''; inp.dataset.day = ymd(d); cell.appendChild(inp);
      } else cell.appendChild(el('b', '', row[k] !== undefined ? num(row[k]) : '–'));
      g.appendChild(cell);
    }
    c.appendChild(g);
    if (own) {
      var msg = el('div', 'hint' + (VS_MSG ? ' mehr-msg' : ''), VS_MSG || T.vsHint); VS_MSG = '';
      c.appendChild(btn('btn', T.vsSave, function(){
        var ins = Array.prototype.slice.call(g.querySelectorAll('input')), fails = 0;
        Promise.all(ins.map(function(i){ var k2 = String(Math.round((dLocal(i.dataset.day) - mon) / DAYMS)), was = row[k2] !== undefined ? String(row[k2]) : '';
          if (i.value === was) return null;
          return rpc('vs_set', { p_token: s.tok, p_day: i.dataset.day, p_pts: i.value === '' ? null : Math.round(+i.value) }).catch(function(e){ fails++; if (String(e && e.message).indexOf('LOCKED') >= 0) msg.textContent = T.vsLocked; }); }))
          .then(function(){ VS_MSG = fails ? msg.textContent : T.vsSaved; loadVs(true, A.reProfile); });
      }));
      c.appendChild(msg);
    }
    return c;
  }
  function vsOverview(box){
    if (!box) return; box.innerHTML = '';
    if (VS === null) { loadVs(false, function(){ vsOverview(box); }); return; } if (!VS) return;
    var T = L(), tot = vsTotals().filter(function(x){ return x.t > 0; }); if (!tot.length) return;
    var s = sess(), c = card(T.vsTop), list = VS_ALL ? tot : tot.slice(0, 10);
    list.forEach(function(x, i){ var r = el('div', 'mehr-rank' + (s && s.name === x.n ? ' me' : '')); r.appendChild(el('span', 'mr-i', (i + 1) + '.'));
      var a = el('a', 'mr-n', x.n); a.href = '#'; a.addEventListener('click', function(e){ e.preventDefault(); A.openProfile(x.n); }); r.appendChild(a); r.appendChild(el('b', '', num(x.t))); c.appendChild(r); });
    if (tot.length > 10) c.appendChild(btn('linkbtn', VS_ALL ? T.vsLess : T.vsMore.replace('{n}', tot.length), function(){ VS_ALL = !VS_ALL; vsOverview(box); }));
    box.appendChild(c);
  }

  /* ---------- Willkommens-Checkliste ---------- */
  var STEPS = ['pin', 'entry', 'group', 'joined', 'avatar', 'signup', 'played'];
  function loadOnb(n, cb){
    var s = sess(); if (!s) return;
    ONB[n] = ONB[n] || { st: null };
    if (ONB[n].busy) return; ONB[n].busy = true;
    rpc('onboarding', { p_token: s.tok, p_name: n }).then(function(r){ ONB[n] = { st: r && r.ok && r.allowed ? r : false }; cb && cb(); }).catch(function(){ ONB[n] = { st: false }; });
  }
  function onbScore(r){ var a = 0; STEPS.forEach(function(k){ if (r[k]) a++; }); return a; }
  function onbCard(n){
    var s = sess(); if (!s || s.name !== n) return null;
    if (!ONB[n]) { loadOnb(n, A.reProfile); return null; }
    var r = ONB[n].st; if (!r) return null;
    var a = onbScore(r), young = !r.since || Date.now() - dLocal(r.since).getTime() < 90 * DAYMS;
    if (a === STEPS.length || !young) return null;
    var T = L(), c = card(T.onbT); c.appendChild(el('div', 'hint', T.onbDone.replace('{a}', a).replace('{b}', STEPS.length) + ' · ' + T.onbHint));
    var bar = el('div', 'bar'), i = el('i'); i.style.width = Math.round(a / STEPS.length * 100) + '%'; bar.appendChild(i); c.appendChild(bar);
    STEPS.forEach(function(k){ c.appendChild(el('div', 'mehr-step' + (r[k] ? ' ok' : ''), (r[k] ? '✅ ' : '⬜ ') + T.steps[k])); });
    return c;
  }
  // kleine Fortschrittsanzeige für Mentoren in „Meine Mentorengruppe“
  function onbBadge(n){
    var sp = el('span', 'mehr-onb');
    function fill(){ var r = ONB[n] && ONB[n].st; if (!r) return; var a = onbScore(r); sp.textContent = '👋 ' + a + '/' + STEPS.length; sp.title = STEPS.map(function(k){ return (r[k] ? '✅ ' : '⬜ ') + L().steps[k]; }).join('\n'); sp.classList.toggle('full', a === STEPS.length); }
    if (!ONB[n]) loadOnb(n, function(){ fill(); }); else fill();
    sp.addEventListener('click', function(e){ e.stopPropagation(); if (sp.title) alert(n + '\n\n' + sp.title); });
    return sp;
  }

  /* ---------- Kalender ---------- */
  function calItems(){
    var D = A.data() || {}, out = [], b = berlinToday(), end = Date.now() + 14 * DAYMS, me = A.sel();
    (D.cal || []).forEach(function(x){
      var hm = String(x.tm).split(':'), hh = +hm[0], mm = +hm[1];
      if (x.weekly) {
        for (var i = 0; i < 15; i++) { if ((b.wd + i) % 7 !== x.wd) continue; var t = berlin(b.y, b.m, b.d + i, hh, mm); if (+t + (x.dur || 0) * 60000 >= Date.now() && +t <= end) out.push({ t: t, x: x }); }
      } else { var p = String(x.day).split('-'), t2 = berlin(+p[0], p[1] - 1, +p[2], hh, mm); if (+t2 + (x.dur || 0) * 60000 >= Date.now() && +t2 <= end) out.push({ t: t2, x: x }); }
    });
    // Wüstensturm/Schluchtsturm aus offener Anmelderunde und veröffentlichtem Einsatz
    ['ds', 'cs'].forEach(function(k){
      var r = D.ev && D.ev[k], P = D[k], mine = null;
      if (P && P.teams && me) Object.keys(P.teams).forEach(function(t){ var T2 = P.teams[t]; if ((T2.m || []).some(function(x){ return x[0] === me; }) || (T2.s || []).indexOf(me) >= 0) mine = t; });
      var seen = {};
      ['A', 'B'].forEach(function(t){
        var txt = (P && P.teams && P.teams[t] && P.teams[t].time) || (r && r['time_' + t.toLowerCase()]); if (!txt || seen[t]) return; seen[t] = 1;
        var w = A.tzWhen(txt); if (!w || +w < Date.now() - 30 * 60000 || +w > end) return;
        out.push({ t: w, x: { title: L().kinds[k] + ' · ' + L().calTeam.replace('{t}', t), kind: k, dur: 30 }, mine: mine === t });
      });
    });
    out.sort(function(a, b2){ return a.t - b2.t; });
    return out;
  }
  function calCard(box){
    if (!box) return; box.innerHTML = '';
    var D = A.data(); if (!D || !D.cal) return;          // Datenbank-Erweiterung fehlt noch
    var T = L(), items = calItems(), c = card(T.calT);
    if (items.some(function(o){ return !sameOffset(o.t); })) c.appendChild(el('div', 'hint', T.calTz));
    if (!items.length) c.appendChild(el('div', 'hint', T.calNone));
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var ic = { ds:'🏜️', cs:'⛰️', zombie:'🧟', vs:'⚔️', meet:'🗣️', other:'📌' };
    items.forEach(function(o){
      var dd = new Date(o.t); dd.setHours(0, 0, 0, 0); var diff = Math.round((dd - today) / DAYMS);
      var day = diff === 0 ? T.today : diff === 1 ? T.tomorrow : o.t.toLocaleDateString(A.lang(), { weekday: 'short', day: '2-digit', month: '2-digit' });
      var bt = o.t.toLocaleTimeString('de-DE', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }), lt = o.t.toLocaleTimeString(A.lang(), { hour: '2-digit', minute: '2-digit' });
      var r = el('div', 'mehr-cal' + (o.mine ? ' mine' : '') + (diff === 0 ? ' today' : ''));
      r.appendChild(el('span', 'mc-ic', ic[o.x.kind] || '📌'));
      var tx = el('div', 'mc-tx'); tx.appendChild(el('b', '', o.x.title + (o.mine ? ' · ' + T.calMine : '')));
      tx.appendChild(el('small', '', day + ', ' + bt + (sameOffset(o.t) ? '' : ' (' + T.calYou.replace('{t}', lt) + ')') + (o.x.weekly ? ' · ' + T.weekly : '') + (o.x.note ? ' · ' + o.x.note : '')));
      r.appendChild(tx); c.appendChild(r);
    });
    box.appendChild(c);
  }

  /* ---------- Hilfe & Fragen ---------- */
  function loadHelp(){ var s = sess(); if (!s) { HLP = null; HLP_FOR = null; return; } HLP_FOR = s.name;
    rpc('help_list', { p_token: s.tok }).then(function(r){ HLP = r && r.ok ? r : false; renderHelp(); }).catch(function(){ HLP = false; renderHelp(); }); }
  function renderHelp(){
    var box = document.getElementById('helpBox'); if (!box) return; box.innerHTML = '';
    var s = sess(); if (!s) return;
    if (HLP_FOR !== s.name) { loadHelp(); return; }
    if (!HLP) return;
    var T = L(), c = card(T.hlpT); c.appendChild(el('div', 'hint', T.hlpHint));
    var kinds = el('div', 'mehr-kinds');
    Object.keys(T.kindsH).forEach(function(k){ kinds.appendChild(btn('mini' + (HLP_KIND === k ? ' on' : ''), T.kindsH[k], function(){ HLP_KIND = k; renderHelp(); })); });
    c.appendChild(kinds);
    var ta = el('textarea'); ta.rows = 2; ta.maxLength = 500; ta.placeholder = T.hlpPh; c.appendChild(ta);
    var msg = el('div', 'hint');
    c.appendChild(btn('btn', T.hlpPost, function(){
      if (!ta.value.trim()) return;
      rpc('help_post', { p_token: s.tok, p_kind: HLP_KIND, p_body: ta.value }).then(function(r){ if (!r || !r.ok) throw r; loadHelp(); })
        .catch(function(e){ msg.textContent = String(e && e.message).indexOf('LIMIT') >= 0 ? T.hlpLimit : T.err; });
    }));
    c.appendChild(msg); box.appendChild(c);
    if (!HLP.items.length) { var e0 = el('div', 'card'); e0.appendChild(el('div', 'hint', T.hlpNone)); box.appendChild(e0); return; }
    HLP.items.forEach(function(p){
      var pc = el('div', 'card mehr-post' + (p.done ? ' done' : '')), hd = el('div', 'mp-h');
      hd.appendChild(el('span', 'mp-k', T.kindsH[p.kind] || p.kind));
      var who = el('a', 'mp-n', p.name); who.href = '#'; who.addEventListener('click', function(e){ e.preventDefault(); A.openProfile(p.name); }); hd.appendChild(who);
      hd.appendChild(el('small', '', new Date(p.t).toLocaleString(A.lang(), { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) + (p.done ? ' · ' + T.hlpSolved : '')));
      pc.appendChild(hd); pc.appendChild(el('div', 'mp-b', p.body));
      p.replies.forEach(function(r){
        var rr = el('div', 'mp-r'); var rn = el('b', '', r.name + ': '); rr.appendChild(rn); rr.appendChild(document.createTextNode(r.body));
        if (r.name === s.name || HLP.lead) rr.appendChild(btn('mp-x', '✕', function(){ rpc('help_manage', { p_token: s.tok, p_id: r.id, p_action: 'delreply' }).then(loadHelp); }));
        pc.appendChild(rr);
      });
      var acts = el('div', 'mp-a');
      if (!p.done) {
        if (HLP_OPEN[p.id]) {
          var ri = el('input'); ri.type = 'text'; ri.maxLength = 500; ri.placeholder = T.hlpReplyPh; pc.appendChild(ri);
          acts.appendChild(btn('mini', T.hlpReply, function(){ if (!ri.value.trim()) return; rpc('help_reply', { p_token: s.tok, p_id: p.id, p_body: ri.value }).then(function(){ HLP_OPEN[p.id] = false; loadHelp(); }); }));
          setTimeout(function(){ ri.focus(); }, 30);
        } else acts.appendChild(btn('mini', T.hlpReply, function(){ HLP_OPEN[p.id] = true; renderHelp(); }));
      }
      if (p.name === s.name || HLP.lead) {
        acts.appendChild(btn('mini', p.done ? T.hlpReopen : T.hlpDone, function(){ rpc('help_manage', { p_token: s.tok, p_id: p.id, p_action: p.done ? 'open' : 'done' }).then(loadHelp); }));
        acts.appendChild(btn('mini danger', T.hlpDel, function(){ if (confirm(T.hlpDelQ)) rpc('help_manage', { p_token: s.tok, p_id: p.id, p_action: 'delete' }).then(loadHelp); }));
      }
      pc.appendChild(acts); box.appendChild(pc);
    });
  }

  return { init: function(api){ A = api; }, ready: function(){ return !!A; },
    awayText: awayText, awayCard: awayCard, devCard: devCard, vsCard: vsCard, vsOverview: vsOverview, onbCard: onbCard, onbBadge: onbBadge,
    calCard: calCard, renderHelp: renderHelp, loadHelp: loadHelp, reset: function(){ ABS = null; ABS_FOR = null; ONB = {}; HLP = null; HLP_FOR = null; } };
})();
