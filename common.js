/* ===== Veust FitLog : code partagé par index.html, coach.html et stats.html ===== */
const KEY="veust_active_program_v6",BWK="veust_bodyweight",HK="veust_history",TK="veust_timer",IK="veust_ios";
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const lsGet=(k,d)=>{try{const v=localStorage.getItem(k);return v===null?d:v}catch(e){return d}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const lsDel=k=>{try{localStorage.removeItem(k)}catch(e){}};

/* ===== Programmes enregistrés ===== */
const S=(n,w,r,u="reps")=>Array.from({length:n},(_,i)=>{const R=[].concat(r);return{weight:w,reps:R[i]??R[0],unit:u,done:false}});
const X=(name,muscle,animType,restSec,note,sets)=>({name,muscle,animType,restSec,note,sets});
const PROGRAMS={
  pull:{label:"Pull #1",make:()=>({title:"Pull #1 (Dos, Trapèzes, Biceps - 3 Séries)",exercises:[
    X("Vélo d'appartement (Échauffement)","Cardio & Montée en température","bike",0,"Pédalage souple pour lubrifier les articulations.",S(1,0,10,"min")),
    X("Tirage vertical poitrine","Grand Dorsal (Largeur)","lat_pull",90,"Tire vers les clavicules en resserrant les omoplates. Monte à 50 kg sur les séries 2 et 3 si c'est facile.",S(3,45,[12,12,10])),
    X("Rowing assis (Appui ventral)","Dos (Épaisseur & Rhomboïdes)","row_pull",90,"Poitrine bien calée contre le coussin, tire les coudes en arrière.",S(3,45,[12,12,10])),
    X("Shrugs assis aux haltères","Trapèzes supérieurs","shrug",60,"Assis dos droit, hausse les épaules vers les oreilles, pause 1s en haut.",S(3,12,15)),
    X("Curl incliné assis haltères (Banc 60°)","Biceps (Chef long - Étirement)","incline_curl",60,"Dos et tête calés, coudes verticaux, monte sans élan et retiens la descente.",S(3,8,[12,12,10])),
    X("Curl marteau assis haltères","Biceps (Brachial & Avant-bras)","hammer",60,"Prise neutre (paumes face à face), garde les coudes collés au buste.",S(3,8,[12,12,10])),
    X("Inclinaisons latérales avec haltère","Obliques (Taille)","side_bend",60,"Un haltère d'un seul côté (12 reps/côté). Engage le transverse et redresse sur le côté.",S(2,10,12)),
    X("Gainage ventral (Planche sur avant-bras)","Grand droit & Transverse","plank",60,"Sur genoux ou pointes de pieds, rétroverser le bassin et aspirer le nombril (25s).",S(2,0,25,"sec"))
  ]})},
  tour:{label:"Tour du Monde #4",make:()=>({title:"Tour du Monde #4 (3 Séries)",exercises:[
    X("Vélo d'appartement (Échauffement)","Cardio & Mobilité","bike",0,"Pédalage régulier, sans résistance excessive.",S(1,0,12,"min")),
    X("Planche sur les coudes (À frais)","Transverse & Abdominaux profonds","plank",60,"Placée avant les charges pour protéger les épaules.",S(3,0,35,"sec")),
    X("Leg Extension assis","Quadriceps","leg_ext",90,"Contrôle la descente, dos plaqué au fond du siège.",S(3,30,12)),
    X("Leg Curl assis","Ischio-jambiers","leg_curl",90,"Bassin bien calé, tire avec l'arrière des cuisses.",S(3,30,15)),
    X("Développé poitrine machine","Pectoraux","chest_push",90,"Prise neutre, expire en poussant en rentrant le ventre.",S(3,30,[15,15,12])),
    X("Rowing assis (Appui ventral)","Dos (Épaisseur)","row_pull",90,"Poitrine contre le coussin, coudes tirés en arrière.",S(3,30,15)),
    X("Tirage vertical poitrine","Grand Dorsal (Largeur)","lat_pull",90,"Tire vers les clavicules en resserrant les omoplates.",S(3,30,12)),
    X("Développé épaules assis machine","Épaules (Deltoïdes & volume)","shoulder",90,"Prise neutre, 3 secondes de contrôle à la descente.",S(3,15,12)),
    X("Curl au pupitre","Biceps","curl",60,"Bras verrouillés sur le pupitre, isolation stricte.",S(3,10,[10,10,8])),
    X("Kickback Triceps ou Extension 1 bras","Triceps","triceps",60,"Coudes fixes le long du buste, extension nette.",S(3,5,15)),
    X("Pont fessier avec serrage adducteurs","Fessiers & Plancher pelvien","bridge",60,"Serre le bloc entre les genoux 1 sec en haut.",S(3,0,12))
  ]})}
};

/* Animation choisie automatiquement d'après le nom de l'exercice */
const AUTO=[
  [/shrug|haussement/i,"shrug"],
  [/marteau|hammer/i,"hammer"],
  [/curl.*inclin|inclin.*curl/i,"incline_curl"],
  [/inclinaisons?\s+lat|side\s*bend|flexions?\s+lat/i,"side_bend"]
];
function fixTypes(p){
  p.exercises.forEach(e=>{const m=AUTO.find(a=>a[0].test(e.name||""));if(m)e.animType=m[1]});
  return p;
}
function normProg(p){
  return fixTypes({
    title:p.title||p.name||"Séance personnalisée",
    exercises:p.exercises.map(e=>({
      name:e.name,muscle:e.muscle||"",animType:e.animType||"chest_push",
      restSec:e.restSec!==undefined?e.restSec:90,note:e.note||e.notes||"",
      sets:(e.sets||[]).map(s=>({weight:parseFloat(s.weight)||0,reps:parseInt(s.reps)||12,unit:s.unit||"reps",done:Boolean(s.done||s.completed)}))
    }))
  });
}

/* ===== Séance courante, poids, historique local ===== */
function getProg(){
  try{const s=lsGet(KEY,null);if(s)return fixTypes(JSON.parse(s))}catch(e){}
  return fixTypes(PROGRAMS.pull.make());
}
function saveProg(p){lsSet(KEY,JSON.stringify(p));refreshHeader()}
function calcVol(p){
  let t=0;
  (p.exercises||[]).forEach(e=>(e.sets||[]).forEach(s=>{if(s.done&&s.unit!=="sec"&&s.unit!=="min")t+=(+s.weight||0)*(+s.reps||0)}));
  return t;
}
const getBW=()=>lsGet(BWK,"109.5");
const setBW=v=>lsSet(BWK,v);

const fmtSet=s=>s.unit==="sec"?`${s.reps}s`:s.unit==="min"?`${s.reps} min @ ${s.weight}kg`:`${s.reps} @ ${s.weight}kg`;
function sessionFromProg(p,note){
  const s={
    date:new Date().toLocaleDateString("fr-CH"),
    title:p.title,
    bodyweight:parseFloat(getBW())||undefined,
    tonnage:calcVol(p),
    exercises:p.exercises.filter(e=>e.sets.some(x=>x.done)).map(e=>({name:e.name,summary:e.sets.filter(x=>x.done).map(fmtSet).join(", ")}))
  };
  if(note)s.note=note;
  return s;
}
function mdFromProg(p){
  let md=`### Bilan Séance du ${new Date().toLocaleDateString("fr-CH")} - ${p.title}\n- **Poids :** ${getBW()} kg\n- **Volume total :** ${calcVol(p)} kg\n\n`;
  p.exercises.forEach(ex=>{
    const d=ex.sets.filter(s=>s.done);
    if(d.length)md+=`- **${ex.name}** : ${d.length} séries (${d.map(s=>`${s.reps}${s.unit==="sec"?"s":s.unit==="min"?"min":""} @${s.weight}kg`).join(", ")})\n`;
  });
  return md;
}
function getHist(){try{return JSON.parse(lsGet(HK,"[]"))||[]}catch(e){return[]}}
function addHist(s){const h=getHist();h.push(s);lsSet(HK,JSON.stringify(h))}

/* ===== Chrono partagé : persistant entre les pages, écran maintenu allumé ===== */
let ti=null,tEnd=0,tLabel="Repos",tCb=null,ac=null,wl=null;
let iosOn=lsGet(IK,"0")==="1";
function setIos(){iosOn=!iosOn;lsSet(IK,iosOn?"1":"0");if($("iosBtn"))showIos()}
function showIos(){$("iosBtn").innerText="Raccourci iOS Pause90 : "+(iosOn?"ON (quitte la page)":"OFF (reste sur la page)")}

function triggerShortcut(sec){
  const back=encodeURIComponent(location.href.split("#")[0]);
  location.href="shortcuts://x-callback-url/run-shortcut?name=Pause90&input=text&text="+sec+"&x-success="+back+"&x-cancel="+back+"&x-error="+back;
}
async function lock(){
  try{if("wakeLock" in navigator&&!wl){wl=await navigator.wakeLock.request("screen");wl.addEventListener("release",()=>{wl=null})}}catch(e){}
}
function unlock(){try{wl&&wl.release()}catch(e){}wl=null}

document.addEventListener("touchstart",()=>{
  try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();ac.resume()}catch(e){}
},{passive:true});

