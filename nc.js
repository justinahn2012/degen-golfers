/* ===== The Golf Club at Newcastle, China Creek: course extension (upgrade) for Degen Golfers '26 =====
   Same pipeline as Coal Creek: lidar trees, the homes that line the course, native fescue, stony creek banks.
   China Creek's existing look (PNW atlases, skyline sprite and Rainier through the game's SEA backdrop) is unchanged. */
(function(){
if(window.COURSE_KEY!=='nc')return;
window.COURSE_EXT_READY=fetch('nc_extra.json').then(r=>r.json()).then(x=>{Object.assign(window.COURSE,x);}).catch(e=>console.warn('[nc] extra data',e));
const X={};
const hsh=(x,y)=>{const s=Math.sin(x*12.9898+y*78.233)*43758.5453;return s-Math.floor(s);};
X.trees=function(A){const T=A.THREE,D=A.D,TR=A.TREES,TH=A.THASH;TR.length=0;TH.clear();const firs=[],decs=[];
  for(const q of D.tl){const x=q[0],y=q[1],t={x,y,gz:A.H(x,y),h:q[2],r:q[3],fir:!!q[4],v:Math.floor(hsh(x,y)*(q[4]?2.999:1.999))};TR.push(t);(t.fir?firs:decs).push(t);
    const R2=Math.ceil(t.r/10)+1,cx=Math.floor(x/10),cy=Math.floor(y/10);for(let i=-R2;i<=R2;i++)for(let j=-R2;j<=R2;j++){const k=(cx+i)+','+(cy+j);let a=TH.get(k);if(!a)TH.set(k,a=[]);a.push(t);}}
  const ld=k=>{const t=new T.TextureLoader().load(window.ASSETS[k]);t.encoding=T.sRGBEncoding;t.anisotropy=4;return t;};
  const pf=new T.TextureLoader().load('pnw_dfirAtlas.webp');pf.encoding=T.sRGBEncoding;pf.anisotropy=4;
  A.scene.add(A.mkImp(firs,pf,8,3,[1.05,1.05,1.05],.713),A.mkImp(decs,ld('broadAtlas'),4,2,[1.216,1.03],1));
  console.log('[nc] lidar trees',TR.length,'conifers',firs.length);return true;};
/* ---------- the neighbourhoods round the course: OSM footprints, siding walls, dark composition-shingle hip roofs ---------- */
function houses(A){const T=A.THREE,D=A.D,P=[],C=[],R=[],RC=[],c=new T.Color();const WALL=['#d8d2c4','#c9c3b5','#b9b7ae','#e0dbd0','#a8a296','#cfc6b2','#9aa3a6'],ROOF=['#3d3f42','#4a4643','#55514c','#3a3632','#5b5f62'];
  const push=(arr,ca,v,col)=>{arr.push(v.x,v.y,v.z);ca.push(col.r,col.g,col.b);};let n=0;
  for(const b of D.kbld||[]){const Pp=b.p;let cx=0,cy=0;Pp.forEach(q=>{cx+=q[0];cy+=q[1];});cx/=Pp.length;cy/=Pp.length;const club=/golf club/i.test(b.n||'')||b.t==='clubhouse';const lie=A.lieAt(cx,cy);if(!club&&lie!=='oob'&&lie!=='rough')continue;
    let gz=1e9;for(const q of Pp)gz=Math.min(gz,A.H(q[0],q[1]));gz-=.4;let ar=0;for(let i=0;i<Pp.length;i++){const a=Pp[i],e=Pp[(i+1)%Pp.length];ar+=a[0]*e[1]-e[0]*a[1];}ar=Math.abs(ar)/2;
    const rh=club?Math.min(9,.3*Math.sqrt(ar)):Math.min(4,.22*Math.sqrt(ar)),wh=Math.max(2.8,b.h-rh*(club?.5:1)),top=gz+.4+wh;c.set(club?'#8e9396':WALL[Math.floor(hsh(cx,cy)*WALL.length)]).convertSRGBToLinear();
    for(let i=0;i<Pp.length;i++){const a=Pp[i],e=Pp[(i+1)%Pp.length],v=[A.V(a[0],a[1],gz),A.V(e[0],e[1],gz),A.V(e[0],e[1],top),A.V(a[0],a[1],top)];for(const k of[0,1,2,0,2,3])push(P,C,v[k],c);}
    c.set(club?'#2f3336':ROOF[Math.floor(hsh(cy,cx)*ROOF.length)]).convertSRGBToLinear();const ap=A.V(cx,cy,top+rh);
    for(let i=0;i<Pp.length;i++){const a=Pp[i],e=Pp[(i+1)%Pp.length],ev=q=>{const dx=q[0]-cx,dy=q[1]-cy,dd=Math.hypot(dx,dy)||1;return A.V(q[0]+dx/dd*.6,q[1]+dy/dd*.6,top-.15);};push(R,RC,ev(a),c);push(R,RC,ev(e),c);push(R,RC,ap,c);}n++;}
  for(const [p,cc] of[[P,C],[R,RC]]){if(!p.length)continue;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('color',new T.Float32BufferAttribute(cc,3));g.computeVertexNormals();
    const m=new T.Mesh(g,new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide}));m.material.userData.lin=1;m.castShadow=true;m.receiveShadow=true;A.scene.add(m);}console.log('[nc] houses',n);}
