/* Augusta: shaded ground keeps 45% of the sunlight (main.js SHADOW_LIFT), so the shade under the pines reads as green grass and
   orange straw in shadow rather than near-black mud */
if(window.SHADOW_LIFT==null)window.SHADOW_LIFT=.45;
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
  const pal={lob:['#2f4a1f','#385626','#2a4219','#41612a','#33501f'],dogw:['#f4f2ea','#ffffff','#ece9de','#f7f4ec','#5f8a3a'],dfir:['#2b4826','#34552c','#253f21','#3c5f31','#2f4e29'],monkey:['#3d6b2b','#4a7a31','#2f5a22','#56863a','#35612a'],broad:['#4f7d34','#5d8c3c','#426f2c','#6a9844','#3b6528'],cook:['#2d5230','#35603a','#274a2a','#3f6b40'],scrub:['#5a7a3a','#6a8a44','#4a6a30','#77924c']}[kind];
  const n=kind==='monkey'?520:(kind==='cook'||kind==='dfir'||kind==='lob')?760:kind==='scrub'?900:kind==='dogw'?420:300;
  for(let i=0;i<n;i++){const a=r()*6.283,rr=Math.pow(r(),.6)*W*.46,cx=W/2+Math.cos(a)*rr,cy=H/2+Math.sin(a)*rr*.9;x.save();x.translate(cx,cy);x.rotate(r()*6.283);
    x.fillStyle=pal[Math.floor(r()*pal.length)];
    if(kind==='cook'||kind==='dfir'||kind==='lob'){x.fillRect(-7,-1,14,2);x.fillRect(-1,-5,2,10);}
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

/* ===== Augusta National Golf Club: course extension for Degen Golfers '26 =====
   Loaded by boot.js before main.js (course JSON "ext":"ag.js"); main.js calls these hooks through EXT(name, ...).
   The look from the Masters flyovers: emerald turf, brilliant white bunkers, tall loblolly pines over orange pine straw,
   azaleas and dogwoods in bloom, dark mirror ponds. */
(function(){
if(window.COURSE_KEY!=='ag')return;
window.COURSE_EXT_READY=fetch('ag_extra.json').then(r=>r.json()).then(x=>{Object.assign(window.COURSE,x);}).catch(e=>console.warn('[ag] extra data',e));
/* ---------- phone test aid: open the site with #fps in the address to see frames per second (1 s average and the
   slowest frame), top-left. Off unless asked for. ---------- */
if(/[#&]fps/.test(location.hash)){const el=document.createElement('div');el.style.cssText='position:fixed;left:6px;top:6px;z-index:99999;font:600 13px system-ui;color:#fff;background:rgba(0,0,0,.55);padding:3px 7px;border-radius:6px;pointer-events:none';
  document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(el));let n=0,t0=performance.now(),last=t0,worst=0;
  const tick=t=>{n++;worst=Math.max(worst,t-last);last=t;if(t-t0>=1000){el.textContent=Math.round(n*1000/(t-t0))+' fps · slowest '+Math.round(worst)+' ms';n=0;t0=t;worst=0;}requestAnimationFrame(tick);};requestAnimationFrame(tick);console.log('[ag] fps meter on');}
const X={};
const hsh=(x,y)=>{const s=Math.sin(x*12.9898+y*78.233)*43758.5453;return s-Math.floor(s);};
/* ---------- trees: every crown from the 2018 Georgia lidar. Loblolly pine (crown carried high on a bare trunk), hardwood, or flowering dogwood ---------- */
X.trees=function(A){const T=A.THREE,D=A.D,TR=A.TREES,TH=A.THASH;TR.length=0;TH.clear();const S=[[],[],[]];
  for(const q of D.tl){/* Collisions (ball and the aim camera) use the game's broadleaf model for every tree here: a crown held high (centred at 62% of
       the height) over a bare trunk. Loblolly pines are built like that. The game's 'fir' model is a cone starting 2 m off the
       ground, which made the aim camera find itself inside a pine 4 m away and climb to a straight-down view. Crown radius
       for collisions is capped at 30% of the height and 10 m. The 3D hero swap for pines is set by the hero tag. */
    const x=q[0],y=q[1],sp=q[4],t={x,y,gz:A.H(x,y),h:q[2],r:Math.min(q[3],Math.max(3,.3*q[2]),10),fir:false,v:Math.floor(hsh(x,y)*(sp===0?2.999:1.999))};if(sp===0)t.hero='lob'+t.v;else if(sp===2&&KOT.dogw)t.hero='dogw'+t.v;TR.push(t);S[sp].push(t);
    const R2=Math.ceil(t.r/10)+1,cx=Math.floor(x/10),cy=Math.floor(y/10);for(let i=-R2;i<=R2;i++)for(let j=-R2;j<=R2;j++){const k=(cx+i)+','+(cy+j);let a=TH.get(k);if(!a)TH.set(k,a=[]);a.push(t);}}
  const ld=u=>{const t=new T.TextureLoader().load(u);t.encoding=T.sRGBEncoding;t.anisotropy=4;return t;};
  A.scene.add(A.mkImp(S[0],ld('ag_lobAtlas.webp'),8,3,[1.05,1.05,1.05],.733),A.mkImp(S[1],ld(window.ASSETS.broadAtlas),4,2,[1.216,1.03],1),A.mkImp(S[2],ld('ag_dogwAtlas.webp'),4,2,[1.05,1.05],1.554));
  console.log('[ag] lidar trees',TR.length,'pines',S[0].length,'hardwoods',S[1].length,'dogwoods',S[2].length);return true;};
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
    const m=new T.Mesh(g,new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide}));m.material.userData.lin=1;m.castShadow=true;m.receiveShadow=true;A.scene.add(m);}console.log('[ag] houses',n);}
