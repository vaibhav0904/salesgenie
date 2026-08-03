// Round-trips generated narration wavs through Sarvam STT and diffs against
// the intended text — an objective check for mispronunciation/clarity, since
// I cannot literally listen to audio.
const fs = require('fs');
const path = require('path');
const { SarvamAIClient } = require('sarvamai');

const repoRoot = path.resolve(__dirname, '..', '..');
const envText = fs.readFileSync(path.join(repoRoot, '.env'), 'utf8');
const KEY = (envText.match(/^SARVAM_API_KEY\s*=\s*(.*)$/m) || [])[1]?.trim();
const client = new SarvamAIClient({ apiSubscriptionKey: KEY });

const segs = JSON.parse(fs.readFileSync(path.join(__dirname, 'audio', '_segments.json'), 'utf8'));
const targets = process.argv.slice(2).length ? process.argv.slice(2) : segs.map((s) => s.id);

(async () => {
  for (const id of targets) {
    const seg = segs.find((s) => s.id === id);
    if (!seg) continue;
    const filePath = path.join(__dirname, 'audio', `${id}.wav`);
    const res = await client.speechToText.transcribe({
      file: fs.createReadStream(filePath),
      model: 'saarika:v2.5',
      language_code: 'en-IN',
    });
    console.log(`\n=== ${id} ===`);
    console.log('INTENDED: ', seg.text);
    console.log('STT HEARD:', res.transcript);
  }
})().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
