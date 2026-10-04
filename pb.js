/* Ko Olina tropical trees: procedural models, shared by the atlas baker (bake.html) and the game (hero palms in ko.js).
   Heights are normalised: every tree's top sits at y = 1. */
(function(root){
const KOT={};
function rng(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
KOT.rng=rng;
/* ---- tiny geometry builder (positions, normals computed later, vertex colours, uvs) ---- */
function Builder(){this.P=[];this.C=[];this.U=[];this.I=[];}
Builder.prototype.v=function(x,y,z,c,u,w){this.P.push(x,y,z);this.C.push(c[0],c[1],c[2]);this.U.push(u||0,w||0);return this.P.length/3-1;};
Builder.prototype.tri=function(a,b,c){this.I.push(a,b,c);};
Builder.prototype.quad=function(a,b,c,d){this.I.push(a,b,c,a,c,d);};
Builder.prototype.geo=function(T){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.P,3));g.setAttribute('color',new T.Float32BufferAttribute(this.C,3));g.setAttribute('uv',new T.Float32BufferAttribute(this.U,2));g.setIndex(this.I);g.computeVertexNormals();return g;};
function hsl(h,s,l){const a=s*Math.min(l,1-l),f=n=>{const k=(n+h*12)%12;return l-a*Math.max(-1,Math.min(k-3,9-k,1));};return[f(0),f(8),f(4)];}
function lin(c){return c.map(v=>Math.pow(v,2.2));}
/* a tube along a list of points with per-point radius */
function tube(B,pts,rad,seg,col,uvScale){const n=pts.length;const base=[];let prevN=null;
  for(let i=0;i<n;i++){const p=pts[i],q=pts[Math.min(n-1,i+1)],r=pts[Math.max(0,i-1)];let tx=q[0]-r[0],ty=q[1]-r[1],tz=q[2]-r[2];const tl=Math.hypot(tx,ty,tz)||1;tx/=tl;ty/=tl;tz/=tl;
    let nx,ny,nz;if(!prevN){const up=Math.abs(ty)<.9?[0,1,0]:[1,0,0];nx=up[1]*tz-up[2]*ty;ny=up[2]*tx-up[0]*tz;nz=up[0]*ty-up[1]*tx;}else{const d=prevN[0]*tx+prevN[1]*ty+prevN[2]*tz;nx=prevN[0]-d*tx;ny=prevN[1]-d*ty;nz=prevN[2]-d*tz;}
    const nl=Math.hypot(nx,ny,nz)||1;nx/=nl;ny/=nl;nz/=nl;prevN=[nx,ny,nz];const bx=ty*nz-tz*ny,by=tz*nx-tx*nz,bz=tx*ny-ty*nx;
    const row=[];for(let k=0;k<=seg;k++){const a=k/seg*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a),R=rad[i];
      row.push(B.v(p[0]+(nx*ca+bx*sa)*R,p[1]+(ny*ca+by*sa)*R,p[2]+(nz*ca+bz*sa)*R,typeof col==='function'?col(i/(n-1),k/seg):col,k/seg,i/(n-1)*(uvScale||1)));}base.push(row);}
  for(let i=0;i<n-1;i++)for(let k=0;k<seg;k++)B.quad(base[i][k],base[i+1][k],base[i+1][k+1],base[i][k+1]);}
function sphere(B,c,r,col,sx,sy){const seg=7,rows=5,idx=[];for(let j=0;j<=rows;j++){const t=j/rows*Math.PI,row=[];for(let k=0;k<=seg;k++){const a=k/seg*Math.PI*2;row.push(B.v(c[0]+Math.sin(t)*Math.cos(a)*r*(sx||1),c[1]+Math.cos(t)*r*(sy||1),c[2]+Math.sin(t)*Math.sin(a)*r*(sx||1),col));}idx.push(row);}
  for(let j=0;j<rows;j++)for(let k=0;k<seg;k++)B.quad(idx[j][k],idx[j][k+1],idx[j+1][k+1],idx[j+1][k]);}
/* ---- canvas textures ---- */
function canvasTex(T,w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=4;return t;}
KOT.barkTex=function(T,kind){return canvasTex(T,128,256,(x,W,H)=>{const r=rng(kind==='palm'?3:5);
  if(kind==='palm'){x.fillStyle='#9a9182';x.fillRect(0,0,W,H);for(let y=0;y<H;y+=5+r()*4){x.fillStyle='rgba(60,52,44,'+(.35+r()*.3)+')';x.fillRect(0,y,W,1.4+r()*1.2);x.fillStyle='rgba(210,200,185,'+(.25+r()*.2)+')';x.fillRect(0,y+2,W,1);}
    for(let i=0;i<500;i++){x.fillStyle=r()<.5?'rgba(70,64,56,.25)':'rgba(190,182,168,.22)';x.fillRect(r()*W,r()*H,1+r()*6,1);}}
  else if(kind==='plum'){x.fillStyle='#8e8b83';x.fillRect(0,0,W,H);for(let i=0;i<900;i++){x.fillStyle=r()<.5?'rgba(80,78,72,.25)':'rgba(170,168,160,.25)';x.fillRect(r()*W,r()*H,2+r()*5,1+r()*2);}}
  else{x.fillStyle=kind==='cook'?'#6f5a48':'#5c5046';x.fillRect(0,0,W,H);for(let i=0;i<140;i++){x.strokeStyle=r()<.5?'rgba(30,24,20,.45)':'rgba(140,125,110,.35)';x.lineWidth=1+r()*2;x.beginPath();const px=r()*W;x.moveTo(px,0);x.bezierCurveTo(px+r()*10-5,H*.3,px+r()*10-5,H*.6,px+r()*8-4,H);x.stroke();}}});};
