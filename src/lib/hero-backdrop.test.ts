import { describe, expect, it } from 'vitest';

import {
  HERO_BACKDROP_LABELS,
  clampRect,
  heatInfluence,
  inflateRect,
  labelOpacity,
  layoutLabels,
  rectsIntersect,
  ringInfluence,
  unionRect,
} from './hero-backdrop';

describe('HERO_BACKDROP_LABELS', () => {
  it('holds unique, trimmed, lowercase labels (they are painted after a dot)', () => {
    expect(HERO_BACKDROP_LABELS.length).toBeGreaterThan(50);
    for (const label of HERO_BACKDROP_LABELS) {
      expect(label).toBe(label.toLowerCase());
      expect(label).toBe(label.trim());
      expect(label).not.toContain('.');
      expect(label.length).toBeGreaterThan(0);
    }
    expect(new Set(HERO_BACKDROP_LABELS).size).toBe(HERO_BACKDROP_LABELS.length);
  });
});

describe('labelOpacity', () => {
  it('stays inside the resting range', () => {
    for (let index = 0; index < 400; index += 1) {
      const value = labelOpacity(index);
      expect(value).toBeGreaterThanOrEqual(0.1);
      expect(value).toBeLessThanOrEqual(0.2);
    }
  });

  it('is deterministic and varied, so the grid is stable but not flat', () => {
    expect(labelOpacity(7)).toBe(labelOpacity(7));
    const values = new Set(Array.from({ length: 50 }, (_, index) => labelOpacity(index)));
    expect(values.size).toBeGreaterThan(10);
  });
});

describe('heatInfluence', () => {
  it('is full under the pointer and zero from the radius edge outwards', () => {
    expect(heatInfluence(0, 0, 100)).toBe(1);
    expect(heatInfluence(100, 0, 100)).toBe(0);
    expect(heatInfluence(140, 0, 100)).toBe(0);
  });

  it('cools down as the sample ages and clamps beyond its life', () => {
    const fresh = heatInfluence(40, 0, 100);
    const aged = heatInfluence(40, 0.5, 100);
    expect(aged).toBeGreaterThan(0);
    expect(aged).toBeLessThan(fresh);
    expect(heatInfluence(40, 1, 100)).toBe(0);
    expect(heatInfluence(40, 2, 100)).toBe(0);
  });

  it('ignores a non-positive radius', () => {
    expect(heatInfluence(0, 0, 0)).toBe(0);
  });
});

describe('ringInfluence', () => {
  it('peaks on the ring and fades to zero at the band edges', () => {
    expect(ringInfluence(100, 100, 40, 0)).toBe(1);
    expect(ringInfluence(120, 100, 40, 0)).toBeCloseTo(0.5, 5);
    expect(ringInfluence(140, 100, 40, 0)).toBe(0);
    expect(ringInfluence(100, 0, 40, 0)).toBe(0);
  });

  it('dies with age and ignores a degenerate band', () => {
    expect(ringInfluence(100, 100, 40, 1)).toBe(0);
    expect(ringInfluence(100, 100, 0, 0)).toBe(0);
  });
});

describe('layoutLabels', () => {
  const base = {
    areaWidth: 100,
    areaHeight: 60,
    rowHeight: 10,
    columnGap: 5,
    rowGap: 0,
    catalogueSize: 5,
    startIndex: 0,
    widthOf: () => 20,
  };

  it('fills, centres and stacks rows over the whole area', () => {
    const placements = layoutLabels(base);
    // 20 × 4 + 5 × 3 = 95 fits; a fifth label would need 120.
    expect(placements).toHaveLength(24);
    expect(placements.slice(0, 4).map((placement) => placement.x)).toEqual([2.5, 27.5, 52.5, 77.5]);
    expect(placements.slice(0, 4).every((placement) => placement.y === 0)).toBe(true);
    expect(placements.at(-1)?.y).toBe(50);
  });

  it('keeps the catalogue sequence running across rows', () => {
    const placements = layoutLabels({ ...base, catalogueSize: 3 });
    expect(placements.slice(0, 6).map((placement) => placement.index)).toEqual([0, 1, 2, 0, 1, 2]);
  });

  it('stops when the next baseline would leave the area', () => {
    const placements = layoutLabels({ ...base, areaHeight: 25 });
    expect(placements).toHaveLength(8);
    expect(placements.at(-1)?.y).toBe(10);
  });

  it('returns nothing for a degenerate area', () => {
    expect(layoutLabels({ ...base, areaWidth: 0 })).toEqual([]);
    expect(layoutLabels({ ...base, areaHeight: 0 })).toEqual([]);
    expect(layoutLabels({ ...base, catalogueSize: 0 })).toEqual([]);
  });
});

describe('rect algebra', () => {
  const rect = { left: 10, top: 10, right: 20, bottom: 20 };

  it('inflates and clamps to the canvas', () => {
    expect(inflateRect(rect, 5)).toEqual({ left: 5, top: 5, right: 25, bottom: 25 });
    expect(clampRect({ left: -5, top: -5, right: 200, bottom: 50 }, 100, 100)).toEqual({
      left: 0,
      top: 0,
      right: 100,
      bottom: 50,
    });
  });

  it('unions with the previous region and reports overlap', () => {
    expect(unionRect(null, rect)).toEqual(rect);
    expect(unionRect(rect, { left: 0, top: 0, right: 5, bottom: 5 })).toEqual({
      left: 0,
      top: 0,
      right: 20,
      bottom: 20,
    });
    expect(rectsIntersect(rect, { left: 15, top: 15, right: 30, bottom: 30 })).toBe(true);
    expect(rectsIntersect(rect, { left: 20, top: 10, right: 30, bottom: 20 })).toBe(false);
  });
});