/* ---------- emerald turf: pull the painted grass toward Augusta's deep blue-green ---------- */
function emerald(A){const c=A.ctx,S=c.canvas.width,id=c.getImageData(0,0,S,S),d=id.data;let n=0;
  for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2];if(g>r+6&&g>b){d[i]=r*.92;d[i+1]=Math.min(255,g*1.06);d[i+2]=Math.min(255,b*1.02);n++;}}
  c.putImageData(id,0,0);A.tex.needsUpdate=true;console.log('[ag] emerald turf px',n);}
/* ---------- water surfaces: every pond and Rae's Creek gets a surface at its shoreline level (the lower quarter of the bank
   heights within 20 m), matching the beds carved into ag.lidar.bin, drawn with the game's own water material. ---------- */
/* ---------- water colour: the sage grey-green of the swatch, painted into the ground under every pond and the creek
   (so the water reads dark blue even where the shimmering surface is thin), with no turf detail ---------- */
function navyWater(A){const D=A.D,c=A.ctx,m=A.mx;c.save();m.save();
  for(const f of D.f){if(f.k!=='water'||f.p.length<3)continue;const path=x=>{x.beginPath();f.p.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath();};
    path(c);c.fillStyle='#545c53';c.fill();path(m);m.fillStyle='#ffff00';m.fill();}
  c.lineCap=c.lineJoin='round';for(const l of D.creek||[]){c.strokeStyle='#545c53';c.lineWidth=3.2;c.beginPath();l.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();}
  c.restore();m.restore();A.tex.needsUpdate=true;if(A.maskT)A.maskT.needsUpdate=true;console.log('[ag] navy water painted');}
/* the game's own water, set up exactly as Coeur d'Alene's open lake: the pond shader with the lake's fog distances
   (the course fog otherwise washes nearby ponds out to a pale teal) */
let _lake=null;function lakeMat(A){if(_lake)return _lake;const W=window.__WM;if(!W)return null;const m=W.clone();
  for(const k in W.uniforms){const v=W.uniforms[k].value;if(v&&v.isTexture)m.uniforms[k]={value:v};}m.uniforms.t=W.uniforms.t;m.uniforms.uLin=W.uniforms.uLin;
  m.uniforms.fogN={value:700};m.uniforms.fogF={value:6000};m.uniforms.fogC={value:W.uniforms.fogC.value.clone()};
  /* Augusta's water, from the swatch Justin sent: a muted sage grey-green, lighter toward the far side (about 109,121,105 on
     screen) and darker close in (about 84,90,83). The shader values are set from a measured response of the game's lighting
     pipeline (screen value about 253 * shader^1.88), so the screen lands on the swatch; with very soft, broad mottling (about 1% brightness, blotches a few metres
     across), a faint sheen of sky and small sun glints. The swatch itself isn't shipped; only its tone and pattern are used. */
  m.fragmentShader='uniform sampler2D sky,nm;uniform float rot,t,uLin,fogN,fogF;uniform vec3 sun,fogC;varying vec3 vW;'+
   'vec3 skyS(vec3 d){float u=fract(atan(d.z,d.x)*.1591549+.5+rot);float v=max(asin(clamp(d.y,-1.,1.))*.3183099+.5,.503);return texture2D(sky,vec2(u,v)).rgb;}\n'+
   'void main(){vec2 p=vW.xz;float dist=length(cameraPosition-vW);float fp=length(fwidth(p));float fb=1.-smoothstep(.4,1.6,fp);'+
   'vec3 a=texture2D(nm,p/22.+vec2(t*.008,t*.005)).xyz*2.-1.;vec3 b=texture2D(nm,p/7.+vec2(-t*.013,t*.01)).xyz*2.-1.;'+
   'vec2 pert=(a.xy*.5+b.xy*.3*fb)*.12;vec3 n=normalize(vec3(pert.x,1.,pert.y));vec3 v=normalize(cameraPosition-vW);vec3 r=reflect(-v,n);r.y=abs(r.y);'+
   'float g=clamp(pow(1.-max(dot(n,v),0.),1.6)*1.25,0.,1.);'+
   'vec3 c=mix(vec3(.54,.565,.535),vec3(.62,.66,.61),g);'+
   'float mo=texture2D(nm,p/38.+vec2(.31,.17)).z-.5+.6*(texture2D(nm,p/14.+vec2(.7,.4)).z-.5);c*=1.+.05*mo;'+
   'c=mix(c,skyS(r)*1.6,clamp(.04+g*.1,0.,.16));'+
   'c+=vec3(1.,.97,.9)*pow(max(dot(r,normalize(sun)),0.),320.)*.6;'+
   'c=mix(c,fogC,smoothstep(fogN,fogF,dist));if(uLin>.5)c=pow(c,vec3(2.2));gl_FragColor=vec4(c,.97);}';
  m.customProgramCacheKey=()=>'agLake';return _lake=m;}
function creekSurfaces(A){const T=A.THREE,D=A.D;let n=0;
  for(const w of A.WATER){if(w.creek||!w.p||w.p.length<4)continue;/* every water body gets its own surface, on the same level rule as the carved bed */
    /* outline samples every 2 m with their bank heights */
    const S=[];for(let i=1;i<w.p.length;i++){const a=w.p[i-1],b=w.p[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let s=0;s<L;s+=2){const x=a[0]+(b[0]-a[0])*s/L,y=a[1]+(b[1]-a[1])*s/L;S.push([x,y,A.baseH(x,y)]);}}
    const lev=(x,y)=>{const v=[];let bd=1e9,nh=0;for(const q of S){const d=Math.hypot(q[0]-x,q[1]-y);if(d<20)v.push(q[2]);if(d<bd){bd=d;nh=q[2];}}if(!v.length)return nh-.05;v.sort((a,b)=>a-b);return v[Math.floor(.25*(v.length-1))]-.05;};
    const st=2,x0w=w.x0-3,y0w=w.y0-3,nx=Math.ceil((w.x1-w.x0+6)/st)+1,ny=Math.ceil((w.y1-w.y0+6)/st)+1,P=[],I=[],idx=new Int32Array(nx*ny).fill(-1);let sum=0,cnt=0;
    for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const x=x0w+i*st,y=y0w+j*st;if(!A.inP(w,x,y)&&A.dPL(x,y,w.p)>2.5)continue;const z=lev(x,y),v=A.V(x,y,z);idx[j*nx+i]=P.length/3;P.push(v.x,v.y,v.z);sum+=z;cnt++;}
    for(let j=0;j<ny-1;j++)for(let i=0;i<nx-1;i++){const a=idx[j*nx+i],b=idx[j*nx+i+1],c=idx[(j+1)*nx+i],d=idx[(j+1)*nx+i+1];if(a<0||b<0||c<0||d<0)continue;I.push(a,b,c,b,d,c);}   /* counter-clockwise seen from above, so the surface faces up */
    if(!I.length)continue;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setIndex(I);g.computeVertexNormals();g.computeBoundingSphere();
    const m=new T.Mesh(g,lakeMat(A));m.userData.agWater=true;m.userData.level=sum/cnt;m.userData.surface=true;m.renderOrder=1;A.scene.add(m);
    /* hide the game's flat plane for this polygon */
    A.scene.traverse(o=>{if(o.isMesh&&o!==m&&o.geometry&&o.geometry.type==='ShapeGeometry'&&o.material===window.__WM){o.geometry.computeBoundingBox();const c=o.geometry.boundingBox.getCenter(new T.Vector3());if(A.inP(w,c.x,-c.z))o.visible=false;}});n++;}
  console.log('[ag] creek water surfaces',n);}