/* leaf cluster cards: small leaflets on a transparent background */
KOT.clusterTex=function(T,kind){return canvasTex(T,256,256,(x,W,H)=>{const r=rng(kind.length*17+3);
  const pal={cyp:['#24391f','#2c4426','#1e321b','#33502b','#283f22'],mpine:['#2a4223','#34502b','#25391f','#3c5a30','#2e4826'],lob:['#2f4a1f','#385626','#2a4219','#41612a','#33501f'],dogw:['#f4f2ea','#ffffff','#ece9de','#f7f4ec','#5f8a3a'],dfir:['#2b4826','#34552c','#253f21','#3c5f31','#2f4e29'],monkey:['#3d6b2b','#4a7a31','#2f5a22','#56863a','#35612a'],broad:['#4f7d34','#5d8c3c','#426f2c','#6a9844','#3b6528'],cook:['#2d5230','#35603a','#274a2a','#3f6b40'],scrub:['#5a7a3a','#6a8a44','#4a6a30','#77924c']}[kind];
  const n=kind==='monkey'?520:(kind==='cook'||kind==='dfir'||kind==='lob'||kind==='mpine')?760:kind==='cyp'?700:kind==='scrub'?900:kind==='dogw'?420:300;
  for(let i=0;i<n;i++){const a=r()*6.283,rr=Math.pow(r(),.6)*W*.46,cx=W/2+Math.cos(a)*rr,cy=H/2+Math.sin(a)*rr*.9;x.save();x.translate(cx,cy);x.rotate(r()*6.283);
    x.fillStyle=pal[Math.floor(r()*pal.length)];
    if(kind==='cook'||kind==='dfir'||kind==='lob'||kind==='mpine'||kind==='cyp'){x.fillRect(-7,-1,14,2);x.fillRect(-1,-5,2,10);}
    else if(kind==='monkey'){x.beginPath();x.ellipse(0,0,5.5,3.2,0,0,7);x.fill();}
    else if(kind==='scrub'){x.beginPath();x.ellipse(0,0,6,3,0,0,7);x.fill();}
    else{x.beginPath();x.ellipse(0,0,9,4.6,0,0,7);x.fill();x.strokeStyle='rgba(20,40,10,.35)';x.lineWidth=.8;x.beginPath();x.moveTo(-8,0);x.lineTo(8,0);x.stroke();}
    x.restore();}});};
KOT.flowerTex=function(T){return canvasTex(T,64,64,(x,W,H)=>{x.translate(W/2,H/2);for(let k=0;k<5;k++){x.save();x.rotate(k/5*6.283+.3);x.fillStyle='#fbfaf2';x.beginPath();x.ellipse(0,-12,7,13,.35,0,7);x.fill();x.restore();}
  const g=x.createRadialGradient(0,0,0,0,0,11);g.addColorStop(0,'#f2c21b');g.addColorStop(1,'rgba(250,240,200,0)');x.fillStyle=g;x.beginPath();x.arc(0,0,11,0,7);x.fill();});};
/* the palm frond for the runtime hero palm: a leaflet comb painted on a strip (runtime only) */
KOT.frondTex=function(T){return canvasTex(T,64,512,(x,W,H)=>{const r=rng(9);for(let y=6;y<H-4;y+=4){const s=y/H,L=W*.5*Math.pow(Math.sin(Math.PI*(.08+.92*s)),.7);
  for(const sd of[-1,1]){const col=['#6f9636','#5f8a2e','#7fa543','#557d28'][Math.floor(r()*4)];x.strokeStyle=col;x.lineWidth=2.2;x.beginPath();x.moveTo(W/2,y);x.quadraticCurveTo(W/2+sd*L*.5,y+3,W/2+sd*L,y+10+r()*4);x.stroke();}}
  x.strokeStyle='#8a9a4a';x.lineWidth=2;x.beginPath();x.moveTo(W/2,0);x.lineTo(W/2,H);x.stroke();});};
function cards(B,pts,sz,col,r){/* crossed pair of quads per point, random tilt */for(const p of pts){const s=sz*(.75+r()*.5),a=r()*Math.PI,t=(r()-.5)*1.2;
  for(const off of[0,Math.PI/2]){const ca=Math.cos(a+off),sa=Math.sin(a+off),ct=Math.cos(t),st=Math.sin(t);const ux=ca*s,uz=sa*s,vy=ct*s,vx=-sa*st*s,vz=ca*st*s;
    const c=typeof col==='function'?col(p):col;const i0=B.v(p[0]-ux-vx,p[1]-vy,p[2]-uz-vz,c,0,0),i1=B.v(p[0]+ux-vx,p[1]-vy,p[2]+uz-vz,c,1,0),i2=B.v(p[0]+ux+vx,p[1]+vy,p[2]+uz+vz,c,1,1),i3=B.v(p[0]-ux+vx,p[1]+vy,p[2]-uz+vz,c,0,1);B.quad(i0,i1,i2,i3);}}}
/* ---------------- species ---------------- */
function mats(T,o){return new T.MeshStandardMaterial(Object.assign({vertexColors:true,roughness:.85,metalness:0,side:T.DoubleSide},o||{}));}
KOT.palm=function(T,v,seed){const r=rng(seed||11+v*7),g=new T.Group();const B=new Builder(),F=new Builder();
  const lean=[.05,.22,.12][v%3],dirA=r()*6.283,H=.8,dx=Math.cos(dirA),dz=Math.sin(dirA),wig=[0,.03,-.05][v%3];
  const P=[],RAD=[];for(let i=0;i<=24;i++){const t=i/24,l=lean*Math.pow(t,1.4)*H+wig*Math.sin(t*Math.PI)*H;P.push([dx*l,t*H,dz*l]);RAD.push(.019*(1-.28*t)+.026*Math.pow(1-t,8));}
  tube(B,P,RAD,9,[1,1,1],6);const C=P[P.length-1];
  /* boots: old frond bases round the top of the trunk */
  for(let k=0;k<14;k++){const a=k/14*6.283+r(),y=C[1]-.05+r()*.04;const c=lin([.46,.38,.26]);const p0=[C[0]+Math.cos(a)*.012,y,C[2]+Math.sin(a)*.012],p1=[C[0]+Math.cos(a)*.04,y+.05,C[2]+Math.sin(a)*.04];
    const s=[-Math.sin(a)*.012,0,Math.cos(a)*.012];const i0=F.v(p0[0]-s[0],p0[1],p0[2]-s[2],c),i1=F.v(p0[0]+s[0],p0[1],p0[2]+s[2],c),i2=F.v(p1[0]+s[0],p1[1],p1[2]+s[2],c),i3=F.v(p1[0]-s[0],p1[1],p1[2]-s[2],c);F.quad(i0,i1,i2,i3);}
  /* coconuts */
  for(let k=0;k<8;k++){const a=r()*6.283,rr=.018+r()*.012;sphere(F,[C[0]+Math.cos(a)*rr,C[1]-.015-r()*.02,C[2]+Math.sin(a)*rr],.011,lin(r()<.5?[.42,.46,.2]:[.46,.34,.18]));}
  /* fronds */
  const NF=28;for(let k=0;k<NF;k++){const phi=k*2.39996+r()*.3,tier=k/NF,dead=tier>.9;
    const el=(dead?-70:52-tier*80)*Math.PI/180+(r()-.5)*.18,L=(dead?.22:.38+r()*.07)*(tier<.12?.75:1),droop=dead?.05:.26+tier*.42;
    const d0=[Math.cos(el)*Math.cos(phi),Math.sin(el),Math.cos(el)*Math.sin(phi)];const S=34,mid=[];
    for(let i=0;i<=S;i++){const s=i/S;mid.push([C[0]+d0[0]*L*s,C[1]+.01+d0[1]*L*s-droop*L*s*s,C[2]+d0[2]*L*s]);}
    const base=dead?hsl(.09,.45,.34):hsl(.22+r()*.035,.5+r()*.12,.2+r()*.07);
    tube(F,mid,mid.map((_,i)=>.0035*(1-i/S)+.001),3,lin(dead?[.5,.4,.25]:[.62,.6,.36]));
    for(let i=2;i<S;i++){const s=i/S,p=mid[i],q=mid[i+1];let tx=q[0]-p[0],ty=q[1]-p[1],tz=q[2]-p[2];const tl=Math.hypot(tx,ty,tz);tx/=tl;ty/=tl;tz/=tl;
      let sx=tz,sz=-tx;const sl=Math.hypot(sx,sz)||1;sx/=sl;sz/=sl;
      const ll=L*.36*Math.pow(Math.sin(Math.PI*(.06+.94*s)),.75)*(dead?.6:1);
      for(const sd of[-1,1]){const dn=.42+s*.38,ex=sx*sd*Math.cos(dn),ey=-Math.sin(dn),ez=sz*sd*Math.cos(dn);
        const tip=[p[0]+ex*ll+tx*ll*.35,p[1]+ey*ll*.8-ll*.12*s,p[2]+ez*ll+tz*ll*.35],w=.0055;
        const jit=(r()-.5)*.06,c=lin([base[0]+jit,base[1]+jit*1.2+(1-s)*.03,base[2]+jit*.5]);const ct=lin([base[0]+.06+jit,base[1]+.05+jit,base[2]]);
        const a=F.v(p[0]-tx*w,p[1]-ty*w,p[2]-tz*w,c),b=F.v(p[0]+tx*w,p[1]+ty*w,p[2]+tz*w,c),cc=F.v(tip[0],tip[1],tip[2],ct),d=F.v(tip[0]-tx*w*.5,tip[1]-ty*w*.5-.002,tip[2]-tz*w*.5,ct);F.quad(a,b,cc,d);}}}
  g.add(new T.Mesh(B.geo(T),mats(T,{map:KOT.barkTex(T,'palm'),vertexColors:false,side:T.FrontSide,roughness:.95})));
  g.add(new T.Mesh(F.geo(T),mats(T,{roughness:.7})));return norm(T,g);};
