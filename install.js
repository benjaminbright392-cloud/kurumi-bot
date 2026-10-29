// KURUMI V7 DECORATED + FONTS + GROQ FRIENDLY
require('http').createServer((_,res)=>res.end('KURUMI V7 ONLINE')).listen(process.env.PORT||10000,()=>console.log('PORT OPENED'));
require('dotenv').config();
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const fs = require('fs');
const axios = require('axios');

const PREFIX='.'; const OWNER='2349025648773'; const MODS=['2349025648773','2347047506371']; const BOT_START=Date.now();
if(!fs.existsSync('./session')) fs.mkdirSync('./session',{recursive:true});
let antilinkGroups=new Set(); let antimentionGroups=new Set(); let gcStatusMap={};
try{ 
  if(fs.existsSync('./antilink.json')) antilinkGroups=new Set(JSON.parse(fs.readFileSync('./antilink.json'))); 
  if(fs.existsSync('./antimention.json')) antimentionGroups=new Set(JSON.parse(fs.readFileSync('./antimention.json')));
  if(fs.existsSync('./gcstatus.json')) gcStatusMap=JSON.parse(fs.readFileSync('./gcstatus.json'));
}catch{}
function saveSettings(){ try{ fs.writeFileSync('./antilink.json',JSON.stringify([...antilinkGroups])); fs.writeFileSync('./antimention.json',JSON.stringify([...antimentionGroups])); fs.writeFileSync('./gcstatus.json',JSON.stringify(gcStatusMap)); }catch{} }
function isMod(jid){ if(!jid) return false; const num=jid.split('@')[0].split(':')[0].replace(/[^0-9]/g,''); return MODS.some(m=>num.includes(m)||m.includes(num)); }

async function kurumiAI(prompt){
  try{
    const key=process.env.GROQ_API_KEY;
    if(key){
      try{
        const res=await axios.post('https://api.groq.com/openai/v1/chat/completions',{model:"llama-3.3-70b-versatile",messages:[{role:"system",content:"You are Kurumi Tokisaki, cute elegant yandere girl, max 350 chars, flirty."},{role:"user",content:prompt}],max_tokens:350,temperature:0.85},{headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},timeout:15000});
        return res.data.choices[0].message.content.trim();
      }catch(e){ console.log("Groq fail, using fallback"); }
    }
    const res=await axios.get(`https://text.pollinations.ai/${encodeURIComponent(`You are Kurumi Tokisaki, cute yandere, <350 chars. User: ${prompt}`)}?model=openai`,{timeout:20000});
    const txt = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
    return txt.substring(0, 500);
  }catch(e){ return `Ara ara~ Try again darling! 💖`; }
}

