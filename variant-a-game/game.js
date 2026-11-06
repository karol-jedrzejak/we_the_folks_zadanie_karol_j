(() => {
  'use strict';

  const WIDTH = 360;
  const HEIGHT = 640;
  let FIELD_TOP = 234;
  let FIELD_BOTTOM = 574;
  const FIELD_BLEED = 32;
  const PLAYER_X = WIDTH * 0.255;
  const PLAYER_COLLISION_RADIUS = 16;
  const PLAYER_EDGE_RADIUS = 20;
  const TEXT_OBSTACLE_SCALE = 0.72;
  const ASSET = 'assets/';
  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d');
  const stage = document.querySelector('#stage');
  const statusLabel = document.querySelector('#status');
  const muteButton = document.querySelector('#mute');
  const clickoutButton = document.querySelector('#clickout');
  const replayButton = document.querySelector('#replay');
  const debug = new URLSearchParams(location.search).has('debug');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clickTag = window.clickTag || 'https://example.com/landing';

  const imagePaths = {
    bg: 'bg.jpg', logo: 'logo.png', border: 'border.png',
    texture: '01_game/bg_texture.png', gut: '01_game/gameplay.png',
    player: '01_game/player.png', tut: '01_game/tut.png', gesture: 'gesture.png',
    ...Object.fromEntries(Array.from({ length: 6 }, (_, index) => [`bac${index + 1}`, `01_game/bac${index + 1}.png`])),
    ...Object.fromEntries(Array.from({ length: 9 }, (_, index) => [`txt${index + 1}`, `01_game/txt${index + 1}.png`])),
    ...Object.fromEntries(['fail', 'win'].flatMap((screen) => {
      const names = screen === 'fail'
        ? ['bubble', 'sad', 'bac1', 'bac2', 'bac3', 'bac4', 'bac5', 'hl', 'cta', 'replay']
        : ['bubble', 'konfetti', 'happy', 'hl', 'cta'];
      return names.map((name) => [`${screen}-${name}`, `02_endcard/${screen}/${name}.png`]);
    }))
  };

  const images = {};
  let loadedCount = 0;
  let lastFrame = 0;
  let screen = 'loading';
  let screenTime = 0;
  let worldScroll = 0;
  let playerY = 333;
  let playerVelocity = 0;
  let elapsed = 0;
  let audioUnlocked = false;
  let muted = false;
  let paused = document.hidden;
  let decorativeTime = 0;
  let skipNextGameplayStep = false;
  const pausedSounds = new Set();

  const obstacleNames = [
    'bac1', 'bac2', 'bac3', 'bac4', 'bac5', 'bac6'
  ];
  const obstacles = [];
  const decorations = [];
  const textNames = Array.from({ length: 9 }, (_, index) => `txt${index + 1}`);
  const audio = {
    music: new Audio(`${ASSET}music/background_music/Funny Game Loop.mp3`),
    crash: new Audio(`${ASSET}music/crash/Cartoon Crash Boing.mp3`),
    fail: new Audio(`${ASSET}music/endcard_fail/Fail.mp3`),
    win: new Audio(`${ASSET}music/endcard_win/Celebrative Happy Woohoo Cheer 2.mp3`)
  };

  audio.music.loop = true;
  audio.music.volume = 0.34;
  audio.crash.volume = 0.62;
  audio.fail.volume = 0.72;
  audio.win.volume = 0.72;
  Object.values(audio).forEach((sound) => { sound.preload = 'none'; });

  function loadImages() {
    for (const [key, path] of Object.entries(imagePaths)) {
      const image = new Image();
      image.src = `${ASSET}${path}`;
      image.onload = () => {
        loadedCount += 1;
        if (loadedCount === Object.keys(imagePaths).length) {
          derivePlayfieldBounds();
          screen = 'start';
          decorativeTime = 0;
          stage.dataset.screen = screen;
          statusLabel.textContent = 'Tap anywhere to start';
          draw(0);
        }
      };
      image.onerror = () => {
        loadedCount += 1;
        console.warn(`Could not load game asset: ${path}`);
        if (loadedCount === Object.keys(imagePaths).length) {
          derivePlayfieldBounds();
          screen = 'start';
          decorativeTime = 0;
          stage.dataset.screen = screen;
          draw(0);
        }
      };
      images[key] = image;
    }
  }

  function derivePlayfieldBounds() {
    const border = images.border;
    if (!border?.naturalWidth) return;

    const boundsCanvas = document.createElement('canvas');
    boundsCanvas.width = border.naturalWidth;
    boundsCanvas.height = border.naturalHeight;
    const boundsContext = boundsCanvas.getContext('2d', { willReadFrequently: true });
    boundsContext.drawImage(border, 0, 0);

    const sampleX = Math.round((PLAYER_X / WIDTH) * border.naturalWidth);
    const alpha = boundsContext.getImageData(sampleX, 0, 1, border.naturalHeight).data;
    const runs = [];
    let runStart = -1;
    for (let y = 0; y < border.naturalHeight; y += 1) {
      const opaque = alpha[y * 4 + 3] > 20;
      if (opaque && runStart < 0) runStart = y;
      if (!opaque && runStart >= 0) {
        runs.push({ start: runStart, end: y - 1 });
        runStart = -1;
      }
    }
    if (runStart >= 0) runs.push({ start: runStart, end: border.naturalHeight - 1 });

    if (runs.length >= 2) {
      FIELD_TOP = Math.round((runs[0].end + 1) / 2);
      FIELD_BOTTOM = Math.round(runs[runs.length - 1].start / 2);
      //muteButton.style.top = `${FIELD_TOP + 8}px`;
      statusLabel.style.top = `${(FIELD_TOP + FIELD_BOTTOM) / 2}px`;
    }
  }

  function fitStage() {
    const viewport = window.visualViewport;
    const viewportWidth = viewport?.width || innerWidth;
    const viewportHeight = viewport?.height || innerHeight;
    const scale = Math.min(viewportWidth / WIDTH, viewportHeight / HEIGHT);
    stage.style.top = `${Math.max(0, viewport?.offsetTop || 0)}px`;
    stage.style.transform = `translateX(-50%) scale(${scale})`;
  }

  function drawImage(key, x, y, width, height, alpha = 1) {
    const image = images[key];
    if (!image || !image.complete || !image.naturalWidth) return;
    ctx.globalAlpha = alpha;
    ctx.drawImage(image, x, y, width, height);
    ctx.globalAlpha = 1;
  }

  function drawFull(key, alpha = 1, scale = 1) {
    const w = WIDTH * scale;
    const h = HEIGHT * scale;
    drawImage(key, (WIDTH - w) / 2, (HEIGHT - h) / 2, w, h, alpha);
  }

  function buildObstacles() {
    const shuffled = [...obstacleNames];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
    }
    obstacles.length = 0;
    const firstX = WIDTH + 70;
    const lastX = getGameplayEnd() + PLAYER_X - 60;
    shuffled.forEach((name, index) => {
      const image = images[name];
      const w = (image?.naturalWidth || 80) / 2;
      const h = (image?.naturalHeight || 80) / 2;
      const laneJitter = Math.random() * 10 - 5;
      let laneY;
      if (index === 2 || index === 3) {
        const centerLane = index === 2 ? 0.4 : 0.6;
        laneY = FIELD_TOP + (FIELD_BOTTOM - FIELD_TOP) * centerLane;
      } else {
        const topLane = index % 2 === 0;
        laneY = topLane
          ? FIELD_TOP + 8 + h / 2
          : FIELD_BOTTOM - 8 - h / 2;
      }
      const x = firstX + (lastX - firstX) * (index / (shuffled.length - 1));
      obstacles.push({ name, x, y: laneY + laneJitter, w, h, passed: false });
    });

    const shuffledTexts = [...textNames].sort(() => Math.random() - 0.5);
    decorations.length = 0;
    shuffledTexts.forEach((name, index) => {
      const image = images[name];
      const w = (image?.naturalWidth || 60) / 2 * TEXT_OBSTACLE_SCALE;
      const h = (image?.naturalHeight || 120) / 2 * TEXT_OBSTACLE_SCALE;
      const minX = WIDTH + 24;
      const maxX = getGameplayEnd() + PLAYER_X - 40;
      const x = minX + (maxX - minX) * (index / (shuffledTexts.length - 1));
      const lanes = [0.34, 0.67, 0.48];
      const y = FIELD_TOP + (FIELD_BOTTOM - FIELD_TOP) * lanes[index % lanes.length];
      decorations.push({
        name, x, y, w, h, passed: false,
        hitboxScaleX: 0.2, hitboxScaleY: 0.16,
        hitboxMinX: 4, hitboxMinY: 6
      });
    });
  }

  function setScreen(next) {
    screen = next;
    screenTime = 0;
    stage.dataset.screen = next;
    clickoutButton.setAttribute('aria-hidden', String(next !== 'fail' && next !== 'win'));
    replayButton.setAttribute('aria-hidden', String(next !== 'fail'));
  }

  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    Object.values(audio).forEach((sound) => { sound.muted = muted; });
  }

  function playSound(sound) {
    if (!audioUnlocked || muted || paused) return;
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

  function startRun() {
    unlockAudio();
    stopEndSounds();
    buildObstacles();
    elapsed = 0;
    worldScroll = 0;
    playerY = (FIELD_TOP + FIELD_BOTTOM) / 2;
    playerVelocity = 0;
    setScreen('ready');
    statusLabel.textContent = 'Get ready…';
    audio.music.currentTime = 0;
    audio.music.play().catch(() => {});
  }

  function getGameplayEnd() {
    return Math.max(0, getGameplayStripWidth() - WIDTH);
  }

  function getGameplayWidth() {
    const gut = images.gut;
    if (!gut?.naturalWidth || !gut.naturalHeight) return 0;
    return gut.naturalWidth / 2;
  }

  function getGameplayStripWidth() {
    return getGameplayWidth();
  }

  function drawGameplayStrip() {
    const gut = images.gut;
    if (!gut?.naturalWidth || !gut.naturalHeight) return;
    // Keep the 2x export at its intended 50% size and original y=0 alignment.
    // A small bleed lets the frame cover any transparent seams at the field edge.
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, FIELD_TOP - FIELD_BLEED, WIDTH, FIELD_BOTTOM - FIELD_TOP + FIELD_BLEED * 2);
    ctx.clip();
    drawImage('gut', -worldScroll, 0, gut.naturalWidth / 2, gut.naturalHeight / 2);
    ctx.restore();
  }

  function drawPlayfieldTexture() {
    const bleedTop = FIELD_TOP - FIELD_BLEED;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, bleedTop, WIDTH, FIELD_BOTTOM - FIELD_TOP + FIELD_BLEED * 2);
    ctx.clip();
    drawFull('texture');
    ctx.restore();
  }

  function stopEndSounds() {
    [audio.crash, audio.fail, audio.win].forEach((sound) => {
      sound.pause();
      sound.currentTime = 0;
    });
  }

  function jump() {
    if (screen === 'start') {
      startRun();
      return;
    }
    if (screen === 'ready') {
      unlockAudio();
      playerVelocity = -350;
      return;
    }
    if (screen !== 'playing') return;
    unlockAudio();
    playerVelocity = -360;
  }

  function setEndcard(result) {
    if (screen !== 'playing' && screen !== 'ready') return;
    audio.music.pause();
    if (result === 'fail') {
      playSound(audio.crash);
      window.setTimeout(() => { if (screen === 'fail') playSound(audio.fail); }, 180);
    } else {
      playSound(audio.win);
    }
    setScreen(result);
  }

  function getHitboxRadii(obstacle) {
    return {
      x: Math.max(obstacle.hitboxMinX ?? 7, obstacle.w * (obstacle.hitboxScaleX ?? 0.28)),
      y: Math.max(obstacle.hitboxMinY ?? 8, obstacle.h * (obstacle.hitboxScaleY ?? 0.25))
    };
  }

  function drawHitbox(obstacle, x) {
    const radii = getHitboxRadii(obstacle);
    ctx.beginPath();
    ctx.ellipse(x, obstacle.y, radii.x, radii.y, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  function collide(obstacle) {
    const obstacleRadius = getHitboxRadii(obstacle);
    const dx = PLAYER_X - (obstacle.x - worldScroll);
    const dy = playerY - obstacle.y;
    const xRadius = PLAYER_COLLISION_RADIUS + obstacleRadius.x;
    const yRadius = PLAYER_COLLISION_RADIUS + obstacleRadius.y;
    return (dx * dx) / (xRadius * xRadius) + (dy * dy) / (yRadius * yRadius) < 1;
  }

  function drawStart() {
    drawFull('bg');
    drawPlayfieldTexture();
    drawGameplayStrip();
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, FIELD_TOP, WIDTH, FIELD_BOTTOM - FIELD_TOP);
    ctx.clip();
    drawImage('player', 47, 261 + Math.sin(decorativeTime * 2.4) * 3, 42, 41);
    drawImage('bac1', 91, 321, 39, 37);
    drawImage('txt1', 101, 374, 23, 94);
    drawImage('bac2', 270, 317, 22, 77);
    drawImage('txt2', 299, 390, 34, 113);
    ctx.restore();
    drawFull('border');
    const intro = reducedMotion ? 1 : Math.min(1, decorativeTime / 0.65);
    drawFull('tut', intro);
    const gesturePulse = reducedMotion ? 1 : 0.97 + Math.sin(decorativeTime * 4) * 0.03;
    drawImage('gesture', 137, 430, 86 * gesturePulse, 96 * gesturePulse);
    drawFull('logo');
  }

  function drawGameplay() {
    drawFull('bg');
    drawPlayfieldTexture();
    drawGameplayStrip();
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, FIELD_TOP, WIDTH, FIELD_BOTTOM - FIELD_TOP);
    ctx.clip();
    decorations.forEach((decoration) => {
      if (decoration.passed) return;
      const x = decoration.x - worldScroll;
      if (x + decoration.w / 2 < -10 || x - decoration.w / 2 > WIDTH + 10) return;
      drawImage(decoration.name, x - decoration.w / 2, decoration.y - decoration.h / 2, decoration.w, decoration.h, 0.88);
      if (debug) {
        ctx.save();
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 1.5;
        drawHitbox(decoration, x);
        ctx.stroke();
        ctx.restore();
      }
    });
    obstacles.forEach((obstacle) => {
      if (obstacle.passed) return;
      const x = obstacle.x - worldScroll;
      if (x + obstacle.w < -10 || x > WIDTH + 10) return;
      drawImage(obstacle.name, x - obstacle.w / 2, obstacle.y - obstacle.h / 2, obstacle.w, obstacle.h);
      if (debug) {
        ctx.save();
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 1.5;
        drawHitbox(obstacle, x);
        ctx.stroke();
        ctx.restore();
      }
    });
    const bob = reducedMotion ? 0 : Math.sin(elapsed * 8) * 1.5;
    drawImage('player', PLAYER_X - 21, playerY - 20 + bob, 42, 41);
    if (debug) {
      ctx.save();
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(PLAYER_X, playerY, PLAYER_COLLISION_RADIUS, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
    drawFull('border');
    drawFull('tut');
    drawFull('logo');
  }

  function drawEndcard(result) {
    drawFull('bg');
    const names = result === 'fail'
      ? ['bubble', 'sad', 'bac1', 'bac2', 'bac3', 'bac4', 'bac5', 'hl', 'cta', 'replay']
      : ['bubble', 'konfetti', 'happy', 'hl', 'cta'];
    const entrance = (index) => reducedMotion ? 1 : Math.max(0, Math.min(1, (screenTime - index * 0.105) / 0.42));
    names.forEach((name, index) => {
      const progress = entrance(index);
      if (progress <= 0) return;
      const eased = 1 - ((1 - progress) ** 3);
      const scale = name === 'cta' || name === 'replay'
        ? 0.96 + eased * 0.04
        : (index < 7 ? 0.99 + eased * 0.01 : 1);
      if (name === 'cta' || name === 'replay') {
        const x = name === 'replay' ? 38 : (result === 'win' ? 27 : 38);
        const y = name === 'replay' ? 537 : (result === 'win' ? 560 : 482);
        const width = name === 'replay' ? 185.5 : (result === 'win' ? 214 : 186);
        const height = name === 'replay' ? 40.5 : (result === 'win' ? 45.5 : 38.5);
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;
        drawImage(`${result}-${name}`, x + (width - scaledWidth) / 2, y + (height - scaledHeight) / 2, scaledWidth, scaledHeight, eased);
      } else {
        drawFull(`${result}-${name}`, eased, scale);
      }
    });
    drawFull('logo');
  }

  function draw() {
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    if (screen === 'start' || screen === 'loading') drawStart();
    else if (screen === 'ready' || screen === 'playing') drawGameplay();
    else if (screen === 'fail' || screen === 'win') drawEndcard(screen);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  function frame(timestamp) {
    requestAnimationFrame(frame);
    if (paused) {
      lastFrame = timestamp;
      return;
    }
    const delta = Math.min(0.034, Math.max(0, (timestamp - (lastFrame || timestamp)) / 1000));
    lastFrame = timestamp;
    decorativeTime += delta;
    screenTime += delta;

    if (screen === 'ready') {
      if (screenTime >= 0.75) {
        setScreen('playing');
        skipNextGameplayStep = true;
        statusLabel.textContent = '';
      }
    } else if (screen === 'playing') {
      if (skipNextGameplayStep) {
        skipNextGameplayStep = false;
        draw();
        return;
      }
      elapsed += delta;
      const ramp = Math.min(35, elapsed * 1.25);
      const speed = 155 + ramp;
      worldScroll += speed * delta;
      playerVelocity += 760 * delta;
      playerY += playerVelocity * delta;
      if (playerY - PLAYER_EDGE_RADIUS <= FIELD_TOP || playerY + PLAYER_EDGE_RADIUS >= FIELD_BOTTOM) {
        setEndcard('fail');
      } else {
        for (const obstacle of obstacles) {
          const x = obstacle.x - worldScroll;
          if (!obstacle.passed && collide(obstacle)) {
            setEndcard('fail');
            break;
          }
          if (!obstacle.passed && x + obstacle.w / 2 < PLAYER_X - 16) obstacle.passed = true;
        }
        for (const decoration of decorations) {
          const x = decoration.x - worldScroll;
          if (!decoration.passed && collide(decoration)) {
            setEndcard('fail');
            break;
          }
          if (!decoration.passed && x + decoration.w / 2 < PLAYER_X - 16) decoration.passed = true;
        }
        const gameplayEnd = getGameplayEnd();
        if (screen === 'playing') worldScroll = Math.min(worldScroll, gameplayEnd);
        if (screen === 'playing' && worldScroll >= gameplayEnd && obstacles.every((obstacle) => obstacle.passed)
          && decorations.every((decoration) => decoration.passed)) {
          setEndcard('win');
        }
      }
    }
    draw();
  }

  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    jump();
  });
  stage.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
      event.preventDefault();
      jump();
    }
  });
  stage.tabIndex = 0;

  muteButton.addEventListener('click', () => {
    muted = !muted;
    Object.values(audio).forEach((sound) => { sound.muted = muted; });
    muteButton.setAttribute('aria-pressed', String(muted));
    muteButton.setAttribute('aria-label', muted ? 'Unmute sound' : 'Mute sound');
    if (!muted && audioUnlocked && screen === 'playing' && audio.music.paused) audio.music.play().catch(() => {});
  });

  clickoutButton.addEventListener('click', (event) => {
    event.stopPropagation();
    window.open(clickTag, '_blank', 'noopener,noreferrer');
  });

  replayButton.addEventListener('click', (event) => {
    event.stopPropagation();
    audio.music.pause();
    audio.music.currentTime = 0;
    stopEndSounds();
    setScreen('start');
  });

  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
    lastFrame = 0;
    if (paused) {
      pausedSounds.clear();
      Object.values(audio).forEach((sound) => {
        if (!sound.paused) pausedSounds.add(sound);
        sound.pause();
      });
    } else if (audioUnlocked && !muted) {
      pausedSounds.forEach((sound) => sound.play().catch(() => {}));
      pausedSounds.clear();
    }
  });

  window.addEventListener('resize', fitStage, { passive: true });
  window.visualViewport?.addEventListener('resize', fitStage, { passive: true });
  window.visualViewport?.addEventListener('scroll', fitStage, { passive: true });
  fitStage();
  loadImages();
  requestAnimationFrame(frame);
})();