KOT.monkey=function(T,v,seed){const r=rng(seed||31+v*13),g=new T.Group();const B=new Builder(),L=new Builder();const W=v?1.05:.85;/* crown half-width */
  const TP=[[0,0,0],[0,.14,0],[.01,.26,0]];tube(B,TP,[.05,.042,.038],10,[1,1,1],2);
  const NL=6,ends=[];for(let k=0;k<NL;k++){const a=k/NL*6.283+r()*.6,R=W*(.45+r()*.3),top=.6+r()*.12;const pts=[];
    for(let i=0;i<=8;i++){const s=i/8,rr=R*Math.pow(s,.8),y=.24+(top-.24)*Math.sqrt(s)+.05*Math.sin(s*3);pts.push([Math.cos(a)*rr,y,Math.sin(a)*rr]);}
    tube(B,pts,pts.map((_,i)=>.03*(1-i/9)+.006),7,[1,1,1],3);ends.push(pts);
    for(let j=0;j<3;j++){const p0=pts[4+j],a2=a+(r()-.5)*1.4,l=.18+r()*.14,q=[];for(let i=0;i<=4;i++){const s=i/4;q.push([p0[0]+Math.cos(a2)*l*s,p0[1]+l*.55*s,p0[2]+Math.sin(a2)*l*s]);}tube(B,q,q.map((_,i)=>.012*(1-i/5)+.003),5,[1,1,1],1);}}
  const pts=[];for(let i=0;i<950;i++){const a=r()*6.283,u=Math.sqrt(r()),rr=W*u;const top=.99-.34*Math.pow(u,2.3)+.03*Math.sin(a*5+u*7),th=.1+.16*(1-u*u);const y=top-r()*th;pts.push([Math.cos(a)*rr,y,Math.sin(a)*rr]);}
  cards(L,pts,.075,p=>{const k=.85+Math.min(.25,(p[1]-.6)*.6)+(Math.random()-.5)*.08;return[k,k,k];},r);
  g.add(new T.Mesh(B.geo(T),mats(T,{map:KOT.barkTex(T,'monkey'),vertexColors:false,side:T.FrontSide,roughness:.95})));
  g.add(new T.Mesh(L.geo(T),mats(T,{map:KOT.clusterTex(T,'monkey'),alphaTest:.45})));return norm(T,g);};
KOT.cook=function(T,v,seed){const r=rng(seed||51+v*5),g=new T.Group();const B=new Builder(),L=new Builder();const lean=v?.06:.02,la=r()*6.283;
  const P=[],RAD=[];for(let i=0;i<=20;i++){const t=i/20;P.push([Math.cos(la)*lean*t*t,t,Math.sin(la)*lean*t*t]);RAD.push(.012*(1-.85*t)+.002);}tube(B,P,RAD,8,[1,1,1],8);
  const pts=[];for(let y=.14;y<.99;y+=.04+r()*.018){const t=y,n=5+Math.floor(r()*3),c=[Math.cos(la)*lean*t*t,y,Math.sin(la)*lean*t*t],Lb=(.055*Math.pow(1-t,.8)+.014)*(1+(r()-.5)*.5),a0=r()*6.283;
    for(let k=0;k<n;k++){const a=a0+k/n*6.283+(r()-.5)*.4,q=[];for(let i=0;i<=5;i++){const s=i/5;q.push([c[0]+Math.cos(a)*Lb*s,c[1]-.012*s+.02*s*s*s,c[2]+Math.sin(a)*Lb*s]);}
      tube(B,q,q.map((_,i)=>.003*(1-i/6)+.001),4,[1,1,1],1);for(let i=1;i<=5;i++)pts.push(q[i]);}}
  pts.push(P[20]);cards(L,pts,.016,p=>{const k=.8+r()*.25;return[k,k,k];},r);
  g.add(new T.Mesh(B.geo(T),mats(T,{map:KOT.barkTex(T,'cook'),vertexColors:false,side:T.FrontSide,roughness:.95})));
  g.add(new T.Mesh(L.geo(T),mats(T,{map:KOT.clusterTex(T,'cook'),alphaTest:.45})));return norm(T,g);};
