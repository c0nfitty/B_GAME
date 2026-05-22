const CLASSES={

// ─────────────────────────────────────────────────────────────
wizard:{
  name:'Wizard',icon:'🧙',col:'#9d4edd',
  desc:'Arcane spellcaster. Masters of fire, ice, and lightning.',
  resName:'Mana',resCol:'#6a60e8',maxRes:100,
  hp:90,
  passive:'Arcane Mastery: Mana regenerates 2× faster. All spell cooldowns reduced by 15%.',
  abilityKeys:['1','2','3','4'],
  abilities:[
    {name:'Fireball',key:'1',cost:20,cd:40,desc:'Burning projectile. Splits with Inferno perk.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       if(has('wf4')){
         const tgt=G.enemies.filter(e=>e.alive).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
         const tx=tgt?tgt.x+tgt.w/2:p.x+p.facing*200;
         spawnProj(G,tx,-20,(Math.random()-.5)*.8,10,18,'#ff4400',130,'fire',{isMeteor:true});
         return;
       }
       const ox=p.x+(p.facing===1?p.w+3:-3),oy=p.y+12;
       spawnProj(G,ox,oy,p.facing*10,0,has('wf1')?17:10,'#e8820a',42,'fire',{});
     }},
    {name:'Ice Lance',key:'2',cost:15,cd:24,desc:'Freezes enemies. Blizzard fires 3 at once.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       if(has('wi4')){G.enemies.forEach(e=>{if(e.alive){e.frozen=has('wi1')?280:140;emitP(G,e.x+e.w/2,e.y,'#85b7eb',8,2);}});addFloat(G,'ABSOLUTE ZERO!',W/2,H/2,'#85b7eb');return;}
       const ox=p.x+(p.facing===1?p.w+3:-3),oy=p.y+12,vx=p.facing*14;
       if(has('wi3')){spawnProj(G,ox,oy,vx,-1.5,7,'#85b7eb',24,'ice',{});spawnProj(G,ox,oy,vx,0,7,'#85b7eb',24,'ice',{});spawnProj(G,ox,oy,vx,1.5,7,'#85b7eb',24,'ice',{});}
       else spawnProj(G,ox,oy,vx,0,7,'#85b7eb',24,'ice',{});
     }},
    {name:'Thunder',key:'3',cost:35,cd:78,desc:'Chain lightning hits multiple enemies.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       if(has('wt4')){G.stormTick=240;addFloat(G,'STORM!',W/2,80,'#f5c842');return;}
       const chain=3+(has('wt1')?2:0),bd=has('wt2')?120:80;
       const sorted=[...G.enemies].filter(e=>e.alive).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));
       sorted.slice(0,chain).forEach((e,i)=>{setTimeout(()=>{if(!e.alive)return;const d=Math.round(bd/(1+i*.3));e.stunned=60;hurtE(G,e,d,'#f5c842');addFloat(G,'-'+d,e.x+e.w/2,e.y-10,'#f5c842');if(has('wt3')&&!e.alive)emitP(G,e.x+e.w/2,e.y+e.h/2,'#f5c842',28,6);},i*100);});
       emitP(G,p.x+p.w/2,p.y-10,'#f5c842',25,5);
     }},
    {name:'Blink',key:'4',cost:18,cd:95,desc:'Teleport. Phase Burst damages arrival point.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       const dist=120*(has('wb1')?2:1);
       const dx=Math.max(0,Math.min(W-p.w,p.x+(p.facing===1?dist:-dist)));
       if(has('wb3')){const px=p.x+p.w/2,pdx=dx+p.w/2;G.enemies.forEach(e=>{if(!e.alive)return;const ex=e.x+e.w/2;if(ex>Math.min(px,pdx)&&ex<Math.max(px,pdx))hurtE(G,e,65,'#9d4edd');});}
       emitP(G,p.x+p.w/2,p.y+p.h/2,'#9d4edd',16,4);
       p.x=dx;
       if(has('wb2')){G.enemies.forEach(e=>{if(e.alive&&Math.hypot(e.x-p.x,e.y-p.y)<85)hurtE(G,e,55,'#9d4edd');});emitP(G,p.x+p.w/2,p.y+p.h/2,'#9d4edd',22,6);}
       if(has('wb4'))p.inv=180;
       emitP(G,p.x+p.w/2,p.y+p.h/2,'#9d4edd',16,4);
     }},
  ],
  perks:[
    {tree:'Fire',col:'#e8820a',perks:[
      {id:'wf1',name:'Wide Blast',desc:'Fireball radius +6',req:[]},
      {id:'wf2',name:'Scorch',desc:'Burn DoT 3/tick',req:['wf1']},
      {id:'wf3',name:'Inferno',desc:'Splits 3 on hit',req:['wf1']},
      {id:'wf4',name:'Meteor',desc:'Sky-drop AoE',req:['wf2','wf3']},
    ]},
    {tree:'Ice',col:'#85b7eb',perks:[
      {id:'wi1',name:'Deep Freeze',desc:'Freeze 2× longer',req:[]},
      {id:'wi2',name:'Shatter',desc:'2× dmg on frozen',req:['wi1']},
      {id:'wi3',name:'Blizzard',desc:'3 lances at once',req:['wi1']},
      {id:'wi4',name:'Absolute Zero',desc:'Freeze all',req:['wi2','wi3']},
    ]},
    {tree:'Thunder',col:'#f5c842',perks:[
      {id:'wt1',name:'Chain +2',desc:'+2 chain targets',req:[]},
      {id:'wt2',name:'Overload',desc:'+50% dmg',req:['wt1']},
      {id:'wt3',name:'Static',desc:'Stunned→explode',req:['wt1']},
      {id:'wt4',name:'Storm Call',desc:'4s storm',req:['wt2','wt3']},
    ]},
    {tree:'Blink',col:'#9d4edd',perks:[
      {id:'wb1',name:'Long Range',desc:'Distance ×2',req:[]},
      {id:'wb2',name:'Phase Burst',desc:'AoE at arrival',req:['wb1']},
      {id:'wb3',name:'Shadow Step',desc:'Damage path',req:['wb1']},
      {id:'wb4',name:'Void Walk',desc:'3s invincibility',req:['wb2','wb3']},
    ]},
  ],
  ultimates:[
    {id:'wu1',name:'ARCANE NOVA',req:[],cd:700,col:'#f5c842',
     desc:'All elements fire simultaneously. Freeze, meteors, and chain lightning.',
     exec(p,G){
       addFloat(G,'ARCANE NOVA!!!',W/2,H/2-50,'#f5c842');
       G.enemies.forEach(e=>{if(e.alive){e.frozen=180;emitP(G,e.x+e.w/2,e.y,'#85b7eb',8,2);}});
       for(let i=0;i<10;i++)setTimeout(()=>{if(!G.running)return;spawnProj(G,40+Math.random()*(W-80),-20,(Math.random()-.5)*2,9,18,'#ff4400',120,'fire',{isMeteor:true});},i*130);
       setTimeout(()=>{if(!G.running)return;G.enemies.forEach((e,i)=>setTimeout(()=>{if(e.alive){hurtE(G,e,150,'#f5c842');e.stunned=100;emitP(G,e.x+e.w/2,e.y,'#f5c842',20,5);}},i*40));},700);
       setTimeout(()=>{if(!G.running)return;p.hp=Math.min(p.maxHp,p.hp+40);G.stormTick=250;},1200);
     }},
    {id:'wu2',name:'GLACIAL WRATH',req:[],cd:550,col:'#40d0ff',
     desc:'Freeze ALL enemies, then shatter each with lightning.',
     exec(p,G){
       G.enemies.forEach(e=>{if(e.alive){e.frozen=300;emitP(G,e.x+e.w/2,e.y,'#85b7eb',10,3);}});
       addFloat(G,'FROZEN!',W/2,H/2,'#85b7eb');
       setTimeout(()=>{if(!G.running)return;G.enemies.forEach((e,i)=>setTimeout(()=>{if(!e.alive)return;e.frozen=0;hurtE(G,e,200,'#f5c842');e.stunned=60;emitP(G,e.x+e.w/2,e.y+e.h/2,'#f5c842',16,5);addFloat(G,'-200',e.x+e.w/2,e.y-10,'#40d0ff');},i*80));},1200);
     }},
  ],
  drawPlayer(p,cx,tick){
    cx.save();cx.translate(p.x+p.w/2,p.y+p.h/2);if(p.facing===-1)cx.scale(-1,1);
    const bob=p.grounded?Math.sin(p.frame*Math.PI/2)*1.5:0;
    cx.fillStyle='#2a1848';cx.beginPath();cx.moveTo(-p.w/2,-p.h/2+10+bob);cx.lineTo(-p.w/2+4,p.h/2+bob);cx.lineTo(p.w/2-4,p.h/2+bob);cx.lineTo(p.w/2,-p.h/2+10+bob);cx.closePath();cx.fill();cx.strokeStyle='#9d4edd';cx.lineWidth=1;cx.stroke();
    cx.fillStyle='#9d4edd';cx.fillRect(-p.w/2,-p.h/2+10+bob,p.w,2);
    cx.fillStyle='#e8c8a0';cx.beginPath();cx.ellipse(0,-p.h/2+4+bob,8,9,0,0,Math.PI*2);cx.fill();
    cx.fillStyle='#1a0a00';cx.beginPath();cx.arc(-3,-p.h/2+4+bob,1.5,0,Math.PI*2);cx.fill();cx.fillStyle='#9d4edd';cx.beginPath();cx.arc(-3,-p.h/2+4+bob,.8,0,Math.PI*2);cx.fill();
    cx.fillStyle='#1a0a00';cx.beginPath();cx.arc(3,-p.h/2+4+bob,1.5,0,Math.PI*2);cx.fill();cx.fillStyle='#9d4edd';cx.beginPath();cx.arc(3,-p.h/2+4+bob,.8,0,Math.PI*2);cx.fill();
    cx.fillStyle='#1a0d2e';cx.beginPath();cx.moveTo(-10,-p.h/2+bob);cx.lineTo(10,-p.h/2+bob);cx.lineTo(4,-p.h/2-22+bob);cx.lineTo(-2,-p.h/2-26+bob);cx.closePath();cx.fill();cx.strokeStyle='#9d4edd';cx.lineWidth=.8;cx.stroke();
    cx.fillStyle='#9d4edd';cx.fillRect(-11,-p.h/2+bob,22,4);
    cx.fillStyle='#f5c842';cx.font='8px sans-serif';cx.textAlign='center';cx.fillText('☽',0,-p.h/2-6+bob);cx.textAlign='left';
    const lob=p.grounded?Math.sin(p.frame*Math.PI/2)*4:0;
    cx.strokeStyle='#8b6914';cx.lineWidth=3;cx.beginPath();cx.moveTo(p.w/2-2,bob-2);cx.lineTo(p.w/2+14,bob-14+lob);cx.stroke();
    const cg=p.castAnim>0;if(cg){cx.globalAlpha=p.castAnim/20;cx.fillStyle=p.castCol;cx.beginPath();cx.arc(p.w/2+14,bob-14+lob,12,0,Math.PI*2);cx.fill();cx.globalAlpha=1;}
    cx.fillStyle=cg?p.castCol:'#85b7eb';cx.beginPath();cx.arc(p.w/2+14,bob-14+lob,5,0,Math.PI*2);cx.fill();
    cx.fillStyle='#fff';cx.beginPath();cx.arc(p.w/2+12,bob-16+lob,2,0,Math.PI*2);cx.fill();
    cx.restore();
  }
},

