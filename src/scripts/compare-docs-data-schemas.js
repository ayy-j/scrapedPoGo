#!/usr/bin/env node

/**
 * Compare canonical JSON schemas, JSON data files, and markdown documentation.
 */

const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const fs = require('fs');
const path = require('path');
const schemaManifest = require('./lib/schema-manifest');

const DEFAULT_OPTIONS = {
  mode: 'report',
  jsonOut: 'reports/schema-comparison.json',
  mdOut: 'reports/schema-comparison.md',
  noWrite: false
};

const SORTABLE_ARRAY_KEYS = new Set(['required', 'enum', 'type']);
const SEVERITY_ORDER = { error: 0, warning: 1, info: 2 };
const RECOGNIZED_DOC_TYPES = {
  string: 'string',
  int: 'integer',
  integer: 'integer',
  number: 'number',
  float: 'number',
  double: 'number',
  decimal: 'number',
  bool: 'boolean',
  boolean: 'boolean',
  object: 'object',
  array: 'array',
  null: 'null'
};

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isPrimitive(value) {
  return value === null || ['string', 'number', 'boolean'].includes(typeof value);
}

function escapeJsonPointerToken(token) {
  return String(token).replace(/~/g, '~0').replace(/\//g, '~1');
}

function unescapeJsonPointerToken(token) {
  return String(token).replace(/~1/g, '/').replace(/~0/g, '~');
}

function joinJsonPointer(base, token) {
  const safeBase = base === '/' ? '' : base;
  return `${safeBase}/${escapeJsonPointerToken(token)}`;
}

function normalizeForComparison(value, parentKey = '') {
  if (Array.isArray(value)) {
    const normalizedItems = value.map((item) => normalizeForComparison(item));
    if (SORTABLE_ARRAY_KEYS.has(parentKey) && normalizedItems.every(isPrimitive)) {
      return normalizedItems
        .slice()
        .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
    }
    return normalizedItems;
  }

  if (isPlainObject(value)) {
    const output = {};
    for (const key of Object.keys(value).sort()) {
      output[key] = normalizeForComparison(value[key], key);
    }
    return output;
  }

  return value;
}

function diffNormalizedValues(expected, actual, pointer = '', diffs = [], maxDiffs = 200) {
  if (diffs.length >= maxDiffs) {
    return diffs;
  }

  if (Array.isArray(expected) || Array.isArray(actual)) {
    if (!Array.isArray(expected) || !Array.isArray(actual)) {
      diffs.push({
        path: pointer || '/',
        message: `Type mismatch: expected ${Array.isArray(expected) ? 'array' : typeof expected}, got ${Array.isArray(actual) ? 'array' : typeof actual}`
      });
      return diffs;
    }

    if (expected.length !== actual.length) {
      diffs.push({
        path: pointer || '/',
        message: `Array length mismatch: expected ${expected.length}, got ${actual.length}`
      });
    }

    const length = Math.min(expected.length, actual.length);
    for (let idx = 0; idx < length; idx += 1) {
      diffNormalizedValues(expected[idx], actual[idx], joinJsonPointer(pointer, idx), diffs, maxDiffs);
      if (diffs.length >= maxDiffs) {
        return diffs;
      }
    }
    return diffs;
  }

  if (isPlainObject(expected) || isPlainObject(actual)) {
    if (!isPlainObject(expected) || !isPlainObject(actual)) {
      diffs.push({
        path: pointer || '/',
        message: `Type mismatch: expected ${isPlainObject(expected) ? 'object' : typeof expected}, got ${isPlainObject(actual) ? 'object' : typeof actual}`
      });
      return diffs;
    }

    const keys = Array.from(new Set([...Object.keys(expected), ...Object.keys(actual)])).sort();
    for (const key of keys) {
      const nextPointer = joinJsonPointer(pointer, key);
      if (!(key in expected)) {
        diffs.push({
          path: nextPointer,
          message: 'Unexpected key in documentation schema block'
        });
        if (diffs.length >= maxDiffs) {
          return diffs;
        }
        continue;
      }

      if (!(key in actual)) {
        diffs.push({
          path: nextPointer,
          message: 'Missing key in documentation schema block'
        });
        if (diffs.length >= maxDiffs) {
          return diffs;
        }
        continue;
      }

      diffNormalizedValues(expected[key], actual[key], nextPointer, diffs, maxDiffs);
      if (diffs.length >= maxDiffs) {
        return diffs;
      }
    }
    return diffs;
  }

  if (!Object.is(expected, actual)) {
    diffs.push({
      path: pointer || '/',
      message: `Value mismatch: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    });
  }

  return diffs;
}

function diffSchemasWithNormalization(expected, actual, maxDiffs = 200) {
  const normalizedExpected = normalizeForComparison(expected);
  const normalizedActual = normalizeForComparison(actual);
  return diffNormalizedValues(normalizedExpected, normalizedActual, '', [], maxDiffs);
}

function parseArgs(argv) {
  const options = { ...DEFAULT_OPTIONS };

  for (let idx = 0; idx < argv.length; idx += 1) {
    const arg = argv[idx];

    if (arg === '--mode') {
      options.mode = argv[idx + 1];
      idx += 1;
      continue;
    }

    if (arg.startsWith('--mode=')) {
      options.mode = arg.slice('--mode='.length);
      continue;
    }

    if (arg === '--json-out') {
      options.jsonOut = argv[idx + 1];
      idx += 1;
      continue;
    }

    if (arg.startsWith('--json-out=')) {
      options.jsonOut = arg.slice('--json-out='.length);
      continue;
    }

    if (arg === '--md-out') {
      options.mdOut = argv[idx + 1];
      idx += 1;
      continue;
    }

    if (arg.startsWith('--md-out=')) {
      options.mdOut = arg.slice('--md-out='.length);
      continue;
    }

    if (arg === '--no-write') {
      options.noWrite = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!['report', 'strict'].includes(options.mode)) {
    throw new Error(`Invalid --mode value "${options.mode}". Expected "report" or "strict".`);
  }

  if (!options.noWrite && (!options.jsonOut || !options.mdOut)) {
    throw new Error('Both --json-out and --md-out are required unless --no-write is set.');
  }

  return options;
}

function safeReadFile(repoRoot, relativePath) {
  const absolutePath = path.resolve(repoRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    return {
      ok: false,
      error: `File not found: ${relativePath}`,
      absolutePath
    };
  }

  try {
    const content = fs.readFileSync(absolutePath, 'utf8');
    return { ok: true, content, absolutePath };
  } catch (error) {
    return {
      ok: false,
      error: `Failed to read ${relativePath}: ${error.message}`,
      absolutePath
    };
  }
}

function safeReadJson(repoRoot, relativePath) {
  const fileResult = safeReadFile(repoRoot, relativePath);
  if (!fileResult.ok) {
    return fileResult;
  }

  try {
    const json = JSON.parse(fileResult.content);
    return { ok: true, json, absolutePath: fileResult.absolutePath };
  } catch (error) {
    return {
      ok: false,
      error: `Failed to parse JSON ${relativePath}: ${error.message}`,
      absolutePath: fileResult.absolutePath
    };
  }
}

function extractJsonSchemaBlock(markdown) {
  const headingRegex = /^##\s+JSON Schema\s*$/m;
  const headingMatch = headingRegex.exec(markdown);
  if (!headingMatch) {
    return { ok: false, error: 'Missing "## JSON Schema" section.' };
  }

  const sectionStart = headingMatch.index + headingMatch[0].length;
  const section = markdown.slice(sectionStart);
  const blockRegex = /```json\s*\r?\n([\s\S]*?)\r?\n```/m;
  const blockMatch = blockRegex.exec(section);
  if (!blockMatch) {
    return { ok: false, error: 'Missing fenced ```json block after "## JSON Schema".' };
  }

  const blockStartIndex = sectionStart + blockMatch.index;
  const line = markdown.slice(0, blockStartIndex).split(/\r?\n/).length;
  return {
    ok: true,
    jsonText: blockMatch[1],
    line
  };
}

function splitTableCells(line) {
  const trimmed = line.trim();
  if (!trimmed.includes('|') || !trimmed.startsWith('|') || !trimmed.endsWith('|')) {
    return null;
  }

  const body = trimmed.slice(1, -1);
  const cells = [];
  let current = '';

  for (let idx = 0; idx < body.length; idx += 1) {
    const character = body[idx];
    const previous = idx > 0 ? body[idx - 1] : null;

    if (character === '|' && previous !== '\\') {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += character;
  }
  cells.push(current.trim());
  return cells;
}

function normalizeHeaderCell(cell) {
  return cell
    .replace(/`/g, '')
    .replace(/\*\*/g, '')
    .trim()
    .toLowerCase();
}

function isSeparatorRow(cells) {
  if (!cells || cells.length === 0) {
    return false;
  }
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s/g, '')));
}

function collectHeadings(lines) {
  const headings = [];
  let inCodeFence = false;

  for (let idx = 0; idx < lines.length; idx += 1) {
    const line = lines[idx];
    if (/^\s*```/.test(line)) {
      inCodeFence = !inCodeFence;
      continue;
    }

    if (inCodeFence) {
      continue;
    }

    const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (!match) {
      continue;
    }

    headings.push({
      level: match[1].length,
      text: match[2].trim(),
      line: idx + 1
    });
  }

  return headings;
}

function getHeadingContextForLine(headings, lineNumber) {
  const context = [];
  for (const heading of headings) {
    if (heading.line > lineNumber) {
      break;
    }
    while (context.length > 0 && context[context.length - 1].level >= heading.level) {
      context.pop();
    }
    context.push(heading);
  }
  return context;
}

function parseFieldTypeRows(markdown) {
  const lines = markdown.split(/\r?\n/);
  const headings = collectHeadings(lines);
  const rows = [];

  const lineInCodeFence = new Array(lines.length).fill(false);
  let inCodeFence = false;
  for (let idx = 0; idx < lines.length; idx += 1) {
    const line = lines[idx];
    if (/^\s*```/.test(line)) {
      inCodeFence = !inCodeFence;
      lineInCodeFence[idx] = true;
      continue;
    }
    if (inCodeFence) {
      lineInCodeFence[idx] = true;
    }
  }

  for (let idx = 0; idx < lines.length - 1; idx += 1) {
    if (lineInCodeFence[idx]) {
      continue;
    }

    const headerCells = splitTableCells(lines[idx]);
    if (!headerCells) {
      continue;
    }

    const normalized = headerCells.map(normalizeHeaderCell);
    const fieldIndex = normalized.indexOf('field');
    const typeIndex = normalized.indexOf('type');
    if (fieldIndex === -1 || typeIndex === -1) {
      continue;
    }

    const separatorCells = splitTableCells(lines[idx + 1]);
    if (!separatorCells || !isSeparatorRow(separatorCells)) {
      continue;
    }

    let rowIndex = idx + 2;
    while (rowIndex < lines.length && !lineInCodeFence[rowIndex]) {
      const rowCells = splitTableCells(lines[rowIndex]);
      if (!rowCells) {
        break;
      }

      if (rowCells.length <= Math.max(fieldIndex, typeIndex)) {
        break;
      }

      rows.push({
        line: rowIndex + 1,
        fieldCell: rowCells[fieldIndex],
        typeCell: rowCells[typeIndex],
        context: getHeadingContextForLine(headings, rowIndex + 1)
      });
      rowIndex += 1;
    }

    idx = rowIndex - 1;
  }

  return rows;
}

function extractFieldToken(fieldCell) {
  const matches = Array.from(fieldCell.matchAll(/`([^`]+)`/g));
  if (matches.length === 0) {
    return null;
  }
  return matches[0][1].trim();
}

function parseFieldPathToken(token) {
  const compact = token.trim().replace(/\s+/g, '');
  if (!compact) {
    return null;
  }

  const rawSegments = compact.split('.');
  if (rawSegments.some((segment) => !segment)) {
    return null;
  }

  return rawSegments.map((segment) => {
    let key = segment;
    let arrayDepth = 0;
    while (key.endsWith('[]')) {
      key = key.slice(0, -2);
      arrayDepth += 1;
    }
    return {
      key,
      arrayDepth
    };
  });
}

function resolveRef(schemaRoot, ref) {
  if (typeof ref !== 'string' || !ref.startsWith('#/')) {
    return null;
  }

  const segments = ref
    .slice(2)
    .split('/')
    .map((segment) => unescapeJsonPointerToken(segment));

  let current = schemaRoot;
  for (const segment of segments) {
    if (!isPlainObject(current) && !Array.isArray(current)) {
      return null;
    }
    current = current[segment];
    if (current === undefined) {
      return null;
    }
  }

  return current;
}

function expandSchemaNode(node, schemaRoot, seenRefs = new Set()) {
  if (!isPlainObject(node)) {
    return [];
  }

  if (node.$ref) {
    if (seenRefs.has(node.$ref)) {
      return [];
    }

    const resolved = resolveRef(schemaRoot, node.$ref);
    if (!resolved) {
      return [];
    }

    const overlay = { ...node };
    delete overlay.$ref;

    const merged = { ...resolved, ...overlay };
    const nextSeen = new Set(seenRefs);
    nextSeen.add(node.$ref);
    return expandSchemaNode(merged, schemaRoot, nextSeen);
  }

  const candidates = [{ ...node }];
  const keywordValues = ['allOf', 'oneOf', 'anyOf']
    .filter((keyword) => Array.isArray(node[keyword]) && node[keyword].length > 0)
    .flatMap((keyword) => node[keyword]);

  if (keywordValues.length === 0) {
    return candidates;
  }

  const base = { ...node };
  delete base.allOf;
  delete base.oneOf;
  delete base.anyOf;

  const expanded = [];
  if (Object.keys(base).length > 0) {
    expanded.push(...expandSchemaNode(base, schemaRoot, seenRefs));
  }

  for (const branch of keywordValues) {
    expanded.push(...expandSchemaNode(branch, schemaRoot, seenRefs));
  }

  return expanded;
}

function schemaPrimitiveType(value) {
  if (value === null) {
    return 'null';
  }
  if (typeof value === 'string') {
    return 'string';
  }
  if (typeof value === 'boolean') {
    return 'boolean';
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'integer' : 'number';
  }
  if (Array.isArray(value)) {
    return 'array';
  }
  if (isPlainObject(value)) {
    return 'object';
  }
  return null;
}

function inferSchemaTypes(node, schemaRoot) {
  const types = new Set();
  const candidates = expandSchemaNode(node, schemaRoot);

  for (const candidate of candidates) {
    if (!isPlainObject(candidate)) {
      continue;
    }

    if (typeof candidate.type === 'string') {
      types.add(candidate.type);
    } else if (Array.isArray(candidate.type)) {
      for (const schemaType of candidate.type) {
        if (typeof schemaType === 'string') {
          types.add(schemaType);
        }
      }
    }

    if (!candidate.type) {
      if (candidate.properties) {
        types.add('object');
      }
      if (candidate.items) {
        types.add('array');
      }
    }

    if (Array.isArray(candidate.enum)) {
      for (const enumValue of candidate.enum) {
        const primitive = schemaPrimitiveType(enumValue);
        if (primitive) {
          types.add(primitive);
        }
      }
    }
  }

  return Array.from(types).sort();
}

function findPropertyNodes(node, propertyName, schemaRoot) {
  const candidates = expandSchemaNode(node, schemaRoot);
  const found = [];

  for (const candidate of candidates) {
    if (candidate.properties && Object.prototype.hasOwnProperty.call(candidate.properties, propertyName)) {
      found.push(candidate.properties[propertyName]);
    }
  }

  return found;
}

function findArrayItemNodes(node, schemaRoot) {
  const candidates = expandSchemaNode(node, schemaRoot);
  const found = [];

  for (const candidate of candidates) {
    if (candidate.items !== undefined) {
      found.push(candidate.items);
    }
  }

  return found;
}

function combineSchemaNodes(nodes) {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return null;
  }
  if (nodes.length === 1) {
    return nodes[0];
  }
  return { anyOf: nodes };
}

function resolveFieldPath(schemaRoot, fieldToken) {
  const segments = parseFieldPathToken(fieldToken);
  if (!segments) {
    return { ok: false, error: 'Unable to parse field token.' };
  }

  const rootTypes = inferSchemaTypes(schemaRoot, schemaRoot);
  const rootNode = rootTypes.includes('array') ? schemaRoot.items : schemaRoot;
  if (!rootNode) {
    return { ok: false, error: 'Schema root does not expose an object or array items node.' };
  }

  let currentNodes = [
    {
      node: rootNode,
      pointer: rootTypes.includes('array') ? '/items' : ''
    }
  ];

  for (const segment of segments) {
    if (!segment.key) {
      return { ok: false, error: `Invalid field token segment in "${fieldToken}".` };
    }

    let nextNodes = [];
    for (const current of currentNodes) {
      const propertyNodes = findPropertyNodes(current.node, segment.key, schemaRoot);
      for (const propertyNode of propertyNodes) {
        nextNodes.push({
          node: propertyNode,
          pointer: `${current.pointer}/properties/${escapeJsonPointerToken(segment.key)}`
        });
      }
    }

    if (nextNodes.length === 0) {
      const parentAllowsAdditional = currentNodes.some((current) => {
        const candidates = expandSchemaNode(current.node, schemaRoot);
        return candidates.some((candidate) =>
          isPlainObject(candidate) && candidate.additionalProperties !== false &&
          (candidate.additionalProperties === true || candidate.additionalProperties === undefined)
        );
      });
      return {
        ok: false,
        error: `Field "${segment.key}" not found while resolving "${fieldToken}".`,
        allowedByAdditionalProperties: parentAllowsAdditional
      };
    }

    if (segment.arrayDepth > 0) {
      for (let depth = 0; depth < segment.arrayDepth; depth += 1) {
        const arrayNodes = [];
        for (const nextNode of nextNodes) {
          const itemNodes = findArrayItemNodes(nextNode.node, schemaRoot);
          for (const itemNode of itemNodes) {
            arrayNodes.push({
              node: itemNode,
              pointer: `${nextNode.pointer}/items`
            });
          }
        }

        if (arrayNodes.length === 0) {
          return {
            ok: false,
            error: `Field "${segment.key}" is not an array while resolving "${fieldToken}".`
          };
        }

        nextNodes = arrayNodes;
      }
    }

    currentNodes = nextNodes;
  }

  return {
    ok: true,
    node: combineSchemaNodes(currentNodes.map((entry) => entry.node)),
    pointer: currentNodes[0].pointer || '/'
  };
}

function parseDocTypeCell(typeCell) {
  const raw = String(typeCell || '').trim();
  if (!raw) {
    return { ok: false, reason: 'Type cell is empty.', raw };
  }

  const normalized = raw
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/`/g, '')
    .replace(/\*\*/g, '')
    .replace(/\\\|/g, '|')
    .replace(/\s+or\s+/gi, '|')
    .trim();

  if (!normalized) {
    return { ok: false, reason: 'Type cell is empty after normalization.', raw };
  }

  const unionParts = normalized.split('|').map((part) => part.trim()).filter(Boolean);
  const parts = unionParts.length > 0 ? unionParts : [normalized];

  const parsedTypes = new Set();
  let hasUnknownTypeToken = false;

  for (const part of parts) {
    const lowered = part.toLowerCase().replace(/[(),]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!lowered) {
      continue;
    }

    const arrayGenericMatch = /^array\s*<(.+)>$/.exec(lowered);
    if (arrayGenericMatch) {
      parsedTypes.add('array');
      continue;
    }

    if (lowered.endsWith('[]')) {
      parsedTypes.add('array');
      continue;
    }

    if (RECOGNIZED_DOC_TYPES[lowered]) {
      parsedTypes.add(RECOGNIZED_DOC_TYPES[lowered]);
      continue;
    }

    const aliasPrefix = Object.keys(RECOGNIZED_DOC_TYPES).find((token) => lowered.startsWith(`${token} `));
    if (aliasPrefix) {
      parsedTypes.add(RECOGNIZED_DOC_TYPES[aliasPrefix]);
      continue;
    }

    hasUnknownTypeToken = true;
  }

  if (parsedTypes.size === 0) {
    return {
      ok: false,
      reason: `No parseable primitive schema types in "${raw}".`,
      raw
    };
  }

  if (hasUnknownTypeToken) {
    return {
      ok: false,
      reason: `Type cell contains unrecognized tokens in "${raw}".`,
      raw
    };
  }

  return {
    ok: true,
    types: Array.from(parsedTypes).sort(),
    raw
  };
}

function setsEqual(left, right) {
  if (left.size !== right.size) {
    return false;
  }
  for (const value of left) {
    if (!right.has(value)) {
      return false;
    }
  }
  return true;
}

function resolveOutputPath(repoRoot, filePath) {
  return path.isAbsolute(filePath) ? filePath : path.join(repoRoot, filePath);
}

function listFilesRecursive(dirPath, extension, repoRoot, accumulator = []) {
  if (!fs.existsSync(dirPath)) {
    return accumulator;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));

  for (const entry of entries) {
    const absolutePath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      listFilesRecursive(absolutePath, extension, repoRoot, accumulator);
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith(extension)) {
      continue;
    }

    const relativePath = toPosixPath(path.relative(repoRoot, absolutePath));
    accumulator.push(relativePath);
  }

  return accumulator;
}

function addFinding(findings, finding) {
  findings.push({
    severity: finding.severity,
    category: finding.category,
    dataset: finding.dataset || null,
    file: finding.file || null,
    path: finding.path || null,
    message: finding.message,
    details: finding.details || null
  });
}

function sortFindings(findings) {
  return findings.slice().sort((left, right) => {
    const severityDiff = SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity];
    if (severityDiff !== 0) {
      return severityDiff;
    }

    const categoryDiff = String(left.category).localeCompare(String(right.category));
    if (categoryDiff !== 0) {
      return categoryDiff;
    }

    const datasetDiff = String(left.dataset || '').localeCompare(String(right.dataset || ''));
    if (datasetDiff !== 0) {
      return datasetDiff;
    }

    const fileDiff = String(left.file || '').localeCompare(String(right.file || ''));
    if (fileDiff !== 0) {
      return fileDiff;
    }

    return String(left.path || '').localeCompare(String(right.path || ''));
  });
}

function buildSummary(findings, manifest) {
  const totals = {
    error: 0,
    warning: 0,
    info: 0
  };

  const byCategory = {};
  const byDataset = {};

  for (const entry of manifest) {
    byDataset[entry.dataset] = {
      errors: 0,
      warnings: 0,
      status: 'pass'
    };
  }

  for (const finding of findings) {
    if (!totals[finding.severity] && totals[finding.severity] !== 0) {
      totals[finding.severity] = 0;
    }
    totals[finding.severity] += 1;

    if (!byCategory[finding.category]) {
      byCategory[finding.category] = { error: 0, warning: 0, info: 0 };
    }
    byCategory[finding.category][finding.severity] += 1;

    if (finding.dataset && byDataset[finding.dataset]) {
      if (finding.severity === 'error') {
        byDataset[finding.dataset].errors += 1;
      }
      if (finding.severity === 'warning') {
        byDataset[finding.dataset].warnings += 1;
      }
    }
  }

  for (const dataset of Object.keys(byDataset)) {
    byDataset[dataset].status = byDataset[dataset].errors > 0 ? 'fail' : 'pass';
  }

  return {
    totals,
    byCategory,
    byDataset
  };
}

function renderMarkdownReport(report) {
  const lines = [];
  lines.push('# Schema/Data/Docs Comparison Report');
  lines.push('');
  lines.push(`- Generated: ${report.generatedAt}`);
  lines.push(`- Mode: ${report.mode}`);
  lines.push(`- Canonical datasets: ${Object.keys(report.summary.byDataset).length}`);
  lines.push(`- Errors: ${report.summary.totals.error}`);
  lines.push(`- Warnings: ${report.summary.totals.warning}`);
  lines.push('');

  lines.push('## Dataset Status');
  lines.push('');
  lines.push('| Dataset | Status | Errors | Warnings |');
  lines.push('|---|---|---:|---:|');
  for (const datasetName of Object.keys(report.summary.byDataset).sort()) {
    const datasetSummary = report.summary.byDataset[datasetName];
    lines.push(`| ${datasetName} | ${datasetSummary.status} | ${datasetSummary.errors} | ${datasetSummary.warnings} |`);
  }
  lines.push('');

  const groupedFindings = {
    error: report.findings.filter((finding) => finding.severity === 'error'),
    warning: report.findings.filter((finding) => finding.severity === 'warning'),
    info: report.findings.filter((finding) => finding.severity === 'info')
  };

  lines.push('## Findings');
  lines.push('');
  for (const severity of ['error', 'warning', 'info']) {
    const findings = groupedFindings[severity];
    lines.push(`### ${severity[0].toUpperCase()}${severity.slice(1)} (${findings.length})`);
    lines.push('');
    if (findings.length === 0) {
      lines.push('- None');
      lines.push('');
      continue;
    }

    for (const finding of findings) {
      const location = [finding.dataset, finding.file, finding.path].filter(Boolean).join(' | ');
      const suffix = location ? ` (${location})` : '';
      lines.push(`- [${finding.category}] ${finding.message}${suffix}`);
    }
    lines.push('');
  }

  lines.push('## Coverage Gaps');
  lines.push('');
  lines.push(`- Unmatched data files: ${report.coverage.unmatchedDataFiles.length}`);
  for (const file of report.coverage.unmatchedDataFiles) {
    lines.push(`- data: ${file}`);
  }
  lines.push(`- Unmatched documentation files: ${report.coverage.unmatchedDocFiles.length}`);
  for (const file of report.coverage.unmatchedDocFiles) {
    lines.push(`- docs: ${file}`);
  }
  lines.push('');

  return `${lines.join('\n')}\n`;
}

function isTopLevelFieldsContext(context) {
  let levelTwoSection = null;
  for (let idx = context.length - 1; idx >= 0; idx -= 1) {
    if (context[idx].level === 2) {
      levelTwoSection = context[idx].text.toLowerCase();
      break;
    }
  }

  if (!levelTwoSection) {
    return false;
  }

  if (levelTwoSection.includes('other objects')) {
    return false;
  }

  return levelTwoSection.includes('field');
}

function runComparison(rawOptions = {}, runtime = {}) {
  const options = { ...DEFAULT_OPTIONS, ...rawOptions };
  const repoRoot = runtime.repoRoot || path.resolve(__dirname, '..', '..');
  const manifest = runtime.manifest || schemaManifest;
  const findings = [];
  const ajv = new Ajv({ allErrors: true, verbose: true });
  addFormats(ajv);

  const schemaCache = new Map();

  for (const entry of manifest) {
    const schemaResult = safeReadJson(repoRoot, entry.schema);
    const dataResult = safeReadJson(repoRoot, entry.data);

    if (!schemaResult.ok) {
      addFinding(findings, {
        severity: 'error',
        category: 'schema-data',
        dataset: entry.dataset,
        file: entry.schema,
        message: schemaResult.error
      });
      continue;
    }
    schemaCache.set(entry.dataset, schemaResult.json);

    if (!dataResult.ok) {
      addFinding(findings, {
        severity: 'error',
        category: 'schema-data',
        dataset: entry.dataset,
        file: entry.data,
        message: dataResult.error
      });
    } else {
      const validate = ajv.compile(schemaResult.json);
      const isValid = validate(dataResult.json);
      if (!isValid) {
        addFinding(findings, {
          severity: 'error',
          category: 'schema-data',
          dataset: entry.dataset,
          file: entry.data,
          message: `Data failed schema validation with ${validate.errors.length} error(s).`,
          details: { errors: validate.errors.slice(0, 20) }
        });
      }
    }

    const docResult = safeReadFile(repoRoot, entry.doc);
    if (!docResult.ok) {
      addFinding(findings, {
        severity: 'error',
        category: 'doc-schema-block',
        dataset: entry.dataset,
        file: entry.doc,
        message: docResult.error
      });
      continue;
    }

    const block = extractJsonSchemaBlock(docResult.content);
    if (!block.ok) {
      addFinding(findings, {
        severity: 'error',
        category: 'doc-schema-block',
        dataset: entry.dataset,
        file: entry.doc,
        message: block.error
      });
    } else {
      try {
        const docSchema = JSON.parse(block.jsonText);
        const diffs = diffSchemasWithNormalization(schemaResult.json, docSchema);
        if (diffs.length > 0) {
          addFinding(findings, {
            severity: 'error',
            category: 'doc-schema-block',
            dataset: entry.dataset,
            file: entry.doc,
            path: diffs[0].path,
            message: `Embedded doc JSON schema differs from canonical schema (${diffs.length} difference(s)).`,
            details: {
              line: block.line,
              differences: diffs.slice(0, 20)
            }
          });
        }
      } catch (error) {
        addFinding(findings, {
          severity: 'error',
          category: 'doc-schema-block',
          dataset: entry.dataset,
          file: entry.doc,
          message: `Failed to parse embedded JSON schema: ${error.message}`
        });
      }
    }

    const schema = schemaCache.get(entry.dataset);
    if (!schema) {
      continue;
    }

    const rows = parseFieldTypeRows(docResult.content);
    for (const row of rows) {
      const token = extractFieldToken(row.fieldCell);
      if (!token) {
        addFinding(findings, {
          severity: 'warning',
          category: 'doc-field-table',
          dataset: entry.dataset,
          file: entry.doc,
          message: `Could not extract a backticked field token from table row at line ${row.line}.`,
          details: { line: row.line, fieldCell: row.fieldCell, typeCell: row.typeCell }
        });
        continue;
      }

      const explicitPath = token.includes('.') || token.includes('[]');
      if (!explicitPath && !isTopLevelFieldsContext(row.context)) {
        addFinding(findings, {
          severity: 'warning',
          category: 'doc-field-table',
          dataset: entry.dataset,
          file: entry.doc,
          message: `Skipping ambiguous field token "${token}" at line ${row.line} outside a top-level fields section.`,
          details: {
            line: row.line,
            context: row.context.map((heading) => heading.text)
          }
        });
        continue;
      }

      const resolved = resolveFieldPath(schema, token);
      if (!resolved.ok) {
        addFinding(findings, {
          severity: resolved.allowedByAdditionalProperties ? 'warning' : 'error',
          category: 'doc-field-table',
          dataset: entry.dataset,
          file: entry.doc,
          message: resolved.allowedByAdditionalProperties
            ? `Field "${token}" is not explicitly defined in canonical schema but allowed by additionalProperties (${resolved.error}).`
            : `Field "${token}" does not resolve in canonical schema (${resolved.error}).`,
          details: { line: row.line, token, error: resolved.error }
        });
        continue;
      }

      const docType = parseDocTypeCell(row.typeCell);
      if (!docType.ok) {
        addFinding(findings, {
          severity: 'warning',
          category: 'doc-field-table',
          dataset: entry.dataset,
          file: entry.doc,
          path: resolved.pointer,
          message: `Type for field "${token}" is ambiguous at line ${row.line}: ${docType.reason}`,
          details: { line: row.line, token, typeCell: row.typeCell }
        });
        continue;
      }

      const schemaTypes = inferSchemaTypes(resolved.node, schema);
      if (schemaTypes.length === 0) {
        addFinding(findings, {
          severity: 'warning',
          category: 'doc-field-table',
          dataset: entry.dataset,
          file: entry.doc,
          path: resolved.pointer,
          message: `Could not infer canonical schema type for field "${token}" at line ${row.line}.`,
          details: { line: row.line, token }
        });
        continue;
      }

      const docTypeSet = new Set(docType.types);
      const schemaTypeSet = new Set(schemaTypes);
      if (!setsEqual(docTypeSet, schemaTypeSet)) {
        addFinding(findings, {
          severity: 'error',
          category: 'doc-field-table',
          dataset: entry.dataset,
          file: entry.doc,
          path: resolved.pointer,
          message: `Type mismatch for field "${token}" at line ${row.line}: doc=${docType.types.join('|')} schema=${schemaTypes.join('|')}.`,
          details: {
            line: row.line,
            token,
            docTypes: docType.types,
            schemaTypes
          }
        });
      }
    }
  }

  const canonicalDataFiles = new Set(manifest.map((entry) => entry.data));
  const canonicalDocFiles = new Set(manifest.map((entry) => entry.doc));

  const dataRoot = path.join(repoRoot, 'data');
  const docsRoot = path.join(repoRoot, 'dataDocumentation');
  const allDataFiles = listFilesRecursive(dataRoot, '.json', repoRoot).sort();
  const allDocFiles = listFilesRecursive(docsRoot, '.md', repoRoot).sort();
  const unmatchedDataFiles = allDataFiles.filter((file) => !canonicalDataFiles.has(file));
  const unmatchedDocFiles = allDocFiles.filter((file) => !canonicalDocFiles.has(file));

  for (const file of unmatchedDataFiles) {
    addFinding(findings, {
      severity: 'warning',
      category: 'coverage-data',
      file,
      message: `Data file is not mapped to a canonical schema/data/doc triplet: ${file}`
    });
  }

  for (const file of unmatchedDocFiles) {
    addFinding(findings, {
      severity: 'warning',
      category: 'coverage-doc',
      file,
      message: `Documentation file is not mapped to a canonical schema/data/doc triplet: ${file}`
    });
  }

  const sortedFindings = sortFindings(findings);
  const summary = buildSummary(sortedFindings, manifest);
  const report = {
    generatedAt: new Date().toISOString(),
    mode: options.mode,
    summary,
    findings: sortedFindings,
    coverage: {
      unmatchedDataFiles,
      unmatchedDocFiles
    }
  };

  const hasCanonicalErrors = sortedFindings.some(
    (finding) => finding.severity === 'error' && finding.dataset !== null
  );

  const exitCode = options.mode === 'strict' && hasCanonicalErrors ? 1 : 0;

  const jsonOutputPath = resolveOutputPath(repoRoot, options.jsonOut);
  const markdownOutputPath = resolveOutputPath(repoRoot, options.mdOut);

  if (!options.noWrite) {
    fs.mkdirSync(path.dirname(jsonOutputPath), { recursive: true });
    fs.mkdirSync(path.dirname(markdownOutputPath), { recursive: true });
    fs.writeFileSync(jsonOutputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    fs.writeFileSync(markdownOutputPath, renderMarkdownReport(report), 'utf8');
  }

  return {
    report,
    exitCode,
    output: {
      jsonPath: jsonOutputPath,
      markdownPath: markdownOutputPath
    }
  };
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`Argument error: ${error.message}`);
    process.exit(1);
  }

  let result;
  try {
    result = runComparison(options);
  } catch (error) {
    console.error(`Comparison failed: ${error.message}`);
    process.exit(1);
  }

  const { report } = result;
  console.log(`Comparison complete: ${report.summary.totals.error} error(s), ${report.summary.totals.warning} warning(s).`);
  if (!options.noWrite) {
    console.log(`JSON report: ${toPosixPath(result.output.jsonPath)}`);
    console.log(`Markdown report: ${toPosixPath(result.output.markdownPath)}`);
  }

  if (options.mode === 'strict' && result.exitCode !== 0) {
    console.log('Strict mode failed due to canonical mismatches.');
  }

  process.exit(result.exitCode);
}

if (require.main === module) {
  main();
}

module.exports = {
  DEFAULT_OPTIONS,
  parseArgs,
  normalizeForComparison,
  diffNormalizedValues,
  diffSchemasWithNormalization,
  extractJsonSchemaBlock,
  parseFieldTypeRows,
  extractFieldToken,
  parseDocTypeCell,
  resolveFieldPath,
  inferSchemaTypes,
  runComparison,
  renderMarkdownReport
};
