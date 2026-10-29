// KURUMI V7 - FIXED FOR RENDER
require('http').createServer((_,res)=>res.end('KURUMI V7 BOT ONLINE - LIVE')).listen(process.env.PORT||10000,()=>console.log('PORT OPENED FOR RENDER'));

require('dotenv').config();
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const fs = require('fs');
const axios = require('axios');
const OpenAI = require("openai");
const path = require('path');

const PREFIX = '.';
const OWNER = '2349025648773';
const MODS = ['2349025648773', '2347047506371'];
const BOT_START = Date.now();

// Create session folder if missing (fixes Render crash)
if(!fs.existsSync('./session')) fs.mkdirSync('./session', { recursive: true });
if(!fs.existsSync('./media')) fs.mkdirSync('./media', { recursive: true });

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

if(!OPENROUTER_KEY){
  console.log("❌ NO API KEY FOUND! Add OPENAI_API_KEY in Render Environment");
}

const openai = new OpenAI({ 
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: OPENROUTER_KEY,
  defaultHeaders: { "HTTP-Referer": "https://kurumi.bot", "X-Title": "Kurumi AI" }
});

function isMod(jid){ if(!jid) return false; const num = jid.split('@')[0].split(':')[0].replace(/[^0-9]/g,''); return MODS.some(m => num.includes(m) || m.includes(num)); }
function getRandomKurumi(){ try{ for(const dir of ['./media/menu','./media','./kurumi/media/menu']){ if(!fs.existsSync(dir)) continue; const files = fs.readdirSync(dir).filter(f => /\.(jpg|png|jpeg)$/i.test(f)); if(files.length>0) return path.join(dir, files[Math.floor(Math.random()*files.length)]); } return null; }catch{ return null; } }
async function kurumiAI(prompt){ try{ const chat = await openai.chat.completions.create({ messages: [{ role: "system", content: "You are Kurumi Tokisaki, cute elegant proper English." }, { role: "user", content: prompt }], model: "meta-llama/llama-3.1-8b-instruct", max_tokens: 300 }); return chat.choices[0].message.content; }catch(e){ console.log("AI Error:", e.message); return "Error: "+e.message; } }

