// KURUMI V7 DECORATED FONTS + QR + PAIRING CODE - RENDER FIXED
require('http').createServer((_,res)=>res.end('KURUMI V7 ONLINE')).listen(process.env.PORT||10000,()=>console.log('PORT OPENED'));
require('dotenv').config();
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const fs = require('fs');
const axios = require('axios');

const PREFIX='.'; const OWNER='2349025648773'; const MODS=['2349025648773','2347047506371']; const BOT_START=Date.now();
const PAIRING_NUMBER = '2349025648773';

if(!fs.existsSync('./session')) fs.mkdirSync('./session',{recursive:true});
let gcStatusMap={};
try{ if(fs.existsSync('./gcstatus.json')) gcStatusMap=JSON.parse(fs.readFileSync('./gcstatus.json')); }catch{}
function saveGC(){ try{ fs.writeFileSync('./gcstatus.json',JSON.stringify(gcStatusMap)); }catch{} }
function isMod(jid){ if(!jid) return false; const num=jid.split('@')[0].split(':')[0].replace(/[^0-9]/g,''); return MODS.some(m=>num.includes(m)||m.includes(num)); }

async function kurumiAI(prompt){
  try{
    const key=process.env.GROQ_API_KEY;
    if(key){
      try{
        const r=await axios.post('https://api.groq.com/openai/v1/chat/completions',{model:"llama-3.3-70b-versatile",messages:[{role:"system",content:"You are Kurumi Tokisaki, cute yandere, max 350 chars."},{role:"user",content:prompt}],max_tokens:350},{headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},timeout:15000});
        return r.data.choices[0].message.content.trim();
      }catch{}
    }
    const r=await axios.get(`https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai`,{timeout:20000});
    return (typeof r.data==='string'?r.data:JSON.stringify(r.data)).substring(0,500);
  }catch{ return `Try again darling! 💖`; }
}