/* ---------- stone: a shared granite texture ---------- */
function stoneTex(T){const c=document.createElement('canvas');c.width=128;c.height=96;const x=c.getContext('2d');let s=7;const r=()=>{s=(s*16807)%2147483647;return s/2147483647;};
  x.fillStyle='#8a8478';x.fillRect(0,0,128,96);let y=0;while(y<96){const hh=11+r()*7;let xx=-r()*18;while(xx<128){const ww=16+r()*20,k=150+r()*45|0;x.fillStyle='rgb('+k+','+(k*.96|0)+','+(k*.9|0)+')';x.fillRect(xx+1,y+1,ww-2,hh-2);x.fillStyle='rgba(0,0,0,.14)';x.fillRect(xx+1,y+hh-3,ww-2,2);xx+=ww;}y+=hh;}
  const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.wrapS=t.wrapT=T.RepeatWrapping;return t;}
/* ---------- the stone bridges: Hogan (12), Nelson (13), Sarazen (15) and the footbridges, as low granite arches ---------- */
function bridges(A){const T=A.THREE,D=A.D,mat=new T.MeshStandardMaterial({map:stoneTex(T),roughness:.9});let n=0;
  for(const b of D.bridges||[]){const [cx,cy]=b.c,ux=b.u[0],uy=b.u[1],L=b.L+2,w=b.w,ang=Math.atan2(uy,ux);
    const e0=[cx-ux*L/2,cy-uy*L/2],e1=[cx+ux*L/2,cy+uy*L/2],z0=A.H(e0[0],e0[1]),z1=A.H(e1[0],e1[1]),deck=Math.max(z0,z1)+.25,g=new T.Group();
    const box=(lx,ly,lz,px,py,pz)=>{const m=new T.Mesh(new T.BoxGeometry(lx,ly,lz),mat);m.position.set(px,py,pz);m.castShadow=m.receiveShadow=true;g.add(m);};
    box(L,.35,w,0,0,0);for(const sd of[-1,1])box(L,.55,.3,0,.42,sd*(w/2-.15));                         /* deck and parapets */
    const Dd=Math.max(1.6,deck-A.H(cx,cy)+.6),rr=Math.min(L*.36,Dd*.8);const ar=new T.Shape();ar.moveTo(-L/2,0);ar.lineTo(L/2,0);ar.lineTo(L/2,-Dd);ar.lineTo(rr,-Dd);ar.absarc(0,-Dd,rr,0,Math.PI,false);ar.lineTo(-L/2,-Dd);ar.lineTo(-L/2,0);
    const eg=new T.ExtrudeGeometry(ar,{depth:w,bevelEnabled:false});eg.translate(0,0,-w/2);const am=new T.Mesh(eg,mat);am.castShadow=am.receiveShadow=true;g.add(am); /* arched spandrel under the deck */
    g.position.copy(A.V(cx,cy,deck));g.rotation.y=-ang;g.traverse(o=>{if(o.isMesh)o.userData.occluder=true;});A.scene.add(g);n++;}
  console.log('[ag] bridges',n);}
/* ---------- Rae's Creek's stone wall in front of 12 ---------- */
function creekWall(A){const T=A.THREE,D=A.D,h12=A.HOLES.find(h=>h.ref==='12');if(!h12)return;const G=h12.p[h12.p.length-1],P=[],U=[];
  for(const l of D.creek||[])for(let i=1;i<l.length;i++){const a=l[i-1],b=l[i];if(Math.hypot((a[0]+b[0])/2-G[0],(a[1]+b[1])/2-G[1])>48)continue;
    const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1;let nx=-dy/len,ny=dx/len;if(nx*(G[0]-a[0])+ny*(G[1]-a[1])<0){nx=-nx;ny=-ny;}  /* green side */
    const p0=[a[0]+nx*1.7,a[1]+ny*1.7],p1=[b[0]+nx*1.7,b[1]+ny*1.7],zb=A.H(a[0],a[1])-.8,t0=A.H(p0[0]+nx*.8,p0[1]+ny*.8)+.15,t1=A.H(p1[0]+nx*.8,p1[1]+ny*.8)+.15,V=A.V;
    const q=[V(p0[0],p0[1],zb),V(p1[0],p1[1],zb),V(p1[0],p1[1],t1),V(p0[0],p0[1],t0)];for(const [v,u,w] of[[q[0],0,0],[q[1],len/1.2,0],[q[2],len/1.2,1],[q[0],0,0],[q[2],len/1.2,1],[q[3],0,1]]){P.push(v.x,v.y,v.z);U.push(u,w);}}
  if(!P.length)return;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('uv',new T.Float32BufferAttribute(U,2));g.computeVertexNormals();
  const m=new T.Mesh(g,new T.MeshStandardMaterial({map:stoneTex(T),roughness:.9,side:T.DoubleSide}));m.receiveShadow=true;A.scene.add(m);console.log('[ag] 12 creek wall segments',P.length/18);}
