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
  const pal={monkey:['#3d6b2b','#4a7a31','#2f5a22','#56863a','#35612a'],broad:['#4f7d34','#5d8c3c','#426f2c','#6a9844','#3b6528'],cook:['#2d5230','#35603a','#274a2a','#3f6b40'],scrub:['#5a7a3a','#6a8a44','#4a6a30','#77924c']}[kind];
  const n=kind==='monkey'?520:kind==='cook'?700:kind==='scrub'?900:300;
  for(let i=0;i<n;i++){const a=r()*6.283,rr=Math.pow(r(),.6)*W*.46,cx=W/2+Math.cos(a)*rr,cy=H/2+Math.sin(a)*rr*.9;x.save();x.translate(cx,cy);x.rotate(r()*6.283);
    x.fillStyle=pal[Math.floor(r()*pal.length)];
    if(kind==='cook'){x.fillRect(-7,-1,14,2);x.fillRect(-1,-5,2,10);}
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
function norm(T,g){const b=new T.Box3().setFromObject(g);const s=1/b.max.y;g.scale.setScalar(s);g.updateMatrixWorld(true);return g;}
root.KOT=KOT;})(typeof window!=='undefined'?window:globalThis);

/* ===== Ko Olina Golf Club (Oahu) - course extension for Degen Golfers '26 =====
   Loaded by boot.js before main.js (course JSON "ext":"ko.js"); main.js calls these hooks through EXT(name, ...).
   Everything here is Ko Olina-only: it does nothing for the other courses. */
(function(){
if(window.COURSE_KEY!=='ko')return;
window.COURSE_EXT_READY=fetch('ko_extra.json').then(r=>r.json()).then(x=>{Object.assign(window.COURSE,x);}).catch(e=>console.warn('[ko] extra data',e));
const KOT=window.KOT;
const META={"palm": {"frames": 8, "rows": 3, "aspect": 1.167, "ratio": 1.05}, "monkey": {"frames": 4, "rows": 2, "aspect": 2.094, "ratio": 1.05}, "cook": {"frames": 8, "rows": 2, "aspect": 0.207, "ratio": 1.05}, "plum": {"frames": 4, "rows": 2, "aspect": 1.332, "ratio": 1.05}, "broad": {"frames": 4, "rows": 2, "aspect": 1.523, "ratio": 1.05}, "scrub": {"frames": 4, "rows": 2, "aspect": 1.605, "ratio": 1.05}};
const X={};
const SP=['palm','monkey','cook','broad','plum','scrub'];
const hsh=(x,y)=>{const s=Math.sin(x*12.9898+y*78.233)*43758.5453;return s-Math.floor(s);};
const cv=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);return c;};
function ctex(T,c,rep){const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=4;if(rep){t.wrapS=t.wrapT=T.RepeatWrapping;}return t;}
function pip(x,y,P){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
function stroke(c,p){c.beginPath();c.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)c.lineTo(p[i][0],p[i][1]);c.stroke();}
function fillP(c,p){c.beginPath();c.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)c.lineTo(p[i][0],p[i][1]);c.closePath();c.fill();}
function holeByRef(A,r){return A.HOLES.find(h=>h.ref===r);}
function greenOfHole(A,h){const e=h.p[h.p.length-1];let best=null,bd=1e9;for(const g of A.GREENS){const d=Math.hypot(g.cx-e[0],g.cy-e[1]);if(d<bd){bd=d;best=g;}}return best;}
function pondLevel(A,w){let lv=1e9;for(const q of w.p)lv=Math.min(lv,A.baseH(q[0],q[1]));return lv-.12;}
function nearestPond(A,x,y,maxD){let best=null,bd=maxD||1e9;for(const w of A.WATER){if(w.creek)continue;for(const q of w.p){const d=Math.hypot(q[0]-x,q[1]-y);if(d<bd){bd=d;best=w;}}}return best;}
function edgePointNear(w,x,y){let best=null,bd=1e9;const P=w.p;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],dx=b[0]-a[0],dy=b[1]-a[1],L2=dx*dx+dy*dy||1;let u=((x-a[0])*dx+(y-a[1])*dy)/L2;u=Math.max(0,Math.min(1,u));const px=a[0]+dx*u,py=a[1]+dy*u,d=Math.hypot(px-x,py-y);if(d<bd){bd=d;best={x:px,y:py,tx:dx/Math.sqrt(L2),ty:dy/Math.sqrt(L2)};}}return best;}

/* ---------- trees: the real trees, one by one, from NOAA's 2020 airborne lidar (crown position, height and spread), species from the
   crown's shape and setting (coconut palm, monkeypod, Cook pine, tropical broadleaf, plumeria, kiawe scrub), each drawn from its own
   baked 8- or 4-angle impostor atlas ---------- */
