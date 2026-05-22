function drawBg(){
  CX.fillStyle='#060a04';CX.fillRect(0,0,W,H);
  for(let i=0;i<40;i++){const x=(i*137+G.tick*.01)%W,y=(i*91)%140;CX.globalAlpha=.2+Math.sin(G.tick*.04+i)*.15;CX.fillStyle='#fff';CX.fillRect(x,y,1,1);}CX.globalAlpha=1;
  CX.fillStyle='#d4c8a0';CX.beginPath();CX.arc(560,42,24,0,Math.PI*2);CX.fill();
  CX.fillStyle='#0a1408';for(let i=0;i<9;i++){const tx=i*80,th=60+i%4*20;CX.fillRect(tx+10,H-T-th,8,th);CX.beginPath();CX.moveTo(tx,H-T-th+10);CX.lineTo(tx+28,H-T-th+10);CX.lineTo(tx+14,H-T-th-25);CX.closePath();CX.fill();CX.beginPath();CX.moveTo(tx+2,H-T-th+28);CX.lineTo(tx+26,H-T-th+28);CX.lineTo(tx+14,H-T-th+4);CX.closePath();CX.fill();}
  CX.fillStyle='#0e1a0c';CX.beginPath();CX.ellipse(80,H-T,55,30,0,Math.PI,0);CX.fill();CX.beginPath();CX.ellipse(560,H-T,55,30,0,Math.PI,0);CX.fill();
  CX.fillStyle='#050a03';CX.beginPath();CX.ellipse(80,H-T,40,22,0,Math.PI,0);CX.fill();CX.beginPath();CX.ellipse(560,H-T,40,22,0,Math.PI,0);CX.fill();
  CX.fillStyle='#142010';CX.fillRect(0,H-T,W,T);CX.fillStyle='#1e3018';CX.fillRect(0,H-T,W,4);
  CX.fillStyle='#2a4a20';for(let gx=10;gx<W;gx+=22){CX.fillRect(gx,H-T,3,5);CX.fillRect(gx+5,H-T,2,4);CX.fillRect(gx+9,H-T,3,6);}
  if(G.stormTick>0){CX.fillStyle=`rgba(245,200,66,${.04+Math.sin(G.tick*.2)*.02})`;CX.fillRect(0,0,W,H);}
  PLATS.forEach(pl=>{
    if(pl.t==='g')return;
    CX.fillStyle='#0e1a0c';CX.fillRect(pl.x,pl.y+4,pl.w,pl.h-4);
    CX.fillStyle='#2a4a20';CX.fillRect(pl.x,pl.y,pl.w,5);CX.fillStyle='#1e3018';CX.fillRect(pl.x,pl.y+5,pl.w,pl.h-5);
    for(let gx=pl.x+4;gx<pl.x+pl.w-4;gx+=10){CX.fillStyle='#3a6030';CX.fillRect(gx,pl.y,2,4);}
  });
}

function drawUndead(e){
  if(!e.alive)return;
  CX.save();CX.translate(e.x+e.w/2,e.y+e.h/2);if(e.vx>=0)CX.scale(-1,1);
  const bob=e.grounded?Math.sin(e.fr*Math.PI/2)*2:0;
  const fl=e.dmgFlash>0,fr=e.frozen>0,bu=e.burn>0;
  const h=e.h,hw=e.w;
  if(e.isMummy){
    // Mummy — wrapped bandages
    const bc=fr?'#85b7eb':fl?'#fff':bu?'#ff8800':e.col;
    CX.fillStyle=bc;CX.fillRect(-hw/2,-h/2+8+bob,hw,h-8);
    // Bandage wraps
    CX.strokeStyle=e.ancient?'#c8a050':'#d8c090';CX.lineWidth=2;CX.globalAlpha=.7;
    for(let wy=-h/2+10;wy<h/2-4;wy+=6+bob*.1){CX.beginPath();CX.moveTo(-hw/2+1,wy+bob);CX.lineTo(hw/2-1,wy+bob);CX.stroke();}
    CX.globalAlpha=1;
    // Head
    CX.fillStyle=bc;CX.beginPath();CX.ellipse(0,-h/2+5+bob,hw/2,hw/2+1,0,0,Math.PI*2);CX.fill();
    // Head wraps
    CX.strokeStyle=e.ancient?'#c8a050':'#d8c090';CX.lineWidth=2;
    CX.beginPath();CX.arc(0,-h/2+5+bob,hw/2+1,-.6,Math.PI+.6);CX.stroke();
    // Glowing eyes
    const ec=fr?'#aaddff':fl?'#fff':e.eye;
    CX.fillStyle=ec;CX.beginPath();CX.arc(-3,-h/2+4+bob,2,0,Math.PI*2);CX.fill();
    CX.beginPath();CX.arc(3,-h/2+4+bob,2,0,Math.PI*2);CX.fill();
    // Crown for lord
    if(e.lord){CX.fillStyle='#f5c842';CX.beginPath();CX.moveTo(-8,-h/2+bob);CX.lineTo(-6,-h/2-8+bob);CX.lineTo(-2,-h/2-4+bob);CX.lineTo(0,-h/2-10+bob);CX.lineTo(2,-h/2-4+bob);CX.lineTo(6,-h/2-8+bob);CX.lineTo(8,-h/2+bob);CX.closePath();CX.fill();}
    // Arm reaching out
    const lob=e.grounded?Math.sin(e.fr*Math.PI/2)*4:0;
    CX.fillStyle=bc;CX.fillRect(hw/2-1,bob-4,10,6+lob);
    CX.strokeStyle=e.ancient?'#c8a050':'#d8c090';CX.lineWidth=1.5;CX.beginPath();CX.moveTo(hw/2+8,bob-2+lob);CX.lineTo(hw/2+14,bob+2+lob);CX.stroke();
  } else {
    // Skeleton
    const bc=fr?'#85b7eb':fl?'#fff':e.col;
    // Ribcage body
    CX.fillStyle=bc;
    for(let ri=0;ri<4;ri++){CX.beginPath();CX.ellipse(0,-h/2+14+ri*5+bob,hw/2-2,2,0,0,Math.PI*2);CX.fill();}
    // Spine
    CX.strokeStyle=bc;CX.lineWidth=3;CX.beginPath();CX.moveTo(0,-h/2+8+bob);CX.lineTo(0,h/2-8+bob);CX.stroke();
    // Pelvis
    CX.fillStyle=bc;CX.beginPath();CX.ellipse(0,h/2-10+bob,hw/2-1,4,0,0,Math.PI*2);CX.fill();
    // Skull
    CX.fillStyle=bc;CX.beginPath();CX.ellipse(0,-h/2+5+bob,hw/2,hw/2+1,0,0,Math.PI*2);CX.fill();
    // Eye sockets
    const ec=fr?'#aaddff':fl?'#fff':e.eye;
    CX.fillStyle='#1a0a00';CX.beginPath();CX.ellipse(-3,-h/2+4+bob,2.5,2,0,0,Math.PI*2);CX.fill();CX.beginPath();CX.ellipse(3,-h/2+4+bob,2.5,2,0,0,Math.PI*2);CX.fill();
    CX.fillStyle=ec;CX.beginPath();CX.arc(-3,-h/2+4+bob,1.5,0,Math.PI*2);CX.fill();CX.beginPath();CX.arc(3,-h/2+4+bob,1.5,0,Math.PI*2);CX.fill();
    // Teeth
    CX.fillStyle='#f0e8d0';
    for(let ti=-2;ti<=2;ti+=2){CX.fillRect(ti,-h/2+9+bob,1.5,3);}
    // Armor for bone warrior
    if(e.armored){CX.fillStyle='#5a5040';CX.fillRect(-hw/2+1,-h/2+10+bob,hw-2,12);CX.strokeStyle='#8a7050';CX.lineWidth=.8;CX.strokeRect(-hw/2+1,-h/2+10+bob,hw-2,12);}
    // Staff for mage
    if(e.isMage){CX.strokeStyle='#8040c0';CX.lineWidth=2;CX.beginPath();CX.moveTo(hw/2,bob-4);CX.lineTo(hw/2+16,bob-18);CX.stroke();CX.fillStyle='#cc88ff';CX.beginPath();CX.arc(hw/2+16,bob-18,4,0,Math.PI*2);CX.fill();}
    else{
      const lob=e.grounded?Math.sin(e.fr*Math.PI/2)*4:0;
      CX.strokeStyle=bc;CX.lineWidth=2;CX.beginPath();CX.moveTo(hw/2,bob-2);CX.lineTo(hw/2+12,bob+6+lob);CX.stroke();
    }
    // Leg bones
    const lob=e.grounded?Math.sin(e.fr*Math.PI/2)*5:0;
    CX.strokeStyle=bc;CX.lineWidth=3;
    CX.beginPath();CX.moveTo(-3,h/2-8+bob);CX.lineTo(-4,h/2+lob+bob);CX.stroke();
    CX.beginPath();CX.moveTo(3,h/2-8+bob);CX.lineTo(4,h/2-lob+bob);CX.stroke();
  }
  if(e.hp<e.maxHp){CX.fillStyle='#1a0a00';CX.fillRect(-hw/2,-h/2-8,hw,4);CX.fillStyle=fr?'#85b7eb':bu?'#ff8800':'#cc8800';CX.fillRect(-hw/2,-h/2-8,hw*(e.hp/e.maxHp),4);}
  if(fr){CX.fillStyle='#85b7eb20';CX.fillRect(-hw/2,-h/2+bob,hw,h);}
  CX.globalAlpha=1;CX.textAlign='left';CX.restore();
}









