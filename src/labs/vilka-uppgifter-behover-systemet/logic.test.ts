import { describe, expect, it } from 'vitest';
import { evaluate, fields, isSelection, minimalSelection, need, purposes, vendorProposal, type Selection } from './logic';

describe('labb 24: vilka uppgifter behövs?', () => {
  it('leverantörens förslag har 9 uppgifter och många problem för ändamålet övningar', () => {
    const e = evaluate('ovningar', vendorProposal());
    expect(e.chosen).toBe(9);
    expect(e.missing).toEqual([]);
    expect(e.unnecessary).toEqual(['namn', 'klass', 'betyg', 'stod', 'chatt']);
    expect(e.sensitive).toEqual(['stod']);
    expect(e.maybe).toEqual(['tid', 'inlogg']);
    // svar, elevid, tid och inlogg sparas 5 år > "tills kursen är avslutad"
    expect(e.tooLong).toEqual(['elevid', 'svar', 'tid', 'inlogg']);
    expect(e.problems).toBe(9);
    expect(e.ok).toBe(false);
  });

  it('det minimala urvalet är godkänt för varje ändamål', () => {
    for (const p of purposes) {
      const e = evaluate(p.id, minimalSelection(p.id));
      expect(e.ok, p.id).toBe(true);
      expect(e.messages[0]!.kind).toBe('ok');
    }
    expect(evaluate('ovningar', minimalSelection('ovningar')).chosen).toBe(2);
    expect(evaluate('oversikt', minimalSelection('oversikt')).chosen).toBe(3);
    expect(evaluate('utveckla', minimalSelection('utveckla')).chosen).toBe(1);
  });

  it('samma urval, nytt ändamål: namn blir nödvändigt för läraröversikten', () => {
    const sel = minimalSelection('ovningar');
    const e = evaluate('oversikt', sel);
    expect(e.missing).toEqual(['namn', 'klass']);
    expect(e.maybe).toEqual(['elevid']);
  });

  it('för kort lagring ger varning, saknad uppgift ger fel', () => {
    const sel: Selection = minimalSelection('ovningar');
    sel.svar = { on: true, keep: 'lektion' };
    expect(evaluate('ovningar', sel).tooShort).toEqual(['svar']);
    sel.svar = { on: false, keep: 'kurs' };
    expect(evaluate('ovningar', sel).missing).toEqual(['svar']);
  });

  it('inga uppgifter alls: allt nödvändigt saknas', () => {
    const none = Object.fromEntries(fields.map((f) => [f.id, { on: false, keep: 'kurs' }])) as Selection;
    expect(evaluate('ovningar', none).missing).toEqual(['elevid', 'svar']);
    expect(evaluate('ovningar', none).chosen).toBe(0);
  });

  it('känslig uppgift ger följdfråga om art. 9', () => {
    const e = evaluate('ovningar', vendorProposal());
    expect(e.followUps.some((f) => f.includes('art. 9'))).toBe(true);
    expect(e.messages.find((m) => m.field === 'stod')?.text).toContain('GDPR art. 9');
  });

  it('varje ändamål har behovsbedömning för alla uppgifter', () => {
    for (const p of purposes) expect(Object.keys(need[p.id]).sort()).toEqual(fields.map((f) => f.id).sort());
  });

  it('validering av sparat urval', () => {
    expect(isSelection(vendorProposal())).toBe(true);
    expect(isSelection({ namn: { on: true, keep: 'x' } })).toBe(false);
    expect(isSelection(null)).toBe(false);
  });
});