/* ---------- leaderboards: the green Masters boards near 18, 11, 16 and 2 ---------- */
function boardsOld(A){const T=A.THREE,c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d');x.fillStyle='#0d4a2a';x.fillRect(0,0,256,128);x.fillStyle='#f4f1e8';x.fillRect(10,22,236,98);
  x.fillStyle='#0d4a2a';x.font='bold 14px sans-serif';x.fillText('LEADERS',100,16);x.fillStyle='#c9c4b5';for(let r=0;r<10;r++){x.fillRect(14,26+r*9.4,80,7);for(let k=0;k<12;k++)x.fillRect(100+k*12,26+r*9.4,10,7);}
  const tex=new T.CanvasTexture(c);tex.encoding=T.sRGBEncoding;const face=new T.MeshLambertMaterial({map:tex}),green=new T.MeshLambertMaterial({color:0x0d4a2a});let n=0;
  for(const ref of['18','11','16','2']){const h=A.HOLES.find(q=>q.ref===ref);if(!h)continue;const P=h.p,g=P[P.length-1],a=P[P.length-2],dx=g[0]-a[0],dy=g[1]-a[1],l=Math.hypot(dx,dy),ux=dx/l,uy=dy/l;
    let bx=g[0]+ux*30-uy*32,by=g[1]+uy*30+ux*32;if(A.lieAt(bx,by)!=='rough'&&A.lieAt(bx,by)!=='oob'){bx=g[0]+ux*30+uy*32;by=g[1]+uy*30-ux*32;}
    const grp=new T.Group(),W=9,Hh=4,z=A.H(bx,by),b=new T.Mesh(new T.BoxGeometry(W,Hh,.5),green);b.position.y=Hh/2+1.2;grp.add(b);const f=new T.Mesh(new T.PlaneGeometry(W-.4,Hh-.4),face);f.position.set(0,Hh/2+1.2,.26);grp.add(f);
    for(const sx of[-W/2+.4,W/2-.4]){const p=new T.Mesh(new T.BoxGeometry(.25,1.4,.25),green);p.position.set(sx,.7,0);grp.add(p);}
    grp.position.copy(A.V(bx,by,z));grp.lookAt(A.V(g[0],g[1],z));grp.traverse(o=>{if(o.isMesh){o.castShadow=true;o.userData.occluder=true;}});A.scene.add(grp);n++;}
  console.log('[ag] leaderboards',n);}
/* the leaderboards: the classic white Augusta board, built here so the lettering is sharp (the old ag_board.glb model was a scanned
   mesh with smeared lettering). LEADERS over a HOLE / PAR grid, the round's golfers listed by score with each hole's running total
   (red under par, green level or over, as at Augusta), a THRU panel on the left, green trim, base band and posts. One shared
   texture for all four boards, redrawn only when a score changes. */
