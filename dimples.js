window.makeDimples=function(){if(window._dimp)return window._dimp;const W=1024,H=512,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,W,H);
 const N=392,ga=Math.PI*(3-Math.sqrt(5)),r=Math.sqrt(4/N)*.9;
 for(let i=0;i<N;i++){const yv=1-(i+.5)/N*2,lat=Math.asin(yv),lon=((i*ga)%(Math.PI*2)+Math.PI*2)%(Math.PI*2),cx=lon/(2*Math.PI)*W,cy=(.5-lat/Math.PI)*H,ry=r/Math.PI*H,rx=Math.min(W/2,ry/Math.max(.06,Math.cos(lat)));
  for(const off of[-W,0,W]){x.save();x.translate(cx+off,cy);x.scale(rx/ry,1);const g=x.createRadialGradient(0,0,0,0,0,ry);g.addColorStop(0,'#686868');g.addColorStop(.62,'#a4a4a4');g.addColorStop(.86,'#f2f2f2');g.addColorStop(1,'#ffffff');x.fillStyle=g;x.beginPath();x.arc(0,0,ry,0,7);x.fill();x.restore();}}
 const t=new THREE.CanvasTexture(c);t.anisotropy=8;return window._dimp=t;};