/* ---------- native fescue: the golden unmown rough of the club's photos, mapped from the aerial (cc_fescue.png), painted onto the ground ---------- */
function fescue(A){const D=A.D,Fz=D.fescue;if(!Fz)return;const img=new Image();img.onload=()=>{try{
  const w=img.width,h=img.height,cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d');x.drawImage(img,0,0);const id=x.getImageData(0,0,w,h),d=id.data,mk=new Uint8ClampedArray(d);
  for(let i=0;i<d.length;i+=4){const a=d[i]/255,n=(Math.sin(i*.0137)*43758.5453)%1,k=.86+.28*Math.abs(n);d[i]=Math.min(255,166*k);d[i+1]=Math.min(255,164*k);d[i+2]=Math.min(255,104*k);d[i+3]=Math.round(a*120);}
  try{plantings(A,{w,h,d:mk});}catch(e){console.warn('plantings',e);}
  x.putImageData(id,0,0);const c=A.ctx,B=A.box,S=c.canvas.width;c.save();c.setTransform(1,0,0,1,0,0);
  c.drawImage(cv,(Fz.x0-B.X0)/B.WW*S,(B.Y1-Fz.y1)/B.HH*S,(Fz.x1-Fz.x0)/B.WW*S,(Fz.y1-Fz.y0)/B.HH*S);c.restore();A.tex.needsUpdate=true;console.log('[nc] fescue painted');}catch(e){console.warn('[nc] fescue',e);}};img.src=Fz.img;}
/* ---------- rocky creek banks (as in the club's photos of 1, 3, 7 and the 17th's cascade) ---------- */
function rockGeo(T,seed){const g=new T.IcosahedronGeometry(1,1),p=g.attributes.position;let r=seed*9.7;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=1+.25*Math.sin(x*2.3+r)*Math.cos(z*2.1+r*.7)+.12*Math.sin(y*4.7+r*1.3);p.setXYZ(i,x*k,y*k*.7,z*k);}g.computeVertexNormals();return g;}
/* creek stones: a granite skin (speckle, lichen, hairline cracks) instead of plain grey plastic, moss on the upward faces, the wet
   lower half darker, colours in linear space so they sit at true brightness */