function drawOrc(e){
  if(!e.alive)return;
  CX.save();CX.translate(e.x+e.w/2,e.y+e.h/2);if(e.vx>=0)CX.scale(-1,1);
  const bob=e.grounded?Math.sin(e.fr*Math.PI/2)*2:0;
  const fl=e.dmgFlash>0,fr=e.frozen>0,bu=e.burn>0;
  const bc=fr?'#85b7eb':fl?'#fff':bu?'#ff8800':e.col;
  const h=e.h,hw=e.w;
  // Massive body
  CX.fillStyle=bc;CX.fillRect(-hw/2,-h/2+8+bob,hw,h-8);
  // Studded leather
  CX.fillStyle=fr?'#5090c0':fl?'#aaa':'#3a2010';CX.fillRect(-hw/2+1,-h/2+10+bob,hw-2,14);
  CX.fillStyle='#5a4020';
  for(let sx=-hw/2+4;sx<hw/2-4;sx+=6){CX.beginPath();CX.arc(sx,-h/2+14+bob,2,0,Math.PI*2);CX.fill();}
  // Head — large with tusks
  CX.fillStyle=bc;CX.beginPath();CX.ellipse(0,-h/2+5+bob,hw/2,hw/2+1,0,0,Math.PI*2);CX.fill();
  // Deep-set eyes
  const ec=fr?'#aaddff':fl?'#fff':e.eye;
  CX.fillStyle='#0a0800';CX.fillRect(-6,-h/2+3+bob,5,5);CX.fillRect(1,-h/2+3+bob,5,5);
  CX.fillStyle=ec;CX.fillRect(-5,-h/2+4+bob,3,3);CX.fillRect(2,-h/2+4+bob,3,3);
  // Tusks
  CX.fillStyle='#f0e8c0';
  CX.beginPath();CX.moveTo(-4,-h/2+9+bob);CX.lineTo(-6,-h/2+14+bob);CX.lineTo(-2,-h/2+9+bob);CX.closePath();CX.fill();
  CX.beginPath();CX.moveTo(4,-h/2+9+bob);CX.lineTo(6,-h/2+14+bob);CX.lineTo(2,-h/2+9+bob);CX.closePath();CX.fill();
  // Mohawk/war paint for warchief
  if(e.chief){
    CX.fillStyle='#cc2200';
    CX.beginPath();CX.moveTo(-3,-h/2+bob);CX.lineTo(0,-h/2-12+bob);CX.lineTo(3,-h/2+bob);CX.closePath();CX.fill();
    CX.strokeStyle='#cc2200';CX.lineWidth=1;
    CX.beginPath();CX.moveTo(-hw/2+2,-h/2+3+bob);CX.lineTo(-hw/2+6,-h/2+8+bob);CX.stroke();
    CX.beginPath();CX.moveTo(hw/2-2,-h/2+3+bob);CX.lineTo(hw/2-6,-h/2+8+bob);CX.stroke();
  }
  // Berserk glow
  if(e.berserk&&e.hp<e.maxHp*.5){CX.globalAlpha=.3;CX.fillStyle='#ff4400';CX.fillRect(-hw/2,-h/2+bob,hw,h);CX.globalAlpha=1;}
  // Big weapon
  const lob=e.grounded?Math.sin(e.fr*Math.PI/2)*5:0;
  CX.fillStyle=fr?'#5090c0':'#2a1a00';CX.fillRect(-hw/2+1,h/2-12+bob,hw/2-2,12+lob);CX.fillRect(1,h/2-12+bob,hw/2-2,12-lob);
  CX.strokeStyle='#c8c0a8';CX.lineWidth=e.chief?4:3;CX.beginPath();CX.moveTo(hw/2,bob-4);CX.lineTo(hw/2+18,bob+10);CX.stroke();
  if(e.chief){CX.fillStyle='#c8c0a8';CX.beginPath();CX.ellipse(hw/2+18,bob+10,5,4,.5,0,Math.PI*2);CX.fill();}
  if(e.hp<e.maxHp){CX.fillStyle='#1a0a00';CX.fillRect(-hw/2,-h/2-8,hw,4);CX.fillStyle=fr?'#85b7eb':bu?'#ff8800':'#e24b4a';CX.fillRect(-hw/2,-h/2-8,hw*(e.hp/e.maxHp),4);}
  if(fr){CX.fillStyle='#85b7eb20';CX.fillRect(-hw/2,-h/2+bob,hw,h);}
  CX.globalAlpha=1;CX.textAlign='left';CX.restore();
}


