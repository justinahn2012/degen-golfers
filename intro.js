(function(){const el=document.getElementById('intro');if(window.BOOT){el.remove();return;}
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
 function size(){const W=innerWidth,H=innerHeight;R.setSize(W,H,false);cam.aspect=W/H;cam.updateProjectionMatrix();const vis=2*15*Math.tan(THREE.MathUtils.degToRad(16))*cam.aspect;const k=Math.min(1,vis*.94/(w+.4),2*15*Math.tan(THREE.MathUtils.degToRad(16))*.52/4.6);spin.scale.setScalar(k);}
 size();addEventListener('resize',size);
 (function loop(){if(!alive)return;const t=(performance.now()-t0)/1000;const e=Math.min(1,Math.max(0,(t-.7)/1.3)),pop=e<1?1-Math.pow(1-e,3)*Math.cos(e*7):1;
   logo.scale.setScalar(Math.max(.001,pop));const om=1.2,ph=Math.max(0,t-.7)*om;spin.rotation.y=slow?Math.sin(t*.4)*.35:(ph-Math.sin(ph))+Math.PI*2*(1-e);spin.position.y=.55+Math.sin(t*1.3)*.08;
   const a=-t*1.4;ball.position.set(Math.cos(a)*4.35,Math.sin(a)*4.35,0);ball.rotation.set(t*2.1,t*1.4,0);
   R.render(sc,cam);requestAnimationFrame(loop);})();})();
