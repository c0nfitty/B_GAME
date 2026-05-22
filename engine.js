const DEV = true; // set to false for real gameplay
// ═══════════════════════════════════════════════════════════════
// GAME ENGINE
// ═══════════════════════════════════════════════════════════════
const PLATS=[
  {x:0,y:H-T,w:W,h:T,t:'g'},
  {x:70,y:H-95,w:110,h:T,t:'f'},{x:245,y:H-136,w:100,h:T,t:'f'},
  {x:415,y:H-95,w:110,h:T,t:'f'},{x:148,y:H-206,w:88,h:T,t:'f'},
  {x:358,y:H-212,w:88,h:T,t:'f'},
];

const G={
  running:false,player:null,curClass:null,
  projs:[],enemies:[],parts:[],floats:[],traps:[],
  stormTick:0,spawnTimer:0,spawnDelay:0,tick:0,
  wave:1,score:0,level:1,xp:0,xpNext:80,perkPts:0,
  owned:new Set(),ultCds:[0,0],unlockedUlts:new Set(),
  swingAnim:null,lassoAnim:null,shadowClones:[],smokeCloud:null,
};


let selectedClass='wizard';

function mkPlayer(cls){
  return{
    x:300,y:H-T-52,w:22,h:38,vx:0,vy:0,grounded:false,facing:1,
    hp:cls.hp,maxHp:cls.hp,
    res:cls.maxRes,maxRes:cls.maxRes,
    inv:0,jb:0,frame:0,ft:0,
    cds:[0,0,0,0],castAnim:0,castCol:'#fff',
    warcry:0,
    deflecting:0,
    stealthed:false,
    _shotCount:0,_stimBoost:0,_adrenaline:0,_ninjaHits:0,
    burn:0,
    wardCharges:0,wardRetribution:false,
    _rampage:0,
    holyAura:null,smiteBolt:null,
  };
}

// All enemy type pools — goblins are tier 0-4, others unlock at higher waves
const ENEMY_POOLS={
  goblin:[
    {nm:'Goblin Runt',w:16,h:22,hp:30,spd:2.0,dmg:7,xpv:18,score:35,col:'#5a7a3a',cap:'#8b3a20',eye:'#ff4',etype:'goblin'},
    {nm:'Goblin Scout',w:18,h:26,hp:42,spd:2.6,dmg:9,xpv:22,score:55,col:'#4a6830',cap:'#6a2010',eye:'#f80',etype:'goblin'},
    {nm:'Goblin Warrior',w:22,h:30,hp:70,spd:2.1,dmg:14,xpv:38,score:85,col:'#3a5820',cap:'#5a1800',eye:'#f00',etype:'goblin'},
    {nm:'Goblin Brute',w:28,h:36,hp:120,spd:1.6,dmg:22,xpv:58,score:140,col:'#2a4010',cap:'#3a0a00',eye:'#f00',etype:'goblin'},
    {nm:'Goblin Shaman',w:20,h:30,hp:55,spd:1.8,dmg:11,xpv:48,score:105,col:'#4a5a10',cap:'#2a4a2a',eye:'#0ff',shaman:true,etype:'goblin'},
  ],
  skeleton:[
    {nm:'Skeleton',w:18,h:30,hp:35,spd:1.8,dmg:8,xpv:25,score:60,col:'#d4cbb0',eye:'#ff4',etype:'undead',isUndead:true},
    {nm:'Bone Warrior',w:22,h:34,hp:65,spd:1.6,dmg:16,xpv:40,score:95,col:'#c8bf9a',eye:'#f80',etype:'undead',isUndead:true,armored:true},
    {nm:'Skeleton Mage',w:18,h:30,hp:50,spd:1.5,dmg:12,xpv:45,score:110,col:'#b8b090',eye:'#8ff',etype:'undead',isUndead:true,isMage:true},
  ],
  orc:[
    {nm:'Orc Grunt',w:26,h:34,hp:90,spd:1.7,dmg:18,xpv:45,score:100,col:'#3b6020',eye:'#f00',etype:'orc'},
    {nm:'Orc Berserker',w:28,h:36,hp:130,spd:2.2,dmg:25,xpv:60,score:150,col:'#2a5010',eye:'#f40',etype:'orc',berserk:true},
    {nm:'Orc Warchief',w:32,h:40,hp:220,spd:1.4,dmg:32,xpv:85,score:220,col:'#1a3a08',eye:'#f00',etype:'orc',chief:true},
  ],
  mummy:[
    {nm:'Mummy',w:20,h:32,hp:80,spd:1.2,dmg:14,xpv:35,score:80,col:'#c8a870',eye:'#f80',etype:'undead',isUndead:true,isMummy:true},
    {nm:'Ancient Mummy',w:24,h:36,hp:150,spd:1.0,dmg:22,xpv:55,score:130,col:'#b89050',eye:'#f00',etype:'undead',isUndead:true,isMummy:true,ancient:true},
    {nm:'Mummy Lord',w:26,h:38,hp:260,spd:0.9,dmg:28,xpv:80,score:200,col:'#a07840',eye:'#f5c842',etype:'undead',isUndead:true,isMummy:true,ancient:true,lord:true},
  ],
  ranged:[
    {nm:'Goblin Archer',w:18,h:26,hp:32,spd:1.2,dmg:10,xpv:28,score:65,col:'#4a6830',cap:'#6a2010',eye:'#ff4',etype:'goblin',isRanged:true,shootCd:0,shootRate:120,shootRange:280},
    {nm:'Orc Shaman',w:22,h:30,hp:70,spd:1.0,dmg:16,xpv:50,score:120,col:'#2a5010',eye:'#c080ff',etype:'orc',isRanged:true,isOrcShaman:true,shootCd:0,shootRate:150,shootRange:320},
    {nm:'Dark Wizard',w:20,h:32,hp:60,spd:0.9,dmg:20,xpv:55,score:140,col:'#2a1040',eye:'#cc44ff',etype:'goblin',isDarkWiz:true,isRanged:true,shootCd:0,shootRate:160,shootRange:350},
    {nm:'Skeleton Archer',w:18,h:30,hp:40,spd:1.4,dmg:12,xpv:32,score:80,col:'#d4cbb0',eye:'#ff4',etype:'undead',isUndead:true,isRanged:true,isSkelArcher:true,shootCd:0,shootRate:110,shootRange:300},
  ],
  troll:[
    {nm:'Cave Troll',w:34,h:44,hp:280,spd:1.1,dmg:30,xpv:90,score:220,col:'#4a7a3a',eye:'#ff0',etype:'troll',isTroll:true,regenerates:true},
    {nm:'Mountain Troll',w:38,h:50,hp:420,spd:0.9,dmg:40,xpv:130,score:320,col:'#3a6a2a',eye:'#f80',etype:'troll',isTroll:true,regenerates:true,boulder:true},
  ],
  vampire:[
    {nm:'Vampire',w:20,h:32,hp:65,spd:2.8,dmg:18,xpv:50,score:120,col:'#3a0828',eye:'#ff0044',etype:'undead',isUndead:true,isVampire:true,drains:true},
    {nm:'Vampire Lord',w:24,h:36,hp:140,spd:2.4,dmg:26,xpv:80,score:200,col:'#280618',eye:'#ff0044',etype:'undead',isUndead:true,isVampire:true,drains:true,lord:true},
  ],
  werewolf:[
    {nm:'Werewolf',w:26,h:38,hp:110,spd:3.2,dmg:22,xpv:65,score:150,col:'#5a4a2a',eye:'#ff8800',etype:'beast',isWerewolf:true,pounces:true},
    {nm:'Alpha Wolf',w:30,h:42,hp:200,spd:3.0,dmg:32,xpv:100,score:240,col:'#3a2a1a',eye:'#ff4400',etype:'beast',isWerewolf:true,pounces:true,alpha:true},
  ],
  spider:[
    {nm:'Giant Spider',w:28,h:22,hp:55,spd:2.6,dmg:12,xpv:35,score:80,col:'#1a1a0a',eye:'#ff4400',etype:'beast',isSpider:true},
    {nm:'Venom Spider',w:32,h:26,hp:80,spd:2.2,dmg:16,xpv:50,score:120,col:'#0a1a0a',eye:'#00ff44',etype:'beast',isSpider:true,venomous:true},
    {nm:'Spider Queen',w:38,h:30,hp:180,spd:1.8,dmg:22,xpv:80,score:200,col:'#0a0a1a',eye:'#ff44ff',etype:'beast',isSpider:true,venomous:true,queen:true,spawns:true},
  ],
  golem:[
    {nm:'Stone Golem',w:36,h:46,hp:350,spd:0.8,dmg:36,xpv:110,score:280,col:'#6a6050',eye:'#f80',etype:'golem',isGolem:true},
    {nm:'Lava Golem',w:40,h:50,hp:500,spd:0.7,dmg:45,xpv:160,score:400,col:'#8a3010',eye:'#ff4400',etype:'golem',isGolem:true,isLava:true},
  ],
};

