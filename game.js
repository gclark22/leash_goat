const WORD_BANK = {
  "Animals": ["ELEPHANT", "GIRAFFE", "PENGUIN", "OCTOPUS", "KANGAROO", "GOAT", "FLAMINGO", "DANYDAHAN", "GOOB"],
  "Food": ["PIZZA", "AVOCADO", "PRETZEL", "SPAGHETTI", "PANCAKE", "BURRITO", "BEANS"],
  "Places": ["MOUNTAIN", "LIBRARY", "VOLCANO", "DESERT", "HARBOR", "MEADOW", "DEMOCRATICREPUBLICOFTHECONGO", "DANTOPIA"],
  "Tech": ["KEYBOARD", "JAVASCRIPT", "BROWSER", "ALGORITHM", "NETWORK", "PIXEL", "COMPUTER"],
  "Things": ["UMBRELLA", "TELESCOPE", "COMPASS", "LANTERN", "BACKPACK", "HAMMOCK", "QUIRE", "SYZYGY", "CHARGOGGAGOGGMANCHAUGGAGOGGCHAUBUNAGUNGAMAUGG", "CATAWAMPUS", "PETRICHOR", "GUBERNATORIAL", "CACTUS", "WHATDOYOUCALLABEARWITHNOTEETHAGUMMYBEAR", "TUNGTUNGTUNGTUNGTUNGTUNGTUNGTUNGTUNGTUNGTUNGTUNGTUNGTUNGTUNGTUNGTUNGTUNGTUNGSAHUR", "GARAGEKEYS"],
};

const CLASSIC_MAX_WRONG = 6;
const GOAT_MODE_MAX_WRONG = 3;
const GOAT_MODE_SECONDS = 30;
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

let category = "";
let word = "";
let guessed = new Set();
let wrongCount = 0;
let gameOver = false;
let customChallenge = null;
let mode = "classic";
let maxWrong = CLASSIC_MAX_WRONG;
let timeLeft = 0;
let timerInterval = null;

const wordEl = document.getElementById("word");
const categoryEl = document.getElementById("category");
const statusEl = document.getElementById("status");
const guessesLeftEl = document.getElementById("guesses-left");
const keyboardEl = document.getElementById("keyboard");
const newGameBtn = document.getElementById("new-game");
const challengeBtn = document.getElementById("challenge-btn");
const playRandomBtn = document.getElementById("play-random-btn");
const challengePanel = document.getElementById("challenge-panel");
const challengeWordInput = document.getElementById("challenge-word");
const challengeHintInput = document.getElementById("challenge-hint");
const challengeErrorEl = document.getElementById("challenge-error");
const generateLinkBtn = document.getElementById("generate-link");
const linkOutput = document.getElementById("link-output");
const challengeLinkInput = document.getElementById("challenge-link");
const copyLinkBtn = document.getElementById("copy-link");
const winCounterEl = document.getElementById("win-counter");
const skinButtons = document.querySelectorAll(".skin-option");
const secretButton = document.getElementById("secret-button");
const goatInsultEl = document.getElementById("goat-insult");

const GOAT_INSULTS = [
  "Really? That's your guess?",
  "Baaaad guess. Truly baaaad.",
  "My hay bale could've guessed better.",
  "Is that your final answer? Please say no.",
  "Even the barrel saw that one coming.",
  "I've met sheep with better vocabulary.",
  "Wow. Just... wow.",
  "That guess offends me personally.",
  "Try using the alphabet, not the void.",
  "I'm leashed, not blind. That was rough.",
];
const modeButtons = document.querySelectorAll(".mode-option");
const modeDescriptionEl = document.getElementById("mode-description");
const timerDisplayEl = document.getElementById("timer-display");
const goatModeProgressEl = document.getElementById("goat-mode-progress");
const classicSceneEl = document.getElementById("classic-scene");
const barrelSceneEl = document.getElementById("barrel-scene");
const skinsSectionEl = document.getElementById("skins-section");

function loadWins() {
  try {
    return parseInt(localStorage.getItem("leashGoatWins"), 10) || 0;
  } catch (err) {
    return 0;
  }
}

function saveWins(count) {
  try {
    localStorage.setItem("leashGoatWins", String(count));
  } catch (err) {
    // localStorage unavailable; win count just won't persist.
  }
}

function loadDanyUnlocked() {
  try {
    return localStorage.getItem("leashGoatDanyUnlocked") === "true";
  } catch (err) {
    return false;
  }
}