function rockSkin(T){if(rockSkin.t)return rockSkin.t;const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');let s=4111;const r=()=>{s=(s*16807)%2147483647;return s/2147483647;};
  x.fillStyle='#b3afa6';x.fillRect(0,0,256,256);
  for(let i=0;i<260;i++){const v=r();x.fillStyle=v<.33?'rgba(70,68,64,.28)':v<.66?'rgba(150,146,138,.3)':'rgba(110,104,92,.3)';x.beginPath();x.ellipse(r()*256,r()*256,6+r()*26,4+r()*16,r()*3.14,0,7);x.fill();}
  for(let i=0;i<5000;i++){const v=r();x.fillStyle=v<.45?'rgba(40,38,36,.55)':v<.8?'rgba(200,198,192,.5)':'rgba(120,96,70,.45)';x.fillRect(r()*256,r()*256,1+r()*1.5,1+r()*1.5);}
  x.strokeStyle='rgba(35,33,30,.5)';x.lineWidth=1;for(let i=0;i<14;i++){let px=r()*256,py=r()*256;x.beginPath();x.moveTo(px,py);for(let k=0;k<6;k++){px+=(r()-.5)*30;py+=(r()-.5)*30;x.lineTo(px,py);}x.stroke();}
  for(let i=0;i<70;i++){x.fillStyle=r()<.5?'rgba(170,176,130,.55)':'rgba(196,192,150,.5)';x.beginPath();x.arc(r()*256,r()*256,2+r()*6,0,7);x.fill();}
  const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;return rockSkin.t=t;}
function rockMoss(T,g){const p=g.attributes.position,n=g.attributes.normal,C=[];for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),ny=n.getY(i);
    const nz=.5+.5*Math.sin(x*3.1+z*2.7)*Math.cos(z*2.3-x*1.7),m=Math.min(1,Math.max(0,(ny-.35)/.45))*Math.min(1,Math.max(0,nz*1.6-.2)),wet=y<-.05?.72:1;
    C.push((1-m*.42)*wet,(1-m*.12)*wet,(1-m*.55)*wet);}g.setAttribute('color',new T.Float32BufferAttribute(C,3));return g;}
function rockMat(T){return new T.MeshStandardMaterial({map:rockSkin(T),vertexColors:true,roughness:.93,metalness:0,flatShading:true,envMapIntensity:.55});}
function creekRocks(A){const T=A.THREE,D=A.D,L=[],near=(x,y)=>A.HOLES.some(h=>A.dPL(x,y,h.p)<110);
  for(const l of D.creek||[])for(let i=1;i<l.length;i++){const a=l[i-1],b=l[i],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(!len)continue;const nx=-dy/len,ny=dx/len;
    for(let s=0;s<len;s+=1.3){const x=a[0]+dx*s/len,y=a[1]+dy*s/len;if(!near(x,y))continue;for(const sd of[-1,1]){const u=hsh(x*sd,y),o=2.0+u*.9;if(u<.25||!lineClear(A,x,y,1))continue;L.push([x+nx*sd*o,y+ny*sd*o,.28+hsh(y,x*sd)*.55]);}}}
  if(!L.length)return;const geos=[rockMoss(T,rockGeo(T,1)),rockMoss(T,rockGeo(T,2)),rockMoss(T,rockGeo(T,3))],cols=['#8b8a84','#76746d','#9a978e','#6a6862','#a3a097'],m=new T.Matrix4(),q=new T.Quaternion(),c=new T.Color();
  geos.forEach((g,gi)=>{const S=L.filter((_,i)=>i%3===gi);if(!S.length)return;const M=A.IMC(new T.InstancedMesh(g,rockMat(T),S.length));
    S.forEach((p,i)=>{q.setFromEuler(new T.Euler(0,hsh(p[0],p[1])*6.28,0));m.compose(A.V(p[0],p[1],A.H(p[0],p[1])-p[2]*.35),q,new T.Vector3(p[2],p[2],p[2]));M.setMatrixAt(i,m);if(A.addSolid)A.addSolid(p[0],p[1],A.H(p[0],p[1])-p[2]*.35,p[2]*.9,p[2]*.65);c.set(cols[Math.floor(hsh(p[1],p[0])*cols.length)]);M.setColorAt(i,c);});
    M.castShadow=true;M.receiveShadow=true;try{A.linearize(M);}catch(e){}A.scene.add(M);});
  console.log('[nc] creek rocks',L.length);}