function drawRangedEnemy(e){
  if(!e.alive)return;
  CX.save();CX.translate(e.x+e.w/2,e.y+e.h/2);
  const facingDir=e.vx>=0||(e.vx===0&&e.x<W/2)?-1:1;
  if(facingDir>0)CX.scale(-1,1);
  const bob=e.grounded?Math.sin(e.fr*Math.PI/2)*2:0;
  const fl=e.dmgFlash>0,fr=e.frozen>0,bu=e.burn>0;
  const bc=fr?'#85b7eb':fl?'#fff':bu?'#ff8800':e.col;
  const h=e.h,hw=e.w;
  if(e.isSkelArcher){
    // Skeleton archer — same as skeleton but with bow
    CX.fillStyle=bc;
    for(let ri=0;ri<4;ri++){CX.beginPath();CX.ellipse(0,-h/2+14+ri*5+bob,hw/2-2,2,0,0,Math.PI*2);CX.fill();}
    CX.strokeStyle=bc;CX.lineWidth=3;CX.beginPath();CX.moveTo(0,-h/2+8+bob);CX.lineTo(0,h/2-8+bob);CX.stroke();
    CX.fillStyle=bc;CX.beginPath();CX.ellipse(0,h/2-10+bob,hw/2-1,4,0,0,Math.PI*2);CX.fill();
    CX.fillStyle=bc;CX.beginPath();CX.ellipse(0,-h/2+5+bob,hw/2,hw/2+1,0,0,Math.PI*2);CX.fill();
    const ec=fr?'#aaddff':fl?'#fff':'#ff4';
    CX.fillStyle='#1a0a00';CX.beginPath();CX.ellipse(-3,-h/2+4+bob,2.5,2,0,0,Math.PI*2);CX.fill();CX.beginPath();CX.ellipse(3,-h/2+4+bob,2.5,2,0,0,Math.PI*2);CX.fill();
    CX.fillStyle=ec;CX.beginPath();CX.arc(-3,-h/2+4+bob,1.5,0,Math.PI*2);CX.fill();CX.beginPath();CX.arc(3,-h/2+4+bob,1.5,0,Math.PI*2);CX.fill();
    CX.fillStyle='#f0e8d0';for(let ti=-2;ti<=2;ti+=2){CX.fillRect(ti,-h/2+9+bob,1.5,3);}
    // Bone bow
    CX.strokeStyle='#d4cbb0';CX.lineWidth=2;CX.beginPath();CX.arc(hw/2+8,bob-2,12,-.7,.7);CX.stroke();
    CX.strokeStyle='#f0e8d0';CX.lineWidth=.8;CX.beginPath();CX.moveTo(hw/2+2,bob-12);CX.lineTo(hw/2+2,bob+8);CX.stroke();
    const lob=e.grounded?Math.sin(e.fr*Math.PI/2)*5:0;
    CX.strokeStyle=bc;CX.lineWidth=3;CX.beginPath();CX.moveTo(-3,h/2-8+bob);CX.lineTo(-4,h/2+lob+bob);CX.stroke();CX.beginPath();CX.moveTo(3,h/2-8+bob);CX.lineTo(4,h/2-lob+bob);CX.stroke();
  } else if(e.isDarkWiz){
    // Dark Wizard — shadowy robed caster
    CX.fillStyle=bc;CX.fillRect(-hw/2,-h/2+10+bob,hw,h);
    CX.fillStyle='#1a0028';CX.fillRect(-hw/2+1,-h/2+12+bob,hw-2,h-14);
    // Pointy hat
    CX.fillStyle='#1a0028';CX.beginPath();CX.moveTo(-hw/2,-h/2+2+bob);CX.lineTo(hw/2,-h/2+2+bob);CX.lineTo(1,-h/2-18+bob);CX.closePath();CX.fill();
    CX.strokeStyle='#cc44ff';CX.lineWidth=.8;CX.strokeRect(-hw/2,-h/2+2+bob,hw,10);
    // Glowing eyes
    CX.fillStyle='#cc44ff';CX.beginPath();CX.arc(-3,-h/2+5+bob,2,0,Math.PI*2);CX.fill();CX.beginPath();CX.arc(3,-h/2+5+bob,2,0,Math.PI*2);CX.fill();
    // Staff
    CX.strokeStyle='#8a4ab0';CX.lineWidth=2;CX.beginPath();CX.moveTo(hw/2,bob-4);CX.lineTo(hw/2+16,bob-20);CX.stroke();
    CX.fillStyle='#cc44ff';CX.beginPath();CX.arc(hw/2+16,bob-20,5,0,Math.PI*2);CX.fill();
    CX.fillStyle='#fff';CX.globalAlpha=.5+Math.sin(G.tick*.1)*.4;CX.beginPath();CX.arc(hw/2+16,bob-20,3,0,Math.PI*2);CX.fill();CX.globalAlpha=1;
    const lob=e.grounded?Math.sin(e.fr*Math.PI/2)*4:0;
    CX.fillStyle=bc;CX.fillRect(-hw/2+1,h/2-10+bob,hw/2-2,10+lob);CX.fillRect(1,h/2-10+bob,hw/2-2,10-lob);
  } else if(e.isOrcShaman){
    // Orc Shaman — green with bones and fetishes
    CX.fillStyle=bc;CX.fillRect(-hw/2,-h/2+8+bob,hw,h-8);
    CX.fillStyle='#1a3008';CX.fillRect(-hw/2+1,-h/2+10+bob,hw-2,12);
    CX.fillStyle=bc;CX.beginPath();CX.ellipse(0,-h/2+5+bob,hw/2,hw/2+1,0,0,Math.PI*2);CX.fill();
    CX.fillStyle='#0a0800';CX.fillRect(-6,-h/2+3+bob,5,5);CX.fillRect(1,-h/2+3+bob,5,5);
    CX.fillStyle='#c080ff';CX.fillRect(-5,-h/2+4+bob,3,3);CX.fillRect(2,-h/2+4+bob,3,3);
    CX.fillStyle='#f0e8c0';
    CX.beginPath();CX.moveTo(-4,-h/2+9+bob);CX.lineTo(-5,-h/2+14+bob);CX.lineTo(-2,-h/2+9+bob);CX.closePath();CX.fill();
    CX.beginPath();CX.moveTo(4,-h/2+9+bob);CX.lineTo(5,-h/2+14+bob);CX.lineTo(2,-h/2+9+bob);CX.closePath();CX.fill();
    // Bone fetish headdress
    CX.strokeStyle='#d4cbb0';CX.lineWidth=1.5;
    for(let bi=0;bi<3;bi++){const bx=(bi-1)*5;CX.beginPath();CX.moveTo(bx,-h/2+bob);CX.lineTo(bx,-h/2-8+bob);CX.stroke();}
    // Totem staff
    CX.strokeStyle='#5a3010';CX.lineWidth=2;CX.beginPath();CX.moveTo(hw/2,bob-2);CX.lineTo(hw/2+14,bob-18);CX.stroke();
    CX.fillStyle='#80ff40';CX.beginPath();CX.arc(hw/2+14,bob-18,5,0,Math.PI*2);CX.fill();
    CX.fillStyle='#fff';CX.globalAlpha=.4+Math.sin(G.tick*.12)*.4;CX.beginPath();CX.arc(hw/2+14,bob-18,3,0,Math.PI*2);CX.fill();CX.globalAlpha=1;
    const lob=e.grounded?Math.sin(e.fr*Math.PI/2)*5:0;
    CX.fillStyle='#1a1a0a';CX.fillRect(-hw/2+1,h/2-10+bob,hw/2-2,10+lob);CX.fillRect(1,h/2-10+bob,hw/2-2,10-lob);
  } else {
    // Goblin Archer
    CX.fillStyle=bc;CX.fillRect(-hw/2,-h/2+8+bob,hw,h-10);
    CX.fillStyle=fr?'#6090b8':'#2a1808';CX.fillRect(-hw/2+1,-h/2+10+bob,hw-2,h-18);
    CX.fillStyle=bc;CX.beginPath();CX.ellipse(0,-h/2+5+bob,hw/2-1,hw/2,0,0,Math.PI*2);CX.fill();
    CX.fillStyle='#1a0a00';CX.fillRect(-5,-h/2+3+bob,4,4);CX.fillRect(1,-h/2+3+bob,4,4);CX.fillStyle='#ff4';CX.fillRect(-4,-h/2+4+bob,2,2);CX.fillRect(2,-h/2+4+bob,2,2);
    CX.fillStyle='#3a1a00';CX.fillRect(-hw/2+1,-h/2+bob,hw-2,6);
    CX.beginPath();CX.moveTo(-hw/2+2,-h/2+bob);CX.lineTo(0,-h/2-9+bob);CX.lineTo(hw/2-2,-h/2+bob);CX.closePath();CX.fill();
    // Small bow
    CX.strokeStyle='#5a3010';CX.lineWidth=2;CX.beginPath();CX.arc(hw/2+6,bob,10,-.6,.6);CX.stroke();
    CX.strokeStyle='#d4c090';CX.lineWidth=.8;CX.beginPath();CX.moveTo(hw/2+1,bob-9);CX.lineTo(hw/2+1,bob+9);CX.stroke();
    const lob=e.grounded?Math.sin(e.fr*Math.PI/2)*5:0;
    CX.fillStyle='#2a1a00';CX.fillRect(-hw/2+1,h/2-10+bob,hw/2-2,10+lob);CX.fillRect(1,h/2-10+bob,hw/2-2,10-lob);
  }
  if(e.hp<e.maxHp){CX.fillStyle='#1a0a00';CX.fillRect(-hw/2,-h/2-8,hw,4);CX.fillStyle=fr?'#85b7eb':bu?'#ff8800':'#e24b4a';CX.fillRect(-hw/2,-h/2-8,hw*(e.hp/e.maxHp),4);}
  if(fr){CX.fillStyle='#85b7eb20';CX.fillRect(-hw/2,-h/2+bob,hw,h);}
  // Aim indicator — line toward player
  if(e.shootCd<20&&e.shootCd>0){CX.strokeStyle='rgba(255,100,0,.3)';CX.lineWidth=1;CX.setLineDash([3,3]);CX.beginPath();CX.moveTo(0,0);const pdx=G.player.x+G.player.w/2-(e.x+e.w/2),pdy=G.player.y+G.player.h/2-(e.y+e.h/2),plen=Math.hypot(pdx,pdy)||1;CX.lineTo(pdx/plen*40,pdy/plen*40);CX.stroke();CX.setLineDash([]);}
  CX.globalAlpha=1;CX.textAlign='left';CX.restore();
}