function boards(A){const T=A.THREE,spots=[];
  for(const ref of['18','11','16','2']){const h=A.HOLES.find(q=>q.ref===ref);if(!h)continue;const P=h.p,g=P[P.length-1],a=P[P.length-2],dx=g[0]-a[0],dy=g[1]-a[1],l=Math.hypot(dx,dy),ux=dx/l,uy=dy/l;
    let bx=g[0]+ux*30-uy*32,by=g[1]+uy*30+ux*32;if(A.lieAt(bx,by)!=='rough'&&A.lieAt(bx,by)!=='oob'){bx=g[0]+ux*30+uy*32;by=g[1]+uy*30-ux*32;}spots.push([bx,by,g]);}
  const GRN='#0b5c37',RED='#c8102e',INK='#1d211f',F='"Barlow Condensed","Arial Narrow",Arial,sans-serif';
  const HL=A.HOLES.filter(h=>/^\d+$/.test(h.ref)).slice().sort((p,q)=>+p.ref - +q.ref).slice(0,18);
  /* panel sizes (m): main 8.6 x 4.8 with a 0.4 m arch over LEADERS; THRU panel 1.8 x 2.3 to its left; both sit on a 0.55 m green band */
  const WP=8.6,HP=4.8,AR=.4,AW=3.6,Y0=2.6,WT=1.8,HT=2.3,XT=-WP/2-.25-WT/2;
  const mkC=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
  const cM=mkC(2048,1024),cT=mkC(512,512),LW=2048,LH=Math.round(2048*(HP+AR)/WP);      /* main canvas drawn in a 2048 x LH space, squeezed to 1024 */
  const tM=new T.CanvasTexture(cM),tT=new T.CanvasTexture(cT);for(const t of[tM,tT]){t.encoding=T.sRGBEncoding;t.anisotropy=8;}
  const last=n=>{const w=String(n||'').trim().split(/\s+/);return (w[w.length-1]||'').toUpperCase();};
  const rows=()=>{const P=(A.players||[]).filter(p=>p&&p.name);return P.map(p=>{const cd=p.card||{},cum=[];let s=0,pr=0,n=0;
      HL.forEach((h,i)=>{const k=A.HOLES.indexOf(h);if(cd[k]!=null){s+=cd[k];pr+=+h.par||4;n++;cum[i]=s-pr;}});return{name:last(p.name),tp:n?s-pr:null,n,cum};})
    .sort((a,b)=>(a.tp==null)-(b.tp==null)||(a.tp-b.tp)||(b.n-a.n));};
  const fit=(x,txt,mw,size,wt)=>{let s=size;x.font=wt+' '+s+'px '+F;while(s>10&&x.measureText(txt).width>mw){s-=2;x.font=wt+' '+s+'px '+F;}};
  const sc=v=>v==null?'':v===0?'E':String(Math.abs(v));
  function draw(R){const x=cM.getContext('2d');x.setTransform(1,0,0,1024/LH,0,0);
    x.fillStyle='#f6f5f0';x.fillRect(0,0,LW,LH);
    const ax0=LW/2-AW/2/WP*LW,ax1=LW/2+AW/2/WP*LW,ah=AR/(HP+AR)*LH;            /* the white above the flat top only exists under the arch */
    x.fillStyle=GRN;x.textAlign='center';x.textBaseline='middle';x.font='700 150px '+F;x.save();x.translate(LW/2,ah*.55+70);x.scale(1.18,1);x.fillText('L E A D E R S',0,0);x.restore();
    const gx0=34,gx1=LW-34,gy0=ah+160,gy1=LH-30,nR=12,rh=(gy1-gy0)/nR,cP=78,cN=440,cw=(gx1-gx0-cP-cN)/18;
    for(let r=0;r<nR;r++)for(let c=-2;c<18;c++){const X=c===-2?gx0:c===-1?gx0+cP:gx0+cP+cN+c*cw,W=c===-2?cP:c===-1?cN:cw,Y=gy0+r*rh;
      x.fillStyle=r<2?'#eef0e9':'#fbfaf6';x.fillRect(X+3,Y+3,W-6,rh-6);x.strokeStyle='#c4c9c0';x.lineWidth=3;x.strokeRect(X+3,Y+3,W-6,rh-6);}
    x.fillStyle=GRN;x.fillRect(gx0,gy0+2*rh-4,gx1-gx0,8);x.fillRect(gx0+cP+cN-4,gy0,8,gy1-gy0);
    const fs=Math.round(rh*.64);x.textBaseline='middle';
    x.textAlign='left';x.fillStyle=GRN;x.font='700 '+fs+'px '+F;x.fillText('HOLE',gx0+cP+22,gy0+rh*.53);x.fillText('PAR',gx0+cP+22,gy0+rh*1.53);
    x.textAlign='center';HL.forEach((h,i)=>{const cx=gx0+cP+cN+(i+.5)*cw;x.fillText(h.ref,cx,gy0+rh*.53);x.fillText(String(h.par||4),cx,gy0+rh*1.53);});
    R.slice(0,10).forEach((p,j)=>{const Y=gy0+(j+2.53)*rh;x.textAlign='center';x.fillStyle=GRN;x.font='700 '+fs+'px '+F;if(p.tp!=null)x.fillText(String(j+1),gx0+cP/2,Y);
      x.textAlign='left';x.fillStyle=INK;fit(x,p.name,cN-44,fs,'700');x.fillText(p.name,gx0+cP+22,Y);
      x.textAlign='center';x.font='700 '+fs+'px '+F;p.cum.forEach((v,i)=>{if(v==null)return;x.fillStyle=v<0?RED:GRN;x.fillText(sc(v),gx0+cP+cN+(i+.5)*cw,Y);});});
    x.strokeStyle=GRN;x.lineWidth=14;x.lineJoin='round';x.beginPath();x.moveTo(7,ah+7);x.lineTo(ax0,ah+7);x.quadraticCurveTo(LW/2,7-ah,ax1,ah+7);x.lineTo(LW-7,ah+7);x.lineTo(LW-7,LH-7);x.lineTo(7,LH-7);x.closePath();x.stroke();
    tM.needsUpdate=true;
    const y=cT.getContext('2d');y.setTransform(1,0,0,1,0,0);y.fillStyle='#f6f5f0';y.fillRect(0,0,512,512);y.strokeStyle=GRN;y.lineWidth=12;y.strokeRect(6,6,500,500);
    const th=R.reduce((m,p)=>Math.max(m,p.n),0);y.fillStyle=GRN;y.textAlign='center';y.textBaseline='middle';y.font='700 112px '+F;y.fillText('THRU',178,96);
    y.fillStyle='#fbfaf6';y.fillRect(334,40,140,112);y.strokeStyle='#c4c9c0';y.lineWidth=3;y.strokeRect(334,40,140,112);y.fillStyle=INK;y.fillText(th?String(th):'',404,98);
    y.fillStyle=GRN;y.fillRect(24,176,464,6);
    R.slice(0,3).forEach((p,j)=>{const Y=240+j*96;y.fillStyle='#fbfaf6';y.fillRect(28,Y-40,330,82);y.fillRect(368,Y-40,116,82);y.strokeStyle='#c4c9c0';y.strokeRect(28,Y-40,330,82);y.strokeRect(368,Y-40,116,82);
      y.textAlign='left';y.fillStyle=INK;fit(y,p.name,300,64,'700');y.fillText(p.name,44,Y+3);y.textAlign='center';y.font='700 64px '+F;y.fillStyle=p.tp!=null&&p.tp<0?RED:GRN;y.fillText(sc(p.tp),426,Y+3);});
    tT.needsUpdate=true;}
  let sig='';const upd=()=>{try{const R=rows(),s=JSON.stringify(R);if(s!==sig){sig=s;draw(R);}}catch(e){console.warn('[ag] board draw',e);}};
  /* geometry: an extruded white body with green edges, the lettered face just in front, the THRU panel, base bands and posts */
  const green=new T.MeshLambertMaterial({color:0x0b5c37}),faceM=new T.MeshLambertMaterial({map:tM,emissive:0x6e6e6e,emissiveMap:tM}),faceT=new T.MeshLambertMaterial({map:tT,emissive:0x6e6e6e,emissiveMap:tT});/* a little self-light so the white face reads white even with the sun behind it */
  const shp=new T.Shape(),h0=HP;shp.moveTo(-WP/2,0);shp.lineTo(WP/2,0);shp.lineTo(WP/2,h0);shp.lineTo(AW/2,h0);shp.quadraticCurveTo(0,h0+AR*2,-AW/2,h0);shp.lineTo(-WP/2,h0);shp.lineTo(-WP/2,0);
  const body=new T.ExtrudeGeometry(shp,{depth:.3,bevelEnabled:false,curveSegments:16});body.translate(0,0,-.15);
  const face=new T.ShapeGeometry(shp,16),uv=face.attributes.uv,ps=face.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,(ps.getX(i)+WP/2)/WP,ps.getY(i)/(HP+AR));
  const bodyT=new T.BoxGeometry(WT,HT,.26),faceTg=new T.PlaneGeometry(WT-.12,HT-.12);
  const box=(w,h,d,m,px,py,pz)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(px,py,pz);return o;};
  const one=()=>{const g=new T.Group(),b=new T.Mesh(body,green);b.position.y=Y0;g.add(b);const f=new T.Mesh(face,faceM);f.position.set(0,Y0,.2);g.add(f);
    g.add(box(WP+.1,.55,.36,green,0,Y0-.275,0));g.add(box(.9,Y0-.55+.3,.5,green,0,(Y0-.55)/2-.15,0));for(const sx of[-WP/2+.6,WP/2-.6])g.add(box(.3,Y0-.55+.3,.3,green,sx,(Y0-.55)/2-.15,0));
    const tb=new T.Mesh(bodyT,green);tb.position.set(XT,Y0+HT/2,0);g.add(tb);const tf=new T.Mesh(faceTg,faceT);tf.position.set(XT,Y0+HT/2,.18);g.add(tf);
    g.add(box(WT+.1,.55,.32,green,XT,Y0-.275,0));g.add(box(.3,Y0-.55+.3,.3,green,XT,(Y0-.55)/2-.15,0));g.add(box(.5,.12,.2,green,(XT+WT/2-WP/2)/2,Y0+.6,0));
    return g;};
  let n=0;for(const [bx,by,g] of spots){const grp=one(),Wd=12.5,dl=Math.hypot(g[0]-bx,g[1]-by),qx=(g[1]-by)/dl,qy=-(g[0]-bx)/dl;let z=1e9;for(const s of[-.5,-.2,.1,.4])z=Math.min(z,A.H(bx+s*Wd*qx,by+s*Wd*qy));
    grp.position.copy(A.V(bx,by,z-.15));grp.lookAt(A.V(g[0],g[1],z-.15));if(window.AG_BOARD_FLIP)grp.rotateY(Math.PI);
    grp.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.userData.occluder=true;}});try{A.linearize(grp);}catch(e){}A.scene.add(grp);n++;}
  upd();setInterval(upd,2000);try{if(document.fonts&&document.fonts.load)document.fonts.load('700 60px "Barlow Condensed"').then(()=>{sig='';upd();});}catch(e){}
  console.log('[ag] leaderboards (built)',n);}