function goblinVariant(tier){return ENEMY_POOLS.goblin[Math.min(tier,4)];}

function spawnEnemy(){
  const wave=G.wave;
  // Wave 1-2: goblins only. Wave 3+: mix in skeletons. Wave 5+: orcs. Wave 7+: mummies
  let pool=ENEMY_POOLS.goblin;
  const r=Math.random();
  if(wave>=14&&r<0.12) pool=ENEMY_POOLS.golem;
  else if(wave>=12&&r<0.18) pool=ENEMY_POOLS.troll;
  else if(wave>=10&&r<0.20) pool=ENEMY_POOLS.vampire;
  else if(wave>=9&&r<0.22)  pool=ENEMY_POOLS.werewolf;
  else if(wave>=8&&r<0.25)  pool=ENEMY_POOLS.spider;
  else if(wave>=7&&r<0.28)  pool=ENEMY_POOLS.mummy;
  else if(wave>=5&&r<0.38)  pool=ENEMY_POOLS.orc;
  else if(wave>=3&&r<0.50)  pool=ENEMY_POOLS.skeleton;
  else if(wave>=2&&r<0.30)  pool=ENEMY_POOLS.ranged;
  const poolTier=Math.min(Math.floor(wave/4),pool.length-1);
  const tier=(Math.random()<.18&&poolTier>0)?Math.min(poolTier+1,pool.length-1):poolTier;
  const v=pool[tier];
  const side=Math.random()<.5;
  const spawnX=side?Math.max(-20,0):Math.min(W+20,W-1);
  return{...v,maxHp:v.hp,x:spawnX,y:H-T-v.h,vx:0,vy:0,grounded:false,frozen:0,stunned:0,burn:0,dmgFlash:0,alive:true,fr:0,ft:0,tier};
}
function spawnGoblin(){return spawnEnemy();}

function spawnProj(g,x,y,vx,vy,r,col,dmg,type,extra){
  const p=Object.assign({x,y,vx,vy,radius:r,color:col,dmg,type,life:1,trail:[]},extra||{});
  g.projs.push(p);return p;
}

function hurtE(g, e, dmg, col) {
  if(!e.alive) return;
  e.hp -= dmg; e.dmgFlash = 10;
  const dir = (e.x + e.w/2) > (g.player.x + g.player.w/2) ? 1 : -1;
  emitP(g, e.x+e.w/2, e.y+e.h/2, {
    col: col||'#fff',
    n: 8,
    sp: 4,
    sz: 3,
    fade: 0.04,
    vxBias: dir * 4,
    vyBias: -2
  });
  if(e.hp <= 0) killE(g, e);
}





function killE(g,e){
  if(!e.alive)return;
  e.alive=false;g.score+=e.score;g.xp+=e.xpv;
  // Death Mark: marked kills explode
  if(e.marked&&g.owned.has('rv4')&&g.curClass==='ranger'){
    g.enemies.forEach(e2=>{if(e2.alive&&Math.hypot(e2.x-e.x,e2.y-e.y)<80){hurtE(g,e2,60,'#97c459');}});
    emitP(g,e.x+e.w/2,e.y+e.h/2,'#97c459',24,6);
    addFloat(g,'DEATH MARK!',e.x+e.w/2,e.y-15,'#97c459');
  }
  // REMOVE the emitP + tagging loop, replace with:
  emitP(g, e.x+e.w/2, e.y+e.h/2, { col:e.col, n:28, sp:4, ramp:RAMPS.fire, sz:10 });
  
  // then grab the last particle batch and tag them:
const start = Math.max(0, g.parts.length - 28);
for(let i = start; i < g.parts.length; i++){
  g.parts[i].ramp = RAMPS.fire;
  g.parts[i].sz   = 5 + Math.random() * 7;
}
  addFloat(g,'+'+e.score,e.x+e.w/2,e.y-12,'#f5c842');
  // Cowboy Grit passive: +1 ammo per kill
  if(g.curClass==='cowboy')g.player.res=Math.min(g.player.maxRes,g.player.res+1);
  // Gunslinger perk: full reload
  if(g.curClass==='cowboy'&&g.owned.has('cr4'))g.player.res=g.player.maxRes;
  // Knight rampage perk
  if(g.curClass==='knight'&&g.owned.has('kw4')&&g.player.warcry>0){g.player.hp=Math.min(g.player.maxHp,g.player.hp+5);addFloat(g,'+5',g.player.x+g.player.w/2,g.player.y-15,'#44ff44');}
  if(g.xp>=g.xpNext){
    g.level++;g.xp-=g.xpNext;g.xpNext=Math.round(g.xpNext*1.65);
    g.player.maxHp+=10;g.player.hp=Math.min(g.player.hp+25,g.player.maxHp);
    g.player.res=g.player.maxRes;
    g.perkPts++;
    document.getElementById('lv').textContent=g.level;
 setTimeout(()=>{
  emitP(G, G.player.x+G.player.w/2, G.player.y+G.player.h/2, {
    ramp: RAMPS.magic,
    col:  '#c8a9f0',
    n:    80,
    sp:   5,
    sz:   6,
    fade: 0.008,
    vxBias: 0,
    vyBias: -5
  });
}, 800);
    // showLvlBanner();if(g.perkPts>0)setTimeout(togglePerks,2200);
    showLvlBanner();
  }
  document.getElementById('sc').textContent=g.score;
}

function emitP(g, x, y, colOrOpts, n, sp) {
  let col, ramp, sz, fade, vxBias, vyBias;
  if(colOrOpts && typeof colOrOpts === 'object') {
    col    = colOrOpts.col    || '#fff';
    n      = colOrOpts.n      || 8;
    sp     = colOrOpts.sp     || 3;
    ramp   = colOrOpts.ramp   || null;
    sz     = colOrOpts.sz     || null;
    fade   = colOrOpts.fade   || 0.04;
    vxBias = colOrOpts.vxBias || 0;
    vyBias = colOrOpts.vyBias || 0;
  } else {
    col    = colOrOpts || '#fff';
    n      = n         || 8;
    sp     = sp        || 3;
    ramp   = null;
    sz     = null;
    fade   = 0.04;
    vxBias = 0;
    vyBias = 0;
  }
  for(let i = 0; i < n; i++) {
    const a = (Math.PI*2/n)*i + Math.random();
    const s = 0.5 + Math.random()*sp;
    const partSz = sz ? sz*0.5 + Math.random()*sz : 4 + Math.random()*6;
    g.parts.push({x, y, vx:Math.cos(a)*s+vxBias, vy:Math.sin(a)*s-1+vyBias, life:1, col, ramp, sz:partSz, fade});
  }
}

function rampCol(ramp, life) {
  if(!ramp) return '#fff';
  const t = 1 - life;
  const i = t * (ramp.length - 1);
  const lo = Math.floor(i), hi = Math.min(lo + 1, ramp.length - 1);
  const a = ramp[lo], b = ramp[hi], f = i - lo;
  const hr = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
  const [ar,ag,ab] = hr(a), [br,bg,bb] = hr(b);
  return `rgb(${~~(ar+(br-ar)*f)},${~~(ag+(bg-ag)*f)},${~~(ab+(bb-ab)*f)})`;
}

function addFloat(g,t,x,y,c){g.floats.push({txt:t,x,y,col:c,life:1,vy:-1.3});}

// ── CLASS SELECT UI ────────────────────────────────────────────
function buildClassSelect(){
  const grid=document.getElementById('cselGrid');grid.innerHTML='';
  Object.entries(CLASSES).forEach(([key,cls])=>{
    const sel=key===selectedClass;
    const card=document.createElement('div');
    card.className='ccard'+(sel?' selected':'');
    const hpBar=`<div class="ccard-hp">❤ ${cls.hp} HP</div>`;
    const resBar=`<div class="ccard-res" style="color:${cls.resCol||'#888'}">${cls.resName}</div>`;
    const passiveHtml=cls.passive
      ?`<div class="ccard-passive">★ ${cls.passive}</div>`:'';
    const abHtml=`<div class="ccard-ab">${cls.abilities.map(a=>`<span>${a.name}</span>`).join('')}</div>`;
    card.innerHTML=`
      <div class="ccard-left">
        <span class="ccard-icon">${cls.icon}</span>
        ${hpBar}${resBar}
      </div>
      <div class="ccard-right">
        <div class="ccard-name">${cls.name}</div>
        <div class="ccard-desc">${cls.desc}</div>
        ${passiveHtml}
        ${abHtml}
      </div>`;
    card.onclick=()=>{
      selectedClass=key;
      buildClassSelect();
      const el=document.getElementById('cselName');
      if(el)el.textContent=cls.name;
    };
    grid.appendChild(card);
  });
  // Sync footer label
  const el=document.getElementById('cselName');
  if(el)el.textContent=(CLASSES[selectedClass]||{name:'?'}).name;
}

