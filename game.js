const WORD_BANK = {
  "Animals": ["ELEPHANT", "GIRAFFE", "PENGUIN", "OCTOPUS", "KANGAROO", "GOAT", "FLAMINGO", "DANYDAHAN", "GOOB"],
  "Food": ["PIZZA", "AVOCADO", "PRETZEL", "SPAGHETTI", "PANCAKE", "BURRITO", "BEANS"],
  "Places": ["MOUNTAIN", "LIBRARY", "VOLCANO", "DESERT", "HARBOR", "MEADOW"],
  "Tech": ["KEYBOARD", "JAVASCRIPT", "BROWSER", "ALGORITHM", "NETWORK", "PIXEL"],
  "Things": ["UMBRELLA", "TELESCOPE", "COMPASS", "LANTERN", "BACKPACK", "HAMMOCK", "QUIRE", "SYZYGY", "CHARGOGGAGOGGMANCHAUGGAGOGGCHAUBUNAGUNGAMAUGG", "CATAWAMPUS", "PETRICHOR", "GUBERNATORIAL", "CACTUS", "WHATDOYOUCALLABEARWITHNOTEETHAGUMMYBEAR", "TUNGTUNGTUNGTUNGTUNGTUNGTUNGTUNGTUNGTUNGTUNGTUNGTUNGTUNGTUNGTUNGTUNGTUNGTUNGSAHUR"],
};

const MAX_WRONG = 6;
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

let category = "";
let word = "";
let guessed = new Set();
let wrongCount = 0;
let gameOver = false;
let customChallenge = null;

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

function loadDannyUnlocked() {
  try {
    return localStorage.getItem("leashGoatDannyUnlocked") === "true";
  } catch (err) {
    return false;
  }
}

function saveDannyUnlocked(value) {
  try {
    localStorage.setItem("leashGoatDannyUnlocked", String(value));
  } catch (err) {
    // localStorage unavailable; unlock just won't persist.
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
let dannyUnlocked = loadDannyUnlocked();
let correctStreak = 0;

const SKINS = {
  goat: { label: "🐐 Goat", isUnlocked: () => true },
  bunny: { label: "🐰 Bunny", unlockWins: 3, isUnlocked: () => wins >= 3 },
  llama: { label: "🦙 Llama", unlockWins: 5, isUnlocked: () => wins >= 5 },
  goob: { label: "🐩 Goob", unlockWins: 10, isUnlocked: () => wins >= 10 },
  danny: { label: "😄 Danny", isUnlocked: () => dannyUnlocked },
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
  renderGoat();
}

skinButtons.forEach((btn) => {
  btn.addEventListener("click", () => selectSkin(btn.dataset.skin));
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

function renderGoat() {
  document.querySelectorAll(".skin.active [data-stage]").forEach((part) => {
    const stage = Number(part.dataset.stage);
    part.classList.toggle("visible", stage <= wrongCount);
  });
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

function renderStatus() {
  const remaining = MAX_WRONG - wrongCount;
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

function checkGameEnd() {
  const solved = word.split("").every((ch) => ch === " " || guessed.has(ch));
  if (solved) {
    gameOver = true;
    const previousWins = wins;
    wins++;
    saveWins(wins);
    const justUnlocked = Object.entries(SKINS).find(
      ([, skin]) => skin.unlockWins === wins && previousWins < skin.unlockWins
    );
    statusEl.textContent = justUnlocked
      ? `You win! The goat stays leashed. 🐐 New skin unlocked: ${justUnlocked[1].label}!`
      : "You win! The goat stays leashed. 🐐";
    statusEl.className = "status win";
    updateSkinUI();
    playCheer();
  } else if (wrongCount >= MAX_WRONG) {
    gameOver = true;
    statusEl.textContent = `The goat broke free! The word was ${word}.`;
    statusEl.className = "status lose";
    playWomp();
  }
  if (gameOver) {
    document.querySelectorAll(".key").forEach((btn) => (btn.disabled = true));
  }
}

function guess(letter) {
  if (gameOver || guessed.has(letter)) return;
  guessed.add(letter);
  if (!word.includes(letter)) {
    wrongCount++;
    correctStreak = 0;
    playBaa();
  } else {
    correctStreak++;
    if (correctStreak >= 3 && !dannyUnlocked) {
      dannyUnlocked = true;
      saveDannyUnlocked(true);
      updateSkinUI();
      statusEl.textContent = "😄 New skin unlocked: Danny! (3 correct guesses in a row)";
      statusEl.className = "status win";
    }
  }
  renderWord();
  renderGoat();
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
  statusEl.textContent = "";
  statusEl.className = "status";
  categoryEl.textContent = customChallenge
    ? customChallenge.hint
      ? `🎯 Friend's hint: ${customChallenge.hint}`
      : "🎯 Solve your friend's word!"
    : `Category: ${category}`;
  newGameBtn.textContent = customChallenge ? "Play Again" : "New Game";
  buildKeyboard();
  renderWord();
  renderGoat();
  renderStatus();
}

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