/* ---------- pine straw: the orange-brown floor under every stand of pines (ag_straw.png, from the lidar canopy and the aerial) ---------- */
function straw(A,done){const D=A.D,Fz=D.straw;if(!Fz)return;const img=new Image();img.onload=()=>{try{
  const w=img.width,h=img.height,cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d');x.drawImage(img,0,0);const id=x.getImageData(0,0,w,h),d=id.data,mk=new Uint8ClampedArray(d);
  for(let i=0;i<d.length;i+=4){const a=d[i]/255,p=i/4,px=p%w,py=(p/w)|0,n=hsh(px*.37,py*.53),k=.8+.35*n;d[i]=Math.min(255,112*k);d[i+1]=Math.min(255,66*k);d[i+2]=Math.min(255,38*k);d[i+3]=Math.round(a*240);}
  x.putImageData(id,0,0);const c=A.ctx,B=A.box,S=c.canvas.width;c.save();c.setTransform(1,0,0,1,0,0);c.drawImage(cv,(Fz.x0-B.X0)/B.WW*S,(B.Y1-Fz.y1)/B.HH*S,(Fz.x1-Fz.x0)/B.WW*S,(Fz.y1-Fz.y0)/B.HH*S);c.restore();
  /* the ground shader lays a needle-litter texture over the straw (main.js setGroundStraw) */
  try{if(window.setGroundStraw)window.setGroundStraw(img,Fz.x0,Fz.y0,Fz.x1,Fz.y1);}catch(e){console.warn('[ag] straw detail',e);}
  /* no grass blades or tufts poking up through the pine straw */
  window.NOGRASS=(px,py)=>{const i=Math.floor((px-Fz.x0)/(Fz.x1-Fz.x0)*w),j=Math.floor((Fz.y1-py)/(Fz.y1-Fz.y0)*h);return i>=0&&j>=0&&i<w&&j<h&&mk[(j*w+i)*4]>70;};
  /* straw takes no turf detail: mark it as path in the surface mask */
  const m=A.mx;m.save();m.setTransform(1,0,0,1,0,0);const cv2=document.createElement('canvas');cv2.width=w;cv2.height=h;const x2=cv2.getContext('2d'),id2=x2.createImageData(w,h);
  for(let i=0;i<mk.length;i+=4){id2.data[i]=255;id2.data[i+1]=255;id2.data[i+2]=0;id2.data[i+3]=mk[i]>110?255:0;}x2.putImageData(id2,0,0);
  m.drawImage(cv2,(Fz.x0-B.X0)/B.WW*S,(B.Y1-Fz.y1)/B.HH*S,(Fz.x1-Fz.x0)/B.WW*S,(Fz.y1-Fz.y0)/B.HH*S);m.restore();A.tex.needsUpdate=true;if(A.maskT)A.maskT.needsUpdate=true;
  console.log('[ag] pine straw painted');if(done)done({w,h,d:mk});}catch(e){console.warn('[ag] straw',e);}};img.src=Fz.img;}
