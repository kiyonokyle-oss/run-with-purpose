import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, RULES } from '../src/engine.js';

function advance(game, seconds, beforeFrame) {
  for (let remaining = seconds; remaining > 1e-8; remaining -= 1 / 120) {
    beforeFrame?.(game.state);
    game.update(Math.min(1 / 120, remaining));
  }
}

function obstacleAt(game, type, x = 292) {
  const obstacle = { id: 999, type, x, width: type === 'rock' ? 64 : 88, height: type === 'rock' ? 48 : 140, bottom: type === 'rock' ? 0 : 40, cleared: false };
  game.state.obstacles.push(obstacle);
  return obstacle;
}

test('ready game starts and restart fully clears the previous run', () => {
  const game = createGame();
  const originalState = game.state;
  assert.equal(game.state.status, 'ready');
  game.start();
  advance(game, 1);
  assert.ok(game.state.score > 0);
  game.slide();
  obstacleAt(game, 'rock');
  game.update(0.1);
  assert.equal(game.state.status, 'dying');
  advance(game, 0.7);
  assert.equal(game.state.status, 'over');
  game.start();
  assert.equal(game.state, originalState);
  assert.equal(game.state.status, 'running');
  assert.equal(game.state.score, 0);
  assert.equal(game.state.obstacles.length, 0);
  assert.equal(game.state.player.sliding, false);
  assert.equal(game.state.combo, 1);
  assert.equal(game.state.speed, RULES.initialSpeed);
});

test('jump follows an arc, cannot double jump, and has a landing squash window', () => {
  const game = createGame();
  game.start();
  assert.equal(game.jump(), true);
  advance(game, 0.25);
  assert.ok(game.state.player.y > 100);
  const velocity = game.state.player.vy;
  assert.equal(game.jump(), false);
  assert.equal(game.state.player.vy, velocity);
  advance(game, 0.5);
  assert.equal(game.state.player.y, 0);
  assert.equal(game.state.player.grounded, true);
  assert.ok(game.state.player.landTimer > 0);
  assert.equal(game.drainEvents().filter(event => event.type === 'jump').length, 1);
});

test('late jump input buffers through landing', () => {
  const game = createGame();
  game.start();
  game.jump();
  advance(game, 0.67);
  game.jump();
  advance(game, 0.12);
  assert.equal(game.state.player.grounded, false);
  assert.ok(game.state.player.vy > 0);
  assert.equal(game.drainEvents().filter(event => event.type === 'jump').length, 2);
});

test('sliding passes beneath a branch, expires, and is rejected in the air', () => {
  const game = createGame();
  game.start();
  obstacleAt(game, 'branch', 335);
  assert.equal(game.slide(), true);
  assert.equal(game.state.player.height, 30);
  advance(game, 0.6);
  assert.equal(game.state.status, 'running');
  assert.equal(game.state.cleared, 1);
  advance(game, 0.25);
  assert.equal(game.state.player.sliding, false);
  assert.equal(game.state.player.height, 76);
  game.jump();
  assert.equal(game.slide(), false);
});

test('jumping clears a rock, while standing intersects overhead branches', () => {
  const jumper = createGame();
  jumper.start();
  obstacleAt(jumper, 'rock', 370);
  jumper.jump();
  advance(jumper, 0.6);
  assert.equal(jumper.state.status, 'running');
  assert.equal(jumper.state.cleared, 1);

  const standing = createGame();
  standing.start();
  obstacleAt(standing, 'branch');
  standing.update(1 / 60);
  assert.equal(standing.state.status, 'dying');
  assert.equal(standing.state.lastCollision.type, 'branch');
});

test('collision animates before game over and emits each terminal event once', () => {
  const game = createGame();
  game.start();
  obstacleAt(game, 'rock', 316);
  game.update(0.25);
  assert.equal(game.state.status, 'dying');
  assert.equal(game.jump(), false);
  advance(game, 0.7);
  assert.equal(game.state.status, 'over');
  const score = game.state.score;
  advance(game, 0.4);
  assert.equal(game.state.score, score);
  const events = game.drainEvents();
  assert.equal(events.filter(event => event.type === 'collision').length, 1);
  assert.equal(events.filter(event => event.type === 'gameover').length, 1);
  assert.equal(game.drainEvents().length, 0);
});

test('collecting lights and clearing three obstacles increases combo scoring', () => {
  const game = createGame();
  game.start();
  for (let index = 0; index < 3; index++) {
    obstacleAt(game, 'rock', 100);
    game.update(1 / 120);
  }
  assert.equal(game.state.combo, 2);
  assert.equal(game.state.bestCombo, 2);
  const previousScore = game.state.score;
  game.state.collectibles.push({ id: 44, x: 290, y: 35, collected: false });
  game.update(1 / 120);
  assert.equal(game.state.collected, 1);
  assert.ok(game.state.score - previousScore >= 50);
  assert.equal(game.drainEvents().find(event => event.type === 'collect').points, 50);
});

test('pause freezes physics, score, timers and procedural spawning', () => {
  const game = createGame();
  game.start();
  game.jump();
  advance(game, 0.1);
  assert.equal(game.pause(), true);
  const frozen = { y: game.state.player.y, elapsed: game.state.elapsed, score: game.state.score, spawn: game.state.nextSpawnIn };
  advance(game, 5);
  assert.equal(game.jump(), false);
  assert.equal(game.slide(), false);
  assert.deepEqual({ y: game.state.player.y, elapsed: game.state.elapsed, score: game.state.score, spawn: game.state.nextSpawnIn }, frozen);
  assert.equal(game.resume(), true);
  advance(game, 0.1);
  assert.ok(game.state.elapsed > frozen.elapsed);
});

test('speed and density ramp within fair recovery limits with jump-first onboarding', () => {
  const game = createGame({ random: () => 0 });
  game.start();
  const spawns = [];
  // Observe the generator independently of obstacle collisions.
  advance(game, 95, state => {
    state.obstacles = [];
    state.collectibles = [];
    for (const event of game.drainEvents()) if (event.type === 'spawn') spawns.push({ time: state.elapsed, type: event.obstacle.type, interval: state.spawnInterval });
  });
  assert.equal(game.state.speed, RULES.maxSpeed);
  assert.ok(spawns[0].time >= RULES.firstSpawn);
  assert.deepEqual(spawns.slice(0, 3).map(spawn => spawn.type), ['rock', 'rock', 'branch']);
  assert.ok(spawns[0].interval > spawns.at(-1).interval);
  assert.ok(spawns.every(spawn => spawn.interval >= RULES.minGapSeconds));
  for (let index = 1; index < spawns.length; index++) assert.ok(spawns[index].time - spawns[index - 1].time >= RULES.minGapSeconds - 1 / 120);
  assert.ok(RULES.minGapSeconds > RULES.slideDuration + 0.3);
  assert.ok(RULES.minGapSeconds > (2 * RULES.jumpVelocity / RULES.gravity) + 0.3);
});

test('invalid deltas are ignored and background-tab deltas are capped', () => {
  const game = createGame();
  game.start();
  for (const dt of [NaN, Infinity, -1, 0]) game.update(dt);
  assert.equal(game.state.elapsed, 0);
  game.update(20);
  assert.ok(Math.abs(game.state.elapsed - 0.25) < 1e-8);
});