function confirmClass(){
  G.curClass=selectedClass;
  document.getElementById('csel').style.display='none';
  const cls=CLASSES[G.curClass];
  document.getElementById('res2lbl').textContent=cls.resName;
  document.getElementById('mf').style.background=cls.resCol;
  document.getElementById('hint').textContent=`${cls.name} | WASD/arrows=move+jump | Z=${cls.abilities[0].name} X=${cls.abilities[1].name} C=${cls.abilities[2].name} V=${cls.abilities[3].name} | 6/7=ultimates | P=perks`;
  resetAndStart();
}

// ── PERK UI ────────────────────────────────────────────────────
function buildPerkUI(){
  if(!G.curClass)return;
  const cls=CLASSES[G.curClass];
  const cols=document.getElementById('pcols');cols.innerHTML='';
  cls.perks.forEach(tree=>{
    const col=document.createElement('div');col.className='pcol';
    const title=document.createElement('div');title.className='pctitle';
    title.style.cssText=`background:${tree.col}18;color:${tree.col};border:1px solid ${tree.col}33`;
    title.textContent=tree.tree;col.appendChild(title);
    tree.perks.forEach(p=>{
      const rm=p.req.every(r=>G.owned.has(r)),ow=G.owned.has(p.id),cb=!ow&&rm&&G.perkPts>0;
      const node=document.createElement('div');node.className='pnode '+(ow?'ow':cb?'av':'');
      node.innerHTML=`<div class="pnode-nm">${p.name}</div><div class="pnode-ds">${p.desc}</div><div class="pnode-ct">${ow?'✓':'1pt'}</div>`;
      if(cb)node.onclick=()=>buyPerk(p.id);col.appendChild(node);
    });cols.appendChild(col);
  });
  const ug=document.getElementById('ugrid');ug.innerHTML='';
  cls.ultimates.forEach((u,i)=>{
    const unlocked=G.unlockedUlts.has(u.id);
    const cd=G.ultCds[i];
    const canBuy=!unlocked&&G.perkPts>=2;
    const card=document.createElement('div');
    card.className='ucard '+(unlocked?'ul':'lk');
    card.style.cursor=canBuy?'pointer':'default';
    let statusLine='';
    if(unlocked){
      statusLine=cd>0
        ?`<div style="color:#888;font-size:8px">CD: ${Math.ceil(cd/60)}s remaining</div>`
        :`<div style="color:#97c459;font-size:8px">KEY [${i+1}] — READY</div>`;
    } else {
      statusLine=canBuy
        ?`<div style="color:#f5c842;font-size:8px;margin-top:3px">CLICK TO UNLOCK (2 pts)</div>`
        :`<div style="color:#555;font-size:8px;margin-top:3px">LOCKED — costs 2 perk pts</div>`;
    }
    card.innerHTML=`<div class="ucard-nm" style="color:${unlocked?u.col:'#555'}">${unlocked?'⚡ ':'🔒 '}${u.name}</div><div class="ucard-req" style="color:${unlocked?'#888':'#444'}">Key [${i+1}] · cd: ${Math.ceil(u.cd/60)}s</div><div class="ucard-ds">${u.desc}</div>${statusLine}`;
    if(canBuy)card.onclick=()=>buyUlt(u.id);
    ug.appendChild(card);
  });
  document.getElementById('ppel').textContent=G.perkPts;
}

function togglePerks(){
  const pov=document.getElementById('pov');
  const on=pov.classList.contains('on');
  pov.classList.toggle('on',!on);
  document.getElementById('ptitle').textContent=G.perkPts>0?`✦ LEVEL UP — ${G.perkPts} POINT${G.perkPts>1?'S':''} TO SPEND ✦`:'✦ SKILL TREE ✦';
  buildPerkUI();
  // only unpause and restore when CLOSING the perk screen
  if(on){
    G.running=true;
    G.player.inv=0;
    G.player.hp=Math.max(1,G.player.hp); // can't die during perk select
  }
}

function showLvlBanner(){
  const b=document.getElementById('lvlb');
  b.textContent='✦ LEVEL '+G.level+' — SKILL POINT EARNED ✦';
  b.style.display='block';
  G.running=false;
  G.player.inv=99999;
  if(G.player){
    emitP(G, G.player.x+G.player.w/2, G.player.y, {
      col:  '#c8a9f0',
      ramp: RAMPS.magic,
      n:    60,
      sp:   4,
      sz:   6,
      fade: 0.008,
      vyBias: -5
    });
  }
  // banner shows briefly, then perk screen opens
  setTimeout(()=>{
    b.style.display='none';
    if(G.perkPts>0) togglePerks();
  }, 1000);
}

function buyPerk(id){
  if(G.perkPts<=0)return;
  G.owned.add(id);G.perkPts--;buildPerkUI();
  if(G.perkPts===0)setTimeout(()=>togglePerks(),300);
}

function buyUlt(id){
  if(G.perkPts<2)return;
  G.unlockedUlts.add(id);G.perkPts-=2;
  buildPerkUI();
  if(G.perkPts===0)setTimeout(()=>togglePerks(),300);
}

// ── COLLISION ──────────────────────────────────────────────────


// ── COLLISION ──────────────────────────────────────────────────
function collide(obj){
  obj.grounded=false;
  for(const pl of PLATS){if(obj.x+obj.w>pl.x&&obj.x<pl.x+pl.w&&obj.y+obj.h>pl.y&&obj.y+obj.h<pl.y+pl.h+14&&obj.vy>=0){obj.y=pl.y-obj.h;obj.vy=0;obj.grounded=true;}}
}

// ── INPUT ──────────────────────────────────────────────────────
const KEYS={};
document.addEventListener('keydown',e=>{
  KEYS[e.code]=true;
  if(['Space','ArrowUp','ArrowLeft','ArrowRight','ArrowDown'].includes(e.code))e.preventDefault();
  if(e.code==='KeyP'){togglePerks();return;}
  if(document.getElementById('pov').classList.contains('on'))return;
  if(!G.running)return;
  if(e.code==='Digit1')tryCast(0);
  if(e.code==='Digit2')tryCast(1);
  if(e.code==='Digit3')tryCast(2);
  if(e.code==='Digit4')tryCast(3);
  if(e.code==='Digit6')fireUlt(0);
  if(e.code==='Digit7')fireUlt(1);
});
document.addEventListener('keyup',e=>{KEYS[e.code]=false;});
CV.addEventListener('click',()=>CV.focus());
document.getElementById('rb').addEventListener('click',()=>{
  if(!G.curClass){document.getElementById('csel').style.display='flex';return;}
  resetAndStart();
});

function tryCast(i){
  const p=G.player,cls=CLASSES[G.curClass];
  const ab=cls.abilities[i];
  if(p.cds[i]>0)return;
  // Check resource — skip deduction if cost is 0
  if(ab.cost>0){
    if(p.res<ab.cost)return;
    // Cowboy Grit: 15% chance free shot
    const freeShot=G.curClass==='cowboy'&&i===0&&Math.random()<0.15;
    if(!freeShot)p.res-=ab.cost;
    if(freeShot)addFloat(G,'FREE SHOT!',p.x+p.w/2,p.y-20,'#f5c842');
  }
  let actualCd=ab.cd;
  if(G.curClass==='wizard') actualCd=Math.round(ab.cd*0.85); // Arcane Mastery
  if(G.curClass==='cowboy'&&G.owned.has('cr3')&&i===0) actualCd=Math.max(5,ab.cd-5);
  if(G.curClass==='jedi'&&G.owned.has('fd1')&&i===3) actualCd=Math.max(20,ab.cd-15);
  if(G.curClass==='cleric'&&G.owned.has('cw2')&&i===2) actualCd=Math.max(30,ab.cd-20);
  if(G.curClass==='cyborg'&&G.owned.has('cm2_c')&&i===2) actualCd=Math.max(30,ab.cd-20);
  p.cds[i]=actualCd;
  p.castAnim=18;p.castCol=cls.col;
  ab.cast(p,G);
}

