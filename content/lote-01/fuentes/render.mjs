import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
const require=createRequire(import.meta.url);
const sharp=require('sharp');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const C={ink:'#493454',purple:'#624673',cream:'#FAF7F4',lavender:'#EAE0F5',mint:'#DDF1EC',pink:'#F5E1EA',muted:'#705D7B'};
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function text(lines,x,y,size=42,color=C.ink,weight=400,leading=1.22){return lines.map((l,i)=>`<text x="${x}" y="${y+i*size*leading}" fill="${color}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}">${esc(l)}</text>`).join('');}
function pill(label,x,y,w,bg=C.ink,color=C.cream){return `<rect x="${x}" y="${y}" width="${w}" height="72" rx="36" fill="${bg}"/>`+text([label],x+28,y+46,28,color,700);}
function line(x,y,w,color=C.ink){return `<path d="M${x} ${y}h${w}" stroke="${color}" stroke-width="2" opacity=".22"/>`;}
function mark(y=112,color=C.purple){return text(['tidy.'],80,y,48,color,700)+text(['STUDIO / WEB CON INTENCIÓN'],80,y+35,16,color,700);}
function base(h,bg,inside,footer,light=false){const color=light?C.cream:C.purple;return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="${h}" viewBox="0 0 1080 ${h}"><rect width="1080" height="${h}" fill="${bg}"/>${mark(h===1350?108:280,color)}${inside}${line(80,h-134,920,color)}${text(['Tidy Studio'],80,h-77,25,color,700)}${text([footer],h===1350?880:770,h-77,22,color,400)}</svg>`;}
async function save(name,svg){const svgPath=path.join(root,'fuentes',name+'.svg');await fs.mkdir(path.dirname(svgPath),{recursive:true});const pngPath=path.join(root,name+'.png');await fs.mkdir(path.dirname(pngPath),{recursive:true});await fs.writeFile(svgPath,svg);await sharp(Buffer.from(svg)).png().toFile(pngPath);return pngPath;}
const slides=[
 {bg:C.cream,title:['Tu Instagram','atrae visitas.','¿Tu web facilita','las consultas?'],body:['Haz que el siguiente paso','sea fácil de encontrar.'],tag:'DE LA VISITA A LA CONVERSACIÓN',n:1},
 {bg:C.lavender,title:['Primero:','que entiendan','qué haces.'],body:['Explica a quién ayudas','y qué servicio ofreces.','Evita los mensajes genéricos.'],tag:'01 / UNA PROPUESTA CLARA',n:2},
 {bg:C.mint,title:['Después:','resuelve las','dudas básicas.'],body:['Qué incluye tu servicio.','Cómo trabajas.','Cómo pueden contactarte.'],tag:'02 / INFORMACIÓN ÚTIL',n:3},
 {bg:C.pink,title:['Y luego:','un próximo','paso visible.'],body:['Un botón de contacto claro.','Un formulario breve.','Un enlace que sí funcione.'],tag:'03 / CONTACTO SIN VUELTAS',n:4},
 {bg:C.cream,title:['Haz esta prueba','desde tu','celular.'],body:['¿Se entiende qué ofreces?','¿Se encuentra cómo consultar?','¿El enlace lleva al lugar correcto?'],tag:'TU REVISIÓN DE HOY',n:5},
 {bg:C.purple,title:['Tu próxima','consulta necesita','un camino claro.'],body:['¿Quieres ordenar ese recorrido?','Escríbeme «WEB» por DM','y cuéntame qué hace tu negocio.'],tag:'HABLEMOS DE TU PROYECTO',n:6,light:true}
];
for(const s of slides){const ink=s.light?C.cream:C.ink;const y=292;let inside=text([s.tag],80,208,19,ink,700)+text(s.title,80,y,86,ink,700,1.13);const bodyY=s.n===1?790:684;inside+=text(s.body,80,bodyY,40,ink,400,1.45);
 if(s.n===1){inside+=pill('Perfil',80,988,195,C.lavender,C.purple)+text(['→'],300,1038,48,C.purple)+pill('Web',370,988,175,C.mint,C.purple)+text(['→'],572,1038,48,C.purple)+pill('Consulta',650,988,270,C.pink,C.purple);inside+=text(['Un recorrido simple, pensado para tu cliente.'],80,1120,27,C.muted);}
 if(s.n===2){inside+=`<rect x="80" y="920" width="920" height="230" rx="25" fill="${C.cream}"/>`+text(['EN VEZ DE: «SOLUCIONES INTEGRALES»'],112,974,20,C.muted,700)+text(['Di qué haces, para quién','y cómo pueden comenzar.'],112,1036,40,C.ink,700,1.3);}
 if(s.n===3){inside+=['Servicios','Proceso','Contacto'].map((v,i)=>pill(v,80+i*305,990,280,C.cream,C.purple)).join('');}
 if(s.n===4){inside+=pill('Consultar por mi proyecto  ↗',80,976,630,C.purple,C.cream)+text(['Elige una acción principal para esa página.'],80,1110,28,C.muted);}
 if(s.n===5){inside+=`<rect x="80" y="975" width="920" height="145" rx="24" fill="${C.lavender}"/>`+text(['Si algo no está claro,','ya encontraste qué mejorar primero.'],110,1032,34,C.ink,700,1.35);}
 if(s.n===6){inside+=pill('WEB → mensajes directos',80,1010,595,C.cream,C.purple);}
 await save(`01-carrusel/${String(s.n).padStart(2,'0')}`,base(1350,s.bg,inside,`${String(s.n).padStart(2,'0')} / 06`,s.light));}
const scenes=[
 {bg:C.lavender,seconds:4,title:['¿Tu negocio','necesita','una web?'],body:['Estas 3 señales','te pueden orientar.'],label:'ANTES DE DECIDIR',visual:'03'},
 {bg:C.cream,seconds:5,title:['Respondes','las mismas','preguntas.'],body:['Tus servicios, tu proceso','y cómo consultar podrían','estar en un solo lugar.'],label:'SEÑAL 01',visual:'Servicios → Dudas → Contacto'},
 {bg:C.mint,seconds:5,title:['La información','queda repartida','entre tus posts.'],body:['Cuesta encontrar qué ofreces','y cuál es el siguiente paso.'],label:'SEÑAL 02',visual:'Todo claro. En un lugar.'},
 {bg:C.pink,seconds:5,title:['Quieres un','espacio propio','para tu negocio.'],body:['Una web con tu identidad','y una dirección fácil','de compartir.'],label:'SEÑAL 03',visual:'Tu negocio / Tu espacio'},
 {bg:C.cream,seconds:5,title:['Empieza por','lo que tu cliente','necesita saber.'],body:['Qué haces.','Para quién.','Cómo puede contactarte.'],label:'ANTES DEL DISEÑO',visual:'Claridad → Contacto'},
 {bg:C.purple,seconds:5,title:['¿Te pasa','alguna de','estas señales?'],body:['Escríbeme «WEB» por DM','y cuéntame qué hace','tu negocio.'],label:'CONVERSEMOS',visual:'Tidy Studio',light:true}
];
const clips=[];let time=0;const srt=[];
function timestamp(seconds){const ms=Math.round(seconds*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;}
for(let i=0;i<scenes.length;i++){const s=scenes[i],ink=s.light?C.cream:C.ink;let inside=text([s.label],96,414,24,ink,700)+text(s.title,96,562,84,ink,700,1.15)+text(s.body,96,956,43,ink,400,1.4);
 inside+=`<rect x="96" y="1230" width="795" height="125" rx="24" fill="${s.light?C.cream:C.lavender}"/>`+text([s.visual],126,1308,i===0?58:32,C.purple,700);
 inside+=scenes.map((_,j)=>`<rect x="${96+j*136}" y="1430" width="116" height="6" rx="3" fill="${ink}" opacity="${j<=i?'.8':'.18'}"/>`).join('');
 const png=await save(`02-reel/escenas/${String(i+1).padStart(2,'0')}`,base(1920,s.bg,inside,`${i+1} / 6`,s.light));
 const clip=path.join(root,'02-reel',`clip-${i+1}.mp4`);clips.push(clip);
 const result=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-loop','1','-framerate','30','-i',png,'-vf',`zoompan=z='1+0.00010*on':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1080x1920:fps=30,fade=t=in:st=0:d=0.15:color=${s.bg},format=yuv420p`,'-t',String(s.seconds),'-an','-c:v','libx264','-preset','veryfast','-crf','20','-threads','2',clip],{encoding:'utf8'});if(result.status!==0)throw new Error(result.stderr||result.error);
 srt.push(`${i+1}\n${timestamp(time)} --> ${timestamp(time+s.seconds)}\n${[...s.title,...s.body].join(' ')}\n`);time+=s.seconds;
}
await fs.writeFile(path.join(root,'02-reel','texto-en-pantalla.srt'),srt.join('\n'));
await fs.writeFile(path.join(root,'02-reel','secuencia.txt'),clips.map(p=>`file '${p.replaceAll('\\','/')}'`).join('\n'));
const final=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',path.join(root,'02-reel','secuencia.txt'),'-c','copy','-movflags','+faststart',path.join(root,'02-reel','tidy-3-senales.mp4')],{encoding:'utf8'});if(final.status!==0)throw new Error(final.stderr||final.error);
for(const clip of clips)await fs.unlink(clip);await fs.unlink(path.join(root,'02-reel','secuencia.txt'));
await save('02-reel/portada',base(1920,C.lavender,text(['PARA EMPRENDEDORES Y PROFESIONALES'],96,440,22,C.purple,700)+text(['3 señales','de que tu negocio','necesita una web'],96,670,83,C.ink,700,1.22)+pill('¿Te pasa alguna?',96,1190,400,C.purple,C.cream),'REEL / 01'));
const stories=[
 {bg:C.lavender,label:'UNA PREGUNTA PARA TU NEGOCIO',title:['Si alguien llega','hoy a tu perfil…'],body:['¿Encuentra qué ofreces','y cómo puede consultarte?'],bottom:'Añade una encuesta: «Sí, fácil» / «Podría mejorar»'},
 {bg:C.mint,label:'NUEVO CARRUSEL',title:['De una visita','a una','conversación.'],body:['3 cosas para revisar','en el recorrido de tu cliente.'],bottom:'Comparte aquí el carrusel desde Instagram.'},
 {bg:C.pink,label:'HABLEMOS DE TU WEB',title:['Tu negocio','merece un','camino claro.'],body:['Escríbeme «WEB» por DM','y cuéntame qué haces.'],bottom:'Tidy Studio / Desarrollo web'}
];
for(let i=0;i<stories.length;i++){const s=stories[i];await save(`03-historias/${String(i+1).padStart(2,'0')}`,base(1920,s.bg,text([s.label],96,420,22,C.purple,700)+text(s.title,96,600,84,C.ink,700,1.18)+text(s.body,96,1010,43,C.ink,400,1.4)+text(i===0?['¿SÍ O PODRÍA MEJORAR?']:i===1?['EN EL FEED DE TIDY STUDIO']:['WEB → MENSAJES DIRECTOS'],96,1460,25,C.purple,700),'HISTORIAS'));}
const thumbs=await Promise.all(slides.map(async(s,i)=>({input:await sharp(path.join(root,'01-carrusel',`${String(i+1).padStart(2,'0')}.png`)).resize(324,405).toBuffer(),left:(i%3)*344,top:Math.floor(i/3)*425})));
await sharp({create:{width:1012,height:830,channels:3,background:'#ded9e5'}}).composite(thumbs).png().toFile(path.join(root,'vista-carrusel.png'));
await fs.writeFile(path.join(root,'manifiesto.json'),JSON.stringify({project:'Tidy Growth Lab',batch:'01',posts:[{plannerId:'seed-1',format:'Carrusel',files:6,size:'1080x1350',status:'listo para revisión'},{plannerId:'seed-2',format:'Reel',file:'02-reel/tidy-3-senales.mp4',size:'1080x1920',seconds:time,fps:30,audio:false,status:'listo para revisión'}],note:'No equivale a publicado. No modifica localStorage ni métricas.'},null,2));
console.log(`Generado: ${root}. Reel ${time}s. Carrusel: 6 PNG. Historias: 3 PNG.`);
