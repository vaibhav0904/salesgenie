// SUPERSEDED: AI-narration approach abandoned for self-recording in cuts
// (see ../demo-deck-for-presenter.html). Kept for reference, not run anymore.
//
// Generates one narration audio file per SEG-xx block in narration-script.md
// via the Sarvam TTS SDK, saving to audio/SEG-xx.wav. Key is read from the
// repo .env opaquely; it is never printed or returned to chat.
const fs = require('fs');
const path = require('path');
const { SarvamAIClient } = require('sarvamai');

const repoRoot = path.resolve(__dirname, '..', '..');
const envText = fs.readFileSync(path.join(repoRoot, '.env'), 'utf8');
const KEY = (envText.match(/^SARVAM_API_KEY\s*=\s*(.*)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('SARVAM_API_KEY not found in .env');

const scriptPath = path.join(__dirname, 'narration-script.md');
const md = fs.readFileSync(scriptPath, 'utf8');

// Parse "## SEG-NN — title" headers followed by a "> ..." blockquote (the line to speak).
const segRe = /^## (SEG-\d+)[^\n]*\n\n> "([\s\S]*?)"\n/gm;
const segments = [];
let m;
while ((m = segRe.exec(md))) {
  // CRITICAL: strip each continuation line's leading "> " before joining —
  // otherwise the literal ">" character is sent to the TTS engine, which
  // reads it aloud as "greater than". (Confirmed via STT round-trip.)
  const text = m[2]
    .split('\n')
    .map((line) => line.replace(/^>\s?/, ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  segments.push({ id: m[1], text });
}
console.log(`Parsed ${segments.length} segments from narration-script.md`);

// Spoken-form overrides: respell words the TTS engine mispronounces, for the
// AUDIO ONLY. Captions/on-screen text (assemble.js) keep the correct brand
// spelling — this map never touches narration-script.md itself.
const SPOKEN_FORM = [
  [/\bSalesGenie\b/g, 'Sales Genie'],
];
function toSpokenForm(text) {
  return SPOKEN_FORM.reduce((t, [pat, repl]) => t.replace(pat, repl), text);
}

const client = new SarvamAIClient({ apiSubscriptionKey: KEY });
const outDir = path.join(__dirname, 'audio');
fs.mkdirSync(outDir, { recursive: true });

const SKIP_EXISTING = process.argv.includes('--resume');

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function convertWithRetry(text, tries = 3) {
  for (let i = 1; i <= tries; i++) {
    try {
      return await withTimeout(
        client.textToSpeech.convert({
          text,
          target_language_code: 'en-IN',
          speaker: 'karun',
          model: 'bulbul:v2',
          pace: 1.02,
        }),
        45000,
        'TTS call'
      );
    } catch (e) {
      if (i === tries) throw e;
      console.log(`  retry ${i}/${tries} after error: ${e.message}`);
      await new Promise((r) => setTimeout(r, 2000 * i));
    }
  }
}

(async () => {
  const durations = [];
  for (const seg of segments) {
    const outPath = path.join(outDir, `${seg.id}.wav`);
    if (SKIP_EXISTING && fs.existsSync(outPath)) {
      console.log(`skip ${seg.id}.wav (already exists)`);
      continue;
    }
    const res = await convertWithRetry(toSpokenForm(seg.text));
    const b64 = res.audios[0];
    fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
    console.log(`wrote ${seg.id}.wav (${seg.text.length} chars)`);
    durations.push({ id: seg.id, chars: seg.text.length });
  }
  fs.writeFileSync(path.join(outDir, '_segments.json'), JSON.stringify(segments, null, 2));
  console.log('DONE:', durations.length, 'clips written to', outDir);
})().catch((e) => {
  console.error('TTS FAILED:', e.message);
  if (e.response) console.error('status:', e.response.status);
  process.exit(1);
});
