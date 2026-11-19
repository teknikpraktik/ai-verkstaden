import { describe, expect, it } from 'vitest';
import { classify, evaluate, formatWeight, HELD_OUT, logLikelihood, PROBES, train, TRAINING, words, type Example } from './logic';

const model = train(TRAINING);

describe('labb 17: träning', () => {
  it('räknar ord per klass', () => {
    expect(model.vocabulary.size).toBe(65);
    expect(model.totalWords).toEqual({ viktigt: 46, vanta: 45 });
    expect(model.docCount).toEqual({ viktigt: 8, vanta: 8 });
    expect(model.wordCount.viktigt.get('provet')).toBe(3);
    expect(model.wordCount.vanta.get('provet')).toBeUndefined();
  });
  it('ord görs om till små bokstäver och skiljetecken tas bort', () => {
    expect(words('Provet, i MORGON!')).toEqual(['provet', 'i', 'morgon']);
    expect(words('')).toEqual([]);
  });
});

describe('labb 17: klassning räknad för hand', () => {
  // Laplace-utjämning: P(ord|klass) = (n + 1) / (N_klass + 65)
  it('ordens bidrag stämmer med handräkning', () => {
    const w = (word: string) => logLikelihood(model, word, 'viktigt') - logLikelihood(model, word, 'vanta');
    expect(w('provet')).toBeCloseTo(Math.log(4 / 111 / (1 / 110)), 12); // 3 gånger i viktigt, 0 i vänta
    expect(w('provet')).toBeCloseTo(1.3772, 4);
    expect(w('morgon')).toBeCloseTo(Math.log(3 / 111 / (1 / 110)), 12);
    expect(w('morgon')).toBeCloseTo(1.0896, 4);
    expect(w('i')).toBeCloseTo(Math.log(6 / 111 / (4 / 110)), 12); // 5 mot 3
    expect(w('i')).toBeCloseTo(0.3964, 4);
    expect(w('inte')).toBeCloseTo(Math.log(110 / 111), 12); // 1 mot 1
    for (const x of ['lektionen', 'är', 'inställd']) expect(w(x)).toBeCloseTo(Math.log(220 / 111), 12);
    expect(w('lektionen')).toBeCloseTo(0.6841, 4);
    expect(model.vocabulary.has('prov')).toBe(false);
    expect(model.vocabulary.has('inställt')).toBe(false);
  });

  it('"Lektionen är inställd i morgon" → viktigt med poäng 3,54; "morgon" drar mest', () => {
    const c = classify(model, PROBES.start);
    expect(c.prior).toBe(0);
    expect(c.score).toBeCloseTo(3 * Math.log(220 / 111) + Math.log(660 / 444) + Math.log(330 / 111), 12);
    expect(c.score).toBeCloseTo(3.5383, 4);
    expect(c.decision).toBe('viktigt');
    expect(c.pViktigt).toBeCloseTo(0.972, 3);
    const top = [...c.influences].sort((a, b) => b.total - a.total)[0]!;
    expect(top.word).toBe('morgon');
  });

  it('negation: "inte" ändrar poängen bara med −0,01 och beslutet står kvar', () => {
    const a = classify(model, PROBES.start);
    const b = classify(model, PROBES.negation);
    expect(b.score - a.score).toBeCloseTo(Math.log(110 / 111), 12);
    expect(b.score).toBeCloseTo(3.5292, 4);
    expect(b.decision).toBe('viktigt');
    // ordningen spelar ingen roll i bag-of-words
    expect(classify(model, 'inställd i morgon inte är lektionen').score).toBeCloseTo(b.score, 12);
  });
});

describe('labb 17: okända ord och tomt meddelande', () => {
  it('ord utanför träningsmaterialet påverkar inte, och bara okända ord ger oavgjort', () => {
    const c = classify(model, PROBES.unknown);
    expect(c.knownCount).toBe(0);
    expect(c.unknownCount).toBe(4);
    expect(c.influences.every((i) => !i.known && i.total === 0)).toBe(true);
    expect(c.score).toBe(0);
    expect(c.decision).toBeNull();
    expect(c.pViktigt).toBe(0.5);
  });
  it('tomt meddelande ger oavgjort', () => {
    const c = classify(model, '');
    expect(c.words).toEqual([]);
    expect(c.decision).toBeNull();
  });
  it('ojämn fördelning: då avgör förhandssannolikheten ett tomt meddelande', () => {
    const extra: Example[] = [...TRAINING, { text: 'Prov', label: 'viktigt' }];
    const c = classify(train(extra), '');
    expect(c.prior).toBeCloseTo(Math.log(9 / 8), 12);
    expect(c.decision).toBe('viktigt');
  });
  it('tom träningsmängd kraschar inte', () => {
    const c = classify(train([]), 'hej');
    expect(c.decision).toBeNull();
  });
});

describe('labb 17: utjämning', () => {
  it('utan utjämning (α = 0) får ord som bara finns i en klass oändlig vikt', () => {
    const m0 = train(TRAINING, { alpha: 0, useStems: false });
    const c = classify(m0, 'provet');
    expect(c.score).toBe(Infinity);
    expect(c.decision).toBe('viktigt');
    // ett ord bara i viktigt och ett bara i vänta: går inte att avgöra
    const both = classify(m0, 'provet biblioteket');
    expect(Number.isNaN(both.score)).toBe(true);
    expect(both.decision).toBeNull();
  });
  it('formaterar vikter med tecken och pil', () => {
    expect(formatWeight(1.3772)).toBe('▲ +1,38');
    expect(formatWeight(-0.009)).toBe('▼ −0,01');
    expect(formatWeight(0)).toBe('● 0,00');
    expect(formatWeight(-Infinity)).toBe('▼ −∞');
    expect(formatWeight(NaN)).toMatch(/går inte/);
  });
});

describe('labb 17: reserverade exempel', () => {
  it('2 av 6 blir fel: ett missat viktigt och ett falsklarm', () => {
    const r = evaluate(model, HELD_OUT);
    expect(r.rows).toHaveLength(6);
    expect(r.errors).toBe(2);
    expect({ tp: r.tp, fn: r.fn, fp: r.fp, tn: r.tn, undecided: r.undecided }).toEqual({ tp: 2, fn: 1, fp: 1, tn: 2, undecided: 0 });
    const wrong = r.rows.filter((x) => !x.correct).map((x) => x.example.text);
    expect(wrong).toEqual(['Skolan stängd på grund av snöstorm', 'Det blir inget prov i morgon']);
  });
  it('snöstormsmeddelandet avgörs bara av "på" (−1,11) eftersom resten är okänt', () => {
    const c = classify(model, 'Skolan stängd på grund av snöstorm');
    expect(c.knownCount).toBe(1);
    expect(c.score).toBeCloseTo(Math.log(1 / 111 / (3 / 110)), 12);
    expect(c.score).toBeCloseTo(-1.1077, 4);
  });
  it('reserverade exempel finns inte i träningsdata', () => {
    for (const h of HELD_OUT) expect(TRAINING.some((t) => t.text === h.text)).toBe(false);
  });
});