// ─────────────────────────────────────────────────────────────
knight:{
  name:'Knight',icon:'⚔️',col:'#c0c0c0',
  desc:'Heavy armour melee fighter. High HP, low range.',
  resName:'Stamina',resCol:'#22aa44',maxRes:100,
  hp:160,
  passive:'Iron Will: Take 20% less damage. Being hit builds Stamina (+8 per hit).',
  abilityKeys:['1','2','3','4'],
  abilities:[
    {name:'Sword Slash',key:'1',cost:15,cd:20,desc:'Wide melee arc hits all nearby enemies.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       const range=has('ks1')?80:55,dmg=has('ks2')?55:35;
       let hit=false;
       G.enemies.forEach(e=>{
         if(!e.alive)return;
         const dx=e.x+e.w/2-(p.x+p.w/2),dy=e.y+e.h/2-(p.y+p.h/2);
         if(Math.abs(dx)<range&&Math.abs(dy)<40&&(p.facing===1?dx>-10:dx<10)){
           hurtE(G,e,dmg,'#c8c0a8');hit=true;
           if(has('ks3'))e.stunned=60;
         }
       });
       emitP(G,p.x+(p.facing===1?p.w+20:-(p.w+20)),p.y+p.h/2,'#c8c0a8',hit?12:6,3);
       // Swing arc visual
       G.swingAnim={x:p.x+p.w/2,y:p.y+p.h/2,facing:p.facing,t:12,range};
     }},
    {name:'Shield Bash',key:'2',cost:20,cd:40,desc:'Knocks back and stuns nearby enemies.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       const range=has('kb1')?70:45;
       G.enemies.forEach(e=>{
         if(!e.alive)return;
         const dx=e.x+e.w/2-(p.x+p.w/2),dy=e.y+e.h/2-(p.y+p.h/2);
         if(Math.abs(dx)<range&&Math.abs(dy)<35){
           hurtE(G,e,20,'#8888ff');
           e.stunned=90;e.vx=(dx>0?1:-1)*8;
           emitP(G,e.x+e.w/2,e.y+e.h/2,'#8888ff',10,4);
         }
       });
       addFloat(G,'BASH!',p.x+p.w/2,p.y-20,'#8888ff');
       if(has('kb2'))p.inv=Math.max(p.inv,90);
     }},
    {name:'War Cry',key:'3',cost:25,cd:90,desc:'Boosts damage and speed for 4 seconds.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       p.warcry=has('kw1')?300:180;
       addFloat(G,'WAR CRY!',p.x+p.w/2,p.y-20,'#ff6600');
       emitP(G,p.x+p.w/2,p.y+p.h/2,'#ff6600',20,5);
       if(has('kw2')){p.hp=Math.min(p.maxHp,p.hp+20);addFloat(G,'+20 HP',p.x+p.w/2,p.y-35,'#44ff44');}
     }},
    {name:'Charge',key:'4',cost:30,cd:70,desc:'Dash forward, slamming the first enemy hit.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       const dist=has('kc1')?220:140;
       const dir=p.facing===1?1:-1;
       let stopped=false;
       for(let step=0;step<dist;step+=8){
         const nx=p.x+dir*step;
         if(nx<0||nx>W-p.w)break;
         const hit=G.enemies.find(e=>e.alive&&Math.abs(e.x+e.w/2-(nx+p.w/2))<30&&Math.abs(e.y+e.h/2-(p.y+p.h/2))<30);
         if(hit){
           const dmg=has('kc2')?90:60;
           p.x=nx;hurtE(G,hit,dmg,'#ff8800');hit.stunned=80;hit.vx=dir*10;
           emitP(G,hit.x+hit.w/2,hit.y+hit.h/2,'#ff8800',18,6);
           addFloat(G,'-'+dmg,hit.x+hit.w/2,hit.y-10,'#ff8800');
           stopped=true;break;
         }
       }
       if(!stopped)p.x=Math.max(0,Math.min(W-p.w,p.x+dir*dist));
       emitP(G,p.x+p.w/2,p.y+p.h,'#888',10,3);
     }},
  ],
  perks:[
    {tree:'Sword',col:'#c8c0a8',perks:[
      {id:'ks1',name:'Extended Reach',desc:'Slash range +25',req:[]},
      {id:'ks2',name:'Razor Edge',desc:'Slash dmg +20',req:['ks1']},
      {id:'ks3',name:'Staggering Blow',desc:'Slash stuns enemies',req:['ks1']},
      {id:'ks4',name:'Whirlwind',desc:'Slash hits ALL sides',req:['ks2','ks3']},
    ]},
    {tree:'Shield',col:'#8888ff',perks:[
      {id:'kb1',name:'Heavy Bash',desc:'Shield bash range +25',req:[]},
      {id:'kb2',name:'Bulwark',desc:'Bash grants 1.5s invincibility',req:['kb1']},
      {id:'kb3',name:'Riposte',desc:'After bash, next slash does 2× dmg',req:['kb1']},
      {id:'kb4',name:'Iron Wall',desc:'Reduce all damage by 30%',req:['kb2','kb3']},
    ]},
    {tree:'War Cry',col:'#ff6600',perks:[
      {id:'kw1',name:'Berserker',desc:'War Cry lasts 2× longer',req:[]},
      {id:'kw2',name:'Battle Heal',desc:'War Cry heals 20 HP',req:['kw1']},
      {id:'kw3',name:'Inspiring Shout',desc:'War Cry reduces all cooldowns',req:['kw1']},
      {id:'kw4',name:'Rampage',desc:'Kills during War Cry restore 5 HP',req:['kw2','kw3']},
    ]},
    {tree:'Charge',col:'#ff8800',perks:[
      {id:'kc1',name:'Full Gallop',desc:'Charge distance +80',req:[]},
      {id:'kc2',name:'Crushing Impact',desc:'Charge dmg +30',req:['kc1']},
      {id:'kc3',name:'Trample',desc:'Charge hits ALL enemies in path',req:['kc1']},
      {id:'kc4',name:'Juggernaut',desc:'Charge gives 2s invincibility',req:['kc2','kc3']},
    ]},
  ],
  ultimates:[
    {id:'ku1',name:'BLADE STORM',req:[],cd:600,col:'#c8c0a8',
     desc:'Spin rapidly, slashing all nearby enemies for 3 seconds.',
     exec(p,G){
       addFloat(G,'BLADE STORM!',p.x+p.w/2,p.y-40,'#c8c0a8');
       p.inv=180;
       let t=0;
       const iv=setInterval(()=>{
         if(!G.running){clearInterval(iv);return;}
         t+=20;if(t>3000){clearInterval(iv);return;}
         G.enemies.forEach(e=>{if(e.alive&&Math.hypot(e.x+e.w/2-p.x-p.w/2,e.y+e.h/2-p.y-p.h/2)<90){hurtE(G,e,22,'#c8c0a8');e.stunned=20;}});
         emitP(G,p.x+p.w/2,p.y+p.h/2,'#c8c0a8',6,4);
         G.swingAnim={x:p.x+p.w/2,y:p.y+p.h/2,facing:1,t:8,range:90,full:true};
       },20);
     }},
    {id:'ku2',name:'IRON FORTRESS',req:[],cd:700,col:'#8888ff',
     desc:'Become invincible for 5s, all enemies near you take damage.',
     exec(p,G){
       addFloat(G,'IRON FORTRESS!',p.x+p.w/2,p.y-40,'#8888ff');
       p.inv=300;
       let t=0;
       const iv=setInterval(()=>{
         if(!G.running){clearInterval(iv);return;}
         t+=20;if(t>5000){clearInterval(iv);return;}
         G.enemies.forEach(e=>{if(e.alive&&Math.hypot(e.x+e.w/2-p.x-p.w/2,e.y+e.h/2-p.y-p.h/2)<70){hurtE(G,e,12,'#8888ff');}});
       },20);
     }},
  ],
  drawPlayer(p,cx,tick){
    cx.save();cx.translate(p.x+p.w/2,p.y+p.h/2);if(p.facing===-1)cx.scale(-1,1);
    const bob=p.grounded?Math.sin(p.frame*Math.PI/2)*1.5:0;
    const wc=p.warcry>0;
    const bodyCol=wc?'#cc5500':'#5a5244';
    cx.fillStyle=bodyCol;cx.fillRect(-p.w/2,-p.h/2+6+bob,p.w,p.h-6);
    cx.strokeStyle='#8a8070';cx.lineWidth=1;cx.strokeRect(-p.w/2,-p.h/2+6+bob,p.w,p.h-6);
    // chest plate
    cx.fillStyle=wc?'#dd6600':'#6a6558';cx.fillRect(-p.w/2+1,-p.h/2+8+bob,p.w-2,14);
    cx.strokeStyle='#9a9088';cx.lineWidth=.6;cx.strokeRect(-p.w/2+1,-p.h/2+8+bob,p.w-2,14);
    // helmet
    cx.fillStyle=wc?'#bb4400':'#4a4538';cx.fillRect(-p.w/2+1,-p.h/2+bob,p.w-2,10);
    cx.strokeStyle='#6a6558';cx.lineWidth=1;cx.strokeRect(-p.w/2+1,-p.h/2+bob,p.w-2,10);
    // visor
    cx.fillStyle='#1a0a00';cx.fillRect(-p.w/2+3,-p.h/2+3+bob,p.w-6,5);
    cx.fillStyle='rgba(255,100,0,.3)';if(wc)cx.fillStyle='rgba(255,100,0,.6)';
    cx.fillRect(-p.w/2+4,-p.h/2+3+bob,p.w-8,5);
    // legs
    const lob=p.grounded?Math.sin(p.frame*Math.PI/2)*5:0;
    cx.fillStyle='#3a3528';cx.fillRect(-8,p.h/2-12+bob,6,12+lob);cx.fillRect(2,p.h/2-12+bob,6,12-lob);
    cx.strokeStyle='#5a5548';cx.lineWidth=.6;cx.strokeRect(-8,p.h/2-12+bob,6,12+lob);cx.strokeRect(2,p.h/2-12+bob,6,12-lob);
    // sword
    cx.strokeStyle='#c8c0a8';cx.lineWidth=2;cx.beginPath();cx.moveTo(p.w/2-1,bob-4);cx.lineTo(p.w/2+18,bob+10);cx.stroke();
    cx.strokeStyle='#8b6914';cx.lineWidth=3;cx.beginPath();cx.moveTo(p.w/2+4,bob);cx.lineTo(p.w/2+10,bob+5);cx.stroke();
    // shield
    cx.fillStyle=wc?'#cc3300':'#3a3070';
    const shpts=[[-p.w/2-2,bob-8],[-p.w/2-12,bob-6],[-p.w/2-14,bob+4],[-p.w/2-8,bob+10],[-p.w/2-2,bob+8]];
    cx.beginPath();shpts.forEach(([x,y],i)=>i?cx.lineTo(x,y):cx.moveTo(x,y));cx.closePath();cx.fill();
    cx.strokeStyle='#6060a0';cx.lineWidth=1;cx.stroke();
    cx.restore();
  }
},

// ─────────────────────────────────────────────────────────────
ranger:{
  name:'Ranger',icon:'🏹',col:'#97c459',
  desc:'Swift archer. Fast attacks, traps, and evasion.',
  resName:'Focus',resCol:'#44aa22',maxRes:100,
  hp:100,
  passive:'Eagle Eye: Arrows deal +25% damage and travel 20% faster. Traps arm instantly.',
  abilityKeys:['1','2','3','4'],
  abilities:[
    {name:'Arrow Shot',key:'1',cost:10,cd:18,desc:'Fast piercing arrow. Triple shot with Quiver perk.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       const ox=p.x+(p.facing===1?p.w+3:-3),oy=p.y+14;
       const eagleBoost=1.25; // Eagle Eye passive: +25% dmg, +20% speed
       const vx=p.facing*Math.round((has('ra1')?16:13)*1.2),dmg=Math.round((has('ra2')?38:28)*eagleBoost);
       if(has('ra3')){
         spawnProj(G,ox,oy,vx,-1.2,5,'#97c459',dmg,'arrow',{pierce:true});
         spawnProj(G,ox,oy,vx,0,5,'#97c459',dmg,'arrow',{pierce:true});
         spawnProj(G,ox,oy,vx,1.2,5,'#97c459',dmg,'arrow',{pierce:true});
       } else spawnProj(G,ox,oy,vx,0,5,'#97c459',dmg,'arrow',{pierce:has('ra4')});
     }},
    {name:'Explosive Trap',key:'2',cost:25,cd:55,desc:'Place a trap on the ground that explodes.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       const dmg=has('rt2')?120:70,radius=has('rt1')?60:40;
       const armDelay=G.curClass==='ranger'?0:80; // Eagle Eye: instant arm
       G.traps.push({x:p.x+p.w/2,y:H-T-6,radius,dmg,armed:armDelay,t:0,col:'#ff8800'});
       addFloat(G,'TRAP SET',p.x+p.w/2,p.y-20,'#ff8800');
     }},
    {name:'Evasive Roll',key:'3',cost:20,cd:45,desc:'Quick dodge roll with brief invincibility.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       const dist=has('re1')?120:80;
       p.x=Math.max(0,Math.min(W-p.w,p.x+(p.facing===1?dist:-dist)));
       p.inv=has('re2')?100:55;
       emitP(G,p.x+p.w/2,p.y+p.h/2,'#97c459',14,3);
       if(has('re3')){const ox2=p.x+(p.facing===1?-dist:dist)+p.w/2;G.enemies.forEach(e=>{if(e.alive&&Math.abs(e.x+e.w/2-ox2)<60)hurtE(G,e,30,'#97c459');});}
     }},
    {name:'Hawk Eye',key:'4',cost:30,cd:70,desc:'Mark the nearest goblin — all your arrows deal 3x dmg to it for 5s.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       // Find nearest enemy and mark it
       const tgt=G.enemies.filter(e=>e.alive).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
       if(!tgt){addFloat(G,'NO TARGET',p.x+p.w/2,p.y-20,'#888');return;}
       // Clear any existing marks
       G.enemies.forEach(e=>e.marked=false);
       tgt.marked=true;
       tgt.markedTimer=has('rv1')?360:200;
       addFloat(G,'MARKED!',tgt.x+tgt.w/2,tgt.y-20,'#97c459');
       emitP(G,tgt.x+tgt.w/2,tgt.y,'#97c459',12,3);
       if(has('rv3')){
         // With spread perk: mark 3 nearest enemies
         G.enemies.filter(e=>e.alive&&e!==tgt).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y)).slice(0,2).forEach(e=>{e.marked=true;e.markedTimer=has('rv1')?360:200;emitP(G,e.x+e.w/2,e.y,'#97c459',8,2);});
       }
     }},
  ],
  perks:[
    {tree:'Arrows',col:'#97c459',perks:[
      {id:'ra1',name:'Swift Arrows',desc:'Arrow speed +3',req:[]},
      {id:'ra2',name:'Broadheads',desc:'Arrow dmg +10',req:['ra1']},
      {id:'ra3',name:'Quiver',desc:'Fires 3 arrows at once',req:['ra1']},
      {id:'ra4',name:'Piercing',desc:'Arrows pierce all enemies',req:['ra2','ra3']},
    ]},
    {tree:'Traps',col:'#ff8800',perks:[
      {id:'rt1',name:'Wide Blast',desc:'Trap radius +20',req:[]},
      {id:'rt2',name:'High Explosive',desc:'Trap dmg +50',req:['rt1']},
      {id:'rt3',name:'Tripwire',desc:'Traps arm instantly',req:['rt1']},
      {id:'rt4',name:'Chain Reaction',desc:'Trap kills trigger nearby traps',req:['rt2','rt3']},
    ]},
    {tree:'Evasion',col:'#44cc88',perks:[
      {id:'re1',name:'Fleet Foot',desc:'Roll distance +40',req:[]},
      {id:'re2',name:'Nimble',desc:'Roll invincibility 1.7s',req:['re1']},
      {id:'re3',name:'Shadow Strike',desc:'Roll deals AoE at origin',req:['re1']},
      {id:'re4',name:'Ghost Step',desc:'3 charges of roll',req:['re2','re3']},
    ]},
    {tree:'Hawk Eye',col:'#ccaa44',perks:[
      {id:'rv1',name:'Long Mark',desc:'Mark lasts 2× longer',req:[]},
      {id:'rv2',name:'Penetrating',desc:'Marked enemy takes 4× dmg',req:['rv1']},
      {id:'rv3',name:'Multi-Mark',desc:'Mark 3 enemies at once',req:['rv1']},
      {id:'rv4',name:'Death Mark',desc:'Killing marked enemy explodes it',req:['rv2','rv3']},
    ]},
  ],
  ultimates:[
    {id:'ru1',name:'ARROW STORM',req:[],cd:650,col:'#97c459',
     desc:'20 arrows rain down across the entire arena for 4 seconds.',
     exec(p,G){
       addFloat(G,'ARROW STORM!',W/2,H/2-50,'#97c459');
       let count=0;const iv=setInterval(()=>{
         if(!G.running||count>=20){clearInterval(iv);return;}
         count++;
         const tx=40+Math.random()*(W-80);
         spawnProj(G,tx,-20,(Math.random()-.5)*0.5,9,8,'#97c459',55,'arrow',{rainArrow:true,noGrav:false});
       },200);
     }},
    {id:'ru2',name:'TRAP FIELD',req:[],cd:600,col:'#ff8800',
     desc:'Instantly place 6 traps across the arena.',
     exec(p,G){
       addFloat(G,'TRAP FIELD!',W/2,H/2-50,'#ff8800');
       for(let i=0;i<6;i++){
         G.traps.push({x:80+i*(W-160)/5,y:H-T-6,radius:55,dmg:90,armed:0,t:0,col:'#ff8800'});
       }
     }},
  ],
  drawPlayer(p,cx,tick){
    cx.save();cx.translate(p.x+p.w/2,p.y+p.h/2);if(p.facing===-1)cx.scale(-1,1);
    const bob=p.grounded?Math.sin(p.frame*Math.PI/2)*1.5:0;
    cx.fillStyle='#2a4010';cx.fillRect(-p.w/2+2,-p.h/2+10+bob,p.w-4,p.h-10);
    cx.strokeStyle='#4a6830';cx.lineWidth=1;cx.stroke();
    // Hood
    cx.fillStyle='#1e3008';cx.fillRect(-p.w/2,-p.h/2+bob,p.w,12);
    cx.fillStyle='#e8c8a0';cx.beginPath();cx.ellipse(0,-p.h/2+6+bob,7,8,0,0,Math.PI*2);cx.fill();
    cx.fillStyle='#1a0a00';cx.beginPath();cx.arc(-2,-p.h/2+5+bob,1.5,0,Math.PI*2);cx.fill();cx.beginPath();cx.arc(3,-p.h/2+5+bob,1.5,0,Math.PI*2);cx.fill();
    // Quiver
    cx.fillStyle='#3a2010';cx.fillRect(-p.w/2-4,bob-8,6,14);
    cx.strokeStyle='#97c459';cx.lineWidth=.5;cx.beginPath();for(let qi=0;qi<3;qi++){cx.moveTo(-p.w/2-1,bob-6+qi*4);cx.lineTo(-p.w/2-5,bob-10+qi*4);}cx.stroke();
    // Bow
    const lob=p.grounded?Math.sin(p.frame*Math.PI/2)*3:0;
    cx.strokeStyle='#8b6914';cx.lineWidth=2;cx.beginPath();cx.arc(p.w/2+8,bob-6+lob,12,-.8,.8);cx.stroke();
    cx.strokeStyle='#e8e0d0';cx.lineWidth=.8;cx.beginPath();cx.moveTo(p.w/2+2,bob-14+lob);cx.lineTo(p.w/2+2,bob+2+lob);cx.stroke();
    const cg=p.castAnim>0;if(cg){cx.globalAlpha=p.castAnim/20;cx.fillStyle=p.castCol;cx.beginPath();cx.arc(p.w/2+8,bob-6+lob,10,0,Math.PI*2);cx.fill();cx.globalAlpha=1;}
    const lgs=p.grounded?Math.sin(p.frame*Math.PI/2)*5:0;
    cx.fillStyle='#1e3008';cx.fillRect(-7,p.h/2-12+bob,5,12+lgs);cx.fillRect(2,p.h/2-12+bob,5,12-lgs);
    cx.restore();
  }
},