function fireUlt(slot){
  if(!G.running)return;
  const cls=CLASSES[G.curClass];
  if(slot>=cls.ultimates.length)return;
  const u=cls.ultimates[slot];
  if(!G.unlockedUlts.has(u.id)){addFloat(G,'LOCKED — spend perk pts',W/2,H/2-30,'#888');return;}
  if(G.ultCds[slot]>0)return;
  G.ultCds[slot]=u.cd;
  G.player.castAnim=40;G.player.castCol=u.col;
  emitP(G,G.player.x+G.player.w/2,G.player.y+G.player.h/2,u.col,30,6);
  u.exec(G.player,G);
  buildPerkUI();
}

// ── GAME INIT ──────────────────────────────────────────────────
function resetAndStart(){
  const cls=CLASSES[G.curClass];
  G.player=mkPlayer(cls);
  G.projs=[];G.enemies=[];G.parts=[];G.floats=[];G.traps=[];
  G.stormTick=0;G.spawnTimer=0;G.spawnDelay=0;G.tick=0;
  G.wave=1;G.score=0;G.level=1;G.xp=0;G.xpNext=80;G.perkPts=0;
  G.owned=new Set();G.ultCds=[0,0];G.unlockedUlts=new Set();
  G.swingAnim=null;G.lassoAnim=null;G.shadowClones=[];G.smokeCloud=null;G.holyAura=null;G.smiteBolt=null;G.dogmeats=[];G.pipScan=null;G.vatsSlow=0;G.slamRipple=null;G.crackedGround=null;
  G.running=true;
  document.getElementById('wv').textContent=1;
  document.getElementById('sc').textContent=0;
  document.getElementById('lv').textContent=1;
  document.getElementById('rb').textContent='[ Restart ]';
  // 5-second delay before first goblins appear
G.spawnDelay = DEV ? 0 : 300; // 300 ticks = 5 seconds at 60fps
if(DEV){ G.wave=5; document.getElementById('wv').textContent=5; }
  buildPerkUI();updateHUD();
}

