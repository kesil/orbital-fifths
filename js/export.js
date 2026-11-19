(function (global) {
  'use strict';

  var NS = (global.OrbitalFifths = global.OrbitalFifths || {});
  var Theory = NS.Theory;
  var Audio = NS.Audio;

  function slugify(str) {
    return (str || 'orbital-fifths-song')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'orbital-fifths-song';
  }

  function triggerDownload(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 500);
  }

  // --- Syllable & Rhyme Utilities (shared by Lyrics Lab & Lead Sheet) ---
  function countWordSyllables(word) {
    var w = (word || '').toLowerCase().replace(/[^a-z]/g, '');
    if (!w) return 0;
    if (w.length <= 3) return 1;
    w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    w = w.replace(/^y/, '');
    var groups = w.match(/[aeiouy]{1,2}/g);
    return groups ? Math.max(1, groups.length) : 1;
  }

  function estimateLineSyllables(line) {
    if (!line || !line.trim()) return 0;
    var words = line.trim().split(/\s+/);
    var total = 0;
    for (var i = 0; i < words.length; i++) {
      total += countWordSyllables(words[i]);
    }
    return total;
  }

  function getEndWordRhymeKey(line) {
    if (!line || !line.trim()) return null;
    var words = line.trim().replace(/[^a-zA-Z\s']/g, '').trim().split(/\s+/);
    if (!words.length) return null;
    var last = words[words.length - 1].toLowerCase().replace(/[^a-z]/g, '');
    if (last.length < 2) return null;
    // Extract trailing vowel + coda for approximate rhyme grouping
    var m = /([aeiouy]+[bcdfghjklmnpqrstvwxz]*)$/.exec(last);
    if (m && m[1].length >= 2) return m[1].slice(-3);
    return last.slice(-2);
  }

  // --- MIDI Binary Encoder (SMF Format 1, 480 PPQN) ---
  function writeVarLen(val) {
    var buffer = [val & 0x7f];
    while ((val >>= 7) > 0) {
      buffer.unshift((val & 0x7f) | 0x80);
    }
    return buffer;
  }

  function pushUint32BE(arr, num) {
    arr.push((num >>> 24) & 0xff, (num >>> 16) & 0xff, (num >>> 8) & 0xff, num & 0xff);
  }

  function pushUint16BE(arr, num) {
    arr.push((num >>> 8) & 0xff, num & 0xff);
  }

  function pushStringBytes(arr, str) {
    for (var i = 0; i < str.length; i++) {
      arr.push(str.charCodeAt(i) & 0xff);
    }
  }

  function buildTrackChunk(events) {
    // events: array of { tick: number, bytes: number[] }
    events.sort(function (a, b) { return a.tick - b.tick; });
    var data = [];
    var prevTick = 0;
    for (var i = 0; i < events.length; i++) {
      var delta = Math.max(0, events[i].tick - prevTick);
      prevTick = events[i].tick;
      var vlq = writeVarLen(delta);
      for (var v = 0; v < vlq.length; v++) data.push(vlq[v]);
      for (var b = 0; b < events[i].bytes.length; b++) data.push(events[i].bytes[b]);
    }
    // End of track
    data.push(0x00, 0xff, 0x2f, 0x00);

    var chunk = [];
    pushStringBytes(chunk, 'MTrk');
    pushUint32BE(chunk, data.length);
    for (var k = 0; k < data.length; k++) chunk.push(data[k]);
    return chunk;
  }

  function buildMidiBytes(songState) {
    var ppqn = 480;
    var ticksPerBar = ppqn * 4;
    var bpm = songState.bpm || 100;
    var usPerBeat = Math.round(60000000 / bpm);

    // Track 0: Tempo & Time Signature
    var tempoEvents = [
      {
        tick: 0,
        bytes: [0xff, 0x58, 0x04, 0x04, 0x02, 0x18, 0x08]
      },
      {
        tick: 0,
        bytes: [0xff, 0x51, 0x03, (usPerBeat >> 16) & 0xff, (usPerBeat >> 8) & 0xff, usPerBeat & 0xff]
      }
    ];

    // Gather timeline of sections
    var sectionTimeline = songState.timelineSections || [songState.activeSectionData];
    var chordEvents = [{ tick: 0, bytes: [0xc0, 0x00] }]; // Acoustic Grand Piano
    var melodyEvents = [{ tick: 0, bytes: [0xc1, 0x04] }]; // Electric Piano / Lead

    var barCursor = 0;
    var prevUpper = null;

    for (var s = 0; s < sectionTimeline.length; s++) {
      var sec = sectionTimeline[s];
      if (!sec || !sec.chords || sec.chords.length === 0) continue;

      for (var c = 0; c < sec.chords.length; c++) {
        var chordObj = Theory.parseChord(sec.chords[c]);
        var voicing = Theory.getVoicingMidi(chordObj, prevUpper, songState.smartVoiceLeading !== false);
        prevUpper = voicing.upper;
        var startTick = (barCursor + c) * ticksPerBar;
        var endTick = startTick + ticksPerBar - 20;

        for (var n = 0; n < voicing.all.length; n++) {
          var midi = Math.max(0, Math.min(127, voicing.all[n]));
          chordEvents.push({ tick: startTick, bytes: [0x90, midi, 82] });
          chordEvents.push({ tick: endTick, bytes: [0x80, midi, 0] });
        }
      }

      if (sec.melodyNotes && sec.melodyNotes.length > 0) {
        var maxSteps = Math.max(4, sec.chords.length) * 4;
        for (var m = 0; m < sec.melodyNotes.length; m++) {
          var nt = sec.melodyNotes[m];
          if (nt.step >= maxSteps) continue;
          var nStart = barCursor * ticksPerBar + nt.step * ppqn;
          var nEnd = nStart + Math.max(1, nt.len || 1) * ppqn - 20;
          var pitch = Math.max(0, Math.min(127, nt.midi));
          var vel = Math.round((nt.vel || 0.8) * 110);
          melodyEvents.push({ tick: nStart, bytes: [0x91, pitch, vel] });
          melodyEvents.push({ tick: nEnd, bytes: [0x81, pitch, 0] });
        }
      }

      barCursor += sec.chords.length;
    }

    var track0 = buildTrackChunk(tempoEvents);
    var track1 = buildTrackChunk(chordEvents);
    var track2 = buildTrackChunk(melodyEvents);

    var header = [];
    pushStringBytes(header, 'MThd');
    pushUint32BE(header, 6);
    pushUint16BE(header, 1); // Format 1
    pushUint16BE(header, 3); // 3 tracks
    pushUint16BE(header, ppqn);

    var out = header.concat(track0, track1, track2);
    return new Uint8Array(out);
  }

  function exportMidiFile(songState) {
    var bytes = buildMidiBytes(songState);
    var blob = new Blob([bytes], { type: 'audio/midi' });
    triggerDownload(blob, slugify(songState.title) + '.mid');
    return bytes;
  }

  // --- OfflineAudioContext WAV Renderer ---
  function encodeWavBuffer(audioBuffer) {
    var numChannels = audioBuffer.numberOfChannels;
    var sampleRate = audioBuffer.sampleRate;
    var length = audioBuffer.length;
    var bytesPerSample = 2;
    var blockAlign = numChannels * bytesPerSample;
    var dataSize = length * blockAlign;
    var buffer = new ArrayBuffer(44 + dataSize);
    var view = new DataView(buffer);

    function writeStr(offset, str) {
      for (var i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    }

    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, dataSize, true);

    var channels = [];
    for (var ch = 0; ch < numChannels; ch++) {
      channels.push(audioBuffer.getChannelData(ch));
    }

    var offset = 44;
    for (var i = 0; i < length; i++) {
      for (var c = 0; c < numChannels; c++) {
        var sample = Math.max(-1, Math.min(1, channels[c][i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
      }
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  function exportWavFile(songState) {
    var OfflineCtx = global.OfflineAudioContext || global.webkitOfflineAudioContext;
    if (!OfflineCtx) {
      return Promise.reject(new Error('OfflineAudioContext not supported in this browser.'));
    }

    var sections = songState.timelineSections || [songState.activeSectionData];
    var totalBars = 0;
    for (var s = 0; s < sections.length; s++) {
      if (sections[s] && sections[s].chords) {
        totalBars += sections[s].chords.length;
      }
    }
    if (totalBars === 0) {
      return Promise.reject(new Error('Add at least one chord before exporting WAV audio.'));
    }

    var bpm = songState.bpm || 100;
    var secPerSixteenth = (60 / bpm) / 4;
    var secPerBar = secPerSixteenth * 16;
    var tailSec = 1.5;
    var totalDuration = totalBars * secPerBar + tailSec;
    var sampleRate = 44100;
    var offline = new OfflineCtx(2, Math.ceil(totalDuration * sampleRate), sampleRate);

    var dry = offline.createGain();
    var wet = offline.createGain();
    var conv = offline.createConvolver();
    conv.buffer = Audio.createReverbIR(offline, 2.0, 2.6);
    var comp = offline.createDynamicsCompressor();
    var master = offline.createGain();
    master.gain.value = 0.85;

    var reverbMix = typeof songState.reverbMix === 'number' ? songState.reverbMix : 0.28;
    dry.gain.value = 1 - reverbMix * 0.4;
    wet.gain.value = reverbMix;

    dry.connect(comp);
    conv.connect(wet);
    wet.connect(comp);
    comp.connect(master);
    master.connect(offline.destination);

    // Schedule chords, melody, and drums onto offline graph
    var barCursor = 0;
    var prevUpper = null;

    for (var i = 0; i < sections.length; i++) {
      var sec = sections[i];
      if (!sec || !sec.chords || sec.chords.length === 0) continue;

      for (var c = 0; c < sec.chords.length; c++) {
        var barTime = 0.05 + (barCursor + c) * secPerBar;
        var chordObj = Theory.parseChord(sec.chords[c]);
        var voicing = Theory.getVoicingMidi(chordObj, prevUpper, songState.smartVoiceLeading !== false);
        prevUpper = voicing.upper;

        Audio.scheduleChordVoices(offline, dry, voicing.all, barTime, secPerBar * 0.94, {
          instrument: songState.instrument,
          playStyle: songState.playStyle
        });

        // Subtle reverb send for chords
        Audio.scheduleChordVoices(offline, conv, voicing.all, barTime, secPerBar * 0.94, {
          instrument: songState.instrument,
          playStyle: songState.playStyle
        });

        for (var st = 0; st < 16; st++) {
          Audio.scheduleDrumStep(offline, dry, songState.groove, st, barTime + st * secPerSixteenth);
        }
      }

      if (sec.melodyNotes && sec.melodyNotes.length > 0) {
        var maxSteps = sec.chords.length * 4;
        for (var m = 0; m < sec.melodyNotes.length; m++) {
          var nt = sec.melodyNotes[m];
          if (nt.step >= maxSteps) continue;
          var nTime = 0.05 + barCursor * secPerBar + nt.step * secPerSixteenth * 4;
          var nDur = (nt.len || 1) * secPerSixteenth * 4 * 0.92;
          Audio.scheduleMelodyNote(offline, dry, nt.midi, nTime, nDur, nt.vel || 0.82);
        }
      }

      barCursor += sec.chords.length;
    }

    return offline.startRendering().then(function (renderedBuffer) {
      var wavBlob = encodeWavBuffer(renderedBuffer);
      triggerDownload(wavBlob, slugify(songState.title) + '.wav');
      return wavBlob;
    });
  }

  // --- Songwriter Lead Sheet Formatter ---
  function renderLeadSheetText(songState) {
    var modeObj = Theory.MODES[songState.modeKey] || Theory.MODES.major;
    var keyName = Theory.getNoteName(songState.tonicPc, Theory.shouldPreferFlats(songState.tonicPc, songState.modeKey));
    var lines = [];
    lines.push('============================================================');
    lines.push('  ' + (songState.title || 'Untitled Song').toUpperCase());
    lines.push('  Key: ' + keyName + ' ' + modeObj.name + '  |  Tempo: ' + (songState.bpm || 100) + ' BPM');
    lines.push('============================================================');
    lines.push('');

    // Gather all chords for capo advisor
    var allChordObjs = [];
    var order = songState.sectionOrder || ['Verse', 'Pre-Chorus', 'Chorus', 'Bridge'];
    for (var s = 0; s < order.length; s++) {
      var sec = songState.sections[order[s]];
      if (!sec || (!sec.chords.length && !sec.lyrics.trim())) continue;

      lines.push('[' + order[s].toUpperCase() + ']');
      if (sec.chords.length > 0) {
        var romans = sec.chords.map(function (sym) {
          var p = Theory.parseChord(sym);
          if (p) allChordObjs.push(p);
          return p ? Theory.getRomanForChord(p.rootPc, p.baseQuality, songState.tonicPc, songState.modeKey) : '?';
        });
        lines.push('Chords : | ' + sec.chords.join(' | ') + ' |');
        lines.push('Roman  : | ' + romans.join(' | ') + ' |');
      } else {
        lines.push('Chords : (none)');
      }

      if (sec.lyrics && sec.lyrics.trim()) {
        lines.push('Lyrics :');
        var lyricLines = sec.lyrics.split(/\r?\n/);
        for (var l = 0; l < lyricLines.length; l++) {
          var lText = lyricLines[l].trim();
          if (!lText) {
            lines.push('');
          } else {
            var syl = estimateLineSyllables(lText);
            lines.push('  ' + lText + '   [' + syl + ' syl]');
          }
        }
      }
      lines.push('');
    }

    if (allChordObjs.length > 0) {
      var capos = Theory.getCapoRecommendations(allChordObjs);
      if (capos.length > 0) {
        lines.push('GUITAR CAPO SUGGESTIONS:');
        for (var c = 0; c < capos.length; c++) {
          lines.push('  • ' + capos[c].label + ': play ' + capos[c].playedChords.join(' - '));
        }
      }
    }

    return lines.join('\n');
  }

  NS.Export = {
    estimateLineSyllables: estimateLineSyllables,
    getEndWordRhymeKey: getEndWordRhymeKey,
    buildMidiBytes: buildMidiBytes,
    exportMidiFile: exportMidiFile,
    exportWavFile: exportWavFile,
    renderLeadSheetText: renderLeadSheetText
  };
})(window);
