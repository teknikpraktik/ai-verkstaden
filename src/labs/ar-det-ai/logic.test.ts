import { describe, expect, it } from 'vitest';
import { borderlineCases, classifyMessage, isAnswers, scoreAnswers, situations, spamModel, systems, thermostat, tokenize } from './logic';

describe('labb 1: är det AI?', () => {
  it('nio system, tre gränsfall med flera välmotiverade svar (siffror i labbens fråga)', () => {
    expect(systems).toHaveLength(9);
    expect(borderlineCases().map((s) => s.id)).toEqual(['skrappost', 'ansikte', 'stavning']);
    for (const s of systems) expect(Object.keys(s.motivated).length).toBeGreaterThan(0);
  });

  it('räknar välmotiverade svar', () => {
    expect(scoreAnswers({})).toEqual({ answered: 0, motivated: 0, total: 9 });
    expect(scoreAnswers({ termostat: 'regler', skrappost: 'kombination', musik: 'regler' })).toEqual({ answered: 3, motivated: 2, total: 9 });
    expect(isAnswers({ termostat: 'regler' })).toBe(true);
    expect(isAnswers({ termostat: 'magi' })).toBe(false);
    expect(isAnswers(null)).toBe(false);
  });

  it('termostaten värmer så länge rummet är kallt – även med fönstret öppet', () => {
    expect(thermostat(16, 21)).toBe('värmer');
    expect(thermostat(20.6, 21)).toBe('av');
    expect(thermostat(22, 21)).toBe('av');
  });

  it('ordpoäng från träningsmeddelandena', () => {
    expect(spamModel.get('klicka')).toBe(3);
    expect(spamModel.get('här')).toBe(2);
    expect(spamModel.get('grattis')).toBe(0);
    expect(spamModel.get('på')).toBe(-2);
    expect(tokenize('Klicka HÄR, klicka!')).toEqual(['klicka', 'här']);
  });

  it('situationerna ger de utfall som labbens text beskriver', () => {
    const byId = Object.fromEntries(situations.filter((s) => s.message).map((s) => [s.id, classifyMessage(s.message!)]));
    expect(byId.vanlig).toMatchObject({ score: 6, verdict: 'skräp' });
    expect(byId.mentor).toMatchObject({ score: 4, verdict: 'skräp' });
    expect(byId.engelska).toMatchObject({ score: 0, verdict: 'vet inte' });
    expect(byId.engelska!.known).toEqual([]);
    expect(byId.engelska!.unknown).toHaveLength(6);
  });

  it('tomt meddelande ger poäng 0', () => {
    expect(classifyMessage('')).toMatchObject({ score: 0, verdict: 'vet inte', known: [], unknown: [] });
    expect(classifyMessage('Tack för hjälpen').verdict).toBe('inte skräp');
  });
});
