# 🐐 Leash Goat

Hangman, but wrong guesses draw a goat at the end of a leash instead of a
gallows figure. Guess the word before the goat is fully drawn and breaks
free.

Play it here: **https://gclark22.github.io/leash_goat/**

## Features

- Classic hangman rules with a cartoon leash-goat drawing instead of a
  stick figure, revealed head-to-feet as you guess wrong
- Sound effects: a bleat on a wrong guess, a sad trombone on a loss, and a
  cheer on a win (synthesized in the browser, no audio files)
- A win counter (saved in your browser) that unlocks alternate character
  skins: 🐰 Bunny at 3 wins, 🦙 Llama at 5 wins, 🐩 Goob (a golden doodle) at
  10 wins
- **Challenge a Friend**: type your own word or phrase and hint, generate a
  shareable link, and send it to a friend to solve. The word is encoded in
  the link itself (no server/database), so it works on GitHub Pages as-is.
  It's just base64 encoding, not encryption — fine for party-game fun, not
  for actual secrets.

## Running locally

This is a plain static site (`index.html`, `style.css`, `game.js`) with no
build step. Either open `index.html` directly in a browser, or serve it
with any static file server, e.g.:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.
