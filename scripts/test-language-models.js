/**
 * @fileoverview Tests all language models available in AI Gateway.
 * Writes results to data/ai-model-tests.json and a short summary to stdout.
 */

const fs = require('fs');
const path = require('path');

require('dotenv').config();

const OUTPUT_PATH = path.join('data', 'ai-model-tests.json');
const BASE_URL = process.env.AI_GATEWAY_BASE_URL || 'https://ai-gateway.vercel.sh/v1';
const API_KEY = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;

if (!API_KEY) {
  console.error('Missing AI_GATEWAY_API_KEY or VERCEL_OIDC_TOKEN');
  process.exit(1);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchModels() {
  const response = await fetch(`${BASE_URL}/models`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.status}`);
  }
  const json = await response.json();
  return json.data || [];
}

async function testModel(modelId) {
  const body = {
    model: modelId,
    messages: [
      { role: 'system', content: 'Respond with the single word: OK' },
      { role: 'user', content: 'OK' }
    ],
    temperature: 0,
    max_tokens: 5,
    stream: false
  };

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    return {
      ok: false,
      status: response.status,
      error: errorText.slice(0, 1000)
    };
  }

  const json = await response.json();
  const content = json?.choices?.[0]?.message?.content || '';
  return {
    ok: true,
    status: response.status,
    content: content.trim().slice(0, 200)
  };
}

async function main() {
  const models = await fetchModels();
  const languageModels = models
    .filter(m => m.type === 'language')
    .map(m => m.id)
    .sort();

  let results = {
    generatedAt: new Date().toISOString(),
    total: languageModels.length,
    success: 0,
    failed: 0,
    models: {}
  };

  if (fs.existsSync(OUTPUT_PATH)) {
    try {
      const existing = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));
      if (existing && existing.models) {
        results.models = existing.models;
      }
    } catch (_) {
      // ignore
    }
  }

  for (const modelId of languageModels) {
    if (results.models[modelId]) {
      continue; // resume support
    }

    console.log(`Testing ${modelId}...`);
    const testResult = await testModel(modelId);
    results.models[modelId] = {
      ...testResult,
      testedAt: new Date().toISOString()
    };

    if (testResult.ok) results.success += 1;
    else results.failed += 1;

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));

    // polite pacing to reduce rate limits
    await sleep(200);
  }

  // finalize counts
  const values = Object.values(results.models);
  results.success = values.filter(v => v.ok).length;
  results.failed = values.filter(v => !v.ok).length;
  results.total = values.length;
  results.generatedAt = new Date().toISOString();

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));
  console.log(`Done. Success: ${results.success}, Failed: ${results.failed}`);
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
