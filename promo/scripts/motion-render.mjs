// Renders the motion videos from ONE bundle (the CLI copies public/ — over a gigabyte of recorded
// frames — into a new temp bundle for every video), with modest concurrency so a laptop does not
// run out of memory, then deletes the bundle.
// --audio swaps only the soundtrack of finished videos: the mix is rendered without frames and muxed
// into out/motion/<id>.mp4 with the picture copied as is (the old file is kept in out/motion/prev/).
// usage: node scripts/motion-render.mjs [--stills | --audio] [CompositionId ...]
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { execFileSync } from 'child_process';

const args = process.argv.slice(2);
const stills = args.includes('--stills');
const audioOnly = args.includes('--audio');
const FF = path.resolve('node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe');
const ids = args.filter((a) => !a.startsWith('--'));
const want = ids.length ? ids : ['MotionTrailer', 'MotionSlides', 'MotionLabs', 'MotionMath', 'MotionTrailerVertical'];
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const concurrency = Math.max(1, Math.min(4, Math.floor(os.cpus().length / 2), Math.floor(os.freemem() / 1.5e9)));

const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
try {
  for (const id of want) {
    const composition = await selectComposition({ serveUrl, id, inputProps: {}, browserExecutable: CHROME });
    if (stills) {
      const dir = path.resolve('out/stills');
      fs.mkdirSync(dir, { recursive: true });
      for (let i = 0; i < 12; i++) {
        const frame = Math.round(((i + 0.5) * composition.durationInFrames) / 12);
        await renderStill({ composition, serveUrl, frame, output: path.join(dir, `${id}-${String(frame).padStart(4, '0')}.jpg`), imageFormat: 'jpeg', jpegQuality: 80, scale: 0.4, browserExecutable: CHROME });
      }
      console.log(id, 'stills done');
      continue;
    }
    if (audioOnly) {
      const video = path.resolve(`out/motion/${id}.mp4`);
      const wav = path.resolve(`out/motion/${id}.wav`);
      await renderMedia({ composition, serveUrl, codec: 'wav', outputLocation: wav, browserExecutable: CHROME, concurrency, timeoutInMilliseconds: 120000 });
      const prev = path.resolve('out/motion/prev');
      fs.mkdirSync(prev, { recursive: true });
      const old = path.join(prev, `${id}.mp4`);
      if (!fs.existsSync(old)) fs.copyFileSync(video, old);
      execFileSync(FF, ['-y', '-v', 'error', '-i', old, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', video]);
      fs.rmSync(wav);
      console.log(id, 'soundtrack replaced');
      continue;
    }
    const t0 = Date.now();
    let last = -1;
    await renderMedia({
      composition,
      serveUrl,
      codec: 'h264',
      crf: 18,
      audioBitrate: '192k',
      outputLocation: path.resolve(`out/motion/${id}.mp4`),
      imageFormat: 'jpeg',
      jpegQuality: 90,
      concurrency,
      browserExecutable: CHROME,
      timeoutInMilliseconds: 120000,
      onProgress: ({ progress }) => {
        const p = Math.floor(progress * 10);
        if (p !== last) {
          last = p;
          process.stdout.write(`${id} ${p * 10}%  `);
        }
      },
    });
    console.log(`\n${id}: ${(composition.durationInFrames / 30).toFixed(1)} s video in ${((Date.now() - t0) / 1000).toFixed(0)} s (concurrency ${concurrency})`);
  }
} finally {
  // Windows may still hold a file in the bundle for a moment
  try {
    fs.rmSync(serveUrl, { recursive: true, force: true, maxRetries: 5, retryDelay: 1000 });
  } catch (e) {
    console.warn('could not remove the bundle:', serveUrl, e.code);
  }
}