// ─────────────────────────────────────────────────────────────
cowboy:{
  name:'Cowboy',icon:'🤠',col:'#d4860a',
  desc:'Six-gun outlaw. Fast reload, dynamite, and grit.',
  resName:'Ammo',resCol:'#d4860a',maxRes:6,
  hp:110,
  passive:'Grit: Killing an enemy restores 1 ammo. 15% chance any shot costs no ammo.',
  abilityKeys:['1','2','3','4'],
  abilities:[
    {name:'Quick Draw',key:'1',cost:1,cd:10,desc:'Rapid pistol shot. Fan the Hammer fires all 6.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       if(has('cg3')&&p.res>=p.maxRes){
         // Fan the hammer - fire all bullets
         for(let i=0;i<6;i++){
           const vy=(i-2.5)*.8;
           spawnProj(G,p.x+(p.facing===1?p.w+3:-3),p.y+14,p.facing*(has('cg1')?16:13),vy,5,'#f5c842',has('cg2')?45:30,'bullet',{});
         }
         p.res=0;addFloat(G,'FAN THE HAMMER!',p.x+p.w/2,p.y-25,'#f5c842');
       } else {
         spawnProj(G,p.x+(p.facing===1?p.w+3:-3),p.y+14,p.facing*(has('cg1')?16:13),(Math.random()-.5)*.5,5,'#f5c842',has('cg2')?38:25,'bullet',{});
       }
     }},
    {name:'Dynamite',key:'2',cost:0,cd:50,desc:'Throw dynamite that explodes on impact.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       const vx=p.facing*(has('cd1')?10:7),vy=-7;
       const dmg=has('cd2')?100:65,rad=has('cd3')?70:45;
       spawnProj(G,p.x+(p.facing===1?p.w:0),p.y+10,vx,vy,8,'#ff4400',dmg,'dynamite',{isDynamite:true,dRad:rad});
     }},
    {name:'Lasso',key:'3',cost:0,cd:40,desc:'Rope that roots and pulls the nearest enemy.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       const range=has('cl1')?220:150;
       const tgt=G.enemies.filter(e=>e.alive&&Math.abs(e.x+e.w/2-(p.x+p.w/2))<range).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];
       if(!tgt){addFloat(G,'MISSED!',p.x+p.w/2,p.y-20,'#888');return;}
       tgt.stunned=has('cl2')?180:100;
       // Pull toward player
       const pullDist=has('cl3')?60:30;
       const dir=(p.x>tgt.x?1:-1)*-1;
       tgt.x=Math.max(0,Math.min(W-tgt.w,tgt.x+dir*pullDist));
       hurtE(G,tgt,20,'#d4860a');
       addFloat(G,'LASSOED!',tgt.x+tgt.w/2,tgt.y-15,'#d4860a');
       G.lassoAnim={x1:p.x+p.w/2,y1:p.y+p.h/2,x2:tgt.x+tgt.w/2,y2:tgt.y+tgt.h/2,t:20};
     }},
    {name:'Reload',key:'4',cost:0,cd:30,desc:'Instantly reload full ammo. No cost.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       p.res=p.maxRes;p.cds[0]=0;
       addFloat(G,'RELOADED!',p.x+p.w/2,p.y-20,'#f5c842');
       emitP(G,p.x+p.w/2,p.y+p.h/2,'#f5c842',10,3);
       if(has('cr1'))p.inv=Math.max(p.inv,45);
     }},
  ],
  perks:[
    {tree:'Gun',col:'#f5c842',perks:[
      {id:'cg1',name:'Hot Barrel',desc:'Bullet speed +3',req:[]},
      {id:'cg2',name:'Hollow Points',desc:'Bullet dmg +13',req:['cg1']},
      {id:'cg3',name:'Fan the Hammer',desc:'Full ammo fires all 6',req:['cg1']},
      {id:'cg4',name:'Dead Eye',desc:'Every 6th shot crits for 3× dmg',req:['cg2','cg3']},
    ]},
    {tree:'Dynamite',col:'#ff4400',perks:[
      {id:'cd1',name:'Long Throw',desc:'Dynamite travels further',req:[]},
      {id:'cd2',name:'Black Powder',desc:'Dynamite dmg +35',req:['cd1']},
      {id:'cd3',name:'Wide Blast',desc:'Explosion radius +25',req:['cd1']},
      {id:'cd4',name:'Sticky',desc:'Dynamite sticks to enemies',req:['cd2','cd3']},
    ]},
    {tree:'Lasso',col:'#d4860a',perks:[
      {id:'cl1',name:'Long Rope',desc:'Lasso range +70',req:[]},
      {id:'cl2',name:'Hog Tie',desc:'Root lasts 3s',req:['cl1']},
      {id:'cl3',name:'Drag',desc:'Pull enemy much closer',req:['cl1']},
      {id:'cl4',name:'Gang Rope',desc:'Lasso hits 3 enemies at once',req:['cl2','cl3']},
    ]},
    {tree:'Reload',col:'#aaaaaa',perks:[
      {id:'cr1',name:'Speed Loader',desc:'Reload grants brief invincibility',req:[]},
      {id:'cr2',name:'Extra Cylinder',desc:'Max ammo +2',req:['cr1']},
      {id:'cr3',name:'Hair Trigger',desc:'Quick draw cooldown -5',req:['cr1']},
      {id:'cr4',name:'Gunslinger',desc:'Auto-reload after killing an enemy',req:['cr2','cr3']},
    ]},
  ],
  ultimates:[
    {id:'co1',name:'HIGH NOON',req:[],cd:600,col:'#f5c842',
     desc:'Time slows. Fire 12 shots instantly, each seeking an enemy.',
     exec(p,G){
       addFloat(G,'HIGH NOON!',W/2,H/2-50,'#f5c842');
       p.inv=120;p.res=p.maxRes;
       const sorted=[...G.enemies].filter(e=>e.alive).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));
       for(let i=0;i<12;i++){
         setTimeout(()=>{
           if(!G.running)return;
           const tgt=sorted[i%Math.max(1,sorted.length)];
           if(!tgt||!tgt.alive)return;
           const dx=tgt.x+tgt.w/2-(p.x+p.w/2),dy=tgt.y+tgt.h/2-(p.y+p.h/2);
           const len=Math.hypot(dx,dy)||1;
           spawnProj(G,p.x+p.w/2,p.y+p.h/2,dx/len*15,dy/len*15,5,'#f5c842',55,'bullet',{noGrav:true});
         },i*80);
       }
     }},
    {id:'co2',name:'DYNAMITE RAIN',req:[],cd:650,col:'#ff4400',
     desc:'8 sticks of dynamite rain down across the arena.',
     exec(p,G){
       addFloat(G,'DYNAMITE RAIN!',W/2,H/2-50,'#ff4400');
       for(let i=0;i<8;i++){
         setTimeout(()=>{
           if(!G.running)return;
           const tx=60+Math.random()*(W-120);
           spawnProj(G,tx,-20,0,9,10,'#ff4400',80,'dynamite',{isDynamite:true,dRad:60});
         },i*200);
       }
     }},
  ],
  drawPlayer(p,cx,tick){
    cx.save();cx.translate(p.x+p.w/2,p.y+p.h/2);if(p.facing===-1)cx.scale(-1,1);
    const bob=p.grounded?Math.sin(p.frame*Math.PI/2)*1.5:0;
    // Body
    cx.fillStyle='#3a2010';cx.fillRect(-p.w/2,-p.h/2+10+bob,p.w,p.h-10);
    cx.strokeStyle='#5a3820';cx.lineWidth=.8;cx.strokeRect(-p.w/2,-p.h/2+10+bob,p.w,p.h-10);
    // Vest
    cx.fillStyle='#1a0a00';cx.fillRect(-p.w/2+2,-p.h/2+12+bob,p.w-4,12);
    // Face
    cx.fillStyle='#e8c8a0';cx.beginPath();cx.ellipse(0,-p.h/2+5+bob,8,9,0,0,Math.PI*2);cx.fill();
    cx.fillStyle='#1a0a00';cx.beginPath();cx.arc(-3,-p.h/2+4+bob,1.5,0,Math.PI*2);cx.fill();cx.beginPath();cx.arc(3,-p.h/2+4+bob,1.5,0,Math.PI*2);cx.fill();
    // Moustache
    cx.strokeStyle='#3a1a00';cx.lineWidth=1.5;cx.beginPath();cx.arc(-2,-p.h/2+8+bob,2,Math.PI,0);cx.stroke();cx.beginPath();cx.arc(2,-p.h/2+8+bob,2,Math.PI,0);cx.stroke();
    // Hat
    cx.fillStyle='#1a0a00';cx.fillRect(-p.w/2-2,-p.h/2+bob,p.w+4,5);
    cx.fillRect(-p.w/2+2,-p.h/2-14+bob,p.w-4,16);
    cx.strokeStyle='#3a2010';cx.lineWidth=1;cx.strokeRect(-p.w/2+2,-p.h/2-14+bob,p.w-4,16);
    cx.strokeRect(-p.w/2-2,-p.h/2+bob,p.w+4,5);
    // Band
    cx.fillStyle='#d4860a';cx.fillRect(-p.w/2+2,-p.h/2+bob,p.w-4,3);
    // Legs
    const lob=p.grounded?Math.sin(p.frame*Math.PI/2)*5:0;
    cx.fillStyle='#2a1a00';cx.fillRect(-8,p.h/2-12+bob,6,12+lob);cx.fillRect(2,p.h/2-12+bob,6,12-lob);
    // Boots
    cx.fillStyle='#1a0800';cx.fillRect(-9,p.h/2-3+bob,8,7+lob);cx.fillRect(1,p.h/2-3+bob,8,7-lob);
    // Gun arm
    const gob=p.grounded?Math.sin(p.frame*Math.PI/2)*3:0;
    cx.fillStyle='#888';cx.fillRect(p.w/2-1,bob-3,10,5);
    cx.fillStyle='#555';cx.fillRect(p.w/2+6,bob-6,5,3);
    const cg2=p.castAnim>0;if(cg2){cx.globalAlpha=p.castAnim/20;cx.fillStyle=p.castCol;cx.beginPath();cx.arc(p.w/2+12,bob,10,0,Math.PI*2);cx.fill();cx.globalAlpha=1;}
    cx.restore();
  }
},

jedi:{
  name:'Jedi',icon:'⚔',col:'#00e5ff',
  desc:'Force-wielder. Deflect blows, hurl enemies, and ignite your lightsaber.',
  resName:'Force',resCol:'#00e5ff',maxRes:100,
  hp:120,
  passive:'Force Sense: Enemies within 120px move 20% slower. Take 10% less damage.',
  abilityKeys:['1','2','3','4'],
  abilities:[
    {name:'Saber Slash',key:'1',cost:12,cd:16,desc:'Fast lightsaber strike. Combo strike with Mastery perk.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       const range=has('js1')?75:52, dmg=has('js2')?50:32;
       let hitCount=0;
       G.enemies.forEach(e=>{
         if(!e.alive)return;
         const dx=e.x+e.w/2-(p.x+p.w/2), dy=e.y+e.h/2-(p.y+p.h/2);
         if(Math.hypot(dx,dy)<range&&(p.facing===1?dx>-10:dx<10)){
           hurtE(G,e,dmg,'#00e5ff');hitCount++;
           if(has('js3'))e.stunned=40;
         }
       });
       emitP(G,p.x+(p.facing===1?p.w+28:-28),p.y+p.h/2,'#00e5ff',hitCount?14:7,3);
       G.swingAnim={x:p.x+p.w/2,y:p.y+p.h/2,facing:p.facing,t:10,range,col:'#00e5ff'};
       // With Mastery perk: chain a second wider swing automatically
       if(has('js4')&&hitCount>0){
         setTimeout(()=>{
           if(!G.running)return;
           G.enemies.forEach(e=>{
             if(!e.alive)return;
             const dx=e.x+e.w/2-(p.x+p.w/2),dy=e.y+e.h/2-(p.y+p.h/2);
             if(Math.hypot(dx,dy)<range+20){hurtE(G,e,Math.round(dmg*.7),'#00e5ff');}
           });
           emitP(G,p.x+p.w/2,p.y+p.h/2,'#00e5ff',12,3);
         },180);
       }
     }},
    {name:'Force Push',key:'2',cost:22,cd:38,desc:'Blast all nearby enemies backward with the Force.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       const range=has('fp1')?160:110, dmg=has('fp2')?40:22;
       emitP(G,p.x+p.w/2,p.y+p.h/2,'#88ccff',28,7);
       if(has('fp4')){
         // Tornado perk: pull IN first, then blast outward after 0.5s
         G.enemies.forEach(e=>{
           if(!e.alive)return;
           const dx=p.x+p.w/2-(e.x+e.w/2), dy=p.y+p.h/2-(e.y+e.h/2);
           const dist=Math.hypot(dx,dy)||1;
           if(dist<range){e.vx=(dx/dist)*10;e.vy=(dy/dist)*10-2;e.stunned=30;}
         });
         addFloat(G,'TORNADO PULL!',p.x+p.w/2,p.y-28,'#88ccff');
         const snapX=p.x,snapY=p.y;
         setTimeout(()=>{
           if(!G.running)return;
           G.enemies.forEach(e=>{
             if(!e.alive)return;
             const dx=e.x+e.w/2-snapX-p.w/2, dy=e.y+e.h/2-snapY-p.h/2;
             const dist=Math.hypot(dx,dy)||1;
             if(dist<range*1.3){
               hurtE(G,e,dmg*2,'#88ccff');
               e.vx=(dx/dist)*18;e.vy=(dy/dist)*14-4;e.stunned=60;
               emitP(G,e.x+e.w/2,e.y+e.h/2,'#88ccff',12,5);
             }
           });
           emitP(G,snapX+p.w/2,snapY+p.h/2,'#88ccff',30,7);
           addFloat(G,'BLAST OUT!',snapX+p.w/2,snapY-20,'#88ccff');
         },500);
       } else {
         // Normal push
         G.enemies.forEach(e=>{
           if(!e.alive)return;
           const dx=e.x+e.w/2-(p.x+p.w/2), dy=e.y+e.h/2-(p.y+p.h/2);
           const dist=Math.hypot(dx,dy)||1;
           if(dist<range){
             hurtE(G,e,dmg,'#88ccff');
             const force=(1-dist/range)*(has('fp3')?18:12);
             e.vx=(dx/dist)*force;e.vy=(dy/dist)*force-4;
             e.stunned=50;
             emitP(G,e.x+e.w/2,e.y+e.h/2,'#88ccff',10,4);
           }
         });
         addFloat(G,'FORCE PUSH!',p.x+p.w/2,p.y-28,'#88ccff');
       }
     }},
    {name:'Saber Throw',key:'3',cost:28,cd:55,desc:'Hurl your lightsaber across the arena, hitting all enemies in its path.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       const dmg=has('st1')?55:36;
       const vx=p.facing*(has('st2')?16:12);
       // Thrown saber pierces all enemies
       const rt=has('st3')?38:22;
       spawnProj(G,
         p.x+(p.facing===1?p.w+4:-4), p.y+p.h*.35,
         vx, 0, 10, '#00e5ff', dmg, 'saber',
         {pierce:true, isSaber:true, noGrav:true, returnTimer:rt, facing:p.facing}
       );
       if(has('st4')){
         spawnProj(G,
           p.x+(p.facing===1?p.w+4:-4), p.y+p.h*.35,
           vx, -2, 10, '#00ff88', dmg, 'saber',
           {pierce:true, isSaber:true, noGrav:true, returnTimer:rt, facing:p.facing}
         );
       }
       addFloat(G,'SABER THROW!',p.x+p.w/2,p.y-24,'#00e5ff');
     }},
    {name:'Force Deflect',key:'4',cost:18,cd:50,desc:'Enter a deflect stance — reflect projectile damage back as Force damage.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       p.deflecting=has('fd2')?130:75;
       p.inv=has('fd2')?130:75;
       addFloat(G,'DEFLECTING!',p.x+p.w/2,p.y-24,'#00e5ff');
       emitP(G,p.x+p.w/2,p.y+p.h/2,'#00e5ff',18,4);
       // While deflecting, nearby enemies take reflected damage each tick
       // Handled in update loop via p.deflecting flag
     }},
  ],
  perks:[
    {tree:'Saber',col:'#00e5ff',perks:[
      {id:'js1',name:'Extended Blade',desc:'Slash range +23',req:[]},
      {id:'js2',name:'Plasma Edge',desc:'Slash dmg +18',req:['js1']},
      {id:'js3',name:'Stagger',desc:'Slash stuns enemies',req:['js1']},
      {id:'js4',name:'Blade Mastery',desc:'Auto-chain second swing on hit',req:['js2','js3']},
    ]},
    {tree:'Force Push',col:'#88ccff',perks:[
      {id:'fp1',name:'Wide Reach',desc:'Push range +50',req:[]},
      {id:'fp2',name:'Crushing Wave',desc:'Push dmg +18',req:['fp1']},
      {id:'fp3',name:'Shockwave',desc:'Push knockback +50%',req:['fp1']},
      {id:'fp4',name:'Force Tornado',desc:'Push pulls enemies IN first then blasts',req:['fp2','fp3']},
    ]},
    {tree:'Saber Throw',col:'#00ff88',perks:[
      {id:'st1',name:'Superheated',desc:'Throw dmg +19',req:[]},
      {id:'st2',name:'Fast Return',desc:'Saber speed +4',req:['st1']},
      {id:'st3',name:'Extended Arc',desc:'Saber travels further',req:['st1']},
      {id:'st4',name:'Twin Sabers',desc:'Throw two sabers at once',req:['st2','st3']},
    ]},
    {tree:'Deflect',col:'#aaddff',perks:[
      {id:'fd1',name:'Quick Stance',desc:'Deflect cooldown -15',req:[]},
      {id:'fd2',name:'Iron Stance',desc:'Deflect lasts 2× longer',req:['fd1']},
      {id:'fd3',name:'Force Counter',desc:'Deflect damages nearby enemies each tick',req:['fd1']},
      {id:'fd4',name:'Reflect Mastery',desc:'Deflect returns 3× damage to attacker',req:['fd2','fd3']},
    ]},
  ],
  ultimates:[
    {id:'ju1',name:'FORCE STORM',req:[],cd:650,col:'#00e5ff',
     desc:'Unleash a Force maelstrom — all enemies are lifted, spun, and slammed down.',
     exec(p,G){
       addFloat(G,'FORCE STORM!',W/2,H/2-50,'#00e5ff');
       // Lift all enemies
       G.enemies.forEach(e=>{
         if(!e.alive)return;
         e.stunned=200; e.vy=-12;
         emitP(G,e.x+e.w/2,e.y,'#00e5ff',10,3);
       });
       // Spin them (repeated hurt every 15 ticks for 3s)
       let t=0;
       const iv=setInterval(()=>{
         if(!G.running){clearInterval(iv);return;}
         t+=15;if(t>180){clearInterval(iv);return;}
         G.enemies.forEach(e=>{
           if(!e.alive)return;
           // Orbit around player
           const angle=Math.atan2(e.y-p.y,e.x-p.x)+(Math.PI*2/60)*t;
           const radius=120+Math.sin(t*.1)*30;
           e.x=p.x+p.w/2+Math.cos(angle)*radius-e.w/2;
           e.y=p.y+p.h/2+Math.sin(angle)*radius-e.h/2;
           e.vx=0;e.vy=0;
           hurtE(G,e,8,'#00e5ff');
         });
         emitP(G,p.x+p.w/2,p.y+p.h/2,'#00e5ff',5,5);
       },15);
       // Slam them all down after 3s
       setTimeout(()=>{
         if(!G.running)return;
         G.enemies.forEach(e=>{
           if(e.alive){e.vy=18;hurtE(G,e,80,'#88ccff');e.stunned=90;emitP(G,e.x+e.w/2,e.y,'#88ccff',14,5);}
         });
         addFloat(G,'SLAM!',W/2,H/2,'#88ccff');
       },3000);
     }},
    {id:'ju2',name:'ONE WITH THE FORCE',req:[],cd:700,col:'#ffffff',
     desc:'Become fully invincible for 6s. Your saber auto-strikes all enemies continuously.',
     exec(p,G){
       addFloat(G,'ONE WITH THE FORCE',W/2,H/2-50,'#fff');
       p.inv=360;
       let t=0;
       const iv=setInterval(()=>{
         if(!G.running){clearInterval(iv);return;}
         t+=18;if(t>360){clearInterval(iv);return;}
         // Auto-strike nearest 3 enemies
         const sorted=[...G.enemies].filter(e=>e.alive)
           .sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));
         sorted.slice(0,3).forEach(e=>{
           hurtE(G,e,30,'#00e5ff');
           emitP(G,(e.x+p.x)/2,(e.y+p.y)/2,'#00e5ff',6,3);
         });
         // Gentle pull of all enemies toward player
         G.enemies.forEach(e=>{
           if(!e.alive)return;
           const dx=p.x+p.w/2-(e.x+e.w/2), dy=p.y+p.h/2-(e.y+e.h/2);
           const d=Math.hypot(dx,dy)||1;
           e.vx+=dx/d*0.8; e.vy+=dy/d*0.4;
         });
         emitP(G,p.x+p.w/2,p.y+p.h/2,'#ffffff',4,6);
       },18);
     }},
  ],
  drawPlayer(p,cx,tick){
    cx.save();cx.translate(p.x+p.w/2,p.y+p.h/2);if(p.facing===-1)cx.scale(-1,1);
    const bob=p.grounded?Math.sin(p.frame*Math.PI/2)*1.5:0;
    const def=p.deflecting>0;
    const t=tick/15;

    // Robes
    cx.fillStyle=def?'#003344':'#1a1a2e';
    cx.beginPath();cx.moveTo(-p.w/2,-p.h/2+10+bob);cx.lineTo(-p.w/2+4,p.h/2+bob);cx.lineTo(p.w/2-4,p.h/2+bob);cx.lineTo(p.w/2,-p.h/2+10+bob);cx.closePath();cx.fill();
    cx.strokeStyle=def?'#00e5ff':'#444488';cx.lineWidth=1;cx.stroke();
    // Belt
    cx.fillStyle='#333';cx.fillRect(-p.w/2,-p.h/2+22+bob,p.w,4);
    cx.fillStyle='#888';cx.fillRect(-3,-p.h/2+22+bob,6,4);
    // Hood / head
    cx.fillStyle=def?'#004466':'#11112a';cx.fillRect(-p.w/2+1,-p.h/2+bob,p.w-2,13);
    cx.strokeStyle=def?'#00e5ff':'#555588';cx.lineWidth=.8;cx.strokeRect(-p.w/2+1,-p.h/2+bob,p.w-2,13);
    // Face
    cx.fillStyle='#e8c8a0';cx.beginPath();cx.ellipse(0,-p.h/2+6+bob,7,8,0,0,Math.PI*2);cx.fill();
    cx.fillStyle='#1a0a00';cx.beginPath();cx.arc(-2,-p.h/2+5+bob,1.5,0,Math.PI*2);cx.fill();cx.beginPath();cx.arc(3,-p.h/2+5+bob,1.5,0,Math.PI*2);cx.fill();
    // Force glow eyes when deflecting
    if(def){cx.fillStyle='#00e5ff';cx.beginPath();cx.arc(-2,-p.h/2+5+bob,1,0,Math.PI*2);cx.fill();cx.beginPath();cx.arc(3,-p.h/2+5+bob,1,0,Math.PI*2);cx.fill();}
    // Legs
    const lob=p.grounded?Math.sin(p.frame*Math.PI/2)*5:0;
    cx.fillStyle='#111128';cx.fillRect(-8,p.h/2-12+bob,6,12+lob);cx.fillRect(2,p.h/2-12+bob,6,12-lob);
    cx.strokeStyle='#333366';cx.lineWidth=.6;cx.strokeRect(-8,p.h/2-12+bob,6,12+lob);cx.strokeRect(2,p.h/2-12+bob,6,12-lob);
    // Lightsaber held in hand
    const saberLen=32, lob2=p.grounded?Math.sin(p.frame*Math.PI/2)*4:0;
    const saberCol=def?'#00ffff':p.castAnim>0?p.castCol:'#00e5ff';
    // Hilt
    cx.fillStyle='#888';cx.fillRect(p.w/2-1,bob-4,8,8);
    cx.strokeStyle='#555';cx.lineWidth=.8;cx.strokeRect(p.w/2-1,bob-4,8,8);
    cx.fillStyle='#555';cx.fillRect(p.w/2+3,bob-6,2,3);
    // Blade
    cx.globalAlpha=def?(.6+Math.sin(t)*.3):.85;
    cx.strokeStyle=saberCol;cx.lineWidth=4;
    cx.shadowColor=saberCol;cx.shadowBlur=10;
    cx.beginPath();cx.moveTo(p.w/2+7,bob-1+lob2);cx.lineTo(p.w/2+7+saberLen,bob-1+lob2);cx.stroke();
    cx.lineWidth=1.5;cx.strokeStyle='#fff';
    cx.beginPath();cx.moveTo(p.w/2+7,bob-1+lob2);cx.lineTo(p.w/2+7+saberLen,bob-1+lob2);cx.stroke();
    cx.shadowBlur=0;cx.globalAlpha=1;
    // Deflect shield aura
    if(def){
      cx.globalAlpha=.18+Math.sin(t*2)*.08;
      cx.fillStyle='#00e5ff';cx.beginPath();cx.arc(0,bob,28,0,Math.PI*2);cx.fill();
      cx.globalAlpha=1;
      cx.strokeStyle='#00e5ff';cx.lineWidth=1.5;cx.globalAlpha=.5+Math.sin(t*2)*.3;
      cx.beginPath();cx.arc(0,bob,28,0,Math.PI*2);cx.stroke();
      cx.globalAlpha=1;
    }
    cx.restore();
  }
},