KOT.plum=function(T,v,seed){const r=rng(seed||71+v*3),g=new T.Group();const B=new Builder(),L=new Builder(),FL=new Builder();
  const top=[0,.24,0];tube(B,[[0,0,0],[.005,.12,0],top],[.034,.03,.027],8,[1,1,1],2);
  const NJ=4,J=[];for(let k=0;k<NJ;k++){const a=k/NJ*6.283+r()*.5,p=[Math.cos(a)*(.12+r()*.05),.42+r()*.06,Math.sin(a)*(.12+r()*.05)];J.push(p);tube(B,[top,[(top[0]+p[0])/2,(top[1]+p[1])/2+.02,(top[2]+p[2])/2],p],[.024,.021,.019],7,[1,1,1],1);}
  const tips=[];const NT=v?16:13;for(let k=0;k<NT;k++){const a=k/NT*6.283+r()*.4,rr=.2+r()*.24,y=.6+(1-rr/.44)*.22+r()*.06;const tp=[Math.cos(a)*rr,y,Math.sin(a)*rr];
    let jb=J[0],bd=1e9;for(const j of J){const d=Math.hypot(j[0]-tp[0],j[2]-tp[2]);if(d<bd){bd=d;jb=j;}}
    const m=[(jb[0]+tp[0])/2,(jb[1]+tp[1])/2+.03,(jb[2]+tp[2])/2];tube(B,[jb,m,tp],[.016,.013,.011],6,[1,1,1],1);tips.push(tp);}
  for(const q of tips){const n=9;for(let k=0;k<n;k++){const a=k/n*6.283+r(),el=.25+r()*.6,l=.13+r()*.06,w=.036;const dir=[Math.cos(el)*Math.cos(a),Math.sin(el),Math.cos(el)*Math.sin(a)],sx=-Math.sin(a),sz=Math.cos(a);
      const c=lin(hsl(.24+r()*.03,.48,.34+r()*.08)),ctr=[q[0]+dir[0]*l*.5,q[1]+dir[1]*l*.5,q[2]+dir[2]*l*.5],tip=[q[0]+dir[0]*l,q[1]+dir[1]*l-.03,q[2]+dir[2]*l];
      const a0=L.v(q[0],q[1],q[2],c),a1=L.v(ctr[0]+sx*w,ctr[1],ctr[2]+sz*w,c),a2=L.v(tip[0],tip[1],tip[2],c),a3=L.v(ctr[0]-sx*w,ctr[1],ctr[2]-sz*w,c);L.quad(a0,a1,a2,a3);}
    const fp=[];for(let k=0;k<9;k++)fp.push([q[0]+(r()-.5)*.07,q[1]+.03+r()*.05,q[2]+(r()-.5)*.07]);cards(FL,fp,.026,[1,1,1],r);}
  g.add(new T.Mesh(B.geo(T),mats(T,{map:KOT.barkTex(T,'plum'),vertexColors:false,side:T.FrontSide,roughness:.9})));g.add(new T.Mesh(L.geo(T),mats(T,{roughness:.6})));
  g.add(new T.Mesh(FL.geo(T),mats(T,{map:KOT.flowerTex(T),alphaTest:.5,roughness:.5})));return norm(T,g);};
KOT.broad=function(T,v,seed,kind){const r=rng(seed||91+v*17),g=new T.Group();const B=new Builder(),L=new Builder();const scrub=kind==='scrub';const W=scrub?.62+v*.1:.5+v*.12;
  tube(B,[[0,0,0],[0,.18,0],[.02,.3,0]],[.04,.034,.03],8,[1,1,1],2);
  for(let k=0;k<4;k++){const a=k/4*6.283+r(),q=[];for(let i=0;i<=5;i++){const s=i/5;q.push([Math.cos(a)*W*.55*s,.28+.35*s,Math.sin(a)*W*.55*s]);}tube(B,q,q.map((_,i)=>.02*(1-i/6)+.004),6,[1,1,1],2);}
  const pts=[],blobs=[];for(let k=0;k<7;k++){const a=r()*6.283,rr=r()*W*.55;blobs.push([Math.cos(a)*rr,.62+r()*.2,Math.sin(a)*rr,.22+r()*.14]);}
  for(let i=0;i<(scrub?700:620);i++){const b=blobs[Math.floor(r()*blobs.length)],u=Math.cbrt(r()),th=r()*6.283,ph=Math.acos(2*r()-1);
    pts.push([b[0]+Math.sin(ph)*Math.cos(th)*b[3]*u*1.5,Math.min(.98,b[1]+Math.cos(ph)*b[3]*u),b[2]+Math.sin(ph)*Math.sin(th)*b[3]*u*1.5]);}
  cards(L,pts,scrub?.07:.075,p=>{const k=.85+(p[1]-.6)*.4;return[k,k,k];},r);
  g.add(new T.Mesh(B.geo(T),mats(T,{map:KOT.barkTex(T,'broad'),vertexColors:false,side:T.FrontSide,roughness:.95})));
  g.add(new T.Mesh(L.geo(T),mats(T,{map:KOT.clusterTex(T,scrub?'scrub':'broad'),alphaTest:.45})));return norm(T,g);};
/* Pacific Northwest conifer (Douglas fir / western hemlock look): full conical crown of drooping, layered branches */
/* Augusta loblolly pine: tall bare trunk with a slight lean, a few upswept limbs carrying clumpy needle tufts in the top third */
/* Pebble Beach: Monterey cypress, wind-sculpted: a short, leaning, forked trunk; heavy limbs swept sideways; flat, dark
   foliage pads stacked toward a flat top */
KOT.cyp=function(T,v,seed){const r=rng(seed||401+v*17),g=new T.Group();const B=new Builder(),L=new Builder();
  const lean=[.22,-.12,.3][v%3],side=[1,-1,1][v%3];const P=[],RAD=[];for(let i=0;i<=12;i++){const t=i/12*.42;P.push([lean*t*1.6,t,0]);RAD.push(.05*(1-.45*i/12)+.012);}tube(B,P,RAD,8,[1,1,1],6);
  const top=P[P.length-1],pts=[];const nl=5+Math.floor(r()*3);
  for(let k=0;k<nl;k++){const a=(r()-.5)*2.6+(side>0?0:Math.PI)+(k%2?0.9:-0.3),len=.32+r()*.38,rise=.18+r()*.32,q=[];
    for(let i=0;i<=8;i++){const s=i/8;q.push([top[0]+Math.cos(a)*len*s+lean*.35*s,top[1]+rise*s*(1.2-.5*s),Math.sin(a)*len*s*.8]);}
    tube(B,q,q.map((_,i)=>.022*(1-i/9)+.004),5,[1,1,1],2);
    for(let i=3;i<=8;i++){const p=q[i];for(let m=0;m<7;m++)pts.push([p[0]+(r()-.5)*.2,p[1]+(r()-.2)*.06,p[2]+(r()-.5)*.17]);}}
  /* flat foliage pads spread level around the ends of the limbs (no floating top) */
  const ends=pts.slice(-6*nl).filter((_,i)=>i%7===0);for(const e of ends)for(let m=0;m<10;m++){const a=r()*6.283,rr=Math.sqrt(r())*.16;pts.push([e[0]+Math.cos(a)*rr,e[1]+.02+(r()-.5)*.04,e[2]+Math.sin(a)*rr*.8]);}
  cards(L,pts,.075,p=>{const k=.62+r()*.25+(p[1]-.6)*.25;return[k,k,k];},r);
  g.add(new T.Mesh(B.geo(T),mats(T,{map:KOT.barkTex(T,'monkey'),vertexColors:false,side:T.FrontSide,roughness:.95})));
  g.add(new T.Mesh(L.geo(T),mats(T,{map:KOT.clusterTex(T,'cyp'),alphaTest:.45})));return norm(T,g);};