// ── UPDATE ─────────────────────────────────────────────────────
function update(){
  if(!G.running||document.getElementById('pov').classList.contains('on'))return;
  G.tick++;const p=G.player,cls=CLASSES[G.curClass];
  if(p.inv>0)p.inv--;
  if(p.burn>0){p.burn--;if(G.tick%25===0&&p.burn>0){p.hp=Math.max(1,p.hp-2);addFloat(G,'-2',p.x+p.w/2,p.y-8,'#ff8800');}}
  if(p.warcry>0)p.warcry--;
  if(p._rampage>0){p._rampage--;}
  // Vault Dweller
  if(p._stimBoost>0){p._stimBoost--;}
  if(p._adrenaline>0){p._adrenaline--;if(G.tick%60===0)p.res=Math.min(p.maxRes,p.res+10);}
  if(G.vatsSlow>0){G.vatsSlow--;}
  // Gorilla: build rage when hit (handled in touch damage)
  // Cyborg passive: power regens faster + gains from being hit (handled below)
  if(G.curClass==='cyborg'&&G.tick%30===0&&p.res<p.maxRes) p.res=Math.min(p.maxRes,p.res+4);
  if(G.curClass==='gorilla'&&G.tick%40===0&&p.res<p.maxRes) p.res=Math.min(p.maxRes,p.res+2);
  // Jedi deflect tick
  if(p.deflecting>0){
    p.deflecting--;
    // Force Counter perk: damage nearby enemies each tick
    if(G.owned.has('fd3')&&G.tick%8===0){
      G.enemies.forEach(e=>{if(e.alive&&Math.hypot(e.x+e.w/2-p.x-p.w/2,e.y+e.h/2-p.y-p.h/2)<55){hurtE(G,e,6,'#00e5ff');}});
    }
  }
  // Resource regen
  if(G.curClass==='wizard'){if(G.tick%24===0&&p.res<p.maxRes)p.res=Math.min(p.maxRes,p.res+6+G.level);}  // 2x regen
  else if(G.curClass!=='cowboy'){if(G.tick%48===0&&p.res<p.maxRes)p.res=Math.min(p.maxRes,p.res+5+G.level);}
  p.cds=p.cds.map(c=>Math.max(0,c-1));
  G.ultCds=G.ultCds.map(c=>Math.max(0,c-1));
  if(p.castAnim>0)p.castAnim--;

  // Spawn goblins — with initial countdown delay
  if(G.spawnDelay>0){
    G.spawnDelay--;
  } else {
    G.spawnTimer++;
    const alive=G.enemies.filter(e=>e.alive).length;
    const interval=Math.max(45,140-G.wave*8);
    const maxG=Math.min(4+G.wave*2,24);
    if(G.spawnTimer>=interval&&alive<maxG){
      G.spawnTimer=0;
      const go=spawnEnemy();
      go.x=Math.random()<.5 ? 0 : W-go.w; // spawn at screen edge
      G.enemies.push(go);
      if(G.wave>=6&&Math.random()<.25){
        const go2=spawnEnemy();
        go2.x=Math.random()<.5 ? 0 : W-go2.w;
        G.enemies.push(go2);
      }
    }
  }
  const kills=G.enemies.filter(e=>!e.alive).length;
  const nw=Math.floor(kills/30)+1;
  if(nw>G.wave){G.wave=nw;document.getElementById('wv').textContent=G.wave;
    addFloat(G,'WAVE '+G.wave+'!',W/2,H/2-40,'#97c459');
    const warnMap={3:'⚔ SKELETONS RISE!',5:'💪 ORCS INCOMING!',7:'⚰ MUMMIES AWAKEN!',8:'🕷 SPIDERS EMERGE!',9:'🐺 WEREWOLVES HOWL!',10:'🧛 VAMPIRES STALK!',12:'👹 TROLLS MARCH!',14:'🗿 GOLEMS AWAKEN!'};
    if(warnMap[G.wave])setTimeout(()=>{if(G.running)addFloat(G,warnMap[G.wave],W/2,H/2-65,'#f5c842');},900);
    p.hp=Math.min(p.maxHp,p.hp+15);p.res=Math.min(p.maxRes,p.res+20);}
  // Storm
  if(G.stormTick>0){G.stormTick--;if(G.tick%14===0){const tgt=G.enemies.filter(e=>e.alive).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];if(tgt){tgt.stunned=20;hurtE(G,tgt,28,'#f5c842');addFloat(G,'-28',tgt.x,tgt.y-8,'#f5c842');}}}

  // Player move
  const left=KEYS['ArrowLeft']||KEYS['KeyA'],right=KEYS['ArrowRight']||KEYS['KeyD'],jump=KEYS['ArrowUp']||KEYS['KeyW']||KEYS['Space'];
  const ninjaBoost=G.curClass==='ninja'?1.15:1.0;
  const spd=(p.warcry>0?5.2:4.3)*ninjaBoost;
  if(left){p.vx=-spd;p.facing=-1;}else if(right){p.vx=spd;p.facing=1;}else p.vx*=.75;
  if(jump)p.jb=6;if(p.jb>0)p.jb--;
  if(p.grounded&&p.jb>0){p.vy=-13;p.grounded=false;p.jb=0;}
  p.vy+=GV;if(p.vy>16)p.vy=16;
  p.x+=p.vx;p.x=Math.max(0,Math.min(W-p.w,p.x));
  collide(p);p.y+=p.vy;
  if(p.y>H+80)p.hp=0;
  p.ft++;if(p.ft>7){p.frame=(p.frame+1)%4;p.ft=0;}
  if(G.enemies.length>200)G.enemies=G.enemies.filter(e=>e.alive);

  // Traps
  G.traps=G.traps.filter(trap=>{
    trap.t++;if(trap.armed>0){trap.armed--;return true;}
    const hit=G.enemies.some(e=>e.alive&&Math.hypot(e.x+e.w/2-trap.x,e.y+e.h/2-trap.y)<trap.radius*.6);
    if(hit){
      G.enemies.forEach(e=>{if(e.alive&&Math.hypot(e.x+e.w/2-trap.x,e.y+e.h/2-trap.y)<trap.radius){hurtE(G,e,trap.dmg,trap.col);e.stunned=60;}});
      emitP(G,trap.x,H-T-10,trap.col,30,6);addFloat(G,'BOOM!',trap.x,H-T-20,trap.col);
      return false;
    }
    return trap.t<600;
  });

  // Projectiles
  G.projs=G.projs.filter(pr=>{
    pr.trail.push({x:pr.x,y:pr.y});if(pr.trail.length>10)pr.trail.shift();
    pr.x+=pr.vx;pr.y+=pr.vy;
    // Saber throw: keep piercing on the way out AND back
    if(pr.isSaber){
      pr.returnTimer--;
      if(pr.returnTimer<=0){
        pr.vx*=-1;pr.vy*=-1;
        pr.isSaber=false; // stop reversing again
        pr.pierce=true;   // still pierces on return trip
        pr.returning=true;
      }
    }
    if(!pr.noGrav&&!pr.isMeteor&&pr.type!=='arrow'&&!pr.isSaber)pr.vy+=.07;
    if(pr.isBanana) pr.vy += 0.52;
    if(pr.type==='arrow'&&!pr.rainArrow){/* arrows travel flat */}
    if(pr.rainArrow){pr.vy+=.18;} // rain arrows accelerate downward
    pr.life-=.013;
    if(pr.x<-50||pr.x>W+50||pr.y>H+50||pr.life<=0)return false;

    // Dynamite — explodes on ground or wall
    if(pr.isDynamite&&pr.y>=H-T-pr.radius){
      G.enemies.forEach(e=>{if(e.alive&&Math.hypot(e.x+e.w/2-pr.x,e.y+e.h/2-pr.y)<pr.dRad){hurtE(G,e,pr.dmg,pr.color);e.stunned=60;}});
      emitP(G,pr.x,pr.y,pr.color,30,6);addFloat(G,'BOOM!',pr.x,pr.y-10,pr.color);
      return false;
    }

    let destroyProj=false;
    // Bananas and rocket fists have their own collision below — skip normal loop
    if(!pr.isBanana&&!pr.isRocketFist)
    for(const e of G.enemies){
      if(!e.alive)continue;
      if(e.marked&&e.markedTimer>0){e.markedTimer--;if(e.markedTimer<=0)e.marked=false;}
      const isArrow=(pr.type==='arrow');
      const isShuriken=(pr.type==='shuriken');
      const isBullet=(pr.type==='bullet'&&!pr.isEnemyProj);
      // Bullets and arrows use rect-based hit detection so they reliably connect
      const hitW=isArrow?e.w+8:isShuriken?e.w+6:isBullet?e.w+6:pr.radius+e.w/2;
      const hitH=isArrow?e.h+6:isShuriken?e.h+4:isBullet?e.h+4:pr.radius+e.w/2;
      const useRect=isArrow||isShuriken||isBullet;
      const dist=useRect
        ?Math.max(Math.abs(pr.x-(e.x+e.w/2))-hitW/2,0)+Math.max(Math.abs(pr.y-(e.y+e.h/2))-hitH/2,0)
        :Math.hypot(pr.x-(e.x+e.w/2),pr.y-(e.y+e.h/2));
      if(dist>(useRect?1:pr.radius+e.w/2))continue;
      let dmg=pr.dmg;
      if(pr.type==='arrow'&&e.marked)dmg=Math.round(dmg*(G.owned.has('rv2')?4:3));
      if(pr.type==='ice'){
  e.frozen=G.owned.has('wi1')?280:140;
  emitP(G, e.x+e.w/2, e.y+e.h/2, {
    col:'#aaddff', ramp:RAMPS.ice, n:20, sp:3, sz:5, fade:0.008, vyBias:-1
  });
}
      if(pr.type==='plasma'&&G.owned.has('cy4'))e.burn=150;
      if(pr.type==='fire'&&G.owned.has('wf2')&&!pr.isSplit)e.burn=180;
      // Wizard inferno split
      if(pr.type==='fire'&&G.owned.has('wf3')&&!pr.isSplit&&!pr.isMeteor){
        const ba=Math.atan2(pr.vy,pr.vx);
        [-0.45,0,0.45].forEach(sp=>{const a=ba+sp;spawnProj(G,pr.x,pr.y,Math.cos(a)*7,Math.sin(a)*7,8,'#ff8800',Math.round(dmg*.55),'fire',{isSplit:true});});
        emitP(G,pr.x,pr.y,'#ff8800',16,4);hurtE(G,e,dmg,pr.color);destroyProj=true;break;
      }
      // Meteor AoE
      if(pr.isMeteor){
        G.enemies.forEach(e2=>{if(e2.alive&&Math.hypot(e2.x-pr.x,e2.y-pr.y)<pr.radius+28)hurtE(G,e2,pr.dmg*.65,pr.color);});
        emitP(G,pr.x,pr.y,'#ff4400',40,8);destroyProj=true;break;
      }
      // Dynamite AoE
      if(pr.isDynamite){
        G.enemies.forEach(e2=>{if(e2.alive&&Math.hypot(e2.x+e2.w/2-pr.x,e2.y+e2.h/2-pr.y)<pr.dRad){hurtE(G,e2,pr.dmg,pr.color);e2.stunned=60;}});
        emitP(G,pr.x,pr.y,pr.color,30,6);addFloat(G,'BOOM!',pr.x,pr.y-10,pr.color);destroyProj=true;break;
      }
      hurtE(G,e,dmg,pr.color);
      // Shuriken poisons on perk
      if(pr.isShuriken&&G.owned.has('np2'))e.burn=120;
      if(!pr.pierce){destroyProj=true;break;}
    }
    // Banana: on hitting enemy, slip (stun) and optional burn
    if(!destroyProj&&pr.isBanana){
      for(const e of G.enemies){
        if(!e.alive)continue;
        const dist=Math.hypot(pr.x-(e.x+e.w/2),pr.y-(e.y+e.h/2));
        if(dist<pr.radius+e.w/2){
          hurtE(G,e,pr.dmg,'#f5c842');
          e.stunned=pr.slipDur||110;
          e.vx*=0.1; // slip: lose momentum
          if(pr.doBurn)e.burn=120;
          emitP(G,pr.x,pr.y,'#f5c842',12,4);
          addFloat(G,'SLIPPED!',e.x+e.w/2,e.y-10,'#f5c842');
          destroyProj=true;break;
        }
      }
      // Also explode on ground
      if(!destroyProj&&pr.y>=H-T-pr.radius){
        emitP(G,pr.x,pr.y,'#f5c842',10,3);
        destroyProj=true;
      }
    }
    // Rocket fist: explodes on hitting anything
    if(!destroyProj&&pr.isRocketFist){
      let fistHit=false;
      for(const e of G.enemies){
        if(!e.alive)continue;
        if(Math.hypot(pr.x-(e.x+e.w/2),pr.y-(e.y+e.h/2))<pr.radius+e.w/2){fistHit=true;break;}
      }
      if(fistHit||pr.y>=H-T){
        G.enemies.forEach(e=>{if(e.alive&&Math.hypot(e.x+e.w/2-pr.x,e.y+e.h/2-pr.y)<pr.dRad){hurtE(G,e,pr.dmg,'#ff8800');e.vx=(e.x-pr.x)/Math.max(1,Math.hypot(e.x-pr.x,e.y-pr.y))*14;e.vy=-8;e.stunned=60;if(G.owned.has('cx4'))e.burn=150;}});
        emitP(G,pr.x,pr.y,'#ff8800',28,7);addFloat(G,'BOOM!',pr.x,pr.y-10,'#ff8800');
        G.slamRipple={x:pr.x,y:pr.y,r:0,maxR:pr.dRad,t:20,col:'#ff8800'};
        destroyProj=true;
      }
    }
    // Enemy projectiles hit the player
    if(pr.isEnemyProj&&!destroyProj){
      if(Math.hypot(pr.x-(p.x+p.w/2),pr.y-(p.y+p.h/2))<pr.radius+p.w/2){
        let dmg=pr.dmg;
        if(G.curClass==='vault')dmg=Math.round(dmg*.85);
        if(G.curClass==='knight'){dmg=Math.round(dmg*.80);G.player.res=Math.min(G.player.maxRes,G.player.res+8);}
        if(G.curClass==='jedi')dmg=Math.round(dmg*.90);
        if(G.curClass==='gorilla'){G.player.res=Math.min(G.player.maxRes,G.player.res+5);}
        if(G.curClass==='cyborg'){G.player.res=Math.min(G.player.maxRes,G.player.res+8);}
        // Cleric ward
        if(p.wardCharges>0){
          p.wardCharges--;addFloat(G,'WARD! ('+p.wardCharges+' left)',p.x+p.w/2,p.y-28,'#88aaff');
          if(G.owned.has('cw3')){G.enemies.forEach(e2=>{if(e2.alive&&Math.hypot(e2.x-p.x,e2.y-p.y)<60)hurtE(G,e2,30,'#88aaff');});}
          if(G.owned.has('cw4')){/* reflect doesn't apply to ranged */}
          emitP(G,p.x+p.w/2,p.y+p.h/2,'#88aaff',10,3);dmg=0;
        }
        // Jedi deflect reflects enemy projectiles
        if(p.deflecting>0&&p.inv>0){
          pr.vx*=-1;pr.vy*=-1;pr.isEnemyProj=false;pr.dmg=dmg*2;
          addFloat(G,'REFLECTED!',p.x+p.w/2,p.y-28,'#00e5ff');
          return !destroyProj;
        }
        if(p.inv===0){
          p.hp-=dmg;p.inv=50;
          emitP(G,p.x+p.w/2,p.y+p.h/2,'#e24b4a',8,3);
          if(dmg>0)addFloat(G,'-'+dmg,p.x,p.y-8,'#e24b4a');
        }
        return false;
      }
    }
    return !destroyProj;
  });

  // Enemy AI
  G.enemies.forEach(e=>{
    if(!e.alive)return;
    if(e.dmgFlash>0)e.dmgFlash--;
    if(e.burn>0){e.burn--;if(G.tick%20===0)hurtE(G,e,3,'#e8820a');}
    // Troll regen: slowly recover HP
    if(e.regenerates&&e.hp>0&&e.hp<e.maxHp&&G.tick%60===0){e.hp=Math.min(e.maxHp,e.hp+8);e.dmgFlash=3;}
    // Werewolf pounce: if within range, leap at player occasionally
    if(e.pounces&&e.grounded&&Math.random()<0.008){
      const dx=G.player.x+G.player.w/2-(e.x+e.w/2);
      if(Math.abs(dx)<320){e.vx=dx>0?14:-14;e.vy=-12;}
    }
    // Spider venom: on contact applies extra burn
    // (handled in touch section below via venomous flag)
    // Golem stomp: periodic screen-shake style AoE
    if(e.isGolem&&e.grounded&&G.tick%180===0){
      G.enemies.forEach(()=>{}); // placeholder — AoE in touch section
      G.slamRipple={x:e.x+e.w/2,y:e.y+e.h,r:0,maxR:80,t:20,col:e.isLava?'#ff4400':'#888878'};
    }
    if(e.frozen>0){e.frozen--;return;}if(e.stunned>0){e.stunned--;return;}
    const dir=p.x>e.x?1:-1;
    let eSpd=e.spd;if(e.berserk&&e.hp<e.maxHp*.5)eSpd*=1.8;
    if(G.vatsSlow>0)eSpd*=0.3;
    // Jedi Force Sense: slow enemies within 120px
    if(G.curClass==='jedi'&&Math.hypot(e.x+e.w/2-(p.x+p.w/2),e.y+e.h/2-(p.y+p.h/2))<120)eSpd*=0.80;
    // Ranged enemies: keep distance and shoot
    if(e.isRanged){
      const distToP=Math.hypot(e.x+e.w/2-(p.x+p.w/2),e.y+e.h/2-(p.y+p.h/2));
      const prefDist=e.shootRange*.55;
      // Keep preferred distance
      if(distToP<prefDist*0.7) e.vx=(-dir)*eSpd; // too close, back off
      else if(distToP>prefDist*1.3) e.vx=dir*eSpd*0.7; // too far, close in
      else e.vx=0; // in sweet spot
      // Shoot at player
      if(e.shootCd>0) e.shootCd--;
      else if(distToP<e.shootRange&&e.grounded){
        e.shootCd=e.shootRate;
        const dx=p.x+p.w/2-(e.x+e.w/2),dy=p.y+p.h/2-(e.y+e.h/2);
        const len=Math.hypot(dx,dy)||1;
        const spd=e.isDarkWiz?7:e.isOrcShaman?6:8;
        const projCol=e.isDarkWiz?'#cc44ff':e.isOrcShaman?'#80ff40':e.isSkelArcher?'#d4cbb0':'#ff8800';
        const projType=e.isDarkWiz?'enemySpell':e.isOrcShaman?'enemySpell':'enemyArrow';
        const pSize=e.isDarkWiz?9:e.isOrcShaman?8:5;
        spawnProj(G,e.x+e.w/2,e.y+e.h*.4,dx/len*spd,dy/len*spd,pSize,projCol,e.dmg,projType,{isEnemyProj:true,noGrav:e.isDarkWiz||e.isOrcShaman});
        emitP(G,e.x+e.w/2,e.y+e.h*.4,projCol,6,2);
      }
    } else {
      e.vx=e.shaman&&Math.abs(e.x-p.x)<130?eSpd*(-dir):eSpd*dir;
    }
    e.vy+=GV;if(e.vy>16)e.vy=16;e.x+=e.vx;collide(e);e.y+=e.vy;
    e.x=Math.max(-85,Math.min(W+85,e.x));
    e.ft++;if(e.ft>8){e.fr=(e.fr+1)%4;e.ft=0;}
    if(e.grounded&&Math.random()<.012&&!e.isRanged)e.vy=-10;
    const dr=G.owned.has('kb4')?.7:1;
    if(p.inv===0&&Math.abs(e.x+e.w/2-(p.x+p.w/2))<(e.w+p.w)/2&&Math.abs(e.y+e.h/2-(p.y+p.h/2))<(e.h+p.h)/2){
      let actualDmg=Math.round(e.dmg*dr);
      // Passive damage modifiers
      if(G.curClass==='vault')actualDmg=Math.round(actualDmg*.85);
      if(G.curClass==='knight'){actualDmg=Math.round(actualDmg*.80);p.res=Math.min(p.maxRes,p.res+8);} // Iron Will
      if(G.curClass==='jedi'){actualDmg=Math.round(actualDmg*.90);} // Force Sense
      if(G.curClass==='gorilla'){p.res=Math.min(p.maxRes,p.res+5);}
      if(G.curClass==='cyborg'){p.res=Math.min(p.maxRes,p.res+8);}
      // Jedi deflect
      if(p.deflecting>0){
        const reflectDmg=G.owned.has('fd4')?actualDmg*3:actualDmg;
        hurtE(G,e,reflectDmg,'#00e5ff');
        actualDmg=Math.round(actualDmg*0.2);
        addFloat(G,'DEFLECTED!',p.x+p.w/2,p.y-28,'#00e5ff');
      }
      // Cleric holy ward
      if(p.wardCharges>0){
        p.wardCharges--;
        addFloat(G,'WARD! ('+(p.wardCharges)+' left)',p.x+p.w/2,p.y-28,'#88aaff');
        if(p.wardRetribution||G.owned.has('cw3')){
          G.enemies.forEach(e2=>{if(e2.alive&&Math.hypot(e2.x-p.x,e2.y-p.y)<60)hurtE(G,e2,30,'#88aaff');});
        }
        if(G.owned.has('cw4')){hurtE(G,e,Math.round(actualDmg*.5),'#88aaff');}
        if(G.owned.has('cm4_c')){hurtE(G,e,Math.round(actualDmg*3),'#00e5ff');}
        emitP(G,p.x+p.w/2,p.y+p.h/2,'#88aaff',10,3);
        actualDmg=0;
      }
      p.hp-=actualDmg;p.inv=65;
const hitSize=Math.max(6, Math.min(30, actualDmg));
emitP(G, p.x+p.w/2, p.y+p.h/2, {
  col:  '#e24b4a',
  ramp: RAMPS.blood,
  n:    hitSize,
  sp:   4,
  sz:   4,
  fade: 0.025,
  vxBias: e.vx*0.5,
  vyBias: -2
});
      if(actualDmg>0)addFloat(G,'-'+actualDmg,p.x,p.y-8,'#e24b4a');
      // Vampire drain: heal self on hit
      if(e.drains&&actualDmg>0){e.hp=Math.min(e.maxHp,e.hp+Math.round(actualDmg*.5));addFloat(G,'♥'+Math.round(actualDmg*.5),e.x+e.w/2,e.y-10,'#ff0044');}
      // Spider venom: extra burn stack
      if(e.venomous)p.burn=(p.burn||0)+60;
    }
  });

  if(p.hp<=0)G.running=false;