ninja:{
  name:'Ninja',icon:'🥷',col:'#444466',
  desc:'Silent assassin. Shurikens, smoke bombs, poison, and shadow clones.',
  resName:'Ki',resCol:'#8888cc',maxRes:100,
  hp:95,
  passive:'Shadow Step: Every 5th shuriken is a guaranteed critical hit (2× damage). Move 15% faster.',
  abilityKeys:['1','2','3','4'],
  abilities:[
    {name:'Shuriken',key:'1',cost:10,cd:14,desc:'Fast piercing throwing star. Ricochets with Ricochet perk.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       p._ninjaHits=(p._ninjaHits||0)+1;
       const isShurikenCrit=p._ninjaHits>0&&p._ninjaHits%5===0; // Shadow Step passive
       const ox=p.x+(p.facing===1?p.w+2:-2), oy=p.y+14;
       const vx=p.facing*(has('ns1')?17:13);
       const dmg=isShurikenCrit?Math.round((has('ns2')?36:22)*2):has('ns2')?36:22;
       if(isShurikenCrit){addFloat(G,'CRIT SHURIKEN!',p.x+p.w/2,p.y-20,'#aaaacc');emitP(G,ox,oy,'#aaaacc',10,3);}
       const count=has('ns3')?3:1;
       if(count===3){
         spawnProj(G,ox,oy,vx,-1.5,6,'#aaaacc',dmg,'shuriken',{pierce:true,isShuriken:true,spin:0});
         spawnProj(G,ox,oy,vx,0,6,'#aaaacc',dmg,'shuriken',{pierce:true,isShuriken:true,spin:0});
         spawnProj(G,ox,oy,vx,1.5,6,'#aaaacc',dmg,'shuriken',{pierce:true,isShuriken:true,spin:0});
       } else {
         spawnProj(G,ox,oy,vx,0,6,'#aaaacc',dmg,'shuriken',{pierce:has('ns4'),isShuriken:true,spin:0,ricochet:has('ns4')?2:0});
       }
     }},
    {name:'Smoke Bomb',key:'2',cost:28,cd:55,desc:'Throw a smoke bomb — blinds nearby enemies and grants you stealth.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       const ox=p.x+(p.facing===1?p.w+20:-20), oy=p.y+p.h*.6;
       const radius=has('nb1')?90:60;
       const dur=has('nb2')?240:140;
       G.smokeCloud={x:ox,y:oy,radius,timer:dur+30,maxTimer:dur+30};
       // Stun and slow all enemies in radius
       G.enemies.forEach(e=>{
         if(!e.alive)return;
         if(Math.hypot(e.x+e.w/2-ox,e.y+e.h/2-oy)<radius){
           e.stunned=dur;e.vx=0;
           if(has('nb3')){e.burn=dur;} // Poison gas perk
         }
       });
       // Player goes briefly invisible
       p.inv=has('nb4')?200:100;
       p.stealthed=true;
       addFloat(G,'SMOKE BOMB!',ox,oy-20,'#8888cc');
       emitP(G,ox,oy,'#888',30,8);
       setTimeout(()=>{p.stealthed=false;},has('nb4')?3000:1500);
     }},
    {name:'Shadow Clone',key:'3',cost:32,cd:75,desc:'Summon a shadow clone that charges the nearest enemy.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       const cloneCount=has('nc1')?3:1;
       const dmg=has('nc2')?80:50;
       const range=has('nc3')?W:200;
       for(let ci=0;ci<cloneCount;ci++){
         const offset=(ci-Math.floor(cloneCount/2))*30;
         const cx2=Math.max(0,Math.min(W-20,p.x+offset));
         const sorted=[...G.enemies].filter(e=>e.alive&&Math.hypot(e.x-cx2,e.y-p.y)<range)
           .sort((a,b)=>Math.hypot(a.x-cx2,a.y-p.y)-Math.hypot(b.x-cx2,b.y-p.y));
         const tgt=sorted[ci%Math.max(1,sorted.length)];
         if(!tgt){addFloat(G,'NO TARGET',p.x+p.w/2,p.y-20,'#888');continue;}
         G.shadowClones.push({
           x:cx2,y:p.y,tx:tgt.x+tgt.w/2,ty:tgt.y+tgt.h/2,
           target:tgt,dmg,speed:8,t:0,maxT:60,
           col:'#444466'
         });
         emitP(G,cx2,p.y,'#8888cc',10,3);
       }
       addFloat(G,'CLONE!',p.x+p.w/2,p.y-24,'#8888cc');
     }},
    {name:'Death Strike',key:'4',cost:35,cd:65,desc:'Vanish and reappear behind the nearest enemy for a massive strike.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       const range=has('nd1')?W:280;
       const dmg=has('nd2')?150:90;
       const sorted=[...G.enemies].filter(e=>e.alive&&Math.hypot(e.x-p.x,e.y-p.y)<range)
         .sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));
       const tgt=sorted[0];
       if(!tgt){addFloat(G,'NO TARGET',p.x+p.w/2,p.y-20,'#888');return;}
       emitP(G,p.x+p.w/2,p.y+p.h/2,'#444466',14,4);
       // Teleport behind target
       p.x=Math.max(0,Math.min(W-p.w,tgt.x+(tgt.vx>0?tgt.w+4:-(p.w+4))));
       p.y=tgt.y;p.inv=30;
       hurtE(G,tgt,dmg,'#8888cc');
       emitP(G,tgt.x+tgt.w/2,tgt.y+tgt.h/2,'#8888cc',18,5);
       addFloat(G,'DEATH STRIKE! -'+dmg,tgt.x+tgt.w/2,tgt.y-18,'#8888cc');
       if(has('nd3')){
         // Also stun nearby enemies
         G.enemies.forEach(e=>{if(e.alive&&e!==tgt&&Math.hypot(e.x-tgt.x,e.y-tgt.y)<70){e.stunned=80;hurtE(G,e,Math.round(dmg*.4),'#8888cc');}});
       }
       if(has('nd4')&&!tgt.alive){
         // Reset cooldown on kill
         p.cds[3]=0;
         addFloat(G,'RESET!',p.x+p.w/2,p.y-30,'#0f0');
       }
     }},
  ],
  perks:[
    {tree:'Shuriken',col:'#aaaacc',perks:[
      {id:'ns1',name:'Balanced Blade',desc:'Shuriken speed +4',req:[]},
      {id:'ns2',name:'Serrated Edge',desc:'Shuriken dmg +14',req:['ns1']},
      {id:'ns3',name:'Triple Throw',desc:'Throw 3 at once',req:['ns1']},
      {id:'ns4',name:'Ricochet',desc:'Shurikens pierce all + ricochet',req:['ns2','ns3']},
    ]},
    {tree:'Smoke Bomb',col:'#888888',perks:[
      {id:'nb1',name:'Wide Cloud',desc:'Smoke radius +30',req:[]},
      {id:'nb2',name:'Dense Smoke',desc:'Stun lasts 2× longer',req:['nb1']},
      {id:'nb3',name:'Poison Gas',desc:'Smoke also poisons enemies',req:['nb1']},
      {id:'nb4',name:'Shadow Veil',desc:'Stealth lasts 3s, full invincibility',req:['nb2','nb3']},
    ]},
    {tree:'Clone',col:'#8888cc',perks:[
      {id:'nc1',name:'Twin Shadows',desc:'Summon 3 clones at once',req:[]},
      {id:'nc2',name:'Killing Blow',desc:'Clone dmg +30',req:['nc1']},
      {id:'nc3',name:'Seekers',desc:'Clones seek ANY enemy',req:['nc1']},
      {id:'nc4',name:'Explosion',desc:'Clone explodes on impact',req:['nc2','nc3']},
    ]},
    {tree:'Death Strike',col:'#cc4444',perks:[
      {id:'nd1',name:'Any Range',desc:'Death Strike targets anywhere',req:[]},
      {id:'nd2',name:'Fatal Blow',desc:'Death Strike dmg +60',req:['nd1']},
      {id:'nd3',name:'Shockwave',desc:'Strike also hits nearby enemies',req:['nd1']},
      {id:'nd4',name:'Assassin',desc:'Kill resets Death Strike CD',req:['nd2','nd3']},
    ]},
  ],
  ultimates:[
    {id:'nu1',name:'SHADOW STORM',req:[],cd:600,col:'#8888cc',
     desc:'Vanish into shadow. Teleport to each goblin dealing lethal damage to all.',
     exec(p,G){
       addFloat(G,'SHADOW STORM!',W/2,H/2-50,'#8888cc');
       p.inv=300;
       const targets=[...G.enemies].filter(e=>e.alive);
       targets.forEach((tgt,i)=>{
         setTimeout(()=>{
           if(!G.running||!tgt.alive)return;
           emitP(G,p.x+p.w/2,p.y+p.h/2,'#444466',10,3);
           p.x=Math.max(0,Math.min(W-p.w,tgt.x+(tgt.vx>0?tgt.w+4:-(p.w+4))));
           p.y=tgt.y;
           hurtE(G,tgt,120,'#8888cc');
           emitP(G,tgt.x+tgt.w/2,tgt.y+tgt.h/2,'#8888cc',14,4);
         },i*120);
       });
     }},
    {id:'nu2',name:'POISON CLOUD',req:[],cd:650,col:'#44aa44',
     desc:'Fill the entire arena with poison for 6 seconds. All enemies take damage every tick.',
     exec(p,G){
       addFloat(G,'POISON CLOUD!',W/2,H/2-50,'#44aa44');
       G.smokeCloud={x:W/2,y:H/2,radius:W,timer:360,maxTimer:360};
       // Massive global poison
       G.enemies.forEach(e=>{if(e.alive)e.burn=360;});
       let t=0;
       const iv=setInterval(()=>{
         if(!G.running){clearInterval(iv);return;}
         t+=20;if(t>360){clearInterval(iv);return;}
         G.enemies.forEach(e=>{if(e.alive){e.burn=Math.max(e.burn,10);hurtE(G,e,4,'#44aa44');}});
         if(t%60===0)emitP(G,100+Math.random()*(W-200),H-T-20,'#44aa44',8,4);
       },20);
     }},
  ],
  drawPlayer(p,cx,tick){
    cx.save();cx.translate(p.x+p.w/2,p.y+p.h/2);if(p.facing===-1)cx.scale(-1,1);
    const bob=p.grounded?Math.sin(p.frame*Math.PI/2)*1.5:0;
    const stealth=p.stealthed;
    cx.globalAlpha=stealth?0.35:1;
    const t=tick/15;
    // Dark outfit body
    cx.fillStyle='#1a1a2e';
    cx.beginPath();cx.moveTo(-p.w/2,-p.h/2+10+bob);cx.lineTo(-p.w/2+3,p.h/2+bob);cx.lineTo(p.w/2-3,p.h/2+bob);cx.lineTo(p.w/2,-p.h/2+10+bob);cx.closePath();cx.fill();
    cx.strokeStyle='#444466';cx.lineWidth=1;cx.stroke();
    // Sash / belt
    cx.fillStyle='#cc2222';cx.fillRect(-p.w/2,-p.h/2+20+bob,p.w,3);
    // Head / mask
    cx.fillStyle='#111122';cx.fillRect(-p.w/2+1,-p.h/2+bob,p.w-2,13);
    cx.strokeStyle='#444466';cx.lineWidth=.8;cx.strokeRect(-p.w/2+1,-p.h/2+bob,p.w-2,13);
    // Eye slit — only eyes visible
    cx.fillStyle='#1a1a2e';cx.fillRect(-p.w/2+2,-p.h/2+bob,p.w-4,12);
    cx.fillStyle='#cc2222';cx.fillRect(-p.w/2+3,-p.h/2+4+bob,p.w-6,4);
    // Glowing eyes
    cx.fillStyle='#ff4444';
    cx.beginPath();cx.arc(-3,-p.h/2+6+bob,1.5,0,Math.PI*2);cx.fill();
    cx.beginPath();cx.arc(3,-p.h/2+6+bob,1.5,0,Math.PI*2);cx.fill();
    // Legs
    const lob=p.grounded?Math.sin(p.frame*Math.PI/2)*5:0;
    cx.fillStyle='#111122';cx.fillRect(-8,p.h/2-12+bob,6,12+lob);cx.fillRect(2,p.h/2-12+bob,6,12-lob);
    cx.strokeStyle='#444466';cx.lineWidth=.6;cx.strokeRect(-8,p.h/2-12+bob,6,12+lob);cx.strokeRect(2,p.h/2-12+bob,6,12-lob);
    // Throwing arm + shuriken
    const aob=p.grounded?Math.sin(p.frame*Math.PI/2)*3:0;
    cx.strokeStyle='#aaaacc';cx.lineWidth=1.5;
    cx.beginPath();cx.moveTo(p.w/2-2,bob);cx.lineTo(p.w/2+12,bob-6+aob);cx.stroke();
    // Shuriken star shape
    const cg=p.castAnim>0;
    if(cg){cx.globalAlpha=stealth?.2:p.castAnim/20;cx.fillStyle=p.castCol;cx.beginPath();cx.arc(p.w/2+14,bob-8+aob,10,0,Math.PI*2);cx.fill();}
    cx.globalAlpha=stealth?.35:1;
    // Draw a small shuriken star
    cx.save();cx.translate(p.w/2+14,bob-8+aob);cx.rotate(t);
    cx.fillStyle='#aaaacc';
    for(let i=0;i<4;i++){
      cx.save();cx.rotate(i*Math.PI/2);
      cx.beginPath();cx.moveTo(0,-6);cx.lineTo(2,-2);cx.lineTo(0,-1);cx.lineTo(-2,-2);cx.closePath();cx.fill();
      cx.restore();
    }
    cx.restore();
    cx.globalAlpha=1;cx.restore();
  }
},


