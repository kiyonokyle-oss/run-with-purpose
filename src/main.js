import { createGame, RULES } from './engine.js';
import { createScene } from './scene.js';
import { verses, categories } from './scripture.js';
import { createScriptureJourney } from './scripture-journey.js';
import { createAudio } from './audio.js';

const $ = id => document.getElementById(id);
const game = createGame();
const scene = createScene($('game-canvas'));
const audio = createAudio();
const KEY = 'the-narrow-path:v1';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const blankSave = () => ({ best:0, fragments:{}, recalls:{}, runs:0, verse:0 });
let save = blankSave(), storageAvailable = true, loadedJourney = {};
try {
  const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
  if(raw && typeof raw === 'object') {
    loadedJourney = raw.scriptureJourney || raw;
    save.best = Number.isFinite(raw.best) && raw.best >= 0 ? Math.floor(raw.best) : 0;
    save.runs = Number.isInteger(raw.runs) && raw.runs >= 0 ? raw.runs : 0;
    save.verse = Number.isInteger(raw.verse) && raw.verse >= 0 && raw.verse < verses.length ? raw.verse : 0;
    for(const v of verses){save.fragments[v.id]=Math.min(v.fragments.length,Math.max(0,Math.floor(Number(raw.fragments?.[v.id])||0)));save.recalls[v.id]=Math.max(0,Math.floor(Number(raw.recalls?.[v.id])||0));}
  }
} catch { storageAvailable = false; }
const journey = createScriptureJourney(verses, loadedJourney);
let verse = journey.current(), recallVerse = verse;
let nextPassageAt = 20, pendingPassageAt = null;
let finalScore=0, answered=false, toastTimer, phraseTimer;
let lastTime=performance.now(), visualTime=0, uiTime=0, previousStatus='ready', dialogResume=false;
const number = n => Math.floor(n).toLocaleString();
const icons={sound:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg>',muted:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="m16 9 5 6m0-6-5 6"/></svg>',pause:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 5v14M16 5v14"/></svg>',play:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m8 5 11 7-11 7V5Z"/></svg>'};
$('sound-button').innerHTML=icons.muted;$('pause-button').innerHTML=icons.pause;

function persist() {
  const progress = journey.snapshot();
  save.verse = verses.findIndex(v => v.id === progress.currentId);
  save.fragments = progress.fragments;
  save.recalls = progress.recalls;
  save.scriptureJourney = progress;
  try { localStorage.setItem(KEY, JSON.stringify(save)); }
  catch {
    if (storageAvailable) {
      const note = document.createElement('div');
      note.className = 'storage-notice';
      note.textContent = 'Storage is unavailable. Progress will last for this visit.';
      document.body.append(note);
      setTimeout(() => note.remove(), 6000);
    }
    storageAvailable = false;
  }
}
function updateBest() { $('high-score').innerHTML = `${number(save.best)} <small>PTS</small>`; }
function updateVerse() {
  verse = journey.current();
  $('journey-verse').textContent = `“${verse.text}”`;
  $('journey-reference').textContent = verse.reference.toUpperCase() + ' · ' + verse.category;
  const count = journey.state.fragments[verse.id] || 0;
  document.querySelector('.progress-dots').innerHTML = verse.fragments.map((_,i) => `<i class="${i<count?'done':''}"></i>`).join('');
  $('fragment-progress').textContent = `${count} / ${verse.fragments.length} fragments collected`;
  $('collection-count').textContent = verses.length;
  $('library-total').textContent = verses.length;
  $('passage-position').textContent = `Passage ${verses.findIndex(v=>v.id===verse.id)+1} of ${verses.length}`;
  $('previous-verse').disabled = $('next-verse').disabled = ['running','dying','paused'].includes(game.state.status);
}
function resetPassageTimer() {
  nextPassageAt = game.state.elapsed + 20;
  pendingPassageAt = null;
}
function advancePassage() {
  journey.advance();
  updateVerse();
  resetPassageTimer();
  phrase(verse.fragments[0], `${verse.reference} · KJV · NEXT PASSAGE`);
  persist();
}
function toast(text,duration=2300){clearTimeout(toastTimer);$('run-toast').textContent=text;$('run-toast').classList.add('visible');toastTimer=setTimeout(()=>$('run-toast').classList.remove('visible'),duration);}
function phrase(text,label='WORD COLLECTED'){clearTimeout(phraseTimer);$('phrase-popup').querySelector('span').textContent=label;$('phrase-popup').querySelector('strong').textContent=text;$('phrase-popup').classList.add('visible');phraseTimer=setTimeout(()=>$('phrase-popup').classList.remove('visible'),3300);}
function hideTransient(){clearTimeout(toastTimer);clearTimeout(phraseTimer);$('run-toast').classList.remove('visible');$('phrase-popup').classList.remove('visible');}
function start(){
  if($('info-dialog').open)$('info-dialog').close();
  verse=journey.beginRun();recallVerse=verse;
  answered=false;finalScore=0;hideTransient();game.start();audio.resume();updateVerse();resetPassageTimer();
  $('game-stage').classList.add('playing');$('intro-overlay').classList.add('hidden');$('gameover-overlay').classList.add('hidden');$('paused-overlay').classList.add('hidden');$('touch-controls').classList.remove('hidden');$('pause-button').disabled=false;$('pause-button').innerHTML=icons.pause;$('pause-button').setAttribute('aria-label','Pause game');
  $('game-stage').focus({preventScroll:true});toast(verse.reference+' · '+verse.focus+'. Space or tap to jump.',3100);syncHUD();persist();
}
function pause(){if(game.pause()){audio.pause();$('paused-overlay').classList.remove('hidden');$('pause-button').innerHTML=icons.play;$('pause-button').setAttribute('aria-label','Resume game');$('resume-button').focus({preventScroll:true});updateVerse();}}
function resume(){if(game.resume()){audio.resume();$('paused-overlay').classList.add('hidden');$('pause-button').innerHTML=icons.pause;$('pause-button').setAttribute('aria-label','Pause game');$('game-stage').focus({preventScroll:true});updateVerse();}}
function togglePause(){if(game.state.status==='paused')resume();else pause();}
function syncHUD(){const s=game.state;$('score').textContent=String(Math.floor(s.status==='over'?finalScore:s.score)).padStart(5,'0');$('distance').innerHTML=`${Math.floor(s.distance)} <small>m</small>`;$('combo').innerHTML=`×${s.combo} <span>COMBO</span>`;$('speed').textContent=(s.speed/RULES.initialSpeed).toFixed(1)+'×';document.querySelectorAll('.speed-bars i').forEach((bar,i)=>bar.style.background=i<1+Math.floor((s.speed/RULES.initialSpeed-1)*4)?'#7b8f58':'#c9ceba');const regions=['The Wilderness','The Valley','The High Places','The Open Road'];$('region-label').textContent=regions[s.phase];$('chapter-label').textContent='CHAPTER '+['I','II','III','IV'][s.phase];}
function finish(){audio.pause();hideTransient();finalScore=Math.floor(game.state.score);const record=finalScore>save.best;save.best=Math.max(save.best,finalScore);save.runs++;persist();updateBest();$('pause-button').disabled=true;$('touch-controls').classList.add('hidden');$('end-kicker').textContent=record?'A NEW PERSONAL BEST':'EVERY STEP COUNTS';$('end-score').textContent=number(finalScore);$('end-distance').textContent=Math.floor(game.state.distance)+' m';$('end-combo').textContent='×'+game.state.bestCombo;$('recall-reference').textContent=recallVerse.reference+' · KJV';$('recall-prompt').textContent=recallVerse.recall.prompt;$('recall-feedback').textContent='Complete the verse for a 100-point bonus.';$('recall-options').replaceChildren();
  for(const option of recallVerse.recall.options){const button=document.createElement('button');button.textContent=option;button.addEventListener('click',()=>answerRecall(option,button));$('recall-options').append(button);}
  updateVerse();
  $('gameover-overlay').classList.remove('hidden');$('restart-button').focus({preventScroll:true});syncHUD();
}
function answerRecall(option,button){if(answered)return;answered=true;const correct=option===recallVerse.recall.answer;journey.recordRecall(correct,recallVerse.id);audio.play(correct?'correct':'wrong');button.classList.add(correct?'correct':'wrong');for(const b of $('recall-options').children){b.disabled=true;if(b.textContent===recallVerse.recall.answer)b.classList.add('correct');}
  $('recall-prompt').textContent=recallVerse.text;$('restart-button').focus({preventScroll:true});
  if(correct){finalScore+=100;save.best=Math.max(save.best,finalScore);$('end-score').textContent=number(finalScore);$('recall-feedback').textContent='Held in your heart. +100 points';updateBest();persist();syncHUD();}else{$('recall-feedback').textContent=`The word is “${recallVerse.recall.answer}”. Take it with you on a later run.`;persist();}
}
function collect() {
  const event = journey.collectLight();
  if (!event) return;
  recallVerse = event.verse;
  phrase(event.fragment, `${event.verse.reference} · KJV · WORD COLLECTED`);
  if (event.completed) {
    toast(event.verse.reference + ' collected. Another passage is ahead.', 3400);
    pendingPassageAt = game.state.elapsed + 4;
  }
  updateVerse();
  persist();
}
function browseVerse(direction) {
  if (['running','dying','paused'].includes(game.state.status)) return;
  const index = verses.findIndex(v => v.id === journey.current().id);
  journey.select(verses[(index + direction + verses.length) % verses.length].id);
  updateVerse();
  resetPassageTimer();
  persist();
}
$('previous-verse').addEventListener('click', () => browseVerse(-1));
$('next-verse').addEventListener('click', () => browseVerse(1));
function returnHome(){audio.pause();game.state.status='ready';game.state.score=0;game.state.distance=0;game.state.speed=RULES.initialSpeed;game.state.combo=1;game.state.phase=0;game.state.player.y=0;game.state.player.sliding=false;$('game-stage').classList.remove('playing');$('intro-overlay').classList.remove('hidden');$('gameover-overlay').classList.add('hidden');$('paused-overlay').classList.add('hidden');$('touch-controls').classList.add('hidden');$('pause-button').disabled=true;hideTransient();syncHUD();updateVerse();$('start-button').focus({preventScroll:true});}

$('start-button').addEventListener('click',start);$('restart-button').addEventListener('click',start);$('resume-button').addEventListener('click',resume);$('pause-button').addEventListener('click',togglePause);$('back-button').addEventListener('click',returnHome);
$('sound-button').addEventListener('click',async()=>{const enabled=await audio.toggle();$('sound-button').innerHTML=enabled?icons.sound:icons.muted;$('sound-button').setAttribute('aria-pressed',String(enabled));$('sound-button').setAttribute('aria-label',enabled?'Mute sound and music':'Enable sound and hymn music');if(enabled)audio.play('collect');else if(!('AudioContext' in window)&&!('webkitAudioContext' in window))toast('Sound is unavailable in this browser.');});
$('touch-slide').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();game.slide();});$('touch-jump').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();game.jump();});
let touchStart=null;
$('game-stage').addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;if(e.pointerType==='touch'){touchStart={x:e.clientX,y:e.clientY};}else if(game.state.status==='running')game.jump();});
$('game-stage').addEventListener('pointerup',e=>{if(!touchStart)return;const dy=e.clientY-touchStart.y;touchStart=null;if(game.state.status==='running'){if(dy>25)game.slide();else game.jump();}});
$('game-stage').addEventListener('pointercancel',()=>touchStart=null);
document.addEventListener('keydown',e=>{
  if($('info-dialog').open)return;
  if(e.target.closest?.('button,a,input,select,textarea')&&!['start-button','restart-button','resume-button'].includes(e.target.id)&&!['Escape','KeyP'].includes(e.code))return;
  if(['ArrowUp','ArrowDown','Space'].includes(e.code))e.preventDefault();
  if(e.repeat)return;
  if(e.code==='KeyP'||e.code==='Escape'){e.preventDefault();togglePause();return;}
  if(e.code==='Space'||e.code==='ArrowUp'||e.code==='KeyW'){
    if(game.state.status==='ready')start();else if(game.state.status==='running')game.jump();else if(game.state.status==='paused')resume();else if(game.state.status==='over'&&e.target===$('restart-button'))start();
  }else if(e.code==='ArrowDown'||e.code==='KeyS')game.slide();
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&game.state.status==='running')pause();});
function openDialog(content){dialogResume=game.state.status==='running';if(dialogResume)pause();$('dialog-content').innerHTML=content;$('info-dialog').showModal();}
$('dialog-close').addEventListener('click',()=>$('info-dialog').close());$('info-dialog').addEventListener('click',e=>{if(e.target===$('info-dialog')){const r=$('info-dialog').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('info-dialog').close();}});$('info-dialog').addEventListener('close',()=>{if(dialogResume){dialogResume=false;resume();}});
function help(){openDialog(`<span class="eyebrow">ONE STEP AT A TIME</span><h2 class="dialog-heading">Find your rhythm.</h2><p class="dialog-description">Follow the path through the wilderness. The road gets faster and obstacles grow closer as you travel.</p><ul class="instructions-list"><li><kbd>SPACE / ↑</kbd><span><strong>Jump</strong> over rocks. You can also tap the game or use the Jump button on your phone.</span></li><li><kbd>↓ / S</kbd><span><strong>Slide</strong> under branches. On your phone, swipe down or tap Slide.</span></li><li><kbd>P / ESC</kbd><span><strong>Pause</strong> whenever you need a moment.</span></li><li><span class="note-icon">✦</span><span>Every three clean dodges raises your combo, up to ×5. Collect lights for extra points and scripture fragments.</span></li></ul><p class="dialog-description">Scripture is part of the journey: three lights reveal a phrase. Gather a verse, then revisit a missing word after your run. Recall is optional and earns a 100-point bonus. ${verses.length} passages use the King James Version (KJV). A fresh passage arrives during longer runs and between attempts. Partial fragments carry across runs; missed recall words return periodically for review.</p><p class="dialog-description">Your best score, collected fragments, and recall practice stay in this browser. This game has no accounts or online leaderboard.</p>`);}
function collection() {
  const completed = verses.filter(v => (journey.state.fragments[v.id] || 0) >= v.fragments.length).length;
  const discovered = verses.filter(v => (journey.state.seen[v.id] || 0) > 0).length;
  openDialog(`<span class="eyebrow">WORDS TO CARRY WITH YOU</span>
    <h2 class="dialog-heading">Your scripture library.</h2>
    <p class="dialog-description">${verses.length} passages for the road ahead. New words arrive as you run; familiar ones return for practice. Explore any passage below.</p>
    <div class="library-summary"><span><strong>${verses.length}</strong> passages</span><span><strong>${discovered}</strong> encountered</span><span><strong>${completed}</strong> collected</span></div>
    <div class="library-tools"><input id="library-search" class="library-search" type="search" aria-label="Search scripture by reference, words, or topic" placeholder="Search a verse, a word, a topic…" autocomplete="off" />
    <div class="library-filters" aria-label="Scripture topics">${['All passages',...categories].map((category,i)=>`<button class="library-filter ${i===0?'active':''}" data-category="${i===0?'':category}" aria-pressed="${i===0}">${category}</button>`).join('')}</div></div>
    <p id="library-status" class="library-status" role="status"></p>
    <div id="library-results" class="library-results"></div>
    <button id="library-load-more" class="library-load-more">Show more passages</button>`);
  let query = '', category = '', limit = 12;
  function renderLibrary() {
    const matches = verses.filter(v => (!category || v.category === category) &&
      [v.reference,v.text,v.category,v.focus].join(' ').toLowerCase().includes(query));
    $('library-status').textContent = `${matches.length} ${matches.length===1?'passage':'passages'}${category?' in '+category:''}${query?' matching “'+query+'”':''}`;
    $('library-results').innerHTML = matches.slice(0,limit).map(v => {
      const count = journey.state.fragments[v.id] || 0;
      return `<article class="collection-card"><h3>${v.reference} · KJV <span>${v.focus.toUpperCase()}</span></h3><p>“${v.text}”</p>
        <small>${v.category} · ${count} / ${v.fragments.length} fragments · ${journey.state.recalls[v.id]||0} correct recalls</small><br>
        <button data-verse="${v.id}">${v.id===verse.id?'Practice current passage':'Practice this passage'} ↗</button>
        <a class="library-source" href="${v.source}" target="_blank" rel="noopener noreferrer">Read in context ↗</a></article>`;
    }).join('') || '<p class="library-empty">No passages match. Try a reference like “Psalm” or a word like “peace”.</p>';
    $('library-load-more').hidden = matches.length <= limit;
    $('library-load-more').textContent = `Show more passages (${matches.length - Math.min(limit,matches.length)} remaining)`;
    $('library-results').querySelectorAll('[data-verse]').forEach(button => button.addEventListener('click', () => {
      journey.select(button.dataset.verse);
      updateVerse();
      persist();
      dialogResume = false;
      $('info-dialog').close();
      returnHome();
    }));
  }
  $('library-search').addEventListener('input',event => {query=event.target.value.toLowerCase().trim();limit=12;renderLibrary();});
  $('dialog-content').querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => {
    category=button.dataset.category;limit=12;
    $('dialog-content').querySelectorAll('[data-category]').forEach(item => {const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});
    renderLibrary();
  }));
  $('library-load-more').addEventListener('click',() => {limit+=12;renderLibrary();});
  renderLibrary();
}
$('help-button').addEventListener('click',help);$('nav-verses').addEventListener('click',collection);$('verse-progress').addEventListener('click',collection);$('nav-play').addEventListener('click',()=>{if($('info-dialog').open)$('info-dialog').close();$('game-stage').scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth',block:'center'});});
const resizeObserver=new ResizeObserver(()=>scene.resize());resizeObserver.observe($('game-canvas'));
function frame(now){const dt=Math.min((now-lastTime)/1000,.05);lastTime=now;game.update(dt);if(!['paused','over','dying'].includes(game.state.status))visualTime+=dt;for(const event of game.drainEvents()){scene.event(event,game.state);audio.play(event.type);if(event.type==='collect')collect();if(event.type==='clear'&&event.combo>1)toast('Keep your rhythm. ×'+event.combo+' combo');if(event.type==='milestone')toast('Steady in spirit. The pace is rising.');if(event.type==='spawn'&&game.state.obstacles.length&&game.state.elapsed<11){const o=game.state.obstacles.at(-1);if(o?.type==='branch')toast('Low branch ahead. ↓ or S to slide.',3300);}if(event.type==='gameover')finish();}
  if(game.state.status==='running'&&game.state.elapsed>=(pendingPassageAt??nextPassageAt))advancePassage();
  scene.render(game.state,visualTime,dt,reducedMotion.matches);uiTime+=dt;if(uiTime>.09||previousStatus!==game.state.status){syncHUD();uiTime=0;}previousStatus=game.state.status;requestAnimationFrame(frame);
}
// Read-only snapshot for automated browser verification and assistive integrations.
window.render_game_to_text=()=>JSON.stringify({status:game.state.status,score:Math.floor(game.state.status==='over'?finalScore:game.state.score),best:save.best,distance:Math.floor(game.state.distance),combo:game.state.combo,speed:game.state.speed,player:{...game.state.player},obstacles:game.state.obstacles.map(o=>({...o})),collectibles:game.state.collectibles.map(c=>({...c})),verse:verse.reference,verseCount:verses.length,recallVerse:recallVerse.reference,fragments:journey.state.fragments[verse.id]||0,passageChanges:journey.state.rounds,translation:'KJV',storageAvailable});
updateVerse();updateBest();scene.resize();scene.render(game.state,0,0,reducedMotion.matches);requestAnimationFrame(frame);
