/* ===== Veust FitLog — animations.js =====
   Moteur SVG externe : bonhomme articulé (cinématique inverse) + bibliothèque d'exercices.

   Utilisation :
     Anim.svg(id, big)                 -> chaîne SVG (class "fig-big" ou "fig-thumb"), animée automatiquement
     Anim.resolve(nom, animType, muscle, materiel) -> id de l'animation la plus adaptée
     Anim.ids() / Anim.label(id) / Anim.group(id) / Anim.has(id)

   Ajouter un exercice = ajouter une entrée dans X (plus bas) :
     n : nom affiché, g : groupe, v : "front" pour une vue de face (sinon profil, regard vers la droite)
     sc : échelle (figures debout), k / e : sens de pliage genou / coude, hand : "grip" | "db" | "bar" | "none"
     eq : matériel fixe (derrière), eq2 : matériel fixe (devant), dl : matériel mobile (câbles, leviers)
     hl : muscles en surbrillance [segment, début, fin] — segments : to th sh ua fa (+ th2 sh2 ua2 fa2)
     P(p,t) : la pose. p va de 0 (départ) à 1 (contraction). Points : h hanche, s épaule, a main, f pied,
              + optionnels h2 s2 a2 f2 (2e côté), kn kn2 el el2 (genou / coude imposés), ft (pointe du pied), hd (tête)
   Repère : 120 x 90, sol à y = 79. */
