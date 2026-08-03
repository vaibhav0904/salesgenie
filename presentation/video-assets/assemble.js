// SalesGenie demo video — assembly pipeline.
// Run this AFTER raw/take1.mp4..take4.mp4 exist. It:
//  1. For each take, mutes the original audio and overlays the narration
//     track(s) for that take's segments, padding/speed-ramping the clip to
//     roughly match total narration length (simple approach: pad with the
//     clip's own last frame if footage is shorter than narration; if footage
//     is much longer than narration, it's left as-is — silence after
//     narration ends is fine, gives the viewer a beat to read the screen).
//  2. Burns in a caption (the narration text) per segment.
//  3. Concatenates: seg00 (cold open) -> take1 -> take2 -> take3 -> take4 -> seg14 (close).
//  4. Exports the LinkedIn full cut (1080p) and a GitHub teaser (first ~18s
//     of Take 3's input-required beat, silent-safe, captioned).
//
// This is a first-pass automated cut. Re-run anytime after re-recording a
// take; segment/caption text lives in narration-script.md so edits there
// flow through automatically.

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const RAW = path.join(ROOT, 'raw');
const AUDIO = path.join(ROOT, 'audio');
const WORK = path.join(ROOT, 'work');
const EXPORTS = path.join(ROOT, 'exports');
fs.mkdirSync(EXPORTS, { recursive: true });

// drawtext needs an explicit font file — fontconfig auto-discovery isn't
// configured in this ffmpeg build/environment. Kept relative (copied from
// C:/Windows/Fonts/segoeui.ttf) so the path has no drive-letter colon to
// clash with ffmpeg's own filter-option colon syntax.
const FONT_FILE = 'work/font.ttf';

function sh(cmd) {
  console.log('>', cmd.slice(0, 160));
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1024 * 1024 * 64 }).toString();
  } catch (e) {
    console.error('COMMAND FAILED:\n' + cmd);
    console.error('--- stderr ---');
    console.error((e.stderr || Buffer.from('')).toString());
    throw new Error('ffmpeg/ffprobe command failed (see above)');
  }
}

