const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { isDeepStrictEqual } = require('node:util');
class Element {
  constructor(tag, attrs = {}, ...children) {
    this.tag = tag; this.attrs = attrs || {}; this.children = children.flat();
    this.style = {}; this.disabled = !!this.attrs.disabled; this.hidden = !!this.attrs.hidden;
  }
  append(...children) { this.children.push(...children.flat()); }
  set textContent(text) { this.children = [String(text)]; }
  get textContent() { return this.children.map(c => c instanceof Element ? c.textContent : c).join(''); }
  setAttribute(key, value) { this.attrs[key] = value; }
  focus() {}
  click() { if (!this.disabled && !this.hidden) this.attrs.onclick(); }
}
let seed = 123456789;
function random() { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; }
const math = Object.create(Math); math.random = random;
let game;
const context = { Math: math, JS: {
  UI: { el: (...args) => new Element(...args), melanger(values) {
    const out = [...values];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }},
  Jeux: { register(value) { game = value; } }
}};
context.window = context;
vm.createContext(context);
for (const file of ['js/data/mots.js', 'js/games/tour-mots.js']) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
}
const dictionary = new Set(Object.values(context.JS.Donnees.mots).flatMap(t => t.mots).map(context.JS.Donnees.motEnGrille));

/**
 * Une partie complète. Sans `recorded`, chaque mot est obtenu par « Trouver un mot »
 * (cases surlignées sans ordre, mot compté pour moitié) ; avec `recorded`, la même grille
 * (même graine) est rejouée sans aide en touchant les parcours enregistrés.
 */
