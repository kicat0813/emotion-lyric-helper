const KEY = "lyric_history_v3";

function $(id) {
  return document.getElementById(id);
}

function setOut(el, text) {
  if (!el) return;
  if ("value" in el) el.value = text;
  else el.textContent = text;
}

function getOut(el) {
  if (!el) return "";
  return "value" in el ? (el.value || "") : (el.textContent || "");
}

function nowText() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function showToast(toastEl, msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 1400);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function maybe(p = 0.4) {
  return Math.random() < p;
}

function sampleUnique(arr, n) {
  const copy = [...arr];
  const out = [];
  while (copy.length && out.length < n) {
    const i = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(i, 1)[0]);
  }
  return out;
}

function generateLyrics(theme, mood) {
  const moodBank = {
    
    暗戀: {
      palette: ["偷看", "不敢說", "藏起來", "靠近又退後", "心跳太吵"],
      places: ["走廊轉角", "便利商店", "訊息框", "下雨的站牌", "自習室的窗邊"],
      objects: ["雨傘", "耳機", "紙杯", "便條紙", "手機螢幕"],
      verbs: ["收進", "放在", "寫下", "擦掉", "按住"],
    },
    熱戀: {
      palette: ["靠近", "抱緊", "發燙", "想念有回音", "笑得太真"],
      places: ["夜市人潮", "回家的路", "床邊", "紅綠燈前", "你的肩上"],
      objects: ["指尖", "外套", "熱可可", "合照", "門口的燈"],
      verbs: ["抱住", "帶走", "點亮", "交給", "留給"],
    },
    平淡: {
      palette: ["日常", "慢慢", "剛剛好", "安靜也溫柔", "不必證明"],
      places: ["餐桌", "廚房", "陽台", "沙發", "下班的巷口"],
      objects: ["水杯", "毛毯", "鑰匙", "碗筷", "時鐘"],
      verbs: ["放回", "整理", "陪著", "看著", "守著"],
    },
    分手: {
      palette: ["放下", "冷卻", "失去", "練習不想你", "回憶太重"],
      places: ["空房間", "刪掉的對話", "凌晨三點", "沒有你的街", "海邊"],
      objects: ["舊照片", "未送出的訊息", "行李箱", "破掉的承諾", "那首歌"],
      verbs: ["丟掉", "關上", "撕開", "收回", "告別"],
    },
  };

  const base = moodBank[mood] || moodBank["暗戀"];
  const hook = pick([
    `我把「${theme}」藏在呼吸裡`,
    `「${theme}」像是回音一直在`,
    `原來「${theme}」不是一句話`,
    `「${theme}」在我心裡反覆播放`,
    `如果「${theme}」能被好好說完`,
  ]);

  
  const lineTemplates = [
    () => `在${pick(base.places)}，我${pick(base.verbs)}${pick(base.objects)}，卻${pick(base.palette)}。`,
    () => `你說過的${pick(base.objects)}，到現在還在${pick(base.places)}發亮。`,
    () => `我以為我懂了「${theme}」，其實只是${pick(base.palette)}。`,
    () => `把${pick(base.objects)}握緊一點，心就不會那麼空嗎？`,
    () => `我${pick(base.verbs)}了好多次，還是沒能把你${pick(["留住", "忘掉", "叫回來", "說清楚"])}。`,
    () => `如果今晚有風，就讓它替我說：${hook}。`,
    () => `我在${pick(base.places)}停了停，才發現自己又想起你。`,
    () => `「${theme}」不是結局，是我還在走的路。`,
    () => `你不在的時候，連${pick(base.objects)}都顯得太安靜。`,
    () => `我把心情寫成歌，怕你聽見，又怕你永遠聽不見。`,
  ];

  const chorusTemplates = [
    () => `${hook}，別讓我一個人學會勇敢。`,
    () => `${hook}，就算沉默也要有答案。`,
    () => `${hook}，我還在原地把自己找回來。`,
    () => `${hook}，你聽見了嗎？我仍然在。`,
    () => `${hook}，讓我把故事寫完再離開。`,
  ];

  const bridgeTemplates = [
    () => `我不再追問「為什麼」，只把眼淚收好。`,
    () => `有些話不需要回覆，也能成為句點。`,
    () => `我學著把溫柔給自己，像你曾給過我那樣。`,
    () => `如果我們終究要散，那就散得體面一點。`,
    () => `我把你放回人海，卻把自己留在岸邊。`,
    () => `明天還是會來，我也會慢慢好起來。`,
  ];

  function mkLines(count, allowHook = true) {
    const lines = [];
    for (let i = 0; i < count; i++) {
      if (allowHook && maybe(0.18)) {
        lines.push(hook + "。");
      } else {
        lines.push(pick(lineTemplates)());
      }
    }
    return lines;
  }

  const verse1 = mkLines(8);
  const pre = mkLines(4, false).map((s) => s.replace("。", "，"));
  const chorusA = Array.from({ length: 6 }, () => pick(chorusTemplates)());
  const verse2 = mkLines(8);
  const chorusB = chorusA.map((l) =>
    maybe(0.35) ? l.replace("，", "，我") : l
  );
  const bridge = sampleUnique(bridgeTemplates, 4);
  const finalChorus = [
    ...Array.from({ length: 4 }, () => pick(chorusTemplates)()),
    ...mkLines(4, true),
  ];

  const sections = [
    ["Verse 1", verse1],
    ["Pre-Chorus", pre],
    ["Chorus", chorusA],
    ["Verse 2", verse2],
    ["Chorus", chorusB],
    ["Bridge", bridge],
    ["Final Chorus", finalChorus],
  ];

  const text = sections
    .map(([title, lines]) => `【${title}】\n${lines.join("\n")}`)
    .join("\n\n");

  const outro = pick([
    `【Outro】\n就到這裡吧，我會慢慢把自己抱緊。`,
    `【Outro】\n如果你剛好想起我，就當作我們曾經很真。`,
    `【Outro】\n我還在路上，帶著「${theme}」往前走。`,
    `【Outro】\n把故事寫完，才算真的告別。`,
  ]);

  return `${text}\n\n${outro}`;
}

