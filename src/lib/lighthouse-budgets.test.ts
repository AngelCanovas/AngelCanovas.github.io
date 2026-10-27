import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  assertionExitCode,
  evaluateBudgets,
  representativeIndex,
  validateAssertions,
} from '../../scripts/lighthouse-budgets.mjs';

type Audit = {
  score?: number | null;
  numericValue?: number | null;
  scoreDisplayMode?: string;
  details?: { items: Array<Record<string, unknown>> };
};
type Report = {
  finalUrl: string;
  categories: Record<string, { score?: number | null }>;
  audits: Record<string, Audit>;
};
type Options = { minScore?: number; maxNumericValue?: number };
type BudgetConfig = { assertions: Record<string, [string, Options]> };

const url = 'http://127.0.0.1:4322/';
const invalidValues = [undefined, null, NaN, Infinity, -Infinity];
const report = (score: number | null = 1, numericValue: number | null = 0): Report => ({
  finalUrl: url,
  categories: { performance: { score } },
  audits: {
    probe: { score, numericValue },
    'resource-summary': {
      score: null,
      scoreDisplayMode: 'informative',
      details: { items: [{ resourceType: 'script', transferSize: numericValue, requestCount: 2 }] },
    },
  },
});
const triplet = () => [report(), report(), report()];
const config = (options: Options = {}, level = 'error', key = 'probe') => ({
  assertions: { [key]: [level, options] },
  includePassedAssertions: true,
});

function setBudget(current: Report, key: string, value: number) {
  const [id, property, field] = key.split(':');
  if (id === 'categories') {
    current.categories[property] = { score: value };
  } else if (id === 'resource-summary') {
    const items = current.audits[id].details!.items;
    const row = items.find((item) => item.resourceType === property);
    const target = row ?? { resourceType: property, transferSize: 0, requestCount: 0 };
    target[field === 'count' ? 'requestCount' : 'transferSize'] = value;
    if (!row) items.push(target);
  } else {
    current.audits[id] = { score: 1, numericValue: value };
  }
}

describe.each(['lighthouserc.json', 'lighthouserc.mobile.json'])('%s budgets', (file) => {
  const assertions = (
    JSON.parse(readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8')) as {
      ci: { assert: BudgetConfig };
    }
  ).ci.assert;
  const entries = Object.entries(assertions.assertions);
  const baseline = () => {
    const current = report();
    for (const [key, [, options]] of entries) setBudget(current, key, options.minScore ?? 0);
    return current;
  };

  it.each(entries)('accepts the inclusive boundary for %s', (key, [, options]) => {
    const reports = [baseline(), baseline(), baseline()];
    const threshold = options.minScore ?? options.maxNumericValue!;
    reports.forEach((current) => setBudget(current, key, threshold));

    expect(evaluateBudgets(assertions, reports)).toEqual([]);
    expect(assertionExitCode(evaluateBudgets(assertions, reports))).toBe(0);
  });

  it.each(entries)(
    'rejects crossing only %s and respects its severity',
    (key, [level, options]) => {
      const reports = [baseline(), baseline(), baseline()];
      const threshold = options.minScore ?? options.maxNumericValue!;
      const value = threshold + (options.minScore === undefined ? 1 : -0.001);
      reports.forEach((current) => setBudget(current, key, value));

      const failures = evaluateBudgets(assertions, reports);

      expect(failures).toHaveLength(1);
      expect(failures[0]).toMatchObject({
        auditId: key.split(':')[0],
        level,
        actual: value,
        expected: threshold,
        passed: false,
      });
      expect(assertionExitCode(failures)).toBe(level === 'error' ? 1 : 0);
    },
  );
});