/* Monterey pine: straight trunk, irregular domed crown of dark clumps from about 40% of the height */
KOT.mpine=function(T,v,seed){const r=rng(seed||509+v*23),g=new T.Group();const B=new Builder(),L=new Builder();
  const cb=[.38,.45,.5][v%3],wid=[.3,.36,.27][v%3],lean=(r()-.5)*.06;const P=[],RAD=[];for(let i=0;i<=20;i++){const t=i/20;P.push([lean*t,t,0]);RAD.push(.022*(1-.6*t)+.003);}tube(B,P,RAD,8,[1,1,1],8);
  const pts=[];for(let y=cb;y<.97;y+=.05+r()*.03){const t=(y-cb)/(1-cb),R=wid*Math.sin(Math.PI*Math.min(1,.25+t*.85))*(.8+r()*.4),n=4+Math.floor(r()*3),a0=r()*6.283;
    for(let k=0;k<n;k++){const a=a0+k/n*6.283+(r()-.5)*.6,len=R*(.7+r()*.4),q=[];for(let i=0;i<=5;i++){const s=i/5;q.push([lean*y+Math.cos(a)*len*s,y+.05*s,Math.sin(a)*len*s]);}
      tube(B,q,q.map((_,i)=>.006*(1-i/6)+.0015),4,[1,1,1],1);for(let i=2;i<=5;i++){const p=q[i];for(let m=0;m<3;m++)pts.push([p[0]+(r()-.5)*.08,p[1]+(r()-.4)*.06,p[2]+(r()-.5)*.08]);}}}
  cards(L,pts,.06,p=>{const k=.66+r()*.25;return[k,k,k];},r);
  g.add(new T.Mesh(B.geo(T),mats(T,{map:KOT.barkTex(T,'cook'),vertexColors:false,side:T.FrontSide,roughness:.95})));
  g.add(new T.Mesh(L.geo(T),mats(T,{map:KOT.clusterTex(T,'mpine'),alphaTest:.45})));return norm(T,g);};
KOT.lob=function(T,v,seed){const r=rng(seed||211+v*31),g=new T.Group();const B=new Builder(),L=new Builder();
  const cb=[.55,.6,.66][v%3],lean=(r()-.5)*.05,wid=[.27,.31,.25][v%3];
  const P=[],RAD=[];for(let i=0;i<=24;i++){const t=i/24;P.push([lean*t+Math.sin(t*5+v)*.006,t,0]);RAD.push(.016*(1-.55*t)+.003);}tube(B,P,RAD,8,[1,1,1],10);
  const pts=[];const nl=8+Math.floor(r()*4);
  for(let k=0;k<nl;k++){const y0=cb+(.96-cb)*k/nl+r()*.03,a=r()*6.283,len=wid*(.55+r()*.6)*(1-.35*(y0-cb)/(1-cb)),q=[];
    for(let i=0;i<=6;i++){const s=i/6;q.push([lean*y0+Math.cos(a)*len*s,y0+.07*s*s+.02*s,Math.sin(a)*len*s]);}
    tube(B,q,q.map((_,i)=>.006*(1-i/7)+.0015),4,[1,1,1],1);
    for(let i=2;i<=6;i++){const p=q[i],n=4+Math.floor(r()*3);for(let m=0;m<n;m++)pts.push([p[0]+(r()-.5)*.09,p[1]+(r()-.4)*.06,p[2]+(r()-.5)*.09]);}}
  for(let m=0;m<26;m++){const a=r()*6.283,rr=r()*wid*.5;pts.push([lean+Math.cos(a)*rr,.93+r()*.07,Math.sin(a)*rr]);}
  cards(L,pts,.05,p=>{const k=.7+r()*.25+(p[1]-.8)*.3;return[k,k,k];},r);
  g.add(new T.Mesh(B.geo(T),mats(T,{map:KOT.barkTex(T,'cook'),vertexColors:false,side:T.FrontSide,roughness:.95})));
  g.add(new T.Mesh(L.geo(T),mats(T,{map:KOT.clusterTex(T,'lob'),alphaTest:.45})));return norm(T,g);};
/* flowering dogwood: low spreading tiers covered in white bracts */
KOT.dogw=function(T,v,seed){const r=rng(seed||307+v*13),g=new T.Group();const B=new Builder(),L=new Builder();
  const P=[[0,0,0],[.01,.25,0],[.02,.42,.01]];tube(B,P,[.035,.028,.02],7,[1,1,1],3);const pts=[];
  for(let k=0;k<9;k++){const a=k/9*6.283+r()*.4,y0=.32+r()*.25,len=.32+r()*.18,q=[];for(let i=0;i<=5;i++){const s=i/5;q.push([Math.cos(a)*len*s,y0+.18*s-.12*s*s,Math.sin(a)*len*s]);}
    tube(B,q,q.map((_,i)=>.012*(1-i/6)+.002),4,[1,1,1],1);for(let i=1;i<=5;i++){const p=q[i];for(let m=0;m<5;m++)pts.push([p[0]+(r()-.5)*.12,p[1]+r()*.07,p[2]+(r()-.5)*.12]);}}
  cards(L,pts,.07,p=>{const k=.85+r()*.15;return[k,k,k];},r);
  g.add(new T.Mesh(B.geo(T),mats(T,{map:KOT.barkTex(T,'broad'),vertexColors:false,side:T.FrontSide,roughness:.95})));
  g.add(new T.Mesh(L.geo(T),mats(T,{map:KOT.clusterTex(T,'dogw'),alphaTest:.45})));return norm(T,g);};