X.trees=function(A){const T=A.THREE,D=A.D,TR=A.TREES,TH=A.THASH;TR.length=0;TH.clear();const L={};SP.forEach(s=>L[s]=[]);
  /* the flyovers show the roads beside 12-16 screened by a row of trees; the lidar found few there, so the carriageway sat in full view.
     Plant a row of dark broadleaves on the course side of any road within 70 m of a hole, in the rough, never nearer than 18 m to a line of play */
  if(!D._screened){D._screened=1;const LN=(A.HOLES||[]).map(h=>h.p),G=new Map();for(const q of D.tl){const k=Math.floor(q[0]/10)+','+Math.floor(q[1]/10);(G.get(k)||G.set(k,[]).get(k)).push(q);}
    const dSeg=(x,y,ax,ay,bx,by)=>{const vx=bx-ax,vy=by-ay,l2=vx*vx+vy*vy||1,t=Math.max(0,Math.min(1,((x-ax)*vx+(y-ay)*vy)/l2));return Math.hypot(x-ax-vx*t,y-ay-vy*t);};
    const dL=(x,y)=>{let b=1e9;for(const P of LN)for(let i=1;i<P.length;i++)b=Math.min(b,dSeg(x,y,P[i-1][0],P[i-1][1],P[i][0],P[i][1]));return b;};
    const near=(x,y,rad)=>{const cx=Math.floor(x/10),cy=Math.floor(y/10);for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){for(const q of G.get((cx+i)+','+(cy+j))||[])if(Math.hypot(q[0]-x,q[1]-y)<rad)return true;}return false;};
    const add=[];for(const r of D.roads||[]){if(r.w<6)continue;const P=r.p;for(let i=1;i<P.length;i++){const ax=P[i-1][0],ay=P[i-1][1],bx=P[i][0],by=P[i][1],Ls=Math.hypot(bx-ax,by-ay);if(Ls<1)continue;const ux=(bx-ax)/Ls,uy=(by-ay)/Ls;
      for(let s=0;s<Ls;s+=8){const x0=ax+ux*s,y0=ay+uy*s,dc=dL(x0,y0);if(dc>70||dc<22)continue;
        for(const sg of[1,-1]){const x=x0-uy*sg*(r.w/2+3.5),y=y0+ux*sg*(r.w/2+3.5);if(dL(x,y)>=dc||dL(x,y)<18)continue;if(A.lieAt(x,y)!=='rough'||near(x,y,6))continue;
          const q=[x,y,6+hsh(x,y)*3.5,3.4+hsh(y,x)*1.4,3];add.push(q);const k=Math.floor(x/10)+','+Math.floor(y/10);(G.get(k)||G.set(k,[]).get(k)).push(q);}}}}
    D.tl=D.tl.concat(add);console.log('[ko] road screen trees',add.length);}
  for(const q of D.tl){const x=q[0],y=q[1],h=q[2],r=q[3],sp=SP[q[4]],u=hsh(x,y);
    let v=0;if(sp==='palm')v=Math.floor(u*2.999);else if(sp==='monkey')v=r/h>.72?1:0;else v=u<.5?0:1;
    const t={x,y,gz:A.H(x,y),h,r,fir:sp==='cook',v,sp,hero:sp==='palm'?'palm'+v:null};
    TR.push(t);L[sp].push(t);const R2=Math.ceil(t.r/10)+1,cx=Math.floor(x/10),cy=Math.floor(y/10);
    for(let i=-R2;i<=R2;i++)for(let j=-R2;j<=R2;j++){const k=(cx+i)+','+(cy+j);let a=TH.get(k);if(!a)TH.set(k,a=[]);a.push(t);}}
  const TL=new T.TextureLoader();
  for(const sp of SP){if(!L[sp].length)continue;const m=META[sp],tex=TL.load('ko_'+sp+'Atlas.webp');tex.encoding=T.sRGBEncoding;tex.anisotropy=4;
    const M=A.mkImp(L[sp],tex,m.frames,m.rows,new Array(m.rows).fill(m.ratio),m.aspect);
    /* the flyovers' monkeypods, broadleaves and kiawe read as deep, dark green masses; the baked atlases came out light */
    const dk={monkey:.72,broad:.76,scrub:.8,cook:.86,plum:.9}[sp];const ca=M.instanceColor;
    if(dk&&ca){for(let i=0;i<ca.count;i++)ca.setXYZ(i,ca.getX(i)*dk,ca.getY(i)*Math.min(1,dk*1.04),ca.getZ(i)*dk*.96);ca.needsUpdate=true;if(M.userData.imp)M.userData.imp.cols=ca.array.slice();}
    A.scene.add(M);}
  console.log('[ko] lidar trees',TR.length,Object.fromEntries(SP.map(s=>[s,L[s].length])));return true;};

/* ---------- light: high tropical sun, blue sky fill, clear air ---------- */
X.tod=function(g,A){if(g)return;A.sun.color.set(0xffefd6);A.sun.intensity=1.85;A.HEMI.color.set(0xc6daee);A.HEMI.groundColor.set(0x45632f);A.HEMI.intensity=.64;/* toned down: the full tropical sun washed the course out */
  A.scene.fog.color.set(A.D.fogC);A.renderer.toneMappingExposure=.9;};

/* ---------- the Pacific: turquoise over the lagoons' sand, deepening to cobalt offshore, sun glitter, surf line on the shore ---------- */
X.farWater=function(w,A){const T=A.THREE,D=A.D,S=D.sea,WM=window.__WM;
  const TL=new T.TextureLoader(),dm=TL.load(S.img),df=TL.load(D.seafar.img);for(const x of[dm,df]){x.minFilter=T.LinearFilter;x.generateMipmaps=false;}const SF=D.seafar;
  const U={sky:{value:A.skyMat.uniforms.sky.value},nm:{value:WM?WM.uniforms.nm.value:null},dm:{value:dm},df:{value:df},fb4:{value:new T.Vector4(SF.x0,SF.x1,SF.y0,SF.y1)},rot:{value:A.skyMat.uniforms.rot.value},t:A.WT,sun:{value:A.sunDir},uLin:A.LINQ,
    hz:{value:new T.Color(D.fogC)},sb:{value:new T.Vector4(S.x0,S.x1,S.y0,S.y1)}};
  w.material=new T.ShaderMaterial({uniforms:U,extensions:{derivatives:true},
    vertexShader:'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader:'uniform sampler2D sky,nm,dm,df;uniform float rot,t,uLin;uniform vec3 sun,hz;uniform vec4 sb,fb4;varying vec3 vW;'+
     'vec3 skyS(vec3 d){float u=fract(atan(d.z,d.x)*.1591549+.5+rot);float v=max(asin(clamp(d.y,-1.,1.))*.3183099+.5,.503);return texture2D(sky,vec2(u,v)).rgb;}\n'+
     'void main(){vec2 p=vW.xz;float dist=length(cameraPosition-vW);vec2 lp=vec2(p.x,-p.y);vec2 uv=vec2((lp.x-sb.x)/(sb.y-sb.x),(lp.y-sb.z)/(sb.w-sb.z));'+
     'vec2 uf=vec2((lp.x-fb4.x)/(fb4.y-fb4.x),(lp.y-fb4.z)/(fb4.w-fb4.z));float s=1.;if(uv.x>0.&&uv.x<1.&&uv.y>0.&&uv.y<1.)s=texture2D(dm,uv).r;else if(uf.x>0.&&uf.x<1.&&uf.y>0.&&uf.y<1.)s=texture2D(df,uf).r;'+
     /* land: no water there (the low coastal plain would otherwise z-fight with the sea kilometres away) */
     'if(s<.05)discard;float dep=s*s;'+
     'float fp=length(fwidth(p));float fb=1.-smoothstep(.6,4.,fp);float fc=1.-smoothstep(.2,1.2,fp);'+
     'vec3 a=texture2D(nm,p/41.+vec2(t*.011,t*.007)).xyz*2.-1.;vec3 b=texture2D(nm,p/12.5+vec2(-t*.019,t*.014)).xyz*2.-1.;vec3 c=texture2D(nm,p/3.3+vec2(t*.045,-t*.037)).xyz*2.-1.;'+
     'float sw=sin(dot(p,vec2(.043,.027))+t*.8)+.6*sin(dot(p,vec2(-.019,.061))+t*.63);'+
     'vec2 pert=(a.xy*.62+b.xy*.42*fb+c.xy*.3*fc)*.3+vec2(.035,.025)*sw*fb;vec3 n=normalize(vec3(pert.x,1.,pert.y));'+
     'vec3 v=normalize(cameraPosition-vW);vec3 r=reflect(-v,n);r.y=abs(r.y);float fr=.02+.98*pow(1.-max(dot(n,v),0.),5.);'+
     'vec3 shal=vec3(.30,.80,.76),mid=vec3(.05,.52,.66),deep=vec3(.03,.24,.44);vec3 body=mix(shal,mid,smoothstep(0.,.22,dep));body=mix(body,deep,smoothstep(.22,1.,dep));'+
     'body=mix(vec3(.74,.83,.70),body,smoothstep(0.,.035,dep));'+
     'vec3 col=mix(body,skyS(r),clamp(fr*1.05,0.,.85));'+
     'vec3 ns=normalize(vec3((c.xy*.7+b.xy*.5)*.85,1.));vec3 rs=reflect(-v,ns);vec3 sd=normalize(sun);'+
     'float g=pow(max(dot(rs,sd),0.),700.)*7.*fc+pow(max(dot(r,sd),0.),140.)*1.6;col+=vec3(1.,.96,.86)*g;'+
     'float fm=(1.-smoothstep(0.,.018,dep))*(.5+.5*sin(dep*1400.-t*1.7+b.x*2.5));col=mix(col,vec3(.96,.98,.98),clamp(fm,0.,1.)*.85);'+
     'float k=1.-exp(-dist/9000.);col=mix(col,hz,clamp(k*.8,0.,.8));'+
     'if(uLin>.5)col=pow(col,vec3(2.2));gl_FragColor=vec4(col,1.);}'});
  w.material.customProgramCacheKey=()=>'koOcean';w.renderOrder=0;
  const o=A.outer;if(o)o.position.y=Math.min(o.position.y,D.far.lakeH-3);console.log('[ko] ocean');};

