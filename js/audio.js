(function (global) {
  'use strict';

  var NS = (global.OrbitalFifths = global.OrbitalFifths || {});

  var ctx = null;
  var masterGain = null;
  var compressor = null;
  var dryGain = null;
  var wetGain = null;
  var reverbNode = null;
  var analyser = null;
  var noiseBuffer = null;

  var freqData = null;
  var timeData = null;

  var activeSingleChordVoices = [];

  var transport = {
    isPlaying: false,
    bpm: 100,
    timerId: null,
    nextStepTime: 0,
    currentStep: 0,
    planGetter: null,
    onStepCallback: null,
    onStopCallback: null,
    uiTimers: []
  };

  var settings = {
    instrument: 'feltPiano',
    playStyle: 'strum',
    groove: 'pop',
    reverbMix: 0.28,
    volume: 0.85
  };

  var tapTimestamps = [];

  function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function createNoiseBuffer(audioCtx) {
    var length = Math.floor(audioCtx.sampleRate * 1.0);
    var buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  function createReverbIR(audioCtx, durationSec, decayRate) {
    durationSec = durationSec || 2.0;
    decayRate = decayRate || 2.6;
    var length = Math.floor(audioCtx.sampleRate * durationSec);
    var impulse = audioCtx.createBuffer(2, length, audioCtx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var channelData = impulse.getChannelData(ch);
      for (var i = 0; i < length; i++) {
        var t = i / length;
        // Velvet-like sparse noise decay for warm studio room
        var env = Math.pow(1 - t, decayRate);
        var rand = Math.random() * 2 - 1;
        // Soft initial pre-delay shape
        var attack = i < 400 ? i / 400 : 1;
        channelData[i] = rand * env * attack * 0.55;
      }
    }
    return impulse;
  }

  function ensureContext() {
    if (!ctx) {
      var AudioCtx = global.AudioContext || global.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();

      dryGain = ctx.createGain();
      wetGain = ctx.createGain();
      reverbNode = ctx.createConvolver();
      reverbNode.buffer = createReverbIR(ctx, 2.0, 2.6);

      compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -14;
      compressor.knee.value = 18;
      compressor.ratio.value = 3.5;
      compressor.attack.value = 0.005;
      compressor.release.value = 0.18;

      masterGain = ctx.createGain();
      masterGain.gain.value = settings.volume;

      analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.82;

      freqData = new Uint8Array(analyser.frequencyBinCount);
      timeData = new Uint8Array(analyser.fftSize);

      dryGain.gain.value = 1 - settings.reverbMix * 0.45;
      wetGain.gain.value = settings.reverbMix;

      dryGain.connect(compressor);
      reverbNode.connect(wetGain);
      wetGain.connect(compressor);
      compressor.connect(masterGain);
      masterGain.connect(analyser);
      analyser.connect(ctx.destination);

      noiseBuffer = createNoiseBuffer(ctx);
    }

    if (ctx.state === 'suspended') {
      ctx.resume().catch(function () {});
    }
    return ctx;
  }

  function getRoutingNodes(targetCtx, customDest) {
    if (!customDest && targetCtx === ctx) {
      return {
        dry: dryGain,
        wet: reverbNode,
        noise: noiseBuffer
      };
    }
    return {
      dry: customDest,
      wet: customDest,
      noise: createNoiseBuffer(targetCtx)
    };
  }

  function releaseActiveSingleVoices(now) {
    if (!ctx || activeSingleChordVoices.length === 0) return;
    for (var i = 0; i < activeSingleChordVoices.length; i++) {
      var v = activeSingleChordVoices[i];
      try {
        v.gain.gain.cancelScheduledValues(now);
        v.gain.gain.setValueAtTime(Math.max(0.0001, v.gain.gain.value), now);
        v.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);
        for (var j = 0; j < v.stops.length; j++) {
          v.stops[j].stop(now + 0.08);
        }
      } catch (e) {
        // Ignore already stopped oscillators
      }
    }
    activeSingleChordVoices = [];
  }

  function scheduleSingleNoteVoice(audioCtx, nodes, midi, startTime, duration, instrument, vel, trackVoiceList) {
    var freq = midiToFreq(midi);
    var voiceGain = audioCtx.createGain();
    var stops = [];

    voiceGain.connect(nodes.dry);
    if (nodes.wet && nodes.wet !== nodes.dry) {
      var sendGain = audioCtx.createGain();
      sendGain.gain.value = 0.55;
      voiceGain.connect(sendGain);
      sendGain.connect(nodes.wet);
    }

    var safeVel = Math.max(0.05, Math.min(1.0, vel || 0.7));

    if (instrument === 'rhodes') {
      var osc1 = audioCtx.createOscillator();
      var osc2 = audioCtx.createOscillator();
      var mod = audioCtx.createOscillator();
      var modGain = audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, startTime);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq, startTime);

      mod.type = 'sine';
      mod.frequency.setValueAtTime(freq * 7, startTime);
      modGain.gain.setValueAtTime(freq * 1.45 * safeVel, startTime);
      modGain.gain.exponentialRampToValueAtTime(0.5, startTime + 0.22);

      mod.connect(modGain);
      modGain.connect(osc1.frequency);

      var g1 = audioCtx.createGain();
      g1.gain.value = 0.75;
      var g2 = audioCtx.createGain();
      g2.gain.value = 0.18;

      osc1.connect(g1);
      osc2.connect(g2);
      g1.connect(voiceGain);
      g2.connect(voiceGain);

      voiceGain.gain.setValueAtTime(0.0001, startTime);
      voiceGain.gain.linearRampToValueAtTime(0.21 * safeVel, startTime + 0.008);
      voiceGain.gain.exponentialRampToValueAtTime(0.06 * safeVel, startTime + Math.min(duration, 0.7));
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.32);

      osc1.start(startTime);
      osc2.start(startTime);
      mod.start(startTime);
      osc1.stop(startTime + duration + 0.36);
      osc2.stop(startTime + duration + 0.36);
      mod.stop(startTime + duration + 0.36);
      stops.push(osc1, osc2, mod);
    } else if (instrument === 'guitar') {
      var filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(5500, freq * 8.5), startTime);
      filter.frequency.exponentialRampToValueAtTime(Math.max(360, freq * 2.1), startTime + Math.min(duration, 0.9));
      filter.Q.value = 1.4;

      var gOsc1 = audioCtx.createOscillator();
      var gOsc2 = audioCtx.createOscillator();
      gOsc1.type = 'sawtooth';
      gOsc1.frequency.setValueAtTime(freq, startTime);
      gOsc2.type = 'triangle';
      gOsc2.frequency.setValueAtTime(freq * 1.0015, startTime);

      var mix1 = audioCtx.createGain();
      mix1.gain.value = 0.35;
      var mix2 = audioCtx.createGain();
      mix2.gain.value = 0.65;

      gOsc1.connect(mix1);
      gOsc2.connect(mix2);
      mix1.connect(filter);
      mix2.connect(filter);
      filter.connect(voiceGain);

      voiceGain.gain.setValueAtTime(0.0001, startTime);
      voiceGain.gain.linearRampToValueAtTime(0.22 * safeVel, startTime + 0.006);
      voiceGain.gain.exponentialRampToValueAtTime(0.045 * safeVel, startTime + Math.min(duration, 0.65));
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.25);

      gOsc1.start(startTime);
      gOsc2.start(startTime);
      gOsc1.stop(startTime + duration + 0.28);
      gOsc2.stop(startTime + duration + 0.28);
      stops.push(gOsc1, gOsc2);
    } else if (instrument === 'synthPad') {
      var padFilter = audioCtx.createBiquadFilter();
      padFilter.type = 'lowpass';
      padFilter.frequency.setValueAtTime(1450, startTime);
      padFilter.frequency.linearRampToValueAtTime(1900, startTime + duration * 0.45);
      padFilter.frequency.exponentialRampToValueAtTime(750, startTime + duration + 0.3);

      var detunes = [-8, 0, 8];
      for (var d = 0; d < detunes.length; d++) {
        var pOsc = audioCtx.createOscillator();
        pOsc.type = d === 1 ? 'triangle' : 'sawtooth';
        pOsc.frequency.setValueAtTime(freq, startTime);
        pOsc.detune.setValueAtTime(detunes[d], startTime);
        var pGain = audioCtx.createGain();
        pGain.gain.value = d === 1 ? 0.38 : 0.22;
        pOsc.connect(pGain);
        pGain.connect(padFilter);
        pOsc.start(startTime);
        pOsc.stop(startTime + duration + 0.45);
        stops.push(pOsc);
      }
      padFilter.connect(voiceGain);

      voiceGain.gain.setValueAtTime(0.0001, startTime);
      voiceGain.gain.linearRampToValueAtTime(0.16 * safeVel, startTime + 0.095);
      voiceGain.gain.setValueAtTime(0.14 * safeVel, startTime + Math.max(0.12, duration * 0.8));
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.42);
    } else {
      // feltPiano (default): warm fundamental + triangle + soft 2nd harmonic + felt hammer transient
      var lp = audioCtx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(2600, startTime);
      lp.frequency.exponentialRampToValueAtTime(680, startTime + Math.min(duration + 0.2, 1.3));
      lp.Q.value = 0.7;

      var f1 = audioCtx.createOscillator();
      var f2 = audioCtx.createOscillator();
      var f3 = audioCtx.createOscillator();

      f1.type = 'sine';
      f1.frequency.setValueAtTime(freq, startTime);
      f2.type = 'triangle';
      f2.frequency.setValueAtTime(freq, startTime);
      f3.type = 'sine';
      f3.frequency.setValueAtTime(freq * 2, startTime);

      var fg1 = audioCtx.createGain(); fg1.gain.value = 0.62;
      var fg2 = audioCtx.createGain(); fg2.gain.value = 0.36;
      var fg3 = audioCtx.createGain(); fg3.gain.value = 0.09;

      f1.connect(fg1); fg1.connect(lp);
      f2.connect(fg2); fg2.connect(lp);
      f3.connect(fg3); fg3.connect(lp);

      // Soft felt hammer transient
      if (nodes.noise) {
        var clickSrc = audioCtx.createBufferSource();
        clickSrc.buffer = nodes.noise;
        var bp = audioCtx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(Math.min(1800, freq * 2.2), startTime);
        bp.Q.value = 2.0;
        var clickGain = audioCtx.createGain();
        clickGain.gain.setValueAtTime(0.045 * safeVel, startTime);
        clickGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.022);
        clickSrc.connect(bp);
        bp.connect(clickGain);
        clickGain.connect(voiceGain);
        clickSrc.start(startTime);
        clickSrc.stop(startTime + 0.03);
      }

      lp.connect(voiceGain);

      voiceGain.gain.setValueAtTime(0.0001, startTime);
      voiceGain.gain.linearRampToValueAtTime(0.24 * safeVel, startTime + 0.011);
      voiceGain.gain.exponentialRampToValueAtTime(0.08 * safeVel, startTime + Math.min(duration * 0.85, 0.9));
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.35);

      f1.start(startTime);
      f2.start(startTime);
      f3.start(startTime);
      f1.stop(startTime + duration + 0.38);
      f2.stop(startTime + duration + 0.38);
      f3.stop(startTime + duration + 0.38);
      stops.push(f1, f2, f3);
    }

    if (trackVoiceList) {
      trackVoiceList.push({ gain: voiceGain, stops: stops });
    }
  }

  function scheduleChordVoices(audioCtx, destNode, midiNotes, startTime, duration, options) {
    if (!audioCtx || !midiNotes || midiNotes.length === 0) return;
    options = options || {};
    var instrument = options.instrument || settings.instrument;
    var playStyle = options.playStyle || settings.playStyle;
    var nodes = getRoutingNodes(audioCtx, destNode);
    var trackList = options.trackSingleVoices ? activeSingleChordVoices : null;

    var sorted = midiNotes.slice().sort(function (a, b) { return a - b; });
    var n = sorted.length;

    // Velocity scaling prevents polyphonic clipping
    var baseVel = Math.min(0.85, 1.05 / Math.sqrt(Math.max(2, n)));

    if (playStyle === 'arp') {
      var stepDelay = Math.min(0.095, (duration * 0.6) / Math.max(1, n));
      for (var i = 0; i < n; i++) {
        var noteStart = startTime + i * stepDelay;
        var remDur = Math.max(0.25, duration - i * stepDelay);
        scheduleSingleNoteVoice(audioCtx, nodes, sorted[i], noteStart, remDur, instrument, baseVel * (i === 0 ? 1.05 : 0.9), trackList);
      }
    } else if (playStyle === 'strum' || instrument === 'guitar') {
      var stagger = instrument === 'guitar' ? 0.022 : 0.024;
      for (var s = 0; s < n; s++) {
        var st = startTime + s * stagger;
        var dur = Math.max(0.25, duration - s * stagger);
        scheduleSingleNoteVoice(audioCtx, nodes, sorted[s], st, dur, instrument, baseVel * (s === 0 ? 1.05 : 0.92), trackList);
      }
    } else {
      for (var b = 0; b < n; b++) {
        scheduleSingleNoteVoice(audioCtx, nodes, sorted[b], startTime, duration, instrument, baseVel * (b === 0 ? 1.05 : 0.92), trackList);
      }
    }
  }

  function scheduleMelodyNote(audioCtx, destNode, midiNote, startTime, duration, velocity) {
    if (!audioCtx || typeof midiNote !== 'number') return;
    var nodes = getRoutingNodes(audioCtx, destNode);
    var freq = midiToFreq(midiNote);
    var vel = Math.max(0.1, Math.min(1.0, velocity || 0.8));

    var osc1 = audioCtx.createOscillator();
    var osc2 = audioCtx.createOscillator();
    var lfo = audioCtx.createOscillator();
    var lfoGain = audioCtx.createGain();
    var filter = audioCtx.createBiquadFilter();
    var vGain = audioCtx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, startTime);

    // Subtle expressive vibrato entering after 180ms
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(5.2, startTime);
    lfoGain.gain.setValueAtTime(0, startTime);
    lfoGain.gain.linearRampToValueAtTime(freq * 0.0045, startTime + 0.25);
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3400, startTime);
    filter.frequency.exponentialRampToValueAtTime(1400, startTime + Math.max(0.12, duration));

    var g1 = audioCtx.createGain(); g1.gain.value = 0.78;
    var g2 = audioCtx.createGain(); g2.gain.value = 0.16;

    osc1.connect(g1); g1.connect(filter);
    osc2.connect(g2); g2.connect(filter);
    filter.connect(vGain);

    vGain.connect(nodes.dry);
    if (nodes.wet && nodes.wet !== nodes.dry) {
      var mWet = audioCtx.createGain();
      mWet.gain.value = 0.65;
      vGain.connect(mWet);
      mWet.connect(nodes.wet);
    }

    vGain.gain.setValueAtTime(0.0001, startTime);
    vGain.gain.linearRampToValueAtTime(0.24 * vel, startTime + 0.012);
    vGain.gain.exponentialRampToValueAtTime(0.13 * vel, startTime + Math.max(0.05, duration * 0.75));
    vGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.14);

    osc1.start(startTime);
    osc2.start(startTime);
    lfo.start(startTime);
    osc1.stop(startTime + duration + 0.16);
    osc2.stop(startTime + duration + 0.16);
    lfo.stop(startTime + duration + 0.16);
  }

  function scheduleDrumHit(audioCtx, destNode, type, time, gainScale) {
    var nodes = getRoutingNodes(audioCtx, destNode);
    var scale = gainScale || 1.0;

    if (type === 'clickHi' || type === 'clickLo') {
      var cOsc = audioCtx.createOscillator();
      var cGain = audioCtx.createGain();
      cOsc.type = 'sine';
      cOsc.frequency.setValueAtTime(type === 'clickHi' ? 1400 : 920, time);
      cGain.gain.setValueAtTime(0.16 * scale, time);
      cGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.035);
      cOsc.connect(cGain);
      cGain.connect(nodes.dry);
      cOsc.start(time);
      cOsc.stop(time + 0.04);
      return;
    }

    if (type === 'kick') {
      var kOsc = audioCtx.createOscillator();
      var kGain = audioCtx.createGain();
      kOsc.type = 'sine';
      kOsc.frequency.setValueAtTime(135, time);
      kOsc.frequency.exponentialRampToValueAtTime(46, time + 0.11);
      kGain.gain.setValueAtTime(0.45 * scale, time);
      kGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);
      kOsc.connect(kGain);
      kGain.connect(nodes.dry);
      kOsc.start(time);
      kOsc.stop(time + 0.24);
      return;
    }

    if (type === 'snare' || type === 'rim') {
      if (nodes.noise) {
        var nSrc = audioCtx.createBufferSource();
        nSrc.buffer = nodes.noise;
        var bp = audioCtx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(type === 'rim' ? 1700 : 2100, time);
        bp.Q.value = type === 'rim' ? 2.6 : 1.0;
        var nGain = audioCtx.createGain();
        nGain.gain.setValueAtTime((type === 'rim' ? 0.15 : 0.22) * scale, time);
        nGain.gain.exponentialRampToValueAtTime(0.0001, time + (type === 'rim' ? 0.065 : 0.14));
        nSrc.connect(bp);
        bp.connect(nGain);
        nGain.connect(nodes.dry);
        nSrc.start(time);
        nSrc.stop(time + 0.16);
      }
      var sOsc = audioCtx.createOscillator();
      var sGain = audioCtx.createGain();
      sOsc.type = 'triangle';
      sOsc.frequency.setValueAtTime(type === 'rim' ? 420 : 185, time);
      sOsc.frequency.exponentialRampToValueAtTime(110, time + 0.06);
      sGain.gain.setValueAtTime((type === 'rim' ? 0.11 : 0.16) * scale, time);
      sGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);
      sOsc.connect(sGain);
      sGain.connect(nodes.dry);
      sOsc.start(time);
      sOsc.stop(time + 0.09);
      return;
    }

    if (type === 'hat') {
      if (!nodes.noise) return;
      var hSrc = audioCtx.createBufferSource();
      hSrc.buffer = nodes.noise;
      var hp = audioCtx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(6800, time);
      var hGain = audioCtx.createGain();
      hGain.gain.setValueAtTime(0.09 * scale, time);
      hGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);
      hSrc.connect(hp);
      hp.connect(hGain);
      hGain.connect(nodes.dry);
      hSrc.start(time);
      hSrc.stop(time + 0.05);
    }
  }

  function scheduleDrumStep(audioCtx, destNode, groove, stepInBar, time) {
    if (!groove || groove === 'off') return;
    if (groove === 'click') {
      if (stepInBar === 0) scheduleDrumHit(audioCtx, destNode, 'clickHi', time, 1.0);
      else if (stepInBar % 4 === 0) scheduleDrumHit(audioCtx, destNode, 'clickLo', time, 0.85);
      return;
    }
    if (groove === 'pop') {
      if (stepInBar === 0 || stepInBar === 6 || stepInBar === 8 || stepInBar === 10) {
        scheduleDrumHit(audioCtx, destNode, 'kick', time, stepInBar === 0 ? 1.0 : 0.8);
      }
      if (stepInBar === 4 || stepInBar === 12) {
        scheduleDrumHit(audioCtx, destNode, 'snare', time, 0.95);
      }
      if (stepInBar % 2 === 0) {
        scheduleDrumHit(audioCtx, destNode, 'hat', time, stepInBar % 4 === 0 ? 0.95 : 0.55);
      }
      return;
    }
    if (groove === 'lofi') {
      var swingOffset = stepInBar % 2 === 1 ? 0.015 : 0;
      var t = time + swingOffset;
      if (stepInBar === 0 || stepInBar === 7 || stepInBar === 10) {
        scheduleDrumHit(audioCtx, destNode, 'kick', t, 0.9);
      }
      if (stepInBar === 4 || stepInBar === 12) {
        scheduleDrumHit(audioCtx, destNode, 'rim', t, 0.95);
      }
      if (stepInBar % 2 === 0 || stepInBar === 15) {
        scheduleDrumHit(audioCtx, destNode, 'hat', t, 0.45);
      }
      return;
    }
    if (groove === 'indie') {
      if (stepInBar === 0 || stepInBar === 8 || stepInBar === 14) {
        scheduleDrumHit(audioCtx, destNode, 'kick', time, 0.95);
      }
      if (stepInBar === 4 || stepInBar === 12) {
        scheduleDrumHit(audioCtx, destNode, 'snare', time, 0.9);
      }
      if (stepInBar % 2 === 0) {
        scheduleDrumHit(audioCtx, destNode, 'hat', time, stepInBar % 4 === 0 ? 1.0 : 0.72);
      }
      return;
    }
    if (groove === 'ballad') {
      if (stepInBar === 0 || stepInBar === 10) {
        scheduleDrumHit(audioCtx, destNode, 'kick', time, 0.78);
      }
      if (stepInBar === 8) {
        scheduleDrumHit(audioCtx, destNode, 'rim', time, 0.75);
      }
      if (stepInBar % 4 === 0) {
        scheduleDrumHit(audioCtx, destNode, 'hat', time, 0.4);
      }
    }
  }

  function playChord(midiNotes, options) {
    var audioCtx = ensureContext();
    if (!audioCtx) return;
    options = options || {};
    var now = audioCtx.currentTime;
    releaseActiveSingleVoices(now);
    scheduleChordVoices(audioCtx, null, midiNotes, now + 0.01, options.duration || 1.35, {
      instrument: options.instrument || settings.instrument,
      playStyle: options.playStyle || settings.playStyle,
      trackSingleVoices: true
    });
  }

  function playMelodyNote(midiNote, duration) {
    var audioCtx = ensureContext();
    if (!audioCtx) return;
    scheduleMelodyNote(audioCtx, null, midiNote, audioCtx.currentTime + 0.005, duration || 0.42, 0.85);
  }

  function clearUiTimers() {
    for (var i = 0; i < transport.uiTimers.length; i++) {
      clearTimeout(transport.uiTimers[i]);
    }
    transport.uiTimers = [];
  }

  function schedulerTick() {
    if (!transport.isPlaying || !ctx) return;
    var plan = transport.planGetter ? transport.planGetter() : null;
    if (!plan || !plan.chords || plan.chords.length === 0) {
      stopLoop();
      return;
    }

    var totalChords = plan.chords.length;
    var stepsPerBar = 16;
    var totalSteps = totalChords * stepsPerBar;
    var secPerSixteenth = (60 / transport.bpm) / 4;
    var lookaheadSec = 0.11;

    while (transport.nextStepTime < ctx.currentTime + lookaheadSec) {
      var stepIndex = transport.currentStep % totalSteps;
      var chordIdx = Math.floor(stepIndex / stepsPerBar);
      var stepInBar = stepIndex % stepsPerBar;
      var stepTime = transport.nextStepTime;

      // Schedule chord at start of bar
      if (stepInBar === 0) {
        var barDur = secPerSixteenth * stepsPerBar * 0.94;
        var chordVoicing = plan.chords[chordIdx];
        if (chordVoicing && chordVoicing.length > 0) {
          scheduleChordVoices(ctx, null, chordVoicing, stepTime, barDur, {
            instrument: settings.instrument,
            playStyle: settings.playStyle,
            trackSingleVoices: false
          });
        }
      }

      // Schedule backing drums
      scheduleDrumStep(ctx, null, settings.groove, stepInBar, stepTime);

      // Schedule melody notes (melody steps are 4 per bar -> trigger when stepInBar % 4 === 0)
      if (stepInBar % 4 === 0 && plan.melodyNotes && plan.melodyNotes.length > 0) {
        var melStep = chordIdx * 4 + Math.floor(stepInBar / 4);
        for (var m = 0; m < plan.melodyNotes.length; m++) {
          var note = plan.melodyNotes[m];
          if (note.step === melStep) {
            var noteDur = (note.len || 1) * secPerSixteenth * 4 * 0.92;
            scheduleMelodyNote(ctx, null, note.midi, stepTime, noteDur, note.vel || 0.82);
          }
        }
      }

      // Schedule visual callback tightly aligned to stepTime
      (function (sIdx, cIdx, sInBar, sTime) {
        var delayMs = Math.max(0, (sTime - ctx.currentTime) * 1000);
        var tid = setTimeout(function () {
          if (transport.isPlaying && transport.onStepCallback) {
            transport.onStepCallback(sIdx, cIdx, sInBar);
          }
        }, delayMs);
        transport.uiTimers.push(tid);
        if (transport.uiTimers.length > 64) {
          transport.uiTimers.shift();
        }
      })(stepIndex, chordIdx, stepInBar, stepTime);

      transport.nextStepTime += secPerSixteenth;
      transport.currentStep = (transport.currentStep + 1) % totalSteps;
    }
  }

  function playLoop(planGetter, onStepCallback, onStopCallback, overrideBpm) {
    var audioCtx = ensureContext();
    if (!audioCtx) return false;

    stopLoop(true);

    if (typeof overrideBpm === 'number' && overrideBpm >= 40 && overrideBpm <= 220) {
      transport.bpm = overrideBpm;
    }
    transport.planGetter = planGetter;
    transport.onStepCallback = onStepCallback;
    transport.onStopCallback = onStopCallback;
    transport.isPlaying = true;
    transport.currentStep = 0;
    transport.nextStepTime = audioCtx.currentTime + 0.04;

    schedulerTick();
    transport.timerId = setInterval(schedulerTick, 25);
    return true;
  }

  function stopLoop(silent) {
    transport.isPlaying = false;
    if (transport.timerId) {
      clearInterval(transport.timerId);
      transport.timerId = null;
    }
    clearUiTimers();
    if (ctx) {
      releaseActiveSingleVoices(ctx.currentTime);
    }
    if (!silent && transport.onStopCallback) {
      transport.onStopCallback();
    }
  }

  function setBpm(bpm) {
    var val = Math.max(45, Math.min(200, Math.round(Number(bpm) || 100)));
    transport.bpm = val;
    return val;
  }

  function getBpm() {
    return transport.bpm;
  }

  function tapTempo() {
    var now = performance.now();
    if (tapTimestamps.length > 0 && now - tapTimestamps[tapTimestamps.length - 1] > 2000) {
      tapTimestamps = [];
    }
    tapTimestamps.push(now);
    if (tapTimestamps.length > 5) tapTimestamps.shift();
    if (tapTimestamps.length < 2) return null;

    var sum = 0;
    for (var i = 1; i < tapTimestamps.length; i++) {
      sum += tapTimestamps[i] - tapTimestamps[i - 1];
    }
    var avgMs = sum / (tapTimestamps.length - 1);
    var bpm = Math.max(45, Math.min(200, Math.round(60000 / avgMs)));
    transport.bpm = bpm;
    return bpm;
  }

  function setSettings(partial) {
    if (!partial) return;
    if (partial.instrument) settings.instrument = partial.instrument;
    if (partial.playStyle) settings.playStyle = partial.playStyle;
    if (partial.groove) settings.groove = partial.groove;
    if (typeof partial.reverbMix === 'number') {
      settings.reverbMix = Math.max(0, Math.min(1, partial.reverbMix));
      if (wetGain && dryGain && ctx) {
        wetGain.gain.setTargetAtTime(settings.reverbMix, ctx.currentTime, 0.03);
        dryGain.gain.setTargetAtTime(1 - settings.reverbMix * 0.4, ctx.currentTime, 0.03);
      }
    }
    if (typeof partial.volume === 'number') {
      settings.volume = Math.max(0, Math.min(1, partial.volume));
      if (masterGain && ctx) {
        masterGain.gain.setTargetAtTime(settings.volume, ctx.currentTime, 0.03);
      }
    }
  }

  function getSettings() {
    return Object.assign({}, settings);
  }

  function isPlaying() {
    return transport.isPlaying;
  }

  function getAnalyserData() {
    if (!analyser || !freqData || !timeData) {
      return null;
    }
    analyser.getByteFrequencyData(freqData);
    analyser.getByteTimeDomainData(timeData);
    return {
      freqData: freqData,
      timeData: timeData
    };
  }

  NS.Audio = {
    ensureContext: ensureContext,
    midiToFreq: midiToFreq,
    createReverbIR: createReverbIR,
    scheduleChordVoices: scheduleChordVoices,
    scheduleMelodyNote: scheduleMelodyNote,
    scheduleDrumStep: scheduleDrumStep,
    playChord: playChord,
    playMelodyNote: playMelodyNote,
    playLoop: playLoop,
    stopLoop: stopLoop,
    setBpm: setBpm,
    getBpm: getBpm,
    tapTempo: tapTempo,
    setSettings: setSettings,
    getSettings: getSettings,
    isPlaying: isPlaying,
    getAnalyserData: getAnalyserData
  };
})(window);
