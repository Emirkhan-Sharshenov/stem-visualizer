# Generates the voiceover for the promo clips with Microsoft Edge neural TTS (free, no key)
# and checks that no line runs into the next one.
# usage (from promo/):  pip install edge-tts  &&  python scripts/voice.py
# Lines whose text, voice and rate are unchanged are not regenerated.
import asyncio, hashlib, json, math, os, re, subprocess
import edge_tts

FPS = 30
HOOK_AT = 6
OUTRO_AT = 10  # frames after the recording ends
GAP = 3  # frames of silence required between lines
FFMPEG = os.path.abspath('node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe')

cfg = json.load(open('src/voice.json', encoding='utf-8'))
rec_dir = {'Overview': 'overview', 'Space': 'space', 'Chemistry': 'chem', 'Optics': 'optics', 'Circuit': 'circuit'}
os.makedirs('public/vo', exist_ok=True)
try:
    old = json.load(open('public/vo/durations.json', encoding='utf-8'))
except FileNotFoundError:
    old = {}


def start_frame(line, rec):
    if line['at'] == 'hook':
        return HOOK_AT
    if line['at'] == 'outro':
        return rec['frames'] + OUTRO_AT
    return rec['marks'][line['at']] + line.get('offset', 0)


def speech_bounds(path):
    """(start, end) of the speech in seconds, ignoring the TTS padding"""
    out = subprocess.run([FFMPEG, '-hide_banner', '-i', path, '-af', 'silencedetect=n=-42dB:d=0.12', '-f', 'null', '-'], capture_output=True, text=True).stderr
    total = float(re.search(r'Duration: (\d+):(\d+):([\d.]+)', out).group(3)) + 60 * float(re.search(r'Duration: (\d+):(\d+)', out).group(2))
    starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', out)]
    ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', out)]
    a = ends[0] if starts and starts[0] < 0.01 else 0.0
    b = starts[-1] if starts and (len(ends) < len(starts) or ends[-1] >= total - 0.05) else total
    return a, b


async def tts(text, voice, rate, path):
    for attempt in range(20):
        try:
            await edge_tts.Communicate(text, voice, rate=rate).save(path)
            return
        except edge_tts.exceptions.NoAudioReceived:
            await asyncio.sleep(3 + attempt)
    raise SystemExit(f'нет звука: {text}')


async def main():
    result = {}
    bad = 0
    for clip, lines in cfg['clips'].items():
        rec = json.load(open(f'public/rec/{rec_dir[clip]}/manifest.json', encoding='utf-8'))
        total = rec['frames'] + 90
        result[clip] = []
        for i, line in enumerate(lines):
            path = f'public/vo/{clip}-{i}.mp3'
            voice, rate = line.get('voice', cfg['voice']), line.get('rate', cfg['rate'])
            key = hashlib.sha1(f'{voice}|{rate}|{line["say"]}'.encode()).hexdigest()[:12]
            prev = (old.get(clip) or [None] * 99)[i] if i < len(old.get(clip) or []) else None
            if not (prev and prev.get('key') == key and os.path.exists(path)):
                await tts(line['say'], voice, rate, path)
            a, b = speech_bounds(path)
            # lead: frames of padding to skip; len: frames of actual speech
            result[clip].append({'key': key, 'lead': math.floor(a * FPS), 'len': math.ceil((b - math.floor(a * FPS) / FPS) * FPS)})
            # save as we go so a failed run keeps the lines already generated
            json.dump({**old, **result}, open('public/vo/durations.json', 'w', encoding='utf-8'), indent=1)
        print(clip)
        for i, line in enumerate(lines):
            a = start_frame(line, rec)
            end = a + result[clip][i]['len']
            nxt = start_frame(lines[i + 1], rec) if i + 1 < len(lines) else total
            ok = end + GAP <= nxt
            bad += not ok
            print(f'  {i} {a:4d}–{end:4d} (до {nxt:4d}) {"ok" if ok else f"НАЛЕЗАЕТ на {end + GAP - nxt} кадр."}  {line["say"]}')
    json.dump(result, open('public/vo/durations.json', 'w', encoding='utf-8'), indent=1)
    print('\nвсё помещается' if not bad else f'\n{bad} фраз(ы) налезают')


asyncio.run(main())