describe('optimistic assertions', () => {
  it('uses the best value independently per assertion, not the median or representative run', () => {
    const reports = [report(1, 300), report(0.2, 200), report(0.3, 100)];

    expect(evaluateBudgets(config({ minScore: 1, maxNumericValue: 100 }), reports)).toEqual([
      expect.objectContaining({
        name: 'maxNumericValue',
        actual: 100,
        values: [300, 200, 100],
        passed: true,
      }),
      expect.objectContaining({ name: 'minScore', actual: 1, values: [1, 0.2, 0.3], passed: true }),
    ]);
  });

  it.each(['error', ['error'], ['error', {}]])('defaults %j to an inclusive 0.9 score', (entry) => {
    const options = { assertions: { probe: entry } };
    expect(evaluateBudgets(options, [report(0.9), report(0.1), report(0)])).toEqual([]);
    expect(evaluateBudgets(options, [report(0.899), report(0), report(0)])).toEqual([
      expect.objectContaining({ name: 'minScore', expected: 0.9, actual: 0.899, passed: false }),
    ]);
  });

  it('does not implicitly add a score check to a numeric budget', () => {
    expect(evaluateBudgets(config({ maxNumericValue: 0 }), [report(0)])).toEqual([
      expect.objectContaining({ name: 'maxNumericValue', actual: 0, passed: true }),
    ]);
  });

  it.each(['off', 'warn', 'error'])('handles %s failures and exit status', (level) => {
    const results = evaluateBudgets(config({ minScore: 1 }, level), [report(0)]);
    expect(results).toHaveLength(level === 'off' ? 0 : 1);
    expect(assertionExitCode(results)).toBe(level === 'error' ? 1 : 0);
  });

  it('retains passing assertions only when requested', () => {
    const options = config({ minScore: 1 });
    expect(evaluateBudgets({ ...options, includePassedAssertions: false }, [report()])).toEqual([]);
    const results = evaluateBudgets(options, [report()]);
    expect(results).toHaveLength(1);
    expect(assertionExitCode(results)).toBe(0);
    expect(assertionExitCode([])).toBe(0);
  });

  it('groups URLs before aggregating so a healthy route cannot hide a failed route', () => {
    const reports = [report(1), { ...report(0), finalUrl: `${url}es/` }, report(0.2)];
    expect(evaluateBudgets({ assertions: { probe: 'error' } }, reports)).toEqual([
      expect.objectContaining({ url: `${url}es/`, actual: 0, passed: false }),
    ]);
  });

  it('does not mutate reports or configuration', () => {
    const options = config({ minScore: 1 });
    const reports = triplet();
    const before = structuredClone({ options, reports });
    evaluateBudgets(options, reports);
    representativeIndex(reports);
    expect({ options, reports }).toEqual(before);
  });
});

const missingCases = [
  {
    name: 'audit',
    key: 'probe',
    remove: (current: Report) => {
      delete current.audits.probe;
    },
  },
  {
    name: 'category',
    key: 'categories:performance',
    remove: (current: Report) => {
      delete current.categories.performance;
    },
  },
  {
    name: 'resource audit',
    key: 'resource-summary:script:size',
    remove: (current: Report) => {
      delete current.audits['resource-summary'];
    },
  },
  {
    name: 'resource row',
    key: 'resource-summary:script:size',
    remove: (current: Report) => {
      current.audits['resource-summary'].details!.items = [];
    },
  },
  {
    name: 'size field',
    key: 'resource-summary:script:size',
    remove: (current: Report) => {
      delete current.audits['resource-summary'].details!.items[0].transferSize;
    },
  },
  {
    name: 'count field',
    key: 'resource-summary:script:count',
    remove: (current: Report) => {
      delete current.audits['resource-summary'].details!.items[0].requestCount;
    },
  },
];

