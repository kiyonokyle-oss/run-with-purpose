const TAU = Math.PI * 2;
const C = {ink:'#344932',dark:'#334731',deep:'#253c2c',leaf:'#506640',sage:'#929f71',sand:'#d0bb79',light:'#e9dfad'};
const hash = n => { const v = Math.sin(n*127.1+311.7)*43758.5453; return v-Math.floor(v); };
function path(ctx,points,fill){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fillStyle=fill;ctx.fill();}
function ellipse(ctx,x,y,rx,ry,fill){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fillStyle=fill;ctx.fill();}
function line(ctx,points,color,width=1){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();}
function mountain(ctx,w,y,seed,height,color,shift){const pts=[[-30,540]];for(let x=-80;x<=w+100;x+=40){let n=(x+shift)/180;let v=Math.sin(n+seed)*.5+Math.sin(n*2.3+seed)*.24+Math.sin(n*4.1+seed)*.08;pts.push([x,y+v*height]);}pts.push([w+100,540]);path(ctx,pts,color);}
function arch(ctx,x,y,s){ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  path(ctx,[[-68,0],[-68,-178],[-56,-199],[-25,-217],[21,-220],[54,-205],[73,-179],[80,0]],'#a09d6b');
  path(ctx,[[65,0],[60,-169],[40,-191],[12,-204],[21,-220],[54,-205],[73,-179],[80,0]],'#898b5f');
  ctx.fillStyle='#c5bf8b';ctx.beginPath();ctx.moveTo(-68,0);ctx.lineTo(-68,-166);ctx.bezierCurveTo(-67,-238,64,-240,65,-166);ctx.lineTo(65,0);ctx.lineTo(35,0);ctx.lineTo(35,-160);ctx.bezierCurveTo(35,-208,-39,-208,-39,-160);ctx.lineTo(-39,0);ctx.closePath();ctx.fill();
  path(ctx,[[-68,0],[-68,-162],[-59,-167],[-58,0]],'#d7cc98');
  ctx.strokeStyle='#8b946555';ctx.lineWidth=1.2;[-42,-79,-116,-153].forEach((v,i)=>{line(ctx,[[-68,v],[-39,v+1]],'#88936566');line(ctx,[[35,v],[65,v-2]],'#88936566');line(ctx,[[-54+(i%2)*7,v],[-54+(i%2)*7,v+34]],'#88936544')});
  for(let i=0;i<7;i++){let a=Math.PI+i*Math.PI/6;line(ctx,[[Math.cos(a)*39,-162+Math.sin(a)*39],[Math.cos(a)*65,-162+Math.sin(a)*66]],'#8d956666');}
  path(ctx,[[-74,0],[-72,-12],[-34,-11],[-33,0]],'#b7b182');path(ctx,[[30,0],[33,-11],[72,-12],[76,0]],'#a7a577');
  line(ctx,[[-64,-127],[-52,-130],[-56,-142],[-45,-151]],'#969968',1);line(ctx,[[51,-47],[47,-58],[55,-69]],'#969968',1);
  ctx.restore();
}
function tree(ctx,x,y,s,flip=1){ctx.save();ctx.translate(x,y);ctx.scale(s*flip,s);line(ctx,[[0,0],[3,-62],[17,-130],[12,-177]],'#4b603f',12);line(ctx,[[6,-70],[-15,-123],[-50,-154]],'#4b603f',7);line(ctx,[[10,-99],[41,-143],[66,-151]],'#4b603f',6);line(ctx,[[17,-124],[43,-177]],'#4b603f',5);for(let i=0;i<32;i++){const angle=hash(i+8)*TAU;const r=Math.sqrt(hash(i+43));ellipse(ctx,8+Math.cos(angle)*89*r,-167+Math.sin(angle)*42*r,15+hash(i+77)*16,7+hash(i+14)*7,i%3===0?'#66764c':i%3===1?'#576d44':'#758259');}ctx.restore();}
function grass(ctx,x,y,s,color){ctx.save();ctx.translate(x,y);ctx.scale(s,s);for(let i=0;i<7;i++){let endX=(i-3)*4;ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(endX*.15,-10-hash(i)*15,endX,-13-hash(i+6)*19);ctx.strokeStyle=color;ctx.lineWidth=1.6;ctx.stroke();}ctx.restore();}
function rock(ctx,x,ground,width,height){ellipse(ctx,x+width*.53,ground+2,width*.65,5,'#34493226');path(ctx,[[x,ground],[x+5,ground-height*.65],[x+width*.3,ground-height],[x+width*.69,ground-height*.94],[x+width,ground-height*.45],[x+width,ground]],'#697456');path(ctx,[[x+5,ground-height*.65],[x+width*.3,ground-height],[x+width*.69,ground-height*.94],[x+width*.64,ground-height*.62]],'#9aa17a');path(ctx,[[x+width*.64,ground-height*.62],[x+width*.69,ground-height*.94],[x+width,ground-height*.45],[x+width,ground]],'#566548');line(ctx,[[x+width*.3,ground-height],[x+width*.43,ground-height*.6],[x+width*.33,ground-height*.26]],'#455c4233',1.5);}
function branch(ctx,x,ground,w,h,bottom){ctx.save();ctx.translate(x,ground-bottom);ctx.scale(1,h/100);ctx.strokeStyle='#536445';ctx.lineCap='round';ctx.lineWidth=16;ctx.beginPath();ctx.moveTo(4,-7);ctx.bezierCurveTo(22,-14,w*.6,-4,w-2,-12);ctx.stroke();line(ctx,[[w*.85,-10],[w*.72,-45],[w*.83,-72]],'#536445',9);line(ctx,[[w*.72,-46],[w*.45,-64],[w*.34,-85]],'#536445',6);line(ctx,[[w*.45,-10],[w*.34,-35],[w*.18,-42]],'#536445',6);for(let i=0;i<11;i++){ellipse(ctx,w*(.2+hash(i+82)*.68),-40-hash(i+13)*50,10+hash(i)*7,5,i%2?'#8b9564':'#6f8050');}line(ctx,[[8,-10],[w*.4,-11],[w*.6,-8]],'#8c9060',2);ctx.restore();}
function light(ctx,x,y,t,i){const pulse=1+Math.sin(t*3+i)*.1;ctx.save();ctx.translate(x,y+Math.sin(t*2+i)*3);ctx.scale(pulse,pulse);let g=ctx.createRadialGradient(0,0,0,0,0,25);g.addColorStop(0,'#fff5b5bb');g.addColorStop(.35,'#f6dfa055');g.addColorStop(1,'#f6dfa000');ctx.fillStyle=g;ctx.fillRect(-26,-26,52,52);path(ctx,[[0,-10],[3,-3],[8,0],[3,3],[0,10],[-3,3],[-8,0],[-3,-3]],'#fff0af');path(ctx,[[0,-6],[2,0],[0,6],[-2,0]],'#fffae3');ctx.restore();}
function runner(ctx,x,ground,p,time,status){const airborne=p.y>1, sliding=p.sliding;const moving=status==='running';let gait=moving?Math.sin(time*17):Math.sin(time*2)*.08;const bob=moving&&!airborne&&!sliding?Math.abs(Math.cos(time*17))*2:0;ellipse(ctx,x+5,ground+3,airborne?20:27,4,'#31442e30');ctx.save();ctx.translate(x,ground-p.y-bob);if(status==='dying'||status==='over'){ctx.translate(0,-15);ctx.rotate(-Math.min(1,(.65-(p.collisionTimer||0))/.65)*1.3);ctx.translate(0,15)}if(p.landTimer>0)ctx.scale(1+p.landTimer,1-p.landTimer*.65);if(sliding){line(ctx,[[-14,-6],[7,-7],[26,-4]],'#6c573d',7);line(ctx,[[24,-4],[31,-3]],'#45432f',5);path(ctx,[[-17,-10],[-7,-23],[12,-23],[21,-10],[11,-7]],'#eee3b9');line(ctx,[[-13,-13],[12,-14]],'#a46548',4);line(ctx,[[-15,-13],[-31,-10],[-39,-14]],'#ad7150',4);ellipse(ctx,13,-26,7,7,'#b99160');path(ctx,[[7,-26],[5,-31],[9,-35],[16,-33],[20,-28],[12,-30],[11,-25]],'#4a4831');line(ctx,[[9,-17],[23,-13],[29,-18]],'#b58a58',5);ctx.restore();return;}
  // Sandals and limbs follow a two-beat run cycle; the robe and sash lag behind.
  const rear=airborne?-12:gait*15,front=airborne?14:-gait*17;
  line(ctx,[[-6,-28],[-9+rear,-15],[-10-rear,-4]],'#715a3e',8);line(ctx,[[-10-rear,-4],[-3-rear,-3]],'#403e2e',6);
  line(ctx,[[7,-29],[8+front*.6,-15],[6+front,-3]],'#b08353',8);line(ctx,[[6+front,-3],[14+front,-2]],'#493f2d',6);
  line(ctx,[[0,-60],[-12,-49],[-22+gait*8,-56]],'#ac8558',7);
  path(ctx,[[-12,-60],[8,-62],[13,-46],[19,-22],[7,-18],[-1,-23],[-17,-22],[-12,-43]],'#f3e8bf');path(ctx,[[-12,-59],[-5,-56],[-6,-30],[-17,-22],[-12,-43]],'#d4cca8');line(ctx,[[-3,-47],[-7,-29]],'#c3bf95',1.2);
  // Terracotta sash and its flowing tail.
  path(ctx,[[-12,-44],[12,-43],[13,-36],[-13,-38]],'#a46548');ctx.beginPath();ctx.moveTo(-12,-40);ctx.bezierCurveTo(-26,-36+gait*4,-32,-45-gait*3,-43,-37+gait*6);ctx.lineTo(-36,-31+gait*5);ctx.bezierCurveTo(-26,-36,-20,-31,-11,-35);ctx.closePath();ctx.fillStyle='#ad7150';ctx.fill();
  line(ctx,[[7,-58],[19,-45],[28-gait*9,-56]],'#bd9565',7);
  ellipse(ctx,1,-74,10,12,'#ba9364');path(ctx,[[-9,-79],[-9,-87],[-2,-91],[8,-88],[11,-82],[2,-83],[2,-76],[-3,-77],[-3,-70],[-8,-72]],'#4a4831');path(ctx,[[7,-77],[12,-76],[9,-72],[9,-65],[2,-64],[-1,-69],[6,-70]],'#6b5838');ellipse(ctx,8,-79,1,1,'#3d432d');
  ctx.restore();}

