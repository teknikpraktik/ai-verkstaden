import { describe, expect, it } from 'vitest';
import {
  cellName,
  emptyBoard,
  isBoard,
  legalMoves,
  minimax,
  minimaxMove,
  parseBoard,
  play,
  playGame,
  positions,
  ruleMove,
  scoreMoves,
  seededChoice,
  series,
  toMove,
  valueText,
  winner,
  winningLine,
} from './logic';

describe('labb 9: tre i rad', () => {
  it('känner igen vinst, förlust och oavgjort', () => {
    expect(winner(parseBoard('XXX OO. ...'))).toBe('X');
    expect(winner(parseBoard('X.O XO. O.X'))).toBe('O');
    expect(winner(parseBoard('X.. .X. ..X'))).toBe('X');
    expect(winningLine(parseBoard('..O .O. O..'))).toEqual([2, 4, 6]);
    expect(winner(parseBoard('XOX XOO OXX'))).toBe('oavgjort');
    expect(winner(emptyBoard())).toBeNull();
    expect(legalMoves(parseBoard('XXX OO. ...'))).toEqual([]);
  });

  it('minimax på slutlägen', () => {
    expect(minimax(parseBoard('OOO XX. X..'), 'X', 'O')).toBe(10);
    expect(minimax(parseBoard('OOO XX. X..'), 'X', 'X')).toBe(-10);
    expect(minimax(parseBoard('XOX XOO OXX'), 'X', 'O')).toBe(0);
  });

  it('tur och drag', () => {
    expect(toMove(emptyBoard())).toBe('X');
    expect(toMove(parseBoard('X........'))).toBe('O');
    expect(toMove(emptyBoard(), 'O')).toBe('O');
    const b = play(emptyBoard(), 4, 'X');
    expect(play(b, 4, 'O')).toBe(b);
    expect(cellName(0)).toBe('A1');
    expect(cellName(5)).toBe('C2');
    expect(cellName(2)).toBe('C1');
  });

  it('minimax tar en direkt vinst före att blockera', () => {
    const b = parseBoard(positions.vinst.board);
    expect(minimaxMove(b, 'O')).toBe(5);
    expect(ruleMove(b, 'O')).toEqual({ move: 5, rule: 0 });
    expect(valueText(scoreMoves(b, 'O').find((s) => s.move === 5)!.value)).toBe('vinst (om 1 drag)');
    expect(seededChoice('slump', parseBoard(positions.blockera.board), 'O', 1)!.move).not.toBe(2);
  });

  it('minimax blockerar ett direkt hot', () => {
    const b = parseBoard(positions.blockera.board);
    expect(minimaxMove(b, 'O')).toBe(2);
    expect(ruleMove(b, 'O')).toEqual({ move: 2, rule: 1 });
  });

  it('fällan med två hörn: regelagenten tar ett hörn och förlorar, minimax tar en kant', () => {
    const b = parseBoard(positions.gaffel.board);
    expect(ruleMove(b, 'O')).toEqual({ move: 2, rule: 3 });
    const scores = scoreMoves(b, 'O');
    expect(scores).toHaveLength(6);
    expect(scores.find((s) => s.move === 2)!.value).toBeLessThan(0);
    expect(scores.find((s) => s.move === 6)!.value).toBeLessThan(0);
    for (const m of [1, 3, 5, 7]) expect(scores.find((s) => s.move === m)!.value).toBe(0);
    expect(minimaxMove(b, 'O')).toBe(1);
    expect(valueText(scores.find((s) => s.move === 2)!.value)).toBe('förlust (om 4 drag)');
  });

  it('perfekt spel från tomt bräde blir oavgjort', () => {
    expect(minimax(emptyBoard(), 'X', 'X')).toBe(0);
    expect(playGame('minimax', 'minimax', 1)).toBe('oavgjort');
  });

  it('slumpagenten är reproducerbar med samma startvärde', () => {
    const b = emptyBoard();
    expect(seededChoice('slump', b, 'X', 7)).toEqual(seededChoice('slump', b, 'X', 7));
  });

  it('matcher över 100 partier (siffror i labbens text)', () => {
    const mmVsRandom = series('slump', 'minimax');
    expect(mmVsRandom.X).toBe(0);
    const rulesVsRandom = series('slump', 'regler');
    const mmStarts = series('minimax', 'slump');
    expect(mmStarts.O).toBe(0);
    expect({ mmVsRandom, rulesVsRandom, mmStarts }).toMatchInlineSnapshot(`
      {
        "mmStarts": {
          "O": 0,
          "X": 100,
          "oavgjort": 0,
        },
        "mmVsRandom": {
          "O": 77,
          "X": 0,
          "oavgjort": 23,
        },
        "rulesVsRandom": {
          "O": 81,
          "X": 2,
          "oavgjort": 17,
        },
      }
    `);
  });

  it('validerar sparade bräden', () => {
    expect(isBoard(emptyBoard())).toBe(true);
    expect(isBoard(parseBoard('XXX......'))).toBe(false);
    expect(isBoard([1, 2])).toBe(false);
  });
});