/* ---------- hero palms: full 3D coconut palms (the same models the impostors were baked from) near the golfer ---------- */
X.heroInit=function(HERO,A){const T=A.THREE;for(let v=0;v<3;v++){const g=KOT.palm(T,v);g.updateMatrixWorld(true);const ms=[];g.traverse(o=>{if(o.isMesh)ms.push(o);});
    const mk=(me,N)=>{const geo=me.geometry.clone();geo.applyMatrix4(me.matrixWorld);const mt=me.material;mt.userData.lin=1;const M=A.IMC(new T.InstancedMesh(geo,mt,N));M.count=0;M.castShadow=false;M.receiveShadow=true;M.frustumCulled=false;A.scene.add(M);return M;};
    HERO['palm'+v]={B:mk(ms[0],6),L:mk(ms[1],6),h:1,N:6,k:1,noYaw:true};}
  console.log('[ko] hero palms ready');};

/* ---------- ground paint: roads, beaches, red-dirt drainage ditches, the red-tinted cart paths, a tropical grade on the turf ---------- */
function paintGround(A){const D=A.D,c=A.ctx,m=A.mx,B=A.box,MP=A.MAIN.p;
  /* grade the turf toward the lush, slightly yellow Bermuda/paspalum green of the flyovers (grass pixels only) */
  {const cvs=c.canvas,x=cvs.getContext('2d');x.save();x.setTransform(1,0,0,1,0,0);const id=x.getImageData(0,0,cvs.width,cvs.height),d=id.data;
    for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2];if(g>r&&g>b){const l=(r+g+b)/3;d[i]=Math.min(255,(l+(r-l)*1.08)*.98);d[i+1]=Math.min(255,(l+(g-l)*1.12)*1.02);d[i+2]=Math.min(255,(l+(b-l)*1.08)*.9);}}x.putImageData(id,0,0);x.restore();}
  const outside=(cx)=>{cx.save();cx.beginPath();cx.rect(B.X0-50,B.Y0-50,B.WW+100,B.HH+100);cx.moveTo(MP[0][0],MP[0][1]);for(let i=1;i<MP.length;i++)cx.lineTo(MP[i][0],MP[i][1]);cx.closePath();cx.clip('evenodd');};
  for(const cx of[c,m]){outside(cx);cx.lineCap=cx.lineJoin='round';
    for(const b of D.beach||[]){cx.fillStyle=cx===c?'#e8d8b6':'#00ff00';fillP(cx,b);}
    for(const r of D.roads||[]){cx.strokeStyle=cx===c?'#5f6264':'#ffff00';cx.lineWidth=r.w>=6?r.w*.78:r.w;stroke(cx,r.p);}/* roads drawn a little narrower so the grey stays on the carriageway and doesn't run down the embankments beside the course */
    if(cx===c)for(const r of D.roads||[]){if(r.w<9)continue;c.strokeStyle='rgba(235,235,225,.55)';c.lineWidth=.15;c.setLineDash([3,6]);stroke(c,r.p);c.setLineDash([]);}
    cx.restore();}
  /* pond banks: anything of a pond outline the water doesn't cover is shoreline, not open water */
  for(const w of A.WATER){if(w.creek)continue;c.fillStyle='#3f5a32';fillP(c,w.p);m.fillStyle='#ff0000';fillP(m,w.p);}
  /* drainage ditches: bare red Oahu dirt, darker in the invert (2, 6, 7 and 13 cross them) */
  for(const l of D.ditch||[]){for(const [w,col] of[[3.4,'#6e4029'],[1.4,'#4a2a1a']]){c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';stroke(c,l);}m.strokeStyle='#ffff00';m.lineWidth=3.2;stroke(m,l);}
  /* cart paths: red-tinted concrete on 6, 7, 11, 15, 16 and 17 (grey everywhere else), as in the flyovers */
  const RED=['6','7','11','15','16','17'].map(r=>holeByRef(A,r)).filter(Boolean);const ALL=A.HOLES;
  for(const p of A.PATHS){for(let i=1;i<p.length;i++){const mx0=(p[i-1][0]+p[i][0])/2,my0=(p[i-1][1]+p[i][1])/2;let best=null,bd=1e9;for(const h of ALL){const d=A.dPL(mx0,my0,h.p);if(d<bd){bd=d;best=h;}}
    const red=RED.includes(best);c.strokeStyle=red?'#a86a55':'#b4b0a6';c.lineWidth=2.4;c.lineCap='round';stroke(c,[p[i-1],p[i]]);if(red){c.strokeStyle='rgba(120,70,55,.35)';c.lineWidth=.5;stroke(c,[p[i-1],p[i]]);}}}
  A.tex.needsUpdate=true;A.maskT.needsUpdate=true;}

/* ---------- buildings from the real footprints (OpenStreetMap + roofs found in the lidar), heights from the lidar:
   the resort towers on the horizon (Aulani in terracotta, the Marriott and Four Seasons towers in white), the villas along 14, 15 and 18 ---------- */
function buildings(A){const T=A.THREE,D=A.D;if(!D.kbld)return;
  const fac=ctex(T,cv(128,128,(x,W,H)=>{x.fillStyle='#fff';x.fillRect(0,0,W,H);const g=x.createLinearGradient(0,16,0,96);g.addColorStop(0,'#566e7d');g.addColorStop(1,'#8ea4b1');x.fillStyle=g;x.fillRect(8,14,112,82);
    x.fillStyle='rgba(255,255,255,.3)';x.fillRect(62,14,3,82);x.fillStyle='#71868f';x.fillRect(0,100,W,20);x.fillStyle='#f2f3f3';x.fillRect(0,96,W,5);for(let i=3;i<W;i+=7)x.fillRect(i,100,2,20);x.fillStyle='#e4e7e8';x.fillRect(0,120,W,8);}),1);
  const facH=ctex(T,cv(128,128,(x,W,H)=>{x.fillStyle='#fff';x.fillRect(0,0,W,H);x.fillStyle='#6f7a82';x.fillRect(40,40,48,42);x.fillStyle='#98a3ab';x.fillRect(44,44,18,34);x.fillStyle='rgba(0,0,0,.07)';x.fillRect(0,112,W,16);}),1);
  const G={t:{P:[],U:[],C:[]},h:{P:[],U:[],C:[]},r:{P:[],C:[]}};const col=new T.Color(),lk=D.far.lakeH;
  const HOUSE=['#efe9dc','#e6dccb','#d9cdb8','#f2efe7','#d4c9b5','#e9e2d2'],ROOF=['#5b4a42','#6e6259','#8a5b44','#4f5559','#7a6a58','#6a4535'];
  const push=(g,v,c)=>{g.P.push(v.x,v.y,v.z);g.C.push(c.r,c.g,c.b);};
  let n=0;for(const b of D.kbld){const P=b.p;if(P.length<3)continue;let cx=0,cy=0;P.forEach(q=>{cx+=q[0];cy+=q[1];});cx/=P.length;cy/=P.length;
    const lie=A.lieAt(cx,cy);if(lie!=='oob'&&lie!=='rough')continue;let gz=1e9;for(const q of P)gz=Math.min(gz,A.H(q[0],q[1]));if(gz<lk+.8)continue;gz-=.4;
    const tall=b.h>20,u=hsh(cx,cy);let wall,roof;
    if(/Hale (Moana|Kona|Nai)/.test(b.n||'')){wall='#efe6d6';roof='#9a5a42';}
    else if(tall&&Math.hypot(cx+256,cy+440)<80){wall='#d0906f';roof='#8f4a36';}  /* Aulani */
    else if(tall){wall='#f3f0e9';roof='#7d8288';}
    else if(b.t==='lidar'||/^M-/.test(b.n||'')){wall=HOUSE[Math.floor(u*HOUSE.length)];roof=ROOF[Math.floor(hsh(cy,cx)*ROOF.length)];}
    else if(b.t==='club'){wall='#ece4d2';roof='#55604f';}
    else{wall=HOUSE[Math.floor(u*HOUSE.length)];roof='#6b645c';}
    const rect=P.length===4&&!tall;let s0=1e9;if(rect){for(let i=0;i<4;i++)s0=Math.min(s0,Math.hypot(P[(i+1)%4][0]-P[i][0],P[(i+1)%4][1]-P[i][1]));}
    const pyr=!rect;let area=0;for(let i=0;i<P.length;i++){const a=P[i],c2=P[(i+1)%P.length];area+=a[0]*c2[1]-c2[0]*a[1];}area=Math.abs(area)/2;
    const rh=rect?Math.min(3.2,s0*.32):tall?Math.min(7,.16*Math.sqrt(area)):pyr?Math.min(4,.2*Math.sqrt(area)):0,wh=Math.max(2.6,b.h-rh);const g=tall?G.t:G.h;col.set(wall).convertSRGBToLinear();
    for(let i=0;i<P.length;i++){const a=P[i],c2=P[(i+1)%P.length],Lw=Math.hypot(c2[0]-a[0],c2[1]-a[1]),v0=A.V(a[0],a[1],gz),v1=A.V(c2[0],c2[1],gz),v2=A.V(c2[0],c2[1],gz+.4+wh),v3=A.V(a[0],a[1],gz+.4+wh);
      for(const v of[v0,v1,v2,v0,v2,v3])push(g,v,col);const u1=Lw/(tall?3.4:5),vv=(wh+.4)/(tall?3.1:3.3);g.U.push(0,0,u1,0,u1,vv,0,0,u1,vv,0,vv);}
    if(tall){/* a balcony slab at every floor along each long wall */const floors=Math.floor(wh/3.1),sc=new T.Color(wall).convertSRGBToLinear().multiplyScalar(1.06);let sa=0;
      for(let i=0;i<P.length;i++){const a=P[i],c2=P[(i+1)%P.length];sa+=a[0]*c2[1]-c2[0]*a[1];}
      for(let i=0;i<P.length;i++){const a=P[i],c2=P[(i+1)%P.length],Lw=Math.hypot(c2[0]-a[0],c2[1]-a[1]);if(Lw<6)continue;let nx=(c2[1]-a[1])/Lw,ny=-(c2[0]-a[0])/Lw;if(sa<0){nx=-nx;ny=-ny;}
        const o=1.1,e0=[a[0]+(c2[0]-a[0])*.05,a[1]+(c2[1]-a[1])*.05],e1=[c2[0]-(c2[0]-a[0])*.05,c2[1]-(c2[1]-a[1])*.05];
        for(let f=1;f<floors;f++){const z=gz+.4+f*3.1,V=A.V,A0=V(e0[0],e0[1],z),A1=V(e1[0],e1[1],z),B0=V(e0[0]+nx*o,e0[1]+ny*o,z),B1=V(e1[0]+nx*o,e1[1]+ny*o,z),C0=V(e0[0]+nx*o,e0[1]+ny*o,z-.24),C1=V(e1[0]+nx*o,e1[1]+ny*o,z-.24);
          for(const v of[A0,A1,B1,A0,B1,B0,B0,B1,C1,B0,C1,C0])push(G.r,v,sc);}}}
    col.set(roof).convertSRGBToLinear();const top=gz+.4+wh;
    if(rect){/* hip roof: ridge along the long side, eaves 0.5 m out */let k=0;for(let i=0;i<4;i++){const l=Math.hypot(P[(i+1)%4][0]-P[i][0],P[(i+1)%4][1]-P[i][1]);if(l>s0+.01){k=i;break;}}
      const Q=[0,1,2,3].map(i=>P[(k+i)%4]),mx=(Q[0][0]+Q[1][0]+Q[2][0]+Q[3][0])/4,my=(Q[0][1]+Q[1][1]+Q[2][1]+Q[3][1])/4;const E=Q.map(q=>{const dx=q[0]-mx,dy=q[1]-my,d=Math.hypot(dx,dy)||1;return[q[0]+dx/d*.6,q[1]+dy/d*.6];});
      const lx=(Q[1][0]-Q[0][0]),ly=(Q[1][1]-Q[0][1]),ll=Math.hypot(lx,ly)||1,ux=lx/ll,uy=ly/ll,half=Math.max(0,ll/2-s0/2);
      const R1=[mx-ux*half,my-uy*half],R2=[mx+ux*half,my+uy*half],tz=top+rh,V=A.V;
      const tri=(p,q,r,z1,z2,z3)=>{for(const [pp,zz] of[[p,z1],[q,z2],[r,z3]])push(G.r,V(pp[0],pp[1],zz),col);};
      tri(E[0],E[1],R2,top-.15,top-.15,tz);tri(E[0],R2,R1,top-.15,tz,tz);tri(E[1],E[2],R2,top-.15,top-.15,tz);tri(E[2],E[3],R1,top-.15,top-.15,tz);tri(E[2],R1,R2,top-.15,tz,tz);tri(E[3],E[0],R1,top-.15,top-.15,tz);}
    else if(pyr){/* pitched roof over an irregular footprint: every eave to one apex */const V=A.V,ap=V(cx,cy,top+rh);for(let i=0;i<P.length;i++){const a=P[i],c2=P[(i+1)%P.length];
      const e=q=>{const dx=q[0]-cx,dy=q[1]-cy,d=Math.hypot(dx,dy)||1;return V(q[0]+dx/d*.6,q[1]+dy/d*.6,top-.15);};push(G.r,e(a),col);push(G.r,e(c2),col);push(G.r,ap,col);}}
    else{const sh=new T.Shape(P.map(q=>new T.Vector2(q[0],q[1]))),sg=new T.ShapeGeometry(sh),sp=sg.attributes.position,ix=sg.index?Array.from(sg.index.array):Array.from({length:sp.count},(_,i)=>i);
      for(const i of ix)push(G.r,A.V(sp.getX(i),sp.getY(i),top),col);}
    n++;}
  const mk=(g,map,uv)=>{if(!g.P.length)return;const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(g.P,3));geo.setAttribute('color',new T.Float32BufferAttribute(g.C,3));if(uv)geo.setAttribute('uv',new T.Float32BufferAttribute(g.U,2));geo.computeVertexNormals();
    const me=new T.Mesh(geo,new T.MeshLambertMaterial({map:map||null,vertexColors:true,side:T.DoubleSide}));me.castShadow=true;me.receiveShadow=true;A.scene.add(me);return me;};
  mk(G.t,fac,1);mk(G.h,facH,1);mk(G.r,null,0);console.log('[ko] buildings',n);}

