/** Pure, deterministic endless-runner simulation. Distances are in world pixels. */
export const WORLD = Object.freeze({ width: 1200, height: 540, groundY: 425 });
export const RULES = Object.freeze({
  initialSpeed: 310,
  maxSpeed: 620,
  acceleration: 4.3,
  gravity: 2050,
  jumpVelocity: 740,
  slideDuration: 0.8,
  jumpBuffer: 0.15,
  collisionDuration: 0.65,
  firstSpawn: 3,
  minGapSeconds: 1.22,
});

const clamp = (number, min, max) => Math.min(max, Math.max(min, number));

export function createGame({ random = Math.random } = {}) {
  const state = {};
  let nextId = 1;
  let spawnCountdown = RULES.firstSpawn;
  let spawnCount = 0;
  let bonusScore = 0;
  let nextMilestone = 250;

  function emit(type, details = {}) {
    state.events.push({ type, ...details });
    // Consumers normally drain once per frame; bound memory for inactive consumers.
    if (state.events.length > 100) state.events.splice(0, state.events.length - 100);
  }

  function reset(status = 'ready') {
    nextId = 1;
    spawnCountdown = RULES.firstSpawn;
    spawnCount = 0;
    bonusScore = 0;
    nextMilestone = 250;
    Object.assign(state, {
      ...WORLD,
      status,
      player: {
        x: 270, y: 0, width: 36, height: 76, standingHeight: 76,
        slideHeight: 30, vy: 0, grounded: true, sliding: false,
        slideTimer: 0, landTimer: 0, jumpBuffer: 0, collisionTimer: 0,
      },
      obstacles: [],
      collectibles: [],
      effects: [],
      events: [],
      score: 0,
      distance: 0,
      speed: RULES.initialSpeed,
      combo: 1,
      bestCombo: 1,
      cleared: 0,
      collected: 0,
      elapsed: 0,
      phase: 0,
      scroll: 0,
      deathTimer: 0,
      lastCollision: null,
      nextSpawnIn: RULES.firstSpawn,
      spawnInterval: 2.25,
    });
    return state;
  }

  function start() {
    reset('running');
    emit('start');
    return state;
  }

  function performJump() {
    const player = state.player;
    player.vy = RULES.jumpVelocity;
    player.grounded = false;
    player.jumpBuffer = 0;
    player.landTimer = 0;
    emit('jump', { x: player.x, y: player.y });
  }

  function jump() {
    if (state.status !== 'running') return false;
    const player = state.player;
    if (player.grounded && !player.sliding) {
      performJump();
      return true;
    }
    player.jumpBuffer = RULES.jumpBuffer;
    return false;
  }

  function slide() {
    if (state.status !== 'running') return false;
    const player = state.player;
    if (!player.grounded || player.sliding) return false;
    player.sliding = true;
    player.slideTimer = RULES.slideDuration;
    player.height = player.slideHeight;
    player.jumpBuffer = 0;
    emit('slide', { x: player.x });
    return true;
  }

  function pause() {
    if (state.status === 'running') {
      state.status = 'paused';
      emit('pause');
      return true;
    }
    return false;
  }

  function resume() {
    if (state.status === 'paused') {
      state.status = 'running';
      emit('resume');
      return true;
    }
    return false;
  }

  function spawnObstacle() {
    const sample = () => clamp(Number(random()) || 0, 0, 1);
    // Two rock encounters teach jumping before the first overhead obstacle.
    const type = spawnCount < 2 ? 'rock' : spawnCount === 2 ? 'branch' : sample() < 0.4 ? 'branch' : 'rock';
    const obstacle = {
      id: nextId++, x: WORLD.width + 85,
      width: type === 'rock' ? 64 : 88,
      height: type === 'rock' ? 48 : 140,
      bottom: type === 'branch' ? 40 : 0,
      y: type === 'branch' ? 40 : 0,
      type, cleared: false,
    };
    state.obstacles.push(obstacle);
    const center = obstacle.x + obstacle.width / 2;
    // A gentle collectible arc cues the intended action; low lights cue sliding.
    const heights = type === 'rock' ? [64, 126, 156, 126, 64] : [18, 18, 18];
    heights.forEach((height, index) => state.collectibles.push({
      id: nextId++, x: center + (index - (heights.length - 1) / 2) * 62,
      y: height, collected: false, radius: 11,
    }));
    spawnCount++;
    // Even the hardest pattern affords more than a full jump/slide and recovery.
    const baseInterval = Math.max(RULES.minGapSeconds, 2.25 - state.elapsed * 0.014);
    state.spawnInterval = baseInterval + sample() * 0.27;
    spawnCountdown += state.spawnInterval;
    emit('spawn', { obstacle: { ...obstacle }, number: spawnCount });
  }

  function updatePlayer(dt) {
    const player = state.player;
    player.landTimer = Math.max(0, player.landTimer - dt);
    player.jumpBuffer = Math.max(0, player.jumpBuffer - dt);
    if (player.sliding) {
      player.slideTimer = Math.max(0, player.slideTimer - dt);
      if (player.slideTimer === 0) {
        player.sliding = false;
        player.height = player.standingHeight;
        if (player.jumpBuffer > 0) performJump();
      }
    }
    if (!player.grounded) {
      player.y += player.vy * dt - 0.5 * RULES.gravity * dt * dt;
      player.vy -= RULES.gravity * dt;
      if (player.y <= 0 && player.vy < 0) {
        player.y = 0;
        player.vy = 0;
        player.grounded = true;
        player.landTimer = 0.16;
        emit('land', { x: player.x });
        if (player.jumpBuffer > 0) performJump();
      }
    }
  }

  function collide(obstacle) {
    state.status = 'dying';
    state.deathTimer = RULES.collisionDuration;
    state.player.collisionTimer = RULES.collisionDuration;
    state.lastCollision = { ...obstacle };
    state.player.jumpBuffer = 0;
    emit('collision', { obstacle: { ...obstacle }, score: state.score, combo: state.combo });
  }

  function updateObjects(dt) {
    const player = state.player;
    const travel = state.speed * dt;
    // Forgiving insets match the visible body rather than the outer cape silhouette.
    const left = player.x + 5;
    const right = player.x + player.width - 5;
    const feet = player.y + 5;
    const head = player.y + player.height - 5;

    for (const obstacle of state.obstacles) {
      const previousRight = obstacle.x + obstacle.width;
      obstacle.x -= travel;
      const bottom = obstacle.bottom ?? (obstacle.type === 'branch' ? 40 : 0);
      const overlapX = right > obstacle.x + 5 && left < obstacle.x + obstacle.width - 5;
      const sweptX = previousRight - 5 >= left && obstacle.x + obstacle.width - 5 < left;
      if (!obstacle.cleared && (overlapX || sweptX) && feet < bottom + obstacle.height - 4 && head > bottom + 4) {
        collide(obstacle);
        break;
      }
      if (!obstacle.cleared && obstacle.x + obstacle.width < player.x) {
        obstacle.cleared = true;
        state.cleared++;
        state.combo = Math.min(5, 1 + Math.floor(state.cleared / 3));
        state.bestCombo = Math.max(state.bestCombo, state.combo);
        bonusScore += 50 * state.combo;
        emit('clear', { obstacle: { ...obstacle }, combo: state.combo, cleared: state.cleared, points: 50 * state.combo });
      }
    }

    if (state.status !== 'running') return;
    for (const collectible of state.collectibles) {
      collectible.x -= travel;
      const radius = collectible.radius ?? 11;
      if (!collectible.collected && collectible.x + radius >= left && collectible.x - radius <= right && collectible.y + radius >= player.y && collectible.y - radius <= player.y + player.height) {
        collectible.collected = true;
        state.collected++;
        bonusScore += 25 * state.combo;
        emit('collect', { x: collectible.x, y: collectible.y, id: collectible.id, points: 25 * state.combo, collected: state.collected });
      }
    }
    state.obstacles = state.obstacles.filter(obstacle => obstacle.x + obstacle.width > -100);
    state.collectibles = state.collectibles.filter(collectible => !collectible.collected && collectible.x > -50);
  }

  function step(dt) {
    if (state.status === 'dying') {
      state.deathTimer = Math.max(0, state.deathTimer - dt);
      state.player.collisionTimer = state.deathTimer;
      if (state.deathTimer === 0) {
        state.status = 'over';
        emit('gameover', { score: state.score, distance: Math.floor(state.distance), bestCombo: state.bestCombo, collected: state.collected });
      }
      return;
    }
    if (state.status !== 'running') return;
    state.elapsed += dt;
    state.speed = Math.min(RULES.maxSpeed, RULES.initialSpeed + state.elapsed * RULES.acceleration);
    state.scroll += state.speed * dt;
    state.distance = state.scroll / 10;
    state.phase = Math.min(3, Math.floor(state.elapsed / 25));
    updatePlayer(dt);
    spawnCountdown -= dt;
    if (spawnCountdown <= 0) spawnObstacle();
    state.nextSpawnIn = Math.max(0, spawnCountdown);
    updateObjects(dt);
    state.score = Math.floor(state.distance * 2 + bonusScore);
    if (state.distance >= nextMilestone && state.status === 'running') {
      emit('milestone', { distance: nextMilestone, phase: state.phase });
      nextMilestone += 250;
    }
  }

  function update(dt) {
    if (!Number.isFinite(dt) || dt <= 0) return state;
    // A resumed background tab never advances more than one quarter second.
    let remaining = Math.min(dt, 0.25);
    // 120 Hz physics plus swept horizontal checks prevent obstacle tunneling.
    while (remaining > 1e-9) {
      const slice = Math.min(remaining, 1 / 120);
      step(slice);
      remaining -= slice;
    }
    return state;
  }

  reset();
  return { state, start, jump, slide, pause, resume, update, drainEvents: () => state.events.splice(0) };
}