function beep(){
  try{
    for(let i=0;i<3;i++){
      const o=ac.createOscillator(),g=ac.createGain(),t0=ac.currentTime+i*.4;
      o.connect(g);g.connect(ac.destination);o.frequency.value=880;g.gain.value=.25;o.start(t0);o.stop(t0+.25);
    }
  }catch(e){}
  try{navigator.vibrate&&navigator.vibrate([200,100,200])}catch(e){}
  const b=$("tbar");if(b){b.classList.remove("flash");void b.offsetWidth;b.classList.add("flash")}
}
function tick(){
  if(!tEnd)return;
  const d=$("td"),r=Math.max(0,Math.ceil((tEnd-Date.now())/1000));
  d.innerText=String(Math.floor(r/60)).padStart(2,"0")+":"+String(r%60).padStart(2,"0");
  if(r<=0){
    clearInterval(ti);tEnd=0;lsDel(TK);unlock();
    d.innerText="FINI !";beep();
    const f=tCb;tCb=null;f&&f();
  }
}
function run(){
  clearInterval(ti);
  const d=$("td"),l=$("tl"),ex=tLabel==="Exercice";
  l.innerText=tLabel+" :";
  l.className="t-lbl"+(ex?" orange":"");
  d.className="t-val"+(ex?" orange":"");
  tick();ti=setInterval(tick,250);
}
function timer(sec,label,runIOS,cb){
  tEnd=Date.now()+sec*1000;tLabel=label;tCb=cb||null;
  lsSet(TK,JSON.stringify({tEnd,label}));
  run();lock();
  if(runIOS&&iosOn)triggerShortcut(sec); // synchrone, dans le tap, en dernier
}
function stopT(){
  clearInterval(ti);tEnd=0;tCb=null;lsDel(TK);unlock();
  $("tl").innerText="Chrono :";$("td").innerText="01:30";
}

