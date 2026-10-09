// ---- Precision BPM + key analysis engine (pure JS, no dependencies) ----
// Works in a Web Worker or Node. Entry point: analyze(samples, sr, progress)

function fftInPlace(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      let t = re[i]; re[i] = re[j]; re[j] = t;
      t = im[i]; im[i] = im[j]; im[j] = t;
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    const half = len >> 1;
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < half; k++) {
        const a = i + k, b = a + half;
        const xr = re[b] * cr - im[b] * ci;
        const xi = re[b] * ci + im[b] * cr;
        re[b] = re[a] - xr; im[b] = im[a] - xi;
        re[a] += xr; im[a] += xi;
        const ncr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr; cr = ncr;
      }
    }
  }
}

function hann(n) {
  const w = new Float32Array(n);
  for (let i = 0; i < n; i++) w[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / n);
  return w;
}

// ---------- Onset strength envelope (log spectral flux) ----------
function onsetEnvelope(x, sr, hop, N, progress) {
  const win = hann(N);
  const frames = Math.max(0, Math.floor((x.length - N) / hop) + 1);
  const env = new Float32Array(frames);
  const low = new Float32Array(frames);
  const body = new Float32Array(frames);
  const lowBin = Math.max(2, Math.round(160 / sr * N));
  const bodyBin = Math.max(lowBin + 1, Math.round(1500 / sr * N));
  let prevLin = new Float32Array(N / 2), curLin = new Float32Array(N / 2);
  const re = new Float64Array(N), im = new Float64Array(N);
  const half = N / 2;
  let prev = new Float32Array(half), cur = new Float32Array(half);
  const maxBin = Math.min(half, Math.floor(11000 / sr * N));
  for (let f = 0; f < frames; f++) {
    const off = f * hop;
    for (let i = 0; i < N; i++) { re[i] = x[off + i] * win[i]; im[i] = 0; }
    fftInPlace(re, im);
    let flux = 0, lf = 0, bf = 0;
    for (let k = 1; k < maxBin; k++) {
      const mag = Math.hypot(re[k], im[k]);
      const m = Math.log1p(1000 * mag);
      cur[k] = m;
      const d = m - prev[k];
      if (d > 0 && f > 0) { flux += d; if (k <= lowBin) lf += d; }
      if (k <= bodyBin) { curLin[k] = mag; const dl = mag - prevLin[k]; if (dl > 0 && f > 0) bf += dl; }
    }
    env[f] = flux; low[f] = lf; body[f] = bf;
    const t = prev; prev = cur; cur = t;
    const tl = prevLin; prevLin = curLin; curLin = tl;
    if (progress && (f & 2047) === 0) progress(0.05 + 0.45 * f / frames);
  }
  return { env, low, body };
}

// ---------- Global tempo estimate (weighted autocorrelation) ----------
function autocorr(o, top) {
  const n = o.length, ac = new Float64Array(top + 2);
  for (let lag = 1; lag <= top + 1; lag++) {
    let s = 0;
    for (let i = 0; i + lag < n; i++) s += o[i] * o[i + lag];
    ac[lag] = s / Math.max(1, n - lag);
  }
  return ac;
}