function saveDanyUnlocked(value) {
  try {
    localStorage.setItem("leashGoatDanyUnlocked", String(value));
  } catch (err) {
    // localStorage unavailable; unlock just won't persist.
  }
}

function loadGoldenDanyUnlocked() {
  try {
    return localStorage.getItem("leashGoatGoldenDanyUnlocked") === "true";
  } catch (err) {
    return false;
  }
}

function saveGoldenDanyUnlocked(value) {
  try {
    localStorage.setItem("leashGoatGoldenDanyUnlocked", String(value));
  } catch (err) {
    // localStorage unavailable; unlock just won't persist.
  }
}

function loadGoatModeWins() {
  try {
    return parseInt(localStorage.getItem("leashGoatGoatModeWins"), 10) || 0;
  } catch (err) {
    return 0;
  }
}

function saveGoatModeWins(count) {
  try {
    localStorage.setItem("leashGoatGoatModeWins", String(count));
  } catch (err) {
    // localStorage unavailable; GOAT Mode win count just won't persist.
  }
}

function loadSkin() {
  try {
    return localStorage.getItem("leashGoatSkin") || "goat";
  } catch (err) {
    return "goat";
  }
}

function saveSkin(skinName) {
  try {
    localStorage.setItem("leashGoatSkin", skinName);
  } catch (err) {
    // localStorage unavailable; skin choice just won't persist.
  }
}

let wins = loadWins();
let goatModeWins = loadGoatModeWins();
let danyUnlocked = loadDanyUnlocked();
let goldenDanyUnlocked = loadGoldenDanyUnlocked();
let correctStreak = 0;

const SKINS = {
  goat: { label: "🐐 Goat", isUnlocked: () => true },
  bunny: { label: "🐰 Bunny", counterName: "wins", unlockThreshold: 3, isUnlocked: () => wins >= 3 },
  llama: { label: "🦙 Llama", counterName: "wins", unlockThreshold: 5, isUnlocked: () => wins >= 5 },
  goob: { label: "🐩 Goob", counterName: "wins", unlockThreshold: 10, isUnlocked: () => wins >= 10 },
  dany: { label: "😄 Dany", isUnlocked: () => danyUnlocked },
  "dany-gold": { label: "✨ Golden Dany", isUnlocked: () => goldenDanyUnlocked },
  cat: { label: "🐱 Cat", counterName: "goatModeWins", unlockThreshold: 3, isUnlocked: () => goatModeWins >= 3 },
  "super-goat": { label: "🦸 Super Goat", counterName: "goatModeWins", unlockThreshold: 5, isUnlocked: () => goatModeWins >= 5 },
};

let selectedSkin = loadSkin();
if (!SKINS[selectedSkin] || !SKINS[selectedSkin].isUnlocked()) {
  selectedSkin = "goat";
}

function updateSkinUI() {
  winCounterEl.textContent = `🏆 Wins: ${wins}`;
  skinButtons.forEach((btn) => {
    const skin = SKINS[btn.dataset.skin];
    const unlocked = skin.isUnlocked();
    btn.disabled = !unlocked;
    btn.classList.toggle("selected", btn.dataset.skin === selectedSkin);
    const lock = btn.querySelector(".lock");
    if (lock) lock.hidden = unlocked;
  });
  document.querySelectorAll(".skin").forEach((svg) => {
    svg.classList.toggle("active", svg.dataset.skin === selectedSkin);
  });
}

function selectSkin(skinName) {
  const skin = SKINS[skinName];
  if (!skin || !skin.isUnlocked()) return;
  selectedSkin = skinName;
  saveSkin(selectedSkin);
  updateSkinUI();
  renderScene();
}

skinButtons.forEach((btn) => {
  btn.addEventListener("click", () => selectSkin(btn.dataset.skin));
});

secretButton.addEventListener("click", () => {
  if (goldenDanyUnlocked) return;
  goldenDanyUnlocked = true;
  saveGoldenDanyUnlocked(true);
  updateSkinUI();
  statusEl.textContent = "✨ Secret unlocked: Golden Dany!";
  statusEl.className = "status win";
});

