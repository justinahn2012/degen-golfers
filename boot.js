/* Degen Golfers '26: loads data files, picks the course, then starts the game scripts */
(async function(){
  const J=u=>fetch(u).then(r=>{if(!r.ok)throw new Error(u+' '+r.status);return r.json();});
  const load=src=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error(src));document.body.appendChild(s);});
  const status=t=>{const l=document.getElementById('load');if(l)l.textContent=t;};
  try{
    const [A,F,FONT,jp,ws,nc,AN,F3]=await Promise.all([J('assets.json'),J('faces.json'),J('font.json'),J('jp.json'),J('ws.json'),J('nc.json'),J('anims.json').catch(()=>null),J('face3d.json').catch(()=>null)]);
    window.ASSETS=A;window.ANIMS=AN;window.FACE3D=F3;window.FACES=F;window.LOGO_FONT=FONT;window.COURSES={jp,ws,nc};
    (function(){let B=null;try{const s=sessionStorage.getItem('dg-boot');if(s){B=JSON.parse(s);sessionStorage.removeItem('dg-boot');}}catch(e){}
 if(!B){try{const m=location.hash.match(/dg=([^&]+)/);if(m){B=JSON.parse(decodeURIComponent(m[1]));try{history.replaceState(null,'',location.pathname+location.search);}catch(e){location.hash='';}}}catch(e){}}
 let k='jp';try{k=(B&&B.c)||localStorage.getItem('dg-course')||'jp';}catch(e){if(B&&B.c)k=B.c;}if(!COURSES[k])k='jp';
 window.BOOT=B;window.COURSE_KEY=k;window.COURSE=COURSES[k];const l=document.getElementById('load');if(l)l.textContent=B?'Heading to '+COURSES[k].short+'…':'Laying out the course…';})()
    try{const c=window.COURSE;if(c&&c.lidar){status('Loading '+c.short+' terrain…');const b=await fetch(c.lidar.file).then(r=>r.ok?r.arrayBuffer():null);if(b)c.lidar.data=new Int16Array(b);}}catch(e){console.warn('lidar',e);}
    await load('dimples.js');await load('intro.js');await load('main.js');
  }catch(e){console.error(e);status('Couldn’t load the game files. Check that every file uploaded, then reload.');}
})();