function drawTroll(e){
  if(!e.alive)return;
  CX.save();CX.translate(e.x+e.w/2,e.y+e.h/2);if(e.vx>=0)CX.scale(-1,1);
  const bob=e.grounded?Math.sin(e.fr*Math.PI/2)*2:0;
  const fl=e.dmgFlash>0,fr=e.frozen>0,bu=e.burn>0;
  const h=e.h,hw=e.w;
  const bc=fr?'#85b7eb':fl?'#fff':bu?'#ff8800':e.col;
  // Massive body
  CX.fillStyle=bc;CX.beginPath();CX.ellipse(0,bob,hw/2+2,h/2-2,0,0,Math.PI*2);CX.fill();
  // Rocky/mossy texture lines
  CX.strokeStyle=fr?'#aaddff':'#2a4a1a';CX.lineWidth=1.5;
  for(let i=-3;i<=3;i+=2){CX.beginPath();CX.moveTo(i*4,bob-h/4);CX.lineTo(i*4+3,bob+h/4);CX.stroke();}
  // Head — huge lumpy skull
  CX.fillStyle=bc;CX.beginPath();CX.ellipse(0,-h/2+2+bob,hw/2,hw/2+2,0,0,Math.PI*2);CX.fill();
  // Warts/lumps
  CX.fillStyle=fr?'#6090a0':'#3a5a2a';
  for(let wx=-1;wx<=1;wx++){CX.beginPath();CX.arc(wx*7,-h/2+bob,3,0,Math.PI*2);CX.fill();}
  // Eyes — small beady
  const ec=fr?'#aaddff':'#ff0';
  CX.fillStyle='#1a0a00';CX.beginPath();CX.ellipse(-5,-h/2+3+bob,3,2.5,0,0,Math.PI*2);CX.fill();CX.beginPath();CX.ellipse(5,-h/2+3+bob,3,2.5,0,0,Math.PI*2);CX.fill();
  CX.fillStyle=ec;CX.beginPath();CX.arc(-5,-h/2+3+bob,1.5,0,Math.PI*2);CX.fill();CX.beginPath();CX.arc(5,-h/2+3+bob,1.5,0,Math.PI*2);CX.fill();
  // Nose — big flat
  CX.fillStyle='#1a0a00';CX.beginPath();CX.ellipse(0,-h/2+8+bob,5,4,0,0,Math.PI*2);CX.fill();
  // Tusks (lower jaw)
  CX.fillStyle='#e8dfc0';CX.beginPath();CX.moveTo(-6,-h/2+12+bob);CX.lineTo(-5,-h/2+18+bob);CX.lineTo(-2,-h/2+12+bob);CX.closePath();CX.fill();
  CX.beginPath();CX.moveTo(6,-h/2+12+bob);CX.lineTo(5,-h/2+18+bob);CX.lineTo(2,-h/2+12+bob);CX.closePath();CX.fill();
  // Boulder arm
  if(e.boulder){CX.fillStyle=fr?'#8898a8':'#888878';CX.beginPath();CX.arc(hw/2+8,bob,10,0,Math.PI*2);CX.fill();CX.strokeStyle='#aaa';CX.lineWidth=1;CX.stroke();}
  else{CX.fillStyle=bc;CX.fillRect(hw/2-2,bob-8,hw/2+6,hw/2);}
  // Regen glow
  if(e.regenerates&&e.hp<e.maxHp&&G.tick%20<10){CX.fillStyle='rgba(0,255,100,0.15)';CX.beginPath();CX.ellipse(0,bob,hw/2+4,h/2,0,0,Math.PI*2);CX.fill();}
  // Legs
  const lob=e.grounded?Math.sin(e.fr*Math.PI/2)*6:0;
  CX.fillStyle=fr?'#5090c0':'#2a4a1a';CX.fillRect(-hw/2+1,h/2-14+bob,hw/2-2,14+lob);CX.fillRect(1,h/2-14+bob,hw/2-2,14-lob);
  if(e.hp<e.maxHp){CX.fillStyle='#1a0a00';CX.fillRect(-hw/2,-h/2-9,hw,5);CX.fillStyle=fr?'#85b7eb':'#00cc44';CX.fillRect(-hw/2,-h/2-9,hw*(e.hp/e.maxHp),5);}
  CX.globalAlpha=1;CX.textAlign='left';CX.restore();
}