/* ---------- rocks: lumpy boulders (noise-displaced icosahedra), instanced ---------- */
function rockGeo(T,seed){const g=new T.IcosahedronGeometry(1,2),p=g.attributes.position,r=KOT.rng(seed);const o=[r()*9,r()*9,r()*9];
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=1+.22*Math.sin(x*2.3+o[0])*Math.cos(z*2.1+o[1])+.12*Math.sin(y*4.7+o[2])+.06*Math.sin((x+z)*7.1);p.setXYZ(i,x*k,y*k*.72,z*k);}
  g.computeVertexNormals();return g;}
function rocks(A,list,cols,rough){if(!list.length)return;const T=A.THREE;const geos=[rockGeo(T,3),rockGeo(T,8),rockGeo(T,13)];
  const tex=ctex(T,cv(128,128,(x,W,H)=>{const r=KOT.rng(4);x.fillStyle='#fff';x.fillRect(0,0,W,H);for(let i=0;i<900;i++){const k=150+r()*105|0;x.fillStyle='rgba('+k+','+k+','+k+','+(.25+r()*.35)+')';x.fillRect(r()*W,r()*H,1+r()*3,1+r()*3);}}),1);
  geos.forEach((geo,gi)=>{const L=list.filter((_,i)=>i%3===gi);if(!L.length)return;const M=A.IMC(new T.InstancedMesh(geo,new T.MeshStandardMaterial({map:tex,roughness:rough||.95,metalness:0,flatShading:true}),L.length));
    const m=new T.Matrix4(),q=new T.Quaternion(),c=new T.Color();L.forEach((p,i)=>{q.setFromEuler(new T.Euler((hsh(p[0],p[1])-.5)*.4,hsh(p[1],p[0])*6.28,(hsh(p[0]+1,p[1])-.5)*.4));
      m.compose(A.V(p[0],p[1],p[3]),q,new T.Vector3(p[2],p[2]*(p[4]||1),p[2]));M.setMatrixAt(i,m);c.set(cols[Math.floor(hsh(p[0]*3,p[1])*cols.length)]);M.setColorAt(i,c);});
    M.castShadow=true;M.receiveShadow=true;M.frustumCulled=false;M.userData.occluder=true;A.scene.add(M);});}