cleric:{
  name:'Cleric',icon:'✝',col:'#c8a050',
  desc:'Holy friar. Slow but mighty. Heals, smites undead, and calls divine wrath.',
  resName:'Faith',resCol:'#f5c842',maxRes:100,
  hp:200,
  abilityKeys:['1','2','3','4'],
  // PASSIVE: 50% bonus damage vs undead (isUndead flag)
  passive:'Holy Smite: +50% damage vs undead enemies.',
  abilities:[
    {name:'Mace Strike',key:'1',cost:15,cd:28,desc:'Heavy mace slam in a wide arc. Slow but devastating.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       const range=has('cm1')?80:55, dmg=has('cm2')?65:40;
       let hit=false;
       G.enemies.forEach(e=>{
         if(!e.alive)return;
         const dx=e.x+e.w/2-(p.x+p.w/2), dy=e.y+e.h/2-(p.y+p.h/2);
         if(Math.hypot(dx,dy)<range&&(p.facing===1?dx>-8:dx<8)){
           let d=dmg;
           if(e.isUndead)d=Math.round(d*1.5); // Holy Smite passive
           if(has('cm3'))e.stunned=80;
           hurtE(G,e,d,'#f5c842');hit=true;
           addFloat(G,'-'+d,e.x+e.w/2,e.y-10,'#f5c842');
         }
       });
       emitP(G,p.x+(p.facing===1?p.w+20:-20),p.y+p.h/2,'#f5c842',hit?14:6,3);
       G.swingAnim={x:p.x+p.w/2,y:p.y+p.h/2,facing:p.facing,t:14,range,col:'#f5c842'};
       if(has('cm4')&&hit){
         // Earthshaker: shockwave travels forward
         for(let s=1;s<=3;s++){
           setTimeout(()=>{
             if(!G.running)return;
             const sx=p.x+p.w/2+(p.facing===1?s*35:-s*35);
             G.enemies.forEach(e=>{if(e.alive&&Math.abs(e.x+e.w/2-sx)<30&&Math.abs(e.y-p.y)<40){let d2=Math.round(dmg*.4);if(e.isUndead)d2=Math.round(d2*1.5);hurtE(G,e,d2,'#f5c842');}});
             emitP(G,sx,p.y+p.h,'#f5c842',8,3);
           },s*80);
         }
       }
     }},
    {name:'Holy Light',key:'2',cost:30,cd:55,desc:'Heal yourself and damage nearby undead with divine radiance.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       const healAmt=has('ch1')?50:28;
       const dmg=has('ch2')?60:35;
       const range=has('ch3')?130:85;
       p.hp=Math.min(p.maxHp,p.hp+healAmt);
       addFloat(G,'+'+healAmt+' HP',p.x+p.w/2,p.y-25,'#44ff88');
       emitP(G,p.x+p.w/2,p.y+p.h/2,'#f5c842',20,5);
       G.enemies.forEach(e=>{
         if(!e.alive)return;
         if(Math.hypot(e.x+e.w/2-(p.x+p.w/2),e.y+e.h/2-(p.y+p.h/2))<range){
           if(e.isUndead){
             const d=dmg*2; // Holy Light hits undead for 2x
             hurtE(G,e,d,'#f5c842');
             addFloat(G,'HOLY! -'+d,e.x+e.w/2,e.y-12,'#f5c842');
             emitP(G,e.x+e.w/2,e.y,'#f5c842',12,4);
           } else {
             hurtE(G,e,Math.round(dmg*.3),'#f5c842'); // Weak vs living
           }
         }
       });
       // Heal aura pulse visual
       G.holyAura={x:p.x+p.w/2,y:p.y+p.h/2,r:0,maxR:range,t:30};
     }},
    {name:'Holy Ward',key:'3',cost:25,cd:70,desc:'Erect a divine shield — the next 3 hits deal no damage.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       p.wardCharges=has('cw1')?5:3;
       p.inv=20;
       addFloat(G,'WARD UP! ('+p.wardCharges+' charges)',''+( p.x+p.w/2),p.y-26,'#88aaff');
       emitP(G,p.x+p.w/2,p.y+p.h/2,'#88aaff',16,4);
       if(has('cw3')){
         // Retribution: when ward absorbs, damages nearby enemies
         p.wardRetribution=true;
       }
     }},
    {name:'Smite',key:'4',cost:35,cd:50,desc:'Call down divine lightning on an enemy. Devastating vs undead.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       const range=has('cs1')?350:200;
       const tgt=G.enemies.filter(e=>e.alive&&Math.hypot(e.x-p.x,e.y-p.y)<range)
         .sort((a,b)=>{
           // Prioritise undead
           if(a.isUndead&&!b.isUndead)return -1;
           if(!a.isUndead&&b.isUndead)return 1;
           return Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y);
         })[0];
       if(!tgt){addFloat(G,'NO TARGET',p.x+p.w/2,p.y-20,'#888');return;}
       let dmg=has('cs2')?120:70;
       if(tgt.isUndead)dmg=Math.round(dmg*2.5); // Smite vs undead is brutal
       hurtE(G,tgt,dmg,'#f5c842');
       emitP(G,tgt.x+tgt.w/2,tgt.y+tgt.h/2,'#f5c842',22,6);
       emitP(G,tgt.x+tgt.w/2,tgt.y-20,'#fff',10,3);
       addFloat(G,(tgt.isUndead?'HOLY SMITE! ':'SMITE! ')+'-'+dmg,tgt.x+tgt.w/2,tgt.y-16,'#f5c842');
       // Smite bolt visual from above
       G.smiteBolt={x:tgt.x+tgt.w/2,y:tgt.y,t:20};
       if(has('cs3')){
         // Chain smite: jumps to 2 more enemies
         const others=G.enemies.filter(e=>e.alive&&e!==tgt).sort((a,b)=>Math.hypot(a.x-tgt.x,a.y-tgt.y)-Math.hypot(b.x-tgt.x,b.y-tgt.y));
         others.slice(0,2).forEach((e,i)=>{
           setTimeout(()=>{
             if(!e.alive||!G.running)return;
             let d2=Math.round(dmg*.5);if(e.isUndead)d2=Math.round(d2*1.5);
             hurtE(G,e,d2,'#f5c842');emitP(G,e.x+e.w/2,e.y,'#f5c842',12,4);
             addFloat(G,'-'+d2,e.x+e.w/2,e.y-10,'#f5c842');
           },i*150+100);
         });
       }
     }},
  ],
  perks:[
    {tree:'Mace',col:'#c8a050',perks:[
      {id:'cm1',name:'Broad Swing',desc:'Mace range +25',req:[]},
      {id:'cm2',name:'Iron Mace',desc:'Mace dmg +25',req:['cm1']},
      {id:'cm3',name:'Concussive',desc:'Mace stuns all hit',req:['cm1']},
      {id:'cm4',name:'Earthshaker',desc:'Mace sends shockwave forward',req:['cm2','cm3']},
    ]},
    {tree:'Holy Light',col:'#44ff88',perks:[
      {id:'ch1',name:'Greater Heal',desc:'Holy Light heals +22 HP',req:[]},
      {id:'ch2',name:'Radiance',desc:'Holy Light dmg +25',req:['ch1']},
      {id:'ch3',name:'Wide Aura',desc:'Holy Light range +45',req:['ch1']},
      {id:'ch4',name:'Mass Heal',desc:'Holy Light heals you + weakens all nearby',req:['ch2','ch3']},
    ]},
    {tree:'Ward',col:'#88aaff',perks:[
      {id:'cw1',name:'Bulwark',desc:'Holy Ward gives 5 charges',req:[]},
      {id:'cw2',name:'Iron Faith',desc:'Ward CD reduced by 20',req:['cw1']},
      {id:'cw3',name:'Retribution',desc:'Ward hit damages nearby enemies',req:['cw1']},
      {id:'cw4',name:'Holy Aegis',desc:'Ward also reflects 50% dmg to attacker',req:['cw2','cw3']},
    ]},
    {tree:'Smite',col:'#f5c842',perks:[
      {id:'cs1',name:'Far Reach',desc:'Smite target range ×2',req:[]},
      {id:'cs2',name:'Divine Power',desc:'Smite dmg +50',req:['cs1']},
      {id:'cs3',name:'Chain Smite',desc:'Smite chains to 2 more',req:['cs1']},
      {id:'cs4',name:'Wrath of God',desc:'Smite stuns and burns ALL undead on screen',req:['cs2','cs3']},
    ]},
  ],
  ultimates:[
    {id:'cu1',name:'DIVINE JUDGMENT',req:[],cd:650,col:'#f5c842',
     desc:'Massive holy explosion. All undead take triple damage, all enemies stunned.',
     exec(p,G){
       addFloat(G,'DIVINE JUDGMENT!',W/2,H/2-50,'#f5c842');
       emitP(G,p.x+p.w/2,p.y+p.h/2,'#f5c842',40,8);
       p.inv=120;
       G.enemies.forEach((e,i)=>{
         setTimeout(()=>{
           if(!G.running||!e.alive)return;
           let dmg=e.isUndead?300:80;
           hurtE(G,e,dmg,'#f5c842');
           e.stunned=120;
           emitP(G,e.x+e.w/2,e.y,'#f5c842',16,5);
           addFloat(G,'-'+dmg,e.x+e.w/2,e.y-10,e.isUndead?'#f5c842':'#aaa');
         },i*50);
       });
       // Heal
       setTimeout(()=>{
         if(!G.running)return;
         p.hp=Math.min(p.maxHp,p.hp+60);
         addFloat(G,'+60 HP',p.x+p.w/2,p.y-30,'#44ff88');
       },800);
     }},
    {id:'cu2',name:'RESURRECTION',req:[],cd:700,col:'#88aaff',
     desc:'Full heal + Holy Ward with 10 charges + temporary invincibility for 5s.',
     exec(p,G){
       addFloat(G,'RESURRECTION!',W/2,H/2-50,'#88aaff');
       p.hp=p.maxHp;
       p.wardCharges=10;
       p.inv=300;
       emitP(G,p.x+p.w/2,p.y+p.h/2,'#88aaff',40,8);
       addFloat(G,'FULL HEAL + WARD x10',p.x+p.w/2,p.y-35,'#44ff88');
       // Knock back all nearby enemies
       G.enemies.forEach(e=>{
         if(!e.alive)return;
         const dx=e.x+e.w/2-(p.x+p.w/2),dy=e.y+e.h/2-(p.y+p.h/2);
         const dist=Math.hypot(dx,dy)||1;
         if(dist<150){e.vx=(dx/dist)*15;e.vy=(dy/dist)*15-5;e.stunned=100;}
       });
     }},
  ],
  drawPlayer(p,cx,tick){
    cx.save();cx.translate(p.x+p.w/2,p.y+p.h/2);if(p.facing===-1)cx.scale(-1,1);
    // Cleric is slightly wider/taller — friar build
    const bob=p.grounded?Math.sin(p.frame*Math.PI/2)*1:0; // slower bob (heavy)
    const t=tick/15;
    const ward=p.wardCharges>0;

    // Robes — long brown Franciscan habit
    cx.fillStyle='#6b4a1e';
    cx.beginPath();cx.moveTo(-p.w/2-2,-p.h/2+10+bob);cx.lineTo(-p.w/2+2,p.h/2+6+bob);cx.lineTo(p.w/2-2,p.h/2+6+bob);cx.lineTo(p.w/2+2,-p.h/2+10+bob);cx.closePath();cx.fill();
    cx.strokeStyle='#8b6a30';cx.lineWidth=1;cx.stroke();
    // Hood / cowl outline
    cx.fillStyle='#5a3a14';
    cx.beginPath();cx.moveTo(-p.w/2-2,-p.h/2+10+bob);cx.lineTo(-p.w/2+2,-p.h/2+24+bob);cx.lineTo(p.w/2-2,-p.h/2+24+bob);cx.lineTo(p.w/2+2,-p.h/2+10+bob);cx.closePath();cx.fill();
    // Rope belt/cord
    cx.strokeStyle='#c8a050';cx.lineWidth=2;cx.setLineDash([3,2]);
    cx.beginPath();cx.moveTo(-p.w/2-1,-p.h+24+bob);cx.lineTo(p.w/2+1,-p.h+24+bob);cx.stroke();
    cx.setLineDash([]);
    // Hanging cross on cord
    cx.strokeStyle='#f5c842';cx.lineWidth=1.5;
    cx.beginPath();cx.moveTo(2,-p.h/2+24+bob);cx.lineTo(2,-p.h/2+32+bob);cx.stroke();
    cx.beginPath();cx.moveTo(-1,-p.h/2+26+bob);cx.lineTo(5,-p.h/2+26+bob);cx.stroke();
    // Head — tonsure (bald top, ring of hair)
    cx.fillStyle='#e8c8a0';cx.beginPath();cx.ellipse(0,-p.h/2+5+bob,8,9,0,0,Math.PI*2);cx.fill();
    // Tonsure ring of hair (brown)
    cx.strokeStyle='#4a2a00';cx.lineWidth=3;
    cx.beginPath();cx.arc(0,-p.h/2+5+bob,8,.6,Math.PI-.6);cx.stroke(); // back of head
    cx.beginPath();cx.arc(0,-p.h/2+5+bob,8,Math.PI+.5,-.5);cx.stroke(); // sides
    // Face — kindly friar
    cx.fillStyle='#1a0a00';cx.beginPath();cx.arc(-3,-p.h/2+4+bob,1.5,0,Math.PI*2);cx.fill();cx.beginPath();cx.arc(3,-p.h/2+4+bob,1.5,0,Math.PI*2);cx.fill();
    // Smile
    cx.strokeStyle='#4a2a10';cx.lineWidth=1;cx.beginPath();cx.arc(0,-p.h/2+7+bob,2,.2,Math.PI-.2);cx.stroke();
    // Bushy eyebrows (wise friar look)
    cx.strokeStyle='#4a2a00';cx.lineWidth=1.5;
    cx.beginPath();cx.moveTo(-5,-p.h/2+2+bob);cx.lineTo(-1,-p.h/2+1+bob);cx.stroke();
    cx.beginPath();cx.moveTo(5,-p.h/2+2+bob);cx.lineTo(1,-p.h/2+1+bob);cx.stroke();
    // Hood (pushed back, shows top of head)
    cx.fillStyle='#5a3a14';
    cx.beginPath();cx.moveTo(-p.w/2,-p.h/2+bob);cx.lineTo(-p.w/2+3,-p.h/2+12+bob);cx.lineTo(p.w/2-3,-p.h/2+12+bob);cx.lineTo(p.w/2,-p.h/2+bob);cx.closePath();cx.fill();
    cx.strokeStyle='#8b6a30';cx.lineWidth=.8;cx.stroke();
    // Holy Ward aura
    if(ward){
      cx.globalAlpha=.18+Math.sin(t*2)*.08;
      cx.fillStyle='#88aaff';cx.beginPath();cx.arc(0,bob,32,0,Math.PI*2);cx.fill();
      cx.globalAlpha=.5+Math.sin(t*2)*.25;cx.strokeStyle='#88aaff';cx.lineWidth=1.5;
      cx.beginPath();cx.arc(0,bob,32,0,Math.PI*2);cx.stroke();
      // Ward charge count
      cx.globalAlpha=1;cx.fillStyle='#88aaff';cx.font='bold 10px sans-serif';cx.textAlign='center';
      cx.fillText(p.wardCharges,0,-32+bob);
    }
    // Mace arm
    const lob2=p.grounded?Math.sin(p.frame*Math.PI/2)*4:0;
    // Handle
    cx.strokeStyle='#5a3a10';cx.lineWidth=3;cx.beginPath();cx.moveTo(p.w/2,bob-2);cx.lineTo(p.w/2+14,bob-14+lob2);cx.stroke();
    // Mace head
    cx.fillStyle='#888878';cx.beginPath();cx.arc(p.w/2+14,bob-14+lob2,6,0,Math.PI*2);cx.fill();
    cx.strokeStyle='#aaaaaa';cx.lineWidth=1;cx.strokeStyle='#aaa';
    // Flanges
    for(let fi=0;fi<4;fi++){
      const fa=fi*Math.PI/2+(t*.5);
      cx.fillStyle='#999988';
      cx.beginPath();cx.moveTo(p.w/2+14+Math.cos(fa)*5,bob-14+lob2+Math.sin(fa)*5);
      cx.lineTo(p.w/2+14+Math.cos(fa)*9,bob-14+lob2+Math.sin(fa)*9);
      cx.lineTo(p.w/2+14+Math.cos(fa+.4)*7,bob-14+lob2+Math.sin(fa+.4)*7);
      cx.closePath();cx.fill();
    }
    const cg=p.castAnim>0;
    if(cg){cx.globalAlpha=p.castAnim/20;cx.fillStyle=p.castCol;cx.beginPath();cx.arc(p.w/2+14,bob-14+lob2,12,0,Math.PI*2);cx.fill();}
    cx.globalAlpha=1;cx.textAlign='left';cx.restore();
  }
},