function drawVampire(e){
  if(!e.alive)return;
  CX.save();CX.translate(e.x+e.w/2,e.y+e.h/2);if(e.vx>=0)CX.scale(-1,1);
  const bob=e.grounded?Math.sin(e.fr*Math.PI/2)*2:0;
  const fl=e.dmgFlash>0,fr=e.frozen>0,bu=e.burn>0;
  const h=e.h,hw=e.w;
  const bc=fr?'#85b7eb':fl?'#fff':bu?'#ff8800':e.col;
  // Cape
  CX.fillStyle=fr?'#4a5060':'#1a0810';
  CX.beginPath();CX.moveTo(-hw/2-4,bob-h/4);CX.lineTo(-hw/2-8,bob+h/2+4);CX.lineTo(hw/2+8,bob+h/2+4);CX.lineTo(hw/2+4,bob-h/4);CX.closePath();CX.fill();
  // Cape lining
  CX.fillStyle=fr?'#3a4050':'#4a0820';
  CX.beginPath();CX.moveTo(-hw/2-4,bob-h/4+4);CX.lineTo(-hw/2-6,bob+h/2+2);CX.lineTo(-hw/2,bob+h/2+2);CX.lineTo(-hw/2+2,bob-h/4+4);CX.closePath();CX.fill();
  // Body in tux
  CX.fillStyle=bc;CX.fillRect(-hw/2,bob-h/4,hw,h/2+2);
  CX.fillStyle='#f0f0f0';CX.fillRect(-3,bob-h/4,6,10); // white shirt front
  // Head — pale aristocrat
  CX.fillStyle=fr?'#c0d8f0':'#d8c8c8';CX.beginPath();CX.ellipse(0,-h/2+5+bob,hw/2-1,hw/2+1,0,0,Math.PI*2);CX.fill();
  // Widow's peak hair
  CX.fillStyle='#1a0808';
  CX.beginPath();CX.moveTo(-hw/2+2,-h/2+bob);CX.lineTo(0,-h/2-6+bob);CX.lineTo(hw/2-2,-h/2+bob);CX.closePath();CX.fill();
  // Eyes — glowing red
  const ec=fr?'#aaddff':'#ff0044';
  CX.fillStyle='#0a0a0a';CX.fillRect(-5,-h/2+3+bob,4,4);CX.fillRect(1,-h/2+3+bob,4,4);
  CX.fillStyle=ec;CX.beginPath();CX.arc(-3,-h/2+5+bob,1.8,0,Math.PI*2);CX.fill();CX.beginPath();CX.arc(3,-h/2+5+bob,1.8,0,Math.PI*2);CX.fill();
  // Fangs
  CX.fillStyle='#fff';CX.fillRect(-4,-h/2+10+bob,2,4);CX.fillRect(2,-h/2+10+bob,2,4);
  // Drain aura when close to player
  if(e.drains&&Math.hypot(e.x-(G.player?.x||0),e.y-(G.player?.y||0))<80){
    CX.globalAlpha=.2+Math.sin(G.tick*.15)*.1;CX.fillStyle='#ff0044';
    CX.beginPath();CX.arc(0,bob,20,0,Math.PI*2);CX.fill();CX.globalAlpha=1;
  }
  if(e.lord){CX.fillStyle='#8b0020';CX.fillRect(-hw/2+1,-h/2+bob,hw-2,5);CX.fillStyle='#ff88aa';CX.font='9px sans-serif';CX.textAlign='center';CX.fillText('♦',0,-h/2-6+bob);}
  // Legs
  const lob=e.grounded?Math.sin(e.fr*Math.PI/2)*5:0;
  CX.fillStyle=bc;CX.fillRect(-hw/2+1,h/2-10+bob,hw/2-2,10+lob);CX.fillRect(1,h/2-10+bob,hw/2-2,10-lob);
  if(e.hp<e.maxHp){CX.fillStyle='#1a0a00';CX.fillRect(-hw/2,-h/2-8,hw,4);CX.fillStyle=fr?'#85b7eb':'#ff0044';CX.fillRect(-hw/2,-h/2-8,hw*(e.hp/e.maxHp),4);}
  CX.globalAlpha=1;CX.textAlign='left';CX.restore();
}

function drawWerewolf(e){
  if(!e.alive)return;
  CX.save();CX.translate(e.x+e.w/2,e.y+e.h/2);if(e.vx>=0)CX.scale(-1,1);
  const bob=e.grounded?Math.sin(e.fr*Math.PI/2)*2:0;
  const fl=e.dmgFlash>0,fr=e.frozen>0,bu=e.burn>0;
  const h=e.h,hw=e.w;
  const bc=fr?'#85b7eb':fl?'#fff':bu?'#ff8800':e.col;
  // Hunched body
  CX.fillStyle=bc;CX.beginPath();CX.ellipse(0,bob,hw/2+1,h/2-2,-.2,0,Math.PI*2);CX.fill();
  // Fur texture lines
  CX.strokeStyle=fr?'#6090a8':'#2a1a08';CX.lineWidth=1;
  for(let fy=bob-h/3;fy<bob+h/3;fy+=5){for(let fx=-hw/2;fx<hw/2;fx+=6){CX.beginPath();CX.moveTo(fx,fy);CX.lineTo(fx+3,fy-3);CX.stroke();}}
  // Head — wolf snout
  CX.fillStyle=bc;CX.beginPath();CX.ellipse(-3,-h/2+4+bob,hw/2,hw/2,-.2,0,Math.PI*2);CX.fill();
  // Snout
  CX.fillStyle=fr?'#7090a8':e.alpha?'#1a0a00':'#2a1a08';
  CX.beginPath();CX.ellipse(5,-h/2+7+bob,7,5,0,0,Math.PI*2);CX.fill();
  CX.fillStyle='#1a1010';CX.beginPath();CX.arc(9,-h/2+6+bob,2,0,Math.PI*2);CX.fill();
  // Eyes — glowing amber
  const ec=fr?'#aaddff':'#ff8800';
  CX.fillStyle=ec;CX.beginPath();CX.arc(-5,-h/2+1+bob,3,0,Math.PI*2);CX.fill();CX.beginPath();CX.arc(1,-h/2+1+bob,3,0,Math.PI*2);CX.fill();
  CX.fillStyle='#111';CX.beginPath();CX.arc(-5,-h/2+1+bob,1.5,0,Math.PI*2);CX.fill();CX.beginPath();CX.arc(1,-h/2+1+bob,1.5,0,Math.PI*2);CX.fill();
  // Ears (pointy)
  CX.fillStyle=bc;
  CX.beginPath();CX.moveTo(-8,-h/2+bob);CX.lineTo(-12,-h/2-10+bob);CX.lineTo(-3,-h/2+bob);CX.closePath();CX.fill();
  CX.beginPath();CX.moveTo(1,-h/2+bob);CX.lineTo(4,-h/2-9+bob);CX.lineTo(7,-h/2+bob);CX.closePath();CX.fill();
  // Claws
  CX.strokeStyle=fr?'#aaddff':'#888888';CX.lineWidth=2;
  for(let c=0;c<3;c++){CX.beginPath();CX.moveTo(hw/2+c*4,bob);CX.lineTo(hw/2+c*4+3,bob+6);CX.stroke();}
  // Alpha crown effect
  if(e.alpha){CX.fillStyle='rgba(255,68,0,0.2)';CX.beginPath();CX.ellipse(0,bob,hw/2+6,h/2+2,0,0,Math.PI*2);CX.fill();}
  // Legs
  const lob=e.grounded?Math.sin(e.fr*Math.PI/2)*5:0;
  CX.fillStyle=bc;CX.fillRect(-hw/2+1,h/2-10+bob,hw/2-2,10+lob);CX.fillRect(1,h/2-10+bob,hw/2-2,10-lob);
  if(e.hp<e.maxHp){CX.fillStyle='#1a0a00';CX.fillRect(-hw/2,-h/2-8,hw,4);CX.fillStyle=fr?'#85b7eb':'#ff8800';CX.fillRect(-hw/2,-h/2-8,hw*(e.hp/e.maxHp),4);}
  CX.globalAlpha=1;CX.textAlign='left';CX.restore();
}

