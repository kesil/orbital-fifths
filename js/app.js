(function (global) {
  'use strict';

  var NS = (global.OrbitalFifths = global.OrbitalFifths || {});
  var Theory = NS.Theory;
  var Songs = NS.Songs;
  var Audio = NS.Audio;
  var Wheel = NS.Wheel;
  var Melody = NS.Melody;
  var Export = NS.Export;

  var STORAGE_KEY = 'orbital_fifths_studio_v1';
  var SECTION_NAMES = ['Verse', 'Pre-Chorus', 'Chorus', 'Bridge'];

  var RHYME_PALETTE = [
    { bg: 'rgba(245, 184, 65, 0.2)', fg: '#f5b841' },
    { bg: 'rgba(56, 189, 248, 0.2)', fg: '#38bdf8' },
    { bg: 'rgba(52, 211, 153, 0.2)', fg: '#34d399' },
    { bg: 'rgba(251, 113, 133, 0.2)', fg: '#fb7185' },
    { bg: 'rgba(167, 139, 250, 0.2)', fg: '#a78bfa' }
  ];

  function createEmptySections() {
    return {
      'Verse': { chords: [], melodyNotes: [], lyrics: '' },
      'Pre-Chorus': { chords: [], melodyNotes: [], lyrics: '' },
      'Chorus': { chords: [], melodyNotes: [], lyrics: '' },
      'Bridge': { chords: [], melodyNotes: [], lyrics: '' }
    };
  }

  function createDefaultState() {
    return {
      title: 'Untitled Song Sketch',
      tonicPc: 0,
      modeKey: 'major',
      autoKey: true,
      buildMode: 'build',
      smartVoiceLeading: true,
      extMode: 'triad',
      instrument: 'feltPiano',
      playStyle: 'strum',
      groove: 'pop',
      bpm: 100,
      reverbMix: 0.28,
      activeSection: 'Verse',
      sections: createEmptySections(),
      arrangement: ['Verse', 'Pre-Chorus', 'Chorus', 'Verse', 'Chorus', 'Bridge', 'Chorus'],
      activeIntelTab: 'songs',
      filters: {
        exactKeyOnly: false,
        prefixOnly: false,
        genre: 'ALL',
        search: ''
      },
      octaveShift: 0,
      melodyCollapsed: false
    };
  }

  function loadState() {
    try {
      var raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return createDefaultState();
      var parsed = JSON.parse(raw);
      var def = createDefaultState();
      return Object.assign(def, parsed, {
        filters: Object.assign(def.filters, parsed.filters || {}),
        sections: Object.assign(def.sections, parsed.sections || {})
      });
    } catch (e) {
      return createDefaultState();
    }
  }

  var state = loadState();
  var selectedChordObj = null;
  var selectedProgIndex = -1;
  var playingChordIdx = -1;
  var activeMelodyStep = -1;
  var activePlaybackMode = null; // 'loop' | 'arrangement' | 'preview:<songId>'
  var previewSongId = null;
  var lastVoicingUpper = null;
  var wheelController = null;
  var toastTimer = null;

  var dom = {};

  function saveState() {
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // Ignore storage quota errors
    }
  }

  function showToast(msg) {
    if (!dom.toastBanner) return;
    dom.toastBanner.textContent = msg;
    dom.toastBanner.classList.add('is-visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      dom.toastBanner.classList.remove('is-visible');
    }, 2400);
  }

  function getActiveSectionData() {
    if (!state.sections[state.activeSection]) {
      state.sections[state.activeSection] = { chords: [], melodyNotes: [], lyrics: '' };
    }
    return state.sections[state.activeSection];
  }

  function getActiveChordObjects() {
    var sec = getActiveSectionData();
    return sec.chords.map(function (sym) {
      return Theory.parseChord(sym);
    }).filter(Boolean);
  }

  function computeSectionVoicings(chordObjs) {
    var prev = null;
    return chordObjs.map(function (c) {
      var v = Theory.getVoicingMidi(c, prev, state.smartVoiceLeading);
      prev = v.upper;
      return v;
    });
  }

  function playChordObject(chordObj) {
    if (!chordObj) return;
    var voicing = Theory.getVoicingMidi(chordObj, lastVoicingUpper, state.smartVoiceLeading);
    lastVoicingUpper = voicing.upper;
    Audio.playChord(voicing.all);
  }

  function appendChordSymbol(symbol, skipAutoKey) {
    var parsed = Theory.parseChord(symbol);
    if (!parsed) return;
    var sec = getActiveSectionData();
    sec.chords.push(parsed.normalizedSymbol);
    selectedChordObj = parsed;
    selectedProgIndex = sec.chords.length - 1;

    if (state.autoKey && !skipAutoKey) {
      var detected = Theory.detectKeyFromChords(getActiveChordObjects());
      state.tonicPc = detected.tonicPc;
      state.modeKey = detected.modeKey;
    }

    playChordObject(parsed);
    saveState();
    renderAll();
  }

  function handleWedgeActivate(ring, index, opts) {
    opts = opts || {};
    var analysis = Theory.analyzeWheelForKey(state.tonicPc, state.modeKey);
    var wedge = null;
    for (var i = 0; i < analysis.wedges.length; i++) {
      if (analysis.wedges[i].ring === ring && analysis.wedges[i].index === index) {
        wedge = analysis.wedges[i];
        break;
      }
    }
    if (!wedge) return;

    var chordObj = Theory.applyExtension(wedge.rootPc, wedge.baseQuality, state.extMode, analysis);
    if (!chordObj) return;

    selectedChordObj = chordObj;
    playChordObject(chordObj);

    if (!opts.auditionOnly && state.buildMode === 'build') {
      var sec = getActiveSectionData();
      sec.chords.push(chordObj.normalizedSymbol);
      selectedProgIndex = sec.chords.length - 1;
      if (state.autoKey) {
        var detected = Theory.detectKeyFromChords(getActiveChordObjects());
        state.tonicPc = detected.tonicPc;
        state.modeKey = detected.modeKey;
      }
      saveState();
    }

    renderAll();
  }

  function syncHeaderControls() {
    dom.songTitleInput.value = state.title || 'Untitled Song Sketch';
    dom.keyRootSelect.value = String(state.tonicPc);
    dom.keyModeSelect.value = state.modeKey;
    dom.autoKeyBtn.classList.toggle('is-active', state.autoKey);
    dom.autoKeyBtn.textContent = state.autoKey ? 'Auto-Key: On' : 'Key Locked';

    dom.instrumentSelect.value = state.instrument;
    dom.playStyleSelect.value = state.playStyle;
    dom.grooveSelect.value = state.groove;
    dom.bpmSlider.value = String(state.bpm);
    dom.bpmReadout.textContent = state.bpm + ' BPM';
    dom.reverbSlider.value = String(Math.round(state.reverbMix * 100));

    Audio.setBpm(state.bpm);
    Audio.setSettings({
      instrument: state.instrument,
      playStyle: state.playStyle,
      groove: state.groove,
      reverbMix: state.reverbMix
    });

    dom.modeBuildBtn.classList.toggle('is-active', state.buildMode === 'build');
    dom.modeAuditionBtn.classList.toggle('is-active', state.buildMode === 'audition');
    dom.voiceLeadingBtn.classList.toggle('is-active', state.smartVoiceLeading);
    dom.extModeSelect.value = state.extMode;
  }

  function renderSectionTabs() {
    dom.sectionTabs.innerHTML = '';
    for (var i = 0; i < SECTION_NAMES.length; i++) {
      var name = SECTION_NAMES[i];
      var sec = state.sections[name] || { chords: [] };
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'section-tab' + (state.activeSection === name ? ' is-active' : '');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', state.activeSection === name ? 'true' : 'false');

      var labelSpan = document.createElement('span');
      labelSpan.textContent = name;
      btn.appendChild(labelSpan);

      var countSpan = document.createElement('span');
      countSpan.className = 'sec-count';
      countSpan.textContent = String(sec.chords.length);
      btn.appendChild(countSpan);

      (function (secName) {
        btn.addEventListener('click', function () {
          state.activeSection = secName;
          selectedProgIndex = -1;
          saveState();
          renderAll();
        });
      })(name);

      dom.sectionTabs.appendChild(btn);
    }

    var isLoopPlaying = Audio.isPlaying() && activePlaybackMode === 'loop';
    dom.playLoopBtn.classList.toggle('is-playing', isLoopPlaying);
    dom.playLoopBtn.classList.toggle('is-primary', !isLoopPlaying);
    dom.playLoopBtn.textContent = isLoopPlaying ? '■ Stop Loop' : '▶ Play Loop';

    var isArrPlaying = Audio.isPlaying() && activePlaybackMode === 'arrangement';
    dom.playArrangementBtn.classList.toggle('is-playing', isArrPlaying);
    dom.playArrangementBtn.textContent = isArrPlaying ? '■ Stop All' : 'Play All';
  }

  function openReharmPopover(anchorBtn, chordIndex) {
    var sec = getActiveSectionData();
    var sym = sec.chords[chordIndex];
    var chordObj = Theory.parseChord(sym);
    if (!chordObj) return;

    var analysis = Theory.analyzeWheelForKey(state.tonicPc, state.modeKey);
    var options = Theory.getReharmonizeOptions(chordObj, analysis);

    dom.reharmPopover.innerHTML = '';
    var header = document.createElement('div');
    header.className = 'voicing-box-title';
    header.innerHTML = '<span>Spice Up <strong>' + chordObj.symbol + '</strong></span>';
    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'prog-mini-btn';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', closeReharmPopover);
    header.appendChild(closeBtn);
    dom.reharmPopover.appendChild(header);

    var groups = {};
    for (var i = 0; i < options.length; i++) {
      var g = options[i].group;
      if (!groups[g]) groups[g] = [];
      groups[g].push(options[i]);
    }

    Object.keys(groups).forEach(function (gName) {
      var gDiv = document.createElement('div');
      var gTitle = document.createElement('div');
      gTitle.className = 'reharm-group-title';
      gTitle.textContent = gName;
      gDiv.appendChild(gTitle);

      var wrap = document.createElement('div');
      wrap.className = 'reharm-options-wrap';
      var list = groups[gName];
      for (var j = 0; j < list.length; j++) {
        (function (opt) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'reharm-opt-btn';
          b.textContent = opt.label;
          b.title = opt.reason;
          b.addEventListener('click', function () {
            var parsed = Theory.parseChord(opt.symbol);
            if (opt.insertBefore) {
              sec.chords.splice(chordIndex, 0, opt.symbol);
              selectedProgIndex = chordIndex;
            } else {
              sec.chords[chordIndex] = opt.symbol;
              selectedProgIndex = chordIndex;
            }
            if (parsed) {
              selectedChordObj = parsed;
              playChordObject(parsed);
            }
            closeReharmPopover();
            saveState();
            renderAll();
          });
          wrap.appendChild(b);
        })(list[j]);
      }
      gDiv.appendChild(wrap);
      dom.reharmPopover.appendChild(gDiv);
    });

    var rect = anchorBtn.getBoundingClientRect();
    var left = Math.min(global.innerWidth - 315, Math.max(12, rect.left));
    var top = Math.min(global.innerHeight - 370, rect.bottom + 6);
    dom.reharmPopover.style.left = left + 'px';
    dom.reharmPopover.style.top = top + 'px';
    dom.reharmPopover.classList.add('is-open');
  }

  function closeReharmPopover() {
    if (dom.reharmPopover) {
      dom.reharmPopover.classList.remove('is-open');
    }
  }

  function renderProgressionStrip() {
    var chordObjs = getActiveChordObjects();
    var analysis = Theory.analyzeWheelForKey(state.tonicPc, state.modeKey);
    dom.progressionStrip.innerHTML = '';

    if (chordObjs.length === 0) {
      var emptyWrap = document.createElement('div');
      emptyWrap.className = 'prog-empty-state';

      var msg = document.createElement('div');
      msg.className = 'prog-empty-msg';
      msg.textContent = 'Press any chord on the Circle of Fifths to hear its tone and start narrowing hit songs — or try a starter combo:';
      emptyWrap.appendChild(msg);

      var starters = [
        { label: 'I–V–vi–IV Classic (C–G–Am–F)', chords: ['C', 'G', 'Am', 'F'] },
        { label: 'Creep Borrowed iv (G–B–C–Cm)', chords: ['G', 'B', 'C', 'Cm'] },
        { label: 'ii–V–I Neo-Soul (Dm7–G7–Cmaj7)', chords: ['Dm7', 'G7', 'Cmaj7'] },
        { label: 'Andalusian Minor (Am–G–F–E7)', chords: ['Am', 'G', 'F', 'E7'] }
      ];

      var chipRow = document.createElement('div');
      chipRow.className = 'starter-chips';
      for (var s = 0; s < starters.length; s++) {
        (function (preset) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'starter-chip';
          btn.textContent = preset.label;
          btn.addEventListener('click', function () {
            var sec = getActiveSectionData();
            sec.chords = preset.chords.slice();
            selectedChordObj = Theory.parseChord(sec.chords[0]);
            selectedProgIndex = 0;
            if (state.autoKey) {
              var det = Theory.detectKeyFromChords(getActiveChordObjects());
              state.tonicPc = det.tonicPc;
              state.modeKey = det.modeKey;
            }
            if (selectedChordObj) playChordObject(selectedChordObj);
            saveState();
            renderAll();
          });
          chipRow.appendChild(btn);
        })(starters[s]);
      }

      emptyWrap.appendChild(chipRow);
      dom.progressionStrip.appendChild(emptyWrap);
      dom.progSummaryText.textContent = 'Tip: Shift+Click any wedge to audition without adding';
      return;
    }

    var romans = [];
    for (var i = 0; i < chordObjs.length; i++) {
      var ch = chordObjs[i];
      var wedge = Theory.findWedgeForChord(ch);
      var func = 'chromatic';
      var roman = Theory.getRomanForChord(ch.rootPc, ch.baseQuality, state.tonicPc, state.modeKey);
      if (wedge) {
        for (var w = 0; w < analysis.wedges.length; w++) {
          if (analysis.wedges[w].id === wedge.ring + '-' + wedge.index) {
            func = analysis.wedges[w].harmonicFunction;
            roman = analysis.wedges[w].roman;
            break;
          }
        }
      }
      romans.push(roman);

      var card = document.createElement('div');
      card.className = 'prog-card func-' + func +
        (selectedProgIndex === i ? ' is-selected' : '') +
        (playingChordIdx === i ? ' is-playing' : '');

      var top = document.createElement('div');
      top.className = 'prog-card-top';

      var stepNum = document.createElement('span');
      stepNum.className = 'prog-step-num';
      stepNum.textContent = String(i + 1);
      top.appendChild(stepNum);

      var tools = document.createElement('div');
      tools.className = 'prog-card-tools';

      var spiceBtn = document.createElement('button');
      spiceBtn.type = 'button';
      spiceBtn.className = 'prog-mini-btn';
      spiceBtn.textContent = '✦';
      spiceBtn.title = 'Reharmonize / Add extensions / Slash bass';
      (function (idx, btnRef) {
        btnRef.addEventListener('click', function (ev) {
          ev.stopPropagation();
          openReharmPopover(btnRef, idx);
        });
      })(i, spiceBtn);

      var delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'prog-mini-btn is-del';
      delBtn.textContent = '×';
      delBtn.title = 'Remove chord';
      (function (idx) {
        delBtn.addEventListener('click', function (ev) {
          ev.stopPropagation();
          var sec = getActiveSectionData();
          sec.chords.splice(idx, 1);
          if (selectedProgIndex >= sec.chords.length) selectedProgIndex = sec.chords.length - 1;
          if (state.autoKey && sec.chords.length > 0) {
            var det = Theory.detectKeyFromChords(getActiveChordObjects());
            state.tonicPc = det.tonicPc;
            state.modeKey = det.modeKey;
          }
          saveState();
          renderAll();
        });
      })(i);

      tools.appendChild(spiceBtn);
      tools.appendChild(delBtn);
      top.appendChild(tools);
      card.appendChild(top);

      var cName = document.createElement('div');
      cName.className = 'prog-chord-name';
      cName.textContent = ch.symbol;
      card.appendChild(cName);

      var rName = document.createElement('div');
      rName.className = 'prog-roman';
      rName.textContent = roman;
      card.appendChild(rName);

      (function (idx, cObj) {
        card.addEventListener('click', function () {
          selectedProgIndex = idx;
          selectedChordObj = cObj;
          playChordObject(cObj);
          renderAll();
        });
      })(i, ch);

      dom.progressionStrip.appendChild(card);
    }

    dom.progSummaryText.textContent = state.activeSection + ' Formula: ' + romans.join(' – ');
  }

  function buildSongCardElement(matchItem) {
    var song = matchItem.song;
    var card = document.createElement('article');
    card.className = 'song-card';

    var head = document.createElement('div');
    head.className = 'song-card-head';

    var titleWrap = document.createElement('div');
    var tLine = document.createElement('div');
    tLine.className = 'song-title-line';
    tLine.textContent = song.title;
    var aLine = document.createElement('div');
    aLine.className = 'song-artist-line';
    aLine.textContent = song.artist + ' (' + song.year + ')';
    titleWrap.appendChild(tLine);
    titleWrap.appendChild(aLine);

    var badges = document.createElement('div');
    badges.className = 'song-badges';

    var tierBadge = document.createElement('span');
    tierBadge.className = 'song-badge ' + (matchItem.delta === 0 ? 'is-exact' : 'is-pattern');
    tierBadge.textContent = matchItem.tierLabel;
    badges.appendChild(tierBadge);

    var secBadge = document.createElement('span');
    secBadge.className = 'song-badge';
    secBadge.textContent = song.section;
    badges.appendChild(secBadge);

    head.appendChild(titleWrap);
    head.appendChild(badges);
    card.appendChild(head);

    // Chord pills
    var chordsRow = document.createElement('div');
    chordsRow.className = 'song-chords-row';
    for (var c = 0; c < matchItem.transposedChords.length; c++) {
      var pill = document.createElement('span');
      var isMatched = matchItem.matchedIndices.indexOf(c) !== -1;
      pill.className = 'song-chord-pill' + (isMatched ? ' is-matched' : '');
      pill.textContent = matchItem.transposedChords[c];
      chordsRow.appendChild(pill);
    }

    if (matchItem.delta !== 0) {
      var origNote = document.createElement('span');
      origNote.className = 'song-orig-key-note';
      origNote.textContent = 'Orig (' + song.originalKey + '): ' + song.chords.join('–');
      chordsRow.appendChild(origNote);
    }
    card.appendChild(chordsRow);

    var insight = document.createElement('div');
    insight.className = 'song-insight';
    insight.textContent = song.insight;
    card.appendChild(insight);

    var foot = document.createElement('div');
    foot.className = 'song-card-foot';

    var meta = document.createElement('span');
    meta.className = 'song-meta-text';
    meta.textContent = song.genre + ' • ' + song.bpm + ' BPM';
    foot.appendChild(meta);

    var btns = document.createElement('div');
    btns.className = 'song-card-btns';

    var isPreviewing = Audio.isPlaying() && activePlaybackMode === 'preview' && previewSongId === song.id;
    var prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'studio-btn is-sm' + (isPreviewing ? ' is-playing' : '');
    prevBtn.textContent = isPreviewing ? '■ Stop' : '▶ Preview';
    prevBtn.addEventListener('click', function () {
      if (Audio.isPlaying() && activePlaybackMode === 'preview' && previewSongId === song.id) {
        Audio.stopLoop();
        return;
      }
      var chordsToPlay = matchItem.transposedChords.map(function (s) { return Theory.parseChord(s); }).filter(Boolean);
      var voicings = computeSectionVoicings(chordsToPlay).map(function (v) { return v.all; });
      activePlaybackMode = 'preview';
      previewSongId = song.id;
      Audio.playLoop(
        function () { return { chords: voicings, melodyNotes: [] }; },
        function () {},
        function () {
          activePlaybackMode = null;
          previewSongId = null;
          renderSongsPanel();
        },
        song.bpm
      );
      renderSongsPanel();
    });

    var loadBtn = document.createElement('button');
    loadBtn.type = 'button';
    loadBtn.className = 'studio-btn is-sm';
    loadBtn.textContent = 'Load Chords';
    loadBtn.addEventListener('click', function () {
      Audio.stopLoop();
      var sec = getActiveSectionData();
      sec.chords = matchItem.transposedChords.slice();
      state.bpm = song.bpm;
      Audio.setBpm(song.bpm);
      selectedProgIndex = 0;
      selectedChordObj = Theory.parseChord(sec.chords[0]);
      if (state.autoKey) {
        var det = Theory.detectKeyFromChords(getActiveChordObjects());
        state.tonicPc = det.tonicPc;
        state.modeKey = det.modeKey;
      }
      if (selectedChordObj) playChordObject(selectedChordObj);
      showToast('Loaded "' + song.title + '" (' + song.bpm + ' BPM)');
      saveState();
      renderAll();
    });

    btns.appendChild(prevBtn);
    btns.appendChild(loadBtn);
    foot.appendChild(btns);
    card.appendChild(foot);

    return card;
  }

  function renderSongsPanel(precomputedMatchResult) {
    var chordObjs = getActiveChordObjects();
    var analysis = Theory.analyzeWheelForKey(state.tonicPc, state.modeKey);
    var res = precomputedMatchResult || Songs.matchSongs(chordObjs, state.filters, analysis);

    dom.matchPatternBtn.classList.toggle('is-active', !state.filters.exactKeyOnly);
    dom.matchExactBtn.classList.toggle('is-active', state.filters.exactKeyOnly);
    dom.posAnyBtn.classList.toggle('is-active', !state.filters.prefixOnly);
    dom.posStartBtn.classList.toggle('is-active', state.filters.prefixOnly);

    var count = res.matches.length;
    var pool = Math.max(1, res.poolCount);
    var pct = Math.round((count / pool) * 100);

    if (chordObjs.length === 0) {
      dom.narrowingTitle.textContent = 'Full Song Library Ready — Press a chord to begin narrowing';
    } else {
      dom.narrowingTitle.textContent = 'Matching "' + chordObjs.map(function (c) { return c.symbol; }).join(' → ') + '"';
    }

    dom.narrowingCountBadge.textContent = count + ' / ' + res.poolCount + ' songs';
    dom.narrowingCountBadge.classList.toggle('is-zero', count === 0);
    dom.narrowingBarFill.style.width = (count === 0 ? 0 : Math.max(3, pct)) + '%';

    // Next-chord predictor chips
    dom.nextChordsBar.innerHTML = '';
    if (res.nextChordSuggestions && res.nextChordSuggestions.length > 0) {
      var lbl = document.createElement('span');
      lbl.className = 'next-chords-label';
      lbl.textContent = chordObjs.length === 0 ? 'Popular Openers:' : 'Where Hit Songs Go Next:';
      dom.nextChordsBar.appendChild(lbl);

      for (var n = 0; n < res.nextChordSuggestions.length; n++) {
        (function (sug) {
          var chip = document.createElement('button');
          chip.type = 'button';
          chip.className = 'next-chord-chip';
          chip.innerHTML = '<span>' + sug.symbol + '</span><span class="next-chord-pct">' + sug.pct + '%</span>';
          chip.title = 'Click to hear & append ' + sug.symbol;
          chip.addEventListener('click', function () {
            appendChordSymbol(sug.symbol);
          });
          dom.nextChordsBar.appendChild(chip);
        })(res.nextChordSuggestions[n]);
      }
    }

    // Song list
    dom.songList.innerHTML = '';
    var renderLimit = 45;
    for (var i = 0; i < Math.min(renderLimit, res.matches.length); i++) {
      dom.songList.appendChild(buildSongCardElement(res.matches[i]));
    }

    if (res.matches.length > renderLimit) {
      var moreMsg = document.createElement('div');
      moreMsg.className = 'song-meta-text';
      moreMsg.style.textAlign = 'center';
      moreMsg.style.padding = '6px';
      moreMsg.textContent = 'Showing top ' + renderLimit + ' of ' + res.matches.length + ' matches — press another chord to narrow further.';
      dom.songList.appendChild(moreMsg);
    }

    if (res.matches.length === 0) {
      var emptyNote = document.createElement('div');
      emptyNote.className = 'song-insight';
      emptyNote.style.padding = '8px 4px';
      emptyNote.textContent = 'No exact matches in the library for this full combo — you may have invented a fresh progression!';
      dom.songList.appendChild(emptyNote);

      if (res.partialMatches && res.partialMatches.length > 0) {
        var div = document.createElement('div');
        div.className = 'partial-divider';
        div.textContent = 'Closest Sub-Combo Matches (Last 2 Chords)';
        dom.songList.appendChild(div);
        for (var p = 0; p < res.partialMatches.length; p++) {
          dom.songList.appendChild(buildSongCardElement(res.partialMatches[p]));
        }
      }
    }

    return res;
  }

  function renderPianoDiagramSvg(chordObj) {
    var voicing = Theory.getVoicingMidi(chordObj, null, false);
    var bassPc = Theory.mod12(voicing.bass);
    var upperPcs = voicing.upper.map(function (m) { return Theory.mod12(m); });

    var whitePcs = [0, 2, 4, 5, 7, 9, 11];
    var blackSpecs = [
      { pc: 1, x: 18 },
      { pc: 3, x: 46 },
      { pc: 6, x: 102 },
      { pc: 8, x: 130 },
      { pc: 10, x: 158 }
    ];

    var svg = '<svg viewBox="0 0 212 96" width="212" height="96" class="piano-diagram-svg">';
    for (var w = 0; w < whitePcs.length; w++) {
      var pc = whitePcs[w];
      var isUpper = upperPcs.indexOf(pc) !== -1;
      var isBass = pc === bassPc;
      var fill = isUpper ? '#f5b841' : (isBass ? '#38bdf8' : '#e2e8f0');
      svg += '<rect x="' + (4 + w * 29) + '" y="4" width="27" height="84" rx="3" fill="' + fill + '" stroke="#0f172a" stroke-width="1.5"/>';
      if (isUpper || isBass) {
        svg += '<text x="' + (17.5 + w * 29) + '" y="78" text-anchor="middle" font-size="10" font-weight="800" fill="#0b0e14">' + Theory.getNoteName(pc, false) + '</text>';
      }
    }

    for (var b = 0; b < blackSpecs.length; b++) {
      var bs = blackSpecs[b];
      var bUpper = upperPcs.indexOf(bs.pc) !== -1;
      var bBass = bs.pc === bassPc;
      var bFill = bUpper ? '#f5b841' : (bBass ? '#38bdf8' : '#0f172a');
      svg += '<rect x="' + (4 + bs.x) + '" y="4" width="18" height="52" rx="2.5" fill="' + bFill + '" stroke="#020617" stroke-width="1.5"/>';
    }
    svg += '</svg>';
    return svg;
  }

  function renderGuitarDiagramSvg(chordObj) {
    var diag = Theory.getGuitarDiagram(chordObj);
    var frets = diag.frets;
    var baseFret = diag.baseFret || 1;
    var numFrets = 4;
    var left = 28;
    var top = 22;
    var strGap = 24;
    var fretGap = 20;

    var svg = '<svg viewBox="0 0 185 122" width="185" height="122" class="guitar-diagram-svg">';

    // Nut or base fret indicator
    if (baseFret === 1) {
      svg += '<line x1="' + left + '" y1="' + top + '" x2="' + (left + 5 * strGap) + '" y2="' + top + '" stroke="#f8fafc" stroke-width="4"/>';
    } else {
      svg += '<text x="12" y="' + (top + 14) + '" fill="#f5b841" font-size="11" font-weight="700">' + baseFret + 'fr</text>';
      svg += '<line x1="' + left + '" y1="' + top + '" x2="' + (left + 5 * strGap) + '" y2="' + top + '" stroke="#64748b" stroke-width="1.5"/>';
    }

    // Fret lines
    for (var f = 1; f <= numFrets; f++) {
      var y = top + f * fretGap;
      svg += '<line x1="' + left + '" y1="' + y + '" x2="' + (left + 5 * strGap) + '" y2="' + y + '" stroke="#334155" stroke-width="1.2"/>';
    }

    // String lines & dots
    for (var s = 0; s < 6; s++) {
      var x = left + s * strGap;
      svg += '<line x1="' + x + '" y1="' + top + '" x2="' + x + '" y2="' + (top + numFrets * fretGap) + '" stroke="#475569" stroke-width="1.3"/>';

      var fret = frets[s];
      if (fret < 0) {
        svg += '<text x="' + x + '" y="' + (top - 7) + '" text-anchor="middle" fill="#fb7185" font-size="11" font-weight="700">×</text>';
      } else if (fret === 0) {
        svg += '<circle cx="' + x + '" cy="' + (top - 10) + '" r="4" fill="none" stroke="#38bdf8" stroke-width="1.6"/>';
      } else {
        var relFret = fret - baseFret + 1;
        if (relFret >= 1 && relFret <= numFrets) {
          var cy = top + (relFret - 0.5) * fretGap;
          svg += '<circle cx="' + x + '" cy="' + cy + '" r="6.5" fill="#f5b841"/>';
          if (diag.fingers[s]) {
            svg += '<text x="' + x + '" y="' + (cy + 3.2) + '" text-anchor="middle" fill="#0b0e14" font-size="9" font-weight="800">' + diag.fingers[s] + '</text>';
          }
        }
      }
    }

    svg += '</svg>';
    return svg;
  }

  function renderVoicingsPanel() {
    var chordObjs = getActiveChordObjects();
    var targetChord = selectedChordObj || (chordObjs.length ? chordObjs[chordObjs.length - 1] : Theory.parseChord('C'));
    dom.voicingChordTitle.textContent = 'Selected Chord: ' + targetChord.symbol + ' (' + targetChord.noteNames.join(' – ') + ')';

    dom.pianoDiagramBox.innerHTML = renderPianoDiagramSvg(targetChord);
    dom.guitarDiagramBox.innerHTML = renderGuitarDiagramSvg(targetChord);

    dom.capoAdvisorList.innerHTML = '';
    if (chordObjs.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'song-insight';
      empty.textContent = 'Build a chord progression to calculate the easiest acoustic guitar capo positions.';
      dom.capoAdvisorList.appendChild(empty);
      return;
    }

    var capos = Theory.getCapoRecommendations(chordObjs);
    for (var i = 0; i < capos.length; i++) {
      var cap = capos[i];
      var card = document.createElement('div');
      card.className = 'capo-card';
      var left = document.createElement('div');
      var lbl = document.createElement('div');
      lbl.className = 'capo-label';
      lbl.textContent = cap.label;
      var shapes = document.createElement('div');
      shapes.className = 'capo-chords';
      shapes.textContent = 'Shapes: ' + cap.playedChords.join('  •  ');
      left.appendChild(lbl);
      left.appendChild(shapes);

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'studio-btn is-sm';
      btn.textContent = 'Hear';
      btn.addEventListener('click', function () {
        toggleLoopPlayback('loop');
      });

      card.appendChild(left);
      card.appendChild(btn);
      dom.capoAdvisorList.appendChild(card);
    }
  }

  function renderLyricsAndArrangementPanel() {
    var sec = getActiveSectionData();
    dom.lyricSectionLabel.textContent = state.activeSection + ' Lyrics & Syllable Meter';
    if (dom.lyricEditor.value !== (sec.lyrics || '')) {
      dom.lyricEditor.value = sec.lyrics || '';
    }

    var lines = (sec.lyrics || '').split(/\r?\n/);
    dom.syllableMeterList.innerHTML = '';

    // Map rhyme keys to palette indices
    var rhymeGroups = {};
    var rhymeCount = 0;
    var lineData = [];

    for (var i = 0; i < lines.length; i++) {
      var text = lines[i];
      var syl = Export.estimateLineSyllables(text);
      var rKey = Export.getEndWordRhymeKey(text);
      if (rKey) {
        if (!rhymeGroups[rKey]) rhymeGroups[rKey] = { count: 0, letter: '' };
        rhymeGroups[rKey].count++;
      }
      lineData.push({ text: text, syl: syl, rKey: rKey });
    }

    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    Object.keys(rhymeGroups).forEach(function (k) {
      if (rhymeGroups[k].count >= 2) {
        rhymeGroups[k].letter = letters[rhymeCount % letters.length];
        rhymeGroups[k].color = RHYME_PALETTE[rhymeCount % RHYME_PALETTE.length];
        rhymeCount++;
      }
    });

    for (var l = 0; l < lineData.length; l++) {
      var item = lineData[l];
      var row = document.createElement('div');
      row.className = 'syllable-line';
      var preview = document.createElement('span');
      preview.textContent = item.text.trim() ? item.text.trim().slice(0, 32) : '(blank line)';
      preview.style.opacity = item.text.trim() ? '1' : '0.4';

      var right = document.createElement('span');
      right.style.display = 'inline-flex';
      right.style.gap = '6px';
      right.style.alignItems = 'center';

      if (item.rKey && rhymeGroups[item.rKey] && rhymeGroups[item.rKey].letter) {
        var rg = rhymeGroups[item.rKey];
        var rBadge = document.createElement('span');
        rBadge.className = 'rhyme-badge';
        rBadge.style.background = rg.color.bg;
        rBadge.style.color = rg.color.fg;
        rBadge.textContent = rg.letter;
        right.appendChild(rBadge);
      }

      var sCount = document.createElement('span');
      sCount.className = 'syllable-count';
      sCount.textContent = item.syl + ' syl';
      right.appendChild(sCount);

      row.appendChild(preview);
      row.appendChild(right);
      dom.syllableMeterList.appendChild(row);
    }

    // Arrangement Chain
    dom.arrangementChain.innerHTML = '';
    for (var a = 0; a < state.arrangement.length; a++) {
      (function (idx, secName) {
        var chip = document.createElement('span');
        chip.className = 'arr-chip';
        var secChords = state.sections[secName] ? state.sections[secName].chords.length : 0;
        chip.textContent = secName + ' (' + secChords + ')';
        if (secChords === 0) chip.style.opacity = '0.55';

        var rm = document.createElement('button');
        rm.type = 'button';
        rm.className = 'prog-mini-btn is-del';
        rm.textContent = '×';
        rm.title = 'Remove from timeline';
        rm.addEventListener('click', function () {
          state.arrangement.splice(idx, 1);
          saveState();
          renderLyricsAndArrangementPanel();
        });
        chip.appendChild(rm);
        dom.arrangementChain.appendChild(chip);
      })(a, state.arrangement[a]);
    }
  }

  function renderIntelTabs() {
    var tabs = [
      { id: 'songs', tabEl: dom.intelTabSongs, panelEl: dom.panelSongs },
      { id: 'voicings', tabEl: dom.intelTabVoicings, panelEl: dom.panelVoicings },
      { id: 'lyrics', tabEl: dom.intelTabLyrics, panelEl: dom.panelLyrics }
    ];
    for (var i = 0; i < tabs.length; i++) {
      var active = state.activeIntelTab === tabs[i].id;
      tabs[i].tabEl.classList.toggle('is-active', active);
      tabs[i].tabEl.setAttribute('aria-selected', active ? 'true' : 'false');
      tabs[i].panelEl.classList.toggle('is-active', active);
    }
  }

  function renderMelodyStudio() {
    dom.melodyBody.classList.toggle('is-collapsed', state.melodyCollapsed);
    dom.melodyToggleBtn.textContent = state.melodyCollapsed ? '▸ Melody Studio' : '▾ Melody Studio';

    var octMap = { '-1': 'C3–E4', '0': 'C4–E5', '1': 'C5–E6' };
    dom.octaveReadout.textContent = octMap[String(state.octaveShift)] || 'C4–E5';

    if (state.melodyCollapsed) return;

    var sec = getActiveSectionData();
    var chordObjs = getActiveChordObjects();
    var analysis = Theory.analyzeWheelForKey(state.tonicPc, state.modeKey);

    var activeMelodyMidis = [];
    if (activeMelodyStep >= 0 && sec.melodyNotes) {
      for (var m = 0; m < sec.melodyNotes.length; m++) {
        var nt = sec.melodyNotes[m];
        if (activeMelodyStep >= nt.step && activeMelodyStep < nt.step + (nt.len || 1)) {
          activeMelodyMidis.push(nt.midi);
        }
      }
    }

    Melody.renderPianoRoll(dom.melodyRoll, {
      chords: chordObjs,
      melodyNotes: sec.melodyNotes || [],
      octaveShift: state.octaveShift,
      keyInfo: analysis,
      activeMelodyStep: activeMelodyStep
    }, {
      onToggleNote: function (midi, step, removeOnly, len) {
        var list = sec.melodyNotes || [];
        var idx = -1;
        for (var i = 0; i < list.length; i++) {
          if (list[i].midi === midi && list[i].step === step) {
            idx = i;
            break;
          }
        }
        if (idx !== -1) {
          list.splice(idx, 1);
        } else if (!removeOnly) {
          list.push({ step: step, midi: midi, len: len || 1, vel: 0.85 });
        }
        sec.melodyNotes = list;
        saveState();
        renderMelodyStudio();
      },
      onExtendNote: function (noteObj) {
        var maxSteps = Math.max(4, chordObjs.length) * 4;
        noteObj.len = noteObj.step + noteObj.len < maxSteps ? ((noteObj.len % 4) + 1) : 1;
        saveState();
        renderMelodyStudio();
      }
    });

    Melody.renderPlayablePiano(dom.playablePiano, {
      octaveShift: state.octaveShift,
      keyInfo: analysis,
      activeChordObj: selectedChordObj,
      activeMelodyMidis: activeMelodyMidis
    }, function (midiVal) {
      Audio.playMelodyNote(midiVal, 0.5);
    });
  }

  function renderAll() {
    syncHeaderControls();

    var chordObjs = getActiveChordObjects();
    var analysis = Theory.analyzeWheelForKey(state.tonicPc, state.modeKey);
    var matchRes = Songs.matchSongs(chordObjs, state.filters, analysis);

    if (wheelController) {
      wheelController.update({
        wheelAnalysis: analysis,
        progressionChords: chordObjs,
        activeChordObj: selectedChordObj,
        playingChordIdx: playingChordIdx,
        nextSuggestions: matchRes.nextChordSuggestions,
        extMode: state.extMode
      });
    }

    renderSectionTabs();
    renderProgressionStrip();
    renderIntelTabs();
    renderSongsPanel(matchRes);
    renderVoicingsPanel();
    renderLyricsAndArrangementPanel();
    renderMelodyStudio();
  }

  function toggleLoopPlayback(mode) {
    if (Audio.isPlaying() && activePlaybackMode === mode) {
      Audio.stopLoop();
      return;
    }

    if (mode === 'arrangement') {
      var arrChords = [];
      var arrMelody = [];
      var barOffset = 0;
      for (var i = 0; i < state.arrangement.length; i++) {
        var sName = state.arrangement[i];
        var sec = state.sections[sName];
        if (!sec || !sec.chords || sec.chords.length === 0) continue;
        var parsed = sec.chords.map(function (c) { return Theory.parseChord(c); }).filter(Boolean);
        arrChords = arrChords.concat(parsed);
        var notes = sec.melodyNotes || [];
        var maxSteps = parsed.length * 4;
        for (var n = 0; n < notes.length; n++) {
          if (notes[n].step < maxSteps) {
            arrMelody.push({
              step: barOffset * 4 + notes[n].step,
              midi: notes[n].midi,
              len: notes[n].len,
              vel: notes[n].vel
            });
          }
        }
        barOffset += parsed.length;
      }

      if (arrChords.length === 0) {
        showToast('Add chords to at least one section to play the arrangement.');
        return;
      }

      var arrVoicings = computeSectionVoicings(arrChords).map(function (v) { return v.all; });
      activePlaybackMode = 'arrangement';
      Audio.playLoop(
        function () {
          return { chords: arrVoicings, melodyNotes: arrMelody };
        },
        function (globalStep, chordIdx, stepInBar) {
          // Arrangement playback runs smoothly without tearing down UI tabs on every sixteenth
        },
        function () {
          activePlaybackMode = null;
          playingChordIdx = -1;
          activeMelodyStep = -1;
          renderAll();
        },
        state.bpm
      );
      renderSectionTabs();
      return;
    }

    // Active section loop
    var secData = getActiveSectionData();
    if (!secData.chords || secData.chords.length === 0) {
      showToast('Press chords on the Circle of Fifths first to play a loop!');
      return;
    }

    activePlaybackMode = 'loop';
    Audio.playLoop(
      function () {
        var chords = getActiveChordObjects();
        var voicings = computeSectionVoicings(chords).map(function (v) { return v.all; });
        return {
          chords: voicings,
          melodyNotes: getActiveSectionData().melodyNotes || []
        };
      },
      function (globalStep, chordIdx, stepInBar) {
        if (stepInBar % 4 === 0) {
          activeMelodyStep = chordIdx * 4 + Math.floor(stepInBar / 4);
          Melody.updatePlayhead(dom.melodyRoll, dom.playablePiano, activeMelodyStep, getActiveSectionData().melodyNotes);
        }
        if (stepInBar === 0) {
          playingChordIdx = chordIdx;
          var chordObjs = getActiveChordObjects();
          if (chordObjs[chordIdx]) {
            selectedChordObj = chordObjs[chordIdx];
          }
          var analysis = Theory.analyzeWheelForKey(state.tonicPc, state.modeKey);
          if (wheelController) {
            wheelController.update({
              wheelAnalysis: analysis,
              progressionChords: chordObjs,
              activeChordObj: selectedChordObj,
              playingChordIdx: playingChordIdx,
              nextSuggestions: Songs.matchSongs(chordObjs, state.filters, analysis).nextChordSuggestions,
              extMode: state.extMode
            });
          }
          renderProgressionStrip();
          renderVoicingsPanel();
        }
      },
      function () {
        activePlaybackMode = null;
        playingChordIdx = -1;
        activeMelodyStep = -1;
        renderAll();
      },
      state.bpm
    );
    renderSectionTabs();
  }

  function buildExportPayload() {
    var populated = [];
    for (var i = 0; i < state.arrangement.length; i++) {
      var sName = state.arrangement[i];
      var sec = state.sections[sName];
      if (sec && sec.chords && sec.chords.length > 0) {
        populated.push(sec);
      }
    }
    var activeSec = getActiveSectionData();
    return {
      title: state.title,
      tonicPc: state.tonicPc,
      modeKey: state.modeKey,
      bpm: state.bpm,
      instrument: state.instrument,
      playStyle: state.playStyle,
      groove: state.groove,
      reverbMix: state.reverbMix,
      smartVoiceLeading: state.smartVoiceLeading,
      sections: state.sections,
      sectionOrder: SECTION_NAMES,
      activeSectionData: activeSec,
      timelineSections: populated.length > 0 ? populated : [activeSec]
    };
  }

  function populateStaticSelectors() {
    // Key roots C..B
    dom.keyRootSelect.innerHTML = '';
    for (var pc = 0; pc < 12; pc++) {
      var opt = document.createElement('option');
      opt.value = String(pc);
      var sharpName = Theory.getNoteName(pc, false);
      var flatName = Theory.getNoteName(pc, true);
      opt.textContent = sharpName === flatName ? sharpName : sharpName + ' / ' + flatName;
      dom.keyRootSelect.appendChild(opt);
    }

    // Song genres
    var genres = Songs.getGenres();
    dom.genreFilterSelect.innerHTML = '<option value="ALL">All Genres</option>';
    for (var g = 0; g < genres.length; g++) {
      var gOpt = document.createElement('option');
      gOpt.value = genres[g];
      gOpt.textContent = genres[g];
      dom.genreFilterSelect.appendChild(gOpt);
    }
    dom.genreFilterSelect.value = state.filters.genre || 'ALL';
    dom.songSearchInput.value = state.filters.search || '';
  }

  function bindEvents() {
    dom.songTitleInput.addEventListener('input', function () {
      state.title = dom.songTitleInput.value;
      saveState();
    });

    dom.keyRootSelect.addEventListener('change', function () {
      state.tonicPc = Number(dom.keyRootSelect.value);
      state.autoKey = false;
      saveState();
      renderAll();
    });

    dom.keyModeSelect.addEventListener('change', function () {
      state.modeKey = dom.keyModeSelect.value;
      state.autoKey = false;
      saveState();
      renderAll();
    });

    dom.autoKeyBtn.addEventListener('click', function () {
      state.autoKey = !state.autoKey;
      if (state.autoKey && getActiveChordObjects().length > 0) {
        var det = Theory.detectKeyFromChords(getActiveChordObjects());
        state.tonicPc = det.tonicPc;
        state.modeKey = det.modeKey;
      }
      saveState();
      renderAll();
    });

    dom.instrumentSelect.addEventListener('change', function () {
      state.instrument = dom.instrumentSelect.value;
      Audio.setSettings({ instrument: state.instrument });
      saveState();
      if (selectedChordObj) playChordObject(selectedChordObj);
    });

    dom.playStyleSelect.addEventListener('change', function () {
      state.playStyle = dom.playStyleSelect.value;
      Audio.setSettings({ playStyle: state.playStyle });
      saveState();
      if (selectedChordObj) playChordObject(selectedChordObj);
    });

    dom.grooveSelect.addEventListener('change', function () {
      state.groove = dom.grooveSelect.value;
      Audio.setSettings({ groove: state.groove });
      saveState();
    });

    dom.bpmSlider.addEventListener('input', function () {
      state.bpm = Audio.setBpm(Number(dom.bpmSlider.value));
      dom.bpmReadout.textContent = state.bpm + ' BPM';
      saveState();
    });

    dom.tapTempoBtn.addEventListener('click', function () {
      var tapped = Audio.tapTempo();
      if (tapped) {
        state.bpm = tapped;
        dom.bpmSlider.value = String(tapped);
        dom.bpmReadout.textContent = tapped + ' BPM';
        saveState();
      }
    });

    dom.reverbSlider.addEventListener('input', function () {
      state.reverbMix = Number(dom.reverbSlider.value) / 100;
      Audio.setSettings({ reverbMix: state.reverbMix });
      saveState();
    });

    dom.modeBuildBtn.addEventListener('click', function () {
      state.buildMode = 'build';
      saveState();
      syncHeaderControls();
    });

    dom.modeAuditionBtn.addEventListener('click', function () {
      state.buildMode = 'audition';
      saveState();
      syncHeaderControls();
    });

    dom.voiceLeadingBtn.addEventListener('click', function () {
      state.smartVoiceLeading = !state.smartVoiceLeading;
      saveState();
      renderAll();
    });

    dom.extModeSelect.addEventListener('change', function () {
      state.extMode = dom.extModeSelect.value;
      saveState();
      renderAll();
    });

    dom.playLoopBtn.addEventListener('click', function () {
      toggleLoopPlayback('loop');
    });

    dom.playArrangementBtn.addEventListener('click', function () {
      toggleLoopPlayback('arrangement');
    });

    dom.suggestSectionBtn.addEventListener('click', function () {
      var sec = getActiveSectionData();
      sec.chords = Theory.suggestContrastingSection(sec.chords, state.tonicPc, state.modeKey, state.activeSection);
      selectedProgIndex = 0;
      selectedChordObj = Theory.parseChord(sec.chords[0]);
      if (selectedChordObj) playChordObject(selectedChordObj);
      showToast('Generated fresh ' + state.activeSection + ' progression!');
      saveState();
      renderAll();
    });

    dom.undoChordBtn.addEventListener('click', function () {
      var sec = getActiveSectionData();
      if (sec.chords.length === 0) return;
      sec.chords.pop();
      selectedProgIndex = sec.chords.length - 1;
      selectedChordObj = selectedProgIndex >= 0 ? Theory.parseChord(sec.chords[selectedProgIndex]) : null;
      if (state.autoKey && sec.chords.length > 0) {
        var det = Theory.detectKeyFromChords(getActiveChordObjects());
        state.tonicPc = det.tonicPc;
        state.modeKey = det.modeKey;
      }
      saveState();
      renderAll();
    });

    dom.clearComboBtn.addEventListener('click', function () {
      Audio.stopLoop();
      var sec = getActiveSectionData();
      sec.chords = [];
      selectedChordObj = null;
      selectedProgIndex = -1;
      saveState();
      renderAll();
    });

    // Intel Tabs
    dom.intelTabSongs.addEventListener('click', function () {
      state.activeIntelTab = 'songs';
      saveState();
      renderIntelTabs();
    });
    dom.intelTabVoicings.addEventListener('click', function () {
      state.activeIntelTab = 'voicings';
      saveState();
      renderIntelTabs();
      renderVoicingsPanel();
    });
    dom.intelTabLyrics.addEventListener('click', function () {
      state.activeIntelTab = 'lyrics';
      saveState();
      renderIntelTabs();
      renderLyricsAndArrangementPanel();
    });

    // Song Filters
    dom.matchPatternBtn.addEventListener('click', function () {
      state.filters.exactKeyOnly = false;
      saveState();
      renderAll();
    });
    dom.matchExactBtn.addEventListener('click', function () {
      state.filters.exactKeyOnly = true;
      saveState();
      renderAll();
    });
    dom.posAnyBtn.addEventListener('click', function () {
      state.filters.prefixOnly = false;
      saveState();
      renderAll();
    });
    dom.posStartBtn.addEventListener('click', function () {
      state.filters.prefixOnly = true;
      saveState();
      renderAll();
    });
    dom.genreFilterSelect.addEventListener('change', function () {
      state.filters.genre = dom.genreFilterSelect.value;
      saveState();
      renderAll();
    });
    dom.songSearchInput.addEventListener('input', function () {
      state.filters.search = dom.songSearchInput.value;
      saveState();
      renderSongsPanel();
    });

    // Lyrics & Arrangement
    dom.lyricEditor.addEventListener('input', function () {
      var sec = getActiveSectionData();
      sec.lyrics = dom.lyricEditor.value;
      saveState();
      renderLyricsAndArrangementPanel();
    });
    dom.addArrBtn.addEventListener('click', function () {
      state.arrangement.push(dom.addArrSectionSelect.value);
      saveState();
      renderLyricsAndArrangementPanel();
    });

    // Melody Studio
    dom.melodyToggleBtn.addEventListener('click', function () {
      state.melodyCollapsed = !state.melodyCollapsed;
      saveState();
      renderMelodyStudio();
    });
    dom.octaveDownBtn.addEventListener('click', function () {
      state.octaveShift = Math.max(-1, state.octaveShift - 1);
      saveState();
      renderMelodyStudio();
    });
    dom.octaveUpBtn.addEventListener('click', function () {
      state.octaveShift = Math.min(1, state.octaveShift + 1);
      saveState();
      renderMelodyStudio();
    });
    dom.sparkMelodyBtn.addEventListener('click', function () {
      var sec = getActiveSectionData();
      var chordObjs = getActiveChordObjects();
      var analysis = Theory.analyzeWheelForKey(state.tonicPc, state.modeKey);
      sec.melodyNotes = Melody.generateMelody(dom.melodyStyleSelect.value, chordObjs, analysis, state.octaveShift);
      saveState();
      renderMelodyStudio();
      showToast('Sparked new ' + dom.melodyStyleSelect.options[dom.melodyStyleSelect.selectedIndex].text + ' melody!');
    });
    dom.mutateMelodyBtn.addEventListener('click', function () {
      var sec = getActiveSectionData();
      var chordObjs = getActiveChordObjects();
      var analysis = Theory.analyzeWheelForKey(state.tonicPc, state.modeKey);
      sec.melodyNotes = Melody.mutateMelody(sec.melodyNotes, chordObjs, analysis, state.octaveShift);
      saveState();
      renderMelodyStudio();
    });
    dom.clearMelodyBtn.addEventListener('click', function () {
      getActiveSectionData().melodyNotes = [];
      saveState();
      renderMelodyStudio();
    });

    // Exports & Reset
    dom.exportMidiBtn.addEventListener('click', function () {
      var payload = buildExportPayload();
      if (payload.timelineSections.every(function (s) { return !s.chords || s.chords.length === 0; })) {
        showToast('Add at least one chord before exporting MIDI.');
        return;
      }
      Export.exportMidiFile(payload);
      showToast('Exported MIDI file!');
    });

    dom.exportWavBtn.addEventListener('click', function () {
      var payload = buildExportPayload();
      dom.exportWavBtn.disabled = true;
      dom.exportWavBtn.textContent = 'Rendering...';
      Export.exportWavFile(payload).then(function () {
        showToast('Rendered & downloaded studio WAV!');
      }).catch(function (err) {
        showToast(err && err.message ? err.message : 'WAV export failed.');
      }).finally(function () {
        dom.exportWavBtn.disabled = false;
        dom.exportWavBtn.textContent = 'WAV';
      });
    });

    dom.leadSheetBtn.addEventListener('click', function () {
      dom.leadSheetPre.textContent = Export.renderLeadSheetText(buildExportPayload());
      if (typeof dom.leadSheetDialog.showModal === 'function') {
        dom.leadSheetDialog.showModal();
      } else {
        dom.leadSheetDialog.setAttribute('open', 'open');
      }
    });
    dom.copyLeadSheetBtn.addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(dom.leadSheetPre.textContent).then(function () {
          showToast('Lead sheet copied to clipboard!');
        });
      }
    });
    dom.printLeadSheetBtn.addEventListener('click', function () {
      global.print();
    });
    dom.closeLeadSheetBtn.addEventListener('click', function () {
      if (typeof dom.leadSheetDialog.close === 'function') dom.leadSheetDialog.close();
      else dom.leadSheetDialog.removeAttribute('open');
    });

    dom.resetSongBtn.addEventListener('click', function () {
      Audio.stopLoop();
      state = createDefaultState();
      selectedChordObj = null;
      selectedProgIndex = -1;
      saveState();
      populateStaticSelectors();
      renderAll();
      showToast('Started a fresh song project.');
    });

    // Close popover when clicking outside
    document.addEventListener('pointerdown', function (ev) {
      if (dom.reharmPopover.classList.contains('is-open') && !dom.reharmPopover.contains(ev.target)) {
        closeReharmPopover();
      }
    });

    // Global keyboard shortcuts (disabled inside text fields)
    document.addEventListener('keydown', function (ev) {
      var activeEl = document.activeElement;
      var tag = activeEl ? activeEl.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (ev.code === 'Space') {
        ev.preventDefault();
        toggleLoopPlayback('loop');
        return;
      }
      if (ev.key === 'Backspace') {
        ev.preventDefault();
        dom.undoChordBtn.click();
        return;
      }
      if (ev.key === 'Escape') {
        if (dom.reharmPopover.classList.contains('is-open')) {
          closeReharmPopover();
        } else {
          dom.clearComboBtn.click();
        }
        return;
      }

      if (!ev.repeat && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
        var midi = Melody.getMidiForKeyboardKey(ev.key, state.octaveShift);
        if (midi !== null) {
          Audio.playMelodyNote(midi, 0.45);
          var keyBtn = dom.playablePiano.querySelector('[data-midi="' + midi + '"]');
          if (keyBtn) {
            keyBtn.classList.add('is-active');
            setTimeout(function () { keyBtn.classList.remove('is-active'); }, 220);
          }
        }
      }
    });
  }

  function cacheDom() {
    var ids = [
      'song-title-input', 'key-root-select', 'key-mode-select', 'auto-key-btn',
      'instrument-select', 'play-style-select', 'groove-select', 'bpm-slider',
      'bpm-readout', 'tap-tempo-btn', 'reverb-slider', 'audio-visualizer',
      'export-midi-btn', 'export-wav-btn', 'lead-sheet-btn', 'reset-song-btn',
      'mode-build-btn', 'mode-audition-btn', 'voice-leading-btn', 'ext-mode-select',
      'cof-wheel-container', 'section-tabs', 'play-loop-btn', 'play-arrangement-btn',
      'suggest-section-btn', 'progression-strip', 'undo-chord-btn', 'clear-combo-btn',
      'prog-summary-text', 'intel-tab-songs', 'intel-tab-voicings', 'intel-tab-lyrics',
      'panel-songs', 'panel-voicings', 'panel-lyrics', 'narrowing-title',
      'narrowing-count-badge', 'narrowing-bar-fill', 'next-chords-bar',
      'match-pattern-btn', 'match-exact-btn', 'pos-any-btn', 'pos-start-btn',
      'genre-filter-select', 'song-search-input', 'song-list', 'voicing-chord-title',
      'piano-diagram-box', 'guitar-diagram-box', 'capo-advisor-list',
      'lyric-section-label', 'lyric-editor', 'syllable-meter-list',
      'arrangement-chain', 'add-arr-section-select', 'add-arr-btn',
      'melody-toggle-btn', 'melody-body', 'octave-down-btn', 'octave-up-btn',
      'octave-readout', 'melody-style-select', 'spark-melody-btn',
      'mutate-melody-btn', 'clear-melody-btn', 'melody-roll', 'playable-piano',
      'reharm-popover', 'lead-sheet-dialog', 'lead-sheet-pre',
      'copy-lead-sheet-btn', 'print-lead-sheet-btn', 'close-lead-sheet-btn',
      'toast-banner'
    ];

    function camelCase(id) {
      return id.replace(/-([a-z])/g, function (_, ch) { return ch.toUpperCase(); });
    }

    for (var i = 0; i < ids.length; i++) {
      dom[camelCase(ids[i])] = document.getElementById(ids[i]);
    }
  }

  function init() {
    cacheDom();
    populateStaticSelectors();
    wheelController = Wheel.createWheel(dom.cofWheelContainer, handleWedgeActivate);
    Wheel.initVisualizer(dom.audioVisualizer);
    bindEvents();
    renderAll();
  }

  document.addEventListener('DOMContentLoaded', init);

  NS.App = {
    getState: function () { return state; },
    renderAll: renderAll
  };
})(window);