describe.each(missingCases)('missing $name', ({ key, remove }) => {
  it.each([0, 1, 2])('fails auditRan before aggregation when run %i is incomplete', (index) => {
    const reports = triplet();
    remove(reports[index]);
    const presence = [1, 1, 1];
    presence[index] = 0;

    expect(
      evaluateBudgets(config({ minScore: 0, maxNumericValue: 100 }, 'error', key), reports),
    ).toEqual([
      expect.objectContaining({
        name: 'auditRan',
        expected: 1,
        actual: 0,
        values: presence,
        operator: '>=',
        passed: false,
      }),
    ]);
  });
});

describe('resource-summary fields', () => {
  it('prefers an existing size of zero over transferSize', () => {
    const reports = triplet();
    reports.forEach((current) =>
      Object.assign(current.audits['resource-summary'].details!.items[0], {
        size: 0,
        transferSize: 1000,
      }),
    );
    expect(
      evaluateBudgets(
        config({ maxNumericValue: 0 }, 'error', 'resource-summary:script:size'),
        reports,
      ),
    ).toEqual([expect.objectContaining({ actual: 0, values: [0, 0, 0], passed: true })]);
  });

  it('falls back to transferSize only when size is absent', () => {
    expect(
      evaluateBudgets(config({ maxNumericValue: 100 }, 'error', 'resource-summary:script:size'), [
        report(1, 101),
      ]),
    ).toEqual([expect.objectContaining({ actual: 101, passed: false })]);
  });

  it.each(invalidValues)('does not fall back from an existing invalid size %s', (size) => {
    const reports = triplet();
    reports.forEach((current) => {
      current.audits['resource-summary'].details!.items[0].size = size;
    });
    expect(
      evaluateBudgets(
        config({ maxNumericValue: 100 }, 'error', 'resource-summary:script:size'),
        reports,
      ),
    ).toEqual([
      expect.objectContaining({
        name: 'maxNumericValue',
        actual: NaN,
        values: [NaN, NaN, NaN],
        passed: false,
      }),
    ]);
  });

  it('reads count from requestCount rather than size, transferSize or count', () => {
    const current = report();
    Object.assign(current.audits['resource-summary'].details!.items[0], {
      size: 0,
      transferSize: 0,
      count: 0,
      requestCount: 3,
    });
    expect(
      evaluateBudgets(config({ maxNumericValue: 2 }, 'error', 'resource-summary:script:count'), [
        current,
      ]),
    ).toEqual([expect.objectContaining({ actual: 3, passed: false })]);
  });
});

describe.each([
  { field: 'score' as const, options: { minScore: 1 }, valid: 1 },
  { field: 'numericValue' as const, options: { maxNumericValue: 100 }, valid: 100 },
])('$field validity', ({ field, options, valid }) => {
  it.each(invalidValues)('ignores invalid %s when another run has a finite value', (invalid) => {
    const reports = triplet();
    reports[0].audits.probe[field] = invalid;
    reports[1].audits.probe[field] = valid;
    reports[2].audits.probe[field] = invalid;
    expect(evaluateBudgets(config(options), reports)).toEqual([
      expect.objectContaining({ actual: valid, values: [valid], passed: true }),
    ]);
  });

  it.each(invalidValues)('fails safely when all values are %s', (invalid) => {
    const reports = triplet();
    reports.forEach((current) => {
      current.audits.probe[field] = invalid;
    });
    expect(evaluateBudgets(config(options), reports)).toEqual([
      expect.objectContaining({ actual: NaN, values: [NaN, NaN, NaN], passed: false }),
    ]);
  });
});

describe('score display modes', () => {
  it.each([
    { mode: 'notApplicable', actual: 1, passed: true },
    { mode: 'informative', actual: 0, passed: false },
    { mode: 'error', actual: NaN, passed: false },
  ])('handles null scores in $mode mode', ({ mode, actual, passed }) => {
    const reports = triplet();
    reports.forEach((current) =>
      Object.assign(current.audits.probe, { score: null, scoreDisplayMode: mode }),
    );
    expect(evaluateBudgets(config({ minScore: 1 }), reports)).toEqual([
      expect.objectContaining({ actual, passed }),
    ]);
  });

  it.each(['notApplicable', 'informative'])('keeps numeric score zero in %s mode', (mode) => {
    const current = report(0);
    current.audits.probe.scoreDisplayMode = mode;
    expect(evaluateBudgets(config({ minScore: 1 }), [current])).toEqual([
      expect.objectContaining({ actual: 0, values: [0], passed: false }),
    ]);
  });
});