KOT.dfir=function(T,v,seed){const r=rng(seed||131+v*19),g=new T.Group();const B=new Builder(),L=new Builder();
  const base=[.12,.2,.32][v%3],wid=[.2,.25,.22][v%3],lean=(r()-.5)*.02;
  const P=[],RAD=[];for(let i=0;i<=20;i++){const t=i/20;P.push([lean*t,t,0]);RAD.push(.018*(1-.8*t)+.002);}tube(B,P,RAD,8,[1,1,1],8);
  const pts=[];for(let y=base;y<.985;y+=.018+r()*.01){const t=(y-base)/(1-base),R=wid*Math.pow(1-t,.95)*(1+(r()-.5)*.35)+.015,n=6+Math.floor(r()*4),a0=r()*6.283;
    for(let k=0;k<n;k++){const a=a0+k/n*6.283+(r()-.5)*.5,len=R*(.75+r()*.45),q=[];for(let i=0;i<=5;i++){const s=i/5;q.push([lean*y+Math.cos(a)*len*s,y-.05*len*s*s-.015*s,Math.sin(a)*len*s]);}
      tube(B,q,q.map((_,i)=>.0035*(1-i/6)+.001),4,[1,1,1],1);for(let i=1;i<=5;i++){const p=q[i];pts.push([p[0],p[1]-.006,p[2]]);if(i>2)pts.push([p[0]+(r()-.5)*.03,p[1]-.012,p[2]+(r()-.5)*.03]);}}}
  pts.push([lean,1,0]);cards(L,pts,.026,p=>{const k=.72+r()*.22+(p[1]-.5)*.12;return[k,k,k];},r);
  g.add(new T.Mesh(B.geo(T),mats(T,{map:KOT.barkTex(T,'cook'),vertexColors:false,side:T.FrontSide,roughness:.95})));
  g.add(new T.Mesh(L.geo(T),mats(T,{map:KOT.clusterTex(T,'dfir'),alphaTest:.45})));return norm(T,g);};
function norm(T,g){const b=new T.Box3().setFromObject(g);const s=1/b.max.y;g.scale.setScalar(s);g.updateMatrixWorld(true);return g;}
root.KOT=KOT;})(typeof window!=='undefined'?window:globalThis);

/* ===== Pebble Beach Golf Links: course extension for Degen Golfers '26 =====
   Loaded by boot.js before main.js (course JSON "ext":"pb.js"). Monterey cypress and pine from the 2018 California lidar,
   the Pacific with surf on the rocks, granite cliffs, Carmel Beach and Stillwater Cove sand, native grass and ice plant. */
