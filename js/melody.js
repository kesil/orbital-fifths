(function (global) {
  'use strict';

  var NS = (global.OrbitalFifths = global.OrbitalFifths || {});
  var Theory = NS.Theory;
  var Audio = NS.Audio;

  var PIANO_KEY_BINDINGS = [
    { key: 'a', offset: 0, label: 'A' },
    { key: 'w', offset: 1, label: 'W' },
    { key: 's', offset: 2, label: 'S' },
    { key: 'e', offset: 3, label: 'E' },
    { key: 'd', offset: 4, label: 'D' },
    { key: 'f', offset: 5, label: 'F' },
    { key: 't', offset: 6, label: 'T' },
    { key: 'g', offset: 7, label: 'G' },
    { key: 'y', offset: 8, label: 'Y' },
    { key: 'h', offset: 9, label: 'H' },
    { key: 'u', offset: 10, label: 'U' },
    { key: 'j', offset: 11, label: 'J' },
    { key: 'k', offset: 12, label: 'K' },
    { key: 'o', offset: 13, label: 'O' },
    { key: 'l', offset: 14, label: 'L' },
    { key: 'p', offset: 15, label: 'P' },
    { key: ';', offset: 16, label: ';' },
    { key: '\'', offset: 17, label: '\'' }
  ];

  var BLACK_PCS = { 1: true, 3: true, 6: true, 8: true, 10: true };

  function isBlackPc(pc) {
    return Boolean(BLACK_PCS[Theory.mod12(pc)]);
  }

  function midiLabel(midi, preferFlats) {
    var pc = Theory.mod12(midi);
    var oct = Math.floor(midi / 12) - 1;
    return Theory.getNoteName(pc, preferFlats) + oct;
  }

  function getRangeBounds(octaveShift) {
    var shift = (octaveShift || 0) * 12;
    return {
      lowMidi: 60 + shift,  // C4 default
      highMidi: 76 + shift  // E5 default (17 rows)
    };
  }

  function closestMidiWithPc(targetPc, nearMidi, lowMidi, highMidi) {
    var best = null;
    var bestDist = 999;
    for (var m = lowMidi; m <= highMidi; m++) {
      if (Theory.mod12(m) === Theory.mod12(targetPc)) {
        var d = Math.abs(m - nearMidi);
        if (d < bestDist) {
          bestDist = d;
          best = m;
        }
      }
    }
    return best !== null ? best : nearMidi;
  }

  function getCandidatePitchesForStep(chordObj, scalePcs, lowMidi, highMidi) {
    var chordPcs = chordObj ? chordObj.chordTonePcs : scalePcs;
    var chordMidis = [];
    var scaleMidis = [];
    for (var m = lowMidi; m <= highMidi; m++) {
      var pc = Theory.mod12(m);
      if (chordPcs.indexOf(pc) !== -1) chordMidis.push(m);
      if (scalePcs.indexOf(pc) !== -1) scaleMidis.push(m);
    }
    return {
      chordMidis: chordMidis.length ? chordMidis : scaleMidis,
      scaleMidis: scaleMidis.length ? scaleMidis : [lowMidi + 4, lowMidi + 7]
    };
  }

  function generateMelody(style, chords, keyInfo, octaveShift) {
    var bounds = getRangeBounds(octaveShift);
    var lowMidi = bounds.lowMidi;
    var highMidi = bounds.highMidi;
    var numBars = Math.max(4, chords ? chords.length : 0);
    var totalSteps = numBars * 4;
    var tonicPc = keyInfo ? keyInfo.tonicPc : 0;
    var modeKey = keyInfo ? keyInfo.modeKey : 'major';
    var scalePcs = Theory.getScalePcs(tonicPc, modeKey);

    var activeChords = [];
    for (var b = 0; b < numBars; b++) {
      if (chords && chords.length > 0) {
        activeChords.push(chords[b % chords.length]);
      } else {
        activeChords.push(Theory.parseChord(Theory.getNoteName(tonicPc, false)));
      }
    }

    var notes = [];
    var prevMidi = closestMidiWithPc(tonicPc + 4, lowMidi + 7, lowMidi, highMidi);

    if (style === 'arpeggio') {
      for (var bar = 0; bar < numBars; bar++) {
        var cands = getCandidatePitchesForStep(activeChords[bar], scalePcs, lowMidi, highMidi).chordMidis;
        var pat = [0, 1, 2, 1];
        for (var s = 0; s < 4; s++) {
          var pitch = cands[pat[s] % cands.length];
          notes.push({ step: bar * 4 + s, midi: pitch, len: 1, vel: s === 0 ? 0.88 : 0.72 });
        }
      }
      return notes;
    }

    if (style === 'lyrical') {
      for (var lb = 0; lb < numBars; lb++) {
        var info = getCandidatePitchesForStep(activeChords[lb], scalePcs, lowMidi, highMidi);
        var stepPattern = lb % 2 === 0 ? [0, 2, 3] : [0, 1, 2];
        for (var idx = 0; idx < stepPattern.length; idx++) {
          var st = stepPattern[idx];
          var pool = st === 0 ? info.chordMidis : info.scaleMidis;
          // Choose conjunct neighbor within 1-4 semitones
          var chosen = pool[0];
          var bestScore = 999;
          for (var p = 0; p < pool.length; p++) {
            var diff = Math.abs(pool[p] - prevMidi);
            var penalty = diff === 0 ? 3.5 : (diff <= 3 ? diff : diff * 1.8);
            if (penalty < bestScore) {
              bestScore = penalty;
              chosen = pool[p];
            }
          }
          var len = (idx === stepPattern.length - 1) ? (4 - st) : (stepPattern[idx + 1] - st);
          notes.push({ step: lb * 4 + st, midi: chosen, len: Math.max(1, len), vel: st === 0 ? 0.88 : 0.76 });
          prevMidi = chosen;
        }
      }
      return notes;
    }

    if (style === 'soul') {
      for (var sb = 0; sb < numBars; sb++) {
        var ch = activeChords[sb];
        var sInfo = getCandidatePitchesForStep(ch, scalePcs, lowMidi, highMidi);
        // Add 7th/9th color targets when available
        var seventhPc = Theory.mod12(ch.rootPc + 10);
        var ninthPc = Theory.mod12(ch.rootPc + 14);
        var colorTarget = closestMidiWithPc(seventhPc, prevMidi + 2, lowMidi, highMidi);
        if (Math.abs(colorTarget - prevMidi) > 6) {
          colorTarget = closestMidiWithPc(ninthPc, prevMidi, lowMidi, highMidi);
        }
        var cTone = sInfo.chordMidis[Math.min(sInfo.chordMidis.length - 1, Math.floor(Math.random() * sInfo.chordMidis.length))];
        var stepSlots = [
          { offset: 0, midi: cTone, len: 1, vel: 0.86 },
          { offset: 1, midi: sInfo.scaleMidis[Math.floor(sInfo.scaleMidis.length / 2)], len: 2, vel: 0.78 },
          { offset: 3, midi: colorTarget, len: 1, vel: 0.82 }
        ];
        for (var k = 0; k < stepSlots.length; k++) {
          notes.push({
            step: sb * 4 + stepSlots[k].offset,
            midi: stepSlots[k].midi,
            len: stepSlots[k].len,
            vel: stepSlots[k].vel
          });
          prevMidi = stepSlots[k].midi;
        }
      }
      return notes;
    }

    // Default: 'popHook' — catchy motif repeated in bar 1 & bar 3 with melodic contour & tonic resolution
    var baseMotifOffsets = [0, 1, 3];
    var contourOffsets = [2, 0, -1];
    for (var pb = 0; pb < numBars; pb++) {
      var pInfo = getCandidatePitchesForStep(activeChords[pb], scalePcs, lowMidi, highMidi);
      var anchor = pInfo.chordMidis[Math.min(pInfo.chordMidis.length - 1, pb === numBars - 1 ? 0 : Math.floor(pInfo.chordMidis.length * 0.55))];
      if (pb === numBars - 1) {
        // Resolve nicely near tonic
        anchor = closestMidiWithPc(tonicPc, lowMidi + 6, lowMidi, highMidi);
        notes.push({ step: pb * 4, midi: prevMidi, len: 1, vel: 0.84 });
        notes.push({ step: pb * 4 + 1, midi: anchor, len: 3, vel: 0.9 });
      } else {
        var useOffsets = (pb % 2 === 0) ? baseMotifOffsets : [0, 2];
        for (var u = 0; u < useOffsets.length; u++) {
          var stepOff = useOffsets[u];
          var poolList = u === 0 ? pInfo.chordMidis : pInfo.scaleMidis;
          var targetMidi = anchor + (contourOffsets[u % contourOffsets.length] || 0);
          var pick = poolList[0];
          var bestD = 999;
          for (var z = 0; z < poolList.length; z++) {
            var dist = Math.abs(poolList[z] - targetMidi);
            if (dist < bestD) {
              bestD = dist;
              pick = poolList[z];
            }
          }
          var dur = u === useOffsets.length - 1 ? (4 - stepOff) : (useOffsets[u + 1] - stepOff);
          notes.push({ step: pb * 4 + stepOff, midi: pick, len: Math.max(1, dur), vel: u === 0 ? 0.9 : 0.8 });
          prevMidi = pick;
        }
      }
    }

    // Clamp cleanly inside totalSteps
    return notes.filter(function (n) { return n.step < totalSteps; });
  }

  function mutateMelody(existingNotes, chords, keyInfo, octaveShift) {
    if (!existingNotes || existingNotes.length === 0) {
      return generateMelody('popHook', chords, keyInfo, octaveShift);
    }
    var bounds = getRangeBounds(octaveShift);
    var tonicPc = keyInfo ? keyInfo.tonicPc : 0;
    var modeKey = keyInfo ? keyInfo.modeKey : 'major';
    var scalePcs = Theory.getScalePcs(tonicPc, modeKey);

    return existingNotes.map(function (n) {
      if (Math.random() > 0.35) return Object.assign({}, n);
      var barIdx = Math.floor(n.step / 4);
      var ch = (chords && chords.length) ? chords[barIdx % chords.length] : null;
      var info = getCandidatePitchesForStep(ch, scalePcs, bounds.lowMidi, bounds.highMidi);
      var pool = (n.step % 4 === 0) ? info.chordMidis : info.scaleMidis;
      var near = pool.filter(function (m) { return m !== n.midi && Math.abs(m - n.midi) <= 5; });
      var chosen = near.length ? near[Math.floor(Math.random() * near.length)] : pool[Math.floor(Math.random() * pool.length)];
      return {
        step: n.step,
        midi: chosen || n.midi,
        len: n.len,
        vel: n.vel
      };
    });
  }

  function renderPianoRoll(container, state, callbacks) {
    if (!container) return;
    var chords = state.chords || [];
    var numBars = Math.max(4, chords.length);
    var totalSteps = numBars * 4;
    var notes = state.melodyNotes || [];
    var octaveShift = state.octaveShift || 0;
    var keyInfo = state.keyInfo || { tonicPc: 0, modeKey: 'major', preferFlats: false };
    var scalePcs = Theory.getScalePcs(keyInfo.tonicPc, keyInfo.modeKey);
    var activeStep = typeof state.activeMelodyStep === 'number' ? state.activeMelodyStep : -1;

    var bounds = getRangeBounds(octaveShift);
    var lowMidi = bounds.lowMidi;
    var highMidi = bounds.highMidi;

    // Build lookup map for notes covering each (midi, step)
    var noteStarts = {};
    var noteSpans = {};
    for (var i = 0; i < notes.length; i++) {
      var nt = notes[i];
      if (nt.step >= 0 && nt.step < totalSteps) {
        noteStarts[nt.midi + ':' + nt.step] = nt;
        var len = Math.max(1, nt.len || 1);
        for (var l = 0; l < len && nt.step + l < totalSteps; l++) {
          noteSpans[nt.midi + ':' + (nt.step + l)] = { head: nt, isHead: l === 0, isTail: l === len - 1 };
        }
      }
    }

    container.innerHTML = '';

    var gridWrap = document.createElement('div');
    gridWrap.className = 'roll-grid';
    gridWrap.style.gridTemplateColumns = '58px repeat(' + totalSteps + ', minmax(22px, 1fr))';

    // Top chord ruler row
    var corner = document.createElement('div');
    corner.className = 'roll-corner';
    corner.textContent = 'BAR / CHORD';
    gridWrap.appendChild(corner);

    for (var bar = 0; bar < numBars; bar++) {
      var barHeader = document.createElement('div');
      var hasChord = bar < chords.length;
      barHeader.className = 'roll-bar-header' + (hasChord ? '' : ' is-empty');
      barHeader.style.gridColumn = 'span 4';
      barHeader.textContent = hasChord ? (bar + 1) + '. ' + chords[bar].symbol : 'Bar ' + (bar + 1);
      gridWrap.appendChild(barHeader);
    }

    // Pitch rows from top (highMidi) down to lowMidi
    for (var midi = highMidi; midi >= lowMidi; midi--) {
      var pc = Theory.mod12(midi);
      var black = isBlackPc(pc);
      var isTonic = pc === keyInfo.tonicPc;

      var labelCell = document.createElement('div');
      labelCell.className = 'roll-pitch-label' + (black ? ' is-black' : '') + (isTonic ? ' is-tonic' : '');
      labelCell.textContent = midiLabel(midi, keyInfo.preferFlats);
      (function (mPitch) {
        labelCell.addEventListener('pointerdown', function () {
          Audio.playMelodyNote(mPitch, 0.45);
        });
      })(midi);
      gridWrap.appendChild(labelCell);

      for (var step = 0; step < totalSteps; step++) {
        var barIdx = Math.floor(step / 4);
        var activeChord = chords.length > 0 ? chords[barIdx % chords.length] : null;
        var isChordTone = activeChord ? activeChord.chordTonePcs.indexOf(pc) !== -1 : false;
        var isScaleTone = scalePcs.indexOf(pc) !== -1;
        var spanInfo = noteSpans[midi + ':' + step];
        var isPlayhead = activeStep === step;

        var cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'roll-cell';
        cell.setAttribute('data-step', String(step));
        if (step % 4 === 0) cell.classList.add('is-bar-start');
        if (isChordTone) cell.classList.add('is-chord-tone');
        else if (isScaleTone) cell.classList.add('is-scale-tone');
        if (black) cell.classList.add('is-black-row');
        if (isPlayhead) cell.classList.add('is-playhead');

        if (spanInfo) {
          cell.classList.add('has-note');
          if (spanInfo.isHead) cell.classList.add('is-note-head');
          if (spanInfo.isTail) cell.classList.add('is-note-tail');
          cell.title = midiLabel(midi, keyInfo.preferFlats) + ' • Click to remove, Shift+Click to extend';
        } else {
          cell.title = midiLabel(midi, keyInfo.preferFlats) +
            (isChordTone ? ' (Chord tone)' : isScaleTone ? ' (In key)' : ' (Chromatic)');
        }

        (function (mVal, sVal, existingSpan) {
          cell.addEventListener('pointerdown', function (ev) {
            ev.preventDefault();
            if (ev.shiftKey && existingSpan) {
              callbacks.onExtendNote(existingSpan.head);
              return;
            }
            if (existingSpan) {
              callbacks.onToggleNote(mVal, existingSpan.head.step, true);
            } else {
              Audio.playMelodyNote(mVal, 0.42);
              callbacks.onToggleNote(mVal, sVal, false, ev.shiftKey ? 2 : 1);
            }
          });
        })(midi, step, spanInfo);

        gridWrap.appendChild(cell);
      }
    }

    container.appendChild(gridWrap);
  }

  function renderPlayablePiano(container, state, onNoteTrigger) {
    if (!container) return;
    var octaveShift = state.octaveShift || 0;
    var baseMidi = 60 + octaveShift * 12; // C4..C6 (25 keys)
    var totalKeys = 25;
    var keyInfo = state.keyInfo || { tonicPc: 0, modeKey: 'major', preferFlats: false };
    var scalePcs = Theory.getScalePcs(keyInfo.tonicPc, keyInfo.modeKey);
    var activeChord = state.activeChordObj;
    var chordPcs = activeChord ? activeChord.chordTonePcs : [];
    var activeMelodyMidis = state.activeMelodyMidis || [];

    var shortcutByOffset = {};
    for (var b = 0; b < PIANO_KEY_BINDINGS.length; b++) {
      shortcutByOffset[PIANO_KEY_BINDINGS[b].offset] = PIANO_KEY_BINDINGS[b].label;
    }

    container.innerHTML = '';
    var whiteWrap = document.createElement('div');
    whiteWrap.className = 'piano-keys-stage';

    var whitePositions = [];
    var whiteIdx = 0;

    // First pass: place white keys and record their relative x offsets
    for (var offset = 0; offset < totalKeys; offset++) {
      var midi = baseMidi + offset;
      var pc = Theory.mod12(midi);
      var black = isBlackPc(pc);
      if (!black) {
        whitePositions.push({ offset: offset, midi: midi, pc: pc, whiteIdx: whiteIdx });
        var wBtn = document.createElement('button');
        wBtn.type = 'button';
        wBtn.className = 'piano-key is-white';
        wBtn.setAttribute('data-midi', String(midi));
        if (chordPcs.indexOf(pc) !== -1) wBtn.classList.add('is-chord-tone');
        if (scalePcs.indexOf(pc) !== -1) wBtn.classList.add('is-scale-tone');
        if (pc === keyInfo.tonicPc) wBtn.classList.add('is-tonic');
        if (activeMelodyMidis.indexOf(midi) !== -1) wBtn.classList.add('is-active');

        var noteLbl = document.createElement('span');
        noteLbl.className = 'piano-note-name';
        noteLbl.textContent = Theory.getNoteName(pc, keyInfo.preferFlats) + (pc === 0 ? (Math.floor(midi / 12) - 1) : '');
        wBtn.appendChild(noteLbl);

        if (shortcutByOffset[offset]) {
          var kbd = document.createElement('span');
          kbd.className = 'piano-kbd';
          kbd.textContent = shortcutByOffset[offset];
          wBtn.appendChild(kbd);
        }

        (function (mVal, btnEl) {
          btnEl.addEventListener('pointerdown', function (ev) {
            ev.preventDefault();
            btnEl.classList.add('is-active');
            setTimeout(function () { btnEl.classList.remove('is-active'); }, 220);
            onNoteTrigger(mVal);
          });
        })(midi, wBtn);

        whiteWrap.appendChild(wBtn);
        whiteIdx++;
      }
    }

    var totalWhite = whiteIdx;
    // Second pass: overlay black keys cleanly between adjacent white keys
    var currentWhiteCount = 0;
    for (var o = 0; o < totalKeys; o++) {
      var m = baseMidi + o;
      var p = Theory.mod12(m);
      if (!isBlackPc(p)) {
        currentWhiteCount++;
      } else {
        var bBtn = document.createElement('button');
        bBtn.type = 'button';
        bBtn.className = 'piano-key is-black';
        bBtn.setAttribute('data-midi', String(m));
        var leftPct = ((currentWhiteCount - 0.34) / totalWhite) * 100;
        bBtn.style.left = leftPct.toFixed(2) + '%';
        bBtn.style.width = ((0.68 / totalWhite) * 100).toFixed(2) + '%';

        if (chordPcs.indexOf(p) !== -1) bBtn.classList.add('is-chord-tone');
        if (scalePcs.indexOf(p) !== -1) bBtn.classList.add('is-scale-tone');
        if (activeMelodyMidis.indexOf(m) !== -1) bBtn.classList.add('is-active');

        if (shortcutByOffset[o]) {
          var bKbd = document.createElement('span');
          bKbd.className = 'piano-kbd';
          bKbd.textContent = shortcutByOffset[o];
          bBtn.appendChild(bKbd);
        }

        (function (mVal, btnEl) {
          btnEl.addEventListener('pointerdown', function (ev) {
            ev.preventDefault();
            btnEl.classList.add('is-active');
            setTimeout(function () { btnEl.classList.remove('is-active'); }, 220);
            onNoteTrigger(mVal);
          });
        })(m, bBtn);

        whiteWrap.appendChild(bBtn);
      }
    }

    container.appendChild(whiteWrap);
  }

  function getMidiForKeyboardKey(keyStr, octaveShift) {
    if (!keyStr) return null;
    var k = keyStr.toLowerCase();
    for (var i = 0; i < PIANO_KEY_BINDINGS.length; i++) {
      if (PIANO_KEY_BINDINGS[i].key === k) {
        return 60 + (octaveShift || 0) * 12 + PIANO_KEY_BINDINGS[i].offset;
      }
    }
    return null;
  }

  function updatePlayhead(rollContainer, pianoContainer, activeStep, melodyNotes) {
    if (rollContainer) {
      var cells = rollContainer.querySelectorAll('.roll-cell');
      for (var i = 0; i < cells.length; i++) {
        var s = Number(cells[i].getAttribute('data-step'));
        cells[i].classList.toggle('is-playhead', s === activeStep);
      }
    }
    if (pianoContainer) {
      var activeMidis = {};
      if (activeStep >= 0 && melodyNotes) {
        for (var m = 0; m < melodyNotes.length; m++) {
          var nt = melodyNotes[m];
          if (activeStep >= nt.step && activeStep < nt.step + (nt.len || 1)) {
            activeMidis[nt.midi] = true;
          }
        }
      }
      var keys = pianoContainer.querySelectorAll('.piano-key');
      for (var k = 0; k < keys.length; k++) {
        var midi = keys[k].getAttribute('data-midi');
        keys[k].classList.toggle('is-active', Boolean(activeMidis[midi]));
      }
    }
  }

  NS.Melody = {
    generateMelody: generateMelody,
    mutateMelody: mutateMelody,
    renderPianoRoll: renderPianoRoll,
    renderPlayablePiano: renderPlayablePiano,
    updatePlayhead: updatePlayhead,
    getMidiForKeyboardKey: getMidiForKeyboardKey
  };
})(window);