export function createScene(canvas){const ctx=canvas.getContext('2d');let width=1200;let particles=[];let viewOffset=0;let flash=0;let grain;
  const grainCanvas=document.createElement('canvas');grainCanvas.width=grainCanvas.height=180;const gc=grainCanvas.getContext('2d');const noise=gc.createImageData(180,180);for(let i=0;i<noise.data.length;i+=4){noise.data[i]=noise.data[i+1]=noise.data[i+2]=hash(i)*255;noise.data[i+3]=10;}gc.putImageData(noise,0,0);grain=ctx.createPattern(grainCanvas,'repeat');
  function resize(){const rect=canvas.getBoundingClientRect();width=540*rect.width/rect.height;const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);}
  function burst(x,y,color,count=12){for(let i=0;i<count;i++)particles.push({x,y,vx:(Math.random()-.5)*160,vy:-Math.random()*110,life:.4+Math.random()*.3,max:.7,color,size:1+Math.random()*3});}
  function event(event,state){if(event.type==='land')burst(state.player.x,425,'#e1cca0',9);if(event.type==='collect'){const c=event.collectible||event;burst(c.x||state.player.x,425-(c.y||80),'#fff0b0',13)}if(event.type==='collision'){burst(state.player.x,425-state.player.y-40,'#ead6a2',30);flash=.35;}}
  function render(state,time,dt,reduced=false){ctx.setTransform(canvas.width/width,0,0,canvas.height/540,0,0);const w=width;const ready=state.status==='ready';const scroll=state.scroll||0;viewOffset=w<700?state.player.x-w*.27:0;const sh=scroll*.05;
    const sky=ctx.createLinearGradient(0,0,0,440);sky.addColorStop(0,'#c9d0b3');sky.addColorStop(.65,'#e7dcac');sky.addColorStop(1,'#d8c388');ctx.fillStyle=sky;ctx.fillRect(0,0,w,540);
    const sunX=w*.69,sunY=174;const glow=ctx.createRadialGradient(sunX,sunY,35,sunX,sunY,220);glow.addColorStop(0,'#ffedb37a');glow.addColorStop(1,'#ffedb300');ctx.fillStyle=glow;ctx.fillRect(sunX-220,0,440,440);ellipse(ctx,sunX,sunY,74,74,'#f4e3a5');
    path(ctx,[[sunX-30,sunY],[sunX+10,sunY],[w*.34,425],[w*.19,425]],'#f9e9b111');path(ctx,[[sunX+10,sunY],[sunX+36,sunY],[w*.91,425],[w*.81,425]],'#fff1c215');
    for(let i=0;i<7;i++){const x=(hash(i+60)*w-sh*.18+w*5)%(w+160)-80;const y=70+hash(i+30)*135;ellipse(ctx,x,y,40+hash(i+80)*50,2+hash(i)*3,'#ece6c432');}
    mountain(ctx,w,275,2,47,'#b8bda0',sh*.2);mountain(ctx,w,302,7,47,'#9faa87',sh*.5);mountain(ctx,w,347,4,67,'#8e9b73',sh*.7);
    // A distant hill town, then weathered gateways along the route.
    for(let i=0;i<17;i++){const x=(w*.62+i*15-sh*.6+w*20)%(w+300)-80;const y=295+Math.sin(i*.4)*10;ctx.fillStyle=i%3===0?'#9caa80':'#aab391';ctx.fillRect(x,y,13,27);if(i%4===0){ellipse(ctx,x+6.5,y,6.5,6,'#aab391');ctx.fillRect(x+5,y+9,3,6)} }
    const ax=((w*.87-sh)%(w+500)+(w+500))%(w+500);arch(ctx,ax,370,.8);if(w>700){arch(ctx,ax+136,351,.42);tree(ctx,40-sh*.4%300,381,.56);}
    mountain(ctx,w,381,8,35,'#a6ad78',sh);mountain(ctx,w,414,5,23,'#b6b37c',sh*1.3);
    // The runnable ledge has a crisp, legible contact line.
    path(ctx,[[0,425],[w,425],[w,540],[0,540]],'#6b7950');path(ctx,[[0,425],[w,425],[w,437],[0,432]],'#d2bf81');path(ctx,[[0,436],[w,441],[w,474],[0,463]],'#78845a');
    for(let i=0;i<95;i++){const x=(hash(i)*2000-scroll*.75%2000+2000)%2000;let y=433+hash(i+199)*110;line(ctx,[[x,y],[x+3+hash(i+77)*13,y-1]],i%2?'#8d926452':'#4d63374d',1)}
    for(let i=0;i<16;i++){const x=(i*137+hash(i)*70-scroll*.83+200000)%(w+180)-90;grass(ctx,x,430,.35+hash(i)*.35,'#65764a')}
    const pX=ready?w*(w<700?.88:.61):state.player.x-viewOffset;
    if(ready){rock(ctx,w*(w<700?1.12:.83),425,55,42);for(let i=0;i<3;i++)light(ctx,w*.68+i*40,330-Math.sin(i*.9)*23,time,i)}
    else {for(const o of state.obstacles){const x=o.x-viewOffset;if(x<-150||x>w+100)continue;if(o.type==='rock')rock(ctx,x,425,o.width,o.height);else branch(ctx,x,425,o.width,o.height,o.bottom||40)}for(const c of state.collectibles){if(!c.collected)light(ctx,c.x-viewOffset,425-c.y,time,c.id)}}
    const drawP=ready?{y:0,sliding:false,landTimer:0}:state.player;runner(ctx,pX,425,drawP,reduced?0:time,state.status);
    if(!reduced){for(let i=0;i<16;i++){const x=(hash(i+321)*w-time*(3+hash(i)*8)+w*100) % w;const y=290+hash(i+563)*200+Math.sin(time*.6+i)*7;ellipse(ctx,x,y,hash(i)*1.8+.5,hash(i)*1.8+.5,'#f5e9b35c');}for(let i=0;i<3;i++){const x=(w*.51+i*20+Math.sin(time*.1+i)*8),y=110+i*8;line(ctx,[[x-4,y+Math.sin(time*3)*1],[x,y+2],[x+5,y]],'#65745177',1);}}
    particles=particles.filter(p=>p.life>0);for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=180*dt;ctx.globalAlpha=Math.max(0,p.life/p.max);ellipse(ctx,p.x-viewOffset,p.y,p.size,p.size,p.color)}ctx.globalAlpha=1;
    path(ctx,[[0,502],[w*.13,495],[w*.3,517],[w*.43,508],[w*.6,522],[w*.74,501],[w,514],[w,540],[0,540]],'#425b3a');for(let i=0;i<9;i++){let x=(i*193-scroll*1.12+200000)%(w+190)-95;grass(ctx,x,523+hash(i)*10,.75+hash(i)*.8,'#314c33');}
    ctx.fillStyle=grain;ctx.fillRect(0,0,w,540);if(flash>0&&!reduced){ctx.fillStyle=`rgba(243,226,172,${flash})`;ctx.fillRect(0,0,w,540);flash=Math.max(0,flash-dt*1.5)}
  }
  return{resize,render,event};
}
