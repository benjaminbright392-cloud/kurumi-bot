// KURUMI V7 CLEAN - OPAY ONLY ON .DONATE + 30 EXTRA CMDS
require('http').createServer((_,res)=>res.end('KURUMI V7 ONLINE')).listen(process.env.PORT||10000,()=>console.log('PORT OPENED'));
require('dotenv').config();
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

const PREFIX='.'; const OWNER='2349025648773'; const MODS=['2349025648773','2347047506371']; const BOT_START=Date.now();
if(!fs.existsSync('./session')) fs.mkdirSync('./session',{recursive:true});
if(!fs.existsSync('./media/menu')) fs.mkdirSync('./media/menu',{recursive:true});
let antilinkGroups=new Set(); let antimentionGroups=new Set();
try{ if(fs.existsSync('./antilink.json')) antilinkGroups=new Set(JSON.parse(fs.readFileSync('./antilink.json'))); if(fs.existsSync('./antimention.json')) antimentionGroups=new Set(JSON.parse(fs.readFileSync('./antimention.json'))); }catch{}
function saveSettings(){ try{ fs.writeFileSync('./antilink.json',JSON.stringify([...antilinkGroups])); fs.writeFileSync('./antimention.json',JSON.stringify([...antimentionGroups])); }catch{} }
function isMod(jid){ if(!jid) return false; const num=jid.split('@')[0].split(':')[0].replace(/[^0-9]/g,''); return MODS.some(m=>num.includes(m)||m.includes(num)); }