/* ---------- azaleas and other plantings ---------- */
function plantTex(T,kind){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');let s=kind*977+13;const r=()=>{s=(s*16807)%2147483647;return s/2147483647;};
  const BL=[['#e5508f','#f06ea6','#d43f7f','#f590bb'],['#c2207a','#d63a8c','#a8146a','#e05aa0'],['#d42a3a','#e8454f','#b81e2c','#f06a6f'],['#fbf7f4','#ffffff','#efe8e6','#f7eef2']][kind];
  x.fillStyle='rgba(0,0,0,0)';x.fillRect(0,0,128,128);
  for(let i=0;i<150;i++){const a=r()*6.283,rr=Math.pow(r(),.6)*56,cx=64+Math.cos(a)*rr,cy=72+Math.sin(a)*rr*.7;x.fillStyle=['#2f4a22','#3a5a2a','#26401c'][Math.floor(r()*3)];x.beginPath();x.arc(cx,cy,5+r()*4,0,7);x.fill();}
  for(let i=0;i<260;i++){const a=r()*6.283,rr=Math.pow(r(),.55)*54,cx=64+Math.cos(a)*rr,cy=66+Math.sin(a)*rr*.6;x.fillStyle=BL[Math.floor(r()*BL.length)];x.beginPath();x.arc(cx,cy,2.2+r()*2.4,0,7);x.fill();}
  const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t;}
function lineClear(A,x,y){const l=A.lieAt(x,y);return !(l==='tee'||l==='green'||l==='bunker'||l==='fairway'||l==='water');}
function plants(A,list){list=list.filter(p=>lineClear(A,p[0],p[1]));if(!list.length)return;const T=A.THREE,mode=window.AG_BUSH||'combo';
  if(mode==='dome')return plantsDome(A,list);
  if(mode==='combo')plantsDome(A,list,.82);/* a solid blossom core under the cards: body from a distance, fluffy flowers up close */
  /* azaleas as blossom cards: 'cross8' = eight cards evenly spaced round the centre (16 triangles), 'cross3' = the original three */
  const n=mode==='cross3'?3:8,g0=new T.PlaneGeometry(1,1);g0.translate(0,.5,0);const P=[],U=[],I=[];let o=0;
  for(let k=0;k<n;k++){const g=g0.clone();const sc=(n===8&&k%2)?.86:1;g.scale(sc,sc*(n===8&&k%2?.94:1),1);g.rotateY(k*Math.PI/n);P.push(...g.attributes.position.array);U.push(...g.attributes.uv.array);I.push(...Array.from(g.index.array).map(v=>v+o));o+=g.attributes.position.count;}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(P,3));geo.setAttribute('uv',new T.Float32BufferAttribute(U,2));geo.setIndex(I);geo.computeVertexNormals();
  for(let k=0;k<4;k++){const L=list.filter(p=>p[3]===k);if(!L.length)continue;const M=A.IMC(new T.InstancedMesh(geo,new T.MeshLambertMaterial({map:plantTex(T,k),alphaTest:.45,side:T.DoubleSide}),L.length)),m=new T.Matrix4(),q=new T.Quaternion();
    L.forEach((p,i)=>{q.setFromAxisAngle(new T.Vector3(0,1,0),hsh(p[0],p[1])*6.28);m.compose(A.V(p[0],p[1],A.H(p[0],p[1])-.08),q,new T.Vector3(p[2]*1.25,p[2],p[2]*1.25));M.setMatrixAt(i,m);});
    M.castShadow=true;M.receiveShadow=true;M.frustumCulled=false;A.scene.add(M);}
  console.log('[ag] azaleas ('+mode+')',list.length);}
function plantsDome(A,list,ks){const T=A.THREE,core=!!ks;ks=ks||1;
  /* each azalea is a real bush now: a lumpy, flat-bottomed dome of blossom over dark leaves (about 60 triangles, one draw call per colour) */
  const ico=new T.IcosahedronGeometry(1,core?0:1),/* as a core under the cards it only needs to fill the gaps: the coarse version (about 15 triangles) */pos=ico.attributes.position,P=[],U=[],C=[];
  const lump=(x,y,z)=>1+.13*Math.sin(x*5.1+y*2.3)+.1*Math.sin(z*4.7-x*3.1)+.08*Math.cos(y*6.3+z*2.2);
  for(let f=0;f<pos.count;f+=3){const tri=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(pos,f+k));if(tri.every(v=>v.y<-.35))continue;
    for(const v of tri){const yy=Math.max(-.2,v.y),r=lump(v.x,v.y,v.z),px=v.x*r,pz=v.z*r,py=(yy+.2)*.78*r;P.push(px,py,pz);
      U.push(Math.atan2(v.z,v.x)/6.283*2.4+.5,py*1.6);const sh=.5+.55*Math.min(1,py/.85);C.push(sh,sh,sh);}}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(P,3));geo.setAttribute('uv',new T.Float32BufferAttribute(U,2));geo.setAttribute('color',new T.Float32BufferAttribute(C,3));geo.computeVertexNormals();
  for(let k=0;k<4;k++){const L=list.filter(p=>p[3]===k);if(!L.length)continue;const tx=bushTex(T,k);
    const M=A.IMC(new T.InstancedMesh(geo,new T.MeshLambertMaterial({map:tx,vertexColors:true}),L.length)),m=new T.Matrix4(),q=new T.Quaternion();
    L.forEach((p,i)=>{q.setFromAxisAngle(new T.Vector3(0,1,0),hsh(p[0],p[1])*6.28);const s=p[2]*.62*ks,e=.85+hsh(p[1],p[0])*.3;m.compose(A.V(p[0],p[1],A.H(p[0],p[1])-.05),q,new T.Vector3(s*e,s*(.85+hsh(p[0]*2,p[1])*.35),s/e));M.setMatrixAt(i,m);});
    M.castShadow=true;M.receiveShadow=true;M.frustumCulled=false;A.scene.add(M);}
  console.log('[ag] azalea bushes',list.length,'triangles each',P.length/9);}