/* ---------- tropical plantings: red ti, crotons, yellow-green shrubs (crossed leaf cards) ---------- */
function plantTex(T,kind){return ctex(T,cv(128,128,(x,W,H)=>{const r=KOT.rng(kind*7+1);const pal=[['#b3162a','#8e1024','#d8283a','#6e0f24','#c21f3a'],['#d9a21e','#b8c43a','#e06a1a','#8fb53a','#c43a24'],['#9ec23a','#b4d24a','#7ea62c','#c8dc5a']][kind];
  for(let i=0;i<46;i++){const a=-Math.PI/2+(r()-.5)*2.6,l=26+r()*34,cx=W/2+(r()-.5)*20;x.save();x.translate(cx,H-4);x.rotate(a+Math.PI/2);x.fillStyle=pal[Math.floor(r()*pal.length)];
    x.beginPath();x.ellipse(0,-l/2,kind===0?5:7,l/2,0,0,7);x.fill();x.strokeStyle='rgba(40,10,10,.35)';x.lineWidth=.8;x.beginPath();x.moveTo(0,0);x.lineTo(0,-l);x.stroke();x.restore();}}));}
function plants(A,list){if(!list.length)return;const T=A.THREE;const g0=new T.PlaneGeometry(1,1);g0.translate(0,.5,0);const P=[],U=[],I=[];let o=0;
  for(const ang of[0,Math.PI/3,2*Math.PI/3]){const g=g0.clone();g.rotateY(ang);P.push(...g.attributes.position.array);U.push(...g.attributes.uv.array);I.push(...Array.from(g.index.array).map(v=>v+o));o+=g.attributes.position.count;}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(P,3));geo.setAttribute('uv',new T.Float32BufferAttribute(U,2));geo.setIndex(I);geo.computeVertexNormals();
  for(let k=0;k<3;k++){const L=list.filter(p=>p[3]===k);if(!L.length)continue;const M=A.IMC(new T.InstancedMesh(geo,new T.MeshLambertMaterial({map:plantTex(T,k),alphaTest:.45,side:T.DoubleSide}),L.length)),m=new T.Matrix4(),q=new T.Quaternion();
    L.forEach((p,i)=>{q.setFromAxisAngle(new T.Vector3(0,1,0),hsh(p[0],p[1])*6.28);m.compose(A.V(p[0],p[1],p[4]!=null?p[4]:A.H(p[0],p[1])-.05),q,new T.Vector3(p[2]*1.2,p[2],p[2]*1.2));M.setMatrixAt(i,m);});
    M.castShadow=true;M.frustumCulled=false;A.scene.add(M);}}