// Tempo is chosen in two steps:
// 1. Find the strongest pulse in the full-band onsets (a beat period also lines up at 2x, 3x and 4x its length).
// 2. Choose between half and double speed of that pulse. A faster level is only accepted when the in-between
//    beats carry drum "body" (kick and snare, below ~2.5 kHz) about as strongly as the beats themselves, so
//    off-beat hi-hats can't double the tempo, while a rock backbeat (kick and snare alternating) can.
function estimatePeriod(o, fps, body) {
  const minLag = Math.floor(fps * 60 / 215), maxLag = Math.ceil(fps * 60 / 50);
  const top = 4 * maxLag + 2;
  const acFull = autocorr(o, top);
  const acB = body ? autocorr(body, top) : acFull;
  // Each envelope is scaled to its own average periodicity so they can be compared.
  const norm = arr => { let sum = 0, cnt = 0; for (let l = minLag; l <= maxLag; l++) { sum += Math.max(0, arr[l]); cnt++; } const m = Math.max(1e-9, sum / cnt); return Float64Array.from(arr, v => Math.max(0, v) / m); };
  const nFull = norm(acFull), nBody = body ? norm(acB) : nFull;
  const ac = nFull;
  const at = (arr, l) => { const i = Math.floor(l), f = l - i; return i + 1 < arr.length ? arr[i] * (1 - f) + arr[i + 1] * f : 0; };
  const comb1 = (arr, l) => (at(arr, l) + at(arr, 2 * l) + at(arr, 3 * l) + at(arr, 4 * l)) / 4;
  // a real beat has to show up both in the full sound and in the drum weight (kick, snare, bass)
  const comb = l => Math.sqrt(comb1(nFull, l) * comb1(nBody, l));
  const refine = lag => { const a = ac[lag - 1], b = ac[lag], c = ac[lag + 1], den = a - 2 * b + c; return lag + (den !== 0 ? Math.max(-0.5, Math.min(0.5, 0.5 * (a - c) / den)) : 0); };
  let best = null;
  for (let lag = minLag; lag <= maxLag; lag++) {
    if (!(ac[lag] >= ac[lag - 1] && ac[lag] >= ac[lag + 1])) continue;
    const L = refine(lag), bpm = 60 * fps / L;
    const w = Math.exp(-0.5 * Math.pow(Math.log2(bpm / 120) / 1.2, 2));
    const v = comb(L) * w;
    if (!best || v > best.v) best = { L, v };
  }
  if (!best) return fps * 0.5;
  // all half/double levels of the winning pulse inside 55-215 BPM, slowest first
  const inRange = L => { const bpm = 60 * fps / L; return bpm >= 55 && bpm <= 215; };
  let L = best.L;
  while (inRange(L * 2)) L *= 2;
  while (!inRange(L) && L / 2 >= minLag) L /= 2;
  // closeness to a typical tempo (120 BPM), used only to break half/double ties
  const typical = l => Math.abs(Math.log2(60 * fps / l / 120));
  while (inRange(L / 2)) {
    const bodyRatio = at(nBody, L / 2) / Math.max(1e-9, at(nBody, L));
    const fullRatio = at(nFull, L / 2) / Math.max(1e-9, at(nFull, L));
    // faster level wins if the drums themselves play it (rock, punk, drum & bass), or if the
    // hats/percussion drive it and it is the more typical tempo (trap is written at 140, not 70)
    if (bodyRatio >= 0.62 || (fullRatio >= 0.62 && typical(L / 2) < typical(L))) L /= 2; else break;
  }
  return L;
}

// ---------- Dynamic-programming beat tracker (Ellis 2007) ----------
function trackBeats(o, period, tightness = 100) {
  const n = o.length;
  const p = period;
  const wlen = Math.round(p);
  const kernel = [];
  for (let i = -wlen; i <= wlen; i++) kernel.push(Math.exp(-0.5 * Math.pow(i * 32 / p, 2)));
  const local = new Float64Array(n);
  for (let t = 0; t < n; t++) {
    let s = 0;
    for (let j = 0; j < kernel.length; j++) {
      const idx = t + j - wlen;
      if (idx >= 0 && idx < n) s += o[idx] * kernel[j];
    }
    local[t] = s;
  }
  const cum = new Float64Array(n), back = new Int32Array(n).fill(-1);
  const lo = Math.round(2 * p), hi = Math.max(1, Math.round(p / 2));
  const txw = [];
  for (let d = hi; d <= lo; d++) txw[d] = -tightness * Math.pow(Math.log(d / p), 2);
  for (let t = 0; t < n; t++) {
    let best = -Infinity, bi = -1;
    for (let d = hi; d <= lo; d++) {
      const s = t - d;
      if (s < 0) break;
      const v = cum[s] + txw[d];
      if (v > best) { best = v; bi = s; }
    }
    cum[t] = local[t] + (bi >= 0 ? best : 0);
    back[t] = bi;
  }
  // last beat: last local max of cum that is reasonably strong
  const maxes = [];
  for (let t = 1; t < n - 1; t++) if (cum[t] > cum[t - 1] && cum[t] >= cum[t + 1]) maxes.push(cum[t]);
  const sorted = maxes.slice().sort((a, b) => a - b);
  const med = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
  let last = n - 1;
  for (let t = n - 2; t > 0; t--) {
    if (cum[t] > cum[t - 1] && cum[t] >= cum[t + 1] && cum[t] * 2 > med) { last = t; break; }
  }
  const beats = [];
  for (let t = last; t >= 0; t = back[t]) beats.push(t);
  beats.reverse();
  return { beats, local };
}