function sanitizeWord(raw) {
  return raw
    .toUpperCase()
    .replace(/[^A-Z ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function encodeChallenge(customWord, hint) {
  const payload = JSON.stringify({ w: customWord, h: hint || "" });
  return btoa(unescape(encodeURIComponent(payload)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function decodeChallenge(encoded) {
  try {
    let b64 = decodeURIComponent(encoded).replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const payload = JSON.parse(decodeURIComponent(escape(atob(b64))));
    const decodedWord = sanitizeWord(String(payload.w || ""));
    if (!decodedWord || decodedWord.replace(/ /g, "").length < 2) return null;
    return { word: decodedWord, hint: String(payload.h || "").slice(0, 80) };
  } catch (err) {
    return null;
  }
}

function readChallengeFromLocation() {
  const match = window.location.hash.match(/play=([^&]+)/);
  return match ? decodeChallenge(match[1]) : null;
}

function pickWord() {
  const categories = Object.keys(WORD_BANK);
  category = categories[Math.floor(Math.random() * categories.length)];
  const words = WORD_BANK[category];
  word = words[Math.floor(Math.random() * words.length)];
}

function buildKeyboard() {
  keyboardEl.innerHTML = "";
  LETTERS.forEach((letter) => {
    const btn = document.createElement("button");
    btn.className = "key";
    btn.textContent = letter;
    btn.dataset.letter = letter;
    btn.addEventListener("click", () => guess(letter));
    keyboardEl.appendChild(btn);
  });
}

function renderWord() {
  wordEl.textContent = word
    .split("")
    .map((ch) => (ch === " " ? "  " : guessed.has(ch) ? ch : "_"))
    .join(" ");
}

function renderScene() {
  if (mode === "goat") {
    const capped = Math.min(wrongCount, GOAT_MODE_MAX_WRONG);
    document.querySelectorAll(".barrel-frame").forEach((frame) => {
      frame.classList.toggle("visible", Number(frame.dataset.mistakes) === capped);
    });
  } else {
    document.querySelectorAll(".skin.active [data-stage]").forEach((part) => {
      const stage = Number(part.dataset.stage);
      part.classList.toggle("visible", stage <= wrongCount);
    });
  }
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimerDisplay() {
  timerDisplayEl.textContent = `⏱️ ${timeLeft}s`;
  timerDisplayEl.classList.toggle("low-time", timeLeft <= 10);
}

function startTimer() {
  stopTimer();
  timeLeft = GOAT_MODE_SECONDS;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      wrongCount = maxWrong;
      renderScene();
      endGame(false, "timeout");
    }
  }, 1000);
}

function updateGoatModeProgress() {
  goatModeProgressEl.textContent = `🔥 GOAT Mode Wins: ${goatModeWins}`;
}

let audioCtx = null;

function playBaa() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();

    const now = audioCtx.currentTime;
    const duration = 0.55;

    const osc = audioCtx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(230, now + duration);

    const vibrato = audioCtx.createOscillator();
    vibrato.type = "sine";
    vibrato.frequency.value = 9;
    const vibratoGain = audioCtx.createGain();
    vibratoGain.gain.value = 35;
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);

    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1400;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    vibrato.start(now);
    osc.stop(now + duration);
    vibrato.stop(now + duration);
  } catch (err) {
    // Web Audio unsupported or blocked; fail silently.
  }
}

function createNoiseBuffer(ctx, duration) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function playWomp() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();

    const now = audioCtx.currentTime;
    const notes = [
      { start: 220, end: 165, at: now, dur: 0.32 },
      { start: 200, end: 145, at: now + 0.3, dur: 0.32 },
      { start: 180, end: 75, at: now + 0.6, dur: 0.6 },
    ];

    notes.forEach(({ start, end, at, dur }) => {
      const osc = audioCtx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(start, at);
      osc.frequency.exponentialRampToValueAtTime(end, at + dur);

      const filter = audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 800;

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.28, at + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(at);
      osc.stop(at + dur + 0.05);
    });
  } catch (err) {
    // Web Audio unsupported or blocked; fail silently.
  }
}

function playCheer() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();

    const now = audioCtx.currentTime;
    const duration = 1.1;

    const noise = audioCtx.createBufferSource();
    noise.buffer = createNoiseBuffer(audioCtx, duration);

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.Q.value = 0.7;
    noiseFilter.frequency.setValueAtTime(500, now);
    noiseFilter.frequency.linearRampToValueAtTime(2200, now + duration);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.22, now + 0.15);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start(now);
    noise.stop(now + duration);

    const fanfare = [523.25, 659.25, 783.99, 1046.5];
    fanfare.forEach((freq, i) => {
      const at = now + i * 0.12;
      const osc = audioCtx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.25, at + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.3);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(at);
      osc.stop(at + 0.32);
    });
  } catch (err) {
    // Web Audio unsupported or blocked; fail silently.
  }
}