async function startBot(){
  const {version}=await fetchLatestBaileysVersion();
  const {state, saveCreds}=await useMultiFileAuthState('./session');
  const sock=makeWASocket({version,auth:state,logger:pino({level:'silent'}),browser:['Kurumi MD','Chrome','1.0'],keepAliveIntervalMs:10000,markOnlineOnConnect:true,syncFullHistory:false});
  sock.ev.on('creds.update',saveCreds);
  sock.ev.on('connection.update',async(up)=>{
    const {connection,lastDisconnect,qr}=up; if(qr){ qrcode.generate(qr,{small:true}); }
    if(connection==='close' && lastDisconnect?.error?.output?.statusCode!==DisconnectReason.loggedOut) setTimeout(startBot,3000);
    if(connection==='open') console.log("✅ KURUMI V7 DECORATED GROQ ONLINE");
  });

  sock.ev.on('messages.upsert',async({messages})=>{
    const m=messages[0]; if(!m.message||m.key.fromMe) return;
    const from=m.key.remoteJid; const isGroup=from.endsWith('@g.us');
    const body=m.message.conversation||m.message.extendedTextMessage?.text||m.message.imageMessage?.caption||m.message.videoMessage?.caption||'';
    const reply=(txt)=>sock.sendMessage(from,{text:txt},{quoted:m});
    const senderJid=m.key.participant||m.sender;
    const quotedMsg=m.message.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedParticipant=m.message.extendedTextMessage?.contextInfo?.participant;
    const isQuotedBot=quotedParticipant && sock.user && quotedParticipant===sock.user.id;
    if(isQuotedBot && body && !body.startsWith(PREFIX) && !/^kurumi/i.test(body)){ const res=await kurumiAI(body.trim()); return sock.sendMessage(from,{text:res},{quoted:m}); }
    if(/^kurumi(\s|$)/i.test(body)){ const prompt=body.replace(/^kurumi\s*/i,'').trim()||'hello'; const res=await kurumiAI(prompt); return reply(res); }
    if(!body.startsWith(PREFIX)) return;
    const args=body.slice(PREFIX.length).trim().split(/ +/); const command=args.shift().toLowerCase(); const q=args.join(' ');
    const mention=m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]; const targetTag=mention?"@"+mention.split('@')[0]:"you";

    // === DECORATED FONT MENU ===
    if(command==='menu'||command==='help'||command==='bot'||command==='kurumimenu'){
      const menuText=`╭━━━〔 *𝐊𝐔𝐑𝐔𝐌𝐈 𝐕𝟕 𝐔𝐋𝐓𝐈𝐌𝐀𝐓𝐄* 〕━━━╮
┃
┃ ▸ 𝐏𝐫𝐞𝐟𝐢𝐱 : .
┃ ▸ 𝐎𝐰𝐧𝐞𝐫 : 𝐁𝐞𝐧𝐣𝐚𝐦𝐢𝐧 𝐁𝐫𝐢𝐠𝐡𝐭
┃ ▸ 𝐔𝐩𝐭𝐢𝐦𝐞 : ${Math.floor((Date.now()-BOT_START)/3600000)}h
┃ ▸ 𝐀𝐈 : 𝐆𝐫𝐨𝐪 𝐋𝐥𝐚𝐦𝐚 𝟑.𝟑 ✅
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯

╭─〔 *𝐁𝐎𝐓 𝐈𝐍𝐅𝐎* 〕─
│ ◦ .alive
│ ◦ .alive2
│ ◦ .ping
│ ◦ .runtime
│ ◦ .owner
│ ◦ .mods
│ ◦ .script
│ ◦ .info
│ ◦ .donate
╰──────────────

╭─〔 *𝐀𝐃𝐌𝐈𝐍 𝐏𝐀𝐍𝐄𝐋* 👑 〕─
│ ◦ .kick @
│ ◦ .add 234xxx
│ ◦ .promote @
│ ◦ .demote @
│ ◦ .tagall [text]
│ ◦ .hidetag [text]
│ ◦ .close
│ ◦ .open
│ ◦ .link
│ ◦ .revoke
│ ◦ .setname
│ ◦ .setdesc
│ ◦ .antilink on/off
│ ◦ .antimention on/off
│ ◦ .gcstatus [text]
│ ◦ .delgcstatus
╰──────────────

╭─〔 *𝐍𝐄𝐖 𝐅𝐄𝐀𝐓𝐔𝐑𝐄𝐒* ✨ 〕─
│ ◦ .profile @
│ ◦ .whois @
│ ◦ .jid
│ ◦ .vv
│ ◦ .calc 2+2
│ ◦ .flip
│ ◦ .roll
│ ◦ .pint [query]
│ ◦ .goon @
╰──────────────

╭─〔 *𝐅𝐔𝐍 & 𝐑𝐀𝐓𝐄* 🎲 〕─
│ ◦ .gay @ .les @ .simp
│ ◦ .beautiful @ .cute @
│ ◦ .hot @ .handsome @
│ ◦ .ship @ .love @ .crush
│ ◦ .kill @ .howgay @ .goon
│ ◦ .dice .coin .8ball
│ ◦ .joke .fact .quote
│ ◦ .meme .truth .dare
╰──────────────

╭─〔 *𝐀𝐍𝐈𝐌𝐄* 💞 〕─
│ ◦ .hug @ .kiss @ .slap
│ ◦ .pat @ .cuddle @ .cry
│ ◦ .waifu .neko .blush
│ ◦ .smile .wave .dance
│ ◦ .poke .bonk .highfive
│ ◦ .handhold @ .nom @
╰──────────────

╭─〔 *𝐀𝐈 & 𝐌𝐄𝐃𝐈𝐀* 🧠 〕─
│ ◦ kurumi [ask]
│ ◦ .ai [ask]
│ ◦ .imagine [prompt]
│ ◦ .s
│ ◦ .toimg
│ ◦ .emojimix 😂+😭
│ ◦ .attp [text]
│ ◦ .weather [city]
│ ◦ .time .date
╰──────────────

*𝐓𝐲𝐩𝐞 .𝐝𝐨𝐧𝐚𝐭𝐞 𝐭𝐨 𝐬𝐮𝐩𝐩𝐨𝐫𝐭 𝐊𝐮𝐫𝐮𝐦𝐢* 💖
_𝐀𝐫𝐚 𝐚𝐫𝐚~ 𝐃𝐚𝐫𝐥𝐢𝐧𝐠~_`;

      return reply(menuText);
    }

    if(command==='alive'||command==='alive2'||command==='botstatus'){
      const up=Math.floor((Date.now()-BOT_START)/1000);
      return reply(`╭━ *𝐊𝐔𝐑𝐔𝐌𝐈 𝐀𝐋𝐈𝐕𝐄* 💖 ━╮\n┃ Uptime: ${Math.floor(up/3600)}h ${Math.floor((up%3600)/60)}m ${up%60}s\n┃ Status: Online ✅\n┃ Groq AI: Active ✅\n┃ Prefix: .\n╰━━━━━━━━━━━━╯`);
    }
    if(command==='mods'||command==='mod'){
      return reply(`╭━ *𝐊𝐔𝐑𝐔𝐌𝐈 𝐌𝐎𝐃𝐒* 👑 ━╮\n┃ Owner: wa.me/${OWNER}\n┃ Mod: wa.me/2347047506371\n┃ Groq: Active ✅\n╰━━━━━━━━━━━━╯`);
    }
    if(command==='pint'||command==='pinterest'||command==='pinimg'){
      if(!q) return reply("Use: .pint Naruto");
      try{
        const r = await axios.get(`https://api.akuari.my.id/search/pinterest?query=${encodeURIComponent(q)}`,{timeout:15000});
        const images = r.data.result || r.data.hasil || r.data.data;
        if(!images || !images[0]) return reply("No results: "+q);
        const pick = images[Math.floor(Math.random()*Math.min(images.length,10))];
        return sock.sendMessage(from,{image:{url:pick},caption:`📌 *𝐏𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐭:* ${q} 💖`},{quoted:m});
      }catch(e){
        return sock.sendMessage(from,{image:{url:`https://image.pollinations.ai/prompt/pinterest aesthetic ${encodeURIComponent(q)}?nologo=true`},caption:`📌 ${q}`},{quoted:m});
      }
    }
    if(command==='goon'){ const p=Math.floor(Math.random()*101); return sock.sendMessage(from,{text:`😈 *𝐆𝐨𝐨𝐧 𝐌𝐞𝐭𝐞𝐫* 🔥\n${targetTag} is ${p}% gooning!`,mentions: mention?[mention]:[]},{quoted:m}); }

    if(command==='gcstatus'||command==='setgcstatus'){
      if(!isGroup) return reply("Group only");
      const meta=await sock.groupMetadata(from); const isAdmin=meta.participants.filter(p=>p.admin).some(p=>p.id===senderJid)||isMod(senderJid); if(!isAdmin) return reply("Admins only");
      if(!q){ const cur=gcStatusMap[from]; return reply(cur?`╭━ *𝐆𝐂 𝐒𝐭𝐚𝐭𝐮𝐬* ━╮\n┃ ${cur}\n╰━━━━╯`:"Use: .gcstatus Welcome!"); }
      gcStatusMap[from]=q; saveSettings(); return reply(`✅ *𝐆𝐂 𝐒𝐭𝐚𝐭𝐮𝐬 𝐒𝐚𝐯𝐞𝐝:*\n${q}`);
    }
    if(command==='delgcstatus'){ if(!isGroup) return reply("Group only"); const meta=await sock.groupMetadata(from); const isAdmin=meta.participants.filter(p=>p.admin).some(p=>p.id===senderJid)||isMod(senderJid); if(!isAdmin) return reply("Admins only"); delete gcStatusMap[from]; saveSettings(); return reply("✅ GC Status deleted"); }
    if(command==='getgcstatus'){ const cur=gcStatusMap[from]; return reply(cur?`𝐆𝐂 𝐒𝐭𝐚𝐭𝐮𝐬:\n${cur}`:"No status"); }

    if(command==='donate'||command==='opay'){ return reply(`╭━━ *𝐃𝐎𝐍𝐀𝐓𝐄* ━━╮\n┃ 💚 Opay\n┃ Number: *7041971847*\n┃ Name: *Benjamin Ojonugwa Bright*\n┃ Bank: *Opay*\n╰━━━━━━━━━━╯`); }
    if(command==='tagall'){
      if(!isGroup) return reply("Group only");
      const metadata=await sock.groupMetadata(from); const isAdmin=metadata.participants.filter(p=>p.admin).some(p=>p.id===senderJid)||isMod(senderJid); if(!isAdmin) return reply("Admins only");
      const gcStat = gcStatusMap[from] ? `┏ *𝐆𝐫𝐨𝐮𝐩 𝐒𝐭𝐚𝐭𝐮𝐬:* ${gcStatusMap[from]} ┓\n\n` : '';
      let text=`${gcStat}${q?`💬 *𝐌𝐞𝐬𝐬𝐚𝐠𝐞:* ${q}\n\n`:''}╭━ *𝐓𝐀𝐆𝐀𝐋𝐋* ━╮\n`;
      const participants=metadata.participants;
      for(let i=0;i<participants.length;i++){ text+=`│ ◦ @${participants[i].id.split('@')[0]}\n`; }
      text+=`╰━━━━━━━━╯`;
      return sock.sendMessage(from,{text:text.trim(),mentions:participants.map(p=>p.id)},{quoted:m});
    }

    // other cmds
    if(command==='ping'){ const s=Date.now(); await sock.sendMessage(from,{text:"Pinging..."}, {quoted:m}); return reply(`Pong ${Date.now()-s}ms | Groq ✅`); }
    if(command==='owner'){ return reply(`Owner: wa.me/${OWNER}`); }
    if(['ai','gpt'].includes(command)){ if(!q) return reply(`Use: .${command} hello`); const res=await kurumiAI(q); return reply(res); }
    if(command==='imagine'){ if(!q) return reply('Use: .imagine prompt'); const url=`https://image.pollinations.ai/prompt/${encodeURIComponent(q)}?width=768&height=1024&nologo=true&seed=${Math.floor(Math.random()*100000)}`; return sock.sendMessage(from,{image:{url},caption:`🎨 ${q}`},{quoted:m}); }
  });
}
startBot();