const Anim=(()=>{
"use strict";
const D=Math.PI/180,cos=Math.cos,sin=Math.sin;
const V=(a,b,p)=>[a[0]+(b[0]-a[0])*p,a[1]+(b[1]-a[1])*p];
const pol=(c,r,deg)=>[c[0]+r*cos(deg*D),c[1]+r*sin(deg*D)];
const mir=a=>[120-a[0],a[1]];

/* ---------- Matériel ---------- */
const EQ='fill="url(#gEq)"',EQS='stroke="url(#gEq)" stroke-linecap="round" fill="none"',CAB="#94a3b8";
const rect=(x,y,w,h,r=2)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ${EQ}/>`;
const line=(x1,y1,x2,y2,w=4)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="${w}" ${EQS}/>`;
const ring=(x,y,r,w=2)=>`<circle cx="${x}" cy="${y}" r="${r}" stroke-width="${w}" ${EQS}/>`;
const SEAT=rect(20,61,32,5,2.5)+rect(17,22,6,42,3);
const FSEAT=rect(48,20,24,42,5)+rect(42,60,36,6,3);
const FBENCH=rect(49,14,22,50,5)+rect(44,60,32,6,3);
const BENCH=rect(16,59,52,5,2.5)+rect(22,64,4,15)+rect(58,64,4,15);
const POST=x=>rect(x,2,4,77,2);
const RECL=line(11,36,27,68,6)+line(27,68,42,68,5)+line(46,75,92,60,2.5);

/* Bases de pose */
const SIT={h:[30,58],s:[32,34],f:[48,78]};
const FS={s:[51,35],s2:[69,35],h:[55,59],h2:[65,59],kn:[51,65],kn2:[69,65],f:[52,78],f2:[68,78]};
const SF={h:[56,40],h2:[64,40],kn:[55.5,59],kn2:[64.5,59],f:[55,78],f2:[65,78]};

/* ---------- Bibliothèque d'exercices ---------- */
const X={
/* Cardio */
bike:{n:"Vélo d'appartement",g:"Cardio",hl:[["th",0,1]],
  eq:ring(52,68,9.5,2.5)+rect(30,55,15,4,2)+line(72,38,72,68,3)+line(72,38,66,36,3),
  P:(p,t)=>({h:[40,52],s:[56,32],a:[70,39],f:pol([52,68],9,t*290),f2:pol([52,68],9,t*290+180)})},
treadmill:{n:"Tapis de course / Elliptique",g:"Cardio",sc:.9,hl:[["th",0,1],["sh",.1,.7]],
  eq:line(18,79,102,70,4)+line(99,70,105,36,3)+line(105,36,94,38,3),
  P:(p,t)=>{const q=t*4.2,gy=x=>79-(x-18)*.107,
    st=a=>{const x=57+13*sin(a);return[x,gy(x)-2-Math.max(0,cos(a))*5]},b=Math.abs(sin(q))*1.3;
    return{h:[55,41-b],s:[60,18-b],f:st(q),f2:st(q+Math.PI),a:[60-10*sin(q),42-b],a2:[60+10*sin(q),42-b]}}},

/* Jambes */
leg_press:{n:"Presse à cuisses",g:"Jambes",hl:[["th",0,1]],eq:RECL,
  dl:o=>[[o.f[0]-.4,o.f[1]-9.6,o.f[0]+5.4,o.f[1]+9.6,3.5]],
  P:p=>({h:[30,62],s:[17,41],a:[31,62],f:[54+13*p,53-4*p]})},
leg_ext:{n:"Leg extension",g:"Jambes",hl:[["th",0,1]],eq:SEAT,
  P:p=>({h:[35,57],s:[34,33],a:[37,59],f:pol([55,57],20,90*(1-p))})},
leg_curl:{n:"Leg curl assis",g:"Jambes",hl:[["th",.1,1]],eq:SEAT,
  P:p=>({h:[35,57],s:[34,33],a:[37,59],f:pol([55,57],20,15+85*p)})},
leg_curl_lying:{n:"Leg curl allongé",g:"Jambes",k:1,e:-1,hl:[["th",.1,1]],
  eq:rect(18,59,62,5,2.5)+rect(26,64,4,15)+rect(68,64,4,15),
  P:p=>({h:[56,54],s:[32,54],a:[24,68],f:pol([76,55],20,5-110*p)})},
adductor:{n:"Adducteurs assis",g:"Jambes",v:"front",e:1,e2:-1,hand:"none",hl:[["th",.2,1],["th2",.2,1]],eq:FSEAT,
  dl:(o)=>[[o.kn[0]+4.5,o.kn[1]-5,o.kn[0]+4.5,o.kn[1]+5,3],[o.kn2[0]-4.5,o.kn2[1]-5,o.kn2[0]-4.5,o.kn2[1]+5,3]],
  P:p=>{const kn=V([36,64],[54,64],p),f=V([34,78],[54,78],p);
    return{...FS,kn,kn2:mir(kn),f,f2:mir(f),a:[45,61],a2:[75,61]}}},
abductor:{n:"Abducteurs assis",g:"Jambes",v:"front",e:1,e2:-1,hand:"none",hl:[["th",0,.55],["th2",0,.55]],eq:FSEAT,
  dl:(o)=>[[o.kn[0]-4.5,o.kn[1]-5,o.kn[0]-4.5,o.kn[1]+5,3],[o.kn2[0]+4.5,o.kn2[1]-5,o.kn2[0]+4.5,o.kn2[1]+5,3]],
  P:p=>{const kn=V([54,64],[36,64],p),f=V([54,78],[34,78],p);
    return{...FS,kn,kn2:mir(kn),f,f2:mir(f),a:[45,61],a2:[75,61]}}},
calf_press:{n:"Mollets à la presse",g:"Jambes",hl:[["sh",.05,.6]],eq:RECL,
  dl:o=>[[o.ft[0]+1.6,o.ft[1]-8,o.ft[0]+5.6,o.ft[1]+10,3.5]],
  P:p=>({h:[30,62],s:[17,41],a:[31,62],f:[67,50],ft:V([68.5,43.5],[72.8,45.6],p)})},
calf_seated:{n:"Mollets assis",g:"Jambes",hl:[["sh",.1,.7]],eq:SEAT,
  dl:(o,p,g)=>[[g.K[0]-7,g.K[1]-5.5,g.K[0]+5,g.K[1]-5.5,4]],
  P:p=>({h:[32,58],s:[34,34],a:[49,50-4*p],f:[52+2*p,77-4.5*p],ft:[59,78]})},
bridge:{n:"Pont fessier",g:"Fessiers",e:-1,hand:"none",hl:[["th",0,.65],["to",0,.25]],
  dl:(o,p,g)=>[[g.K[0]+2,g.K[1]+4,g.K[0]+2.01,g.K[1]+4,7,"#f59e0b"]],
  P:p=>({h:pol([22,73],24,-28*p),s:[22,73],a:[46,76],f:[64,77]})},
hip_thrust:{n:"Hip thrust",g:"Fessiers",e:-1,hand:"none",hl:[["th",0,.55],["to",0,.2]],eq:rect(9,57,20,22,3),
  dl:o=>[[o.h[0]-4,o.h[1]-7,o.h[0]+6,o.h[1]-7,4]],
  P:p=>{const s=[28,54],h=pol(s,24,38-35*p);return{h,s,a:[h[0]+2,h[1]-7],f:[71,78]}}},

/* Pectoraux */
chest_push:{n:"Développé poitrine machine",g:"Pectoraux",hl:[["to",.5,.95],["ua",0,.55]],eq:SEAT,
  dl:o=>[[o.a[0],o.a[1]-6,o.a[0],o.a[1]+6,3]],
  P:p=>({...SIT,a:[40+30*p,38]})},
incline_press:{n:"Développé incliné",g:"Pectoraux",hl:[["to",.6,.97],["ua",0,.5]],
  eq:line(26,66,14,32,6)+rect(24,64,22,5,2.5),
  dl:o=>[[o.a[0]-4,o.a[1]-4,o.a[0]+4,o.a[1]+4,3]],
  P:p=>({h:[30,60],s:[20,38],a:[27+13*p,36-15*p],f:[50,78]})},
decline_press:{n:"Développé décliné haltères",g:"Pectoraux",hand:"db",hl:[["to",.5,.95]],
  eq:line(18,66,58,50,5)+rect(28,64,4,15)+rect(54,54,4,25)+ring(70,52,3,2),
  P:p=>({h:[48,46],s:[26,56],a:[30-3*p,44-16*p],f:[68,64]})},
incline_fly:{n:"Écarté incliné haltères",g:"Pectoraux",v:"front",e:-1,e2:1,hand:"db",hl:[["to",.55,.95]],eq:FBENCH,
  P:p=>{const a=[51+25*cos((185-85*p)*D),35-25*sin((185-85*p)*D)];return{...FS,a,a2:mir(a)}}},
pec_deck:{n:"Pec deck / Butterfly",g:"Pectoraux",v:"front",e:-1,e2:1,hl:[["to",.55,.95]],eq:FSEAT,
  dl:o=>[[o.a[0],o.a[1]-7,o.a[0],o.a[1]+7,3],[o.a2[0],o.a2[1]-7,o.a2[0],o.a2[1]+7,3]],
  P:p=>{const a=V([27,36],[56,39],p);return{...FS,a,a2:mir(a),al:14-6.5*p}}},
cable_fly:{n:"Écarté à la poulie",g:"Pectoraux",v:"front",e:-1,e2:1,hl:[["to",.55,.95]],eq:FSEAT+POST(4)+POST(112),
  dl:o=>[[8,8,o.a[0],o.a[1],1.2,CAB],[112,8,o.a2[0],o.a2[1],1.2,CAB]],
  P:p=>{const a=V([27,27],[56,46],p);return{...FS,a,a2:mir(a),al:14-4*p}}},

/* Dos */
lat_pull:{n:"Tirage vertical",g:"Dos",hl:[["ua",0,1],["to",.5,1]],eq:SEAT+ring(54,3,2.5,2),eq2:rect(36,52,16,3.5,1.5),
  dl:o=>[[54,3,o.a[0],o.a[1],1.2,CAB],[o.a[0]-3.5,o.a[1],o.a[0]+3.5,o.a[1],3]],
  P:p=>({h:[38,60],s:[40-2*p,36],a:[52+3*p,12+18*p],f:[52,78]})},
lat_pull_close:{n:"Tirage vertical prise serrée",g:"Dos",hl:[["ua",0,1],["to",.45,.95]],eq:SEAT+ring(54,3,2.5,2),eq2:rect(36,52,16,3.5,1.5),
  dl:o=>[[54,3,o.a[0],o.a[1]-3,1.2,CAB],[o.a[0],o.a[1]-3,o.a[0]-2.5,o.a[1]+1,2.2],[o.a[0],o.a[1]-3,o.a[0]+2.5,o.a[1]+1,2.2]],
  P:p=>({h:[38,60],s:[40-5*p,36+1.5*p],a:[52-2*p,13+19*p],f:[52,78]})},
row_pull:{n:"Rowing assis appui ventral",g:"Dos",hl:[["to",.45,1]],eq:SEAT+line(41,52,41,79,3),eq2:rect(38,34,4.5,18,2),
  dl:o=>[[o.a[0],o.a[1]-5,o.a[0],o.a[1]+5,3]],
  P:p=>({...SIT,s:[32-2*p,34],a:[72-22*p,41]})},
row_high:{n:"Rowing assis prise pronation",g:"Dos",e:-1,hl:[["to",.65,1],["ua",0,.4]],eq:SEAT+line(41,52,41,79,3),eq2:rect(38,36,4.5,16,2),
  dl:o=>[[o.a[0]-4,o.a[1],o.a[0]+4,o.a[1],3]],
  P:p=>({...SIT,s:[32-2*p,34],a:[72-24*p,35]})},
cable_row:{n:"Rowing à la poulie basse",g:"Dos",hl:[["to",.45,1]],
  eq:rect(20,66,28,5,2.5)+rect(32,71,4,8)+line(73,54,73,76,4)+ring(88,58,3,2)+rect(86,58,4,21),
  dl:o=>[[88,58,o.a[0],o.a[1],1.2,CAB],[o.a[0],o.a[1]-3.5,o.a[0],o.a[1]+3.5,3]],
  P:p=>{const b=(8-14*p)*D,h=[34,61];return{h,s:[h[0]+24*sin(b),h[1]-24*cos(b)],a:V([62,51],[45,50],p),f:[71,64]}}},
pullover:{n:"Pull-over à la poulie",g:"Dos",sc:.88,hl:[["to",.45,.9],["ua",0,.35]],eq:POST(104)+ring(103,3,2.5,2),
  dl:o=>[[103,3,o.a[0],o.a[1],1.2,CAB],[o.a[0]-3,o.a[1]-2,o.a[0]+3,o.a[1]+2,3]],
  P:p=>{const s=[55,18];return{h:[46,40],s,a:pol(s,27,-46+138*p),f:[48,78]}}},

/* Épaules & trapèzes */
shrug:{n:"Shrugs haltères",g:"Trapèzes",e:-1,hand:"db",hl:[["to",.75,1],["ua",0,.4]],eq:SEAT,
  P:p=>{const q=Math.min(1,p*1.5),sy=34-6*q;return{...SIT,s:[32,sy],a:[34,sy+27]}}},
shrug_machine:{n:"Shrugs machine",g:"Trapèzes",sc:.88,e:-1,hl:[["to",.75,1],["ua",0,.4]],eq:rect(94,28,5,51,2),
  dl:o=>[[o.a[0]-3,o.a[1],96,52,3]],
  P:p=>{const q=Math.min(1,p*1.5),sy=17-6*q;return{h:[55,40],s:[56,sy],a:[58,sy+27],f:[56,78]}}},
shoulder:{n:"Développé épaules machine",g:"Épaules",hl:[["ua",0,.65],["to",.75,1]],eq:SEAT,
  dl:o=>[[o.a[0]-5,o.a[1],o.a[0]+5,o.a[1],3]],
  P:p=>({...SIT,a:[44,30-22*p]})},
shoulder_db:{n:"Développé épaules haltères",g:"Épaules",v:"front",e:-1,e2:1,hand:"db",hl:[["ua",0,.45],["ua2",0,.45]],eq:FSEAT,
  P:p=>{const a=V([39,30],[53,9.5],p);return{...FS,a,a2:mir(a)}}},
lateral_raise:{n:"Élévations latérales haltères",g:"Épaules",v:"front",sc:.86,hand:"db",hl:[["ua",0,.45],["ua2",0,.45]],
  P:p=>{const th=(8+80*p)*D,s=[50,16],a=[s[0]-26*sin(th),s[1]+26*cos(th)],el=V(s,a,.5);
    return{...SF,s,s2:mir(s),a,a2:mir(a),el,el2:mir(el)}}},
lateral_raise_machine:{n:"Élévations latérales machine",g:"Épaules",v:"front",hl:[["ua",0,.5],["ua2",0,.5]],eq:FSEAT,
  dl:o=>[[o.el[0]-5,o.el[1]-2,o.el[0]+1,o.el[1]-5,3.5],[o.el2[0]+5,o.el2[1]-2,o.el2[0]-1,o.el2[1]-5,3.5]],
  P:p=>{const th=(15+70*p)*D,el=[51-13*sin(th),35+13*cos(th)],a=[el[0]+1,el[1]+7];
    return{...FS,el,el2:mir(el),a,a2:mir(a)}}},
rear_delt:{n:"Oiseau / Reverse pec deck",g:"Épaules",v:"front",e:-1,e2:1,hl:[["ua",0,.45],["ua2",0,.45]],eq:FSEAT,
  dl:o=>[[o.a[0],o.a[1]-7,o.a[0],o.a[1]+7,3],[o.a2[0],o.a2[1]-7,o.a2[0],o.a2[1]+7,3]],
  P:p=>{const a=V([55,38],[26,35],p);return{...FS,a,a2:mir(a),al:7.5+6.5*p}}},
face_pull:{n:"Face pull",g:"Épaules",sc:.88,hl:[["ua",0,.5],["to",.8,1]],eq:POST(104)+ring(103,3,2.5,2),
  dl:o=>[[103,3,o.a[0],o.a[1],1.2,CAB]],
  P:p=>({h:[44,40],s:[46,17],f:[44,78],el:V([59,11.5],[42,20],p),a:V([72,6],[53,11],p)})},

/* Biceps */
curl:{n:"Curl au pupitre",g:"Biceps",hl:[["ua",0,1]],eq:SEAT+line(36,40,48,54,5.5),
  P:p=>({h:[30,60],s:[34,36],a:pol([43,47],14,20-120*p),f:[48,78]})},
incline_curl:{n:"Curl incliné haltères",g:"Biceps",hand:"db",hl:[["ua",0,1],["fa",0,.4]],
  eq:line(28,66,10,36,7)+rect(24,64,20,4.5,2),
  P:p=>({h:[34,62],s:[22,41],a:pol([24,55],14,85-155*p),f:[56,78]})},
hammer:{n:"Curl marteau haltères",g:"Biceps",hand:"db",hl:[["ua",0,1],["fa",0,.5]],eq:SEAT,
  P:p=>({...SIT,a:pol([33,48],14,88-150*p)})},
cable_curl:{n:"Curl à la poulie basse",g:"Biceps",sc:.88,hl:[["ua",0,1]],eq:rect(88,38,4,41,2)+ring(88,75,2.5,2),
  dl:o=>[[88,75,o.a[0],o.a[1],1.2,CAB],[o.a[0]-3,o.a[1],o.a[0]+3,o.a[1],3]],
  P:p=>({h:[48,40],s:[49,17],a:pol([49,31],14,80-140*p),f:[48,78]})},

/* Triceps */
triceps:{n:"Kickback triceps",g:"Triceps",hand:["db","none"],hl:[["ua",0,1]],eq:rect(58,62,36,5,2.5)+rect(64,67,4,12)+rect(86,67,4,12),
  P:p=>({h:[38,50],s:[60,38],a:pol([47.7,44.7],14,80+95*p),a2:[68,60],f:[40,78]})},
pushdown:{n:"Extension triceps à la corde",g:"Triceps",sc:.88,hl:[["ua",0,1]],eq:POST(104)+ring(103,3,2.5,2),
  dl:o=>[[103,3,o.a[0],o.a[1]-3,1.2,CAB],[o.a[0],o.a[1]-3,o.a[0]-1,o.a[1]+4,2.2,"#e2e8f0"]],
  P:p=>({h:[46,40],s:[50,17],a:pol([50,31],14,-50+135*p),f:[46,78]})},
pushdown_single:{n:"Extension triceps 1 bras",g:"Triceps",sc:.88,hand:["grip","none"],hl:[["ua",0,1]],eq:POST(104)+ring(103,3,2.5,2),
  dl:o=>[[103,3,o.a[0],o.a[1],1.2,CAB]],
  P:p=>({h:[46,40],s:[50,17],a:pol([50,31],14,-50+135*p),a2:[43,40],f:[46,78]})},
dip_machine:{n:"Dips machine",g:"Triceps",hl:[["ua",0,1]],eq:SEAT+ring(62,50,2.5,2)+rect(60,50,4,29),
  dl:o=>[[o.a[0]-4,o.a[1],o.a[0]+8,o.a[1],3],[o.a[0]+8,o.a[1],62,50,2.5]],
  P:p=>({...SIT,a:[38,44+17*p]})},
skull_crusher:{n:"Barre au front",g:"Triceps",hand:"bar",hl:[["ua",0,1]],eq:BENCH,
  P:p=>({h:[54,53.5],s:[30,53.5],a:pol([30,39.5],14,-195+105*p),f:[70,78]})},

/* Abdos & gainage */
plank:{n:"Gainage ventral",g:"Abdos",hand:"none",hl:[["to",.05,.65]],
  P:p=>({h:[59,63+1.5*p],s:[35,61],a:[49,76],f:[95,77]})},
side_plank:{n:"Gainage latéral",g:"Abdos",hand:"none",hl:[["to",.05,.7]],
  P:p=>({h:[58,68-3*p],s:[34,62],el:[34,76],a:[46,77],a2:[35,34],f:[96,76]})},
side_bend:{n:"Inclinaisons latérales",g:"Abdos",v:"front",sc:.86,e:1,hand:["none","db"],hl:[["to",.05,.65]],
  P:p=>{const b=(-4+27*p)*D,c=cos(b),n=sin(b),sm=[60+24*n,40-24*c],s=[sm[0]-9*c,sm[1]-9*n],s2=[sm[0]+9*c,sm[1]+9*n];
    return{...SF,s,s2,a:[52,41],a2:[s2[0]+1.5,s2[1]+26],el2:[s2[0]+.8,s2[1]+13]}}},
crunch_machine:{n:"Crunch machine",g:"Abdos",hl:[["to",.15,.7]],eq:SEAT+rect(42,70,10,4,2),
  dl:o=>[[o.a[0],o.a[1]-4,o.a[0],o.a[1]+4,3],[o.a[0],o.a[1]-4,22,20,2]],
  P:p=>{const b=(2+30*p)*D,h=[30,58],s=[h[0]+24*sin(b),h[1]-24*cos(b)];return{h,s,a:[s[0]+9,s[1]-5],f:[46,77]}}},
torso_rotation:{n:"Rotation du buste",g:"Abdos",v:"front",e:-1,e2:1,hl:[["to",.1,.6]],eq:FSEAT,
  dl:o=>[[o.a[0]-6,o.a[1]-4,o.a2[0]+6,o.a2[1]-4,4]],
  P:p=>{const th=(2*p-1)*50*D,c=cos(th),n=sin(th);
    return{...FS,s:[60-9*c,35],s2:[60+9*c,35],a:[58+13*n,46],a2:[62+13*n,46],hd:[60+2.5*n,24]}}}
};

/* ---------- Cinématique ---------- */
function ik(a,b,l1,l2,k){
  const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.min(Math.hypot(dx,dy),l1+l2-.01)||.01,ux=dx/d,uy=dy/d;
  const x=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-x*x));
  return[a[0]+ux*x-uy*h*k,a[1]+uy*x+ux*h*k];
}
const nz=(v,d)=>v==null?d:v;
function compute(d,p,t){
  const o=d.P(p,t),h=o.h,s=o.s,h2=o.h2||h,s2=o.s2||s;
  const hm=[(h[0]+h2[0])/2,(h[1]+h2[1])/2],sm=[(s[0]+s2[0])/2,(s[1]+s2[1])/2];
  const al=o.al||d.al||14,ll=o.ll||d.ll||20,L={},C={};
  const K=o.kn||ik(h,o.f,ll,ll,nz(d.k,-1)),El=o.el||ik(s,o.a,al,al,nz(d.e,1));
  L.to=[hm,sm];L.th=[h,K];L.sh=[K,o.f];L.ua=[s,El];L.fa=[El,o.a];
  C.jk=K;C.je=El;C.ha=o.a;
  let K2,El2;
  if(o.f2){K2=o.kn2||ik(h2,o.f2,ll,ll,nz(d.k2,nz(d.k,-1)));L.th2=[h2,K2];L.sh2=[K2,o.f2];C.jk2=K2}
  if(o.a2){El2=o.el2||ik(s2,o.a2,al,al,nz(d.e2,nz(d.e,1)));L.ua2=[s2,El2];L.fa2=[El2,o.a2];C.je2=El2;C.ha2=o.a2}
  if(o.ft)L.ft=[o.f,o.ft];
  if(o.ft2&&o.f2)L.ft2=[o.f2,o.ft2];
  const vx=sm[0]-hm[0],vy=sm[1]-hm[1],n=Math.hypot(vx,vy)||1,hr=d.v==="front"?11:9.5;
  C.hd=o.hd||[sm[0]+vx/n*hr,sm[1]+vy/n*hr];
  const o2={...o,kn:K,kn2:K2,el:El,el2:El2};
  return{L,C,T:d.v==="front"?[s,s2,h2,h]:null,
    dl:d.dl?d.dl(o2,p,{K,El,K2,El2}):[],
    H:(d.hl||[]).map(m=>{const q=L[m[0]];return q?[V(q[0],q[1],m[1]),V(q[0],q[1],m[2])]:[[0,0],[0,0]]})};
}