async function kurumiAI(prompt){
  try{
    const key=process.env.GROQ_API_KEY;
    if(key){
      try{
        const res=await axios.post('https://api.groq.com/openai/v1/chat/completions',{model:"llama-3.3-70b-versatile",messages:[{role:"system",content:"You are Kurumi Tokisaki, cute elegant yandere, max 350 chars."},{role:"user",content:prompt}],max_tokens:350,temperature:0.85},{headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},timeout:15000});
        return res.data.choices[0].message.content.trim();
      }catch(e){ console.log("Groq fail"); }
    }
    const res=await axios.get(`https://text.pollinations.ai/${encodeURIComponent(`You are Kurumi Tokisaki, cute yandere, <350 chars. User: ${prompt}`)}?model=openai`,{timeout:20000});
    return (typeof res.data==='string'?res.data:JSON.stringify(res.data)).slice(0,[STRIPPED]
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
    if(connection==='open') console.log("✅ KURUMI V7 CLEAN ONLINE");
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
    const mention=m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]; const targetTag=mention?"@"+mention.split('@')[0]:"you"; const mentions=mention?[mention]:[];

    // MENU - NO OPAY HERE!
    if(command==='menu'||command==='help'||command==='bot'||command==='kurumimenu'){
      const menuText=`╭━━━ *KURUMI V7 ULTIMATE* ━━━╮
┃ Prefix: . | AI: ✅
┃ Owner: Benjamin Bright
╰━━━━━━━━━━━━━━━━━━━⭓

╭─ *BOT INFO* ─
│ .alive .alive2 .ping .runtime
│ .owner .mods .script .info .donate
╰──────────────

╭─ *ADMIN* 👑 ─
│ .kick @ .add 234xxx .promote @
│ .demote @ .tagall .hidetag
│ .close .open .link .revoke
│ .setname [name] .setdesc [text]
│ .antilink on/off .antimention on/off
│ .warn @ .warnings @ .clearwarn @
╰──────────────

╭─ *NEW* ✨ ─
│ .profile @ .whois @ .jid
│ .vv — save viewonce
│ .ss — screenshot link
│ .calc 2+2 .flip .roll
╰──────────────

╭─ *FUN & RATE* 🎲 ─
│ .gay @ .les @ .simp @ .beautiful @
│ .cute @ .hot @ .handsome @ .smart @
│ .ship @ .love @ .crush @ .kill @
│ .dice .coin .slot .8ball .roast
│ .joke .fact .quote .meme .truth .dare
│ .howgay .howhot .howcute .howsexy
╰──────────────

╭─ *ANIME* 💞 ─
│ .hug @ .kiss @ .slap @ .pat @
│ .cuddle @ .cry .waifu .neko .blush
│ .smile .wave .dance .poke .bonk
│ .highfive @ .handhold @ .nom @
╰──────────────

╭─ *AI & MEDIA* 🧠 ─
│ kurumi [ask] .ai [ask] .kurumi [ask]
│ .imagine [prompt] .s .steal .toimg
│ .toaudio .tomp3 .play [song]
╰──────────────

╭─ *MORE FUN* 🔥 ─
│ .emojimix 😂+😭 .sticker .attp [text]
│ .trt [lang] [text] .tts [text]
│ .weather [city] .time .date
╰──────────────

Type .donate to support 💖
_Ara ara~ Darling~_`;

      try{ return await reply(menuText); }catch{ return await reply(menuText); }
    }

    if(command==='alive'||command==='alive2'||command==='botstatus'){
      const up=Math.floor((Date.now()-BOT_START)/1000);
      return reply(`*KURUMI V7 IS ALIVE!* 💖\n\n⏱️ Uptime: ${Math.floor(up/3600)}h ${Math.floor((up%3600)/60)}m ${up%60}s\n🤖 Status: Online\n⚡ Prefix: ${PREFIX}\n👑 Owner: Benjamin\n\n_Ara ara~ I'm here for you darling~_`);
    }
    if(command==='info'||command==='botinfo'||command==='script'){ return reply(`*KURUMI V7 ULTIMATE*\n\nCreator: Benjamin Ojonugwa Bright\nBase: Baileys + Groq AI\nVersion: 7.0 Final\nFeatures: 150+ cmds\nAI: Groq Llama 3.3 + Fallback\n\nUse .menu for cmds\nUse .donate to support`); }
    if(command==='jid'){ return reply(`*Your JID:* ${senderJid}\n*Group JID:* ${from}\n*Is Group:* ${isGroup?'Yes':'No'}`); }
    if(command==='time'||command==='date'){ const now=new Date(); return reply(`📅 ${now.toLocaleDateString()}\n⏰ ${now.toLocaleTimeString()}\n🌍 Africa/Lagos`); }
    if(command==='calc'||command==='calculate'){ try{ const res=eval(q); return reply(`🧮 ${q} = *${res}*`); }catch{ return reply("Invalid calc. Use: .calc 2+2*5"); } }
    if(command==='flip'||command==='coin'){ return reply(`🪙 ${Math.random()>0.5?'Heads':'Tails'}`); }
    if(command==='roll'||command==='dice'){ return reply(`🎲 You rolled: ${Math.floor(Math.random()*6)+1}`); }
    if(command==='attp'){ if(!q) return reply("Use: .attp hello"); return sock.sendMessage(from,{sticker:{url:`https://api.akuari.my.id/canvas/attp?text=${encodeURIComponent(q)}`}},{quoted:m}); }
    if(command==='emojimix'){ if(!q.includes('+')) return reply("Use: .emojimix 😂+😭"); const [e1,e2]=q.split('+'); try{ const r=await axios.get(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&q=${e1}_${e2}&contentfilter=high&media_filter=minimal&component=proactive&collection=emoji_kitchen_v6`); return sock.sendMessage(from,{sticker:{url:r.data.results[0].media[0].tinygif.url}},{quoted:m}); }catch{ return reply("Mix failed, try other emojis"); } }
    if(command==='weather'){ if(!q) return reply("Use: .weather Lagos"); try{ const r=await axios.get(`https://wttr.in/${q}?format=3`); return reply(`🌤️ ${r.data}`); }catch{ return reply("Weather fail"); } }

    // EXTRA RATE CMDS
    const rateMap={gay:"Gay",les:"Lesbian",simp:"Simp",beautiful:"Beautiful",cute:"Cute",hot:"Hot",handsome:"Handsome",smart:"Smart",dumb:"Dumb",sexy:"Sexy",horny:"Horny",cool:"Cool",ugly:"Ugly",kind:"Kind",evil:"Evil",rich:"Rich",howgay:"Gay",howhot:"Hot",howcute:"Cute",howsexy:"Sexy"};
    if(rateMap[command]){ const p=Math.floor(Math.random()*101); return sock.sendMessage(from,{text:`*${rateMap[command]} Meter* 🔥\n${targetTag} is ${p}% ${rateMap[command]}! ${p>70?'😍':p>40?'😅':'😂'}`,mentions},{quoted:m}); }
    if(command==='ship'||command==='love'||command==='crush'){ const p=Math.floor(Math.random()*101); return sock.sendMessage(from,{text:`💞 *Love Check*\n${senderJid.split('@')[0]} ❤️ ${targetTag} = ${p}% ${p>80?'Soulmates! 💖':p>50?'Good match! 💕':'Maybe friends 😅'}`,mentions:[...(mention?[mention]:[]),senderJid]},{quoted:m}); }
    if(command==='kill'){ return sock.sendMessage(from,{text:`💀 @${senderJid.split('@')[0]} killed ${targetTag}! 🔪`,mentions:[...(mention?[mention]:[]),senderJid]},{quoted:m}); }
    if(command==='8ball'){ const ans=["Yes! 💖","No! 🙅","Maybe... 🤔","Ask later ⏳","Kurumi says YES darling~ 💕","Definitely not! 😂","100%! 🔥"]; return reply(`🎱 ${ans[Math.floor(Math.random()*ans.length)]}`); }
    if(command==='joke'){ try{ const j=await axios.get('https://official-joke-api.appspot.com/random_joke',{timeout:5000}); return reply(`😂 ${j.data.setup}\n*${j.data.punchline}*`); }catch{ return reply("Why did Kurumi blush? Because you looked at her! 💖"); } }
    if(command==='fact'){ const facts=["Kurumi can clone herself!","Kurumi loves you!","You're cute!","Cats sleep 70% of life","Honey never spoils"]; return reply(`🧠 Fact: ${facts[Math.floor(Math.random()*facts.length)]}`); }
    if(command==='quote'){ const quotes=["Love is time Kurumi gives you 💖","You're my darling~","Ara ara~","Time is precious"]; return reply(`💬 "${quotes[Math.floor(Math.random()*quotes.length)]}"`); }
    if(command==='meme'){ try{ const res=await axios.get('https://meme-api.com/gimme',{timeout:8000}); return sock.sendMessage(from,{image:{url:res.data.url},caption:res.data.title},{quoted:m}); }catch{ return reply('Meme API down'); } }
    if(command==='truth'){ const t=["What's your crush name?","Have you lied to your best friend?","Biggest secret?"]; return reply(`🤫 Truth: ${t[Math.floor(Math.random()*t.length)]}`); }
    if(command==='dare'){ const d=["Send 'I love you' to your crush","Change pfp to Kurumi for 1h","Do 10 pushups"]; return reply(`😈 Dare: ${d[Math.floor(Math.random()*d.length)]}`); }

    if(command==='ping'){ const start=Date.now(); await sock.sendMessage(from,{text:"*Pinging...*"}, {quoted:m}); const lat=Date.now()-start; const up=Math.floor((Date.now()-BOT_START)/1000); return reply(`🏓 Pong ${lat}ms | Uptime ${Math.floor(up/3600)}h ${Math.floor((up%3600)/60)}m`); }
    if(command==='runtime'||command==='uptime'){ const up=Math.floor((Date.now()-BOT_START)/1000); return reply(`⏱️ ${Math.floor(up/3600)}h ${Math.floor((up%3600)/60)}m ${up%60}s`); }
    if(command==='owner'){ return reply(`👑 Owner: wa.me/${OWNER}\nMod: wa.me/2347047506371\n\nType .donate to support 💖`); }
    if(command==='profile'||command==='whois'){ const targetJid=mention||senderJid; const num=targetJid.split('@')[0]; let pp=null; try{ pp=await sock.profilePictureUrl(targetJid,'image'); }catch{} let status="No bio"; try{ const st=await sock.fetchStatus(targetJid); status=st.status||status; }catch{} const info=`╭─ *PROFILE* 👤\n│ wa.me/${num}\n│ Bio: ${status.slice(0,120)}\n│ Mod: ${isMod(targetJid)?'Yes ✅':'No'}\n╰─ Kurumi`; if(pp) return sock.sendMessage(from,{image:{url:pp},caption:info},{quoted:m}); return reply(info); }
    if(command==='vv'||command==='viewonce'){ if(!quotedMsg) return reply("Reply to View Once with .vv"); const inner=(quotedMsg.viewOnceMessage||quotedMsg.viewOnceMessageV2||quotedMsg.viewOnceMessageV2Extension||quotedMsg).message||quotedMsg; try{ const buffer=await downloadMediaMessage({message:inner},'buffer',{}, {logger:pino(), reuploadRequest:sock.updateMediaMessage}); const type=Object.keys(inner)[0]; if(type.includes('image')) return sock.sendMessage(from,{image:buffer,caption:"✅ VV Saved"},{quoted:m}); if(type.includes('video')) return sock.sendMessage(from,{video:buffer,caption:"✅ VV Saved"},{quoted:m}); return reply("Saved!"); }catch(e){ return reply(`Failed VV: ${e.message}`); } }

    // DONATE - ONLY PLACE OPAY SHOWS!
    if(command==='donate'||command==='donations'||command==='support'||command==='opay'){
      const donatePath='./media/menu/donate.jpg';
      const caption=`╭━━ *DONATE - SUPPORT KURUMI* ━━╮\n┃ Thank you darling~ 💖\n╰━━━━━━━━━━━━━━━━⭓\n\n💚 *Opay Account*\n• Number: *7041971847*\n• Name: *Benjamin Ojonugwa Bright*\n• Bank: *Opay*\n\n🙏 Every ₦ keeps Kurumi online 24/7!\n💬 Proof: wa.me/${OWNER}\n\n_Ara ara~ Thank you! 💖_`;
      if(fs.existsSync(donatePath)) return sock.sendMessage(from,{image:fs.readFileSync(donatePath),caption},{quoted:m});
      return reply(caption);
    }

    if(command==='antilink'){ if(!isGroup) return reply("Group only"); const meta=await sock.groupMetadata(from); if(!meta.participants.filter(p=>p.admin).some(p=>p.id===senderJid) && !isMod(senderJid)) return reply("Admins only"); if(q==='on'){ antilinkGroups.add(from); saveSettings(); return reply("✅ Antilink ON"); } if(q==='off'){ antilinkGroups.delete(from); saveSettings(); return reply("❌ Antilink OFF"); } return reply(`Antilink: ${antilinkGroups.has(from)?'ON':'OFF'}`); }
    if(command==='antimention'||command==='antitag'){ if(!isGroup) return reply("Group only"); const meta=await sock.groupMetadata(from); if(!meta.participants.filter(p=>p.admin).some(p=>p.id===senderJid) && !isMod(senderJid)) return reply("Admins only"); if(q==='on'){ antimentionGroups.add(from); saveSettings(); return reply("✅ AntiMention ON"); } if(q==='off'){ antimentionGroups.delete(from); saveSettings(); return reply("❌ AntiMention OFF"); } return reply(`AntiMention: ${antimentionGroups.has(from)?'ON':'OFF'}`); }

    const animeCmds=['hug','kiss','slap','pat','cuddle','cry','waifu','neko','bully','bonk','blush','smile','wave','highfive','handhold','nom','happy','wink','poke','dance'];
    if(animeCmds.includes(command)){ try{ const r=await axios.get(`https://api.waifu.pics/sfw/${command}`,{timeout:8000}); return sock.sendMessage(from,{image:{url:r.data.url},caption:`*${command.toUpperCase()}* ${targetTag} 💖`},{quoted:m}); }catch{ return reply('Anime API down'); } }
    if(command==='s'||command==='sticker'){ const quoted=m.message.extendedTextMessage?.contextInfo?.quotedMessage; const mediaMsg=quoted?{message:quoted}:m; try{ const buf=await downloadMediaMessage(mediaMsg,'buffer',{}, {logger:pino(), reuploadRequest:sock.updateMediaMessage}); return sock.sendMessage(from,{sticker:buf},{quoted:m}); }catch{ return reply('Reply to image with .s'); } }
    if(command==='toimg'){ const quoted=m.message.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage; if(!quoted) return reply('Reply to sticker'); const buf=await downloadMediaMessage({message:{stickerMessage:quoted}},'buffer',{}, {logger:pino(), reuploadRequest:sock.updateMediaMessage}); return sock.sendMessage(from,{image:buf},{quoted:m}); }
    if(['ai','gpt'].includes(command)){ if(!q) return reply(`Use: .${command} hello`); const res=await kurumiAI(q); return reply(res); }
    if(command==='imagine'){ if(!q) return reply('Use: .imagine prompt'); const url=`https://image.pollinations.ai/prompt/${encodeURIComponent(q)}?width=768&height=1024&nologo=true&seed=${Math.floor(Math.random()*100000)}`; return sock.sendMessage(from,{image:{url},caption:`🎨 ${q}`},{quoted:m}); }

    const adminCmds=['kick','promote','demote','tagall','hidetag','link','add','close','open','revoke','setname','setdesc'];
    if(adminCmds.includes(command)){
      if(!isGroup) return reply("Group only");
      try{
        const metadata=await sock.groupMetadata(from); const admins=metadata.participants.filter(p=>p.admin).map(p=>p.id);
        const isAdmin=admins.includes(senderJid)||isMod(senderJid); if(!isAdmin) return reply("Admins only");
        if(command==='kick'){ if(!mention) return reply('Use: .kick @'); await sock.groupParticipantsUpdate(from,[mention],'remove'); return reply('✅ Kicked'); }
        if(command==='add'){ const num=q.replace(/[^0-9]/g,'')+'@s.whatsapp.net'; await sock.groupParticipantsUpdate(from,[num],'add'); return reply('✅ Added'); }
        if(command==='promote'||command==='demote'){ await sock.groupParticipantsUpdate(from,[mention],command); return reply(`✅ ${command}d`); }
        if(command==='tagall'){ let text=`📢 ${q}\n\n`; text+=metadata.participants.map((p,i)=>`${i+1}. @${p.id.split('@')[0]}`).join('\n'); return sock.sendMessage(from,{text,mentions:metadata.participants.map(p=>p.id)},{quoted:m}); }
        if(command==='hidetag') return sock.sendMessage(from,{text:q||'Hi',mentions:metadata.participants.map(p=>p.id)},{quoted:m});
        if(command==='close'){ await sock.groupSettingUpdate(from,'announcement'); return reply('🔒 Closed'); }
        if(command==='open'){ await sock.groupSettingUpdate(from,'not_announcement'); return reply('🔓 Opened'); }
        if(command==='link'){ const code=await sock.groupInviteCode(from); return reply('https://chat.whatsapp.com/'+code); }
        if(command==='revoke'){ const code=await sock.groupRevokeInvite(from); return reply('✅ Revoked'); }
        if(command==='setname'){ await sock.groupUpdateSubject(from,q); return reply('✅ Name changed'); }
        if(command==='setdesc'){ await sock.groupUpdateDescription(from,q); return reply('✅ Desc changed'); }
      }catch(e){ return reply(`Failed: ${e.message}`); }
    }
  });
}
startBot();