async function startBot(){
  const {version}=await fetchLatestBaileysVersion();
  const {state, saveCreds}=await useMultiFileAuthState('./session');
  const sock=makeWASocket({version,auth:state,logger:pino({level:'silent'}),browser:['Kurumi MD','Chrome','1.0'],keepAliveIntervalMs:10000,markOnlineOnConnect:true});
  sock.ev.on('creds.update',saveCreds);

  // PAIRING CODE IF YOU WANT IT
  if(!state.creds.registered){
    setTimeout(async()=>{
      try{
        let code=await sock.requestPairingCode(PAIRING_NUMBER);
        code=code?.match(/.{1,4}/g)?.join("-")||code;
        console.log(`\n=== PAIRING CODE FOR ${PAIRING_NUMBER}: ${code} ===\n`);
      }catch(e){}
    },4000);
  }

  sock.ev.on('connection.update',async(up)=>{
    const {connection,lastDisconnect,qr}=up;
    
    // QR CODE IN LOGS - BRO YOU ASKED
    if(qr){
      console.log("\n\n===== SCAN QR BELOW =====\n");
      qrcode.generate(qr,{small:false});
      console.log("\n===== WHATSAPP > LINKED DEVICES > LINK A DEVICE =====\n\n");
    }

    if(connection==='close'){
      console.log("Closed:",lastDisconnect?.error?.message);
      if(lastDisconnect?.error?.output?.statusCode!==DisconnectReason.loggedOut) setTimeout(startBot,5000);
      else console.log("LOGGED OUT - Run rm -rf session");
    }
    if(connection==='open') console.log("KURUMI V7 DECORATED GROQ ONLINE - QR + PAIRING READY");
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
    const mention=m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]; const targetTag=mention?"@"+mention.split('@')[0]:"𝐲𝐨𝐮";

    if(command==='menu'||command==='help'||command==='bot'||command==='kurumimenu'){
      const up=Math.floor((Date.now()-BOT_START)/3600000);
      const menuText=`╭━━━〔 *𝐊𝐔𝐑𝐔𝐌𝐈 𝐕𝟕 𝐔𝐋𝐓𝐈𝐌𝐀𝐓𝐄* 〕━━━╮
┃ ▸ 𝐏𝐫𝐞𝐟𝐢𝐱 : .
┃ ▸ 𝐎𝐰𝐧𝐞𝐫 : 𝐁𝐞𝐧𝐣𝐚𝐦𝐢𝐧 𝐁𝐫𝐢𝐠𝐡𝐭
┃ ▸ 𝐔𝐩𝐭𝐢𝐦𝐞 : ${up}𝐡
┃ ▸ 𝐀𝐈 : 𝐆𝐫𝐨𝐪 ✅
╰━━━━━━━━━━━━━━━━━━━━━━╯

╭─〔 *𝐁𝐎𝐓 𝐈𝐍𝐅𝐎* 💎 〕─
│ ◦ .𝐚𝐥𝐢𝐯𝐞 .𝐚𝐥𝐢𝐯𝐞𝟐 .𝐩𝐢𝐧𝐠
│ ◦ .𝐫𝐮𝐧𝐭𝐢𝐦𝐞 .𝐨𝐰𝐧𝐞𝐫 .𝐦𝐨𝐝𝐬
│ ◦ .𝐬𝐜𝐫𝐢𝐩𝐭 .𝐢𝐧𝐟𝐨 .𝐝𝐨𝐧𝐚𝐭𝐞
╰──────────────

╭─〔 *𝐀𝐃𝐌𝐈𝐍* 👑 〕─
│ ◦ .𝐤𝐢𝐜𝐤 @ .𝐚𝐝𝐝
│ ◦ .𝐩𝐫𝐨𝐦𝐨𝐭𝐞 .𝐝𝐞𝐦𝐨𝐭𝐞
│ ◦ .𝐭𝐚𝐠𝐚𝐥𝐥 [𝐭𝐞𝐱𝐭]
│ ◦ .𝐡𝐢𝐝𝐞𝐭𝐚𝐠 .𝐜𝐥𝐨𝐬𝐞 .𝐨𝐩𝐞𝐧
│ ◦ .𝐥𝐢𝐧𝐤 .𝐫𝐞𝐯𝐨𝐤𝐞
│ ◦ .𝐬𝐞𝐭𝐧𝐚𝐦𝐞 .𝐬𝐞𝐭𝐝𝐞𝐬𝐜
│ ◦ .𝐠𝐜𝐬𝐭𝐚𝐭𝐮𝐬 [𝐭𝐞𝐱𝐭]
│ ◦ .𝐝𝐞𝐥𝐠𝐜𝐬𝐭𝐚𝐭𝐮𝐬 .𝐠𝐞𝐭𝐠𝐜𝐬𝐭𝐚𝐭𝐮𝐬
╰──────────────

╭─〔 *𝐍𝐄𝐖* ✨ 〕─
│ ◦ .𝐩𝐫𝐨𝐟𝐢𝐥𝐞 @ .𝐣𝐢𝐝 .𝐯𝐯
│ ◦ .𝐜𝐚𝐥𝐜 .𝐟𝐥𝐢𝐩 .𝐫𝐨𝐥𝐥
│ ◦ .𝐩𝐢𝐧𝐭 [𝐪] .𝐠𝐨𝐨𝐧 @
╰──────────────

╭─〔 *𝐅𝐔𝐍 & 𝐑𝐀𝐓𝐄* 🎲 〕─
│ ◦ .𝐠𝐚𝐲 @ .𝐥𝐞𝐬 @ .𝐬𝐢𝐦𝐩
│ ◦ .𝐛𝐞𝐚𝐮𝐭𝐢𝐟𝐮𝐥 @ .𝐜𝐮𝐭𝐞
│ ◦ .𝐡𝐨𝐭 @ .𝐡𝐚𝐧𝐝𝐬𝐨𝐦𝐞
│ ◦ .𝐬𝐡𝐢𝐩 @ .𝐥𝐨𝐯𝐞 @ .𝐜𝐫𝐮𝐬𝐡
│ ◦ .𝟖𝐛𝐚𝐥𝐥 .𝐣𝐨𝐤𝐞 .𝐟𝐚𝐜𝐭
│ ◦ .𝐪𝐮𝐨𝐭𝐞 .𝐦𝐞𝐦𝐞
╰──────────────

╭─〔 *𝐀𝐍𝐈𝐌𝐄* 💞 〕─
│ ◦ .𝐡𝐮𝐠 @ .𝐤𝐢𝐬𝐬 @ .𝐬𝐥𝐚𝐩
│ ◦ .𝐩𝐚𝐭 @ .𝐰𝐚𝐢𝐟𝐮 .𝐧𝐞𝐤𝐨
│ ◦ .𝐛𝐥𝐮𝐬𝐡 .𝐬𝐦𝐢𝐥𝐞 .𝐰𝐚𝐯𝐞
╰──────────────

╭─〔 *𝐀𝐈 & 𝐌𝐄𝐃𝐈𝐀* 🧠 〕─
│ ◦ 𝐤𝐮𝐫𝐮𝐦𝐢 [𝐚𝐬𝐤]
│ ◦ .𝐚𝐢 [𝐚𝐬𝐤] .𝐢𝐦𝐚𝐠𝐢𝐧𝐞
│ ◦ .𝐬 .𝐭𝐨𝐢𝐦𝐠 .𝐚𝐭𝐭𝐩
│ ◦ .𝐰𝐞𝐚𝐭𝐡𝐞𝐫 .𝐭𝐢𝐦𝐞
╰──────────────

*𝐓𝐲𝐩𝐞 .𝐝𝐨𝐧𝐚𝐭𝐞 𝐭𝐨 𝐬𝐮𝐩𝐩𝐨𝐫𝐭* 💖`;
      return reply(menuText);
    }

    if(command==='alive'||command==='alive2'){
      const up=Math.floor((Date.now()-BOT_START)/1000);
      return reply(`╭━ *𝐊𝐔𝐑𝐔𝐌𝐈 𝐀𝐋𝐈𝐕𝐄* 💖 ━╮\n┃ ▸ 𝐔𝐩𝐭𝐢𝐦𝐞: ${Math.floor(up/3600)}𝐡 ${Math.floor((up%3600)/60)}𝐦\n┃ ▸ 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐎𝐧𝐥𝐢𝐧𝐞 ✅\n┃ ▸ 𝐆𝐫𝐨𝐪: 𝐀𝐜𝐭𝐢𝐯𝐞\n╰━━━━━━━━━━━━╯`);
    }
    if(command==='mods'){ return reply(`╭━ *𝐊𝐔𝐑𝐔𝐌𝐈 𝐌𝐎𝐃𝐒* 👑 ━╮\n┃ 𝐎𝐰𝐧𝐞𝐫: 𝐰𝐚.𝐦𝐞/${OWNER}\n┃ 𝐌𝐨𝐝: 𝐰𝐚.𝐦𝐞/2347047506371\n╰━━━━━━━━━━━━╯`); }
    if(command==='donate'||command==='opay'){ return reply(`╭━━ *𝐃𝐎𝐍𝐀𝐓𝐄* 💰 ━━╮\n┃ 𝐎𝐩𝐚𝐲: 𝟕𝟎𝟒𝟏𝟗𝟕𝟏𝟖𝟒𝟕\n┃ 𝐍𝐚𝐦𝐞: 𝐁𝐞𝐧𝐣𝐚𝐦𝐢𝐧 𝐎. 𝐁𝐫𝐢𝐠𝐡𝐭\n╰━━━━━━━━━━━━━━╯`); }
    if(command==='ping'){ const s=Date.now(); await reply("𝐏𝐢𝐧𝐠𝐢𝐧𝐠...⚡"); return reply(`𝐏𝐨𝐧𝐠 ${Date.now()-s}𝐦𝐬 💖`); }
    if(command==='pint'){ if(!q) return reply("𝐔𝐬𝐞: .𝐩𝐢𝐧𝐭 𝐍𝐚𝐫𝐮𝐭𝐨"); return sock.sendMessage(from,{image:{url:`https://image.pollinations.ai/prompt/pinterest aesthetic ${encodeURIComponent(q)}?nologo=true`},caption:`*𝐏𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐭: ${q}*`},{quoted:m}); }
    if(command==='goon'){ const p=Math.floor(Math.random()*101); return sock.sendMessage(from,{text:`*𝐆𝐨𝐨𝐧 𝐌𝐞𝐭𝐞𝐫* 💦\n${targetTag} 𝐢𝐬 ${p}% 𝐠𝐨𝐨𝐧𝐢𝐧𝐠!`,mentions:mention?[mention]:[]},{quoted:m}); }
    if(command==='gcstatus'){ if(!isGroup) return reply("𝐆𝐫𝐨𝐮𝐩 𝐨𝐧𝐥𝐲"); const meta=await sock.groupMetadata(from); const isAdmin=meta.participants.filter(p=>p.admin).some(p=>p.id===senderJid)||isMod(senderJid); if(!isAdmin) return reply("𝐀𝐝𝐦𝐢𝐧𝐬 𝐨𝐧𝐥𝐲"); if(!q){ const cur=gcStatusMap[from]; return reply(cur?`*𝐆𝐂 𝐒𝐭𝐚𝐭𝐮𝐬:*\n${cur}`:"𝐔𝐬𝐞: .𝐠𝐜𝐬𝐭𝐚𝐭𝐮𝐬 𝐖𝐞𝐥𝐜𝐨𝐦𝐞"); } gcStatusMap[from]=q; saveGC(); return reply(`*𝐒𝐚𝐯𝐞𝐝:* ${q}`); }
    if(command==='delgcstatus'){ delete gcStatusMap[from]; saveGC(); return reply("𝐃𝐞𝐥𝐞𝐭𝐞𝐝 ✅"); }
    if(command==='getgcstatus'){ const cur=gcStatusMap[from]; return reply(cur?`*𝐆𝐂 𝐒𝐭𝐚𝐭𝐮𝐬:*\n${cur}`:"𝐍𝐨 𝐬𝐭𝐚𝐭𝐮𝐬 𝐬𝐞𝐭"); }
    if(command==='tagall'){ if(!isGroup) return reply("𝐆𝐫𝐨𝐮𝐩 𝐨𝐧𝐥𝐲"); const metadata=await sock.groupMetadata(from); const isAdmin=metadata.participants.filter(p=>p.admin).some(p=>p.id===senderJid)||isMod(senderJid); if(!isAdmin) return reply("𝐀𝐝𝐦𝐢𝐧𝐬 𝐨𝐧𝐥𝐲"); const gcStat=gcStatusMap[from]?`𝐆𝐫𝐨𝐮𝐩 𝐒𝐭𝐚𝐭𝐮𝐬: ${gcStatusMap[from]}\n\n`:''; let text=`${q?`${q}\n\n`:''}${gcStat}╭━━━ *𝐓𝐀𝐆𝐀𝐋𝐋* ━━━╮\n`; metadata.participants.forEach(p=>{ text+=`│ ◦ @${p.id.split('@')[0]}\n`; }); text+=`╰━━━━━━━━━━━━╯`; return sock.sendMessage(from,{text:text,mentions:metadata.participants.map(p=>p.id)},{quoted:m}); }
    if(command==='jid'){ return reply(`*𝐘𝐨𝐮𝐫 𝐉𝐈𝐃:* ${senderJid}\n*𝐆𝐫𝐨𝐮𝐩 𝐉𝐈𝐃:* ${from}`); }
    if(command==='owner'){ return reply(`𝐎𝐰𝐧𝐞𝐫: 𝐰𝐚.𝐦𝐞/${OWNER}`); }
    if(['ai','gpt'].includes(command)){ if(!q) return reply("𝐔𝐬𝐞: .𝐚𝐢 𝐡𝐞𝐥𝐥𝐨"); const res=await kurumiAI(q); return reply(res); }
    if(command==='imagine'){ if(!q) return reply("𝐔𝐬𝐞: .𝐢𝐦𝐚𝐠𝐢𝐧𝐞 𝐜𝐚𝐭"); const url=`https://image.pollinations.ai/prompt/${encodeURIComponent(q)}?width=512&height=512&nologo=true`; return sock.sendMessage(from,{image:{url},caption:`*${q}*`},{quoted:m}); }
    if(command==='kick'){ if(!isGroup) return reply("𝐆𝐫𝐨𝐮𝐩 𝐨𝐧𝐥𝐲"); if(!mention) return reply("𝐓𝐚𝐠 𝐬𝐨𝐦𝐞𝐨𝐧𝐞"); await sock.groupParticipantsUpdate(from,[mention],'remove'); return reply("𝐊𝐢𝐜𝐤𝐞𝐝 ✅"); }
  });
}
startBot();