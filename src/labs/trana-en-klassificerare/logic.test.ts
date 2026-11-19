import { describe, expect, it } from 'vitest';
import {
  addPoint,
  boundaryGrid,
  fmt,
  isPointList,
  nearest,
  OUTLIER_ID,
  predict,
  regionCount,
  removePoint,
  startPoints,
  startQuery,
  updatePoint,
  type Point,
} from './logic';

describe('labb 10: k-närmaste grannar', () => {
  it('den nya frukten ★ blir äpple med k = 1 men päron med k = 3 (siffror i labbens text)', () => {
    expect(predict(startPoints, startQuery, 1)!.label).toBe('a');
    const p3 = predict(startPoints, startQuery, 3)!;
    expect(p3.label).toBe('b');
    expect(p3.votes).toEqual({ a: 1, b: 2 });
    expect(p3.neighbours.map((n) => n.point.id)).toEqual([8, 9, 10]);
    expect(p3.neighbours[0]!.point.id).toBe(OUTLIER_ID);
  });

  it('med k = 5 är 4 av 5 grannar päron', () => {
    const p = predict(startPoints, startQuery, 5)!;
    expect(p.votes).toEqual({ a: 1, b: 4 });
    expect(p.label).toBe('b');
  });

  it('lika röstetal (k = 2): den närmaste grannens klass vinner', () => {
    const p = predict(startPoints, startQuery, 2)!;
    expect(p.tie).toBe(true);
    expect(p.votes).toEqual({ a: 1, b: 1 });
    expect(p.label).toBe('a');
    expect(fmt(p.neighbours[0]!.distance, 2)).toBe('0,32');
    expect(fmt(p.neighbours[1]!.distance, 2)).toBe('0,71');
  });

  it('lika avstånd: punkten med lägst nummer räknas som närmast', () => {
    const pts: Point[] = [
      { id: 2, x: 1, y: 0, label: 'b' },
      { id: 1, x: -1, y: 0, label: 'a' },
    ];
    expect(nearest(pts, { x: 0, y: 0 }, 1)[0]!.point.id).toBe(1);
    expect(predict(pts, { x: 0, y: 0 }, 2)!.label).toBe('a');
  });

  it('den avvikande punkten bildar en egen ö med k = 1 som försvinner med k = 3', () => {
    expect(regionCount(boundaryGrid(startPoints, 1), 'a')).toBe(2);
    expect(regionCount(boundaryGrid(startPoints, 3), 'a')).toBe(1);
    const withoutOutlier = removePoint(startPoints, OUTLIER_ID);
    expect(regionCount(boundaryGrid(withoutOutlier, 1), 'a')).toBe(1);
    expect(predict(withoutOutlier, startQuery, 1)!.label).toBe('b');
  });

  it('k lika med alla punkter ger majoritetsklassen överallt (8 äpplen mot 6 päron)', () => {
    const g = boundaryGrid(startPoints, startPoints.length);
    expect(g.share.a).toBe(1);
    expect(g.share.b).toBe(0);
  });

  it('k större än antalet punkter använder alla punkter', () => {
    const p = predict(startPoints.slice(0, 3), startQuery, 10)!;
    expect(p.neighbours).toHaveLength(3);
  });

  it('utan punkter går det inte att förutsäga', () => {
    expect(predict([], startQuery, 3)).toBeNull();
    const g = boundaryGrid([], 3, 4, 4);
    expect(g.cells.flat().every((c) => c === null)).toBe(true);
    expect(g.share).toEqual({ a: 0, b: 0 });
  });

  it('redigering: lägg till, flytta (inom diagrammet), ta bort', () => {
    let pts = addPoint(startPoints, 99, -5, 'b');
    const added = pts[pts.length - 1]!;
    expect(added.id).toBe(15);
    expect(added.x).toBe(10);
    expect(added.y).toBe(4);
    pts = updatePoint(pts, 15, { x: 5.55, label: 'a' });
    expect(pts.find((p) => p.id === 15)).toMatchObject({ x: 5.6, label: 'a' });
    pts = removePoint(pts, 15);
    expect(pts).toEqual(startPoints);
  });

  it('validerar sparade punkter', () => {
    expect(isPointList(startPoints)).toBe(true);
    expect(isPointList([{ id: 1, x: 'a', y: 2, label: 'a' }])).toBe(false);
    expect(isPointList([{ id: 1, x: 1, y: 2, label: 'c' }])).toBe(false);
    expect(isPointList([])).toBe(true);
  });
});