// ---------- Least-squares line fit ----------
function linfit(k, t, w) {
  let sw = 0, sk = 0, st = 0;
  for (let i = 0; i < k.length; i++) { sw += w[i]; sk += w[i] * k[i]; st += w[i] * t[i]; }
  const km = sk / sw, tm = st / sw;
  let skk = 0, skt = 0;
  for (let i = 0; i < k.length; i++) { const dk = k[i] - km; skk += w[i] * dk * dk; skt += w[i] * dk * (t[i] - tm); }
  const slope = skt / skk;
  return { slope, intercept: tm - slope * km };
}

function median(arr) {
  const s = Array.from(arr).sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
}

// ---------- Precision tempo ----------
function precisionTempo(x, sr, progress) {
  const hop = 256, N = 1024;
  const fps = sr / hop;
  const { env: raw, low, body: rawBody } = onsetEnvelope(x, sr, hop, N, progress);
  // normalized envelope for tracking: remove slow trend, scale
  const n = raw.length;
  const o = new Float32Array(n);
  const half = Math.round(fps * 0.5);
  let acc = 0, cnt = 0;
  const pre = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) pre[i + 1] = pre[i] + raw[i];
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, i - half), b = Math.min(n, i + half + 1);
    o[i] = Math.max(0, raw[i] - (pre[b] - pre[a]) / (b - a));
    acc += o[i] * o[i]; cnt++;
  }
  let rawMax = 0; for (let i = 0; i < n; i++) if (raw[i] > rawMax) rawMax = raw[i];
  if (rawMax < 1e-3 || n < fps * 4) return null;
  const sd = Math.sqrt(acc / Math.max(1, cnt)) || 1;
  for (let i = 0; i < n; i++) o[i] /= sd;
  if (progress) progress(0.55);

  const bodyN = new Float32Array(n);
  {
    const pb = new Float64Array(n + 1);
    for (let i = 0; i < n; i++) pb[i + 1] = pb[i] + rawBody[i];
    let accB = 0;
    for (let i = 0; i < n; i++) {
      const a = Math.max(0, i - half), b = Math.min(n, i + half + 1);
      bodyN[i] = Math.max(0, rawBody[i] - (pb[b] - pb[a]) / (b - a));
      accB += bodyN[i] * bodyN[i];
    }
    const sdB = Math.sqrt(accB / Math.max(1, n)) || 1;
    for (let i = 0; i < n; i++) bodyN[i] /= sdB;
  }
  const p0 = estimatePeriod(o, fps, bodyN);
  const { beats } = trackBeats(o, p0);
  if (progress) progress(0.65);

  // refine each beat to the nearest raw onset peak with sub-frame interpolation
  const rad = Math.max(2, Math.round(p0 * 0.15));
  const times = [], weights = [];
  for (const b of beats) {
    let bi = b, bv = -Infinity;
    for (let i = Math.max(1, b - rad); i <= Math.min(n - 2, b + rad); i++) if (o[i] > bv) { bv = o[i]; bi = i; }
    if (bi < 1 || bi > n - 2) continue;
    const a = o[bi - 1], c = o[bi + 1], v = o[bi];
    const den = a - 2 * v + c;
    const sh = den !== 0 ? Math.max(-0.5, Math.min(0.5, 0.5 * (a - c) / den)) : 0;
    times.push(((bi + sh) * hop + N / 2) / sr);
    weights.push(Math.max(0.05, v));
  }
  if (times.length < 8) return null;

  // assign integer beat indices incrementally (robust to small period error), robust fit, repeat
  let P = p0 / fps, t0 = times[0];
  let keep = times.map(() => true);
  let ks = [];
  const assign = () => {
    ks = new Array(times.length);
    ks[0] = 0;
    for (let i = 1; i < times.length; i++) ks[i] = ks[i - 1] + Math.max(0, Math.round((times[i] - times[i - 1]) / P));
  };
  for (let iter = 0; iter < 6; iter++) {
    assign();
    const byK = new Map();
    for (let i = 0; i < times.length; i++) {
      if (!keep[i]) continue;
      const prev = byK.get(ks[i]);
      if (prev === undefined || weights[i] > weights[prev]) byK.set(ks[i], i);
    }
    const idx = Array.from(byK.values());
    if (idx.length < 8) break;
    const fit = linfit(idx.map(i => ks[i]), idx.map(i => times[i]), idx.map(i => weights[i]));
    P = fit.slope; t0 = fit.intercept;
    const res = times.map((t, i) => t - (t0 + P * ks[i]));
    const mad = median(idx.map(i => Math.abs(res[i]))) * 1.4826;
    const thr = Math.max(3 * mad, 0.004);
    keep = res.map(r => Math.abs(r) <= thr);
  }
  // final stats
  const used = [];
  const seen = new Set();
  const order = times.map((_, i) => i).sort((a, b) => weights[b] - weights[a]);
  for (const i of order) {
    const k = ks[i];
    if (keep[i] && !seen.has(k)) { seen.add(k); used.push({ k, t: times[i], w: weights[i] }); }
  }
  used.sort((a, b) => a.k - b.k);
  const nU = used.length;
  const km = used.reduce((s, u) => s + u.k, 0) / nU;
  let skk = 0, ss = 0;
  const resid = used.map(u => u.t - (t0 + P * u.k));
  for (let i = 0; i < nU; i++) { skk += (used[i].k - km) ** 2; ss += resid[i] ** 2; }
  const sigma = Math.sqrt(ss / Math.max(1, nU - 2));
  const seP = sigma / Math.sqrt(skk);
  const bpm = 60 / P;
  const seBpm = 60 / (P * P) * seP;

  // local tempo over windows of 32 beats, hop 16
  const local = [];
  for (let s = 0; s + 16 <= nU; s += 16) {
    const seg = used.slice(s, s + 32);
    if (seg.length < 12) continue;
    const span = seg[seg.length - 1].k - seg[0].k;
    if (span < 12) continue;
    const f = linfit(seg.map(u => u.k), seg.map(u => u.t), seg.map(() => 1));
    local.push({ time: seg[Math.floor(seg.length / 2)].t, bpm: 60 / f.slope });
  }
  const lb = local.map(l => l.bpm);
  const lsd = lb.length > 1 ? Math.sqrt(lb.reduce((s, v) => s + (v - bpm) ** 2, 0) / lb.length) : 0;
  const coverage = nU / Math.max(1, (used[nU - 1].k - used[0].k + 1));
  const variable = lsd > 0.25 || sigma > 0.012;
  const beatStrength = used.reduce((a, u) => a + u.w, 0) / nU;

  // phase: does the low end (kick) sit on the grid or halfway between?
  const lowAt = t => { const fr = (t * sr - N / 2) / hop; let m = 0; for (let i = Math.round(fr) - 3; i <= Math.round(fr) + 3; i++) if (i >= 0 && i < n && low[i] > m) m = low[i]; return m; };
  const offs = [0, 0.25, 0.5, 0.75];
  const energy = offs.map(o => used.reduce((acc, u) => acc + lowAt(t0 + P * (u.k + o)), 0));
  let bestO = 0;
  for (let j = 1; j < 4; j++) if (energy[j] > energy[bestO]) bestO = j;
  const shiftFrac = energy[bestO] > energy[0] * 1.3 ? offs[bestO] : 0;
  let gridOffset = t0;
  if (shiftFrac) {
    const rs = [];
    for (const u of used) {
      const fr = ((t0 + P * (u.k + shiftFrac)) * sr - N / 2) / hop;
      let bi = -1, bv = 0;
      for (let i = Math.round(fr) - 6; i <= Math.round(fr) + 6; i++) if (i > 0 && i < n - 1 && low[i] > bv) { bv = low[i]; bi = i; }
      if (bi > 0) rs.push((bi * hop + N / 2) / sr - P * (u.k + shiftFrac));
    }
    gridOffset = (rs.length ? median(rs) : t0) + P * shiftFrac;
  }
  // express offset as the first grid beat at or after 0 s
  gridOffset = ((gridOffset % P) + P) % P;
  if (progress) progress(0.75);
  return {
    bpm, seBpm, period: P, gridOffset, phaseShifted: shiftFrac, beatsUsed: nU, beatsFound: times.length,
    jitterMs: sigma * 1000, beatStrength, local, localSd: lsd, variable, coverage,
    firstBeat: used[0].t, lastBeat: used[nU - 1].t
  };
}