function drawSpider(e){
  if(!e.alive)return;
  CX.save();CX.translate(e.x+e.w/2,e.y+e.h/2);
  const bob=e.grounded?Math.sin(e.fr*Math.PI/2)*1.5:0;
  const fl=e.dmgFlash>0,fr=e.frozen>0,bu=e.burn>0;
  const h=e.h,hw=e.w;
  const bc=fr?'#85b7eb':fl?'#fff':bu?'#ff8800':e.col;
  // 8 legs (4 each side)
  const legAngles=[.4,.7,1.0,1.3];
  [-1,1].forEach(side=>{
    legAngles.forEach((ang,i)=>{
      const legBob=Math.sin(G.tick*.2+i)*4;
      CX.strokeStyle=fr?'#7090a8':bc;CX.lineWidth=2;
      CX.beginPath();CX.moveTo(side*hw/3,bob);CX.lineTo(side*(hw/2+hw/3),bob+4+legBob);CX.lineTo(side*(hw/2+hw/2),bob+h/2+legBob);CX.stroke();
    });
  });
  // Abdomen
  CX.fillStyle=bc;CX.beginPath();CX.ellipse(0,bob+4,hw/3,h/2,0,0,Math.PI*2);CX.fill();
  // Hourglass on abdomen for venom spider
  if(e.venomous){CX.fillStyle='#ff0000';CX.beginPath();CX.moveTo(-4,bob+2);CX.lineTo(0,bob+6);CX.lineTo(4,bob+2);CX.closePath();CX.fill();CX.beginPath();CX.moveTo(-4,bob+10);CX.lineTo(0,bob+6);CX.lineTo(4,bob+10);CX.closePath();CX.fill();}
  // Head
  CX.fillStyle=bc;CX.beginPath();CX.ellipse(0,bob-h/3,hw/4,hw/5,0,0,Math.PI*2);CX.fill();
  // 8 eyes
  const ec=fr?'#aaddff':e.queen?'#ff44ff':e.venomous?'#00ff44':'#ff4400';
  for(let ex2=-3;ex2<=3;ex2+=2){CX.fillStyle=ec;CX.beginPath();CX.arc(ex2,bob-h/3-2,1.5,0,Math.PI*2);CX.fill();}
  // Mandibles
  CX.strokeStyle=fr?'#7090a8':'#3a3a1a';CX.lineWidth=1.5;
  CX.beginPath();CX.moveTo(-3,bob-h/3+4);CX.lineTo(-6,bob-h/3+8);CX.stroke();
  CX.beginPath();CX.moveTo(3,bob-h/3+4);CX.lineTo(6,bob-h/3+8);CX.stroke();
  // Queen crown
  if(e.queen){CX.fillStyle='#ff44ff';CX.font='10px sans-serif';CX.textAlign='center';CX.fillText('♛',0,bob-h/2-2);}
  if(e.hp<e.maxHp){CX.fillStyle='#1a0a00';CX.fillRect(-hw/2,-h/2-8,hw,4);CX.fillStyle=fr?'#85b7eb':e.venomous?'#00ff44':'#e24b4a';CX.fillRect(-hw/2,-h/2-8,hw*(e.hp/e.maxHp),4);}
  CX.globalAlpha=1;CX.textAlign='left';CX.restore();
}

function drawGolem(e){
  if(!e.alive)return;
  CX.save();CX.translate(e.x+e.w/2,e.y+e.h/2);if(e.vx>=0)CX.scale(-1,1);
  const bob=e.grounded?Math.sin(e.fr*Math.PI/2)*1:0; // barely bobs — heavy
  const fl=e.dmgFlash>0,fr=e.frozen>0,bu=e.burn>0;
  const h=e.h,hw=e.w;
  const bc=fr?'#85b7eb':fl?'#fff':bu?'#ff6600':e.col;
  const lavaGlow=e.isLava&&G.tick%20<10;
  // Massive stone body
  CX.fillStyle=bc;CX.fillRect(-hw/2,-h/2+6+bob,hw,h-6);
  CX.strokeStyle=fr?'#aaddff':e.isLava?'#ff4400':'#888878';CX.lineWidth=2;CX.strokeRect(-hw/2,-h/2+6+bob,hw,h-6);
  // Stone crack lines
  CX.strokeStyle=fr?'#7090a8':e.isLava?'#ff6600':'#5a5040';CX.lineWidth=1;
  CX.beginPath();CX.moveTo(-hw/4,-h/4+bob);CX.lineTo(0,bob);CX.lineTo(hw/4,-h/6+bob);CX.stroke();
  CX.beginPath();CX.moveTo(-hw/3,h/4+bob);CX.lineTo(-hw/6,bob);CX.stroke();
  // Lava glow in cracks
  if(e.isLava){CX.strokeStyle=lavaGlow?'#ff4400':'#ff8800';CX.lineWidth=2;CX.beginPath();CX.moveTo(-hw/4,-h/4+bob);CX.lineTo(0,bob);CX.lineTo(hw/4,-h/6+bob);CX.stroke();}
  // Head — squared-off boulder
  CX.fillStyle=bc;CX.fillRect(-hw/2+2,-h/2+bob,hw-4,14);
  CX.strokeStyle=fr?'#aaddff':e.isLava?'#ff4400':'#888878';CX.lineWidth=1.5;CX.strokeRect(-hw/2+2,-h/2+bob,hw-4,14);
  // Eyes — glowing gems
  const ec=fr?'#aaddff':e.isLava?'#ff4400':'#f80';
  CX.fillStyle=ec;
  if(e.isLava){CX.globalAlpha=.5+Math.sin(G.tick*.1)*.4;}
  CX.beginPath();CX.arc(-6,-h/2+7+bob,4,0,Math.PI*2);CX.fill();CX.beginPath();CX.arc(6,-h/2+7+bob,4,0,Math.PI*2);CX.fill();
  CX.globalAlpha=1;
  CX.fillStyle='#1a0a00';CX.beginPath();CX.arc(-6,-h/2+7+bob,2,0,Math.PI*2);CX.fill();CX.beginPath();CX.arc(6,-h/2+7+bob,2,0,Math.PI*2);CX.fill();
  // Stone fists
  CX.fillStyle=bc;CX.fillRect(hw/2-2,bob-6,hw/3+4,hw/3+4);CX.strokeStyle=fr?'#aaddff':'#888878';CX.lineWidth=1;CX.strokeRect(hw/2-2,bob-6,hw/3+4,hw/3+4);
  // Lava drips
  if(e.isLava){CX.fillStyle='#ff4400';for(let d=0;d<3;d++){const dx=(d-1)*8,dy=Math.sin(G.tick*.08+d)*6;CX.beginPath();CX.arc(dx,h/4+dy+bob,3,0,Math.PI*2);CX.fill();}}
  // Legs — stone slabs
  const lob=e.grounded?Math.sin(e.fr*Math.PI/2)*3:0;
  CX.fillStyle=bc;CX.fillRect(-hw/2+1,h/2-14+bob,hw/2-2,14+lob);CX.fillRect(1,h/2-14+bob,hw/2-2,14-lob);
  CX.strokeStyle=fr?'#aaddff':'#888878';CX.lineWidth=1;CX.strokeRect(-hw/2+1,h/2-14+bob,hw/2-2,14+lob);CX.strokeRect(1,h/2-14+bob,hw/2-2,14-lob);
  if(e.hp<e.maxHp){CX.fillStyle='#1a0a00';CX.fillRect(-hw/2,-h/2-9,hw,5);CX.fillStyle=fr?'#85b7eb':e.isLava?'#ff4400':'#e24b4a';CX.fillRect(-hw/2,-h/2-9,hw*(e.hp/e.maxHp),5);}
  CX.globalAlpha=1;CX.textAlign='left';CX.restore();
}