(function(){
if(window.COURSE_KEY!=='pb')return;
window.COURSE_EXT_READY=fetch('pb_extra.json').then(r=>r.json()).then(x=>{Object.assign(window.COURSE,x);}).catch(e=>console.warn('[pb] extra data',e));
/* ---------- phone test aid: open the site with #fps in the address to see frames per second (1 s average and the
   slowest frame), top-left. Off unless asked for. ---------- */
if(/[#&]fps/.test(location.hash)){const el=document.createElement('div');el.style.cssText='position:fixed;left:6px;top:6px;z-index:99999;font:600 13px system-ui;color:#fff;background:rgba(0,0,0,.55);padding:3px 7px;border-radius:6px;pointer-events:none';
  document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(el));let n=0,t0=performance.now(),last=t0,worst=0;
  const tick=t=>{n++;worst=Math.max(worst,t-last);last=t;if(t-t0>=1000){el.textContent=Math.round(n*1000/(t-t0))+' fps · slowest '+Math.round(worst)+' ms';n=0;t0=t;worst=0;}requestAnimationFrame(tick);};requestAnimationFrame(tick);console.log('[pb] fps meter on');}
const X={};
const hsh=(x,y)=>{const s=Math.sin(x*12.9898+y*78.233)*43758.5453;return s-Math.floor(s);};
/* ---------- trees: every crown from the lidar. Monterey cypress (by the sea), Monterey pine, coast live oak.
   Collisions use the game's high-crown model for all of them, with the crown radius capped (no low cones). ---------- */
X.trees=function(A){const T=A.THREE,D=A.D,TR=A.TREES,TH=A.THASH;TR.length=0;TH.clear();const S=[[],[],[]];
  for(const q of D.tl){const x=q[0],y=q[1],sp=q[4],t={x,y,gz:A.H(x,y),h:q[2],r:Math.min(q[3],Math.max(3,.32*q[2]),10),fir:false,v:Math.floor(hsh(x,y)*(sp===2?1.999:2.999))};
    if(sp===0)t.hero='cyp'+t.v;else if(sp===1)t.hero='mpine'+t.v;TR.push(t);S[sp].push(t);
    const R2=Math.ceil(t.r/10)+1,cx=Math.floor(x/10),cy=Math.floor(y/10);for(let i=-R2;i<=R2;i++)for(let j=-R2;j<=R2;j++){const k=(cx+i)+','+(cy+j);let a=TH.get(k);if(!a)TH.set(k,a=[]);a.push(t);}}
  const ld=u=>{const t=new T.TextureLoader().load(u);t.encoding=T.sRGBEncoding;t.anisotropy=4;return t;};
  A.scene.add(A.mkImp(S[0],ld('pb_cypAtlas.webp'),8,3,[1.05,1.05,1.05],1.542),A.mkImp(S[1],ld('pb_mpineAtlas.webp'),8,3,[1.05,1.05,1.05],.811),A.mkImp(S[2],ld(window.ASSETS.broadAtlas),4,2,[1.216,1.03],1));
  console.log('[pb] lidar trees',TR.length,'cypress',S[0].length,'pine',S[1].length,'oak',S[2].length);return true;};
X.heroInit=function(HERO,A){const T=A.THREE;if(!window.KOT)return;for(const kind of['cyp','mpine'])for(let v=0;v<3;v++){if(!KOT[kind])continue;const g=KOT[kind](T,v);g.updateMatrixWorld(true);const ms=[];g.traverse(o=>{if(o.isMesh)ms.push(o);});
    const mk=(me,N)=>{const geo=me.geometry.clone();geo.applyMatrix4(me.matrixWorld);const mt=me.material;mt.userData.lin=1;const M=A.IMC(new T.InstancedMesh(geo,mt,N));M.count=0;M.castShadow=true;M.receiveShadow=true;M.frustumCulled=false;A.scene.add(M);return M;};
    HERO[kind+v]={B:mk(ms[0],8),L:mk(ms[1],8),h:1,N:8,k:1,noYaw:false};}console.log('[pb] hero cypress and pines ready');};
X.farWater=function(w,A){const T=A.THREE,D=A.D,S=D.sea,WM=window.__WM;
  const TL=new T.TextureLoader(),dm=TL.load(S.img),df=TL.load(D.seafar.img),dc=TL.load((D.seac||S).img);for(const x of[dm,df]){x.minFilter=T.LinearFilter;x.generateMipmaps=false;}const SF=D.seafar;
  const U={sky:{value:A.skyMat.uniforms.sky.value},nm:{value:WM?WM.uniforms.nm.value:null},dm:{value:dm},df:{value:df},dc:{value:dc},cb4:{value:new T.Vector4((D.seac||S).x0,(D.seac||S).x1,(D.seac||S).y0,(D.seac||S).y1)},fb4:{value:new T.Vector4(SF.x0,SF.x1,SF.y0,SF.y1)},rot:{value:A.skyMat.uniforms.rot.value},t:A.WT,sun:{value:A.sunDir},uLin:A.LINQ,
    hz:{value:new T.Color(D.fogC)},sb:{value:new T.Vector4(S.x0,S.x1,S.y0,S.y1)}};
  w.material=new T.ShaderMaterial({uniforms:U,extensions:{derivatives:true},
    vertexShader:'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader:'uniform sampler2D sky,nm,dm,df,dc;uniform float rot,t,uLin;uniform vec3 sun,hz;uniform vec4 sb,fb4,cb4;varying vec3 vW;'+
     'vec3 skyS(vec3 d){float u=fract(atan(d.z,d.x)*.1591549+.5+rot);float v=max(asin(clamp(d.y,-1.,1.))*.3183099+.5,.503);return texture2D(sky,vec2(u,v)).rgb;}\n'+
     'void main(){vec2 p=vW.xz;float dist=length(cameraPosition-vW);vec2 lp=vec2(p.x,-p.y);vec2 uv=vec2((lp.x-sb.x)/(sb.y-sb.x),(lp.y-sb.z)/(sb.w-sb.z));'+
     'vec2 uf=vec2((lp.x-fb4.x)/(fb4.y-fb4.x),(lp.y-fb4.z)/(fb4.w-fb4.z));vec2 uc=vec2((lp.x-cb4.x)/(cb4.y-cb4.x),(lp.y-cb4.z)/(cb4.w-cb4.z));float s=1.;if(uc.x>0.&&uc.x<1.&&uc.y>0.&&uc.y<1.)s=texture2D(dc,uc).r;else if(uv.x>0.&&uv.x<1.&&uv.y>0.&&uv.y<1.)s=texture2D(dm,uv).r;else if(uf.x>0.&&uf.x<1.&&uf.y>0.&&uf.y<1.)s=texture2D(df,uf).r;'+
     /* land: no water there (the low coastal plain would otherwise z-fight with the sea kilometres away) */
     'if(s<.05)discard;float dep=s*s;'+
     'float fp=length(fwidth(p));float fb=1.-smoothstep(.6,4.,fp);float fc=1.-smoothstep(.2,1.2,fp);'+
     'vec3 a=texture2D(nm,p/41.+vec2(t*.011,t*.007)).xyz*2.-1.;vec3 b=texture2D(nm,p/12.5+vec2(-t*.019,t*.014)).xyz*2.-1.;vec3 c=texture2D(nm,p/3.3+vec2(t*.045,-t*.037)).xyz*2.-1.;'+
     'float sw=sin(dot(p,vec2(.043,.027))+t*.8)+.6*sin(dot(p,vec2(-.019,.061))+t*.63);'+
     'vec2 pert=(a.xy*.62+b.xy*.42*fb+c.xy*.3*fc)*.3+vec2(.035,.025)*sw*fb;vec3 n=normalize(vec3(pert.x,1.,pert.y));'+
     'vec3 v=normalize(cameraPosition-vW);vec3 r=reflect(-v,n);r.y=abs(r.y);float fr=.02+.98*pow(1.-max(dot(n,v),0.),5.);'+
     'vec3 shal=vec3(.20,.46,.56),mid=vec3(.10,.36,.52),deep=vec3(.06,.25,.43);vec3 body=mix(shal,mid,smoothstep(0.,.22,dep));body=mix(body,deep,smoothstep(.22,1.,dep));'+
     'body=mix(vec3(.42,.58,.62),body,smoothstep(0.,.03,dep));'+
     'vec3 col=mix(body,skyS(r),clamp(fr*1.2+.05,0.,.85));float wc=smoothstep(.86,.97,.5+.5*sin(p.x*.21+c.x*3.+t*.4)*sin(p.y*.17-b.y*3.-t*.3))*smoothstep(.15,.4,dep)*fc;col=mix(col,vec3(.93,.96,.97),wc*.55);'+
     'vec3 ns=normalize(vec3((c.xy*.7+b.xy*.5)*.85,1.));vec3 rs=reflect(-v,ns);vec3 sd=normalize(sun);'+
     'float g=pow(max(dot(rs,sd),0.),700.)*7.*fc+pow(max(dot(r,sd),0.),140.)*1.6;col+=vec3(1.,.96,.86)*g;'+
     'float br=(1.-smoothstep(0.,.016,dep))*smoothstep(.35,.75,.5+.5*sin(p.x*.09+p.y*.07+t*.35+a.x*3.));float sw2=.5+.5*sin(dep*900.-t*1.3+b.x*5.+a.y*4.);float fm=br*(.35+.65*sw2)*(.7+.3*a.y);float fo=(1.-smoothstep(.02,.06,dep))*smoothstep(.7,1.,.5+.5*sin(dep*420.-t*.9+a.x*6.+b.y*5.))*smoothstep(.2,.8,a.y*.5+.5)*.45;col=mix(col,vec3(.97,.98,.98),clamp(fm+fo,0.,1.)*.9);float ln=0.;for(int q=0;q<3;q++){float c0=.012+.016*float(q)+.004*sin(t*.5+float(q)*2.);ln+=(1.-smoothstep(0.,.0035,abs(dep-c0)))*smoothstep(.3,.7,.5+.5*sin(p.x*.05+p.y*.04+float(q)*1.7+a.x*2.));}col=mix(col,vec3(.96,.98,.98),clamp(ln,0.,1.)*.85);'+
     'float k=1.-exp(-dist/9000.);col=mix(col,hz,clamp(k*.8,0.,.8));'+
     'if(uLin>.5)col=pow(col,vec3(2.2));gl_FragColor=vec4(col,1.);}'});
  w.material.customProgramCacheKey=()=>'pbOcean';w.renderOrder=0;
  const o=A.outer;if(o)o.position.y=Math.min(o.position.y,D.far.lakeH-3);console.log('[pb] Pacific');};

/* ---------- the neighbourhoods round the course: OSM footprints, siding walls, dark composition-shingle hip roofs ---------- */
function houses(A){const T=A.THREE,D=A.D,P=[],C=[],R=[],RC=[],c=new T.Color();const WALL=['#f4f2ec','#efece4','#e8e4da','#f7f5ef'],ROOF=['#3c4a40','#3d3f42','#45524a','#4a4643'];
  const push=(arr,ca,v,col)=>{arr.push(v.x,v.y,v.z);ca.push(col.r,col.g,col.b);};let n=0;
  for(const b of D.kbld||[]){const Pp=b.p;let cx=0,cy=0;Pp.forEach(q=>{cx+=q[0];cy+=q[1];});cx/=Pp.length;cy/=Pp.length;const club=/golf club/i.test(b.n||'')||b.t==='clubhouse';const lie=A.lieAt(cx,cy);if(!club&&lie!=='oob'&&lie!=='rough')continue;
    let gz=1e9;for(const q of Pp)gz=Math.min(gz,A.H(q[0],q[1]));gz-=.4;let ar=0;for(let i=0;i<Pp.length;i++){const a=Pp[i],e=Pp[(i+1)%Pp.length];ar+=a[0]*e[1]-e[0]*a[1];}ar=Math.abs(ar)/2;
    const rh=club?Math.min(9,.3*Math.sqrt(ar)):Math.min(4,.22*Math.sqrt(ar)),wh=Math.max(2.8,b.h-rh*(club?.5:1)),top=gz+.4+wh;c.set(club?'#8e9396':WALL[Math.floor(hsh(cx,cy)*WALL.length)]).convertSRGBToLinear();
    for(let i=0;i<Pp.length;i++){const a=Pp[i],e=Pp[(i+1)%Pp.length],v=[A.V(a[0],a[1],gz),A.V(e[0],e[1],gz),A.V(e[0],e[1],top),A.V(a[0],a[1],top)];for(const k of[0,1,2,0,2,3])push(P,C,v[k],c);}
    c.set(club?'#2f3336':ROOF[Math.floor(hsh(cy,cx)*ROOF.length)]).convertSRGBToLinear();const ap=A.V(cx,cy,top+rh);
    for(let i=0;i<Pp.length;i++){const a=Pp[i],e=Pp[(i+1)%Pp.length],ev=q=>{const dx=q[0]-cx,dy=q[1]-cy,dd=Math.hypot(dx,dy)||1;return A.V(q[0]+dx/dd*.6,q[1]+dy/dd*.6,top-.15);};push(R,RC,ev(a),c);push(R,RC,ev(e),c);push(R,RC,ap,c);}n++;}
  for(const [p,cc] of[[P,C],[R,RC]]){if(!p.length)continue;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('color',new T.Float32BufferAttribute(cc,3));g.computeVertexNormals();
    const m=new T.Mesh(g,new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide}));m.material.userData.lin=1;m.castShadow=true;m.receiveShadow=true;A.scene.add(m);}console.log('[pb] houses',n);}