// ---------- Key detection ----------
const KK_MAJ = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const KK_MIN = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
const TP_MAJ = [5, 2, 3.5, 2, 4.5, 4, 2, 4.5, 2, 3.5, 1.5, 4];
const TP_MIN = [5, 2, 3.5, 4.5, 2, 4, 2, 4.5, 3.5, 2, 1.5, 4];
const MAJ_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const MIN_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'B♭', 'B'];

function pearson(a, b) {
  const n = a.length;
  let ma = 0, mb = 0;
  for (let i = 0; i < n; i++) { ma += a[i]; mb += b[i]; }
  ma /= n; mb /= n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) { const x = a[i] - ma, y = b[i] - mb; num += x * y; da += x * x; db += y * y; }
  return num / Math.sqrt(da * db || 1);
}

function keyScores(chroma) {
  const out = [];
  for (let mode = 0; mode < 2; mode++) {
    const p1 = mode === 0 ? KK_MAJ : KK_MIN, p2 = mode === 0 ? TP_MAJ : TP_MIN;
    for (let tonic = 0; tonic < 12; tonic++) {
      const r1 = [], r2 = [];
      for (let i = 0; i < 12; i++) { r1.push(p1[(i - tonic + 12) % 12]); r2.push(p2[(i - tonic + 12) % 12]); }
      out.push({ tonic, mode: mode === 0 ? 'major' : 'minor', score: 0.5 * (pearson(chroma, r1) + pearson(chroma, r2)) });
    }
  }
  return out.sort((a, b) => b.score - a.score);
}