function renderHistory(historyBox) {
  const list = loadHistory();
  if (!historyBox) return;

  if (list.length === 0) {
    historyBox.innerHTML =
      `<div class="history-item"><div class="history-meta">目前沒有紀錄。你可以先生成歌詞，然後按「複製歌詞」或再生成一次後系統會自動記錄。</div></div>`;
    return;
  }

  historyBox.innerHTML = "";
  list.forEach((it, idx) => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `
      <div class="history-meta">${escapeHtml(it.time)}｜主題：${escapeHtml(
      it.theme
    )}｜情緒：${escapeHtml(it.mood)}</div>
      <pre class="history-pre">${escapeHtml(it.lyrics)}</pre>
      <div class="small-row">
        <button class="small-btn" data-act="load" data-idx="${idx}">載入</button>
        <button class="small-btn" data-act="copy" data-idx="${idx}">複製</button>
        <button class="small-btn" data-act="del" data-idx="${idx}">刪除</button>
      </div>
    `;
    historyBox.appendChild(div);
  });

  historyBox.querySelectorAll("button[data-act]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const act = btn.dataset.act;
      const idx = Number(btn.dataset.idx);
      const list = loadHistory();
      const it = list[idx];
      if (!it) return;

      const themeEl = $("theme");
      const moodEl = $("mood");
      const outEl = $("out");

      if (act === "load") {
        if (themeEl) themeEl.value = it.theme;
        if (moodEl) moodEl.value = it.mood;
        setOut(outEl, it.lyrics);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      if (act === "copy") {
        await navigator.clipboard.writeText(it.lyrics);
        alert("已複製！");
      }

      if (act === "del") {
        list.splice(idx, 1);
        saveHistory(list);
        renderHistory(historyBox);
      }
    });
  });
}

function addToHistory(themeText, moodText, lyrics) {
  const text = (lyrics || "").trim();
  if (!text) return;

  const list = loadHistory();
  list.unshift({
    time: nowText(),
    theme: themeText || "愛情",
    mood: moodText || "暗戀",
    lyrics: text,
  });

  saveHistory(list.slice(0, 20));
}

document.addEventListener("DOMContentLoaded", () => {
  const themeEl = $("theme");
  const moodEl = $("mood");
  const outEl = $("out");
  const historyBox = $("history");
  const genBtn = $("gen");
  const copyBtn = $("copy");
  const clearAllBtn = $("clearAll");
  const toastEl = $("toast");


  renderHistory(historyBox);

  if (genBtn) {
    genBtn.addEventListener("click", () => {
      const theme = (themeEl?.value || "").trim() || "沒有名字的夜";
      const mood = moodEl?.value || "暗戀";

      setOut(outEl, "（生成中…）");
      const lyric = generateLyrics(theme, mood);
      setOut(outEl, lyric);

      addToHistory(theme, mood, lyric);
      renderHistory(historyBox);
      showToast(toastEl, "已生成歌詞！");
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const text = getOut(outEl).trim();
      if (!text) return;
      await navigator.clipboard.writeText(text);
      showToast(toastEl, "已複製歌詞！");
    });
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", () => {
      const ok = confirm("確定要清空全部紀錄嗎？此操作無法復原。");
      if (!ok) return;
      localStorage.removeItem(KEY);
      renderHistory(historyBox);
      showToast(toastEl, "已清空全部紀錄");
    });
  }
});
