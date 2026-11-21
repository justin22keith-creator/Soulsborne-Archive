const DB=window.SOULSBORNE_DB;
if(!DB||DB.version!==2)throw new Error("Soulsborne catalog data failed to load.");
const $=id=>document.getElementById(id);
const VIEWS={areas:"Areas",bestiary:"Bestiary",npcs:"NPCs & questlines",collection:"Collection",trophies:"Trophies & achievements",builds:"Build planner"};
const CATEGORIES={areas:["Area"],bestiary:["Boss","Miniboss"],npcs:["NPC"],collection:["Weapon","Armor","Spell","Item","Ring","Shield"],trophies:["Trophy","Platinum"]};
const SECTION_MAP={areas:["areas"],bestiary:["bosses","minibosses"],npcs:["npcs","quests"],collection:["items","equipment","spells"],trophies:["trophies"]};
let selected=DB.games[0].id,view="areas",deferredInstall=null;
let state=loadState();
function loadState(){
  try{const s=JSON.parse(localStorage.getItem("soulsborne-v2")||"null");if(s&&s.version===2)return s;}catch{}
  const fresh={version:2,progress:{},favorites:{},notes:{},builds:{}};
  // Migrate personal data from the earlier starter build when it exists on this same site origin.
  try{
    const old=JSON.parse(localStorage.getItem("soulsborne-v1")||"null");
    if(old){fresh.progress=old.progress||{};fresh.notes=old.notes||{};fresh.builds=old.builds||{};}
  }catch{}
  return fresh;
}
function game(){return DB.games.find(g=>g.id===selected)}
function progress(){state.progress[selected]??={};return state.progress[selected]}
function favorites(){state.favorites[selected]??={};return state.favorites[selected]}
function gameRecords(){return DB.records.filter(r=>r.gameId===selected)}
function keyDlc(d){if(d==="base")return "Base game";const d0=game().dlcs.find(x=>x.id===d);return d0?d0.name:d}
function save(){localStorage.setItem("soulsborne-v2",JSON.stringify(state));renderDashboard()}
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2100)}
function pct(done,total){return total?Math.round(done/total*100):null}
function countTrack(track){const all=gameRecords().filter(r=>r.track===track);return {all,done:all.filter(r=>progress()[r.id]).length}}
function renderGames(){$("gameGrid").innerHTML=DB.games.map((g,i)=>`<button class="game-card ${g.id===selected?"active":""}" data-game="${g.id}"><span class="number">0${i+1}</span><strong>${g.name}</strong><small>${g.platform}</small></button>`).join("");$("gameGrid").querySelectorAll("[data-game]").forEach(b=>b.onclick=()=>{selected=b.dataset.game;view="areas";renderAll()})}
function renderDashboard(){
  const allContent=DB.records.filter(r=>r.track==="content");
  let overallDone=0;
  for(const r of allContent){if(state.progress?.[r.gameId]?.[r.id])overallDone++;}
  $("overallSummary").textContent=`SEVEN-GAME TRACKER · ${overallDone} / ${allContent.length} seeded content records checked · catalog still incomplete`;
  const g=game();$("selectedTitle").textContent=g.name;$("selectedEdition").textContent=g.edition;
  $("platformNote").textContent=g.platform+". Scope: "+g.edition+". The archive does not mix in original PS3 or non-selected platform-only variants.";
  const t=countTrack("trophy"),c=countTrack("content"),k=countTrack("collection");
  for(const [prefix,x] of [["trophy",t],["content",c],["collection",k]]){
    const value=pct(x.done,x.all.length);
    $(prefix+"Pct").textContent=value===null?"—":value+"%";
    $(prefix+"Bar").style.width=(value||0)+"%";
    $(prefix+"Count").textContent=x.all.length?`${x.done} / ${x.all.length} indexed records`:"Not populated yet";
  }
  $("coverageNote").textContent="CATALOG STATUS: INCOMPLETE. The content percentage measures only the "+c.all.length+" area, boss/miniboss and NPC index records currently shipped for this game—not total game completion. "+DB.coverage.bestiary;
  const expansions=DB.dlcs.filter(d=>d.gameId===selected);
  $("dlcGrid").innerHTML=expansions.map(d=>{
    const rs=gameRecords().filter(r=>r.dlc===d.id);
    const done=rs.filter(r=>progress()[r.id]).length;
    return `<article class="dlc-card"><strong>${esc(d.name)}</strong><small>${esc(d.details)}</small><div class="dlc-progress">${rs.length?`${done} / ${rs.length} indexed records checked`:"No individual expansion checklist records loaded yet"}</div></article>`;
  }).join("");
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function recordsForView(){
  const sections=SECTION_MAP[view]||[];
  const q=$("searchInput")?.value.toLowerCase().trim()||"";
  const dlc=$("dlcFilter")?.value||"all";
  const cat=$("categoryFilter")?.value||"all";
  const incomplete=$("incompleteOnly")?.checked||false;
  return gameRecords().filter(r=>{
    if(!sections.includes(r.section))return false;
    if(dlc!=="all"&&r.dlc!==dlc)return false;
    if(cat!=="all"&&r.category!==cat)return false;
    if(incomplete&&progress()[r.id])return false;
    if(q&&!(`${r.title} ${r.region} ${r.summary} ${r.category} ${keyDlc(r.dlc)}`.toLowerCase().includes(q)))return false;
    return true;
  }).sort((a,b)=>a.title.localeCompare(b.title));
}
function renderView(){
  $("viewTitle").textContent=VIEWS[view];
  $("filterTools").hidden=view==="builds"||view==="trophies"||view==="collection";
  $("filterBottom").hidden=view==="builds"||view==="trophies"||view==="collection";
  $("recordList").hidden=false;
  if(view==="builds"){renderBuildPlanner();return}
  if(view==="collection"){renderEmptyCatalog(DB.coverage.collection);return}
  if(view==="trophies"){renderEmptyCatalog(DB.coverage.trophies);return}
  const dlcs=DB.dlcs.filter(d=>d.gameId===selected);
  $("dlcFilter").innerHTML='<option value="all">Base + DLC</option><option value="base">Base game only</option>'+dlcs.filter(d=>!["none"].includes(d.id)).map(d=>`<option value="${esc(d.id)}">${esc(d.name)}</option>`).join("");
  $("categoryFilter").innerHTML='<option value="all">All types</option>'+(CATEGORIES[view]||[]).map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join("");
  $("searchInput").value="";$("categoryFilter").value="all";$("dlcFilter").value="all";$("incompleteOnly").checked=false;
  renderRecords();
}
function renderEmptyCatalog(message){
  $("recordCount").textContent="0 RECORDS";
  $("recordList").innerHTML=`<div class="empty-state"><strong>Research catalog not yet populated</strong><br>${esc(message)}<br><br>No placeholder entries or invented totals are used in this section.</div>`;
}
function renderRecords(){
  const rows=recordsForView();
  const total=gameRecords().filter(r=>(SECTION_MAP[view]||[]).includes(r.section));
  $("recordCount").textContent=`${rows.length} / ${total.length} SHOWN`;
  if(!rows.length){$("recordList").innerHTML=`<div class="empty-state"><strong>No records match these filters.</strong><br>Try another search term, expansion or completion filter. If the category has not been researched yet, it will be marked as pending.</div>`;return}
  $("recordList").innerHTML=rows.map(r=>`<article class="record">
    <input type="checkbox" data-check="${r.id}" aria-label="Mark ${esc(r.title)} complete" ${progress()[r.id]?"checked":""}>
    <div class="record-main"><button class="record-title" data-detail="${r.id}">${esc(r.title)}</button><small>${esc(r.region? r.region+" · ":"")}${esc(r.summary)}</small></div>
    <div class="record-side"><span class="tag">${esc(keyDlc(r.dlc))}</span><button class="fav-btn ${favorites()[r.id]?"active":""}" data-fav="${r.id}" aria-label="Toggle favorite">★</button></div>
  </article>`).join("");
  $("recordList").querySelectorAll("[data-check]").forEach(el=>el.onchange=()=>{progress()[el.dataset.check]=el.checked;save()});
  $("recordList").querySelectorAll("[data-fav]").forEach(el=>el.onclick=()=>{favorites()[el.dataset.fav]=!favorites()[el.dataset.fav];localStorage.setItem("soulsborne-v2",JSON.stringify(state));renderRecords();toast("Favorites updated")});
  $("recordList").querySelectorAll("[data-detail]").forEach(el=>el.onclick=()=>openDetail(el.dataset.detail));
}
function openDetail(id){
  const r=gameRecords().find(x=>x.id===id);if(!r)return;
  const url=r.source||game().sources?.[0]||"";
  $("dialogBody").innerHTML=`<div class="eyebrow">${esc(game().name)} · ${esc(keyDlc(r.dlc))}</div><h2 class="dialog-title">${esc(r.title)}</h2><div class="dialog-meta"><span>${esc(r.category)}</span><span>${esc(r.status)}</span>${r.region?`<span>${esc(r.region)}</span>`:""}</div><p class="dialog-copy">${esc(r.summary)}</p><p class="dialog-copy"><strong>Research status:</strong> This entry is an index record. A fully verified entry still needs its detailed route/acquisition steps, edition notes and cross-links audited.</p><div class="dialog-actions">${url?`<a class="secondary-btn" href="${esc(url)}" target="_blank" rel="noopener">Open research source ↗</a>`:""}<button class="primary-btn" id="markRecord">${progress()[id]?"Mark incomplete":"Mark complete"}</button></div>`;
  $("markRecord").onclick=()=>{progress()[id]=!progress()[id];save();$("detailDialog").close();renderRecords()};
  $("detailDialog").showModal();
}
function renderBuildPlanner(){
  const g=game();const saved=state.builds[selected]||{name:"",values:{}};
  const keys=g.statKeys||[];
  $("recordCount").textContent="PER-GAME BUILD";
  $("recordList").innerHTML=`<div class="build-panel">
    <div class="eyebrow">INDEPENDENT BUILD NOTES</div><h3 class="dialog-title">${esc(g.name)}</h3>
    <input class="build-name" id="buildName" placeholder="Build name (e.g. Quality / Dexterity)" value="${esc(saved.name||"")}">
    <div class="build-grid">${keys.map(k=>`<div class="build-field"><label>${esc(k)}</label><input type="number" min="0" max="999" step="1" data-stat="${esc(k)}" value="${esc(saved.values?.[k]??"")}" placeholder="—"></div>`).join("")}</div>
    <p class="build-note">${selected==="sekiro"?"Sekiro does not use the same level-up attribute system as the Souls RPGs. These are personal progression notes only, not a conventional stat calculator.":"Values are saved as personal allocation notes. Hard/soft caps, starting-class baselines and derived-stat calculations are intentionally not shown until each formula has been verified."}</p>
    <div class="build-actions"><button class="primary-btn" id="saveBuild">Save build</button><button class="secondary-btn" id="clearBuild">Clear build</button></div>
  </div>`;
  $("saveBuild").onclick=()=>{const values={};$("recordList").querySelectorAll("[data-stat]").forEach(i=>values[i.dataset.stat]=i.value);state.builds[selected]={name:$("buildName").value,values};localStorage.setItem("soulsborne-v2",JSON.stringify(state));toast("Build saved for "+g.name)};
  $("clearBuild").onclick=()=>{delete state.builds[selected];localStorage.setItem("soulsborne-v2",JSON.stringify(state));renderBuildPlanner();toast("Build cleared for selected game")};
}
function renderAll(){renderGames();renderDashboard();renderView()}
$("navGrid").querySelectorAll("button").forEach(b=>b.onclick=()=>{view=b.dataset.view;$("navGrid").querySelectorAll("button").forEach(x=>x.classList.toggle("active",x===b));renderView();$("workspace").scrollIntoView({behavior:"smooth"})});
$("searchInput").addEventListener("input",renderRecords);$("dlcFilter").addEventListener("change",renderRecords);$("categoryFilter").addEventListener("change",renderRecords);$("incompleteOnly").addEventListener("change",renderRecords);
$("exportBtn").onclick=()=>{const blob=new Blob([JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="soulsborne-archive-backup.json";a.click();URL.revokeObjectURL(a.href);toast("Backup exported")};
$("importFile").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const incoming=JSON.parse(await f.text());if(!incoming||incoming.version!==2||typeof incoming.progress!=="object")throw Error();for(const section of ["progress","favorites","notes","builds"]){state[section]??={};for(const [gid,value] of Object.entries(incoming[section]||{})){if(["progress","favorites"].includes(section))state[section][gid]={...(state[section][gid]||{}),...(value||{})};else if(!Object.hasOwn(state[section],gid))state[section][gid]=value;else if(section==="notes")state[section][gid]=String(state[section][gid]||"")+"\n\n"+String(value||"");else state[section][gid]=value;}}localStorage.setItem("soulsborne-v2",JSON.stringify(state));renderAll();toast("Backup merged; other game progress preserved")}catch{toast("Invalid or unsupported v2 backup")}e.target.value=""};
$("resetBtn").onclick=()=>{if(confirm("Clear progress, favorites, notes and build data for "+game().name+" only?")){for(const s of ["progress","favorites","notes","builds"])delete state[s][selected];localStorage.setItem("soulsborne-v2",JSON.stringify(state));renderAll();toast("Selected game's personal data reset")}};
$("notesBtn").onclick=()=>{const old=state.notes[selected]||"";$("dialogBody").innerHTML=`<div class="eyebrow">PERSONAL JOURNAL · ${esc(game().name)}</div><h2 class="dialog-title">Journey notes</h2><p class="dialog-copy">Notes are saved locally and independently for this game.</p><textarea id="noteText" rows="8" style="width:100%" placeholder="Record discoveries, routes, reminders..."></textarea><div class="dialog-actions"><button class="primary-btn" id="saveNote">Save notes</button></div>`;$("noteText").value=old;$("saveNote").onclick=()=>{state.notes[selected]=$("noteText").value;localStorage.setItem("soulsborne-v2",JSON.stringify(state));$("detailDialog").close();toast("Notes saved")};$("detailDialog").showModal()};
$("installBtn").onclick=async()=>{if(deferredInstall){deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$("installBtn").hidden=true}};
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;$("installBtn").hidden=false});
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
renderAll();