function ffprobeDuration(file) {
  return parseFloat(sh(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${file}"`).trim());
}

// Parse narration-script.md for segment text (for captions) and take groupings
// from shot-list.md's beat tables (segment -> take number).
const narrationMd = fs.readFileSync(path.join(ROOT, 'narration-script.md'), 'utf8');
const segRe = /^## (SEG-\d+)[^\n]*\n\n> "([\s\S]*?)"\n/gm;
const segments = {};
let m;
while ((m = segRe.exec(narrationMd))) {
  // Strip the markdown blockquote's leading "> " from each continuation
  // line before collapsing whitespace, or literal ">" chars leak into text.
  const clean = m[2]
    .split('\n')
    .map((line) => line.replace(/^>\s?/, ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  segments[m[1]] = clean;
}

// Break a segment's narration into short, single-line subtitle chunks
// (word-wrapped to maxChars) so drawtext never overflows the frame width.
function chunkForSubtitles(text, maxChars = 52) {
  const words = text.split(' ');
  const chunks = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? cur + ' ' + w : w;
    if (next.length > maxChars && cur) {
      chunks.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  if (cur) chunks.push(cur);
  return chunks;
}

// Manual take->segment mapping, matching shot-list.md.
const TAKES = {
  take1: ['SEG-01', 'SEG-02', 'SEG-03', 'SEG-04', 'SEG-05'],
  take2: ['SEG-06', 'SEG-07', 'SEG-08', 'SEG-09'],
  take3: ['SEG-10', 'SEG-11', 'SEG-12'],
  take4: ['SEG-13'],
};

function escapeDrawtext(s) {
  return s.replace(/\\/g, '\\\\').replace(/:/g, '\\:').replace(/'/g, "\u2019");
}

// Build one caption+narration-mixed clip per take.
function buildTakeClip(takeName, segIds) {
  const rawFile = path.join(RAW, `${takeName}.mp4`);
  if (!fs.existsSync(rawFile)) {
    console.log(`SKIP ${takeName}: ${rawFile} not found yet.`);
    return null;
  }
  const rawDur = ffprobeDuration(rawFile);

  // Concat this take's narration segments into one audio track.
  const listFile = path.join(WORK, `${takeName}-audio-list.txt`);
  fs.writeFileSync(
    listFile,
    segIds.map((id) => `file '${path.join(AUDIO, id + '.wav').replace(/\\/g, '/')}'`).join('\n')
  );
  const narrAudio = path.join(WORK, `${takeName}-narration.wav`);
  sh(`ffmpeg -y -f concat -safe 0 -i "${listFile}" -c copy "${narrAudio}"`);
  const narrDur = ffprobeDuration(narrAudio);

  // Speed factor: if raw footage runs noticeably longer than narration
  // (i.e. real dead time / waiting), speed it up so footage roughly matches
  // narration length, capped at 3x so it never looks absurd.
  let speed = rawDur / narrDur;
  speed = Math.min(Math.max(speed, 1.0), 3.0);
  const speededDur = rawDur / speed;

  // Build drawtext filters timed across the (speeded) clip. Each segment's
  // narration window is subdivided into short, word-wrapped subtitle chunks
  // (never a single long line — that runs off-frame) shown in sequence.
  let clock = 0;
  const filters = [];
  for (const id of segIds) {
    const segDur = ffprobeDuration(path.join(AUDIO, `${id}.wav`));
    const chunks = chunkForSubtitles(segments[id]);
    const perChunk = segDur / chunks.length;
    chunks.forEach((chunk, i) => {
      const start = clock + i * perChunk;
      const end = clock + (i + 1) * perChunk;
      const text = escapeDrawtext(chunk);
      filters.push(
        `drawtext=fontfile='${FONT_FILE}':text='${text}':fontcolor=white:fontsize=36:box=1:boxcolor=black@0.6:` +
        `boxborderw=16:x=(w-text_w)/2:y=h-130:` +
        `enable='between(t,${start.toFixed(2)},${end.toFixed(2)})'`
      );
    });
    clock += segDur;
  }
  const vf = `scale=1920:1080,setpts=PTS/${speed}${filters.length ? ',' + filters.join(',') : ''}`;

  const outClip = path.join(WORK, `${takeName}-final.mp4`);
  sh(
    `ffmpeg -y -i "${rawFile}" -i "${narrAudio}" ` +
    `-filter_complex "[0:v]${vf}[v]" -map "[v]" -map 1:a ` +
    `-c:v libx264 -preset medium -crf 20 -c:a aac -b:a 192k ` +
    `-t ${speededDur.toFixed(2)} -pix_fmt yuv420p "${outClip}"`
  );
  console.log(`${takeName}: raw ${rawDur.toFixed(1)}s -> speed x${speed.toFixed(2)} -> ${speededDur.toFixed(1)}s (narration ${narrDur.toFixed(1)}s)`);
  return outClip;
}

(function main() {
  const clips = [];
  const seg00 = path.join(WORK, 'seg00.mp4');
  if (fs.existsSync(seg00)) clips.push(seg00);

  for (const [take, segIds] of Object.entries(TAKES)) {
    const clip = buildTakeClip(take, segIds);
    if (clip) clips.push(clip);
  }

  const seg14 = path.join(WORK, 'seg14.mp4');
  if (fs.existsSync(seg14)) clips.push(seg14);

  if (clips.length <= 2) {
    console.log('\nNo raw take footage found yet in raw/. Nothing to assemble beyond the cards.');
    console.log('Record take1.mp4..take4.mp4 per shot-list.md, drop them in raw/, then re-run this script.');
    return;
  }

  const concatList = path.join(WORK, 'concat-list.txt');
  fs.writeFileSync(concatList, clips.map((c) => `file '${c.replace(/\\/g, '/')}'`).join('\n'));

  const fullOut = path.join(EXPORTS, 'salesgenie-demo-full.mp4');
  sh(`ffmpeg -y -f concat -safe 0 -i "${concatList}" -c:v libx264 -preset medium -crf 20 -c:a aac -b:a 192k "${fullOut}"`);
  const totalDur = ffprobeDuration(fullOut);
  console.log(`\nFULL CUT: ${fullOut} (${(totalDur / 60).toFixed(2)} min)`);

  // GitHub teaser: 15-20s from Take 3 (input-required beat) if it exists.
  const take3 = path.join(WORK, 'take3-final.mp4');
  if (fs.existsSync(take3)) {
    const teaserMp4 = path.join(EXPORTS, 'salesgenie-demo-teaser.mp4');
    const teaserGif = path.join(EXPORTS, 'salesgenie-demo-teaser.gif');
    sh(`ffmpeg -y -i "${take3}" -t 18 -vf "scale=960:-1" -c:v libx264 -crf 23 -an "${teaserMp4}"`);
    sh(`ffmpeg -y -i "${teaserMp4}" -vf "fps=12,scale=640:-1:flags=lanczos" "${teaserGif}"`);
    console.log(`TEASER: ${teaserMp4}, ${teaserGif}`);
  }

  console.log('\nDone. Verify playback before publishing.');
})();