/* ---------- Dessin ---------- */
const W={to:11,th:8.5,sh:6.5,ft:4.5,ua:6,fa:5};
const HAND={db:[4.6,"#f59e0b",""],bar:[4.4,"#64748b",' stroke="#cbd5e1" stroke-width="1"'],grip:[3,"#14b8a6",""]};
const f2=n=>Math.round(n*100)/100;
const xy=q=>`x1="${f2(q[0][0])}" y1="${f2(q[0][1])}" x2="${f2(q[1][0])}" y2="${f2(q[1][1])}"`;
const pts=T=>T.map(q=>f2(q[0])+","+f2(q[1])).join(" ");
function svg(id,big,p,t){
  if(!X[id])id="chest_push";
  const d=X[id],g=compute(d,p||0,t||0),front=d.v==="front",fG=big?' filter="url(#glow3d)"':"";
  const ln=(n,dark)=>{const q=g.L[n];if(!q)return"";const b=n.replace("2","");
    return`<line class="va-${n}" ${xy(q)} stroke="${dark?"#475569":b==="to"?"url(#gBody)":"url(#gLimb)"}" stroke-width="${W[b]-(dark?.5:0)}"/>`};
  const ci=(n,r,fill,ex)=>{const q=g.C[n];return q?`<circle class="va-${n}" cx="${f2(q[0])}" cy="${f2(q[1])}" r="${r}" fill="${fill}"${ex||""}/>`:""};
  const hand=(n,i)=>{const ty=Array.isArray(d.hand)?d.hand[i]:d.hand||"grip",h=HAND[ty];return h?ci(n,h[0],h[1],h[2]):""};
  const dls=g.dl.map(q=>`<line class="va-dl" ${xy([[q[0],q[1]],[q[2],q[3]]])} stroke="${q[5]||"url(#gEq)"}" stroke-width="${q[4]||2}" stroke-linecap="round"/>`).join("");
  const hls=g.H.map(q=>`<line class="va-hl" ${xy(q)} stroke="#ef4444" stroke-width="11"/>`).join("");
  const back=front?"":ln("th2",1)+ln("sh2",1)+ln("ft2",1)+ln("ua2",1)+ln("fa2",1);
  const torso=front?`<polygon class="va-tp" points="${pts(g.T)}" fill="url(#gBody)" stroke="url(#gBody)" stroke-width="7" stroke-linejoin="round"/>`:ln("to");
  const legs=(front?ln("th2")+ln("sh2")+ln("ft2"):"")+ln("th")+ln("sh")+ln("ft");
  const arms=(front?ln("ua2")+ln("fa2"):"")+ln("ua")+ln("fa");
  const joints=ci("jk",3.2,"#334155")+ci("je",2.6,"#475569")+(front?ci("jk2",3.2,"#334155")+ci("je2",2.6,"#475569"):"");
  const sc=d.sc?` transform="translate(60 79) scale(${d.sc}) translate(-60 -79)"`:"";
  return`<svg viewBox="0 0 120 90" class="${big?"fig-big":"fig-thumb"}" data-anim="${id}">
  <ellipse cx="60" cy="81" rx="44" ry="3.5" fill="rgba(0,0,0,0.6)"/>
  <line x1="8" y1="79" x2="112" y2="79" stroke="#1e293b" stroke-width="1.5"/>
  <g${sc}>${d.eq||""}${dls}
  <g stroke-linecap="round" fill="none"${fG}>${back}${torso}${legs}${hls}${arms}</g>
  ${joints}${ci("hd",7.2,"url(#gHead)",fG)}${hand("ha2",1)}${hand("ha",0)}${d.eq2||""}</g></svg>`;
}