/* ---------- the signature waterfalls on 8, 12 and 18: stepped cascades over tan boulders into the ponds, planted with red ti and crotons ---------- */
function fallMat(A){const T=A.THREE;return new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:{t:A.WT,uLin:A.LINQ},
  vertexShader:'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform float t,uLin;varying vec2 vU;float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}'+
   'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}'+
   'void main(){float s=n(vec2(vU.x*18.,vU.y*3.+t*2.6))*.6+n(vec2(vU.x*42.,vU.y*7.+t*4.1))*.4;float edge=smoothstep(0.,.12,vU.x)*smoothstep(1.,.88,vU.x);'+
   'vec3 c=mix(vec3(.62,.78,.82),vec3(.97,.99,1.),smoothstep(.35,.8,s));float a=(.55+.45*s)*edge*(.75+.25*smoothstep(.0,.2,1.-vU.y));'+
   'if(uLin>.5)c=pow(c,vec3(2.2));gl_FragColor=vec4(c,a);}'});}
function waterfalls(A){const T=A.THREE;const PL=[],FM=fallMat(A),FOAM=[];const PAL={'8':['#9c866e','#8a7560','#a8927a','#7d6a56','#957c64'],'12':['#2e2a27','#3a3531','#26231f','#443e38','#34302b'],'18':['#403b36','#34302c','#4b4540','#2c2926']};
  const spots=[['8',h=>{const g=greenOfHole(A,h),t0=h.p[0],dx=g.cx-t0[0],dy=g.cy-t0[1],L=Math.hypot(dx,dy);return[g.cx-dy/L*20-dx/L*10,g.cy+dx/L*20-dy/L*10];}],
               ['12',h=>{const t0=h.p[0],t1=h.p[1],dx=t1[0]-t0[0],dy=t1[1]-t0[1],L=Math.hypot(dx,dy);return[t0[0]-dx/L*6-dy/L*15,t0[1]-dy/L*6+dx/L*15];}],/* 12: the falls sit where the pond comes nearest the tees - its east end, just left of and level with the tee boxes (satellite and flyover) - not out on the line of play */
               ['18',h=>{const g=greenOfHole(A,h),t0=h.p[h.p.length-2],dx=g.cx-t0[0],dy=g.cy-t0[1],L=Math.hypot(dx,dy);return[g.cx-dy/L*26,g.cy+dx/L*26];}]];
  for(const [ref,fn] of spots){const RK=[];const h=holeByRef(A,ref);if(!h)continue;const Q=fn(h),w=nearestPond(A,Q[0],Q[1],90);if(!w)continue;const E=edgePointNear(w,Q[0],Q[1]);if(!E)continue;
    /* axis: a = 0 at the shoreline, positive out into the pond. The outcrop is built out from the bank and the water steps down
       its pond-facing side in three falls, each with a small pool above it. */
    let fx=w.cx-E.x,fy=w.cy-E.y;const fl=Math.hypot(fx,fy)||1;fx/=fl;fy/=fl;const sx=-fy,sy=fx;
    const lv=pondLevel(A,w),tiers=3,step=1.3,run=2.4,wid=ref==='12'?6:5;const P=(a,s)=>[E.x+fx*a+sx*s,E.y+fy*a+sy*s];
    const rampZ=a=>lv+Math.max(0,Math.min(tiers,(1.6-a)/run))*step;/* top of the outcrop at distance a */
    for(let k=0;k<tiers;k++){const a0=1.6-k*run,zTop=lv+step*(k+1),zBot=lv+step*k,c=P(a0,0);
      const sh=new T.Mesh(new T.PlaneGeometry(wid-k*.7,step+.3,8,4),FM);sh.position.copy(A.V(c[0],c[1],(zTop+zBot)/2+.05));sh.rotation.y=Math.atan2(fx,fy);sh.renderOrder=2;A.scene.add(sh);
      for(let j=-4;j<=4;j++){const q=P(a0-.9,j*(wid/7.5));RK.push([q[0],q[1],.75+hsh(q[0],q[1])*.55,zTop-.95,.9]);}           /* the step face behind the fall */
      for(const sd of[-1,1])for(let j=0;j<3;j++){const q=P(a0-j*.8,sd*(wid/2+.7+j*.3));RK.push([q[0],q[1],1+hsh(q[1],q[0])*.8,zTop-.5,1]);} /* the banks of each fall */
      const pc=P(a0-run*.55,0),pool=new T.Mesh(new T.CircleGeometry(1,20),window.__WM||new T.MeshBasicMaterial({color:0x2a5a68}));pool.rotation.x=-Math.PI/2;pool.scale.set(wid*.42,run*.45,1);
      pool.rotation.z=-Math.atan2(fx,fy);pool.position.copy(A.V(pc[0],pc[1],zTop-.08));pool.renderOrder=1;A.scene.add(pool);
      for(let j=0;j<6;j++){const q=P(a0+.6+hsh(k,j)*.8,(hsh(j,k)-.5)*wid*.8);FOAM.push([q[0],q[1],zBot+.04]);}}
    /* the rest of the outcrop: behind and beside the cascade, up to its crown */
    for(let k=0;k<90;k++){const a=1.6-hsh(k,ref.length)*(tiers*run+3.5),s=(hsh(ref.length,k)-.5)*2*(wid*.5+3.5);if(Math.abs(s)<wid*.5&&a>1.6-tiers*run)continue;
      const q=P(a,s),z=Math.max(A.H(q[0],q[1]),rampZ(a)*(1-Math.max(0,Math.abs(s)-wid*.5)/5));RK.push([q[0],q[1],.9+hsh(q[0],q[1])*1.4,z-.5,.9]);}
    for(let k=0;k<10;k++){const q=P(2.2+hsh(k,9)*1.5,(hsh(9,k)-.5)*wid*1.5);RK.push([q[0],q[1],.55+hsh(q[0],1)*.6,lv-.3,.7]);}
    /* plantings on the outcrop and the bank: red ti, crotons, lime shrubs */
    for(let k=0;k<130;k++){const a=1.6-hsh(k,7)*(tiers*run+5),s=(hsh(7,k)-.5)*2*(wid*.5+6),q=P(a,s);if(Math.abs(s)<wid*.5+.5&&a>1.6-tiers*run)continue;
      const l=A.lieAt(q[0],q[1]);if(l==='green'||l==='tee'||l==='bunker')continue;const z=Math.max(A.H(q[0],q[1]),rampZ(a)*(1-Math.max(0,Math.abs(s)-wid*.5)/5));if(z<lv+.1)continue;PL.push([q[0],q[1],.7+hsh(q[0],q[1])*.8,k%3,z-.05]);}
    {const H0=A.HOLES||[],clear=(x,y)=>{if(A.lieAt(x,y)==='tee')return false;for(const hh of H0){const a=hh.p[0],b=hh.p[1];if(!a||!b)continue;const ux=b[0]-a[0],uy=b[1]-a[1],L=Math.hypot(ux,uy)||1,al=((x-a[0])*ux+(y-a[1])*uy)/L,la=Math.abs((x-a[0])*uy-(y-a[1])*ux)/L;if(al>-8&&al<150&&la<9)return false;}return true;};
      for(let k=RK.length-1;k>=0;k--)if(!clear(RK[k][0],RK[k][1]))RK.splice(k,1);for(let k=PL.length-1;k>=0;k--)if(!clear(PL[k][0],PL[k][1]))PL.splice(k,1);}
    rocks(A,RK,PAL[ref]);console.log('[ko] waterfall on',ref);}
  plants(A,PL);
  if(FOAM.length){const g=new T.CircleGeometry(.9,12);g.rotateX(-Math.PI/2);const M=new T.InstancedMesh(g,new T.MeshBasicMaterial({color:0xf4f8f8,transparent:true,opacity:.55,depthWrite:false}),FOAM.length),m=new T.Matrix4();
    FOAM.forEach((p,i)=>{m.makeScale(.8+hsh(p[0],p[1]),1,.8+hsh(p[1],p[0])).setPosition(A.V(p[0],p[1],p[2]));M.setMatrixAt(i,m);});M.renderOrder=3;A.scene.add(M);}}