vault:{
  name:'Vault Dweller',icon:'⚡',col:'#3a8fd4',
  desc:'Sole survivor from Vault 111. 10mm pistol, pip-boy gadgets, and her faithful dog Dogmeat.',
  resName:'AP',resCol:'#3a8fd4',maxRes:100,
  hp:115,
  abilityKeys:['1','2','3','4'],
  passive:'Wasteland Tough: 15% damage reduction from all sources.',
  abilities:[
    {name:'10mm Pistol',key:'1',cost:8,cd:12,desc:'Semi-auto pistol. Fast and reliable. Critical hit every 6th shot.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       // Increment BEFORE the modulo check; start at 1 so shot 6 is first burst
       p._shotCount=(p._shotCount||0)+1;
       // Crit: every 6th shot (shot 6, 12, 18…) or always with Sniper perk
       const isCrit=(p._shotCount>0&&p._shotCount%6===0)||has('vg4');
       const spd=has('vg1')?15:12;
       // FIX: no random vy — bullets travel perfectly horizontal so they always hit
       const originX=p.x+(p.facing===1?p.w+2:-2);
       const originY=p.y+14; // chest height
       const baseDmg=has('vg2')?55:35;
       const boostMult=p._stimBoost>0?1.5:1;
       const dmg=isCrit?Math.round(baseDmg*3*boostMult):Math.round(baseDmg*boostMult);
       const col=isCrit?'#ffdd00':'#f5c842';
       // Main bullet — no vertical drift
       spawnProj(G,originX,originY,p.facing*spd,0,6,col,dmg,'bullet',{noGrav:true,pierce:false});
       if(isCrit){
         emitP(G,originX,originY,'#ffdd00',10,3);
         addFloat(G,'CRIT! -'+dmg,p.x+p.w/2,p.y-18,'#ffdd00');
       }
       // Burst Fire perk — on every 6th shot, snapshot position/facing NOW and fire 2 extras
       if(has('vg3')&&p._shotCount>0&&p._shotCount%6===0){
         const bx=originX, by=originY, bfacing=p.facing, bspd=spd;
         const bDmg=Math.round(baseDmg*boostMult);
         setTimeout(()=>{if(!G.running)return;
           spawnProj(G,bx,by-3,bfacing*bspd,0,6,'#f5c842',bDmg,'bullet',{noGrav:true});},55);
         setTimeout(()=>{if(!G.running)return;
           spawnProj(G,bx,by+3,bfacing*bspd,0,6,'#f5c842',bDmg,'bullet',{noGrav:true});},110);
         addFloat(G,'BURST!',p.x+p.w/2,p.y-28,'#f5c842');
       }
     }},
    {name:'Stim-Pack',key:'2',cost:35,cd:70,desc:'Inject a stimpak — heal 40 HP. Surplus healing gives temp damage boost.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       const heal=has('vs1')?65:40;
       const overheal=Math.max(0,(p.hp+heal)-p.maxHp);
       p.hp=Math.min(p.maxHp,p.hp+heal);
       addFloat(G,'+'+heal+' HP',p.x+p.w/2,p.y-26,'#44ff88');
       emitP(G,p.x+p.w/2,p.y+p.h/2,'#44ff88',14,4);
       if(overheal>0||has('vs2')){
         p._stimBoost=has('vs3')?240:120;
         addFloat(G,'STIM BOOST!',p.x+p.w/2,p.y-40,'#ffdd00');
       }
       if(has('vs4')){
         // Adrenaline: kills for 5s increase AP regen
         p._adrenaline=300;
       }
     }},
    {name:'Pip-Boy Scan',key:'3',cost:20,cd:60,desc:'Scan the area — reveal and slow all enemies on screen for 4s.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       const dur=has('vp1')?240:150;
       G.enemies.forEach(e=>{
         if(!e.alive)return;
         e.stunned=Math.round(dur*.5);
         if(has('vp2'))e.frozen=dur; // EMP freezes machines/undead
       });
       addFloat(G,'SCANNING...',p.x+p.w/2,p.y-26,'#00ffcc');
       emitP(G,p.x+p.w/2,p.y+p.h/2,'#00ffcc',24,7);
       G.pipScan={x:p.x+p.w/2,y:p.y+p.h/2,r:0,t:40};
       if(has('vp3')){
         // Targeting: mark all enemies for 3× damage
         G.enemies.forEach(e=>{if(e.alive){e.marked=true;e.markedTimer=dur;}});
       }
       if(has('vp4')){
         // VATS: slow motion — reduce enemy movement for 6s
         G.vatsSlow=360;
         addFloat(G,'VATS ENGAGED!',W/2,H/2-40,'#00ffcc');
       }
     }},
    {name:'Dogmeat',key:'4',cost:40,cd:90,desc:'Send Dogmeat charging at the nearest enemy to bite and hold them.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       const range=has('vd1')?W:260;
       const targets=G.enemies.filter(e=>e.alive&&Math.hypot(e.x-p.x,e.y-p.y)<range)
         .sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));
       const count=has('vd3')?3:1;
       targets.slice(0,count).forEach((tgt,i)=>{
         setTimeout(()=>{
           if(!G.running)return;
           G.dogmeats.push({
             x:p.x+p.w/2,y:p.y+p.h*.7,
             tx:tgt.x+tgt.w/2,ty:tgt.y+tgt.h/2,
             target:tgt,spd:9,dmg:has('vd2')?80:50,
             holdDur:has('vd4')?240:140,
             t:0,maxT:80,biting:false,biteT:0
           });
         },i*150);
       });
       if(targets.length===0)addFloat(G,'DOGMEAT! (no targets)',p.x+p.w/2,p.y-20,'#d4860a');
       else addFloat(G,'DOGMEAT!',p.x+p.w/2,p.y-20,'#d4860a');
       emitP(G,p.x+p.w/2,p.y+p.h*.7,'#d4860a',10,3);
     }},
  ],
  perks:[
    {tree:'Gun',col:'#f5c842',perks:[
      {id:'vg1',name:'Extended Mag',desc:'Bullet speed +3',req:[]},
      {id:'vg2',name:'Hollow Point',desc:'Bullet dmg +20',req:['vg1']},
      {id:'vg3',name:'Burst Fire',desc:'Every 6th shot fires 3 bullets',req:['vg1']},
      {id:'vg4',name:'Sniper',desc:'Every shot is a critical hit',req:['vg2','vg3']},
    ]},
    {tree:'Stim-Pack',col:'#44ff88',perks:[
      {id:'vs1',name:'Super Stim',desc:'Heal +25 HP',req:[]},
      {id:'vs2',name:'Combat Drugs',desc:'Always gain dmg boost from stim',req:['vs1']},
      {id:'vs3',name:'Adrenaline',desc:'Stim boost lasts 2× longer',req:['vs1']},
      {id:'vs4',name:'Berserker',desc:'Kills while boosted restore AP',req:['vs2','vs3']},
    ]},
    {tree:'Pip-Boy',col:'#00ffcc',perks:[
      {id:'vp1',name:'Enhanced Scan',desc:'Scan duration +90 ticks',req:[]},
      {id:'vp2',name:'EMP Pulse',desc:'Scan also freezes enemies',req:['vp1']},
      {id:'vp3',name:'Targeting',desc:'Scan marks all enemies (3× dmg)',req:['vp1']},
      {id:'vp4',name:'V.A.T.S.',desc:'Slows ALL enemies for 6s',req:['vp2','vp3']},
    ]},
    {tree:'Dogmeat',col:'#d4860a',perks:[
      {id:'vd1',name:'Loyal Hound',desc:'Dogmeat targets any range',req:[]},
      {id:'vd2',name:'Razor Teeth',desc:'Dogmeat bite dmg +30',req:['vd1']},
      {id:'vd3',name:'Pack Leader',desc:'Send 3 Dogmeats at once',req:['vd1']},
      {id:'vd4',name:'Death Grip',desc:'Dogmeat holds enemy 2× longer',req:['vd2','vd3']},
    ]},
  ],
  ultimates:[
    {id:'vu1',name:'NUKE GRENADE',req:[],cd:600,col:'#ffdd00',
     desc:'Lob a mini nuke — massive explosion clearing most of the screen.',
     exec(p,G){
       addFloat(G,'NUKE GRENADE!',W/2,H/2-50,'#ffdd00');
       spawnProj(G,p.x+p.w/2,p.y,p.facing*8,-10,14,'#ffdd00',0,'dynamite',{isDynamite:true,dRad:220,dmg:180,isMiniNuke:true});
       p.inv=60;
     }},
    {id:'vu2',name:'DOGMEAT PACK',req:[],cd:650,col:'#d4860a',
     desc:'Unleash a pack of 8 Dogmeats simultaneously on all enemies.',
     exec(p,G){
       addFloat(G,'DOG PACK!',W/2,H/2-50,'#d4860a');
       const targets=G.enemies.filter(e=>e.alive);
       if(targets.length===0)return;
       for(let i=0;i<8;i++){
         const tgt=targets[i%targets.length];
         const offset=(i-4)*18;
         G.dogmeats.push({
           x:p.x+p.w/2+offset,y:p.y+p.h*.7,
           tx:tgt.x+tgt.w/2,ty:tgt.y+tgt.h/2,
           target:tgt,spd:10,dmg:60,holdDur:120,t:0,maxT:70,biting:false,biteT:0
         });
         emitP(G,p.x+p.w/2+offset,p.y+p.h*.7,'#d4860a',8,3);
       }
     }},
  ],
  drawPlayer(p,cx,tick){
    cx.save();cx.translate(p.x+p.w/2,p.y+p.h/2);if(p.facing===-1)cx.scale(-1,1);
    const bob=p.grounded?Math.sin(p.frame*Math.PI/2)*1.5:0;
    const t=tick/15;
    const boosted=p._stimBoost>0;

    // Vault suit — blue/yellow
    cx.fillStyle=boosted?'#5aafe4':'#3a7bc8';
    cx.beginPath();cx.moveTo(-p.w/2,-p.h/2+10+bob);cx.lineTo(-p.w/2+3,p.h/2+bob);cx.lineTo(p.w/2-3,p.h/2+bob);cx.lineTo(p.w/2,-p.h/2+10+bob);cx.closePath();cx.fill();
    cx.strokeStyle='#f5c842';cx.lineWidth=1;cx.stroke();
    // Yellow stripe down the middle
    cx.fillStyle='#f5c842';cx.fillRect(-3,-p.h/2+10+bob,6,p.h-10);
    // Vault number on chest
    cx.fillStyle='#3a7bc8';cx.fillRect(-4,-p.h/2+12+bob,8,8);
    cx.fillStyle='#f5c842';cx.font='bold 6px sans-serif';cx.textAlign='center';cx.fillText('111',0,-p.h/2+19+bob);
    // Collar / shoulders
    cx.fillStyle='#f5c842';cx.fillRect(-p.w/2,-p.h/2+10+bob,p.w,3);
    cx.fillRect(-p.w/2-2,-p.h/2+10+bob,4,8);cx.fillRect(p.w/2-2,-p.h/2+10+bob,4,8);
    // Head — female face, ponytail
    cx.fillStyle='#e8c8a0';cx.beginPath();cx.ellipse(0,-p.h/2+5+bob,7,8,0,0,Math.PI*2);cx.fill();
    // Hair / ponytail
    cx.fillStyle='#5a3010';
    cx.beginPath();cx.moveTo(-7,-p.h/2+1+bob);cx.lineTo(-p.w/2-4,-p.h/2+8+bob);cx.lineTo(-p.w/2-2,-p.h/2+12+bob);cx.lineTo(-4,-p.h/2+3+bob);cx.closePath();cx.fill();
    // Eyes
    cx.fillStyle='#1a0a00';cx.beginPath();cx.arc(-3,-p.h/2+4+bob,1.5,0,Math.PI*2);cx.fill();cx.beginPath();cx.arc(3,-p.h/2+4+bob,1.5,0,Math.PI*2);cx.fill();
    // Smile / determined look
    cx.strokeStyle='#4a2a10';cx.lineWidth=1;cx.beginPath();cx.arc(0,-p.h/2+7+bob,2,.1,Math.PI-.1);cx.stroke();
    // Pip-Boy on left wrist (green glow)
    cx.fillStyle='#1a3a1a';cx.fillRect(-p.w/2-1,bob+2,8,6);cx.strokeStyle='#00ff88';cx.lineWidth=.8;cx.strokeRect(-p.w/2-1,bob+2,8,6);
    cx.fillStyle='#00ff88';cx.globalAlpha=.5+Math.sin(t)*.3;cx.fillRect(-p.w/2,bob+3,6,4);cx.globalAlpha=1;
    // 10mm pistol in right hand
    const gob=p.grounded?Math.sin(p.frame*Math.PI/2)*3:0;
    cx.fillStyle='#333';cx.fillRect(p.w/2-1,bob-3,12,5);
    cx.fillStyle='#222';cx.fillRect(p.w/2+3,bob-6,4,4);
    cx.fillStyle='#555';cx.fillRect(p.w/2+3,bob+2,3,3);
    // Muzzle flash on cast
    const cg=p.castAnim>0;
    if(cg){cx.globalAlpha=p.castAnim/20;cx.fillStyle='#ffdd00';cx.beginPath();cx.arc(p.w/2+12,bob,8,0,Math.PI*2);cx.fill();cx.globalAlpha=1;}
    // Stim boost glow
    if(boosted){cx.globalAlpha=.12+Math.sin(t*2)*.06;cx.fillStyle='#ffdd00';cx.beginPath();cx.arc(0,bob,26,0,Math.PI*2);cx.fill();cx.globalAlpha=1;}
    // Legs
    const lob=p.grounded?Math.sin(p.frame*Math.PI/2)*5:0;
    cx.fillStyle='#3a7bc8';cx.fillRect(-8,p.h/2-12+bob,6,12+lob);cx.fillRect(2,p.h/2-12+bob,6,12-lob);
    cx.fillStyle='#f5c842';cx.fillRect(-8,p.h/2-12+bob,6,2);cx.fillRect(2,p.h/2-12+bob,6,2);
    cx.textAlign='left';cx.restore();
  }
},