describe('unsupported configurations', () => {
  it.each([
    undefined,
    {},
    { assertions: {} },
    { assertions: { probe: 'error' }, assertMatrix: [] },
    { assertions: { probe: 'error' }, aggregationMethod: 'median' },
    { assertions: { probe: ['error', { aggregationMethod: 'pessimistic' }] } },
    { assertions: { probe: ['error', { maxLength: 2 }] } },
    { assertions: { 'resource-summary:script:bytes': 'error' } },
    { assertions: { 'categories:performance:score': 'error' } },
    { assertions: { 'probe:details': 'error' } },
    { assertions: { probe: 'fatal' } },
    { assertions: { probe: [] } },
    { assertions: { probe: ['error', {}, {}] } },
    { assertions: { probe: ['error', null] } },
    { assertions: { probe: ['error', []] } },
    { assertions: { probe: 1 } },
    ...invalidValues.map((value) => ({ assertions: { probe: ['error', { minScore: value }] } })),
    ...invalidValues.map((value) => ({
      assertions: { probe: ['error', { maxNumericValue: value }] },
    })),
  ])('rejects %j rather than silently accepting it', (options) => {
    expect(() => validateAssertions(options)).toThrow();
    expect(() => evaluateBudgets(options, [report()])).toThrow();
  });

  it('accepts explicit optimistic aggregation at both levels', () => {
    expect(() =>
      validateAssertions({
        ...config({ minScore: 1 }),
        aggregationMethod: 'optimistic',
        assertions: { probe: ['error', { minScore: 1, aggregationMethod: 'optimistic' }] },
      }),
    ).not.toThrow();
  });

  it('rejects an empty result set', () => {
    expect(() => evaluateBudgets(config(), [])).toThrow(/No Lighthouse results/);
  });

  it.each([undefined, null, '', 123])('rejects invalid final URL %s', (finalUrl) => {
    expect(() => evaluateBudgets(config(), [{ ...report(), finalUrl }])).toThrow(
      /Missing final URL/,
    );
  });
});

const metrics = (fcp?: number, interactive?: number) => ({
  audits: {
    'first-contentful-paint': { numericValue: fcp },
    interactive: { numericValue: interactive },
  },
});

describe('representative run', () => {
  it('uses squared distance across FCP and interactive rather than absolute distance', () => {
    const reports = [
      [300, 305],
      [303, 303],
      [200, 300],
      [300, 200],
      [100, 100],
      [500, 500],
      [600, 0],
    ].map(([fcp, interactive]) => metrics(fcp, interactive));
    expect(representativeIndex(reports)).toBe(1);
  });

  it('uses upper medians for an even number of runs', () => {
    expect(
      representativeIndex([metrics(0, 0), metrics(10, 10), metrics(20, 20), metrics(30, 30)]),
    ).toBe(2);
  });

  it('treats missing metrics as zero', () => {
    expect(representativeIndex([metrics(10), metrics(undefined, 10), metrics(10, 10)])).toBe(2);
    expect(representativeIndex([{}, {}, {}])).toBe(0);
  });

  it('keeps the earliest run when distances tie', () => {
    expect(representativeIndex([metrics(0, 10), metrics(10, 0)])).toBe(0);
  });

  it('returns the sole run', () => {
    expect(representativeIndex([metrics(100, 200)])).toBe(0);
  });

  it('rejects an empty result set', () => {
    expect(() => representativeIndex([])).toThrow(/No Lighthouse results/);
  });
});