/* ---------- pond water: the deep blue-teal of the flyovers with sky reflections, ripples and sun glints (replaces the darker default pond water) ---------- */
function pondMat(A){const T=A.THREE,WM=window.__WM;return new T.ShaderMaterial({extensions:{derivatives:true},
  uniforms:{sky:{value:A.skyMat.uniforms.sky.value},nm:{value:WM?WM.uniforms.nm.value:null},rot:{value:A.skyMat.uniforms.rot.value},t:A.WT,sun:{value:A.sunDir},uLin:A.LINQ},
  vertexShader:'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
  fragmentShader:'uniform sampler2D sky,nm;uniform float rot,t,uLin;uniform vec3 sun;varying vec3 vW;'+
   'vec3 skyS(vec3 d){float u=fract(atan(d.z,d.x)*.1591549+.5+rot);float v=max(asin(clamp(d.y,-1.,1.))*.3183099+.5,.503);return texture2D(sky,vec2(u,v)).rgb;}\n'+
   'void main(){vec2 p=vW.xz;float fp=length(fwidth(p));float fb=1.-smoothstep(.15,.9,fp);'+
   'vec3 a=texture2D(nm,p/9.+vec2(t*.021,t*.013)).xyz*2.-1.;vec3 b=texture2D(nm,p/3.6+vec2(-t*.031,t*.024)).xyz*2.-1.;'+
   'vec2 pert=(a.xy*.65+b.xy*.45*fb)*.11;vec3 n=normalize(vec3(pert.x,1.,pert.y));vec3 v=normalize(cameraPosition-vW);vec3 r=reflect(-v,n);r.y=abs(r.y);'+
   'float fr=.16+.84*pow(1.-max(dot(n,v),0.),4.);vec3 body=mix(vec3(.19,.40,.50),vec3(.23,.46,.55),.5+.5*a.x);'+
   'vec3 col=mix(body,skyS(r)*.92,clamp(fr,0.,.88));vec3 sd=normalize(sun);col+=vec3(1.,.95,.85)*(pow(max(dot(r,sd),0.),240.)*2.2+pow(max(dot(r,sd),0.),40.)*.12);'+
   'if(uLin>.5)col=pow(col,vec3(2.2));gl_FragColor=vec4(col,1.);}'});}

/* ---------- pond edges: dark lava rock (2, 4, 9, 10, 12) and continuous stacked-stone / timber bulkheads by the greens of 5, 8, 13 and 18 ---------- */
function wallTex(T,timber){return ctex(T,cv(128,96,(x,W,H)=>{const r=KOT.rng(timber?5:6);
  if(timber){x.fillStyle='#3a3026';x.fillRect(0,0,W,H);for(let i=0;i<W;i+=16){const k=110+r()*40|0;x.fillStyle='rgb('+k+','+(k*.86|0)+','+(k*.7|0)+')';x.fillRect(i+1,0,14,H);x.fillStyle='rgba(0,0,0,.18)';x.fillRect(i+1,0,3,H);
      for(let j=0;j<5;j++){x.fillStyle='rgba(50,40,30,.25)';x.fillRect(i+2+r()*10,r()*H,1,6+r()*14);}}}
  else{x.fillStyle='#6d665c';x.fillRect(0,0,W,H);let y=0;while(y<H){const hh=10+r()*8;let xx=-r()*20;while(xx<W){const ww=16+r()*22,k=150+r()*50|0;x.fillStyle='rgb('+k+','+(k*.95|0)+','+(k*.86|0)+')';x.fillRect(xx+1,y+1,ww-2,hh-2);x.fillStyle='rgba(0,0,0,.12)';x.fillRect(xx+1,y+hh-4,ww-2,3);xx+=ww;}y+=hh;}}}),1);}