function chromaFrames(x, sr, progress) {
  const N = sr > 30000 ? 16384 : 8192;
  const hop = N / 2;
  const win = hann(N);
  const re = new Float64Array(N), im = new Float64Array(N);
  const frames = Math.max(0, Math.floor((x.length - N) / hop) + 1);
  const fmin = 440 * Math.pow(2, (40 - 69) / 12), fmax = 440 * Math.pow(2, (95 - 69) / 12);
  const kmin = Math.floor(fmin * N / sr), kmax = Math.ceil(fmax * N / sr);
  const allPeaks = [];
  const rms = new Float32Array(frames);
  let tunS = 0, tunC = 0;
  for (let f = 0; f < frames; f++) {
    const off = f * hop;
    let e = 0;
    for (let i = 0; i < N; i++) { const v = x[off + i]; e += v * v; re[i] = v * win[i]; im[i] = 0; }
    rms[f] = Math.sqrt(e / N);
    fftInPlace(re, im);
    const mag = new Float32Array(kmax + 2);
    let mx = 0;
    for (let k = kmin - 1; k <= kmax + 1; k++) { mag[k] = Math.hypot(re[k], im[k]); if (mag[k] > mx) mx = mag[k]; }
    const peaks = [];
    if (mx > 0) {
      for (let k = kmin; k <= kmax; k++) {
        const v = mag[k];
        if (v > mag[k - 1] && v >= mag[k + 1] && v > mx * 0.02) {
          const a = Math.log(mag[k - 1] + 1e-12), b = Math.log(v), c = Math.log(mag[k + 1] + 1e-12);
          const den = a - 2 * b + c;
          const sh = den !== 0 ? 0.5 * (a - c) / den : 0;
          const freq = (k + sh) * sr / N;
          const midi = 69 + 12 * Math.log2(freq / 440);
          const w = Math.sqrt(v);
          peaks.push([midi, w]);
          const dev = midi - Math.round(midi);
          tunS += w * Math.sin(2 * Math.PI * dev); tunC += w * Math.cos(2 * Math.PI * dev);
        }
      }
    }
    allPeaks.push(peaks);
    if (progress && (f & 63) === 0) progress(0.75 + 0.2 * f / frames);
  }
  const tuning = Math.atan2(tunS, tunC) / (2 * Math.PI); // semitones
  const medR = median(rms) || 1e-9;
  const chroma = [];
  for (let f = 0; f < frames; f++) {
    const c = new Float64Array(12);
    let sum = 0;
    for (const [midi, w] of allPeaks[f]) {
      const m = midi - tuning;
      const r = Math.round(m), dev = m - r;
      const g = w * Math.pow(Math.cos(Math.PI * dev), 2);
      // gentle bass emphasis
      const bw = m < 55 ? 1.5 : 1;
      c[((r % 12) + 12) % 12] += g * bw; sum += g * bw;
    }
    if (sum > 0) { const sc = Math.min(1, rms[f] / medR) / sum; for (let i = 0; i < 12; i++) c[i] *= sc; }
    chroma.push({ time: (f * hop + N / 2) / sr, c });
  }
  return { chroma, tuning };
}

