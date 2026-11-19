import { describe, expect, it } from 'vitest';
import { evaluate, isConditions, isConfig, missions, presets, rules, sensorStates, type Conditions, type PresetId } from './logic';

const run = (id: PresetId, condId: string) => {
  const p = presets[id];
  const c = missions[p.mission].conditionPresets.find((x) => x.id === condId)!.c;
  return evaluate(p.mission, p.cfg, c);
};
const dark: Conditions = { morker: true, regn: false, trangt: false };

describe('labb 21: regelbaserad robotsimulering', () => {
  it('sensorernas tillstånd följer reglerna S1–S4', () => {
    const all = { sensors: ['kamera', 'lidar', 'narhet', 'gps'] as const, autonomy: 'sjalvstandig' as const, takeover: [] };
    const cfg = { ...all, sensors: [...all.sensors] };
    expect(sensorStates('lager', cfg, dark)).toEqual({ kamera: 'nej', lidar: 'ok', narhet: 'ok', gps: 'nej' });
    expect(sensorStates('jordbruk', cfg, { morker: false, regn: true, trangt: false })).toEqual({ kamera: 'osaker', lidar: 'osaker', narhet: 'ok', gps: 'ok' });
    // regn påverkar inte inomhus
    expect(sensorStates('lager', cfg, { morker: false, regn: true, trangt: false }).kamera).toBe('ok');
    expect(sensorStates('lager', { ...cfg, sensors: ['narhet'] }, dark).kamera).toBe('saknas');
  });

  it('lager med kamera: normalt klart med 1 övertagande (pallen), i mörker utförs uppdraget inte', () => {
    const n = run('lagerKamera', 'normalt');
    expect(n.status).toBe('hjalp');
    expect(n.takeovers).toBe(1);
    expect(n.staffMinutes).toBe(5);
    const d = run('lagerKamera', 'morker');
    expect(d.status).toBe('misslyckat');
    expect(d.nav).toBe('nej');
    expect(d.fired).toEqual(expect.arrayContaining(['S1', 'U1', 'A3']));
    expect(d.staffMinutes).toBe(60);
  });

  it('lager med lidar: klarar mörkret (S2), fortfarande 1 övertagande', () => {
    const d = run('lagerLidar', 'morker');
    expect(d.status).toBe('hjalp');
    expect(d.nav).toBe('ok');
    expect(d.takeovers).toBe(1);
    expect(d.staffMinutes).toBe(5);
  });

  it('jordbruk i regn: 8 + 1 = 9 övertaganden, 45 minuter personaltid, regel N1', () => {
    const r = run('jordbruk', 'regn');
    expect(r.status).toBe('hjalp');
    expect(r.takeovers).toBe(9);
    expect(r.staffMinutes).toBe(45);
    expect(r.fired).toContain('N1');
    expect(run('jordbruk', 'normalt').takeovers).toBe(1);
    expect(run('jordbruk', 'morker').status).toBe('misslyckat'); // U3: kameran behövs
  });

  it('omsorg: utan närhetssensor säkerhetsrisk (R1), utan larmvillkor säkerhetsrisk (O3), med båda klart med 2 övertaganden', () => {
    const a = run('omsorgUtan', 'trangt');
    expect(a.status).toBe('risk');
    expect(a.fired).toEqual(expect.arrayContaining(['R1', 'O3']));
    const b = run('omsorgNarhet', 'trangt');
    expect(b.status).toBe('risk');
    expect(b.fired).toContain('R2');
    expect(b.fired).not.toContain('R1');
    expect(b.explanations.find((e) => e.rule === 'O3')!.text).toContain('fick vänta');
    const c = run('omsorgLarm', 'trangt');
    expect(c.status).toBe('hjalp');
    expect(c.takeovers).toBe(2);
    expect(c.staffMinutes).toBe(10);
    expect(c.fired).toContain('O1');
  });

  it('självständig utan villkor för osäkerhet fortsätter trots osäkra sensorer (A4) och fastnar utan villkor för blockering', () => {
    const cfg = { sensors: ['kamera' as const], autonomy: 'sjalvstandig' as const, takeover: [] };
    const r = evaluate('lager', cfg, dark);
    expect(r.status).toBe('risk');
    expect(r.fired).toContain('A4');
    const s = evaluate('lager', cfg, { morker: false, regn: false, trangt: false });
    expect(s.status).toBe('misslyckat');
  });

  it('fjärrstyrd: klart utan övertaganden men personal hela tiden; i mörker ser operatören inget', () => {
    const cfg = { sensors: ['kamera' as const, 'narhet' as const], autonomy: 'fjarrstyrd' as const, takeover: [] };
    const n = evaluate('omsorg', cfg, { morker: false, regn: false, trangt: true });
    expect(n.status).toBe('klart');
    expect(n.staffMinutes).toBe(45);
    expect(evaluate('omsorg', cfg, dark).status).toBe('misslyckat');
  });

  it('övervakad: personen tar över, inklusive larm i omsorgen', () => {
    const cfg = { sensors: ['lidar' as const, 'narhet' as const], autonomy: 'overvakad' as const, takeover: [] };
    const r = evaluate('omsorg', cfg, dark);
    expect(r.status).toBe('hjalp');
    expect(r.takeovers).toBe(2);
    expect(r.staffMinutes).toBe(45);
  });

  it('varje förklaring hänvisar till en regel som finns i listan', () => {
    const ids = new Set(rules.map((r) => r.id));
    for (const id of Object.keys(presets) as PresetId[]) {
      for (const cp of missions[presets[id].mission].conditionPresets) {
        const o = evaluate(presets[id].mission, presets[id].cfg, cp.c);
        expect(o.explanations.length).toBeGreaterThan(0);
        for (const e of o.explanations) expect(ids.has(e.rule)).toBe(true);
      }
    }
  });

  it('lärarens exempelval för omsorgen (lidar + närhet, alla villkor) klarar alla förhållanden med 2 övertaganden', () => {
    const cfg = { sensors: ['lidar' as const, 'narhet' as const], autonomy: 'sjalvstandig' as const, takeover: ['osaker' as const, 'blockerad' as const, 'hjalp' as const] };
    for (const cp of missions.omsorg.conditionPresets) {
      const o = evaluate('omsorg', cfg, cp.c);
      expect(o.status, cp.id).toBe('hjalp');
      expect(o.takeovers).toBe(2);
      expect(o.staffMinutes).toBe(10);
    }
  });

  it('validerar sparad data', () => {
    expect(isConfig(presets.jordbruk.cfg)).toBe(true);
    expect(isConfig({ sensors: ['radar'], autonomy: 'sjalvstandig', takeover: [] })).toBe(false);
    expect(isConditions(dark)).toBe(true);
    expect(isConditions({ morker: 1 })).toBe(false);
  });
});