async function startBot() {
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const sock = makeWASocket({ version, auth: state, logger: pino({ level: 'silent' }), browser: ['Kurumi MD','Chrome','1.0'], keepAliveIntervalMs:10000, markOnlineOnConnect:true, syncFullHistory:false });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async (up) => {
    const { connection, lastDisconnect, qr } = up;
    if(qr){ qrcode.generate(qr, { small: true }); console.log("SCAN QR BELOW - YOU HAVE 30 SECS"); }
    if(connection === 'close'){
      console.log("Connection closed", lastDisconnect?.error?.message);
      if(lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) setTimeout(startBot, 3000);
    }
    if(connection === 'open') console.log("✅ KURUMI V7 ONLINE - NO ADMIN BLOCK");
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if(!m.message || m.key.fromMe) return;
    const from = m.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || '';
    const reply = (txt) => sock.sendMessage(from, { text: txt }, { quoted: m });

    if (/^kurumi(\s|$)/i.test(body)) {
      const prompt = body.replace(/^kurumi\s*/i, '').trim() || 'hello';
      const res = await kurumiAI(prompt);
      const img = getRandomKurumi();
      if(img && fs.existsSync(img)) return sock.sendMessage(from, { image: fs.readFileSync(img), caption: res }, { quoted: m });
      return reply(res);
    }
    if(!body.startsWith(PREFIX)) return;
    const args = body.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const q = args.join(' ');
    const senderJid = m.key.participant || m.sender;
    const mention = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    const targetTag = mention ? "@"+mention.split('@')[0] : "you";

    if(command === 'ping'){ const start = Date.now(); const msg = await sock.sendMessage(from, { text: "*Pinging...*" }, { quoted: m }); const latency = Date.now()-start; const up = Math.floor((Date.now()-BOT_START)/1000); return sock.sendMessage(from, { text: `╭─ *PONG!* 🏓\n│ Speed: *${latency}ms* ⚡\n│ Uptime: ${Math.floor(up/3600)}h ${Math.floor((up%3600)/60)}m`, edit: msg.key }); }
    if(command === 'runtime'){ const up = Math.floor((Date.now()-BOT_START)/1000); return reply(`*Runtime:* ${Math.floor(up/3600)}h ${Math.floor((up%3600)/60)}m ${up%60}s`); }
    if(command === 'owner') return reply(`*Owner:* wa.me/${OWNER}\n*Mod:* wa.me/2347047506371`);
    if(command === 'mods' || command === 'mod'){ return reply(`╭─ *MODS* 👑\n│ Owner: wa.me/${OWNER}\n│ Mod: wa.me/2347047506371`); }

    const rateCmds = { gay:"Gay", les:"Lesbian", lesbian:"Lesbian", simp:"Simp", handsome:"Handsome", beautiful:"Beautiful", cute:"Cute", horny:"Horny", sexy:"Sexy", smart:"Smart", dumb:"Dumb", fool:"Foolish", drunk:"Drunk", rich:"Rich", poor:"Poor", brave:"Brave", shy:"Shy", kind:"Kind", evil:"Evil", ugly:"Ugly", cool:"Cool", hot:"Hot" };
    if(rateCmds[command]){ const percent = Math.floor(Math.random()*101); return sock.sendMessage(from, { text: `╭─ *${rateCmds[command]} Checker*\n│ ${targetTag} is *${percent}%* ${rateCmds[command]}!`, mentions: mention?[mention]:[] }, { quoted: m }); }
    if(command === 'dice' || command === 'roll'){ return reply(`🎲 You rolled: *${Math.floor(Math.random()*6)+1}*`); }
    if(command === 'coinflip' || command === 'coin' || command === 'flip'){ return reply(`🪙 Coin: *${Math.random()>0.5?'Heads':'Tails'}*`); }
    if(command === 'slot' || command === 'slots'){ const s=["🍒","🍋","🍊","💎","7️⃣","🔔"]; const a=s[Math.floor(Math.random()*s.length)], b=s[Math.floor(Math.random()*s.length)], c=s[Math.floor(Math.random()*s.length)]; return reply(`🎰 | ${a} | ${b} | ${c} |`); }
    if(command === 'rps'){ const choices=["rock","paper","scissors"]; const bot=choices[Math.floor(Math.random()*3)]; const user=(q||"").toLowerCase(); if(!choices.includes(user)) return reply(`Use: .rps rock/paper/scissors`); let res="Draw!"; if((user==="rock"&&bot==="scissors")||(user==="paper"&&bot==="rock")||(user==="scissors"&&bot==="paper")) res="You win!"; else if(user!==bot) res="You lose!"; return reply(`You: ${user} vs Bot: ${bot}\n*${res}*`); }
    if(command === 'roast'){ return sock.sendMessage(from, { text: `🔥 Roast for ${targetTag}`, mentions: mention?[mention]:[] }, { quoted: m }); }
    if(command === 'meme'){ try{ const res=await axios.get('https://meme-api.com/gimme'); return sock.sendMessage(from, { image: { url: res.data.url }, caption: res.data.title }, { quoted: m }); }catch{ return reply('Meme API down'); } }
    if(command === 'kill'){ return sock.sendMessage(from, { text: `💀 ${senderJid.split('@')[0]} killed ${targetTag}!`, mentions: mention?[mention, senderJid]:[senderJid] }, { quoted: m }); }
    if(command === 'crush'){ return sock.sendMessage(from, { text: `💘 Crush: ${senderJid.split('@')[0]} -> ${targetTag} ${Math.floor(Math.random()*101)}%`, mentions: mention?[mention, senderJid]:[senderJid] }, { quoted: m }); }
    if(command === 'love' || command === 'ship'){ const p=Math.floor(Math.random()*101); return sock.sendMessage(from, { text: `💞 Love: ${senderJid.split('@')[0]} ❤️ ${targetTag} = ${p}%`, mentions: mention?[mention, senderJid]:[senderJid] }, { quoted: m }); }
    if(command === 'hack' || command === 'dox'){ return sock.sendMessage(from, { text: `💻 Fake hacking ${targetTag}... Done! (Just for fun)`, mentions: mention?[mention]:[] }, { quoted: m }); }
    if(command === 'chaos'){ if(!isGroup) return reply("Group only"); const meta=await sock.groupMetadata(from); const parts=meta.participants; let txt=`🔥 *Chaos*\n${q||''}\n\n`; txt+=parts.map(p=>`@${p.id.split('@')[0]}`).join('\n'); return sock.sendMessage(from, { text: txt, mentions: parts.map(p=>p.id) }, { quoted: m }); }

    if(command === 'menu' || command === 'help'){
      const menuText = 
`╭━━━ *KURUMI MD V7* ━━━╮
┃ Prefix: ${PREFIX}
╰━━━━━━━━━━━━━━━⭓
*ADMIN* 👑 .kick @user .add 234... .promote / demote @user .tagall .hidetag .close / open .link
*FUN* 🎲 .gay .ship .dice .coinflip .slot .rps .meme .roast
*ANIME* 💞 .hug .kiss .slap .waifu .neko
*STICKER* 🎨 .s .toimg
*AI* 🧠 .ai / kurumi [question] .imagine
*UTILITY* ⚙️ .ping .runtime .owner .mods
`;
      return reply(menuText);
    }

    const adminCmds = ['kick','promote','demote','tagall','hidetag','group','link','add','close','open','closegc','opengc'];
    if(adminCmds.includes(command)){
      if(!isGroup) return reply("This command can only be used in groups.");
      try{
        const metadata = await sock.groupMetadata(from);
        const participants = metadata.participants;
        const admins = participants.filter(p => p.admin);
        const senderNum = senderJid.split('@')[0].split(':')[0].replace(/[^0-9]/g,'');
        const isGroupAdmin = admins.some(a => {
          const aNum = a.id.split('@')[0].split(':')[0].replace(/[^0-9]/g,'');
          return a.id === senderJid || aNum === senderNum;
        });
        const isAllowed = isGroupAdmin || isMod(senderJid) || isMod(m.sender);
        if(!isAllowed) return reply("❌ Only group admins and bot moderators can use this command.");
        if(command === 'kick'){ if(!mention) return reply('Usage: .kick @user'); await sock.groupParticipantsUpdate(from, [mention], 'remove'); return reply('✅ User has been removed.'); }
        if(command === 'add'){ if(!q) return reply('Usage: .add 234...'); const num = q.replace(/[^0-9]/g,'')+'@s.whatsapp.net'; await sock.groupParticipantsUpdate(from, [num], 'add'); return reply('✅ User added.'); }
        if(command === 'promote' || command === 'demote'){ if(!mention) return reply('Usage: .'+command+' @user'); await sock.groupParticipantsUpdate(from, [mention], command); return reply(`✅ User ${command}d.`); }
        if(command === 'tagall'){ let text = `📢 *Tag All*\n${q||''}\n\n`; text+=participants.map((p,i)=>`${i+1}. @${p.id.split('@')[0]}`).join('\n'); return sock.sendMessage(from, { text: text, mentions: participants.map(p=>p.id) }, { quoted: m }); }
        if(command === 'hidetag'){ return sock.sendMessage(from, { text: q || 'Hello everyone', mentions: participants.map(p=>p.id) }, { quoted: m }); }
        if(command === 'group'){ const act = q.toLowerCase(); await sock.groupSettingUpdate(from, act === 'open' ? 'not_announcement' : 'announcement'); return reply(`✅ Group ${act==='open'?'opened':'closed'}.`); }
        if(command === 'close' || command === 'closegc'){ await sock.groupSettingUpdate(from, 'announcement'); return reply('🔒 Group closed.'); }
        if(command === 'open' || command === 'opengc'){ await sock.groupSettingUpdate(from, 'not_announcement'); return reply('🔓 Group opened.'); }
        if(command === 'link'){ const code = await sock.groupInviteCode(from); return reply('https://chat.whatsapp.com/'+code); }
      } catch(e){ return reply(`❌ Failed: ${e.message}`); }
    }
    if(command === 'joke'){ try{ const r = await axios.get('https://official-joke-api.appspot.com/random_joke'); return reply(r.data.setup+"\n"+r.data.punchline); }catch{ return reply('Could not fetch joke'); } }
    if(command === '8ball'){ const a=['Yes.','No.','Maybe.','Definitely!']; return reply('🎱 '+a[Math.floor(Math.random()*a.length)]); }
    const inter = ['hug','kiss','slap','pat','cuddle','cry','waifu','neko','bully','bonk','yeet','blush','smile','wave','highfive','handhold','nom','happy','wink','poke','dance','shinobu','megumin','awoo','cringe'];
    const interMap = { shinobu: 'waifu', megumin: 'waifu', awoo: 'waifu', cringe: 'blush', yeet: 'bonk' };
    if(inter.includes(command)){
      let imageUrl = null;
      const realCommand = interMap[command] || command;
      try{ const res = await axios.get(`https://api.waifu.pics/sfw/${realCommand}`, { timeout: 10000 }); imageUrl = res.data?.url; }catch{}
      if(!imageUrl){ try{ const res2 = await axios.get(`https://api.waifu.im/search?included_tags=${realCommand}`, { timeout: 10000 }); imageUrl = res2.data?.images?.[0]?.url; }catch{} }
      if(!imageUrl){ try{ const res3 = await axios.get(`https://nekos.best/api/v2/${realCommand}`, { timeout: 10000 }); imageUrl = res3.data?.results?.[0]?.url; }catch{} }
      if(!imageUrl) return reply(`Service unavailable for ${command}, try again.`);
      try{
        await sock.sendMessage(from, { image: { url: imageUrl }, caption: `*${command.toUpperCase()}* - ${targetTag}` }, { quoted: m });
        try{ const buf = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 15000 }).then(r=>Buffer.from(r.data)); await sock.sendMessage(from, { sticker: buf }, { quoted: m }); }catch{}
      }catch(e){ return reply(`Failed: ${e.message}`); }
      return;
    }
    if(command === 's' || command === 'sticker'){ const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage; const mediaMsg = quoted ? { message: quoted } : m; try{ const buf = await downloadMediaMessage(mediaMsg, 'buffer', {}, { logger: pino(), reuploadRequest: sock.updateMediaMessage }); return sock.sendMessage(from, { sticker: buf }, { quoted: m }); }catch{ return reply('Reply to an image/video with .s'); } }
    if(command === 'toimg'){ const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage; if(!quoted) return reply('Reply to a sticker with .toimg'); const buf = await downloadMediaMessage({ message: { stickerMessage: quoted } }, 'buffer', {}, { logger: pino(), reuploadRequest: sock.updateMediaMessage }); return sock.sendMessage(from, { image: buf }, { quoted: m }); }
    if(['kurumi','ai','gpt'].includes(command)){ if(!q) return reply('Usage: '+PREFIX+command+' hello'); const res = await kurumiAI(q); return reply(res); }
    if(command === 'imagine' || command === 'image'){ if(!q) return reply('Usage: .'+command+' prompt'); const url = 'https://image.pollinations.ai/prompt/'+encodeURIComponent(q)+'?width=512&height=768&nologo=true'; return sock.sendMessage(from, { image: { url: url }, caption: '🎨 '+q }, { quoted: m }); }
    if(command === 'pinterest' || command === 'pin'){ if(!q) return reply(`Usage: .pinterest query`); const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(q)} pinterest aesthetic?width=768&height=1024&nologo=true&seed=${Math.floor(Math.random()*1000)}`; return sock.sendMessage(from, { image: { url: url }, caption: `📌 Pinterest: ${q}` }, { quoted: m }); }
  });
}
startBot();