function drawEnemy(e){
  if(!e.alive)return;
  if(e.isRanged)drawRangedEnemy(e);
  else if(e.etype==='troll')drawTroll(e);
  else if(e.isVampire)drawVampire(e);
  else if(e.isWerewolf)drawWerewolf(e);
  else if(e.isSpider)drawSpider(e);
  else if(e.isGolem)drawGolem(e);
  else if(e.etype==='undead')drawUndead(e);
  else if(e.etype==='orc')drawOrc(e);
  else drawGoblin(e);
}

function drawGoblin(e){
  if(!e.alive)return;
  CX.save();CX.translate(e.x+e.w/2,e.y+e.h/2);if(e.vx>=0)CX.scale(-1,1);
  const bob=e.grounded?Math.sin(e.fr*Math.PI/2)*2:0;
  const fl=e.dmgFlash>0,fr=e.frozen>0,bu=e.burn>0;
  const bc=fr?'#85b7eb':fl?'#fff':bu?'#ff8800':e.col,h=e.h,hw=e.w;
  CX.fillStyle=bc;CX.fillRect(-hw/2,-h/2+8+bob,hw,h-10);
  if(e.tier>=2){CX.fillStyle=fr?'#6090b8':fl?'#ccc':'#4a3010';CX.fillRect(-hw/2+1,-h/2+10+bob,hw-2,h-18);}
  CX.fillStyle=bc;CX.beginPath();CX.ellipse(0,-h/2+5+bob,hw/2-1,hw/2,0,0,Math.PI*2);CX.fill();
  const ec=fr?'#aaddff':fl?'#fff':e.eye;
  CX.fillStyle='#1a0a00';CX.fillRect(-5,-h/2+3+bob,4,4);CX.fillRect(1,-h/2+3+bob,4,4);CX.fillStyle=ec;CX.fillRect(-4,-h/2+4+bob,2,2);CX.fillRect(2,-h/2+4+bob,2,2);
  CX.fillStyle='#2a1a00';CX.fillRect(-1,-h/2+7+bob,2,2);CX.fillStyle='#1a0a00';CX.beginPath();CX.arc(0,-h/2+10+bob,3,0,Math.PI);CX.fill();CX.fillStyle='#ffe';CX.fillRect(-3,-h/2+10+bob,2,2);CX.fillRect(1,-h/2+10+bob,2,2);
  CX.fillStyle=e.cap||'#8b3a20';
  if(e.shaman){CX.beginPath();CX.moveTo(-hw/2+1,-h/2+1+bob);CX.lineTo(hw/2-1,-h/2+1+bob);CX.lineTo(hw/2-4,-h/2-18+bob);CX.lineTo(0,-h/2-28+bob);CX.lineTo(-(hw/2-4),-h/2-18+bob);CX.closePath();CX.fill();CX.fillStyle='#f5c842';CX.font='9px sans-serif';CX.textAlign='center';CX.fillText('★',0,-h/2-12+bob);}
  else if(e.tier>=3){CX.fillStyle='#5a5040';CX.fillRect(-hw/2+1,-h/2+bob,hw-2,7);CX.fillStyle='#8a7050';CX.beginPath();CX.moveTo(-hw/2+2,-h/2+bob);CX.lineTo(-hw/2-4,-h/2-10+bob);CX.lineTo(-hw/2+5,-h/2+bob);CX.closePath();CX.fill();CX.beginPath();CX.moveTo(hw/2-2,-h/2+bob);CX.lineTo(hw/2+4,-h/2-10+bob);CX.lineTo(hw/2-5,-h/2+bob);CX.closePath();CX.fill();}
  else{CX.fillRect(-hw/2+1,-h/2+bob,hw-2,6);CX.beginPath();CX.moveTo(-hw/2+2,-h/2+bob);CX.lineTo(0,-h/2-10+bob);CX.lineTo(hw/2-2,-h/2+bob);CX.closePath();CX.fill();}
  CX.fillStyle=bc;CX.beginPath();CX.ellipse(-hw/2,-h/2+6+bob,3,4,-.3,0,Math.PI*2);CX.fill();CX.beginPath();CX.ellipse(hw/2,-h/2+6+bob,3,4,.3,0,Math.PI*2);CX.fill();
  CX.fillStyle=fr?'#5090c0':'#2a1a00';const lob=e.grounded?Math.sin(e.fr*Math.PI/2)*5:0;
  CX.fillRect(-hw/2+1,h/2-10+bob,hw/2-2,10+lob);CX.fillRect(1,h/2-10+bob,hw/2-2,10-lob);
  CX.strokeStyle=fr?'#85b7eb':'#8b6914';CX.lineWidth=2;
  if(e.tier>=2){CX.beginPath();CX.moveTo(hw/2,bob-2);CX.lineTo(hw/2+12,bob+6);CX.stroke();}
  else{CX.beginPath();CX.moveTo(hw/2,bob-1);CX.lineTo(hw/2+10,bob+5);CX.stroke();CX.fillStyle='#5a3a10';CX.beginPath();CX.ellipse(hw/2+10,bob+6,4,3,.5,0,Math.PI*2);CX.fill();}
  if(e.hp<e.maxHp){CX.fillStyle='#1a0a00';CX.fillRect(-hw/2,-h/2-8,hw,4);CX.fillStyle=fr?'#85b7eb':bu?'#ff8800':'#e24b4a';CX.fillRect(-hw/2,-h/2-8,hw*(e.hp/e.maxHp),4);}
  if(e.marked&&e.markedTimer>0){CX.fillStyle='#97c459';CX.font='12px sans-serif';CX.textAlign='center';CX.fillText('🎯',0,-h/2-18);CX.textAlign='left';}
  if(fr){CX.fillStyle='#85b7eb20';CX.fillRect(-hw/2,-h/2+bob,hw,h);}
  CX.globalAlpha=1;CX.textAlign='left';CX.restore();
}

