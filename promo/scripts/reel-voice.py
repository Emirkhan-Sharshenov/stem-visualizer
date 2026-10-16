# Voiceover for the second series of reels (src/reels.json) with Microsoft Edge neural TTS,
# plus the timing of every word so the captions can light up word by word.
# usage (from promo/):  pip install edge-tts  &&  python scripts/reel-voice.py
# Lines whose text, voice and rate are unchanged are not regenerated.
import asyncio, hashlib, json, math, os, re, subprocess
import edge_tts

FPS = 30
FFMPEG = os.path.abspath('node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe')
OUT = 'public/vo2'

cfg = json.load(open('src/reels.json', encoding='utf-8'))
os.makedirs(OUT, exist_ok=True)
try:
    old = json.load(open(f'{OUT}/index.json', encoding='utf-8'))
except FileNotFoundError:
    old = {}


def speech_bounds(path):
    """(start, end) of the speech in seconds, ignoring the TTS padding"""
    out = subprocess.run([FFMPEG, '-hide_banner', '-i', path, '-af', 'silencedetect=n=-42dB:d=0.12', '-f', 'null', '-'], capture_output=True, text=True).stderr
    h, m, s = re.search(r'Duration: (\d+):(\d+):([\d.]+)', out).groups()
    total = int(h) * 3600 + int(m) * 60 + float(s)
    starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', out)]
    ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', out)]
    a = ends[0] if starts and starts[0] < 0.01 else 0.0
    b = starts[-1] if starts and (len(ends) < len(starts) or ends[-1] >= total - 0.05) else total
    return a, b


async def tts(text, voice, rate, path):
    """audio to path, returns [(word, start_s, end_s)]"""
    for attempt in range(20):
        try:
            words = []
            with open(path, 'wb') as f:
                async for chunk in edge_tts.Communicate(text, voice, rate=rate, boundary='WordBoundary').stream():
                    if chunk['type'] == 'audio':
                        f.write(chunk['data'])
                    elif chunk['type'] == 'WordBoundary':
                        s = chunk['offset'] / 1e7
                        words.append((chunk['text'], s, s + chunk['duration'] / 1e7))
            if os.path.getsize(path) > 0:
                return words
        except edge_tts.exceptions.NoAudioReceived:
            pass
        await asyncio.sleep(3 + attempt)
    raise SystemExit(f'нет звука: {text}')


async def main():
    index = dict(old)
    for reel, spec in cfg['reels'].items():
        lines = []
        for i, beat in enumerate(spec['beats']):
            voice, rate = beat.get('voice', cfg['voice']), beat.get('rate', cfg['rate'])
            key = hashlib.sha1(f'{voice}|{rate}|{beat["say"]}'.encode()).hexdigest()[:12]
            path = f'{OUT}/{reel}-{i}.mp3'
            prev = (old.get(reel) or [])
            prev = prev[i] if i < len(prev) else None
            if prev and prev.get('key') == key and os.path.exists(path):
                lines.append(prev)
                continue
            words = await tts(beat['say'], voice, rate, path)
            a, b = speech_bounds(path)
            lead = math.floor(a * FPS)
            lines.append({
                'key': key,
                'lead': lead,
                'len': math.ceil(b * FPS) - lead,
                # word timings in frames from the start of the speech
                'words': [{'w': w, 's': round(s * FPS - lead, 1), 'e': round(e * FPS - lead, 1)} for w, s, e in words],
            })
            index[reel] = lines + (old.get(reel) or [])[len(lines):]
            json.dump(index, open(f'{OUT}/index.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        index[reel] = lines
        print(reel, ' '.join(f'{l["len"] / FPS:.1f}s' for l in lines), f'= {sum(l["len"] for l in lines) / FPS:.1f}s speech')
    json.dump(index, open(f'{OUT}/index.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


asyncio.run(main())
