const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const {
  extractJsonSchemaBlock,
  diffSchemasWithNormalization,
  parseFieldTypeRows,
  extractFieldToken,
  parseDocTypeCell,
  resolveFieldPath,
  inferSchemaTypes,
  runComparison
} = require('../src/scripts/compare-docs-data-schemas');

const repoRoot = path.resolve(__dirname, '..');

test('extractJsonSchemaBlock finds fenced schema block after heading', () => {
  const markdown = [
    '# Title',
    '',
    '## JSON Schema',
    '',
    '```json',
    '{',
    '  "type": "array"',
    '}',
    '```'
  ].join('\n');

  const result = extractJsonSchemaBlock(markdown);
  assert.equal(result.ok, true);
  assert.match(result.jsonText, /"type": "array"/);
  assert.equal(typeof result.line, 'number');
});

test('extractJsonSchemaBlock reports missing heading', () => {
  const markdown = '## Fields\n\n| Field | Type |\n|---|---|\n| `x` | `string` |';
  const result = extractJsonSchemaBlock(markdown);
  assert.equal(result.ok, false);
  assert.match(result.error, /Missing "## JSON Schema"/);
});

test('diffSchemasWithNormalization ignores order for required/enum/type arrays', () => {
  const left = {
    type: 'object',
    required: ['name', 'id'],
    properties: {
      status: { type: ['null', 'string'], enum: ['active', 'ended', null] }
    }
  };
  const right = {
    properties: {
      status: { enum: [null, 'ended', 'active'], type: ['string', 'null'] }
    },
    required: ['id', 'name'],
    type: 'object'
  };

  const diffs = diffSchemasWithNormalization(left, right);
  assert.equal(diffs.length, 0);
});

test('diffSchemasWithNormalization reports stable pointer paths for real differences', () => {
  const left = { type: 'object', properties: { name: { type: 'string' } } };
  const right = { type: 'object', properties: { name: { type: 'number' } } };
  const diffs = diffSchemasWithNormalization(left, right);
  assert.equal(diffs.length, 1);
  assert.equal(diffs[0].path, '/properties/name/type');
});

test('field table parsing + path resolution + type parsing work for nested paths', () => {
  const markdown = [
    '## Fields',
    '',
    '| Field | Type | Description |',
    '|---|---|---|',
    '| `name` | `string` | Name |',
    '| `combatPower.min` | `int\\|null` | Min CP |',
    '| `pokemon[].name` | `string` | Pokemon name |'
  ].join('\n');

  const rows = parseFieldTypeRows(markdown);
  assert.equal(rows.length, 3);

  const schema = {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        combatPower: {
          type: 'object',
          properties: {
            min: { type: ['integer', 'null'] }
          }
        },
        pokemon: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' }
            }
          }
        }
      }
    }
  };

  const secondToken = extractFieldToken(rows[1].fieldCell);
  assert.equal(secondToken, 'combatPower.min');
  const resolvedSecond = resolveFieldPath(schema, secondToken);
  assert.equal(resolvedSecond.ok, true);
  assert.equal(resolvedSecond.pointer, '/items/properties/combatPower/properties/min');

  const secondDocType = parseDocTypeCell(rows[1].typeCell);
  assert.equal(secondDocType.ok, true);
  assert.deepEqual(secondDocType.types, ['integer', 'null']);

  const schemaTypes = inferSchemaTypes(resolvedSecond.node, schema);
  assert.deepEqual(schemaTypes, ['integer', 'null']);

  const unknownResolved = resolveFieldPath(schema, 'doesNotExist');
  assert.equal(unknownResolved.ok, false);
});

test('integration: report mode writes reports and includes coverage warnings on real repo', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'schema-compare-real-'));
  const jsonOut = path.join(tmpDir, 'schema-report.json');
  const mdOut = path.join(tmpDir, 'schema-report.md');

  const result = runComparison({
    mode: 'report',
    jsonOut,
    mdOut
  }, {
    repoRoot
  });

  assert.equal(result.exitCode, 0);
  assert.equal(fs.existsSync(jsonOut), true);
  assert.equal(fs.existsSync(mdOut), true);

  const report = JSON.parse(fs.readFileSync(jsonOut, 'utf8'));
  assert.equal(report.mode, 'report');
  assert.equal(Object.keys(report.summary.byDataset).length, 6);
  assert.ok(report.coverage.unmatchedDataFiles.length > 0);
  assert.ok(report.coverage.unmatchedDocFiles.length > 0);
});

test('strict mode fails only on canonical errors, not coverage warnings', () => {
  const tmpRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'schema-compare-fixture-'));
  fs.mkdirSync(path.join(tmpRepo, 'schemas'), { recursive: true });
  fs.mkdirSync(path.join(tmpRepo, 'data'), { recursive: true });
  fs.mkdirSync(path.join(tmpRepo, 'dataDocumentation'), { recursive: true });

  const schema = {
    type: 'array',
    items: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string' }
      },
      additionalProperties: false
    }
  };

  const doc = [
    '# Foo',
    '',
    '## Fields',
    '',
    '| Field | Type | Description |',
    '|---|---|---|',
    '| `name` | `string` | Name |',
    '',
    '## JSON Schema',
    '',
    '```json',
    JSON.stringify(schema, null, 2),
    '```'
  ].join('\n');

  fs.writeFileSync(path.join(tmpRepo, 'schemas', 'foo.schema.json'), `${JSON.stringify(schema, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(tmpRepo, 'data', 'foo.json'), '[{"name":"ok"}]\n', 'utf8');
  fs.writeFileSync(path.join(tmpRepo, 'dataDocumentation', 'Foo.md'), `${doc}\n`, 'utf8');

  fs.writeFileSync(path.join(tmpRepo, 'data', 'extra.json'), '{"unused":true}\n', 'utf8');
  fs.writeFileSync(path.join(tmpRepo, 'dataDocumentation', 'Extra.md'), '# Extra\n', 'utf8');

  const manifest = [
    {
      dataset: 'foo',
      schema: 'schemas/foo.schema.json',
      data: 'data/foo.json',
      doc: 'dataDocumentation/Foo.md'
    }
  ];

  const warningOnly = runComparison({
    mode: 'strict',
    noWrite: true
  }, {
    repoRoot: tmpRepo,
    manifest
  });

  assert.equal(warningOnly.exitCode, 0);
  assert.ok(warningOnly.report.summary.totals.warning >= 2);
  assert.equal(warningOnly.report.summary.totals.error, 0);

  fs.writeFileSync(path.join(tmpRepo, 'data', 'foo.json'), '[{"name":123}]\n', 'utf8');

  const withCanonicalError = runComparison({
    mode: 'strict',
    noWrite: true
  }, {
    repoRoot: tmpRepo,
    manifest
  });

  assert.equal(withCanonicalError.exitCode, 1);
  assert.ok(withCanonicalError.report.summary.totals.error > 0);
});

test('regression: npm run validate still succeeds', () => {
  const result = spawnSync('npm', ['run', 'validate'], {
    cwd: repoRoot,
    encoding: 'utf8'
  });

  assert.equal(result.status, 0, result.stdout + result.stderr);
});