/* ---------- Animation ---------- */
const NAMES=["to","th","sh","ft","ua","fa","th2","sh2","ft2","ua2","fa2"],DOTS=["jk","je","jk2","je2","hd","ha","ha2"];
const cache=typeof WeakMap!=="undefined"?new WeakMap():null;
function setL(el,q){el.setAttribute("x1",f2(q[0][0]));el.setAttribute("y1",f2(q[0][1]));el.setAttribute("x2",f2(q[1][0]));el.setAttribute("y2",f2(q[1][1]))}
function update(s,p,t){
  let c=cache.get(s);
  if(!c){
    const d=X[s.dataset.anim];if(!d)return;
    c={d,el:{},dl:s.querySelectorAll(".va-dl"),hl:s.querySelectorAll(".va-hl"),tp:s.querySelector(".va-tp")};
    NAMES.concat(DOTS).forEach(n=>{c.el[n]=s.querySelector(".va-"+n)});
    cache.set(s,c);
  }
  const g=compute(c.d,p,t);
  for(const n of NAMES){const e=c.el[n],q=g.L[n];if(e&&q)setL(e,q)}
  for(const n of DOTS){const e=c.el[n],q=g.C[n];if(e&&q){e.setAttribute("cx",f2(q[0]));e.setAttribute("cy",f2(q[1]))}}
  if(c.tp&&g.T)c.tp.setAttribute("points",pts(g.T));
  g.dl.forEach((q,i)=>{const e=c.dl[i];if(e)setL(e,[[q[0],q[1]],[q[2],q[3]]])});
  g.H.forEach((q,i)=>{const e=c.hl[i];if(e)setL(e,q)});
}
function loop(ms){
  const t=ms/1000,p=.5-.5*cos(t*2.1);
  document.querySelectorAll("svg[data-anim]").forEach(s=>{try{update(s,p,t)}catch(e){}});
  requestAnimationFrame(loop);
}
const DEFS=`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <linearGradient id="gBody" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="90"><stop offset="0" stop-color="#e2e8f0"/><stop offset="1" stop-color="#475569"/></linearGradient>
  <linearGradient id="gLimb" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="90"><stop offset="0" stop-color="#e2e8f0"/><stop offset="1" stop-color="#64748b"/></linearGradient>
  <linearGradient id="gEq" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="90"><stop offset="0" stop-color="#64748b"/><stop offset="1" stop-color="#1e293b"/></linearGradient>
  <radialGradient id="gHead" cx="0.35" cy="0.3" r="0.65"><stop offset="0" stop-color="#f8fafc"/><stop offset="0.55" stop-color="#94a3b8"/><stop offset="1" stop-color="#1e293b"/></radialGradient>
  <filter id="glow3d" filterUnits="userSpaceOnUse" x="0" y="0" width="120" height="90">
    <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="b"/><feOffset in="b" dy="2" result="o"/>
    <feComponentTransfer in="o" result="s"><feFuncA type="linear" slope="0.7"/></feComponentTransfer>
    <feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs></svg>`;
