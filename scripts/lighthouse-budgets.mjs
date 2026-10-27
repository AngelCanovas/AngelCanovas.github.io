const finite = (value) => typeof value === 'number' && Number.isFinite(value);

export function validateAssertions(config) {
  if (!config) throw new Error('Lighthouse assertions are required');
  for (const key of Object.keys(config)) {
    if (!['assertions', 'aggregationMethod', 'includePassedAssertions'].includes(key)) {
      throw new Error(`Unsupported assertion config: ${key}`);
    }
  }
  if (!config.assertions || !Object.keys(config.assertions).length) {
    throw new Error('Lighthouse assertions are required');
  }
  if ((config.aggregationMethod ?? 'optimistic') !== 'optimistic') {
    throw new Error('Only optimistic aggregation is supported');
  }
  for (const [key, entry] of Object.entries(config.assertions)) {
    if (!/^(?:categories:[\w-]+|resource-summary:[\w-]+:(?:size|count)|[\w-]+)$/.test(key)) {
      throw new Error(`Unsupported assertion key: ${key}`);
    }
    if (
      typeof entry !== 'string' &&
      (!Array.isArray(entry) || entry.length < 1 || entry.length > 2)
    ) {
      throw new Error(`Invalid assertion: ${key}`);
    }
    const [level, options = {}] = typeof entry === 'string' ? [entry] : entry;
    if (!['off', 'warn', 'error'].includes(level))
      throw new Error(`Invalid assertion level: ${key}`);
    if (level === 'off') continue;
    if (!options || typeof options !== 'object' || Array.isArray(options)) {
      throw new Error(`Invalid assertion options: ${key}`);
    }
    if ((options.aggregationMethod ?? 'optimistic') !== 'optimistic') {
      throw new Error('Only optimistic aggregation is supported');
    }
    for (const [name, value] of Object.entries(options)) {
      if (name === 'aggregationMethod') continue;
      if (!['minScore', 'maxNumericValue'].includes(name) || !finite(value)) {
        throw new Error(`Unsupported assertion option: ${key}.${name}`);
      }
    }
  }
}

function selectAudit(report, key) {
  const [id, ...property] = key.split(':');
  if (id === 'categories') {
    const category = report.categories?.[property[0]];
    return category ? { score: category.score } : undefined;
  }
  const audit = report.audits?.[id];
  if (!property.length) return audit;
  const row = audit?.details?.items?.find((item) => item.resourceType === property[0]);
  if (!row) return undefined;
  const field = property[1] === 'count' ? 'requestCount' : 'size' in row ? 'size' : 'transferSize';
  return field in row ? { ...audit, numericValue: row[field] } : undefined;
}

export function evaluateBudgets(config, reports) {
  if (!reports.length) throw new Error('No Lighthouse results');
  validateAssertions(config);
  const results = [];
  for (const [url, group] of Map.groupBy(reports, (report) => report.finalUrl)) {
    if (typeof url !== 'string' || !url) throw new Error('Missing final URL');
    for (const [key, entry] of Object.entries(config.assertions)) {
      const [level, options = {}] = typeof entry === 'string' ? [entry] : entry;
      if (level === 'off') continue;
      const [auditId, ...property] = key.split(':');
      const base = {
        auditId,
        level,
        url,
        ...(property.length ? { auditProperty: property.join('.') } : {}),
      };
      const audits = group.map((report) => selectAudit(report, key));
      if (audits.some((audit) => audit === undefined)) {
        results.push({
          ...base,
          name: 'auditRan',
          expected: 1,
          actual: 0,
          values: audits.map((audit) => (audit === undefined ? 0 : 1)),
          operator: '>=',
          passed: false,
        });
        continue;
      }
      const checks = [];
      if (options.maxNumericValue !== undefined)
        checks.push(['maxNumericValue', options.maxNumericValue]);
      if (options.minScore !== undefined || options.maxNumericValue === undefined) {
        checks.push(['minScore', options.minScore ?? 0.9]);
      }
      for (const [name, expected] of checks) {
        const raw = audits.map((audit) => {
          if (name === 'maxNumericValue') return audit.numericValue;
          if (typeof audit.score === 'number') return audit.score;
          if (audit.scoreDisplayMode === 'notApplicable') return 1;
          if (audit.scoreDisplayMode === 'informative') return 0;
          return undefined;
        });
        const valid = raw.filter(finite);
        const actual = valid.length
          ? name === 'minScore'
            ? Math.max(...valid)
            : Math.min(...valid)
          : NaN;
        results.push({
          ...base,
          name,
          expected,
          actual,
          values: valid.length ? valid : raw.map(() => NaN),
          operator: name === 'minScore' ? '>=' : '<=',
          passed: name === 'minScore' ? actual >= expected : actual <= expected,
        });
      }
    }
  }
  return config.includePassedAssertions ? results : results.filter((result) => !result.passed);
}

export function assertionExitCode(results) {
  return results.some((result) => result.level === 'error' && !result.passed) ? 1 : 0;
}

export function representativeIndex(reports) {
  if (!reports.length) throw new Error('No Lighthouse results');
  const metrics = ['first-contentful-paint', 'interactive'];
  const value = (report, metric) => report.audits?.[metric]?.numericValue || 0;
  const medians = metrics.map(
    (metric) =>
      reports.map((report) => value(report, metric)).sort((a, b) => a - b)[
        Math.floor(reports.length / 2)
      ],
  );
  return reports
    .map((report, index) => ({
      index,
      distance: metrics.reduce(
        (sum, metric, position) => sum + (value(report, metric) - medians[position]) ** 2,
        0,
      ),
    }))
    .sort((a, b) => a.distance - b.distance)[0].index;
}