function openKey(tonic, mode) {
  // Open Key: 1d = C major, 1m = A minor; numbers step by fifths
  const rel = mode === 'major' ? tonic : (tonic + 3) % 12; // relative major tonic
  const num = ((rel * 7) % 12) + 1;
  return num + (mode === 'major' ? 'd' : 'm');
}

function keyName(k) {
  return (k.mode === 'major' ? MAJ_NAMES[k.tonic] : MIN_NAMES[k.tonic]) + ' ' + k.mode;
}

function relativeOf(k) {
  return k.mode === 'major'
    ? { tonic: (k.tonic + 9) % 12, mode: 'minor' }
    : { tonic: (k.tonic + 3) % 12, mode: 'major' };
}

function detectKey(x, sr, progress) {
  const { chroma, tuning } = chromaFrames(x, sr, progress);
  const total = new Float64Array(12);
  for (const fr of chroma) for (let i = 0; i < 12; i++) total[i] += fr.c[i];
  if (total.reduce((a, b) => a + b, 0) <= 0) return null;
  const ranked = keyScores(Array.from(total));
  const best = ranked[0];
  // ignore the relative key when judging margin (they share notes by design)
  const rel = relativeOf(best);
  const rival = ranked.find(r => !(r.tonic === best.tonic && r.mode === best.mode) && !(r.tonic === rel.tonic && r.mode === rel.mode));
  const margin = best.score - rival.score;
  const relScore = ranked.find(r => r.tonic === rel.tonic && r.mode === rel.mode).score;
  const confidence = margin > 0.12 ? 'Strong' : margin > 0.05 ? 'Moderate' : 'Ambiguous';

  // segment keys (~30 s) to spot key changes
  const segs = [];
  const segLen = 30;
  if (chroma.length) {
    const dur = chroma[chroma.length - 1].time;
    for (let s = 0; s < dur; s += segLen) {
      const acc = new Float64Array(12);
      let n = 0;
      for (const fr of chroma) if (fr.time >= s && fr.time < s + segLen) { for (let i = 0; i < 12; i++) acc[i] += fr.c[i]; n++; }
      if (n < 20) continue;
      const k = keyScores(Array.from(acc))[0];
      segs.push({ start: s, tonic: k.tonic, mode: k.mode, name: keyName(k) });
    }
  }
  const agree = segs.filter(s => (s.tonic === best.tonic && s.mode === best.mode) || (s.tonic === rel.tonic && s.mode === rel.mode)).length;
  const keyChange = segs.length >= 3 && agree / segs.length < 0.6;

  const mx = Math.max(...total) || 1;
  return {
    key: { tonic: best.tonic, mode: best.mode, name: keyName(best), openKey: openKey(best.tonic, best.mode), score: best.score },
    relative: { ...rel, name: keyName(rel), openKey: openKey(rel.tonic, rel.mode), score: relScore },
    alternatives: ranked.slice(1, 4).map(r => ({ name: keyName(r), openKey: openKey(r.tonic, r.mode), score: r.score })),
    confidence, margin, tuningCents: tuning * 100,
    chroma: Array.from(total).map(v => v / mx), segments: segs, keyChange
  };
}

function analyze(x, sr, progress) {
  if (progress) progress(0.02);
  const tempo = precisionTempo(x, sr, progress);
  const key = detectKey(x, sr, progress);
  if (progress) progress(1);
  return { duration: x.length / sr, sampleRate: sr, tempo, key };
}

