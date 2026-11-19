(function (global) {
  'use strict';

  var NS = (global.OrbitalFifths = global.OrbitalFifths || {});
  var Theory = NS.Theory;
  var Audio = NS.Audio;

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var CX = 380;
  var CY = 380;

  var RINGS = {
    bezel: { rIn: 342, rOut: 366 },
    major: { rIn: 258, rOut: 336, labelR: 303, romanR: 277 },
    minor: { rIn: 186, rOut: 252, labelR: 225, romanR: 201 },
    dim: { rIn: 126, rOut: 180, labelR: 158, romanR: 138 }
  };

  function degToRad(deg) {
    return (deg * Math.PI) / 180;
  }

  function polar(cx, cy, r, angleDeg) {
    var rad = degToRad(angleDeg);
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    };
  }

  function createAnnularSectorPath(cx, cy, rIn, rOut, startDeg, endDeg) {
    var p1 = polar(cx, cy, rOut, startDeg);
    var p2 = polar(cx, cy, rOut, endDeg);
    var p3 = polar(cx, cy, rIn, endDeg);
    var p4 = polar(cx, cy, rIn, startDeg);
    var largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;

    return [
      'M', p1.x.toFixed(2), p1.y.toFixed(2),
      'A', rOut, rOut, 0, largeArc, 1, p2.x.toFixed(2), p2.y.toFixed(2),
      'L', p3.x.toFixed(2), p3.y.toFixed(2),
      'A', rIn, rIn, 0, largeArc, 0, p4.x.toFixed(2), p4.y.toFixed(2),
      'Z'
    ].join(' ');
  }

  function createArcPath(cx, cy, r, startDeg, endDeg) {
    var p1 = polar(cx, cy, r, startDeg);
    var p2 = polar(cx, cy, r, endDeg);
    var largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    return [
      'M', p1.x.toFixed(2), p1.y.toFixed(2),
      'A', r, r, 0, largeArc, 1, p2.x.toFixed(2), p2.y.toFixed(2)
    ].join(' ');
  }

  function createHarmonicWindowPath(kCenter) {
    var centerDeg = -90 + kCenter * 30;
    var outerStart = centerDeg - 44.7;
    var outerEnd = centerDeg + 44.7;
    var innerStart = centerDeg - 14.7;
    var innerEnd = centerDeg + 14.7;

    var rOuter = 340;
    var rMidStep = 183;
    var rInner = 122;

    var p1 = polar(CX, CY, rOuter, outerStart);
    var p2 = polar(CX, CY, rOuter, outerEnd);
    var p3 = polar(CX, CY, rMidStep, outerEnd);
    var p4 = polar(CX, CY, rMidStep, innerEnd);
    var p5 = polar(CX, CY, rInner, innerEnd);
    var p6 = polar(CX, CY, rInner, innerStart);
    var p7 = polar(CX, CY, rMidStep, innerStart);
    var p8 = polar(CX, CY, rMidStep, outerStart);

    return [
      'M', p1.x.toFixed(2), p1.y.toFixed(2),
      'A', rOuter, rOuter, 0, 0, 1, p2.x.toFixed(2), p2.y.toFixed(2),
      'L', p3.x.toFixed(2), p3.y.toFixed(2),
      'A', rMidStep, rMidStep, 0, 0, 0, p4.x.toFixed(2), p4.y.toFixed(2),
      'L', p5.x.toFixed(2), p5.y.toFixed(2),
      'A', rInner, rInner, 0, 0, 0, p6.x.toFixed(2), p6.y.toFixed(2),
      'L', p7.x.toFixed(2), p7.y.toFixed(2),
      'A', rMidStep, rMidStep, 0, 0, 0, p8.x.toFixed(2), p8.y.toFixed(2),
      'Z'
    ].join(' ');
  }

  function svgEl(tag, attrs, parent) {
    var el = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      for (var k in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, k)) {
          el.setAttribute(k, attrs[k]);
        }
      }
    }
    if (parent) parent.appendChild(el);
    return el;
  }

  function createWheel(container, onWedgeActivate) {
    container.innerHTML = '';

    var svg = svgEl('svg', {
      viewBox: '0 0 760 760',
      class: 'cof-svg',
      role: 'group',
      'aria-label': 'Interactive Circle of Fifths Instrument'
    }, container);

    // Defs for studio glow and radial backdrop
    var defs = svgEl('defs', {}, svg);

    var bgGrad = svgEl('radialGradient', { id: 'cof-hub-grad', cx: '50%', cy: '50%', r: '50%' }, defs);
    svgEl('stop', { offset: '0%', 'stop-color': '#182236' }, bgGrad);
    svgEl('stop', { offset: '75%', 'stop-color': '#0f1624' }, bgGrad);
    svgEl('stop', { offset: '100%', 'stop-color': '#090d16' }, bgGrad);

    var glowFilter = svgEl('filter', { id: 'cof-glow', x: '-20%', y: '-20%', width: '140%', height: '140%' }, defs);
    svgEl('feGaussianBlur', { stdDeviation: '4', result: 'blur' }, glowFilter);
    var merge = svgEl('feMerge', {}, glowFilter);
    svgEl('feMergeNode', { in: 'blur' }, merge);
    svgEl('feMergeNode', { in: 'SourceGraphic' }, merge);

    var arrowMarker = svgEl('marker', {
      id: 'constellation-arrow',
      viewBox: '0 0 10 10',
      refX: '7',
      refY: '5',
      markerWidth: '5',
      markerHeight: '5',
      orient: 'auto-start-reverse'
    }, defs);
    svgEl('path', { d: 'M 0 1 L 10 5 L 0 9 z', fill: '#f5b841' }, arrowMarker);

    // Ambient outer aura ring
    svgEl('circle', {
      cx: CX,
      cy: CY,
      r: 372,
      class: 'cof-outer-aura'
    }, svg);

    // Layer 1: Key signature outer bezel
    var bezelLayer = svgEl('g', { class: 'cof-bezel-layer' }, svg);
    var bezelSlots = [];
    for (var b = 0; b < 12; b++) {
      var bCenter = -90 + b * 30;
      var slot = Theory.WHEEL_SLOTS[b];
      var gB = svgEl('g', { class: 'cof-bezel-slot' }, bezelLayer);
      svgEl('path', {
        d: createAnnularSectorPath(CX, CY, RINGS.bezel.rIn, RINGS.bezel.rOut, bCenter - 14.55, bCenter + 14.55),
        class: 'cof-bezel-arc'
      }, gB);
      var posB = polar(CX, CY, 354, bCenter);
      var txtB = svgEl('text', {
        x: posB.x.toFixed(2),
        y: posB.y.toFixed(2),
        class: 'cof-bezel-text',
        'text-anchor': 'middle',
        'dominant-baseline': 'central'
      }, gB);
      txtB.textContent = slot.keySig;
      bezelSlots.push({ group: gB, text: txtB, index: b });
    }

    // Layer 2: Wedges (Major, Minor, Diminished)
    var wedgesLayer = svgEl('g', { class: 'cof-wedges-layer' }, svg);
    var wedgeRefs = {};

    var ringOrder = [
      { key: 'major', spec: RINGS.major },
      { key: 'minor', spec: RINGS.minor },
      { key: 'dim', spec: RINGS.dim }
    ];

    for (var r = 0; r < ringOrder.length; r++) {
      var ringKey = ringOrder[r].key;
      var spec = ringOrder[r].spec;

      for (var i = 0; i < 12; i++) {
        var centerDeg = -90 + i * 30;
        var halfSpan = 14.55;
        var id = ringKey + '-' + i;

        var g = svgEl('g', {
          class: 'cof-wedge cof-ring-' + ringKey,
          'data-ring': ringKey,
          'data-index': String(i),
          tabindex: '0',
          role: 'button',
          'aria-label': 'Chord wedge'
        }, wedgesLayer);

        var pathEl = svgEl('path', {
          d: createAnnularSectorPath(CX, CY, spec.rIn, spec.rOut, centerDeg - halfSpan, centerDeg + halfSpan),
          class: 'cof-wedge-bg'
        }, g);

        var gravityArc = svgEl('path', {
          d: createArcPath(CX, CY, spec.rOut - 2.5, centerDeg - 13, centerDeg + 13),
          class: 'cof-gravity-arc'
        }, g);

        var lblPos = polar(CX, CY, spec.labelR, centerDeg);
        var labelText = svgEl('text', {
          x: lblPos.x.toFixed(2),
          y: lblPos.y.toFixed(2),
          class: 'cof-chord-label cof-label-' + ringKey,
          'text-anchor': 'middle',
          'dominant-baseline': 'central'
        }, g);

        var romPos = polar(CX, CY, spec.romanR, centerDeg);
        var romanText = svgEl('text', {
          x: romPos.x.toFixed(2),
          y: romPos.y.toFixed(2),
          class: 'cof-roman-label cof-roman-' + ringKey,
          'text-anchor': 'middle',
          'dominant-baseline': 'central'
        }, g);

        // Bind low-latency pointerdown + keyboard accessibility
        (function (rKey, idx, groupEl) {
          groupEl.addEventListener('pointerdown', function (ev) {
            if (ev.button === 2) {
              ev.preventDefault();
              onWedgeActivate(rKey, idx, { auditionOnly: true, event: ev });
              return;
            }
            if (ev.button !== 0) return;
            ev.preventDefault();
            groupEl.classList.add('is-pressed');
            setTimeout(function () {
              groupEl.classList.remove('is-pressed');
            }, 180);
            onWedgeActivate(rKey, idx, { auditionOnly: ev.shiftKey, event: ev });
          });

          groupEl.addEventListener('contextmenu', function (ev) {
            ev.preventDefault();
          });

          groupEl.addEventListener('keydown', function (ev) {
            if (ev.key === 'Enter' || ev.key === ' ') {
              ev.preventDefault();
              groupEl.classList.add('is-pressed');
              setTimeout(function () {
                groupEl.classList.remove('is-pressed');
              }, 180);
              onWedgeActivate(rKey, idx, { auditionOnly: ev.shiftKey, event: ev });
            }
          });
        })(ringKey, i, g);

        wedgeRefs[id] = {
          id: id,
          ring: ringKey,
          index: i,
          group: g,
          path: pathEl,
          gravityArc: gravityArc,
          labelText: labelText,
          romanText: romanText
        };
      }
    }

    // Layer 3: Diatonic Harmonic Window Contour Overlay (non-pointer-blocking)
    var windowLayer = svgEl('g', { class: 'cof-window-layer', 'pointer-events': 'none' }, svg);
    var harmonicWindowPath = svgEl('path', {
      d: createHarmonicWindowPath(0),
      class: 'cof-harmonic-window',
      filter: 'url(#cof-glow)'
    }, windowLayer);

    // Layer 4: Inner Constellation Hub & Readout
    var hubLayer = svgEl('g', { class: 'cof-hub-layer' }, svg);
    svgEl('circle', {
      cx: CX,
      cy: CY,
      r: 118,
      fill: 'url(#cof-hub-grad)',
      class: 'cof-hub-backdrop'
    }, hubLayer);
    svgEl('circle', {
      cx: CX,
      cy: CY,
      r: 104,
      class: 'cof-constellation-orbit'
    }, hubLayer);

    var constellationPathsLayer = svgEl('g', { class: 'cof-constellation-paths', 'pointer-events': 'none' }, hubLayer);
    var orbitalNodesLayer = svgEl('g', { class: 'cof-orbital-nodes', 'pointer-events': 'none' }, hubLayer);

    var orbitalDots = [];
    for (var o = 0; o < 12; o++) {
      var oPos = polar(CX, CY, 104, -90 + o * 30);
      var dot = svgEl('circle', {
        cx: oPos.x.toFixed(2),
        cy: oPos.y.toFixed(2),
        r: '3.2',
        class: 'cof-orbital-dot'
      }, orbitalNodesLayer);
      orbitalDots.push({ el: dot, pos: oPos });
    }

    var hubChordText = svgEl('text', {
      x: CX,
      y: CY - 16,
      class: 'cof-hub-chord',
      'text-anchor': 'middle',
      'dominant-baseline': 'central'
    }, hubLayer);
    hubChordText.textContent = 'Press Chord';

    var hubFunctionText = svgEl('text', {
      x: CX,
      y: CY + 14,
      class: 'cof-hub-function',
      'text-anchor': 'middle',
      'dominant-baseline': 'central'
    }, hubLayer);
    hubFunctionText.textContent = 'Click any ring to hear & build';

    var hubNotesText = svgEl('text', {
      x: CX,
      y: CY + 36,
      class: 'cof-hub-notes',
      'text-anchor': 'middle',
      'dominant-baseline': 'central'
    }, hubLayer);
    hubNotesText.textContent = '';

    var hubKeyText = svgEl('text', {
      x: CX,
      y: CY - 48,
      class: 'cof-hub-key',
      'text-anchor': 'middle',
      'dominant-baseline': 'central'
    }, hubLayer);
    hubKeyText.textContent = 'KEY OF C MAJOR';

    function update(state) {
      var analysis = state.wheelAnalysis;
      var progressionChords = state.progressionChords || [];
      var activeChordObj = state.activeChordObj;
      var playingChordIdx = typeof state.playingChordIdx === 'number' ? state.playingChordIdx : -1;
      var nextSuggestions = state.nextSuggestions || [];
      var extMode = state.extMode || 'triad';

      // Update key bezel active tonic marker
      var tonicIdx = Theory.getWheelIndexForPc(analysis.tonicPc);
      for (var b = 0; b < bezelSlots.length; b++) {
        bezelSlots[b].group.classList.toggle('is-key-center', b === analysis.kCenter);
        bezelSlots[b].group.classList.toggle('is-tonic-slot', b === tonicIdx);
      }

      // Update harmonic window contour
      harmonicWindowPath.setAttribute('d', createHarmonicWindowPath(analysis.kCenter));

      // Map active chord & playing chord to wedge IDs
      var selectedWedge = activeChordObj ? Theory.findWedgeForChord(activeChordObj) : null;
      var selectedId = selectedWedge ? (selectedWedge.ring + '-' + selectedWedge.index) : null;

      var playingWedge = (playingChordIdx >= 0 && progressionChords[playingChordIdx])
        ? Theory.findWedgeForChord(progressionChords[playingChordIdx])
        : null;
      var playingId = playingWedge ? (playingWedge.ring + '-' + playingWedge.index) : null;

      // Map progression memberships
      var progWedgeMap = {};
      for (var p = 0; p < progressionChords.length; p++) {
        var pw = Theory.findWedgeForChord(progressionChords[p]);
        if (pw) {
          progWedgeMap[pw.ring + '-' + pw.index] = true;
        }
      }

      // Map top 3 next-chord suggestions
      var suggestionMap = {};
      for (var s = 0; s < Math.min(3, nextSuggestions.length); s++) {
        var sug = nextSuggestions[s];
        var sw = Theory.findWedgeForChord({ rootPc: sug.rootPc, baseQuality: sug.baseQuality });
        if (sw) {
          suggestionMap[sw.ring + '-' + sw.index] = s + 1;
        }
      }

      // Update all 36 wedges
      for (var w = 0; w < analysis.wedges.length; w++) {
        var wInfo = analysis.wedges[w];
        var ref = wedgeRefs[wInfo.id];
        if (!ref) continue;

        var displaySymbol = wInfo.symbol;
        if (extMode !== 'triad') {
          var extChord = Theory.applyExtension(wInfo.rootPc, wInfo.baseQuality, extMode, analysis);
          if (extChord) displaySymbol = extChord.normalizedSymbol;
        }

        ref.labelText.textContent = displaySymbol;
        ref.romanText.textContent = wInfo.roman;
        ref.group.setAttribute('aria-label', displaySymbol + ' (' + wInfo.roman + ', ' + wInfo.harmonicFunction + ')');

        ref.group.classList.toggle('is-diatonic', wInfo.isDiatonic);
        ref.group.classList.toggle('is-non-diatonic', !wInfo.isDiatonic);
        ref.group.classList.toggle('func-tonic', wInfo.harmonicFunction === 'tonic');
        ref.group.classList.toggle('func-subdominant', wInfo.harmonicFunction === 'subdominant');
        ref.group.classList.toggle('func-dominant', wInfo.harmonicFunction === 'dominant');
        ref.group.classList.toggle('func-borrowed', wInfo.harmonicFunction === 'borrowed');
        ref.group.classList.toggle('func-secondary', wInfo.harmonicFunction === 'secondary');
        ref.group.classList.toggle('is-in-progression', Boolean(progWedgeMap[wInfo.id]));
        ref.group.classList.toggle('is-selected', selectedId === wInfo.id);
        ref.group.classList.toggle('is-playing', playingId === wInfo.id);

        var sugRank = suggestionMap[wInfo.id] || 0;
        ref.group.classList.toggle('is-suggested', sugRank > 0);
        ref.group.classList.toggle('is-suggested-top', sugRank === 1);
      }

      // Update inner constellation lines
      constellationPathsLayer.innerHTML = '';
      for (var o = 0; o < orbitalDots.length; o++) {
        orbitalDots[o].el.classList.remove('is-active');
      }

      var nodePoints = [];
      for (var c = 0; c < progressionChords.length; c++) {
        var cw = Theory.findWedgeForChord(progressionChords[c]);
        if (cw) {
          var radOffset = cw.ring === 'major' ? 104 : cw.ring === 'minor' ? 94 : 84;
          var pt = polar(CX, CY, radOffset, -90 + cw.index * 30);
          nodePoints.push({ pt: pt, slotIdx: cw.index, step: c + 1 });
          orbitalDots[cw.index].el.classList.add('is-active');
        }
      }

      for (var k = 0; k < nodePoints.length - 1; k++) {
        var a = nodePoints[k].pt;
        var bPt = nodePoints[k + 1].pt;
        // Pull curve subtly toward center for clean constellation arcs
        var midX = (a.x + bPt.x) / 2;
        var midY = (a.y + bPt.y) / 2;
        var ctrlX = midX + (CX - midX) * 0.42;
        var ctrlY = midY + (CY - midY) * 0.42;
        var dAttr = 'M ' + a.x.toFixed(1) + ' ' + a.y.toFixed(1) +
          ' Q ' + ctrlX.toFixed(1) + ' ' + ctrlY.toFixed(1) +
          ' ' + bPt.x.toFixed(1) + ' ' + bPt.y.toFixed(1);

        var isSegPlaying = playingChordIdx === k || playingChordIdx === k + 1;
        svgEl('path', {
          d: dAttr,
          class: 'cof-constellation-arc' + (isSegPlaying ? ' is-playing' : ''),
          'marker-end': 'url(#constellation-arrow)'
        }, constellationPathsLayer);
      }

      // Center Hub readout
      var modeObj = Theory.MODES[analysis.modeKey] || Theory.MODES.major;
      hubKeyText.textContent = 'KEY: ' + analysis.tonicName.toUpperCase() + ' ' + modeObj.shortName.toUpperCase();

      if (activeChordObj) {
        var activeWedge = Theory.findWedgeForChord(activeChordObj);
        var activeInfo = null;
        if (activeWedge) {
          for (var aw = 0; aw < analysis.wedges.length; aw++) {
            if (analysis.wedges[aw].id === activeWedge.ring + '-' + activeWedge.index) {
              activeInfo = analysis.wedges[aw];
              break;
            }
          }
        }
        var romanStr = activeInfo ? activeInfo.roman : Theory.getRomanForChord(activeChordObj.rootPc, activeChordObj.baseQuality, analysis.tonicPc, analysis.modeKey);
        var funcLabel = activeInfo ? activeInfo.harmonicFunction : 'chromatic';
        var prettyFunc = funcLabel.charAt(0).toUpperCase() + funcLabel.slice(1);

        hubChordText.textContent = activeChordObj.symbol;
        hubFunctionText.textContent = romanStr + ' • ' + prettyFunc;
        hubNotesText.textContent = activeChordObj.noteNames.join('  •  ');
      } else {
        hubChordText.textContent = analysis.tonicName + (analysis.modeKey === 'minor' ? 'm' : '');
        hubFunctionText.textContent = 'Tap any chord to hear';
        hubNotesText.textContent = 'Build combos to match hits';
      }
    }

    return {
      update: update
    };
  }

  function initVisualizer(canvas) {
    if (!canvas) return function () {};
    var ctx2d = canvas.getContext('2d');
    var animId = null;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      var dpr = global.devicePixelRatio || 1;
      var w = Math.max(120, Math.floor(rect.width * dpr));
      var h = Math.max(28, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    function draw() {
      resize();
      var w = canvas.width;
      var h = canvas.height;
      var dpr = global.devicePixelRatio || 1;
      ctx2d.clearRect(0, 0, w, h);

      var data = Audio.getAnalyserData();
      var barCount = 28;
      var gap = 2 * dpr;
      var barWidth = (w - gap * (barCount - 1)) / barCount;

      if (data && data.freqData) {
        for (var i = 0; i < barCount; i++) {
          // Focus on musical lower-mid frequency bins
          var binIdx = Math.floor((i / barCount) * 44) + 1;
          var val = data.freqData[binIdx] / 255;
          var barH = Math.max(2 * dpr, val * (h - 4 * dpr));
          var x = i * (barWidth + gap);
          var y = h - barH;

          var grad = ctx2d.createLinearGradient(0, y, 0, h);
          grad.addColorStop(0, '#f5b841');
          grad.addColorStop(0.55, '#38bdf8');
          grad.addColorStop(1, 'rgba(56, 189, 248, 0.2)');
          ctx2d.fillStyle = grad;
          ctx2d.fillRect(x, y, Math.max(1, barWidth), barH);
        }

        // Subtle waveform overlay
        ctx2d.beginPath();
        ctx2d.strokeStyle = 'rgba(245, 184, 65, 0.48)';
        ctx2d.lineWidth = 1.25 * dpr;
        var slice = w / 64;
        for (var t = 0; t < 64; t++) {
          var sample = data.timeData[t * 16] / 128.0 - 1.0;
          var wy = h * 0.5 + sample * (h * 0.42);
          if (t === 0) ctx2d.moveTo(0, wy);
          else ctx2d.lineTo(t * slice, wy);
        }
        ctx2d.stroke();
      } else {
        // Resting subtle idle baseline
        ctx2d.fillStyle = 'rgba(148, 163, 184, 0.25)';
        for (var j = 0; j < barCount; j++) {
          var rx = j * (barWidth + gap);
          ctx2d.fillRect(rx, h - 2 * dpr, Math.max(1, barWidth), 2 * dpr);
        }
      }

      animId = global.requestAnimationFrame(draw);
    }

    animId = global.requestAnimationFrame(draw);
    return function stop() {
      if (animId) global.cancelAnimationFrame(animId);
    };
  }

  NS.Wheel = {
    createWheel: createWheel,
    initVisualizer: initVisualizer
  };
})(window);
