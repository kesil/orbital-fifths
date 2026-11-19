(function (global) {
  'use strict';

  var NS = (global.OrbitalFifths = global.OrbitalFifths || {});

  var NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  var NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

  var WHEEL_SLOTS = [
    { index: 0, major: 'C', minor: 'Am', dim: 'B°', majorPc: 0, minorPc: 9, dimPc: 11, keySig: '0', sharpsFlats: 0, preferFlats: false },
    { index: 1, major: 'G', minor: 'Em', dim: 'F#°', majorPc: 7, minorPc: 4, dimPc: 6, keySig: '1♯', sharpsFlats: 1, preferFlats: false },
    { index: 2, major: 'D', minor: 'Bm', dim: 'C#°', majorPc: 2, minorPc: 11, dimPc: 1, keySig: '2♯', sharpsFlats: 2, preferFlats: false },
    { index: 3, major: 'A', minor: 'F#m', dim: 'G#°', majorPc: 9, minorPc: 6, dimPc: 8, keySig: '3♯', sharpsFlats: 3, preferFlats: false },
    { index: 4, major: 'E', minor: 'C#m', dim: 'D#°', majorPc: 4, minorPc: 1, dimPc: 3, keySig: '4♯', sharpsFlats: 4, preferFlats: false },
    { index: 5, major: 'B', minor: 'G#m', dim: 'A#°', majorPc: 11, minorPc: 8, dimPc: 10, keySig: '5♯', sharpsFlats: 5, preferFlats: false },
    { index: 6, major: 'F#', altMajor: 'Gb', minor: 'D#m', altMinor: 'Ebm', dim: 'E#°', altDim: 'F°', majorPc: 6, minorPc: 3, dimPc: 5, keySig: '6♯/6♭', sharpsFlats: 6, preferFlats: false },
    { index: 7, major: 'Db', minor: 'Bbm', dim: 'C°', majorPc: 1, minorPc: 10, dimPc: 0, keySig: '5♭', sharpsFlats: -5, preferFlats: true },
    { index: 8, major: 'Ab', minor: 'Fm', dim: 'G°', majorPc: 8, minorPc: 5, dimPc: 7, keySig: '4♭', sharpsFlats: -4, preferFlats: true },
    { index: 9, major: 'Eb', minor: 'Cm', dim: 'D°', majorPc: 3, minorPc: 0, dimPc: 2, keySig: '3♭', sharpsFlats: -3, preferFlats: true },
    { index: 10, major: 'Bb', minor: 'Gm', dim: 'A°', majorPc: 10, minorPc: 7, dimPc: 9, keySig: '2♭', sharpsFlats: -2, preferFlats: true },
    { index: 11, major: 'F', minor: 'Dm', dim: 'E°', majorPc: 5, minorPc: 2, dimPc: 4, keySig: '1♭', sharpsFlats: -1, preferFlats: true }
  ];

  var MODES = {
    major: { key: 'major', name: 'Major (Ionian)', shortName: 'Major', fifthsShift: 0, scale: [0, 2, 4, 5, 7, 9, 11] },
    minor: { key: 'minor', name: 'Natural Minor (Aeolian)', shortName: 'Minor', fifthsShift: -3, scale: [0, 2, 3, 5, 7, 8, 10] },
    dorian: { key: 'dorian', name: 'Dorian', shortName: 'Dorian', fifthsShift: -2, scale: [0, 2, 3, 5, 7, 9, 10] },
    mixolydian: { key: 'mixolydian', name: 'Mixolydian', shortName: 'Mixolydian', fifthsShift: -1, scale: [0, 2, 4, 5, 7, 9, 10] },
    lydian: { key: 'lydian', name: 'Lydian', shortName: 'Lydian', fifthsShift: 1, scale: [0, 2, 4, 6, 7, 9, 11] },
    phrygian: { key: 'phrygian', name: 'Phrygian', shortName: 'Phrygian', fifthsShift: -4, scale: [0, 1, 3, 5, 7, 8, 10] }
  };

  var LETTER_BASE_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

  function mod12(n) {
    return ((n % 12) + 12) % 12;
  }

  function parseNoteName(str) {
    if (!str || typeof str !== 'string') return null;
    var s = str.trim().replace(/♯/g, '#').replace(/♭/g, 'b');
    var m = /^([A-Ga-g])([#b]?)/.exec(s);
    if (!m) return null;
    var letter = m[1].toUpperCase();
    var acc = m[2] || '';
    var pc = LETTER_BASE_PC[letter];
    if (acc === '#') pc = mod12(pc + 1);
    else if (acc === 'b') pc = mod12(pc - 1);
    return {
      pc: pc,
      name: letter + acc,
      rest: s.slice(m[0].length)
    };
  }

  function getNoteName(pc, preferFlats) {
    var p = mod12(pc);
    return preferFlats ? NOTE_NAMES_FLAT[p] : NOTE_NAMES_SHARP[p];
  }

  function getWheelIndexForPc(pc) {
    var target = mod12(pc);
    for (var i = 0; i < WHEEL_SLOTS.length; i++) {
      if (WHEEL_SLOTS[i].majorPc === target) return i;
    }
    return 0;
  }

  function shouldPreferFlats(tonicPc, modeKey) {
    var mode = MODES[modeKey] || MODES.major;
    var tonicIdx = getWheelIndexForPc(tonicPc);
    var kCenter = mod12(tonicIdx + mode.fifthsShift);
    if (tonicPc === 5 || tonicPc === 10 || tonicPc === 3 || tonicPc === 8 || tonicPc === 1) return true;
    return WHEEL_SLOTS[kCenter].preferFlats;
  }

  function formatPitchList(pcs, preferFlats) {
    return pcs.map(function (pc) {
      return getNoteName(pc, preferFlats);
    });
  }

  function parseChord(symbol) {
    if (!symbol || typeof symbol !== 'string') return null;
    var raw = symbol.trim();
    var cleaned = raw.replace(/♯/g, '#').replace(/♭/g, 'b');

    var slashParts = cleaned.split('/');
    var mainPart = slashParts[0].trim();
    var bassPart = slashParts.length > 1 ? slashParts[1].trim() : null;

    var rootInfo = parseNoteName(mainPart);
    if (!rootInfo) return null;

    var rootPc = rootInfo.pc;
    var rootName = rootInfo.name;
    var qStr = rootInfo.rest.trim();

    var bassPc = rootPc;
    var bassName = rootName;
    if (bassPart) {
      var bassParsed = parseNoteName(bassPart);
      if (bassParsed) {
        bassPc = bassParsed.pc;
        bassName = bassParsed.name;
      }
    }

    var baseQuality = 'maj';
    var ext = '';
    var intervals = [0, 4, 7];

    if (qStr === '' || qStr === 'maj') {
      baseQuality = 'maj';
      ext = '';
      intervals = [0, 4, 7];
    } else if (qStr === 'm' || qStr === 'min' || qStr === '-') {
      baseQuality = 'min';
      ext = 'm';
      intervals = [0, 3, 7];
    } else if (qStr === '°' || qStr === 'dim' || qStr === 'o') {
      baseQuality = 'dim';
      ext = '°';
      intervals = [0, 3, 6];
    } else if (qStr === 'ø' || qStr === 'm7b5' || qStr === 'dim7' || qStr === '°7') {
      baseQuality = 'dim';
      if (qStr === 'dim7' || qStr === '°7') {
        ext = 'dim7';
        intervals = [0, 3, 6, 9];
      } else {
        ext = 'm7b5';
        intervals = [0, 3, 6, 10];
      }
    } else if (qStr === 'maj7' || qStr === 'M7' || qStr === 'Δ7') {
      baseQuality = 'maj';
      ext = 'maj7';
      intervals = [0, 4, 7, 11];
    } else if (qStr === 'maj9' || qStr === 'M9') {
      baseQuality = 'maj';
      ext = 'maj9';
      intervals = [0, 4, 7, 11, 14];
    } else if (qStr === 'm7' || qStr === 'min7' || qStr === '-7') {
      baseQuality = 'min';
      ext = 'm7';
      intervals = [0, 3, 7, 10];
    } else if (qStr === 'm9' || qStr === 'min9') {
      baseQuality = 'min';
      ext = 'm9';
      intervals = [0, 3, 7, 10, 14];
    } else if (qStr === 'm6' || qStr === 'min6') {
      baseQuality = 'min';
      ext = 'm6';
      intervals = [0, 3, 7, 9];
    } else if (qStr === 'madd9') {
      baseQuality = 'min';
      ext = 'madd9';
      intervals = [0, 3, 7, 14];
    } else if (qStr === 'm(maj7)' || qStr === 'mmaj7') {
      baseQuality = 'min';
      ext = 'mmaj7';
      intervals = [0, 3, 7, 11];
    } else if (qStr === '7' || qStr === 'dom7') {
      baseQuality = 'maj';
      ext = '7';
      intervals = [0, 4, 7, 10];
    } else if (qStr === '9') {
      baseQuality = 'maj';
      ext = '9';
      intervals = [0, 4, 7, 10, 14];
    } else if (qStr === '7sus4') {
      baseQuality = 'maj';
      ext = '7sus4';
      intervals = [0, 5, 7, 10];
    } else if (qStr === '6') {
      baseQuality = 'maj';
      ext = '6';
      intervals = [0, 4, 7, 9];
    } else if (qStr === 'add9') {
      baseQuality = 'maj';
      ext = 'add9';
      intervals = [0, 4, 7, 14];
    } else if (qStr === 'sus2') {
      baseQuality = 'maj';
      ext = 'sus2';
      intervals = [0, 2, 7];
    } else if (qStr === 'sus4' || qStr === 'sus') {
      baseQuality = 'maj';
      ext = 'sus4';
      intervals = [0, 5, 7];
    } else if (qStr === 'aug' || qStr === '+') {
      baseQuality = 'maj';
      ext = 'aug';
      intervals = [0, 4, 8];
    } else if (qStr === '5') {
      baseQuality = 'maj';
      ext = '5';
      intervals = [0, 7];
    } else if (qStr.indexOf('m') === 0 && qStr.indexOf('maj') !== 0) {
      baseQuality = 'min';
      ext = qStr;
      intervals = [0, 3, 7, 10];
    } else {
      baseQuality = 'maj';
      ext = qStr;
      intervals = [0, 4, 7];
    }

    var preferFlats = rootName.indexOf('b') !== -1 || rootPc === 5;
    var chordTonePcs = [];
    for (var i = 0; i < intervals.length; i++) {
      var p = mod12(rootPc + intervals[i]);
      if (chordTonePcs.indexOf(p) === -1) chordTonePcs.push(p);
    }

    var normalizedSymbol = rootName + ext + (bassPc !== rootPc ? '/' + bassName : '');

    return {
      symbol: raw,
      normalizedSymbol: normalizedSymbol,
      rootName: rootName,
      rootPc: rootPc,
      baseQuality: baseQuality,
      ext: ext,
      intervals: intervals,
      bassPc: bassPc,
      bassName: bassName,
      chordTonePcs: chordTonePcs,
      noteNames: formatPitchList(chordTonePcs, preferFlats)
    };
  }

  function buildChordSymbol(rootPc, baseQuality, extSuffix, preferFlats, bassPc) {
    var rootName = getNoteName(rootPc, preferFlats);
    var sym = rootName;
    if (extSuffix !== undefined && extSuffix !== null && extSuffix !== '') {
      sym += extSuffix;
    } else if (baseQuality === 'min') {
      sym += 'm';
    } else if (baseQuality === 'dim') {
      sym += '°';
    }
    if (typeof bassPc === 'number' && mod12(bassPc) !== mod12(rootPc)) {
      sym += '/' + getNoteName(bassPc, preferFlats);
    }
    return sym;
  }

  function transposeChordSymbol(symbol, deltaSemitones, preferFlats) {
    var parsed = parseChord(symbol);
    if (!parsed) return symbol;
    var newRootPc = mod12(parsed.rootPc + deltaSemitones);
    var newBassPc = mod12(parsed.bassPc + deltaSemitones);
    var rootName = getNoteName(newRootPc, preferFlats);
    var result = rootName + parsed.ext;
    if (parsed.bassPc !== parsed.rootPc) {
      result += '/' + getNoteName(newBassPc, preferFlats);
    }
    return result;
  }

  function getScalePcs(tonicPc, modeKey) {
    var mode = MODES[modeKey] || MODES.major;
    return mode.scale.map(function (iv) {
      return mod12(tonicPc + iv);
    });
  }

  var DEGREE_LABELS = {
    0: 'I',
    1: '♭II',
    2: 'II',
    3: '♭III',
    4: 'III',
    5: 'IV',
    6: '♯IV',
    7: 'V',
    8: '♭VI',
    9: 'VI',
    10: '♭VII',
    11: 'VII'
  };

  function getRomanForChord(rootPc, baseQuality, tonicPc, modeKey) {
    var diff = mod12(rootPc - tonicPc);
    var label = DEGREE_LABELS[diff] || 'I';
    if (modeKey === 'lydian' && diff === 6) label = '♯IV';
    if (diff === 6 && modeKey !== 'lydian') label = '♭V';

    if (baseQuality === 'min') {
      return label.toLowerCase();
    }
    if (baseQuality === 'dim') {
      return label.toLowerCase() + '°';
    }
    return label;
  }

  function getHarmonicFunction(rootPc, baseQuality, tonicPc, modeKey, isDiatonic) {
    var diff = mod12(rootPc - tonicPc);
    var isMinorMode = modeKey === 'minor' || modeKey === 'dorian' || modeKey === 'phrygian';

    if (isDiatonic) {
      if (!isMinorMode) {
        if ((diff === 0 && baseQuality === 'maj') || (diff === 9 && baseQuality === 'min') || (diff === 4 && baseQuality === 'min')) {
          return 'tonic';
        }
        if ((diff === 5 && baseQuality === 'maj') || (diff === 2 && baseQuality === 'min')) {
          return 'subdominant';
        }
        if ((diff === 7 && baseQuality === 'maj') || (diff === 11 && baseQuality === 'dim') || (diff === 10 && baseQuality === 'maj')) {
          return 'dominant';
        }
        return 'subdominant';
      } else {
        if ((diff === 0 && baseQuality === 'min') || (diff === 3 && baseQuality === 'maj') || (diff === 8 && baseQuality === 'maj')) {
          return 'tonic';
        }
        if ((diff === 5 && baseQuality === 'min') || (diff === 2 && baseQuality === 'dim') || (diff === 2 && baseQuality === 'min')) {
          return 'subdominant';
        }
        if ((diff === 7 && (baseQuality === 'min' || baseQuality === 'maj')) || (diff === 10 && baseQuality === 'maj') || (diff === 1 && baseQuality === 'maj')) {
          return 'dominant';
        }
        return 'subdominant';
      }
    }

    // Check common borrowed / secondary chords
    if (!isMinorMode) {
      // Secondary dominants in major: II (V/V), VI (V/ii), III (V/vi), VII (V/iii)
      if ((diff === 2 || diff === 4 || diff === 9 || diff === 11) && baseQuality === 'maj') {
        return 'secondary';
      }
      // Modal interchange from parallel minor: iv, bVII, bVI, bIII
      if ((diff === 5 && baseQuality === 'min') || (diff === 10 && baseQuality === 'maj') || (diff === 8 && baseQuality === 'maj') || (diff === 3 && baseQuality === 'maj')) {
        return 'borrowed';
      }
    } else {
      // Harmonic minor V (major), Dorian IV (major), Picardy I (major)
      if ((diff === 7 && baseQuality === 'maj') || (diff === 5 && baseQuality === 'maj') || (diff === 0 && baseQuality === 'maj')) {
        return 'borrowed';
      }
    }

    return 'chromatic';
  }

  function getWheelSlotLabel(slot, ring, useFlats) {
    if (ring === 'major') {
      return (useFlats && slot.altMajor) ? slot.altMajor : slot.major;
    }
    if (ring === 'minor') {
      return (useFlats && slot.altMinor) ? slot.altMinor : slot.minor;
    }
    return (useFlats && slot.altDim) ? slot.altDim : slot.dim;
  }

  function analyzeWheelForKey(tonicPc, modeKey) {
    var mode = MODES[modeKey] || MODES.major;
    var tonicWheelIndex = getWheelIndexForPc(tonicPc);
    var kCenter = mod12(tonicWheelIndex + mode.fifthsShift);
    var diatonicIndices = [mod12(kCenter - 1), kCenter, mod12(kCenter + 1)];
    var preferFlats = shouldPreferFlats(tonicPc, modeKey);
    var scalePcs = getScalePcs(tonicPc, modeKey);

    var wedges = [];
    var rings = [
      { ring: 'major', pcKey: 'majorPc', quality: 'maj' },
      { ring: 'minor', pcKey: 'minorPc', quality: 'min' },
      { ring: 'dim', pcKey: 'dimPc', quality: 'dim' }
    ];

    for (var r = 0; r < rings.length; r++) {
      var ringSpec = rings[r];
      for (var i = 0; i < 12; i++) {
        var slot = WHEEL_SLOTS[i];
        var rootPc = slot[ringSpec.pcKey];
        var isDiatonic = ringSpec.ring === 'dim'
          ? (i === kCenter)
          : (diatonicIndices.indexOf(i) !== -1);

        var label = getWheelSlotLabel(slot, ringSpec.ring, preferFlats);
        var roman = getRomanForChord(rootPc, ringSpec.quality, tonicPc, modeKey);
        var func = getHarmonicFunction(rootPc, ringSpec.quality, tonicPc, modeKey, isDiatonic);

        wedges.push({
          id: ringSpec.ring + '-' + i,
          ring: ringSpec.ring,
          index: i,
          rootPc: rootPc,
          baseQuality: ringSpec.quality,
          symbol: label,
          roman: roman,
          isDiatonic: isDiatonic,
          harmonicFunction: func,
          keySig: slot.keySig
        });
      }
    }

    return {
      tonicPc: mod12(tonicPc),
      tonicName: getNoteName(tonicPc, preferFlats),
      modeKey: mode.key,
      modeName: mode.name,
      kCenter: kCenter,
      diatonicIndices: diatonicIndices,
      preferFlats: preferFlats,
      scalePcs: scalePcs,
      wedges: wedges
    };
  }

  function applyExtension(rootPc, baseQuality, extMode, keyContext) {
    var preferFlats = keyContext ? keyContext.preferFlats : shouldPreferFlats(rootPc, 'major');
    var rootName = getNoteName(rootPc, preferFlats);

    if (!extMode || extMode === 'triad') {
      if (baseQuality === 'min') return parseChord(rootName + 'm');
      if (baseQuality === 'dim') return parseChord(rootName + '°');
      return parseChord(rootName);
    }

    if (extMode === 'diatonic7') {
      var tonicPc = keyContext ? keyContext.tonicPc : 0;
      var modeKey = keyContext ? keyContext.modeKey : 'major';
      var scale = getScalePcs(tonicPc, modeKey);
      var rPc = mod12(rootPc);
      var maj7Pc = mod12(rPc + 11);
      var min7Pc = mod12(rPc + 10);

      if (baseQuality === 'dim') {
        return parseChord(rootName + 'm7b5');
      }
      if (baseQuality === 'min') {
        return parseChord(rootName + 'm7');
      }
      // For major chord: check if 7th in scale is major 7th or dominant minor 7th
      if (scale.indexOf(min7Pc) !== -1 && scale.indexOf(maj7Pc) === -1) {
        return parseChord(rootName + '7');
      }
      if (scale.indexOf(maj7Pc) !== -1) {
        return parseChord(rootName + 'maj7');
      }
      // Secondary dominant or borrowed dominant defaults to dom7
      return parseChord(rootName + '7');
    }

    if (extMode === 'maj7') {
      if (baseQuality === 'min') return parseChord(rootName + 'm7');
      if (baseQuality === 'dim') return parseChord(rootName + 'm7b5');
      return parseChord(rootName + 'maj7');
    }
    if (extMode === 'm7') {
      if (baseQuality === 'dim') return parseChord(rootName + 'm7b5');
      return parseChord(rootName + 'm7');
    }
    if (extMode === '7') {
      if (baseQuality === 'min') return parseChord(rootName + 'm7');
      if (baseQuality === 'dim') return parseChord(rootName + 'dim7');
      return parseChord(rootName + '7');
    }
    if (extMode === 'sus2') {
      return parseChord(rootName + 'sus2');
    }
    if (extMode === 'sus4') {
      return parseChord(rootName + 'sus4');
    }
    if (extMode === 'add9') {
      if (baseQuality === 'min') return parseChord(rootName + 'madd9');
      return parseChord(rootName + 'add9');
    }
    if (extMode === '9') {
      if (baseQuality === 'min') return parseChord(rootName + 'm9');
      return parseChord(rootName + '9');
    }
    if (extMode === '6') {
      if (baseQuality === 'min') return parseChord(rootName + 'm6');
      return parseChord(rootName + '6');
    }
    return parseChord(rootName + (baseQuality === 'min' ? 'm' : baseQuality === 'dim' ? '°' : ''));
  }

  function getVoicingMidi(chordObj, prevUpperMidi, smartVoiceLeading) {
    if (!chordObj) {
      return { bass: 48, upper: [60, 64, 67], all: [48, 60, 64, 67] };
    }
    if (smartVoiceLeading === undefined) smartVoiceLeading = true;

    // Bass note in range C2 (36) .. Eb3 (51)
    var bass = 36 + mod12(chordObj.bassPc);
    if (bass < 38) bass += 12; // Keep low bass warm above D2 (38) when useful, range 38..49

    var intervals = chordObj.intervals && chordObj.intervals.length ? chordObj.intervals : [0, 4, 7];
    var pcs = intervals.map(function (iv) {
      return mod12(chordObj.rootPc + iv);
    });

    // Build candidate close-position voicings spanning upper voices around 55..76
    var candidates = [];
    for (var inv = 0; inv < pcs.length; inv++) {
      for (var baseOct = 4; baseOct <= 5; baseOct++) {
        var voicing = [];
        var cur = baseOct * 12 + pcs[inv];
        voicing.push(cur);
        for (var k = 1; k < pcs.length; k++) {
          var nextPc = pcs[(inv + k) % pcs.length];
          var cand = cur + mod12(nextPc - cur);
          if (cand <= cur) cand += 12;
          voicing.push(cand);
          cur = cand;
        }
        var minNote = voicing[0];
        var maxNote = voicing[voicing.length - 1];
        if (minNote >= 53 && maxNote <= 77) {
          candidates.push(voicing);
        }
      }
    }

    if (candidates.length === 0) {
      var fallback = intervals.map(function (iv) {
        return 60 + mod12(chordObj.rootPc) + iv;
      });
      return {
        bass: bass,
        upper: fallback,
        all: [bass].concat(fallback)
      };
    }

    var chosen = candidates[0];
    if (smartVoiceLeading && prevUpperMidi && prevUpperMidi.length > 0) {
      var prevAvg = prevUpperMidi.reduce(function (a, b) { return a + b; }, 0) / prevUpperMidi.length;
      var bestCost = Infinity;
      for (var c = 0; c < candidates.length; c++) {
        var cand = candidates[c];
        var candAvg = cand.reduce(function (a, b) { return a + b; }, 0) / cand.length;
        var cost = Math.abs(candAvg - prevAvg) * 1.5;
        // Pairwise minimum voice movement distance
        for (var v = 0; v < cand.length; v++) {
          var minDist = 99;
          for (var pv = 0; pv < prevUpperMidi.length; pv++) {
            var d = Math.abs(cand[v] - prevUpperMidi[pv]);
            if (d < minDist) minDist = d;
          }
          cost += minDist;
        }
        if (cost < bestCost) {
          bestCost = cost;
          chosen = cand;
        }
      }
    } else {
      // Pick closest to middle C4-G4 center (64)
      var bestCenterCost = Infinity;
      for (var j = 0; j < candidates.length; j++) {
        var avg = candidates[j].reduce(function (a, b) { return a + b; }, 0) / candidates[j].length;
        var diff = Math.abs(avg - 65);
        if (diff < bestCenterCost) {
          bestCenterCost = diff;
          chosen = candidates[j];
        }
      }
    }

    var all = [bass].concat(chosen);
    return {
      bass: bass,
      upper: chosen,
      all: all
    };
  }

  function detectKeyFromChords(chordObjs) {
    if (!chordObjs || chordObjs.length === 0) {
      return { tonicPc: 0, modeKey: 'major' };
    }
    var bestScore = -9999;
    var bestKey = { tonicPc: chordObjs[0].rootPc, modeKey: chordObjs[0].baseQuality === 'min' ? 'minor' : 'major' };

    var modesToCheck = ['major', 'minor'];
    for (var m = 0; m < modesToCheck.length; m++) {
      var modeKey = modesToCheck[m];
      for (var tonic = 0; tonic < 12; tonic++) {
        var analysis = analyzeWheelForKey(tonic, modeKey);
        var score = 0;
        for (var i = 0; i < chordObjs.length; i++) {
          var ch = chordObjs[i];
          var matched = null;
          for (var w = 0; w < analysis.wedges.length; w++) {
            if (analysis.wedges[w].rootPc === ch.rootPc && analysis.wedges[w].baseQuality === ch.baseQuality) {
              matched = analysis.wedges[w];
              break;
            }
          }
          if (matched && matched.isDiatonic) {
            score += 4;
          } else if (matched && (matched.harmonicFunction === 'borrowed' || matched.harmonicFunction === 'secondary')) {
            score += 1.5;
          } else {
            score -= 2;
          }
          // Tonic anchor bonus for first and last chords
          if (i === 0 && ch.rootPc === tonic && ((modeKey === 'major' && ch.baseQuality === 'maj') || (modeKey === 'minor' && ch.baseQuality === 'min'))) {
            score += 2.2;
          }
          if (i === chordObjs.length - 1 && ch.rootPc === tonic) {
            score += 0.8;
          }
          // V -> I cadence boost
          if (i > 0 && ch.rootPc === tonic && mod12(chordObjs[i - 1].rootPc - tonic) === 7 && chordObjs[i - 1].baseQuality === 'maj') {
            score += 1.8;
          }
        }
        if (score > bestScore) {
          bestScore = score;
          bestKey = { tonicPc: tonic, modeKey: modeKey };
        }
      }
    }
    return bestKey;
  }

  function findWedgeForChord(chordObj) {
    if (!chordObj) return null;
    for (var i = 0; i < WHEEL_SLOTS.length; i++) {
      var slot = WHEEL_SLOTS[i];
      if (chordObj.baseQuality === 'maj' && slot.majorPc === chordObj.rootPc) {
        return { ring: 'major', index: i };
      }
      if (chordObj.baseQuality === 'min' && slot.minorPc === chordObj.rootPc) {
        return { ring: 'minor', index: i };
      }
      if (chordObj.baseQuality === 'dim' && slot.dimPc === chordObj.rootPc) {
        return { ring: 'dim', index: i };
      }
    }
    return null;
  }

  // Open guitar chord dictionary: frets [E2, A2, D3, G3, B3, E4], -1 = muted
  var OPEN_GUITAR_SHAPES = {
    'C': { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], baseFret: 1 },
    'Cmaj7': { frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0], baseFret: 1 },
    'Cadd9': { frets: [-1, 3, 2, 0, 3, 0], fingers: [0, 2, 1, 0, 3, 0], baseFret: 1 },
    'C7': { frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0], baseFret: 1 },
    'D': { frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2], baseFret: 1 },
    'Dm': { frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1], baseFret: 1 },
    'D7': { frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3], baseFret: 1 },
    'Dm7': { frets: [-1, -1, 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1], baseFret: 1 },
    'Dmaj7': { frets: [-1, -1, 0, 2, 2, 2], fingers: [0, 0, 0, 1, 2, 3], baseFret: 1 },
    'Dsus4': { frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 3], baseFret: 1 },
    'Dsus2': { frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 3, 0], baseFret: 1 },
    'E': { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0], baseFret: 1 },
    'Em': { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0], baseFret: 1 },
    'E7': { frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0], baseFret: 1 },
    'Em7': { frets: [0, 2, 2, 0, 3, 0], fingers: [0, 1, 2, 0, 3, 0], baseFret: 1 },
    'F': { frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], baseFret: 1 },
    'Fmaj7': { frets: [-1, -1, 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0], baseFret: 1 },
    'G': { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3], baseFret: 1 },
    'G7': { frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1], baseFret: 1 },
    'G6': { frets: [3, 2, 0, 0, 0, 0], fingers: [2, 1, 0, 0, 0, 0], baseFret: 1 },
    'A': { frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0], baseFret: 1 },
    'Am': { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0], baseFret: 1 },
    'A7': { frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 1, 0, 2, 0], baseFret: 1 },
    'Am7': { frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0], baseFret: 1 },
    'Amaj7': { frets: [-1, 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0], baseFret: 1 },
    'Asus2': { frets: [-1, 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0], baseFret: 1 },
    'Asus4': { frets: [-1, 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0], baseFret: 1 },
    'Bm': { frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], baseFret: 1 },
    'B7': { frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4], baseFret: 1 }
  };

  function getGuitarDiagram(chordObj) {
    if (!chordObj) {
      return { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], baseFret: 1, muted: [true, false, false, false, false, false], isOpen: true };
    }
    var lookupKey = chordObj.rootName + chordObj.ext;
    if (OPEN_GUITAR_SHAPES[lookupKey]) {
      var shape = OPEN_GUITAR_SHAPES[lookupKey];
      return {
        frets: shape.frets.slice(),
        fingers: shape.fingers.slice(),
        baseFret: shape.baseFret,
        muted: shape.frets.map(function (f) { return f < 0; }),
        isOpen: lookupKey !== 'F' && lookupKey !== 'Bm'
      };
    }

    // Movable barre shape computation (E-shape on 6th string or A-shape on 5th string)
    var rootPc = chordObj.rootPc;
    var eShapeFret = mod12(rootPc - 4); // E is 4
    var aShapeFret = mod12(rootPc - 9); // A is 9
    var useEShape = eShapeFret <= aShapeFret || eShapeFret === 0;
    if (aShapeFret > 0 && aShapeFret <= 5 && (eShapeFret === 0 || eShapeFret > 5)) {
      useEShape = false;
    }

    var baseFret;
    var frets;
    var fingers;

    if (chordObj.baseQuality === 'dim') {
      // Compact 4-string diminished triad/7th shape on strings 5..2 or 4..1
      baseFret = Math.max(1, mod12(rootPc - 9));
      if (baseFret === 0) baseFret = 12;
      frets = [-1, baseFret, baseFret + 1, baseFret + 2, baseFret + 1, -1];
      fingers = [0, 1, 2, 4, 3, 0];
      return {
        frets: frets,
        fingers: fingers,
        baseFret: baseFret,
        muted: frets.map(function (f) { return f < 0; }),
        isOpen: false
      };
    }

    if (useEShape) {
      baseFret = eShapeFret === 0 ? 12 : eShapeFret;
      if (chordObj.ext === 'm7') {
        frets = [baseFret, baseFret + 2, baseFret, baseFret, baseFret, baseFret];
        fingers = [1, 3, 1, 1, 1, 1];
      } else if (chordObj.ext === '7') {
        frets = [baseFret, baseFret + 2, baseFret, baseFret + 1, baseFret, baseFret];
        fingers = [1, 3, 1, 2, 1, 1];
      } else if (chordObj.ext === 'maj7') {
        frets = [baseFret, -1, baseFret + 1, baseFret + 1, baseFret, -1];
        fingers = [1, 0, 3, 4, 2, 0];
      } else if (chordObj.baseQuality === 'min') {
        frets = [baseFret, baseFret + 2, baseFret + 2, baseFret, baseFret, baseFret];
        fingers = [1, 3, 4, 1, 1, 1];
      } else {
        frets = [baseFret, baseFret + 2, baseFret + 2, baseFret + 1, baseFret, baseFret];
        fingers = [1, 3, 4, 2, 1, 1];
      }
    } else {
      baseFret = aShapeFret === 0 ? 12 : aShapeFret;
      if (chordObj.ext === 'm7') {
        frets = [-1, baseFret, baseFret + 2, baseFret, baseFret + 1, baseFret];
        fingers = [0, 1, 3, 1, 2, 1];
      } else if (chordObj.ext === '7') {
        frets = [-1, baseFret, baseFret + 2, baseFret, baseFret + 2, baseFret];
        fingers = [0, 1, 3, 1, 4, 1];
      } else if (chordObj.ext === 'maj7') {
        frets = [-1, baseFret, baseFret + 2, baseFret + 1, baseFret + 2, baseFret];
        fingers = [0, 1, 3, 2, 4, 1];
      } else if (chordObj.baseQuality === 'min') {
        frets = [-1, baseFret, baseFret + 2, baseFret + 2, baseFret + 1, baseFret];
        fingers = [0, 1, 3, 4, 2, 1];
      } else {
        frets = [-1, baseFret, baseFret + 2, baseFret + 2, baseFret + 2, baseFret];
        fingers = [0, 1, 2, 3, 4, 1];
      }
    }

    return {
      frets: frets,
      fingers: fingers,
      baseFret: baseFret,
      muted: frets.map(function (f) { return f < 0; }),
      isOpen: false
    };
  }

  function scoreGuitarPlayability(playedSymbols) {
    var easyOpen = { C: 3, G: 3, D: 3, A: 3, E: 3, Am: 3, Em: 3, Dm: 3, Cmaj7: 3, Fmaj7: 2, G7: 3, E7: 3, A7: 3, D7: 3, Am7: 3, Em7: 3, Dm7: 3, Dsus4: 3, Asus2: 3, Asus4: 3, Cadd9: 3 };
    var score = 0;
    for (var i = 0; i < playedSymbols.length; i++) {
      var s = playedSymbols[i].split('/')[0];
      if (easyOpen[s]) {
        score += easyOpen[s];
      } else {
        var parsed = parseChord(s);
        if (parsed && parsed.baseQuality === 'maj' && (parsed.rootPc === 0 || parsed.rootPc === 2 || parsed.rootPc === 4 || parsed.rootPc === 7 || parsed.rootPc === 9)) {
          score += 2.5;
        } else if (parsed && parsed.baseQuality === 'min' && (parsed.rootPc === 9 || parsed.rootPc === 4 || parsed.rootPc === 2)) {
          score += 2.5;
        } else if (s === 'F' || s === 'Bm') {
          score += 0.8;
        } else {
          score -= 1.2;
        }
      }
    }
    return score;
  }

  function getCapoRecommendations(chordObjs) {
    if (!chordObjs || chordObjs.length === 0) return [];
    var results = [];
    for (var capo = 0; capo <= 7; capo++) {
      var played = [];
      for (var i = 0; i < chordObjs.length; i++) {
        var c = chordObjs[i];
        var transposed = transposeChordSymbol(c.symbol, -capo, false);
        // Normalize sharp/flat names cleanly for guitar shapes
        if (transposed.indexOf('A#') === 0) transposed = 'Bb' + transposed.slice(2);
        if (transposed.indexOf('D#') === 0) transposed = 'Eb' + transposed.slice(2);
        if (transposed.indexOf('G#') === 0) transposed = 'Ab' + transposed.slice(2);
        played.push(transposed);
      }
      var score = scoreGuitarPlayability(played) - capo * 0.12;
      results.push({
        capo: capo,
        label: capo === 0 ? 'No Capo (Open)' : 'Capo Fret ' + capo,
        playedChords: played,
        score: score
      });
    }
    results.sort(function (a, b) { return b.score - a.score; });
    return results.slice(0, 3);
  }

  function getReharmonizeOptions(chordObj, keyContext) {
    if (!chordObj) return [];
    var preferFlats = keyContext ? keyContext.preferFlats : false;
    var rootName = getNoteName(chordObj.rootPc, preferFlats);
    var options = [];

    // 1. Quality / Extension variants
    var extVariants = chordObj.baseQuality === 'min'
      ? ['', 'm', 'm7', 'm9', 'madd9', 'm6']
      : chordObj.baseQuality === 'dim'
        ? ['°', 'm7b5', 'dim7']
        : ['', 'maj7', '7', 'sus2', 'sus4', 'add9', '6'];

    for (var i = 0; i < extVariants.length; i++) {
      var sym = rootName + extVariants[i];
      if (sym !== chordObj.symbol) {
        options.push({ group: 'Color & Extensions', label: sym, symbol: sym, reason: 'Richer harmonic color' });
      }
    }

    // 2. Slash bass inversions (1st & 2nd inversion)
    if (chordObj.intervals && chordObj.intervals.length >= 3) {
      var thirdPc = mod12(chordObj.rootPc + chordObj.intervals[1]);
      var fifthPc = mod12(chordObj.rootPc + chordObj.intervals[2]);
      var inv1 = rootName + chordObj.ext + '/' + getNoteName(thirdPc, preferFlats);
      var inv2 = rootName + chordObj.ext + '/' + getNoteName(fifthPc, preferFlats);
      options.push({ group: 'Slash Bass Inversions', label: inv1, symbol: inv1, reason: 'Smooth 1st inversion bass' });
      options.push({ group: 'Slash Bass Inversions', label: inv2, symbol: inv2, reason: 'Pedal / 2nd inversion bass' });
    }

    // 3. Reharmonize / Borrowed swaps
    if (chordObj.baseQuality === 'maj') {
      options.push({ group: 'Songwriter Swaps', label: rootName + 'm (Modal Swap)', symbol: rootName + 'm', reason: 'Bittersweet minor borrow' });
    } else if (chordObj.baseQuality === 'min') {
      options.push({ group: 'Songwriter Swaps', label: rootName + ' (Picardy / Lift)', symbol: rootName, reason: 'Bright major lift' });
    }
    var tritoneRoot = getNoteName(mod12(chordObj.rootPc + 6), true);
    options.push({ group: 'Songwriter Swaps', label: tritoneRoot + '7 (Tritone Sub)', symbol: tritoneRoot + '7', reason: 'Chromatic jazz turnaround' });

    var secDomRoot = getNoteName(mod12(chordObj.rootPc + 7), preferFlats);
    options.push({ group: 'Songwriter Swaps', label: 'Insert ' + secDomRoot + '7 Before', symbol: secDomRoot + '7', insertBefore: true, reason: 'Secondary dominant pull' });

    return options;
  }

  function suggestContrastingSection(currentChords, tonicPc, modeKey, targetSectionName) {
    var analysis = analyzeWheelForKey(tonicPc, modeKey);
    var preferFlats = analysis.preferFlats;
    var isMinor = modeKey === 'minor' || modeKey === 'dorian' || modeKey === 'phrygian';

    function chordAt(semitoneOffset, quality) {
      var pc = mod12(tonicPc + semitoneOffset);
      var nm = getNoteName(pc, preferFlats);
      if (quality === 'min') return nm + 'm';
      if (quality === 'dim') return nm + '°';
      return nm;
    }

    if (targetSectionName === 'Chorus') {
      return isMinor
        ? [chordAt(8, 'maj'), chordAt(10, 'maj'), chordAt(0, 'min'), chordAt(7, 'maj')] // VI - VII - i - V
        : [chordAt(0, 'maj'), chordAt(7, 'maj'), chordAt(9, 'min'), chordAt(5, 'maj')]; // I - V - vi - IV
    }
    if (targetSectionName === 'Pre-Chorus') {
      return isMinor
        ? [chordAt(5, 'min'), chordAt(3, 'maj'), chordAt(10, 'maj'), chordAt(7, 'maj')] // iv - III - VII - V
        : [chordAt(2, 'min'), chordAt(9, 'min'), chordAt(5, 'maj'), chordAt(7, 'maj')]; // ii - vi - IV - V
    }
    if (targetSectionName === 'Bridge') {
      return isMinor
        ? [chordAt(5, 'min'), chordAt(8, 'maj'), chordAt(2, 'min'), chordAt(7, 'maj')] // iv - VI - ii - V
        : [chordAt(4, 'min'), chordAt(5, 'maj'), chordAt(5, 'min'), chordAt(7, 'maj')]; // iii - IV - iv (borrowed!) - V
    }
    // Verse
    return isMinor
      ? [chordAt(0, 'min'), chordAt(5, 'min'), chordAt(8, 'maj'), chordAt(7, 'min')]
      : [chordAt(9, 'min'), chordAt(5, 'maj'), chordAt(0, 'maj'), chordAt(7, 'maj')];
  }

  NS.Theory = {
    NOTE_NAMES_SHARP: NOTE_NAMES_SHARP,
    NOTE_NAMES_FLAT: NOTE_NAMES_FLAT,
    WHEEL_SLOTS: WHEEL_SLOTS,
    MODES: MODES,
    mod12: mod12,
    getNoteName: getNoteName,
    getWheelIndexForPc: getWheelIndexForPc,
    shouldPreferFlats: shouldPreferFlats,
    parseChord: parseChord,
    buildChordSymbol: buildChordSymbol,
    transposeChordSymbol: transposeChordSymbol,
    getScalePcs: getScalePcs,
    getRomanForChord: getRomanForChord,
    analyzeWheelForKey: analyzeWheelForKey,
    applyExtension: applyExtension,
    getVoicingMidi: getVoicingMidi,
    detectKeyFromChords: detectKeyFromChords,
    findWedgeForChord: findWedgeForChord,
    getGuitarDiagram: getGuitarDiagram,
    getCapoRecommendations: getCapoRecommendations,
    getReharmonizeOptions: getReharmonizeOptions,
    suggestContrastingSection: suggestContrastingSection
  };
})(window);