/* ---------- the backdrop (new for China Creek): the same 32 km terrain and aerial photos as Coal Creek, Lake Washington under the lake plane ---------- */
/* ---------- Lake Washington and Puget Sound: slate-blue water under the PNW sky, masked to the shoreline so the low shores never flicker ---------- */
X.farWater=function(w,A){const T=A.THREE,D=A.D,F=D.far,N=F.near,WM=window.__WM;const TL=new T.TextureLoader(),mn=TL.load(D.lake.near),mf=TL.load(D.lake.far);for(const x of[mn,mf]){x.minFilter=T.LinearFilter;x.generateMipmaps=false;}
  const U={sky:{value:A.skyMat.uniforms.sky.value},nm:{value:WM?WM.uniforms.nm.value:null},mn:{value:mn},mf:{value:mf},rot:{value:A.skyMat.uniforms.rot.value},t:A.WT,sun:{value:A.sunDir},uLin:A.LINQ,
    hz:{value:new T.Color(A.SKY)},bn:{value:new T.Vector4(N.x0,N.x1,N.y0,N.y1)},bf:{value:new T.Vector4(F.x0,F.x1,F.y0,F.y1)},hd:{value:F.haze||9000}};
  w.material=new T.ShaderMaterial({uniforms:U,extensions:{derivatives:true},
    vertexShader:'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader:'uniform sampler2D sky,nm,mn,mf;uniform float rot,t,uLin,hd;uniform vec3 sun,hz;uniform vec4 bn,bf;varying vec3 vW;'+
     'vec3 skyS(vec3 d){float u=fract(atan(d.z,d.x)*.1591549+.5+rot);float v=max(asin(clamp(d.y,-1.,1.))*.3183099+.5,.503);return texture2D(sky,vec2(u,v)).rgb;}\n'+
     'void main(){vec2 p=vW.xz;vec2 lp=vec2(p.x,-p.y);vec2 un=(lp-bn.xz)/(bn.yw-bn.xz),uf=(lp-bf.xz)/(bf.yw-bf.xz);float s=1.;'+
     'if(un.x>0.&&un.x<1.&&un.y>0.&&un.y<1.)s=texture2D(mn,un).r;else if(uf.x>0.&&uf.x<1.&&uf.y>0.&&uf.y<1.)s=texture2D(mf,uf).r;if(s<.05)discard;'+
     'float dist=length(cameraPosition-vW);float fp=length(fwidth(p));float fb=1.-smoothstep(.6,4.,fp);'+
     'vec3 a=texture2D(nm,p/45.+vec2(t*.01,t*.006)).xyz*2.-1.;vec3 b=texture2D(nm,p/13.+vec2(-t*.016,t*.012)).xyz*2.-1.;vec2 pert=(a.xy*.6+b.xy*.4*fb)*.22;vec3 n=normalize(vec3(pert.x,1.,pert.y));'+
     'vec3 v=normalize(cameraPosition-vW);vec3 r=reflect(-v,n);r.y=abs(r.y);float fr=.03+.97*pow(1.-max(dot(n,v),0.),5.);'+
     'vec3 body=mix(vec3(.17,.29,.34),vec3(.07,.18,.27),smoothstep(0.,.5,s*s));vec3 col=mix(body,skyS(r),clamp(fr*1.1,0.,.88));'+
     'col+=vec3(1.,.96,.88)*pow(max(dot(r,normalize(sun)),0.),180.)*1.4;float k=1.-exp(-dist/hd);col=mix(col,hz,clamp(k*.8,0.,.8));'+
     'if(uLin>.5)col=pow(col,vec3(2.2));gl_FragColor=vec4(col,1.);}'});
  w.material.customProgramCacheKey=()=>'ncLake';w.renderOrder=0;const o=A.outer;if(o)o.position.y=Math.min(o.position.y,F.lakeH-3);console.log('[nc] lake');};