function partie(level, recorded) {
  const root = new Element('div');
  let result, calls = 0, message = '';
  const cleanup = game.start({ root, niveau: level, actif: () => true,
    message(text) { message = text; }, audio: { succes() {} },
    terminer(value) { result = value; calls++; } });
  const zone = root.children[0], cells = zone.children[1].children;
  const [validate, clear, hint] = zone.children[3].children;
  const length = level + 2, height = 5;
  const width = Math.ceil(length * length / height) + 2;
  const adjacent = (a, b) => Math.abs(a % width - b % width) + Math.abs(Math.floor(a / width) - Math.floor(b / width)) === 1;
  const letters = () => cells.map(c => c.attrs['aria-label'].split(',')[0]);
  const path = () => cells.map((c, index) => ({ index, order: Number(c.attrs['aria-label'].match(/numéro (\d+)/)?.[1] || 0) }))
    .filter(p => p.order).sort((a, b) => a.order - b.order).map(p => p.index);
  const highlighted = () => cells.map((c, i) => /lettre du mot conseillé/.test(c.attrs['aria-label']) ? i : -1).filter(i => i >= 0);
  // Tous les ordres des cases surlignées formant, de voisin en voisin, un mot du lexique.
  function orders(set, board) {
    const out = [];
    (function walk(p) {
      if (p.length === set.length) { if (dictionary.has(p.map(i => board[i]).join(''))) out.push(p); return; }
      for (const i of set) if (!p.includes(i) && (!p.length || adjacent(p[p.length - 1], i))) walk([...p, i]);
    })([]);
    return out;
  }
  assert.equal(cells.length, width * height);
  assert.equal(letters().filter(l => l !== 'Case vide').length, length * length);
  assert.equal(zone.children[3].children.length, 3, 'No renewal button');
  const initialLetters = letters();
  const seen = new Set(), paths = [];
  for (let found = 0; found < length; found++) {
    assert.equal(calls, 0, 'No premature completion');
    assert.equal(highlighted().length, 0, 'No highlighted cell before asking for help');
    const board = letters();
    let candidates;
    if (recorded) {
      candidates = [recorded[found]];
    } else {
      const progress = zone.children[0].textContent;
      hint.click();
      assert.deepEqual(letters(), board, 'Hint must NEVER change the board');
      assert.equal(zone.children[0].textContent, progress);
      assert.equal(path().length, 0, 'Hint must not reveal the order of the letters');
      assert.match(message, /compte pour moitié/);
      const set = highlighted();
      assert.equal(set.length, length, 'Hint highlights exactly the letters of one word');
      assert.ok(set.every(i => board[i] !== 'Case vide'));
      candidates = orders(set, board);
      assert.ok(candidates.length >= 1, 'Highlighted letters form a word through adjacent cells');
    }
    const chosen = candidates[0];
    assert.equal(chosen.length, length);
    assert.equal(new Set(chosen).size, length);
    assert.ok(new Set(chosen.map(i => Math.floor(i / width))).size > 1, 'Hint must turn across rows');
    assert.ok(new Set(chosen.map(i => i % width)).size > 1, 'Hint must turn across columns');
    for (let i = 1; i < chosen.length; i++) assert.ok(adjacent(chosen[i - 1], chosen[i]));
    // A partial word cannot consume letters, even through a direct handler call.
    clear.click();
    cells[chosen[0]].click();
    validate.attrs.onclick();
    assert.deepEqual(letters(), board);
    assert.equal(calls, 0);
    const first = chosen[0];
    const diagonal = cells.findIndex((cell, i) => board[i] !== 'Case vide' &&
      Math.abs(i % width - first % width) === 1 &&
      Math.abs(Math.floor(i / width) - Math.floor(first / width)) === 1);
    if (diagonal >= 0) {
      cells[diagonal].click();
      assert.equal(path().length, 1, 'Diagonal refused');
    }
    clear.click();
    chosen.forEach(i => cells[i].click());
    // Backtracking, clearing and manual replay through actual buttons.
    cells[chosen[0]].click(); assert.equal(path().length, 1);
    clear.click(); assert.match(message, /Sélection effacée/);
    assert.deepEqual(letters(), board);
    // Validate; an anagram of the target may be refused, the target order never is.
    let accepted = null;
    for (const candidate of candidates) {
      clear.click();
      candidate.forEach(i => cells[i].click());
      assert.deepEqual(path(), candidate);
      assert.equal(validate.disabled, false);
      validate.click();
      if (!isDeepStrictEqual(letters(), board)) { accepted = candidate; break; }
    }
    assert.ok(accepted, 'The hinted word is accepted');
    // Independently compute column gravity and compare EVERY cell.
    const expected = [...board];
    accepted.forEach(i => { expected[i] = 'Case vide'; });
    for (let c = 0; c < width; c++) {
      const remaining = [];
      for (let i = c; i < expected.length; i += width) if (expected[i] !== 'Case vide') remaining.push(expected[i]);
      const column = [...Array(expected.length / width - remaining.length).fill('Case vide'), ...remaining];
      column.forEach((value, r) => { expected[r * width + c] = value; });
    }
    assert.deepEqual(letters(), expected, 'Exact removal and stable gravity');
    const word = accepted.map(i => board[i]).join('');
    assert.ok(dictionary.has(word)); assert.ok(!seen.has(word)); seen.add(word);
    paths.push(accepted);
    const after = letters(); validate.attrs.onclick();
    assert.deepEqual(letters(), after, 'Repeated validation does not remove more letters');
  }
  for (const word of seen) {
    const reverse = [...word].reverse().join('');
    const lines = [];
    for (let r = 0; r < height; r++) lines.push(initialLetters.slice(r * width, (r + 1) * width).map(x => x === 'Case vide' ? '.' : x).join(''));
    for (let c = 0; c < width; c++) lines.push(Array.from({length:height}, (_,r) => initialLetters[r*width+c] === 'Case vide' ? '.' : initialLetters[r*width+c]).join(''));
    assert.ok(lines.every(line => !line.includes(word) && !line.includes(reverse)), 'No target initially readable in a straight line: ' + word);
  }
  assert.equal(calls, 1);
  if (recorded) {
    assert.equal(result.reussite, 1); assert.equal(result.score, length * 100);
    assert.match(result.details, /sans aide/);
  } else {
    // Every word found with the hint counts for half.
    assert.equal(result.reussite, 0.5); assert.equal(result.score, length * 50);
    assert.ok(result.details.includes('dont ' + length + ' avec l’aide'));
  }
  const final = letters();
  assert.ok(final.every(l => l === "Case vide"), "Entire board emptied");
  hint.attrs.onclick(); clear.attrs.onclick();
  assert.deepEqual(letters(), final); assert.equal(calls, 1);
  cleanup(); cells[0].attrs.onclick(); assert.deepEqual(letters(), final);
  return { paths, initialLetters };
}

for (let level = 1; level <= 6; level++) {
  for (let trial = 0; trial < 50; trial++) {
    const start = seed;
    const aided = partie(level, null);
    seed = start;
    const replay = partie(level, aided.paths);
    assert.deepEqual(replay.initialLetters, aided.initialLetters, 'Same seed, same tower');
  }
}
console.log('OK: 300 grilles sur six niveaux, jouées avec l’aide puis rejouées sans aide : aucun mot cible en ligne au départ, parcours tournants, une seule grille, toutes les lettres consommées, aide sans mutation et sans ordre révélé, mot aidé compté pour moitié, gravité exacte, mots distincts, longueurs exactes et fin automatique unique.');