/* ---------- ground: granite cliffs, beach sand, native grass and ice plant (pb_ground.png: R rock, G beach, B 255 native grass / 128 ice plant) ---------- */
function ground(A){const D=A.D,G=D.ground;if(!G)return;const img=new Image();img.onload=()=>{try{
  const w=img.width,h=img.height,cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d');x.drawImage(img,0,0);const src=x.getImageData(0,0,w,h).data;
  const col=x.createImageData(w,h),cd=col.data,msk=x.createImageData(w,h),md=msk.data;
  for(let i=0;i<src.length;i+=4){const p=i/4,px=p%w,py=(p/w)|0,n=hsh(px*.31,py*.47),n2=hsh(px*.07|0,py*.07|0);let r=0,g=0,b=0,a=0,m=0;
    if(src[i]>127){const k=.62+.5*n,st=hsh(px*.13|0,py*.9|0);r=(150-40*st)*k;g=(118-30*st)*k;b=(84-22*st)*k;a=250;m=1;}   /* golden sandstone and granite cliff faces, streaked */
    else if(src[i+1]>127){/* sand: fine grain, wind ripples, darker wet sand toward the water (the water side is where the mask runs out) */
      const rip=.5+.5*Math.sin(px*.9+py*.35+hsh(px*.02|0,py*.02|0)*6.),gr=hsh(px*1.7,py*2.3),edge=(src[i+1+4*w]<=127||src[i+1-4*w]<=127||src[i+5]<=127||src[i-3]<=127)?1:0;
      let k=.84+.1*rip+.16*(gr-.5);r=184*k;g=162*k;b=126*k;if(edge){r*=.72;g*=.7;b*=.68;}a=250;m=1;}
    else if(src[i+2]>100&&src[i+2]<=200){const k=.8+.35*n;r=112*k;g=118*k;b=64*k;if(n2>.95){r=150;g=88;b=118;}a=225;m=0;} /* ice plant, with magenta bloom */
    else if(src[i+2]>200){/* native grass: golden, with blade streaks; drawn with the game's rough-grass texture over it */const k=.74+.36*n,gg=hsh(px*.05|0,py*.05|0),bl=hsh(px*.9|0,(py*.25|0)+px%3),st=bl>.7?.82:1;r=Math.min(255,(212-34*gg)*k*st);g=Math.min(255,(184-22*gg)*k*st);b=(104-10*gg)*k*st;a=235;m=2;}   /* native grass, golden and summer-dry: no turf texture under it */
    cd[i]=r;cd[i+1]=g;cd[i+2]=b;cd[i+3]=a;if(m===1){md[i]=255;md[i+1]=255;md[i+2]=0;md[i+3]=255;}else if(m===2){md[i]=255;md[i+1]=0;md[i+2]=0;md[i+3]=255;}}
  const put=(ctx,id)=>{const c2=document.createElement('canvas');c2.width=w;c2.height=h;c2.getContext('2d').putImageData(id,0,0);const B=A.box,S=ctx.canvas.width;ctx.save();ctx.setTransform(1,0,0,1,0,0);
    ctx.drawImage(c2,(G.x0-B.X0)/B.WW*S,(B.Y1-G.y1)/B.HH*S,(G.x1-G.x0)/B.WW*S,(G.y1-G.y0)/B.HH*S);ctx.restore();};
  const paint=()=>{put(A.ctx,col);put(A.mx,msk);A.tex.needsUpdate=true;if(A.maskT)A.maskT.needsUpdate=true;};paint();
  /* the game paints its own pale shoreline sand after the course loads; paint ours over it again once that has run */
  setTimeout(paint,2500);setTimeout(paint,7000);console.log('[pb] cliffs, beach, native grass, ice plant painted');}catch(e){console.warn('[pb] ground',e);}};img.src=G.img;}
function linksTurf(A){const c=A.ctx,S=c.canvas.width,B=256;c.save();c.setTransform(1,0,0,1,0,0);for(let y=0;y<S;y+=B){const h=Math.min(B,S-y),id=c.getImageData(0,y,S,h),d=id.data;for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2];if(g>r+6&&g>b){d[i]=Math.min(255,r*1.1+8);d[i+1]=Math.min(255,g*1.03);d[i+2]=b*.86;}}c.putImageData(id,0,y);}c.restore();A.tex.needsUpdate=true;}   /* in 256-row strips: no 64 MB copy of the ground canvas */
function asphalt(A){const c=A.ctx;c.save();c.lineCap=c.lineJoin='round';for(const f of A.D.f){if(f.k!=='cartpath')continue;c.strokeStyle='#4a4b4d';c.lineWidth=2.6;c.beginPath();f.p.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();}c.restore();A.tex.needsUpdate=true;}
X.decor=function(A){for(const [n,f] of[['houses',houses],['turf',linksTurf],['paths',asphalt],['ground',ground]]){try{f(A);}catch(e){console.warn('[pb] '+n,e);}}};
window.COURSE_EXT=X;
})();