function pondEdges(A){const T=A.THREE,LAVA=[],RUNS=[];const lavaH=['2','4','9','10','12'].map(r=>holeByRef(A,r)).filter(Boolean);
  const wallG=['5','8','13','18'].map(r=>{const h=holeByRef(A,r);return h?{g:greenOfHole(A,h),r}:null;}).filter(Boolean);
  for(const w of A.WATER){if(w.creek)continue;const lv=pondLevel(A,w),P=w.p;let run=null;
    for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let s=0;s<L;s+=.9){const x=a[0]+(b[0]-a[0])*s/L,y=a[1]+(b[1]-a[1])*s/L;
      const wg=wallG.find(o=>Math.hypot(o.g.cx-x,o.g.cy-y)<o.g.R+14);
      if(wg){if(!run){run={pts:[],lv,ref:wg.r,w};RUNS.push(run);}run.pts.push([x,y]);continue;}run=null;
      if(lavaH.some(h=>A.dPL(x,y,h.p)<55)&&hsh(x,y)<.62){const k=hsh(y,x);LAVA.push([x+(k-.5)*.8,y+(hsh(x+2,y)-.5)*.8,.35+k*.55,lv-.12,.8]);}}}}
  rocks(A,LAVA,['#3a3632','#2f2c29','#46403a','#35302c'],.9);
  const G={s:{P:[],U:[]},t:{P:[],U:[]}};
  for(const R of RUNS){if(R.pts.length<2)continue;const g=R.ref==='8'?G.t:G.s,zb=R.lv-.7;let cum=0;
    /* a retaining wall: from below the water up to the bank just behind the outline, so a steep bank never leaves it buried or floating */
    const nrm=k=>{const p0=R.pts[Math.max(0,k-1)],p1=R.pts[Math.min(R.pts.length-1,k+1)],L=Math.hypot(p1[0]-p0[0],p1[1]-p0[1])||1;let nx=-(p1[1]-p0[1])/L,ny=(p1[0]-p0[0])/L;if(nx*(R.pts[k][0]-R.w.cx)+ny*(R.pts[k][1]-R.w.cy)<0){nx=-nx;ny=-ny;}return[nx,ny];};
    const raw=R.pts.map((q,k)=>{const n=nrm(k);return Math.max(R.lv+.42,Math.min(A.baseH(q[0]+n[0]*.4,q[1]+n[1]*.4)+.06,R.lv+2.4));});
    const TOP=raw.map((_,k)=>{let s=0,c=0;for(let j=-3;j<=3;j++){const v=raw[k+j];if(v!==undefined){s+=v;c++;}}return s/c;}); /* smoothed so the coping runs level */
    const top=(q,nx,ny,k)=>TOP[k];
    for(let k=1;k<R.pts.length;k++){const p0=R.pts[k-1],p1=R.pts[k],L=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]);if(L>2.5){continue;}
      let nx=-(p1[1]-p0[1])/L,ny=(p1[0]-p0[0])/L;if(nx*(p0[0]-R.w.cx)+ny*(p0[1]-R.w.cy)<0){nx=-nx;ny=-ny;}/* n points away from the pond (onto the bank) */
      const t0=top(p0,nx,ny,k-1),t1=top(p1,nx,ny,k),u0=cum/1.2,u1=(cum+L)/1.2;cum+=L;const V=A.V;
      const quad=(a,b,c,d,ua,ub,va,vb)=>{for(const [q,u,v] of[[a,ua,va],[b,ub,va],[c,ub,vb],[a,ua,va],[c,ub,vb],[d,ua,vb]]){g.P.push(q.x,q.y,q.z);g.U.push(u,v);}};
      quad(V(p0[0],p0[1],zb),V(p1[0],p1[1],zb),V(p1[0],p1[1],t1),V(p0[0],p0[1],t0),u0,u1,0,(t0-zb)/.9);                       /* face toward the water */
      quad(V(p0[0],p0[1],t0),V(p1[0],p1[1],t1),V(p1[0]+nx*.4,p1[1]+ny*.4,t1),V(p0[0]+nx*.4,p0[1]+ny*.4,t0),u0,u1,0,.4);           /* coping on top */
    }}
  const mk=(g,timber)=>{if(!g.P.length)return 0;const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(g.P,3));geo.setAttribute('uv',new T.Float32BufferAttribute(g.U,2));geo.computeVertexNormals();
    const me=new T.Mesh(geo,new T.MeshStandardMaterial({map:wallTex(T,timber),roughness:.9,metalness:0,side:T.DoubleSide}));me.castShadow=true;me.receiveShadow=true;A.scene.add(me);return g.P.length/18;};
  const ns=mk(G.s,0),nt=mk(G.t,1);console.log('[ko] lava rocks',LAVA.length,'stone wall m',Math.round(ns*.9),'timber wall m',Math.round(nt*.9));}

/* ---------- ti and croton beds beside the par-3 tees ---------- */
function teeBeds(A){const PL=[];for(const r of['4','8','12','16']){const h=holeByRef(A,r);if(!h)continue;const t0=h.p[0],t1=h.p[1],a=Math.atan2(t1[1]-t0[1],t1[0]-t0[0]);
  for(const [al,sd] of[[-6,-10],[-8,11]]){const cx=t0[0]+Math.cos(a)*al-Math.sin(a)*sd,cy=t0[1]+Math.sin(a)*al+Math.cos(a)*sd;for(let k=0;k<22;k++){const x=cx+(hsh(k,cx)-.5)*6,y=cy+(hsh(cy,k)-.5)*3.5;if(A.lieAt(x,y)==='rough')PL.push([x,y,.6+hsh(x,y)*.5,k%3]);}}}
  plants(A,PL);}

X.decor=function(A){for(const [n,f] of[['paint',paintGround],['buildings',buildings],['waterfalls',waterfalls],['ponds',pondEdges],['beds',teeBeds]]){try{f(A);}catch(e){console.warn('[ko] '+n,e);}}
  try{const PM=pondMat(A);let n=0;A.scene.traverse(o=>{if(o.isMesh&&window.__WM&&o.material===window.__WM){o.material=PM;n++;}});console.log('[ko] pond water',n);}catch(e){console.warn('[ko] pond water',e);}};
window.COURSE_EXT=X;
})();
