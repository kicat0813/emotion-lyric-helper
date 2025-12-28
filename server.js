const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/** ====== 模板模式：多模板 詞庫隨機 讓每次都不同 ====== */
function pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

function generateLyricsTemplate(theme, mood, style = '抒情', length = '標準'){
  const imagery = {
    '暗戀': ['雨夜', '走廊', '便利商店的燈', '未送出的訊息', '耳機裡的歌'],
    '熱戀': ['街燈', '指尖', '晚風', '擁抱', '心跳'],
    '平淡': ['日常', '早餐', '窗邊', '你說晚安', '慢慢靠近'],
    '分手': ['空房間', '回憶的灰', '車站', '刪掉的相簿', '不再聯絡'],
    '重啟': ['清晨', '微光', '新的頁面', '深呼吸', '重新出發']
  };
  const verbs = ['收進', '擱淺', '輕放', '撐住', '點亮', '錯過', '抱緊', '放手', '重寫'];
  const feelings = {
    '暗戀': ['小心翼翼', '不敢說出口', '把喜歡藏起來'],
    '熱戀': ['毫不保留', '越靠越近', '把你寫進每一天'],
    '平淡': ['不吵不鬧', '剛剛好', '一起變成習慣'],
    '分手': ['拉扯', '沉默', '終於承認我們走散'],
    '重啟': ['清醒', '重新站起來', '把自己找回來']
  };

  const scene = pick(imagery[mood] || imagery['暗戀']);
  const v = pick(verbs);
  const f = pick(feelings[mood] || feelings['暗戀']);

  // 多套模板（隨機）
  const templates = [
`【Verse】
在${scene}裡，我想起「${theme}」
把${f} ${v}進字裡行間

【Chorus】
我還在原地繞一圈又一圈
把你寫成旋律，卻不敢念出你的名
`,

`【Verse】
「${theme}」像${scene}一樣不肯停
我把心事拆成幾段，藏進夜的縫隙

【Chorus】
如果靠近是種勇敢
那我願意慢一點、但真一點
`,

`【Verse】
我在${scene}練習道別
練習把你放回人海裡

【Chorus】
「${theme}」不必有答案
至少我曾經，用力地愛
`,

`【Verse】
${scene}的風替我說了幾句
關於「${theme}」和那些沒說出口的心情

【Chorus】
我想把今天重寫
把明天點亮
讓自己先學會喜歡自己
`
  ];

  let lyric = pick(templates);

  // 風格/長度：簡單擴充
  if(style === '嘻哈'){
    lyric += `\n【Rap】\n${theme} 不是劇本，是我心裡的節拍\n${scene} 當背景，情緒把我推向懸崖\n`;
  }
  if(length === '加長'){
    lyric += `\n【Bridge】\n我把遺憾摺好\n放進口袋的最深處\n等某天變成祝福\n`;
  }

  return lyric.trim();
}

async function generateLyricsAI_OpenAI({ theme, mood, style='抒情', length='標準' }){
  const apiKey = process.env.OPENAI_API_KEY;
  if(!apiKey){
    throw new Error('伺服器未設定 OPENAI_API_KEY（AI 模式需要）');
  }

  const instructions =
`你是一位華語流行歌詞寫手。請依照使用者指定的主題與情緒，創作原創歌詞。
規則：
1) 輸出包含【Verse】【Chorus】；若 length=加長 追加【Bridge】
2) 文字自然、有畫面、有情緒，不要模板感，不要提到「AI」
3) 風格 style 可為：抒情/嘻哈/搖滾（用語與節奏要符合）
4) 不要使用不當內容，避免過度暴力或仇恨。`;

  const input =
`主題：${theme}
情緒：${mood}
風格：${style}
長度：${length}
請直接輸出歌詞正文。`;

  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type':'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-5-mini',
      reasoning: { effort: 'low' },
      instructions,
      input
    })
  });

  if(!res.ok){
    const txt = await res.text();
    throw new Error(`OpenAI API 失敗：${res.status} ${txt}`);
  }

  const data = await res.json();
 
  return (data.output_text || '').trim();
}


app.post('/api/lyrics', async (req, res) => {
  try{
    const {
      theme = '愛情',
      mood = '暗戀',
      style = '抒情',
      length = '標準',
      mode = 'template', // 'template' or 'ai'
      provider = 'openai' // 先做 openai；deepseek 之後可加
    } = req.body || {};

    let lyrics = '';

    if(mode === 'ai'){
      if(provider === 'openai'){
        lyrics = await generateLyricsAI_OpenAI({ theme, mood, style, length });
      } else {
        // DeepSeek：先保留擴充點
        throw new Error('尚未設定 DeepSeek 串接（可先用 OpenAI 或模板模式）');
      }
    } else {
      lyrics = generateLyricsTemplate(theme, mood, style, length);
    }

    res.json({ ok: true, lyrics });
  }catch(err){
    res.status(400).json({ ok:false, error: String(err.message || err) });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log('Server running http://localhost:' + PORT));