/* ---------- Mount Rainier on its true bearing (the game's NPS photograph), peak about 4.5 deg above the horizon ---------- */
function rainier(A){const T=A.THREE;if(!window.ASSETS.rainier)return;const t=new T.TextureLoader().load(window.ASSETS.rainier);t.encoding=T.sRGBEncoding;t.anisotropy=8;
  const mm=new T.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,fog:false,toneMapped:false,color:new T.Color(.86,.9,.98)});mm.userData.lin=1;
  const RV=A.D.rainier,L=Math.hypot(RV[0],RV[1]),dx=RV[0]/L,dy=RV[1]/L,Dd=24000,Hm=3100,Wm=Hm*1.5,cx=A.MAIN.cx,cy=A.MAIN.cy;
  const pl=new T.Mesh(new T.PlaneGeometry(Wm,Hm),mm);pl.position.copy(A.V(cx+dx*Dd,cy+dy*Dd,Hm*.5-Hm*.34));pl.lookAt(A.V(cx,cy,Hm*.3));pl.renderOrder=-2;pl.frustumCulled=false;A.scene.add(pl);}
/* ---------- the PNW plantings from the club's photos: Scotch broom (yellow) in the native areas, wildflower and rhododendron
   beds by the tees, thick brush in 'dry' penalty areas. Crossed leaf cards, textures drawn at runtime (no files) ---------- */
function plantTex(T,kind){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');let s=kind*977+13;const r=()=>{s=(s*16807)%2147483647;return s/2147483647;};
  const P=[[['#6f8a2c','#5f7a26','#7d9a33'],['#f2d21b','#e8c413','#f7e04a']],[['#4f6e2c','#5b7a33'],['#8d5bc4','#a77ad6','#6f45a8','#c79be8']],[['#2f4f27','#3a5c2e'],['#e0679c','#d24f8a','#ef8fb6','#c43d78']],[['#4d5f2a','#5a6a30','#3e4f22','#6b7536'],['#8a7a46','#6e6a3a']]][kind];
  for(let i=0;i<60;i++){const a=-Math.PI/2+(r()-.5)*2.4,l=30+r()*60,cx=64+(r()-.5)*30;x.save();x.translate(cx,124);x.rotate(a+Math.PI/2);x.strokeStyle=P[0][Math.floor(r()*P[0].length)];x.lineWidth=kind==0?2:3;x.beginPath();x.moveTo(0,0);x.lineTo((r()-.5)*10,-l);x.stroke();x.restore();}
  const nf=kind==3?40:kind==0?140:90;for(let i=0;i<nf;i++){const a=r()*6.283,rr=Math.pow(r(),.7)*48,cx=64+Math.cos(a)*rr,cy=(kind==1?40:58)+Math.sin(a)*rr*(kind==1?.9:.6);x.fillStyle=P[1][Math.floor(r()*P[1].length)];
    x.beginPath();x.arc(cx,cy,kind==2?5+r()*3:kind==0?2+r()*1.6:2.5+r()*2,0,7);x.fill();}
  const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t;}
function lineClear(A,x,y,rock){const l=A.lieAt(x,y);return !(l==='tee'||l==='green'||l==='bunker'||(!rock&&l==='fairway'));}/* plantings and stones go where they really are, ahead of tees included; never on a tee, green or bunker, and plants not on fairway cuts (stones may line a creek where it crosses one) */
function plants(A,list){list=list.filter(p=>lineClear(A,p[0],p[1]));if(!list.length)return;if(A.bushes){const n=A.bushes(list,['broom','wildflower','rhodo','brush']);console.log('[pl] bushes',n);return;}/* broom, wildflowers, rhododendrons, brush as full bushes (main.js) */const T=A.THREE,g0=new T.PlaneGeometry(1,1);g0.translate(0,.5,0);const P=[],U=[],I=[];let o=0;
  for(const ang of[0,Math.PI/3,2*Math.PI/3]){const g=g0.clone();g.rotateY(ang);P.push(...g.attributes.position.array);U.push(...g.attributes.uv.array);I.push(...Array.from(g.index.array).map(v=>v+o));o+=g.attributes.position.count;}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(P,3));geo.setAttribute('uv',new T.Float32BufferAttribute(U,2));geo.setIndex(I);geo.computeVertexNormals();
  for(let k=0;k<4;k++){const L=list.filter(p=>p[3]===k);if(!L.length)continue;const M=A.IMC(new T.InstancedMesh(geo,new T.MeshLambertMaterial({map:plantTex(T,k),alphaTest:.45,side:T.DoubleSide}),L.length)),m=new T.Matrix4(),q=new T.Quaternion();
    L.forEach((p,i)=>{q.setFromAxisAngle(new T.Vector3(0,1,0),hsh(p[0],p[1])*6.28);m.compose(A.V(p[0],p[1],A.H(p[0],p[1])-.08),q,new T.Vector3(p[2]*1.25,p[2],p[2]*1.25));M.setMatrixAt(i,m);});
    M.castShadow=true;M.receiveShadow=true;M.frustumCulled=false;A.scene.add(M);}}
