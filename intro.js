(function(){const el=document.getElementById('intro');if(window.BOOT){el.remove();return;}
 (function leaders(){const box=document.getElementById('introLB');if(!box)return;const CS={jp:'JPK',ws:'WSEA',nc:'NCST',cda:'CDA',ko:'KOLN'}/*COURSE-EXT*/;const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
   const tp=v=>v===0?'E':(v>0?'+':'')+v,srt=(a,b)=>a.tp-b.tp||a.s-b.s||a.t-b.t;
   const draw=L=>{L=(L||[]).map(r=>r.tp==null&&r.s!=null&&r.par!=null?Object.assign({},r,{tp:r.s-r.par}):r).filter(r=>r.tp!=null&&r.s!=null).sort(srt).slice(0,10);let h='<div class="hd">Leaderboard<small>The Degen Golfers Invitational</small></div><div class="ch"><span>Place</span><span>Initials</span><span>Player</span><span>Course</span><span>Score</span></div>';
     if(!L.length){box.innerHTML=h+'<div class="vp"><div class="empty">The board is open \u2014 be the first to sign it</div></div>';return;}
     const row=(r,k)=>'<div class="r"><span class="p">'+(k+1)+'</span><span class="i" style="white-space:pre">'+esc(r.i)+'</span><span class="g">'+esc(String(r.g).split(' ')[0])+'</span><span class="c">'+(CS[r.c]||String(r.c).toUpperCase())+'</span><span class="s"><span class="'+(r.tp<0?'u':r.tp>0?'o':'e')+'">'+tp(r.tp)+'</span><small>'+r.s+'</small></span></div>';
     const rows=L.map(row).join('');box.innerHTML=h+'<div class="vp"><div class="rows">'+rows+(L.length>3?rows:'')+'</div></div>';size();
     if(L.length>3){const el2=box.querySelector('.rows'),n=L.length,step=28,hold=1.6,move=.55;let t0=null;
       const tick=ts=>{if(!document.body.contains(el2))return;if(t0===null)t0=ts;const per=hold+move,tt=(ts-t0)/1000,k=Math.floor(tt/per),f=Math.min(1,Math.max(0,(tt-k*per-hold)/move)),e=f*f*(3-2*f);el2.style.transform='translateY('+(-((k%n)+e)*step)+'px)';requestAnimationFrame(tick);};requestAnimationFrame(tick);}};
   let cached=[];try{cached=JSON.parse(localStorage.getItem('dg-hs-cache')||'[]');const P=JSON.parse(localStorage.getItem('dg-hs-pending')||'[]'),seen=new Set(cached.map(r=>r.rid));cached=cached.concat(P.filter(r=>!seen.has(r.rid)));}catch(e){}
   draw(cached);fetch('/api/scores',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(d=>{if(d&&d.board){try{localStorage.setItem('dg-hs-cache',JSON.stringify(d.board));}catch(e){}draw(d.board);}}).catch(()=>{});})();
 const go=document.getElementById('iGo'),cv=document.getElementById('introC');let R=null,alive=true;
 const ready=()=>{go.disabled=false;go.textContent='Tap to start';};
 if(window.DG_READY)ready();else document.addEventListener('dg-ready',ready,{once:true});
 const close=()=>{if(go.disabled)return;el.classList.add('out');setTimeout(()=>{alive=false;try{R&&R.dispose();R&&R.forceContextLoss();}catch(e){}el.remove();},750);};
 go.addEventListener('click',close);el.addEventListener('click',e=>{if(e.target!==go)close();});
 try{R=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});}catch(e){return;}
 R.setPixelRatio(Math.min(2,devicePixelRatio||1));R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.05;
 const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(32,1,.1,100);cam.position.set(0,.2,15);
 const c=document.createElement('canvas');c.width=1024;c.height=512;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,512);
 g.addColorStop(0,'#0a1320');g.addColorStop(.3,'#5f86b0');g.addColorStop(.47,'#f4f8ff');g.addColorStop(.5,'#ffffff');g.addColorStop(.53,'#2a3442');g.addColorStop(1,'#030507');x.fillStyle=g;x.fillRect(0,0,1024,512);
 x.fillStyle='#ffffff';x.fillRect(120,110,70,230);x.fillRect(700,70,160,50);x.fillStyle='#ffd08a';x.fillRect(430,150,40,190);x.fillStyle='#9fd0ff';x.fillRect(900,160,50,160);
 const et=new THREE.CanvasTexture(c);et.mapping=THREE.EquirectangularReflectionMapping;et.encoding=THREE.sRGBEncoding;const pm=new THREE.PMREMGenerator(R);sc.environment=pm.fromEquirectangular(et).texture;pm.dispose();
 sc.add(new THREE.DirectionalLight(0xffffff,.6));
 const font=new THREE.FontLoader().parse(window.LOGO_FONT);
 const chrome=new THREE.MeshStandardMaterial({color:0xe9eef4,metalness:1,roughness:.14}),side=new THREE.MeshStandardMaterial({color:0x7d8896,metalness:1,roughness:.3}),
   gold=new THREE.MeshStandardMaterial({color:0xffc255,metalness:1,roughness:.2}),gside=new THREE.MeshStandardMaterial({color:0x9a6a1c,metalness:1,roughness:.32});
 const logo=new THREE.Group(),spin=new THREE.Group();spin.add(logo);sc.add(spin);
 const word=(t,s,y,a,b)=>{const ge=new THREE.TextGeometry(t,{font,size:s,height:s*.34,curveSegments:8,bevelEnabled:true,bevelThickness:s*.07,bevelSize:s*.045,bevelSegments:4});ge.computeBoundingBox();const bb=ge.boundingBox;ge.translate(-(bb.max.x+bb.min.x)/2,-(bb.max.y+bb.min.y)/2,-(bb.max.z+bb.min.z)/2);const m=new THREE.Mesh(ge,[a,b]);m.position.y=y;logo.add(m);return bb.max.x-bb.min.x;};
 const w=Math.max(word('DEGEN',1.3,1.55,chrome,side),word('GOLFERS',1.3,-.05,chrome,side));word('’26',1.15,-1.72,gold,gside);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(4.35,.075,16,160),gold);ring.rotation.x=1.25;spin.add(ring);
 const ball=new THREE.Mesh(new THREE.SphereGeometry(.3,64,40),new THREE.MeshStandardMaterial({color:0xffffff,metalness:0,roughness:.32,bumpMap:makeDimples(),bumpScale:.018}));ring.add(ball);
 const slow=matchMedia('(prefers-reduced-motion: reduce)').matches;const t0=performance.now();
 function size(){const W=innerWidth,H=innerHeight;R.setSize(W,H,false);cam.aspect=W/H;cam.updateProjectionMatrix();const visH=2*15*Math.tan(THREE.MathUtils.degToRad(16)),vis=visH*cam.aspect;const k=Math.min(1,vis*.9/(w+.4),visH*.44/4.6);spin.scale.setScalar(k);
   /* seat the leaderboard midway between the bottom of the logo and the start button */
   const lb=document.getElementById('introLB'),btn=document.getElementById('iGo');if(lb&&btn){const wpp=visH/H,logoBot=H/2-(1.55-2.45*k)/wpp,bt=btn.getBoundingClientRect().top,hgt=lb.offsetHeight||152;
   /* the board stays anchored just above the start button by the stylesheet (same bottom reference as the button, so it can never
      cover it on any phone or toolbar state); if the logo leaves too little room above, the board only shrinks, from its bottom edge */
   const room=bt-22-(logoBot+8),s=Math.max(.6,Math.min(1,room/hgt));
   lb.style.top='auto';lb.style.bottom='';lb.style.transformOrigin='50% 100%';lb.style.transform='translateX(-50%) scale('+s.toFixed(3)+')';}}
 size();addEventListener('resize',size);try{new MutationObserver(()=>size()).observe(document.getElementById('introLB'),{childList:true});document.fonts&&document.fonts.ready.then(()=>size());}catch(e){}setTimeout(size,60);setTimeout(size,2400);
 (function loop(){if(!alive)return;const t=(performance.now()-t0)/1000;const e=Math.min(1,Math.max(0,(t-.7)/1.3)),pop=e<1?1-Math.pow(1-e,3)*Math.cos(e*7):1;
   logo.scale.setScalar(Math.max(.001,pop));const om=1.2,ph=Math.max(0,t-.7)*om;spin.rotation.y=slow?Math.sin(t*.4)*.35:(ph-Math.sin(ph))+Math.PI*2*(1-e);spin.position.y=1.55+Math.sin(t*1.3)*.08;
   const a=-t*1.4;ball.position.set(Math.cos(a)*4.35,Math.sin(a)*4.35,0);ball.rotation.set(t*2.1,t*1.4,0);
   R.render(sc,cam);requestAnimationFrame(loop);})();})();