let musicPlaying = false;
let musicStepTimer = null;

function scheduleMusicStep(stepIndex) {
  if (!musicPlaying) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();

    const now = audioCtx.currentTime;
    const isAccent = stepIndex % 4 === 0;

    const bass = audioCtx.createOscillator();
    bass.type = "square";
    bass.frequency.setValueAtTime(isAccent ? 110 : 82, now);
    bass.frequency.exponentialRampToValueAtTime(40, now + 0.18);
    const bassGain = audioCtx.createGain();
    bassGain.gain.setValueAtTime(isAccent ? 0.32 : 0.2, now);
    bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    bass.connect(bassGain);
    bassGain.connect(audioCtx.destination);
    bass.start(now);
    bass.stop(now + 0.2);

    if (stepIndex % 2 === 0) {
      const stab = audioCtx.createOscillator();
      stab.type = "sawtooth";
      stab.frequency.value = 220 + (stepIndex % 8) * 15;
      const stabFilter = audioCtx.createBiquadFilter();
      stabFilter.type = "highpass";
      stabFilter.frequency.value = 800;
      const stabGain = audioCtx.createGain();
      stabGain.gain.setValueAtTime(0.0001, now);
      stabGain.gain.exponentialRampToValueAtTime(0.07, now + 0.02);
      stabGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      stab.connect(stabFilter);
      stabFilter.connect(stabGain);
      stabGain.connect(audioCtx.destination);
      stab.start(now);
      stab.stop(now + 0.15);
    }
  } catch (err) {
    // Web Audio unsupported or blocked; skip this step silently.
  }
  musicStepTimer = setTimeout(() => scheduleMusicStep(stepIndex + 1), 200);
}

function startIntenseMusic() {
  if (musicPlaying) return;
  musicPlaying = true;
  scheduleMusicStep(0);
}

function stopIntenseMusic() {
  musicPlaying = false;
  if (musicStepTimer) {
    clearTimeout(musicStepTimer);
    musicStepTimer = null;
  }
}

function renderStatus() {
  const remaining = maxWrong - wrongCount;
  guessesLeftEl.textContent = gameOver
    ? ""
    : `Wrong guesses left: ${remaining}`;
}

function updateKeyStates() {
  document.querySelectorAll(".key").forEach((btn) => {
    const letter = btn.dataset.letter;
    if (guessed.has(letter)) {
      btn.disabled = true;
      btn.classList.add(word.includes(letter) ? "correct" : "wrong");
    }
  });
}

function findNewlyUnlocked(counterName, previousValue, currentValue) {
  return Object.entries(SKINS).find(
    ([, skin]) =>
      skin.counterName === counterName &&
      skin.unlockThreshold === currentValue &&
      previousValue < skin.unlockThreshold
  );
}

function endGame(won, reason) {
  gameOver = true;
  stopTimer();
  stopIntenseMusic();

  if (won) {
    const previousWins = wins;
    wins++;
    saveWins(wins);

    let goatModeUnlock = null;
    if (mode === "goat") {
      const previousGoatModeWins = goatModeWins;
      goatModeWins++;
      saveGoatModeWins(goatModeWins);
      goatModeUnlock = findNewlyUnlocked("goatModeWins", previousGoatModeWins, goatModeWins);
      updateGoatModeProgress();
    }
    const winsUnlock = findNewlyUnlocked("wins", previousWins, wins);
    const justUnlocked = goatModeUnlock || winsUnlock;

    const winMessage =
      mode === "goat" ? "You win! GOAT Mode conquered! 🔥" : "You win! The goat stays leashed. 🐐";
    statusEl.textContent = justUnlocked
      ? `${winMessage} New skin unlocked: ${justUnlocked[1].label}!`
      : winMessage;
    statusEl.className = "status win";
    updateSkinUI();
    playCheer();
  } else {
    const loseMessage =
      mode === "goat"
        ? reason === "timeout"
          ? `Time's up! The goat tumbled into the hay barrel. The word was ${word}.`
          : `Three strikes — into the hay barrel! The word was ${word}.`
        : `The goat broke free! The word was ${word}.`;
    statusEl.textContent = loseMessage;
    statusEl.className = "status lose";
    playWomp();
  }

  document.querySelectorAll(".key").forEach((btn) => (btn.disabled = true));
}

function checkGameEnd() {
  const solved = word.split("").every((ch) => ch === " " || guessed.has(ch));
  if (solved) {
    endGame(true);
  } else if (wrongCount >= maxWrong) {
    endGame(false, "mistakes");
  }
}

