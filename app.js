// app.js - LCG logic & analisis (Bahasa Indonesia, offline)
// Uses simple canvas drawing for histogram to avoid external libraries.

function lcg(seed, a, c, m, n) {
  const bigA = BigInt(a);
  const bigC = BigInt(c);
  const bigM = BigInt(m);
  let bx = BigInt(Number(seed) % Number(m));
  const out = [];
  for (let i = 0; i < Number(n); i++) {
    bx = (bigA * bx + bigC) % bigM;
    const v = Number(bx) / Number(bigM);
    out.push(v);
  }
  return out;
}

function histogram(seq, bins) {
  const counts = new Array(bins).fill(0);
  for (const v of seq) {
    let idx = Math.floor(v * bins);
    if (idx === bins) idx = bins - 1;
    counts[idx]++;
  }
  const edges = [];
  for (let i = 0; i <= bins; i++) edges.push(i / bins);
  const labels = [];
  for (let i=0;i<bins;i++){
    labels.push(edges[i].toFixed(3) + '-' + edges[i+1].toFixed(3));
  }
  return {counts, labels};
}

function mean(seq){ return seq.reduce((a,b)=>a+b,0)/seq.length; }
function stddev(seq){ const mu = mean(seq); const v = seq.reduce((a,b)=>a+((b-mu)*(b-mu)),0)/seq.length; return Math.sqrt(v); }

function runsTest(seq){
  const diffs = [];
  for (let i=1;i<seq.length;i++) diffs.push(seq[i]-seq[i-1]);
  const signs = diffs.map(d=>d===0?0:(d>0?1:-1)).filter(s=>s!==0);
  if (signs.length===0) return 0;
  let runs = 1; for (let i=1;i<signs.length;i++) if (signs[i]!==signs[i-1]) runs++;
  return runs;
}

function chiSquare(counts, expected){ let s=0; for (let i=0;i<counts.length;i++){ const diff=counts[i]-expected[i]; s += (diff*diff)/expected[i]; } return s; }

function downloadCSV(seq){
  let csv = "index,value\n";
  seq.forEach((v,i)=>{ csv += `${i},${v.toFixed(12)}\n`; });
  const blob = new Blob([csv], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'lcg_sequence.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

// Simple canvas histogram renderer
function drawHistogramCanvas(canvasId, labels, counts){
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  ctx.scale(dpr, dpr);
  ctx.clearRect(0,0,w,h);
  // background transparent, draw bars
  const maxCount = Math.max(...counts);
  const padding = 24;
  const barGap = 6;
  const barWidth = (w - padding*2 - barGap*(counts.length-1)) / counts.length;
  ctx.fillStyle = 'rgba(78,168,255,0.9)';
  for(let i=0;i<counts.length;i++){
    const x = padding + i*(barWidth+barGap);
    const barH = (counts[i]/maxCount) * (h - padding*2);
    const y = h - padding - barH;
    // rounded rect
    const r = 4;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + barWidth - r, y);
    ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r);
    ctx.lineTo(x + barWidth, y + barH - r);
    ctx.quadraticCurveTo(x + barWidth, y + barH, x + barWidth - r, y + barH);
    ctx.lineTo(x + r, y + barH);
    ctx.quadraticCurveTo(x, y + barH, x, y + barH - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }
  // x labels small
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  for(let i=0;i<labels.length;i+=Math.max(1,Math.floor(labels.length/6))){
    const x = padding + i*(barWidth+barGap) + barWidth/2;
    ctx.fillText(labels[i], x, h - 6);
  }
}

let lastSeq = null;
const form = document.getElementById('form');
const results = document.getElementById('results');
const statsDiv = document.getElementById('stats');
const samplePre = document.getElementById('sample');
const downloadBtn = document.getElementById('download');

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd = new FormData(form);
  const seed = fd.get('seed');
  const a = fd.get('a');
  const c = fd.get('c');
  const m = fd.get('m');
  const n = Number(fd.get('n'));
  const bins = Number(fd.get('bins'));

  try{
    const seq = lcg(seed,a,c,m,n);
    lastSeq = seq;
    const hist = histogram(seq,bins);
    drawHistogramCanvas('histChart', hist.labels, hist.counts);
    const mu = mean(seq); const sd = stddev(seq); const runs = runsTest(seq);
    const expected = new Array(bins).fill(n/bins);
    const chi = chiSquare(hist.counts, expected);
    statsDiv.innerHTML = `
      <p><strong>Jumlah Runs:</strong> ${runs}</p>
      <p><strong>Nilai Chi-Square:</strong> ${chi.toFixed(4)} (p-value tidak dihitung)</p>
      <p><strong>Rata-rata:</strong> ${mu.toFixed(6)}</p>
      <p><strong>Simpangan baku:</strong> ${sd.toFixed(6)}</p>
    `;
    samplePre.textContent = seq.slice(0,20).map(x=>x.toFixed(6)).join(', ');
    results.style.display = 'block';
  }catch(err){ alert('Terjadi kesalahan: '+err.message); }
});

downloadBtn.addEventListener('click', ()=>{
  if(!lastSeq){ alert('Belum ada data, silakan hasilkan dulu.'); return; }
  downloadCSV(lastSeq);
});

// redraw on resize
window.addEventListener('resize', ()=>{
  const canvas = document.getElementById('histChart');
  if(canvas && lastSeq){
    const bins = Number(document.querySelector('input[name=bins]').value);
    const hist = histogram(lastSeq, bins);
    drawHistogramCanvas('histChart', hist.labels, hist.counts);
  }
});