if (typeof module !== 'undefined') module.exports = { analyze, openKey, keyName };

// ---------- Beat health: peak, clipping, loudness (BS.1770 LUFS), dynamics, mono compatibility ----------
// K-weighting filters (BS.1770), re-derived for any sample rate
function biquadCoefs(type, fc, Q, G, fs) {
  const K = Math.tan(Math.PI * fc / fs);
  const a0 = 1 + K / Q + K * K;
  const a1 = 2 * (K * K - 1) / a0, a2 = (1 - K / Q + K * K) / a0;
  if (type === 'shelf') {
    const Vh = Math.pow(10, G / 20), Vb = Math.pow(Vh, 0.4996667741545416);
    return [(Vh + Vb * K / Q + K * K) / a0, 2 * (K * K - Vh) / a0, (Vh - Vb * K / Q + K * K) / a0, a1, a2];
  }
  return [1, -2, 1, a1, a2];
}

function kWeightedSquares(x, sr) {
  const s1 = biquadCoefs('shelf', 1681.9744509555319, 0.7071752369554193, 3.99984385397, sr);
  const s2 = biquadCoefs('hp', 38.13547087613982, 0.5003270373253953, 0, sr);
  const out = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0, u1 = 0, u2 = 0, z1 = 0, z2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = x[i];
    const y = s1[0] * v + s1[1] * x1 + s1[2] * x2 - s1[3] * y1 - s1[4] * y2;
    x2 = x1; x1 = v; y2 = y1; y1 = y;
    const z = s2[0] * y + s2[1] * u1 + s2[2] * u2 - s2[3] * z1 - s2[4] * z2;
    u2 = u1; u1 = y; z2 = z1; z1 = z;
    out[i] = z * z;
  }
  return out;
}

function integratedLufs(chans, sr) {
  const sq = chans.map(c => kWeightedSquares(c, sr));
  const n = chans[0].length, blk = Math.round(0.4 * sr), step = Math.round(0.1 * sr);
  if (n < blk) return -Infinity;
  const pre = sq.map(s => { const p = new Float64Array(n + 1); for (let i = 0; i < n; i++) p[i + 1] = p[i] + s[i]; return p; });
  const energies = [];
  for (let s = 0; s + blk <= n; s += step) {
    let e = 0;
    for (const p of pre) e += (p[s + blk] - p[s]) / blk;
    energies.push(e);
  }
  const L = e => -0.691 + 10 * Math.log10(e);
  const abs = energies.filter(e => L(e) > -70);
  if (!abs.length) return -Infinity;
  const relThr = L(abs.reduce((a, b) => a + b, 0) / abs.length) - 10;
  const gated = abs.filter(e => L(e) > relThr);
  return L(gated.reduce((a, b) => a + b, 0) / gated.length);
}

function beatHealth(chans, sr) {
  let peak = 0, clips = 0;
  for (const c of chans) {
    let run = 0, chClips = 0;
    for (let i = 0; i < c.length; i++) {
      const a = Math.abs(c[i]);
      if (a > peak) peak = a;
      if (a >= 0.9999) { run++; if (run === 3) chClips++; } else run = 0;
    }
    clips = Math.max(clips, chClips);
  }
  const peakDb = peak > 0 ? 20 * Math.log10(peak) : -Infinity;
  const lufs = integratedLufs(chans, sr);
  let corr = 1, monoLossDb = 0;
  if (chans.length >= 2) {
    const L = chans[0], R = chans[1];
    let lr = 0, ll = 0, rr = 0;
    for (let i = 0; i < L.length; i++) { lr += L[i] * R[i]; ll += L[i] * L[i]; rr += R[i] * R[i]; }
    corr = ll > 0 && rr > 0 ? lr / Math.sqrt(ll * rr) : 1;
    const monoE = (ll + rr + 2 * lr) / 4, stE = (ll + rr) / 2;
    monoLossDb = stE > 0 && monoE > 0 ? 10 * Math.log10(monoE / stE) : (stE > 0 ? -60 : 0);
  }
  return { peakDb, clips, lufs, plr: peakDb - lufs, corr, monoLossDb, stereo: chans.length >= 2 };
}

if (typeof module !== 'undefined') module.exports.beatHealth = beatHealth;
