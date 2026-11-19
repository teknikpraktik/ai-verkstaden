import { describe, expect, it } from 'vitest';
import { analyze, countVectors, DICT_SIZE, SUFFIXES, DOCUMENTS, lemmatize, sharedCount, START_TEXT, stem, summarizeAnalysis, terms, tokenize } from './logic';

describe('labb 16: tokenisering', () => {
  it('starttexten ger 9 token: 7 ord och 2 skiljetecken (siffror i labbens text)', () => {
    const s = summarizeAnalysis(analyze(START_TEXT));
    expect(s.tokens).toBe(9);
    expect(s.words).toBe(7);
    expect(s.punctuation).toBe(2);
    expect(s.distinct).toEqual({ ordform: 7, stam: 6, lemma: 5 });
    expect(s.unknownWords).toEqual([]);
  });

  it('tom text och bara mellanslag ger inga token', () => {
    expect(tokenize('')).toEqual([]);
    expect(tokenize('   \n ')).toEqual([]);
    const s = summarizeAnalysis(analyze(''));
    expect(s.tokens).toBe(0);
    expect(s.distinct.lemma).toBe(0);
  });

  it('hanterar å, ä, ö, tal, bindestreck och skiljetecken', () => {
    const t = tokenize('Åsa åt 2,5 äpplen kl. 8.30 – e-post?!');
    expect(t.map((x) => x.text)).toEqual(['Åsa', 'åt', '2,5', 'äpplen', 'kl', '.', '8.30', '–', 'e-post', '?', '!']);
    expect(t.map((x) => x.kind)).toEqual(['ord', 'ord', 'tal', 'ord', 'ord', 'skiljetecken', 'tal', 'skiljetecken', 'ord', 'skiljetecken', 'skiljetecken']);
  });

  it('stora och små bokstäver: ordformer skiljs bara åt om små bokstäver är avstängt', () => {
    expect(terms('Hunden hunden', 'ordform', true)).toEqual(['hunden', 'hunden']);
    expect(terms('Hunden hunden', 'ordform', false)).toEqual(['Hunden', 'hunden']);
    expect(terms('Hunden HUNDEN', 'lemma', false)).toEqual(['hund', 'hund']);
  });
});

describe('labb 16: stemming', () => {
  it('klipper vanliga ändelser', () => {
    expect(stem('Hundarna')).toEqual({ stem: 'hund', suffix: 'arna' });
    expect(stem('hunden').stem).toBe('hund');
    expect(stem('skolan').stem).toBe('skol');
    expect(stem('eleverna').stem).toBe('elev');
  });
  it('starka verb och omljud ger olika stammar (begränsning)', () => {
    expect(stem('sprang').stem).toBe('sprang');
    expect(stem('springer').stem).toBe('spring');
    expect(stem('läste').stem).toBe('läst');
    expect(stem('läser').stem).toBe('läs');
    expect(stem('böcker').stem).toBe('böck');
    expect(stem('boken').stem).toBe('bok');
  });
  it('kan ge "ord" som inte finns, men korta ord lämnas', () => {
    expect(stem('bättre').stem).toBe('bättr');
    expect(stem('hem')).toEqual({ stem: 'hem', suffix: null });
    expect(stem('är')).toEqual({ stem: 'är', suffix: null });
  });
  it('tal och skiljetecken lämnas orörda', () => {
    expect(stem('2024')).toEqual({ stem: '2024', suffix: null });
    const rows = analyze('3 hundar!');
    expect(rows.map((r) => r.stem.stem)).toEqual(['3', 'hund', '!']);
  });
});

describe('labb 16: reducerad ordlista', () => {
  it('ger grundformer för kända ord, även starka verb', () => {
    expect(lemmatize('sprang').lemma).toBe('springa');
    expect(lemmatize('Springer').lemma).toBe('springa');
    expect(lemmatize('böckerna').lemma).toBe('bok');
    expect(lemmatize('bättre').lemma).toBe('bra');
  });
  it('okända ord faller igenom oförändrade och märks', () => {
    expect(lemmatize('Robotdammsugaren')).toEqual({ lemma: 'robotdammsugaren', known: false });
    expect(summarizeAnalysis(analyze('Köket dammsög hunden')).unknownWords).toEqual(['köket', 'dammsög']);
  });
  it('tvetydiga former märks', () => {
    expect(lemmatize('var').ambiguous).toMatch(/frågeordet/);
    expect(lemmatize('får').lemma).toBe('få');
  });
  it('ordlistans storlek (visas i labben)', () => {
    expect(DICT_SIZE).toEqual({ lemmas: 54, forms: 168 });
    expect(SUFFIXES).toHaveLength(35);
  });
});

describe('labb 16: ordvektorer', () => {
  const docs = DOCUMENTS.map((d) => d.text);
  it('ordförrådets storlek krymper: 21 ordformer, 18 stammar, 17 lemman', () => {
    expect(countVectors(docs, 'ordform').vocabulary).toHaveLength(21);
    expect(countVectors(docs, 'stam').vocabulary).toHaveLength(18);
    expect(countVectors(docs, 'lemma').vocabulary).toHaveLength(17);
  });
  it('"hund" förekommer 2 gånger i dokument A med lemman, 0 gånger som ordform', () => {
    const lem = countVectors(docs, 'lemma');
    const i = lem.vocabulary.indexOf('hund');
    expect(lem.counts.map((c) => c[i])).toEqual([2, 1, 1]);
    const form = countVectors(docs, 'ordform');
    const j = form.vocabulary.indexOf('hund');
    expect(form.counts.map((c) => c[j])).toEqual([0, 0, 1]);
  });
  it('gemensamma termer mellan dokument', () => {
    const form = countVectors(docs, 'ordform');
    expect(sharedCount(form, 0, 2)).toBe(0);
    const lem = countVectors(docs, 'lemma');
    expect(sharedCount(lem, 0, 2)).toBe(1);
    expect(sharedCount(lem, 0, 1)).toBe(1);
  });
  it('tomma dokument ger tomma vektorer', () => {
    const t = countVectors(['', 'hund'], 'lemma');
    expect(t.vocabulary).toEqual(['hund']);
    expect(t.counts).toEqual([[0], [1]]);
    expect(countVectors([], 'lemma')).toEqual({ vocabulary: [], counts: [] });
    expect(sharedCount(t, 0, 5)).toBe(0);
  });
});