G.parts=G.parts.filter(pt=>pt.life>0);G.parts.forEach(pt=>{pt.x+=pt.vx;pt.y+=pt.vy;pt.vy+=0.18;pt.vx*=0.91;pt.vy*=0.93;pt.life-=pt.fade;});
  G.floats=G.floats.filter(f=>f.life>0);G.floats.forEach(f=>{f.y+=f.vy;f.life-=.022;});
  if(G.swingAnim){G.swingAnim.t--;if(G.swingAnim.t<=0)G.swingAnim=null;}
  // Dogmeat update
  G.dogmeats=G.dogmeats.filter(dm=>{
    dm.t++;
    if(dm.biting){
      dm.biteT++;
      if(dm.target&&dm.target.alive){
        dm.target.stunned=10;dm.target.vx=0;
        // Bite damage every 20 ticks
        if(dm.biteT%20===0)hurtE(G,dm.target,Math.round(dm.dmg*.15),'#d4860a');
      }
      return dm.biteT<dm.holdDur&&(dm.target&&dm.target.alive);
    }
    // Chase target
    if(!dm.target||!dm.target.alive)return false;
    dm.tx=dm.target.x+dm.target.w/2;dm.ty=dm.target.y+dm.target.h/2;
    const dx=dm.tx-dm.x,dy=dm.ty-dm.y,dist=Math.hypot(dx,dy)||1;
    dm.x+=dx/dist*dm.spd;dm.y+=dy/dist*dm.spd;
    if(dist<18||dm.t>=dm.maxT){
      // Bite!
      dm.biting=true;dm.biteT=0;
      hurtE(G,dm.target,dm.dmg,'#d4860a');
      emitP(G,dm.target.x+dm.target.w/2,dm.target.y+dm.target.h/2,'#d4860a',14,4);
      addFloat(G,'BITE! -'+dm.dmg,dm.target.x+dm.target.w/2,dm.target.y-12,'#d4860a');
    }
    return true;
  });
  // Pip-Boy scan visual
  if(G.pipScan){G.pipScan.t--;G.pipScan.r=G.pipScan.r+(280-G.pipScan.r)*.2;if(G.pipScan.t<=0)G.pipScan=null;}
  // Smoke cloud
  if(G.smokeCloud){
    const sc=G.smokeCloud;
    const fade=Math.min(1,sc.timer/40)*Math.min(1,(sc.maxTimer-sc.timer)/20+.3);
    CX.save();
    CX.globalAlpha=fade*.35;
    CX.fillStyle='#888888';
    CX.beginPath();CX.arc(sc.x,sc.y,sc.radius,0,Math.PI*2);CX.fill();
    CX.globalAlpha=fade*.15;
    CX.fillStyle='#aaaaaa';
    CX.beginPath();CX.arc(sc.x,sc.y,sc.radius*.65,0,Math.PI*2);CX.fill();
    CX.globalAlpha=1;CX.restore();
  }
  // Dogmeat draw
  G.dogmeats.forEach(dm=>{
    CX.save();CX.translate(dm.x,dm.y);
    const leanAng=dm.biting?0:Math.atan2(dm.ty-dm.y,dm.tx-dm.x)*.3;
    CX.rotate(leanAng);
    // Dog body
    CX.fillStyle='#8b6030';CX.fillRect(-10,-8,20,12);
    CX.fillStyle='#7a5020';
    // Head
    CX.beginPath();CX.ellipse(10,-4,7,6,0,0,Math.PI*2);CX.fill();
    // Snout
    CX.fillStyle='#5a3010';CX.beginPath();CX.ellipse(16,-3,4,3,0,0,Math.PI*2);CX.fill();
    // Nose
    CX.fillStyle='#222';CX.beginPath();CX.arc(19,-3,1.5,0,Math.PI*2);CX.fill();
    // Eye
    CX.fillStyle='#1a0a00';CX.beginPath();CX.arc(9,-6,1.5,0,Math.PI*2);CX.fill();
    CX.fillStyle='#ff8800';CX.beginPath();CX.arc(9,-6,.8,0,Math.PI*2);CX.fill();
    // Ear
    CX.fillStyle='#5a3010';CX.beginPath();CX.moveTo(6,-8);CX.lineTo(2,-14);CX.lineTo(10,-10);CX.closePath();CX.fill();
    // Tail
    CX.strokeStyle='#8b6030';CX.lineWidth=3;
    CX.beginPath();CX.moveTo(-10,-2);CX.quadraticCurveTo(-16,-12,-12,-16);CX.stroke();
    // Legs (animated)
    const legAnim=dm.biting?0:Math.sin(dm.t*.4)*5;
    CX.fillStyle='#7a5020';
    CX.fillRect(-8,4,4,6+legAnim);CX.fillRect(-2,4,4,6-legAnim);
    CX.fillRect(4,4,4,6+legAnim);CX.fillRect(10,4,4,6-legAnim);
    // Bandana (red, Fallout style)
    CX.fillStyle='#cc2200';CX.beginPath();CX.moveTo(5,-9);CX.lineTo(14,-6);CX.lineTo(14,-4);CX.lineTo(5,-7);CX.closePath();CX.fill();
    if(dm.biting){CX.fillStyle='#ff4400';CX.globalAlpha=.5;CX.beginPath();CX.arc(16,-3,8,0,Math.PI*2);CX.fill();CX.globalAlpha=1;}
    CX.restore();
  });
  // Pip-Boy scan ring
  if(G.pipScan){
    CX.save();CX.globalAlpha=G.pipScan.t/40*.4;CX.strokeStyle='#00ffcc';CX.lineWidth=2;
    CX.beginPath();CX.arc(G.pipScan.x,G.pipScan.y,G.pipScan.r,0,Math.PI*2);CX.stroke();
    CX.globalAlpha=1;CX.restore();
  }
  // VATS overlay
  if(G.vatsSlow>0){
    CX.fillStyle=`rgba(0,255,200,${.03+Math.sin(G.tick*.1)*.01})`;CX.fillRect(0,0,W,H);
    CX.fillStyle='#00ffcc';CX.font="10px 'Courier New',monospace";CX.fillText('V.A.T.S: '+Math.ceil(G.vatsSlow/60)+'s',8,28);
  }
  // Slam ripple
  if(G.slamRipple){
    const sr=G.slamRipple;sr.t--;
    sr.r+=(sr.maxR-sr.r)*.25;
    CX.save();CX.globalAlpha=sr.t/(sr.t<10?sr.t:20)*.5;
    CX.strokeStyle=sr.col||'#8b5e3c';CX.lineWidth=3;
    CX.beginPath();CX.arc(sr.x,sr.y,sr.r,0,Math.PI*2);CX.stroke();
    CX.globalAlpha=1;CX.restore();
    if(sr.t<=0)G.slamRipple=null;
  }
  // Cracked ground slow zone
  if(G.crackedGround){
    const cg=G.crackedGround;cg.t--;
    CX.save();CX.globalAlpha=Math.min(cg.t/60,.4);
    CX.fillStyle='#5a3a1a';CX.fillRect(cg.x-cg.w/2,H-T-6,cg.w,6);
    CX.globalAlpha=1;CX.restore();
    if(cg.t<=0)G.crackedGround=null;
    // Slow enemies in cracked ground
    G.enemies.forEach(e=>{if(e.alive&&Math.abs(e.x+e.w/2-cg.x)<cg.w/2&&e.y+e.h>=H-T-8)e.vx*=0.5;});
  }
  // Holy aura pulse
  if(G.player&&G.player.holyAura){
    const ha=G.player.holyAura;ha.t--;ha.r=ha.maxR*(1-ha.t/30);
    CX.save();CX.globalAlpha=ha.t/30*.4;CX.strokeStyle='#f5c842';CX.lineWidth=3;
    CX.beginPath();CX.arc(ha.x,ha.y,ha.r,0,Math.PI*2);CX.stroke();
    CX.globalAlpha=1;CX.restore();
    if(ha.t<=0)G.player.holyAura=null;
  }
  // Smite bolt
  if(G.player&&G.player.smiteBolt){
    const sb=G.player.smiteBolt;sb.t--;
    CX.save();CX.globalAlpha=sb.t/20;CX.strokeStyle='#f5c842';CX.lineWidth=4;
    CX.beginPath();CX.moveTo(sb.x,0);CX.lineTo(sb.x,sb.y);CX.stroke();
    CX.strokeStyle='#fff';CX.lineWidth=1.5;CX.beginPath();CX.moveTo(sb.x,0);CX.lineTo(sb.x,sb.y);CX.stroke();
    CX.globalAlpha=1;CX.restore();
    if(sb.t<=0)G.player.smiteBolt=null;
  }
  // Shadow clones
  G.shadowClones.forEach(cl=>{
    CX.save();CX.globalAlpha=.55;
    CX.fillStyle='#444466';
    CX.fillRect(cl.x-8,cl.y-16,16,28);
    CX.fillStyle='#cc2222';CX.fillRect(cl.x-8,cl.y-6,16,3);
    CX.fillStyle='#ff4444';CX.beginPath();CX.arc(cl.x-3,cl.y-12,1.5,0,Math.PI*2);CX.fill();CX.beginPath();CX.arc(cl.x+3,cl.y-12,1.5,0,Math.PI*2);CX.fill();
    CX.globalAlpha=1;CX.restore();
  });
  if(G.lassoAnim){G.lassoAnim.t--;if(G.lassoAnim.t<=0)G.lassoAnim=null;}
  // Dogmeat draw
  G.dogmeats.forEach(dm=>{
    CX.save();CX.translate(dm.x,dm.y);
    const leanAng=dm.biting?0:Math.atan2(dm.ty-dm.y,dm.tx-dm.x)*.3;
    CX.rotate(leanAng);
    // Dog body
    CX.fillStyle='#8b6030';CX.fillRect(-10,-8,20,12);
    CX.fillStyle='#7a5020';
    // Head
    CX.beginPath();CX.ellipse(10,-4,7,6,0,0,Math.PI*2);CX.fill();
    // Snout
    CX.fillStyle='#5a3010';CX.beginPath();CX.ellipse(16,-3,4,3,0,0,Math.PI*2);CX.fill();
    // Nose
    CX.fillStyle='#222';CX.beginPath();CX.arc(19,-3,1.5,0,Math.PI*2);CX.fill();
    // Eye
    CX.fillStyle='#1a0a00';CX.beginPath();CX.arc(9,-6,1.5,0,Math.PI*2);CX.fill();
    CX.fillStyle='#ff8800';CX.beginPath();CX.arc(9,-6,.8,0,Math.PI*2);CX.fill();
    // Ear
    CX.fillStyle='#5a3010';CX.beginPath();CX.moveTo(6,-8);CX.lineTo(2,-14);CX.lineTo(10,-10);CX.closePath();CX.fill();
    // Tail
    CX.strokeStyle='#8b6030';CX.lineWidth=3;
    CX.beginPath();CX.moveTo(-10,-2);CX.quadraticCurveTo(-16,-12,-12,-16);CX.stroke();
    // Legs (animated)
    const legAnim=dm.biting?0:Math.sin(dm.t*.4)*5;
    CX.fillStyle='#7a5020';
    CX.fillRect(-8,4,4,6+legAnim);CX.fillRect(-2,4,4,6-legAnim);
    CX.fillRect(4,4,4,6+legAnim);CX.fillRect(10,4,4,6-legAnim);
    // Bandana (red, Fallout style)
    CX.fillStyle='#cc2200';CX.beginPath();CX.moveTo(5,-9);CX.lineTo(14,-6);CX.lineTo(14,-4);CX.lineTo(5,-7);CX.closePath();CX.fill();
    if(dm.biting){CX.fillStyle='#ff4400';CX.globalAlpha=.5;CX.beginPath();CX.arc(16,-3,8,0,Math.PI*2);CX.fill();CX.globalAlpha=1;}
    CX.restore();
  });
  // Pip-Boy scan ring
  if(G.pipScan){
    CX.save();CX.globalAlpha=G.pipScan.t/40*.4;CX.strokeStyle='#00ffcc';CX.lineWidth=2;
    CX.beginPath();CX.arc(G.pipScan.x,G.pipScan.y,G.pipScan.r,0,Math.PI*2);CX.stroke();
    CX.globalAlpha=1;CX.restore();
  }
  // VATS overlay
  if(G.vatsSlow>0){
    CX.fillStyle=`rgba(0,255,200,${.03+Math.sin(G.tick*.1)*.01})`;CX.fillRect(0,0,W,H);
    CX.fillStyle='#00ffcc';CX.font="10px 'Courier New',monospace";CX.fillText('V.A.T.S: '+Math.ceil(G.vatsSlow/60)+'s',8,28);
  }
  // Slam ripple
  if(G.slamRipple){
    const sr=G.slamRipple;sr.t--;
    sr.r+=(sr.maxR-sr.r)*.25;
    CX.save();CX.globalAlpha=sr.t/(sr.t<10?sr.t:20)*.5;
    CX.strokeStyle=sr.col||'#8b5e3c';CX.lineWidth=3;
    CX.beginPath();CX.arc(sr.x,sr.y,sr.r,0,Math.PI*2);CX.stroke();
    CX.globalAlpha=1;CX.restore();
    if(sr.t<=0)G.slamRipple=null;
  }
  // Cracked ground slow zone
  if(G.crackedGround){
    const cg=G.crackedGround;cg.t--;
    CX.save();CX.globalAlpha=Math.min(cg.t/60,.4);
    CX.fillStyle='#5a3a1a';CX.fillRect(cg.x-cg.w/2,H-T-6,cg.w,6);
    CX.globalAlpha=1;CX.restore();
    if(cg.t<=0)G.crackedGround=null;
    // Slow enemies in cracked ground
    G.enemies.forEach(e=>{if(e.alive&&Math.abs(e.x+e.w/2-cg.x)<cg.w/2&&e.y+e.h>=H-T-8)e.vx*=0.5;});
  }
  // Holy aura pulse
  if(G.player&&G.player.holyAura){
    const ha=G.player.holyAura;ha.t--;ha.r=ha.maxR*(1-ha.t/30);
    CX.save();CX.globalAlpha=ha.t/30*.4;CX.strokeStyle='#f5c842';CX.lineWidth=3;
    CX.beginPath();CX.arc(ha.x,ha.y,ha.r,0,Math.PI*2);CX.stroke();
    CX.globalAlpha=1;CX.restore();
    if(ha.t<=0)G.player.holyAura=null;
  }
  // Smite bolt
  if(G.player&&G.player.smiteBolt){
    const sb=G.player.smiteBolt;sb.t--;
    CX.save();CX.globalAlpha=sb.t/20;CX.strokeStyle='#f5c842';CX.lineWidth=4;
    CX.beginPath();CX.moveTo(sb.x,0);CX.lineTo(sb.x,sb.y);CX.stroke();
    CX.strokeStyle='#fff';CX.lineWidth=1.5;CX.beginPath();CX.moveTo(sb.x,0);CX.lineTo(sb.x,sb.y);CX.stroke();
    CX.globalAlpha=1;CX.restore();
    if(sb.t<=0)G.player.smiteBolt=null;
  }
  // Shadow clones
  G.shadowClones=G.shadowClones.filter(cl=>{
    cl.t++;
    // Move toward target
    const dx=cl.tx-cl.x,dy=cl.ty-cl.y,dist=Math.hypot(dx,dy)||1;
    cl.x+=dx/dist*cl.speed;cl.y+=dy/dist*cl.speed;
    if(cl.t>=cl.maxT||dist<12){
      if(cl.target&&cl.target.alive){
        hurtE(G,cl.target,cl.dmg,'#8888cc');
        if(G.owned.has('nc4')){
          G.enemies.forEach(e2=>{if(e2.alive&&e2!==cl.target&&Math.hypot(e2.x-cl.target.x,e2.y-cl.target.y)<60){hurtE(G,e2,Math.round(cl.dmg*.5),'#8888cc');}});
          emitP(G,cl.target.x+cl.target.w/2,cl.target.y+cl.target.h/2,'#8888cc',20,5);
          addFloat(G,'BOOM',cl.target.x+cl.target.w/2,cl.target.y-10,'#8888cc');
        } else emitP(G,cl.target.x+cl.target.w/2,cl.target.y+cl.target.h/2,'#8888cc',12,3);
      }
      return false;
    }
    return true;
  });
  // Smoke cloud
  if(G.smokeCloud){
    G.smokeCloud.timer--;
    if(G.smokeCloud.timer<=0)G.smokeCloud=null;
  }
  updateHUD();
}

