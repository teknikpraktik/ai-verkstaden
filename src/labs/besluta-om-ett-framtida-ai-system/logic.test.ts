import { describe, expect, it } from 'vitest';
import { concerns, conditions, consequences, isConditionList, metricIds, metricText, roles } from './logic';

describe('labb 26: besluta om ett framtida AI-system', () => {
  it('inte införa: mentorerna hittar 8 av 20 som i dag', () => {
    const o = consequences('nej', ['granskning']);
    expect(o.helped).toBe(8);
    expect(o.wrongContacts).toBe(0);
    expect(metricText(o, 'hjalp')).toBe('8 av 20 (i dag: 8 av 20)');
    expect(concerns(o)).toEqual(['hjalp']);
  });

  it('införa utan villkor (villkor ignoreras): siffror som används i labbens frågor', () => {
    const o = consequences('infor', ['granskning', 'overprovning']);
    expect(o).toMatchObject({ helped: 16, wrongContacts: 24, flagged: 40, hours: 20, dataPerStudent: 6, appeal: false, vendorUse: true });
    expect(o.wrongVocational).toBe(16);
    expect(metricText(o, 'felkontakt')).toBe('24 av 180 elever utan risk');
    expect(metricText(o, 'timmar')).toBe('20 timmar extra');
    expect(concerns(o)).toEqual(['felkontakt', 'overprovning', 'snedvridning', 'leverantor', 'lagring', 'uppgifter']);
  });

  it('ett villkor i taget: mänsklig granskning', () => {
    const o = consequences('villkor', ['granskning']);
    expect(o).toMatchObject({ helped: 15, wrongContacts: 6, flagged: 40, hours: 20.5 });
    expect(metricText(o, 'timmar')).toBe('20,5 timmar extra');
  });

  it('granskning och dataminimering tillsammans', () => {
    const o = consequences('villkor', ['granskning', 'minimera']);
    expect(o).toMatchObject({ helped: 13, wrongContacts: 7, hours: 20, dataPerStudent: 2 });
  });

  it('alla villkor ger inga varningar utom inga', () => {
    const o = consequences(
      'villkor',
      conditions.map((c) => c.id),
    );
    expect(concerns(o)).toEqual([]);
    expect(metricText(o, 'snedvridning')).toBe('Ja: 5 av 7 felaktiga kontakter gäller yrkesprogram, som har en tredjedel av eleverna');
    expect(metricText(o, 'overprovning')).toBe('Ja');
  });

  it('pilot skalas till 50 elever', () => {
    const o = consequences('pilot', ['granskning']);
    expect(o).toMatchObject({ students: 50, atRisk: 5, helpedToday: 2, helped: 4, wrongContacts: 2, flagged: 10, hours: 5.5 });
  });

  it('varje roll bryr sig om befintliga mått, och alla mått har text', () => {
    for (const r of roles) for (const m of r.cares) expect(metricIds).toContain(m);
    const o = consequences('infor', []);
    for (const m of metricIds) expect(metricText(o, m).length).toBeGreaterThan(0);
  });

  it('validering', () => {
    expect(isConditionList(['granskning', 'radera'])).toBe(true);
    expect(isConditionList(['granskning', 'granskning'])).toBe(false);
    expect(isConditionList(['x'])).toBe(false);
    expect(isConditionList('granskning')).toBe(false);
  });
});