/* blossom skin for the bushes: dense flowers in the bush's colour over dark green leaves, tiling */
function bushTex(T,kind){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');let s=kind*977+29;const r=()=>{s=(s*16807)%2147483647;return s/2147483647;};
  const BL=[['#e5508f','#f06ea6','#d43f7f','#f590bb'],['#c2207a','#d63a8c','#a8146a','#e05aa0'],['#d42a3a','#e8454f','#b81e2c','#f06a6f'],['#fbf7f4','#ffffff','#efe8e6','#f7eef2']][kind];
  x.fillStyle='#2b4420';x.fillRect(0,0,256,256);
  for(let i=0;i<700;i++){x.fillStyle=['#2f4a22','#3a5a2a','#24391a','#41622e'][Math.floor(r()*4)];const cx=r()*256,cy=r()*256;x.beginPath();x.ellipse(cx,cy,3+r()*4,1.6+r()*2,r()*3.14,0,7);x.fill();}
  for(let i=0;i<1400;i++){const cx=r()*256,cy=r()*256,rr=2.2+r()*3.2;x.fillStyle=BL[Math.floor(r()*BL.length)];x.beginPath();x.arc(cx,cy,rr,0,7);x.fill();if(r()<.35){x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.arc(cx-rr*.3,cy-rr*.3,rr*.35,0,7);x.fill();}}
  const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.encoding=T.sRGBEncoding;t.anisotropy=4;return t;}
function azaleas(A,mask){const D=A.D,Fz=D.straw,L=[];if(!mask||!Fz)return;const {w,h,d}=mask,G=A.GREENS;
  /* along the pine-straw edge near greens and tees: clumps of pink, magenta, red and white */
  const nearPlay=(x,y)=>A.HOLES.some(hl=>{const t=hl.p[0],g=hl.p[hl.p.length-1];return Math.hypot(x-g[0],y-g[1])<75||Math.hypot(x-t[0],y-t[1])<45;});
  for(let y=Fz.y0+2;y<Fz.y1;y+=2.1)for(let x=Fz.x0+2;x<Fz.x1;x+=2.1){const jx=x+(hsh(x,y)-.5)*1.6,jy=y+(hsh(y,x)-.5)*2,i=Math.floor((jx-Fz.x0)/(Fz.x1-Fz.x0)*w),j=Math.floor((Fz.y1-jy)/(Fz.y1-Fz.y0)*h);
    if(i<1||j<1||i>=w-1||j>=h-1)continue;const v=d[(j*w+i)*4];if(v<120)continue;
    const edge=d[(j*w+i+1)*4]<120||d[(j*w+i-1)*4]<120||d[((j+1)*w+i)*4]<120||d[((j-1)*w+i)*4]<120||d[(j*w+Math.min(w-1,i+2))*4]<120||d[(j*w+Math.max(0,i-2))*4]<120;
    const sig=['10','12','13','16'].some(r=>{const hl=A.HOLES.find(q=>q.ref===r);if(!hl)return false;const g=hl.p[hl.p.length-1];return Math.hypot(jx-g[0],jy-g[1])<70;});
    if((!edge&&!sig)||!nearPlay(jx,jy))continue;if(A.HOLES.some(hl=>{const t0=hl.p[0],t1=hl.p[1],L0=Math.hypot(t1[0]-t0[0],t1[1]-t0[1])||1,ux=(t1[0]-t0[0])/L0,uy=(t1[1]-t0[1])/L0,rx=jx-t0[0],ry=jy-t0[1],al=rx*ux+ry*uy;return al>-3&&al<45&&Math.abs(-rx*uy+ry*ux)<7;}))continue;/* never in front of a tee: keep the first 45 m of every line of play clear */const cl=Math.sin(jx*.09)*Math.cos(jy*.08)+.5*Math.sin((jx-jy)*.05);if(cl<(sig?-.6:.15))continue;
    const kind=Math.floor(hsh(Math.floor(jx/9),Math.floor(jy/9))*4);L.push([jx,jy,2.0+hsh(jx*3,jy)*1.3,kind]);if(L.length>9000)break;}
  plants(A,L);console.log('[ag] azaleas',L.length);}
/* ---------- hero pines: near the golfer, the game swaps sprites for real 3D models. Augusta's are loblollies built by the
   same code that drew the sprite atlas (KOT.lob), so the swap is seamless. ---------- */
X.heroInit=function(HERO,A){const T=A.THREE;if(!window.KOT||!KOT.lob)return;for(let v=0;v<3;v++){const g=KOT.lob(T,v);g.updateMatrixWorld(true);const ms=[];g.traverse(o=>{if(o.isMesh)ms.push(o);});
    const mk=(me,N)=>{const geo=me.geometry.clone();geo.applyMatrix4(me.matrixWorld);const mt=me.material;mt.userData.lin=1;const M=A.IMC(new T.InstancedMesh(geo,mt,N));M.count=0;M.castShadow=true;M.receiveShadow=true;M.frustumCulled=false;A.scene.add(M);return M;};
    HERO['lob'+v]={B:mk(ms[0],8),L:mk(ms[1],8),h:1,N:8,k:1,noYaw:false};}
  if(KOT.dogw)for(let v=0;v<2;v++){try{const g=KOT.dogw(T,v);g.updateMatrixWorld(true);const ms=[];g.traverse(o=>{if(o.isMesh)ms.push(o);});if(ms.length<2)continue;
    const mk=(me,N)=>{const geo=me.geometry.clone();geo.applyMatrix4(me.matrixWorld);const mt=me.material;mt.userData.lin=1;const M=A.IMC(new T.InstancedMesh(geo,mt,N));M.count=0;M.castShadow=true;M.receiveShadow=true;M.frustumCulled=false;A.scene.add(M);return M;};
    const X=ms.slice(1,-1).map(me=>mk(me,6));HERO['dogw'+v]={B:mk(ms[0],6),L:mk(ms[ms.length-1],6),X:X.length?X:null,h:1,N:6,k:1,noYaw:false};}catch(e){console.warn('[ag] hero dogwood',e);}}
  console.log('[ag] hero loblollies ready');};
X.decor=function(A){for(const [n,f] of[['houses',houses],['emerald',emerald],['navy',navyWater],['surfaces',creekSurfaces],['bridges',bridges],['wall',creekWall],['boards',boards]]){try{f(A);}catch(e){console.warn('[ag] '+n,e);}}
  try{straw(A,mask=>{try{azaleas(A,mask);}catch(e){console.warn('[ag] azaleas',e);}});}catch(e){console.warn('[ag] straw',e);}
};
X.farWater=function(w,A){w.visible=false;};
window.COURSE_EXT=X;
})();