// ── HUD ────────────────────────────────────────────────────────
function updateHUD(){
  const p=G.player;if(!p)return;
  const cls=CLASSES[G.curClass];
  document.getElementById('hf').style.width=Math.max(0,p.hp/p.maxHp*100)+'%';
  document.getElementById('mf').style.width=Math.max(0,p.res/p.maxRes*100)+'%';
  document.getElementById('xf').style.width=Math.min(100,G.xp/G.xpNext*100)+'%';
  const sb=document.getElementById('sb');sb.innerHTML='';
  cls.abilities.forEach((ab,i)=>{
    const cd=p.cds[i],rdy=cd===0;
    const d=document.createElement('div');d.className='ss'+(rdy?' rdy':'');
    d.innerHTML=`<div class="sk" style="color:${cls.col}">[${cls.abilityKeys[i]}]</div><div style="font-size:9px">${ab.name}</div><div>${cd>0?Math.ceil(cd/20)+'s':'ready'}</div>`;
    sb.appendChild(d);
  });
  cls.ultimates.forEach((u,i)=>{
    const unlocked=G.unlockedUlts.has(u.id);
    const cd=G.ultCds[i],rdy=cd===0&&unlocked;
    const d=document.createElement('div');
    d.className='ss ult'+(rdy?' rdy':'');
    if(!unlocked)d.style.opacity='0.45';
    const statusTxt=!unlocked?'LOCKED':cd>0?Math.ceil(cd/60)+'s':'READY';
    d.innerHTML=`<div class="sk" style="color:${u.col}">[${i+5}]</div><div style="font-size:9px">${u.name}</div><div style="font-size:9px">${unlocked?'':'🔒 '}${statusTxt}</div>`;
    sb.appendChild(d);
  });
}

// ── DRAWING ────────────────────────────────────────────────────