function plantings(A,mask){const D=A.D,L=[],near=(x,y,d)=>A.HOLES.some(h=>A.dPL(x,y,h.p)<d);
  /* broom in the native fescue near play, in clumps */
  if(mask){const Fz=D.fescue,{w,h,d}=mask;for(let y=Fz.y0+3;y<Fz.y1;y+=5)for(let x=Fz.x0+3;x<Fz.x1;x+=5){const jx=x+(hsh(x,y)-.5)*4,jy=y+(hsh(y,x)-.5)*4,i=Math.floor((jx-Fz.x0)/(Fz.x1-Fz.x0)*w),j=Math.floor((Fz.y1-jy)/(Fz.y1-Fz.y0)*h);
    if(i<0||j<0||i>=w||j>=h||d[(j*w+i)*4]<150)continue;const cl=Math.sin(jx*.045)*Math.cos(jy*.05)+.6*Math.sin((jx+jy)*.021);if(cl<.55||!near(jx,jy,90))continue;L.push([jx,jy,1.1+hsh(jx*2,jy)*1.1,0]);if(L.length>2200)break;}}
  /* thick brush and broom filling 'dry' penalty areas */
  for(const f of D.f){if(!f.dry)continue;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;f.p.forEach(p=>{x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1]);});
    for(let y=y0;y<y1;y+=2.4)for(let x=x0;x<x1;x+=2.4){const jx=x+(hsh(x,y)-.5)*1.6,jy=y+(hsh(y,x)-.5)*1.6;if(A.inP({p:f.p,x0,y0,x1,y1,cx:0,cy:0,R:1e9},jx,jy)||pipLocal(jx,jy,f.p))L.push([jx,jy,1.3+hsh(jx,jy)*1.3,hsh(jy,jx)<.35?0:3]);}}
  /* wildflower / rhododendron beds beside each first tee */
  for(const h of A.HOLES){const t0=h.p[0],t1=h.p[1],a=Math.atan2(t1[1]-t0[1],t1[0]-t0[0]),kind=(+h.ref)%3===0?2:1;
    for(const [al,sd] of[[-11,-9],[-7,10]]){const cx=t0[0]+Math.cos(a)*al-Math.sin(a)*sd,cy=t0[1]+Math.sin(a)*al+Math.cos(a)*sd;for(let k=0;k<22;k++){const x=cx+(hsh(k,cx)-.5)*7,y=cy+(hsh(cy,k)-.5)*4;const l=A.lieAt(x,y);if(l==='rough'||l==='oob')L.push([x,y,.6+hsh(x,y)*.6,kind]);}}}
  plants(A,L);console.log('[pl] plantings',L.length);}