/* ===== Header + navigation communs ===== */
function refreshHeader(){
  const p=getProg();
  $("ttl").innerText=p.title;
  $("vol").innerText=calcVol(p).toLocaleString("fr-CH")+" kg";
}
function mountShell(active){
  document.body.insertAdjacentHTML("afterbegin",`
  <header>
    <div class="h-top">
      <div><div class="h-title">VEUST FITLOG</div><div class="h-sub" id="ttl"></div></div>
      <div><span class="h-vol-lbl">Tonnage</span><span class="h-vol-val" id="vol">0 kg</span></div>
    </div>
    <div class="h-bot" id="tbar">
      <div class="t-wrap"><span id="tl" class="t-lbl">Chrono :</span><span id="td" class="t-val">01:30</span></div>
      <div class="t-btns">
        <button onclick="timer(60,'Repos',true)" class="btn-t">60s</button>
        <button onclick="timer(90,'Repos',true)" class="btn-t btn-t90">90s</button>
        <button onclick="stopT()" class="btn-t btn-stop">Stop</button>
      </div>
    </div>
  </header><div class="spacer"></div>`);
  const nav=[["index.html","🏋️‍♂️","Séance"],["coach.html","📣","Coach"],["stats.html","📊","Stats"]];
  document.body.insertAdjacentHTML("beforeend","<nav>"+nav.map(n=>`<a href="${n[0]}"${n[0]===active?' class="active"':""}><span class="ico">${n[1]}</span>${n[2]}</a>`).join("")+"</nav>");
  refreshHeader();
  try{const t=JSON.parse(lsGet(TK,"null"));if(t&&t.tEnd>Date.now()){tEnd=t.tEnd;tLabel=t.label;run();lock()}}catch(e){}
  document.addEventListener("visibilitychange",()=>{if(!document.hidden){tick();if(tEnd)lock()}});
}
