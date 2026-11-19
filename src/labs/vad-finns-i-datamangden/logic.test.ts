import { describe, expect, it } from 'vitest';
import { addBatch, baseApples, collect, countPixels, findImbalances, inspectorLabel, isAppleList, percent, summarize, toImage, toText } from './logic';

describe('labb 3: vad finns i datamängden?', () => {
  it('startdatamängden: 20 röda äpplen från gård A, 3 kasseras (15 %) – siffror i labbens frågor', () => {
    const s = summarize(baseApples);
    expect(s.total).toBe(20);
    expect(s.byLabel).toEqual({ godkänd: 17, kasseras: 3 });
    expect(s.byColor).toEqual({ röd: 20, grön: 0, gul: 0 });
    expect(s.byFarm).toEqual({ A: 20, B: 0 });
    expect(percent(s.byLabel.kasseras, s.total)).toBe(15);
    expect(s.meanWeight).toBe(142);
  });

  it('äpple nr 8 som tabellrad, bild och text', () => {
    const a = baseApples[7]!;
    expect(a).toMatchObject({ id: 8, weight: 133, color: 'röd', spots: 4, label: 'kasseras' });
    const img = toImage(a);
    expect(img).toHaveLength(8);
    expect(img.every((r) => r.length === 8)).toBe(true);
    expect(countPixels(img, 2)).toBe(4);
    expect(countPixels(img, 3)).toBe(1);
    expect(toText(a)).toBe('Rött medelstort äpple med 4 fläckar.');
  });

  it('20 fler från samma gård: 40 äpplen, fortfarande 0 gröna och 15 % kasserade', () => {
    const s = summarize(addBatch(baseApples, 'A', 1));
    expect(s.total).toBe(40);
    expect(s.byColor.grön).toBe(0);
    expect(s.byLabel.kasseras).toBe(6);
    expect(percent(s.byLabel.kasseras, s.total)).toBe(15);
    const s2 = summarize(addBatch(addBatch(baseApples, 'A', 1), 'A', 2));
    expect(s2.total).toBe(60);
    expect(s2.byColor.grön).toBe(0);
  });

  it('20 från en annan gård ger gröna och gula äpplen', () => {
    const s = summarize(addBatch(baseApples, 'B', 1));
    expect(s.total).toBe(40);
    expect(s.byColor).toEqual({ röd: 26, grön: 11, gul: 3 });
    expect(s.byFarm.B).toBe(20);
  });

  it('insamling är reproducerbar och får unika id', () => {
    expect(collect('B', 5, 7, 100)).toEqual(collect('B', 5, 7, 100));
    const ids = addBatch(baseApples, 'A', 1).map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('kontrollantens regel', () => {
    expect(inspectorLabel(98, 0)).toBe('kasseras');
    expect(inspectorLabel(150, 3)).toBe('kasseras');
    expect(inspectorLabel(150, 2)).toBe('godkänd');
  });

  it('hittar obalans och hanterar tom datamängd', () => {
    const imb = findImbalances(summarize(baseApples));
    expect(imb).toContain('Bara 3 av 20 äpplen (15 %) har etiketten ”kasseras”.');
    expect(imb).toContain('Det finns inga gröna äpplen.');
    expect(imb).toContain('Alla äpplen kommer från samma gård.');
    const empty = summarize([]);
    expect(empty.total).toBe(0);
    expect(empty.meanWeight).toBeNull();
    expect(percent(0, 0)).toBeNull();
    expect(findImbalances(empty)).toEqual(['Datamängden är tom – det finns inget att lära sig av.']);
  });

  it('validerar sparad data', () => {
    expect(isAppleList(baseApples)).toBe(true);
    expect(isAppleList([{ id: 1 }])).toBe(false);
    expect(isAppleList('x')).toBe(false);
  });
});