gorilla:{
  name:'Gorilla',icon:'🦍',col:'#5a3a1a',
  desc:'Pure muscle. Devastating punches, ground slams, and the legendary banana.',
  resName:'Rage',resCol:'#cc4400',maxRes:100,
  hp:230,
  abilityKeys:['1','2','3','4'],
  passive:'Rage builds from hits taken (+5 per hit). More rage = stronger punches.',
  abilities:[
    {name:'Knuckle Smash',key:'1',cost:0,cd:18,desc:'Massive punch. Uses rage for bonus damage. Shockwave at full rage.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       const range=has('gp1')?85:58;
       const base=has('gp2')?72:46;
       const rageMult=1+(p.res/100)*0.8;
       const dmg=Math.round(base*rageMult);
       let hitAny=false;
       G.enemies.forEach(e=>{
         if(!e.alive)return;
         const dx=e.x+e.w/2-(p.x+p.w/2),dy=e.y+e.h/2-(p.y+p.h/2);
         if(Math.hypot(dx,dy)<range&&(p.facing===1?dx>-12:dx<12)){
           hurtE(G,e,dmg,'#cc4400');
           const kb=has('gp3')?18:11;
           e.vx=(dx>0?1:-1)*kb; e.vy=-6; e.stunned=55;
           hitAny=true;
           addFloat(G,'-'+dmg,e.x+e.w/2,e.y-10,'#cc4400');
         }
       });
       emitP(G,p.x+(p.facing===1?p.w+28:-28),p.y+p.h*0.4,'#cc4400',hitAny?16:7,4);
       G.swingAnim={x:p.x+p.w/2,y:p.y+p.h/2,facing:p.facing,t:12,range,col:'#cc4400'};
       if(hitAny&&has('gp4')&&p.res>=80){
         const fx=p.facing,px2=p.x,py2=p.y;
         for(let s=1;s<=4;s++) setTimeout(()=>{
           if(!G.running)return;
           const sx=px2+p.w/2+(fx===1?s*44:-s*44);
           G.enemies.forEach(e=>{if(e.alive&&Math.abs(e.x+e.w/2-sx)<36&&Math.abs(e.y-py2)<46){hurtE(G,e,Math.round(dmg*0.4),'#ff6600');e.vx=fx*13;e.vy=-5;}});
           emitP(G,sx,py2+p.h*0.8,'#cc4400',10,3);
         },s*65);
         addFloat(G,'SHOCKWAVE!',p.x+p.w/2,p.y-34,'#ff6600');
       }
       // Drain a bit of rage
       p.res=Math.max(0,p.res-6);
     }},
    {name:'Ground Slam',key:'2',cost:0,cd:50,desc:'Jump and slam — massive AoE that scatters everything.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       const radius=has('gs1')?165:110;
       const dmg=has('gs2')?90:58;
       p.vy=-15; // jump up
       const snapX=p.x+p.w/2, snapY=p.y;
       setTimeout(()=>{
         if(!G.running)return;
         G.enemies.forEach(e=>{
           if(!e.alive)return;
           const dist=Math.hypot(e.x+e.w/2-snapX,e.y+e.h/2-(snapY+p.h));
           if(dist<radius){
             const d=Math.round(dmg*(1-dist/(radius*1.4)));
             hurtE(G,e,d,'#8b5e3c');
             const away=dist||1;
             e.vx=(e.x+e.w/2-snapX)/away*13; e.vy=-9; e.stunned=75;
             addFloat(G,'-'+d,e.x+e.w/2,e.y-10,'#8b5e3c');
           }
         });
         emitP(G,snapX,snapY+p.h,'#8b5e3c',38,9);
         addFloat(G,'GROUND SLAM!',snapX,snapY-28,'#8b5e3c');
         G.slamRipple={x:snapX,y:snapY+p.h,r:0,maxR:radius,t:28};
         p.res=Math.min(p.maxRes,p.res+22);
         if(has('gs3')){G.crackedGround={x:snapX,w:radius*2,t:280};}
         if(has('gs4')){
           const fr=p.facing;
           for(let w=1;w<=2;w++) setTimeout(()=>{
             if(!G.running)return;
             const wx=snapX+(fr===1?w*80:-w*80);
             G.enemies.forEach(e=>{if(e.alive&&Math.abs(e.x+e.w/2-wx)<55&&Math.abs(e.y-snapY)<50){hurtE(G,e,Math.round(dmg*0.35),'#8b5e3c');e.vy=-7;e.stunned=40;}});
             emitP(G,wx,snapY+p.h,'#8b5e3c',14,4);
           },w*200);
         }
       },360);
     }},
    {name:'Banana',key:'3',cost:0,cd:38,desc:'Hurl a banana — enemies slip and fall. Rotten perk adds burn.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       const vx=p.facing*(has('gb1')?12:8);
       const dmg=has('gb2')?32:18;
       const count=has('gb3')?3:1;
       for(let i=0;i<count;i++){
         const vy=-5.5-i*0.8;
         const spreadVx=vx+(i-Math.floor(count/2))*0.8;
         spawnProj(G,
           p.x+(p.facing===1?p.w+4:-4),p.y+12,
           spreadVx,vy,9,'#f5c842',dmg,'banana',
           {isBanana:true,slipDur:has('gb4')?200:110,doBurn:has('gb2')}
         );
       }
       addFloat(G,'BANANA!',p.x+p.w/2,p.y-22,'#f5c842');
     }},
    {name:'Gorilla Rage',key:'4',cost:0,cd:55,desc:'Roar! Fill rage bar, scare nearby enemies, brief invincibility.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       p.res=Math.min(p.maxRes,p.res+(has('gr1')?65:38));
       p.inv=has('gr2')?90:45;
       const scareR=has('gr3')?170:105;
       G.enemies.forEach(e=>{
         if(!e.alive)return;
         const dx=e.x+e.w/2-(p.x+p.w/2),dy=e.y+e.h/2-(p.y+p.h/2);
         const dist=Math.hypot(dx,dy)||1;
         if(dist<scareR){e.vx=dx/dist*9;e.vy=-6;e.stunned=65;emitP(G,e.x+e.w/2,e.y,'#cc4400',6,3);}
       });
       emitP(G,p.x+p.w/2,p.y+p.h/2,'#cc4400',28,7);
       addFloat(G,'RAAAARGH!',p.x+p.w/2,p.y-28,'#cc4400');
       if(has('gr4')){p._rampage=300;addFloat(G,'RAMPAGE!',p.x+p.w/2,p.y-44,'#ff4400');}
     }},
  ],
  perks:[
    {tree:'Punch',col:'#cc4400',perks:[
      {id:'gp1',name:'Long Arms',desc:'Punch range +27',req:[]},
      {id:'gp2',name:'Iron Fists',desc:'Punch dmg +26',req:['gp1']},
      {id:'gp3',name:'Haymaker',desc:'Knockback +65%',req:['gp1']},
      {id:'gp4',name:'Shockwave',desc:'Full rage punch sends ground wave',req:['gp2','gp3']},
    ]},
    {tree:'Slam',col:'#8b5e3c',perks:[
      {id:'gs1',name:'Seismic',desc:'Slam radius +55',req:[]},
      {id:'gs2',name:'Crusher',desc:'Slam dmg +32',req:['gs1']},
      {id:'gs3',name:'Crater',desc:'Slam leaves slow zone',req:['gs1']},
      {id:'gs4',name:'Aftershock',desc:'Slam sends 2 quake waves',req:['gs2','gs3']},
    ]},
    {tree:'Banana',col:'#f5c842',perks:[
      {id:'gb1',name:'Good Arm',desc:'Banana speed +4',req:[]},
      {id:'gb2',name:'Rotten',desc:'Banana dmg+14 + burns target',req:['gb1']},
      {id:'gb3',name:'Bunch',desc:'Throw 3 bananas at once',req:['gb1']},
      {id:'gb4',name:'Mega Slip',desc:'Slip duration ×2',req:['gb2','gb3']},
    ]},
    {tree:'Rage',col:'#ff4400',perks:[
      {id:'gr1',name:'Battle Fury',desc:'Roar fills +65 rage',req:[]},
      {id:'gr2',name:'Thick Skin',desc:'Roar grants 1.5s invincibility',req:['gr1']},
      {id:'gr3',name:'Thunderous',desc:'Roar scares enemies further',req:['gr1']},
      {id:'gr4',name:'Rampage',desc:'5s: kills restore 20 rage',req:['gr2','gr3']},
    ]},
  ],
  ultimates:[
    {id:'go1',name:'APE STAMPEDE',req:[],cd:600,col:'#cc4400',
     desc:'Charge the whole arena non-stop for 2.5s, smashing everything aside.',
     exec(p,G){
       addFloat(G,'APE STAMPEDE!',W/2,H/2-50,'#cc4400');
       p.inv=160;p.res=100;
       const dir=p.facing;
       let step=0;
       const iv=setInterval(()=>{
         if(!G.running){clearInterval(iv);return;}
         step++;
         if(step>45){clearInterval(iv);return;}
         p.x=Math.max(0,Math.min(W-p.w,p.x+dir*13));
         G.enemies.forEach(e=>{
           if(!e.alive)return;
           if(Math.abs(e.x+e.w/2-(p.x+p.w/2))<52&&Math.abs(e.y+e.h/2-(p.y+p.h/2))<46){
             hurtE(G,e,58,'#cc4400');e.vx=dir*14;e.vy=-8;e.stunned=50;
           }
         });
         emitP(G,p.x+p.w/2,p.y+p.h,'#8b5e3c',4,3);
       },18);
     }},
    {id:'go2',name:'BANANA BLITZ',req:[],cd:650,col:'#f5c842',
     desc:'20 bananas rain across the whole arena.',
     exec(p,G){
       addFloat(G,'BANANA BLITZ!',W/2,H/2-50,'#f5c842');
       for(let i=0;i<20;i++) setTimeout(()=>{
         if(!G.running)return;
         spawnProj(G,40+Math.random()*(W-80),-20,(Math.random()-.5)*1.5,8,9,'#f5c842',38,'banana',{isBanana:true,slipDur:150,doBurn:false});
       },i*160);
     }},
  ],
  drawPlayer(p,cx,tick){
    cx.save();cx.translate(p.x+p.w/2,p.y+p.h/2);if(p.facing===-1)cx.scale(-1,1);
    const bob=p.grounded?Math.sin(p.frame*Math.PI/2)*1.5:0;
    const rage=p.res/100;
    const ramp=p._rampage>0;
    const bodyCol=ramp?'#6a2808':`rgb(${Math.round(62+rage*30)},${Math.round(44+rage*10)},${Math.round(24)})`;
    const darkCol='#1e1008';
    // Shadow
    cx.fillStyle='rgba(0,0,0,0.18)';cx.beginPath();cx.ellipse(0,p.h/2+4+bob,15,4,0,0,Math.PI*2);cx.fill();
    // Legs
    const lob=p.grounded?Math.sin(p.frame*Math.PI/2)*6:0;
    cx.fillStyle=darkCol;
    cx.beginPath();cx.ellipse(-8,p.h/2-7+bob,7,11,-.15,0,Math.PI*2);cx.fill();
    cx.beginPath();cx.ellipse(8,p.h/2-7+bob,7,11,.15,0,Math.PI*2);cx.fill();
    // Feet
    cx.fillStyle='#0e0806';
    cx.beginPath();cx.ellipse(-10,p.h/2+1+bob,9,5,.15,0,Math.PI*2);cx.fill();
    cx.beginPath();cx.ellipse(10,p.h/2+1+bob,9,5,-.15,0,Math.PI*2);cx.fill();
    // Body barrel
    cx.fillStyle=bodyCol;cx.beginPath();cx.ellipse(0,bob,p.w/2+5,p.h/2-1,0,0,Math.PI*2);cx.fill();
    // Silver-back highlight
    cx.fillStyle='rgba(220,200,180,0.18)';cx.beginPath();cx.ellipse(0,bob-2,p.w/2+2,p.h/2-5,0,0,Math.PI*2);cx.fill();
    // Left arm (knuckle dragger — rests near ground)
    cx.fillStyle=bodyCol;
    cx.beginPath();cx.moveTo(-p.w/2+2,bob-6);cx.lineTo(-p.w/2-13,bob+8);cx.lineTo(-p.w/2-11,bob+14);cx.lineTo(-p.w/2+4,bob+4);cx.closePath();cx.fill();
    cx.fillStyle=darkCol;cx.beginPath();cx.ellipse(-p.w/2-13,bob+11,7,5,.25,0,Math.PI*2);cx.fill();
    for(let k=0;k<4;k++){cx.fillStyle='#2a1808';cx.beginPath();cx.arc(-p.w/2-9+k*3,bob+8,1.5,0,Math.PI*2);cx.fill();}
    // Right arm (punch arm — extends when casting)
    const ext=p.castAnim>0?p.castAnim/20*10:0;
    cx.fillStyle=bodyCol;
    cx.beginPath();cx.moveTo(p.w/2-2,bob-6);cx.lineTo(p.w/2+15+ext,bob+4);cx.lineTo(p.w/2+13+ext,bob+10);cx.lineTo(p.w/2,bob+2);cx.closePath();cx.fill();
    cx.fillStyle=darkCol;cx.beginPath();cx.ellipse(p.w/2+16+ext,bob+7,7,6,-.25,0,Math.PI*2);cx.fill();
    for(let k=0;k<4;k++){cx.fillStyle='#3a2010';cx.beginPath();cx.arc(p.w/2+12+ext+k*3,bob+4,1.5,0,Math.PI*2);cx.fill();}
    // Head
    cx.fillStyle=bodyCol;cx.beginPath();cx.ellipse(0,-p.h/2+3+bob,11,12,0,0,Math.PI*2);cx.fill();
    // Brow ridge
    cx.fillStyle=darkCol;cx.beginPath();cx.ellipse(0,-p.h/2-3+bob,11,5,0,Math.PI,0,true);cx.fill();
    // Nose
    cx.fillStyle='#0e0806';cx.beginPath();cx.ellipse(0,-p.h/2+5+bob,5,4,0,0,Math.PI*2);cx.fill();
    cx.fillStyle='#1a1010';cx.beginPath();cx.arc(-2,-p.h/2+5+bob,2,0,Math.PI*2);cx.fill();cx.beginPath();cx.arc(2,-p.h/2+5+bob,2,0,Math.PI*2);cx.fill();
    // Eyes
    cx.fillStyle='#050505';cx.beginPath();cx.arc(-4,-p.h/2-1+bob,2.5,0,Math.PI*2);cx.fill();cx.beginPath();cx.arc(4,-p.h/2-1+bob,2.5,0,Math.PI*2);cx.fill();
    cx.fillStyle='#fff';cx.beginPath();cx.arc(-3,-p.h/2-2+bob,1,0,Math.PI*2);cx.fill();cx.beginPath();cx.arc(5,-p.h/2-2+bob,1,0,Math.PI*2);cx.fill();
    // Rage glow + teeth when raging
    if(rage>0.6||ramp){
      cx.fillStyle='rgba(255,68,0,0.12)';cx.beginPath();cx.ellipse(0,bob,p.w/2+7,p.h/2+2,0,0,Math.PI*2);cx.fill();
      cx.fillStyle='#fff';cx.beginPath();cx.moveTo(-4,-p.h/2+9+bob);cx.lineTo(4,-p.h/2+9+bob);cx.lineTo(3,-p.h/2+12+bob);cx.lineTo(-3,-p.h/2+12+bob);cx.closePath();cx.fill();
    }
    cx.restore();
  }
},