let booted=false;
function boot(){
  if(booted||typeof document==="undefined")return;
  if(!document.body){document.addEventListener("DOMContentLoaded",boot);return}
  booted=true;
  document.body.insertAdjacentHTML("afterbegin",DEFS);
  const st=document.createElement("style");
  st.textContent=".va-hl{animation:vaPulse 1.5s infinite ease-in-out}@keyframes vaPulse{0%,100%{opacity:.3}50%{opacity:.95}}";
  document.head.appendChild(st);
  requestAnimationFrame(loop);
}
boot();

/* ---------- Choix de l'animation d'après le nom de l'exercice ---------- */
const OLD=new Set(["bike","plank","leg_ext","leg_curl","chest_push","row_pull","lat_pull","shoulder","shrug","curl","incline_curl","hammer","triceps","side_bend","bridge"]);
const norm=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
function byName(n,m){
  const has=r=>r.test(n);
  if(!n)return null;
  if(has(/\bvelo\b|\bbike\b|cycl|spinning/))return"bike";
  if(has(/tapis|course|elliptique|marche|treadmill/))return"treadmill";
  if(has(/mollet|calf/))return has(/assis|seated/)&&!has(/presse/)?"calf_seated":"calf_press";
  if(has(/thrust/))return"hip_thrust";
  if(has(/pont|bridge|releve de bassin/))return"bridge";
  if(has(/presse|leg press/))return"leg_press";
  if(has(/leg ext|extension.*(jambe|cuisse|genou)/))return"leg_ext";
  if(has(/leg curl|curl.*(jambe|ischio)|ischio/))return has(/allonge|couche|lying/)?"leg_curl_lying":"leg_curl";
  if(has(/adducteur|adduction/))return"adductor";
  if(has(/abducteur|abduction/))return"abductor";
  if(has(/gainage|planche|plank/))return has(/lateral|cote|side/)?"side_plank":"plank";
  if(has(/inclinaison|side bend|flexion lat/))return"side_bend";
  if(has(/crunch|abdo/))return"crunch_machine";
  if(has(/rotation|torso|twist/))return"torso_rotation";
  if(has(/oiseau|rear delt|reverse|deltoide post/))return"rear_delt";
  if(has(/face pull/))return"face_pull";
  if(has(/ecarte|fly|butterfly|papillon|pec deck/))return has(/poulie|cable|vis a vis/)?"cable_fly":has(/inclin|haltere|couche/)?"incline_fly":"pec_deck";
  if(has(/pull ?over/))return"pullover";
  if(has(/shrug|haussement/))return has(/machine|debout/)||!has(/assis|haltere/)?"shrug_machine":"shrug";
  if(has(/elevation|lateral raise/))return has(/assis|machine/)?"lateral_raise_machine":"lateral_raise";
  if(has(/developpe|press|militaire|arnold/)){
    const sh=has(/epaule|shoulder|militaire|deltoid|arnold/)||(!has(/poitrine|chest|pec|couche|inclin|declin|triceps|dips/)&&/epaule|deltoid/.test(m));
    if(sh)return has(/haltere|militaire|arnold/)||!has(/epaule|shoulder|machine/)?"shoulder_db":"shoulder";
    if(has(/triceps|dips/))return"dip_machine";
    if(has(/declin/))return"decline_press";
    if(has(/inclin/))return"incline_press";
    return"chest_push";
  }
  if(has(/tirage|pulldown|lat pull|traction/))return has(/horizontal/)?"cable_row":has(/serre|neutre|close|supination/)?"lat_pull_close":"lat_pull";
  if(has(/rowing|\brow\b/))return has(/poulie|cable|basse/)?"cable_row":has(/pronation|large/)?"row_high":"row_pull";
  if(has(/kickback/))return"triceps";
  if(has(/curl/))return has(/marteau|hammer/)?"hammer":has(/inclin/)?"incline_curl":has(/poulie|cable/)?"cable_curl":"curl";
  if(has(/triceps|extension|dips|barre au front|skull/))
    return has(/front|skull|\bez\b|couche/)?"skull_crusher":has(/dips|assis/)?"dip_machine":has(/unilat|1 bras|un bras|une main/)?"pushdown_single":"pushdown";
  return null;
}
function byMuscle(m){
  if(!m)return null;
  const has=r=>r.test(m);
  if(has(/cardio|endurance/))return"bike";
  if(has(/pector|poitrine/))return"chest_push";
  if(has(/trapeze/))return"shrug";
  if(has(/dos|dorsal|rhomboid/))return"row_pull";
  if(has(/epaule|deltoid/))return"shoulder";
  if(has(/biceps|avant bras|brachial/))return"curl";
  if(has(/triceps/))return"pushdown";
  if(has(/quadri/))return"leg_ext";
  if(has(/ischio/))return"leg_curl";
  if(has(/mollet/))return"calf_press";
  if(has(/adducteur/))return"adductor";
  if(has(/fessier|hanche/))return"bridge";
  if(has(/oblique/))return"side_bend";
  if(has(/abdo|transverse|grand droit|gainage/))return"plank";
  if(has(/cuisse|jambe/))return"leg_press";
  return null;
}
/* Priorité : 1) animType précis (nouvel id), 2) nom de l'exercice, 3) animType générique, 4) muscle, 5) défaut */
function resolve(name,animType,muscle,equipment){
  if(X[animType]&&!OLD.has(animType))return animType;
  return byName(norm(name+" "+(equipment||"")),norm(muscle))||(X[animType]?animType:null)||byMuscle(norm(muscle))||"chest_push";
}

const api={svg,resolve,ids:()=>Object.keys(X),label:id=>X[id]?X[id].n:"",group:id=>X[id]?X[id].g:"",has:id=>!!X[id]};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
return api;
})();