function pipLocal(x,y,P){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
function dryHazards(A){const T=A.THREE,D=A.D,dry=D.f.filter(f=>f.dry);if(!dry.length)return;
  A.scene.traverse(o=>{if(!o.isMesh||!o.geometry||o.material!==window.__WM)return;o.geometry.computeBoundingBox();const b=o.geometry.boundingBox,c=b.getCenter(new T.Vector3()).add(o.position);if(dry.some(f=>pipLocal(c.x,-c.z,f.p)))o.visible=false;});
  const c=A.ctx;c.save();c.fillStyle='#4a5a2c';for(const f of dry){c.beginPath();f.p.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fill();}c.restore();A.tex.needsUpdate=true;}
/* ---------- rocky creek channels: the club's photos (Coal Creek 1, 3, 7) show stone-filled channels with a thin trickle,
   not open water. The game's creek strips keep their hazard rules; they are drawn as wet stone with a dark thread of
   water, and filled with stones. ---------- */
function rockyCreeks(A){const T=A.THREE,D=A.D;if(!(D.creek||[]).length||!window.__WM)return;
  const bed=new T.ShaderMaterial({uniforms:{uLin:A.LINQ},vertexShader:'varying vec2 vU;varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader:'uniform float uLin;varying vec3 vW;float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}void main(){vec2 p=vW.xz;float n=h(floor(p*2.2))*.6+h(floor(p*5.))*.4;vec3 c=mix(vec3(.24,.23,.21),vec3(.42,.40,.36),n);if(uLin>.5)c=pow(c,vec3(2.2));gl_FragColor=vec4(c,1.);}'});
  let n=0;A.scene.traverse(o=>{if(o.isMesh&&o.material===window.__WM&&o.geometry&&o.geometry.type==='BufferGeometry'){o.material=bed;o.renderOrder=0;n++;}});
  /* the creek strips are also painted into the ground texture as water: repaint them as a stony bed with a thin dark thread */
  {const c=A.ctx,m=A.mx;c.save();m.save();c.lineCap=m.lineCap='round';c.lineJoin=m.lineJoin='round';
   for(const l of D.creek){const st=(w,col,cx)=>{cx.strokeStyle=col;cx.lineWidth=w;cx.beginPath();l.forEach((p,i)=>i?cx.lineTo(p[0],p[1]):cx.moveTo(p[0],p[1]));cx.stroke();};
     st(3.6,'#57534a',c);st(2.2,'#6b665b',c);st(.7,'#22303a',c);st(3.6,'#ffff00',m);}
   c.restore();m.restore();A.tex.needsUpdate=true;A.maskT.needsUpdate=true;}
  const L=[],near=(x,y)=>A.HOLES.some(h=>A.dPL(x,y,h.p)<110);
  for(const l of D.creek)for(let i=1;i<l.length;i++){const a=l[i-1],b=l[i],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(!len)continue;const nx=-dy/len,ny=dx/len;
    for(let s=0;s<len;s+=.9){const x=a[0]+dx*s/len,y=a[1]+dy*s/len;if(!near(x,y))continue;const u=hsh(x,y),o=(u-.5)*2.4;L.push([x+nx*o,y+ny*o,.18+hsh(y,x)*.32]);}}
  if(L.length){const g=new T.IcosahedronGeometry(1,1),p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,p.getY(i)*.55);g.computeVertexNormals();rockMoss(T,g);
    const M=A.IMC(new T.InstancedMesh(g,rockMat(T),L.length)),m=new T.Matrix4(),q=new T.Quaternion(),c=new T.Color(),cols=['#5b5850','#6e6a61','#4a4842','#7c776c'];
    L.forEach((s,i)=>{q.setFromEuler(new T.Euler(0,hsh(s[0],s[1])*6.28,0));m.compose(A.V(s[0],s[1],A.H(s[0],s[1])-s[2]*.2),q,new T.Vector3(s[2],s[2],s[2]));M.setMatrixAt(i,m);if(A.addSolid)A.addSolid(s[0],s[1],A.H(s[0],s[1])-s[2]*.2,s[2]*.9,s[2]*.5);c.set(cols[Math.floor(hsh(s[1],s[0])*cols.length)]);M.setColorAt(i,c);});
    M.receiveShadow=true;try{A.linearize(M);}catch(e){}A.scene.add(M);}
  console.log('[rc] creek strips restyled',n,'channel stones',L.length);}
X.decor=function(A){try{dryHazards(A);}catch(e){console.warn('dry',e);}try{rockyCreeks(A);}catch(e){console.warn('creeks',e);}for(const [n,f] of[['rainier',rainier],['houses',houses],['fescue',fescue],['rocks',creekRocks]]){try{f(A);}catch(e){console.warn('[nc] '+n,e);}}};
window.COURSE_EXT=X;
})();