cyborg:{
  name:'Cyborg',icon:'🤖',col:'#00e5ff',
  desc:'Half-human, half-machine. Plasma cannon, rocket fist, shield matrix, and jet boost.',
  resName:'Power',resCol:'#00e5ff',maxRes:100,
  hp:145,
  abilityKeys:['1','2','3','4'],
  passive:'Power Regen: Power charges 50% faster. Taking damage generates Power.',
  abilities:[
    {name:'Plasma Cannon',key:'1',cost:22,cd:22,desc:'Charged plasma bolt. Overcharge perk fires 3-round burst.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       const vx=p.facing*(has('cy1')?14:10);
       const dmg=has('cy2')?58:38;
       const radius=has('cy1')?13:9;
       if(has('cy3')){
         // 3-round burst
         for(let i=0;i<3;i++) setTimeout(()=>{
           if(!G.running)return;
           const ox=p.x+(p.facing===1?p.w+3:-3);
           spawnProj(G,ox,p.y+14,p.facing*(has('cy1')?14:10),(i-1)*1.2,radius,'#00e5ff',dmg,'plasma',{noGrav:true});
         },i*80);
         addFloat(G,'BURST!',p.x+p.w/2,p.y-22,'#00e5ff');
       } else {
         spawnProj(G,p.x+(p.facing===1?p.w+3:-3),p.y+14,vx,0,radius,'#00e5ff',dmg,'plasma',{noGrav:true});
       }
       emitP(G,p.x+(p.facing===1?p.w+8:-8),p.y+14,'#00e5ff',10,3);
       p.castCol='#00e5ff';
     }},
    {name:'Rocket Fist',key:'2',cost:28,cd:42,desc:'Detach fist and rocket it at an enemy — explodes on impact.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       const tgt=G.enemies.filter(e=>e.alive).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
       if(!tgt){
         // No target — fire straight
         spawnProj(G,p.x+(p.facing===1?p.w+3:-3),p.y+14,p.facing*12,0,12,'#ff8800',has('cx2')?110:70,'rocketfist',{isRocketFist:true,noGrav:true,dRad:has('cx1')?80:50});
         return;
       }
       const dx=tgt.x+tgt.w/2-(p.x+p.w/2),dy=tgt.y+tgt.h/2-(p.y+p.h/2);
       const len=Math.hypot(dx,dy)||1;
       const spd=has('cx2')?13:9;
       spawnProj(G,p.x+(p.facing===1?p.w+3:-3),p.y+14,dx/len*spd,dy/len*spd,12,'#ff8800',has('cx2')?110:70,'rocketfist',{isRocketFist:true,noGrav:true,dRad:has('cx1')?80:50});
       addFloat(G,'ROCKET FIST!',p.x+p.w/2,p.y-22,'#ff8800');
       p.castCol='#ff8800';
     }},
    {name:'Shield Matrix',key:'3',cost:25,cd:65,desc:'Activate energy shield — next 4 hits absorbed, reflected with laser.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       p.wardCharges=has('cm1_c')?6:4;
       p.wardRetribution=true;
       p.inv=20;
       addFloat(G,'SHIELD UP! ('+p.wardCharges+')',p.x+p.w/2,p.y-26,'#00e5ff');
       emitP(G,p.x+p.w/2,p.y+p.h/2,'#00e5ff',18,5);
       if(has('cm3_c')){
         // Counter pulse: nearby enemies take damage
         G.enemies.forEach(e=>{if(e.alive&&Math.hypot(e.x-p.x,e.y-p.y)<80)hurtE(G,e,35,'#00e5ff');});
       }
       p.castCol='#00e5ff';
     }},
    {name:'Jet Boost',key:'4',cost:20,cd:40,desc:'Blast forward, fly over enemies, crash-land with AoE shockwave.',
     cast(p,G){
       const has=id=>G.owned.has(id);
       const dist=has('cj1')?200:130;
       const destX=Math.max(0,Math.min(W-p.w,p.x+(p.facing===1?dist:-dist)));
       // Arc up and over
       emitP(G,p.x+p.w/2,p.y+p.h/2,'#00e5ff',14,4);
       if(has('cj2')){
         // Damage enemies passed through
         const minX=Math.min(p.x,destX),maxX=Math.max(p.x+p.w,destX+p.w);
         G.enemies.forEach(e=>{if(e.alive&&e.x+e.w/2>minX&&e.x+e.w/2<maxX&&Math.abs(e.y-p.y)<60){hurtE(G,e,45,'#00e5ff');e.vy=-8;}});
       }
       p.x=destX;p.vy=-10;p.inv=30;
       emitP(G,p.x+p.w/2,p.y+p.h/2,'#00e5ff',14,4);
       // Crash-land AoE
       const snapX=p.x+p.w/2;
       setTimeout(()=>{
         if(!G.running)return;
         const aoeR=has('cj3')?90:55;
         G.enemies.forEach(e=>{
           if(!e.alive)return;
           const dist2=Math.hypot(e.x+e.w/2-snapX,e.y+e.h/2-(p.y+p.h));
           if(dist2<aoeR){hurtE(G,e,has('cj4')?65:38,'#00e5ff');e.vy=-7;e.stunned=50;}
         });
         emitP(G,snapX,p.y+p.h,'#00e5ff',24,6);
         G.slamRipple={x:snapX,y:p.y+p.h,r:0,maxR:aoeR,t:22,col:'#00e5ff'};
       },320);
       p.castCol='#00e5ff';
     }},
  ],
  perks:[
    {tree:'Plasma',col:'#00e5ff',perks:[
      {id:'cy1',name:'Overcharge',desc:'Plasma spd+4, radius+4',req:[]},
      {id:'cy2',name:'Superheated',desc:'Plasma dmg +20',req:['cy1']},
      {id:'cy3',name:'Burst Mode',desc:'Fires 3 bolts at once',req:['cy1']},
      {id:'cy4',name:'Overload',desc:'Plasma also burns target',req:['cy2','cy3']},
    ]},
    {tree:'Rocket Fist',col:'#ff8800',perks:[
      {id:'cx1',name:'Wide Warhead',desc:'Explosion radius +30',req:[]},
      {id:'cx2',name:'Homing',desc:'Fist tracks enemy +dmg',req:['cx1']},
      {id:'cx3',name:'Twin Launch',desc:'Fires 2 rocket fists',req:['cx1']},
      {id:'cx4',name:'Nuclear Punch',desc:'Fist explosion also burns',req:['cx2','cx3']},
    ]},
    {tree:'Shield',col:'#4488ff',perks:[
      {id:'cm1_c',name:'Hardened',desc:'Shield gives 6 charges',req:[]},
      {id:'cm2_c',name:'Fast Charge',desc:'Shield CD -20',req:['cm1_c']},
      {id:'cm3_c',name:'Pulse',desc:'Activating shield damages nearby',req:['cm1_c']},
      {id:'cm4_c',name:'Mirror',desc:'Reflected dmg ×3 to attacker',req:['cm2_c','cm3_c']},
    ]},
    {tree:'Jet',col:'#aaaaff',perks:[
      {id:'cj1',name:'Afterburner',desc:'Jet distance +70',req:[]},
      {id:'cj2',name:'Flyby',desc:'Jet damages all passed through',req:['cj1']},
      {id:'cj3',name:'Hard Landing',desc:'Crash AoE radius +35',req:['cj1']},
      {id:'cj4',name:'Meteor Drop',desc:'Crash dmg +27',req:['cj2','cj3']},
    ]},
  ],
  ultimates:[
    {id:'cb1',name:'FULL DISCHARGE',req:[],cd:600,col:'#00e5ff',
     desc:'Overload all systems — plasma storm hits every enemy 8 times.',
     exec(p,G){
       addFloat(G,'FULL DISCHARGE!',W/2,H/2-50,'#00e5ff');
       p.inv=200;
       let shot=0;
       const iv=setInterval(()=>{
         if(!G.running){clearInterval(iv);return;}
         shot++;if(shot>8){clearInterval(iv);return;}
         // Arc to nearest alive enemy
         const tgt=G.enemies.filter(e=>e.alive).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[shot%Math.max(1,G.enemies.filter(e=>e.alive).length)];
         if(tgt){
           const dx=tgt.x+tgt.w/2-(p.x+p.w/2),dy=tgt.y+tgt.h/2-(p.y+p.h/2);
           const len=Math.hypot(dx,dy)||1;
           spawnProj(G,p.x+p.w/2,p.y+p.h/2,dx/len*14,dy/len*14,14,'#00e5ff',90,'plasma',{noGrav:true});
         }
         emitP(G,p.x+p.w/2,p.y+p.h/2,'#00e5ff',8,5);
       },120);
     }},
    {id:'cb2',name:'SELF DESTRUCT',req:[],cd:700,col:'#ff4400',
     desc:'WARNING: MASSIVE explosion centred on you. Temporary invincibility included.',
     exec(p,G){
       addFloat(G,'SELF DESTRUCT!!!',W/2,H/2-50,'#ff4400');
       p.inv=360;
       let t=0;
       const iv=setInterval(()=>{
         if(!G.running){clearInterval(iv);return;}
         t++;
         emitP(G,p.x+p.w/2,p.y+p.h/2,t%2===0?'#ff4400':'#ffdd00',8,6);
         if(t>=60){
           clearInterval(iv);
           G.enemies.forEach(e=>{
             if(!e.alive)return;
             const dist=Math.hypot(e.x+e.w/2-(p.x+p.w/2),e.y+e.h/2-(p.y+p.h/2));
             if(dist<240){const d=Math.round(200*(1-dist/300));hurtE(G,e,d,'#ff4400');e.stunned=120;e.vx=(e.x-p.x)/dist*20;e.vy=-10;}
           });
           emitP(G,p.x+p.w/2,p.y+p.h/2,'#ff4400',60,12);
           emitP(G,p.x+p.w/2,p.y+p.h/2,'#ffdd00',40,10);
           addFloat(G,'BOOM!!!',W/2,H/2,'#ff4400');
           G.slamRipple={x:p.x+p.w/2,y:p.y+p.h/2,r:0,maxR:240,t:35,col:'#ff4400'};
         }
       },16);
     }},
  ],
  drawPlayer(p,cx,tick){
    cx.save();cx.translate(p.x+p.w/2,p.y+p.h/2);if(p.facing===-1)cx.scale(-1,1);
    const bob=p.grounded?Math.sin(p.frame*Math.PI/2)*1.5:0;
    const t=tick/14;
    const shielded=p.wardCharges>0;
    const bodyCol='#1a2a3a';
    // Legs
    const lob=p.grounded?Math.sin(p.frame*Math.PI/2)*5:0;
    cx.fillStyle='#222f3a';cx.fillRect(-9,p.h/2-12+bob,7,12+lob);cx.fillRect(2,p.h/2-12+bob,7,12-lob);
    cx.strokeStyle='#00e5ff';cx.lineWidth=.8;cx.strokeRect(-9,p.h/2-12+bob,7,12+lob);cx.strokeRect(2,p.h/2-12+bob,7,12-lob);
    // Boots with thruster ports
    cx.fillStyle='#111820';cx.fillRect(-10,p.h/2-2+bob,9,7+lob);cx.fillRect(1,p.h/2-2+bob,9,7-lob);
    // Body chassis
    cx.fillStyle=bodyCol;cx.fillRect(-p.w/2,-p.h/2+10+bob,p.w,p.h);
    cx.strokeStyle='#00e5ff';cx.lineWidth=1;cx.strokeRect(-p.w/2,-p.h/2+10+bob,p.w,p.h);
    // Chest reactor
    const glow=`rgba(0,229,255,${0.4+Math.sin(t)*0.25})`;
    cx.fillStyle=glow;cx.beginPath();cx.arc(0,-p.h/2+20+bob,5,0,Math.PI*2);cx.fill();
    cx.fillStyle='#fff';cx.beginPath();cx.arc(0,-p.h/2+20+bob,2,0,Math.PI*2);cx.fill();
    // Chest armour lines
    cx.strokeStyle='#334455';cx.lineWidth=.6;
    cx.beginPath();cx.moveTo(-p.w/2+2,-p.h/2+14+bob);cx.lineTo(p.w/2-2,-p.h/2+14+bob);cx.stroke();
    cx.beginPath();cx.moveTo(-p.w/2+2,-p.h/2+28+bob);cx.lineTo(p.w/2-2,-p.h/2+28+bob);cx.stroke();
    // Left arm (normal)
    cx.fillStyle='#1e2e3e';cx.fillRect(-p.w/2-5,bob-6,8,14);cx.strokeStyle='#00e5ff';cx.lineWidth=.6;cx.strokeRect(-p.w/2-5,bob-6,8,14);
    // Right arm — cannon arm
    const cg=p.castAnim>0;
    cx.fillStyle='#1e2e3e';cx.fillRect(p.w/2-2,bob-5,10,10);
    cx.fillStyle='#111820';cx.fillRect(p.w/2+4,bob-3,10,6);cx.strokeStyle='#00e5ff';cx.lineWidth=.8;cx.strokeRect(p.w/2+4,bob-3,10,6);
    // Cannon glow
    if(cg){cx.globalAlpha=p.castAnim/20;cx.fillStyle=p.castCol;cx.beginPath();cx.arc(p.w/2+14,bob,10,0,Math.PI*2);cx.fill();cx.globalAlpha=1;}
    cx.fillStyle=cg?p.castCol:'#00e5ff';cx.beginPath();cx.arc(p.w/2+14,bob,3,0,Math.PI*2);cx.fill();
    // Head — visor helmet
    cx.fillStyle='#111820';cx.fillRect(-p.w/2+1,-p.h/2+bob,p.w-2,12);cx.strokeStyle='#00e5ff';cx.lineWidth=1;cx.strokeRect(-p.w/2+1,-p.h/2+bob,p.w-2,12);
    // Visor
    cx.fillStyle=`rgba(0,229,255,${0.35+Math.sin(t*.8)*.15})`;cx.fillRect(-p.w/2+3,-p.h/2+3+bob,p.w-6,6);
    cx.fillStyle='#fff';cx.fillRect(-p.w/2+4,-p.h/2+4+bob,5,3);
    // Antennae
    cx.strokeStyle='#00e5ff';cx.lineWidth=1;cx.beginPath();cx.moveTo(-4,-p.h/2+bob);cx.lineTo(-5,-p.h/2-7+bob);cx.stroke();cx.beginPath();cx.moveTo(4,-p.h/2+bob);cx.lineTo(5,-p.h/2-7+bob);cx.stroke();
    cx.fillStyle='#00e5ff';cx.beginPath();cx.arc(-5,-p.h/2-7+bob,1.5,0,Math.PI*2);cx.fill();cx.beginPath();cx.arc(5,-p.h/2-7+bob,1.5,0,Math.PI*2);cx.fill();
    // Shield aura
    if(shielded){
      cx.globalAlpha=.15+Math.sin(t*2)*.08;cx.fillStyle='#00e5ff';cx.beginPath();cx.arc(0,bob,30,0,Math.PI*2);cx.fill();
      cx.globalAlpha=.5+Math.sin(t*2)*.3;cx.strokeStyle='#00e5ff';cx.lineWidth=1.5;cx.beginPath();cx.arc(0,bob,30,0,Math.PI*2);cx.stroke();
      cx.globalAlpha=1;cx.fillStyle='#00e5ff';cx.font='bold 9px sans-serif';cx.textAlign='center';cx.fillText(p.wardCharges,0,-30+bob);
    }
    cx.globalAlpha=1;cx.textAlign='left';cx.restore();
  }
},


}; // end CLASSES
