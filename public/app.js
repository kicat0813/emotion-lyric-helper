const theme = document.getElementById('theme');
const mood = document.getElementById('mood');
const out = document.getElementById('out');
const historyBox = document.getElementById('history');

const genBtn = document.getElementById('gen');
const copyBtn = document.getElementById('copy');
const clearAllBtn = document.getElementById('clearAll');
const toast = document.getElementById('toast');
const modeSel = document.getElementById('mode');
const styleSel = document.getElementById('style');
const lengthSel = document.getElementById('length');


const KEY = 'lyric_history_v2';

function nowText(){
  const d = new Date();
  const pad = (n)=> String(n).padStart(2,'0');
  return `${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function load(){ 
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}
function save(list){
  localStorage.setItem(KEY, JSON.stringify(list));
}

async function generate(){
  const res = await fetch('/api/lyrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      theme: theme.value || '愛情',
      mood: mood.value || '暗戀',
      mode: (document.getElementById('mode')?.value) || 'template',
      style: (document.getElementById('style')?.value) || '抒情',
      length: (document.getElementById('length')?.value) || '標準',
      provider: 'openai'
    })
  });

  const d = await res.json();
  if(!d.ok){
    out.value = `（生成失敗）\n${d.error || '未知錯誤'}`;
    return;
  }
  out.value = d.lyrics || '';
}


function addToHistory(text){
  if(!text.trim()) return;
  const list = load();
  list.unshift({
    time: nowText(),
    theme: theme.value || '愛情',
    mood: mood.value || '暗戀',
    lyrics: text
  });
  save(list.slice(0, 20));
  render();
}

function render(){
  const list = load();
  if(list.length === 0){
    historyBox.innerHTML = `<div class="history-item"><div class="history-meta">目前沒有紀錄。你可以先生成歌詞，然後按「複製歌詞」或再生成一次後系統會自動記錄。</div></div>`;
    return;
  }
  historyBox.innerHTML = '';
  list.forEach((it, idx)=>{
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <div class="history-meta">${it.time}｜主題：${escapeHtml(it.theme)}｜情緒：${escapeHtml(it.mood)}</div>
      <pre class="history-pre">${escapeHtml(it.lyrics)}</pre>
      <div class="small-row">
        <button class="small-btn" data-act="load" data-idx="${idx}">載入</button>
        <button class="small-btn" data-act="copy" data-idx="${idx}">複製</button>
        <button class="small-btn" data-act="del" data-idx="${idx}">刪除</button>
      </div>
    `;
    historyBox.appendChild(div);
  });

  historyBox.querySelectorAll('button[data-act]').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const act = btn.dataset.act;
      const idx = Number(btn.dataset.idx);
      const list = load();
      const it = list[idx];
      if(!it) return;

      if(act === 'load'){
        theme.value = it.theme;
        mood.value = it.mood;
        out.value = it.lyrics;
        window.scrollTo({ top: 0, behavior:'smooth' });
      }
      if(act === 'copy'){
        await navigator.clipboard.writeText(it.lyrics);
        alert('已複製！');
      }
      if(act === 'del'){
        list.splice(idx,1);
        save(list);
        render();
      }
    });
  });
}

function escapeHtml(str){
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;');
}

genBtn.addEventListener('click', async ()=>{
  await generate();
  // 使用者紀錄
  addToHistory(out.value);
  const d = await res.json();
if(!d.ok){
  out.value = `（生成失敗）\\n${d.error || '未知錯誤'}`;
  return;
}
out.value = d.lyrics || '';
});

copyBtn.addEventListener('click', async ()=>{
  if(!out.value.trim()) return;
  await navigator.clipboard.writeText(out.value);
  showToast('已複製歌詞！');
});

render();

function showToast(msg){
  if(!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'), 1400);
}

clearAllBtn.addEventListener('click', ()=>{
  const ok = confirm('確定要清空全部紀錄嗎？此操作無法復原。');
  if(!ok) return;
  localStorage.removeItem(KEY);
  render();
  showToast('已清空全部紀錄');
});