function drawProjs(){
  G.projs.forEach(pr=>{
    pr.trail.forEach((t,i)=>{CX.globalAlpha=(i/pr.trail.length)*.38*Math.min(pr.life,1);CX.fillStyle=pr.color;CX.beginPath();CX.arc(t.x,t.y,pr.radius*(i/pr.trail.length)*.7,0,Math.PI*2);CX.fill();});
    CX.globalAlpha=Math.min(pr.life,1);CX.fillStyle=pr.color;CX.beginPath();CX.arc(pr.x,pr.y,pr.radius,0,Math.PI*2);CX.fill();
    if(pr.type==='arrow'||pr.isDynamite){CX.fillStyle='#fff';CX.globalAlpha=Math.min(pr.life*.35,1);CX.beginPath();CX.arc(pr.x-pr.radius*.3,pr.y-pr.radius*.3,pr.radius*.35,0,Math.PI*2);CX.fill();}
    if(pr.isSaber){
      // Draw as lightsaber blade
      CX.save();
      const angle=Math.atan2(pr.vy,pr.vx);
      CX.translate(pr.x,pr.y);CX.rotate(angle);
      CX.shadowColor=pr.color;CX.shadowBlur=8;
      CX.strokeStyle=pr.color;CX.lineWidth=4;CX.globalAlpha=Math.min(pr.life,1);
      CX.beginPath();CX.moveTo(-18,0);CX.lineTo(18,0);CX.stroke();
      CX.strokeStyle='#fff';CX.lineWidth=1.5;
      CX.beginPath();CX.moveTo(-18,0);CX.lineTo(18,0);CX.stroke();
      CX.shadowBlur=0;CX.restore();
    }
    // Enemy spell glow
    if((pr.type==='enemySpell')&&!pr.isEnemyProj===false){
      CX.globalAlpha=Math.min(pr.life,.7);
      CX.fillStyle=pr.color;CX.beginPath();CX.arc(pr.x,pr.y,pr.radius*1.5,0,Math.PI*2);CX.fill();
    }
    CX.globalAlpha=1;
  });
}

function drawTraps(){
  G.traps.forEach(trap=>{
    if(trap.armed>0){
      CX.fillStyle='#ff8800';CX.globalAlpha=.5+Math.sin(G.tick*.3)*.3;
      CX.fillRect(trap.x-8,trap.y-4,16,8);CX.globalAlpha=1;
    } else {
      CX.strokeStyle='#ff4400';CX.globalAlpha=.4+Math.sin(G.tick*.5)*.3;CX.lineWidth=1;
      CX.beginPath();CX.arc(trap.x,trap.y,trap.radius*.3,0,Math.PI*2);CX.stroke();
      CX.globalAlpha=1;
    }
  });
}

function drawEffects(){
  if(G.swingAnim){
    const sw=G.swingAnim;
    CX.save();CX.translate(sw.x,sw.y);
    const swCol=sw.col||'rgba(200,192,168,1)';
    // Parse colour for alpha
    CX.strokeStyle=swCol;CX.globalAlpha=sw.t/12;CX.lineWidth=3;
    CX.shadowColor=swCol;CX.shadowBlur=sw.col?8:0;
    const startA=sw.full?0:(sw.facing===1?-.3:Math.PI-.3);
    const endA=sw.full?Math.PI*2:(sw.facing===1?.3+Math.PI*.5:Math.PI+.3+Math.PI*.5);
    if(sw.full){for(let a=0;a<Math.PI*2;a+=.3){CX.beginPath();CX.moveTo(0,0);CX.lineTo(Math.cos(a)*sw.range,Math.sin(a)*sw.range);CX.stroke();}}
    else{CX.beginPath();CX.arc(0,0,sw.range,startA,endA);CX.stroke();}
    CX.shadowBlur=0;CX.globalAlpha=1;
    CX.restore();
  }
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
  if(G.lassoAnim){
    const la=G.lassoAnim;
    CX.strokeStyle=`rgba(212,134,10,${la.t/20})`;CX.lineWidth=2;CX.setLineDash([4,4]);
    CX.beginPath();CX.moveTo(la.x1,la.y1);CX.lineTo(la.x2,la.y2);CX.stroke();CX.setLineDash([]);
  }
}

function draw(){
  drawBg();
  if(!G.running&&!G.curClass)return;
  if(!G.running&&G.tick===0)return;
  drawProjs();drawTraps();drawEffects();
  G.enemies.forEach(e=>{ if(!e.alive)return; if(e.etype==="undead")drawUndead(e); else if(e.etype==="orc")drawOrc(e); else drawGoblin(e); });
  if(G.running||G.tick>0){CLASSES[G.curClass]?.drawPlayer(G.player,CX,G.tick);}
G.parts.forEach(pt=>{
  CX.globalAlpha=Math.min(1,pt.life);
  CX.fillStyle=pt.ramp ? rampCol(pt.ramp,pt.life) : pt.col;
  const s=Math.max(0,pt.sz*Math.min(1,pt.life));
  CX.beginPath();
  CX.arc(pt.x, pt.y, s/2, 0, Math.PI*2);
  CX.fill();
});CX.globalAlpha=1;
CX.globalAlpha=1;
  CX.globalAlpha=1;
  G.floats.forEach(f=>{CX.globalAlpha=f.life;CX.font="bold 12px 'Courier New',monospace";CX.fillStyle=f.col;CX.textAlign='center';CX.fillText(f.txt,f.x,f.y);});CX.globalAlpha=1;CX.textAlign='left';
  if(G.stormTick>0){CX.fillStyle='#f5c842';CX.font="10px 'Courier New',monospace";CX.fillText('STORM: '+Math.ceil(G.stormTick/60)+'s',8,16);}
  if(G.spawnDelay>0){
    const secs=Math.ceil(G.spawnDelay/60);
    CX.textAlign='center';
    CX.fillStyle='rgba(0,0,0,.5)';CX.fillRect(W/2-80,H/2-55,160,48);
    CX.font="bold 16px 'Courier New',monospace";CX.fillStyle='#f5c842';
    CX.fillText('Goblins incoming in...',W/2,H/2-36);
    CX.font="bold 28px 'Courier New',monospace";CX.fillStyle='#e24b4a';
    CX.fillText(secs+'s',W/2,H/2-12);
    CX.textAlign='left';
  }
  const al=G.enemies.filter(e=>e.alive).length;
  CX.fillStyle='#4a6830';CX.font="10px 'Courier New',monospace";CX.fillText('goblins: '+al,W-90,16);
  if(!G.running&&G.tick>0){
    CX.fillStyle='rgba(0,0,0,.75)';CX.fillRect(0,0,W,H);CX.textAlign='center';
    const cls=CLASSES[G.curClass];
    CX.font="bold 24px Georgia,serif";CX.fillStyle=cls.col;CX.fillText(cls.name+' has fallen!',W/2,H/2-22);
    CX.font="13px 'Courier New',monospace";CX.fillStyle='#ccc';CX.fillText('Wave '+G.wave+' · Score '+G.score+' · Level '+G.level,W/2,H/2+10);
    CX.fillStyle='#555';CX.font="11px 'Courier New',monospace";CX.fillText('click [ Restart ] or choose a new class',W/2,H/2+40);CX.textAlign='left';
  }
}

// ── BOOT ──────────────────────────────────────────────────────
buildClassSelect();
updateHUD();draw();
let lastTime = 0;
requestAnimationFrame(function loop(ts){
  if(ts - lastTime < 16.6){  // 16.6ms = 60fps cap
    requestAnimationFrame(loop);
    return;
  }
  lastTime = ts;
  update();
  draw();
  requestAnimationFrame(loop);
});