function guess(letter) {
  if (gameOver || guessed.has(letter)) return;
  guessed.add(letter);
  if (!word.includes(letter)) {
    wrongCount++;
    correctStreak = 0;
    playBaa();
    goatInsultEl.textContent = GOAT_INSULTS[Math.floor(Math.random() * GOAT_INSULTS.length)];
  } else {
    correctStreak++;
    if (correctStreak >= 3 && !danyUnlocked) {
      danyUnlocked = true;
      saveDanyUnlocked(true);
      updateSkinUI();
      statusEl.textContent = "😄 New skin unlocked: Dany! (3 correct guesses in a row)";
      statusEl.className = "status win";
    }
  }
  renderWord();
  renderScene();
  renderStatus();
  updateKeyStates();
  checkGameEnd();
}

function newGame() {
  if (customChallenge) {
    word = customChallenge.word;
    category = "";
  } else {
    pickWord();
  }
  guessed = new Set();
  wrongCount = 0;
  correctStreak = 0;
  gameOver = false;
  maxWrong = mode === "goat" ? GOAT_MODE_MAX_WRONG : CLASSIC_MAX_WRONG;
  statusEl.textContent = "";
  statusEl.className = "status";
  goatInsultEl.textContent = "";
  categoryEl.textContent = customChallenge
    ? customChallenge.hint
      ? `🎯 Friend's hint: ${customChallenge.hint}`
      : "🎯 Solve your friend's word!"
    : `Category: ${category}`;
  newGameBtn.textContent = customChallenge ? "Play Again" : "New Game";
  buildKeyboard();
  renderWord();
  renderScene();
  renderStatus();
  if (mode === "goat") {
    startTimer();
    startIntenseMusic();
  } else {
    stopTimer();
    stopIntenseMusic();
  }
}

function setMode(newMode) {
  if (mode === newMode) return;
  mode = newMode;
  const isGoatMode = mode === "goat";

  modeButtons.forEach((btn) => btn.classList.toggle("selected", btn.dataset.mode === mode));
  classicSceneEl.hidden = isGoatMode;
  barrelSceneEl.hidden = !isGoatMode;
  skinsSectionEl.hidden = isGoatMode;
  timerDisplayEl.hidden = !isGoatMode;
  goatModeProgressEl.hidden = !isGoatMode;
  modeDescriptionEl.textContent = isGoatMode
    ? "30 seconds on the clock, only 3 mistakes allowed. Miss the clock or strike out and the goat tumbles into the hay barrel."
    : "6 wrong guesses allowed, no timer.";

  if (isGoatMode) updateGoatModeProgress();
  newGame();
}

modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => setMode(btn.dataset.mode));
});

function exitCustomMode() {
  customChallenge = null;
  playRandomBtn.hidden = true;
  history.replaceState(null, "", window.location.pathname + window.location.search);
  newGame();
}

document.addEventListener("keydown", (e) => {
  const letter = e.key.toUpperCase();
  if (LETTERS.includes(letter)) {
    guess(letter);
  }
});

newGameBtn.addEventListener("click", newGame);
playRandomBtn.addEventListener("click", exitCustomMode);

challengeBtn.addEventListener("click", () => {
  challengePanel.hidden = !challengePanel.hidden;
});

generateLinkBtn.addEventListener("click", () => {
  const customWord = sanitizeWord(challengeWordInput.value);
  if (!customWord || customWord.replace(/ /g, "").length < 2) {
    challengeErrorEl.textContent = "Enter a word or phrase with at least 2 letters (letters and spaces only).";
    linkOutput.hidden = true;
    return;
  }
  challengeErrorEl.textContent = "";
  const hint = challengeHintInput.value.trim().slice(0, 80);
  const url = new URL(window.location.href);
  url.hash = `play=${encodeChallenge(customWord, hint)}`;
  challengeLinkInput.value = url.toString();
  linkOutput.hidden = false;
});

copyLinkBtn.addEventListener("click", async () => {
  challengeLinkInput.select();
  try {
    await navigator.clipboard.writeText(challengeLinkInput.value);
  } catch (err) {
    document.execCommand("copy");
  }
  copyLinkBtn.textContent = "Copied!";
  setTimeout(() => (copyLinkBtn.textContent = "Copy"), 1500);
});

customChallenge = readChallengeFromLocation();
if (customChallenge) playRandomBtn.hidden = false;
updateSkinUI();
newGame();
