# Voiceover for the third series (src/motion.json) with the Qwen3-TTS Pinokio app:
# one designed reference voice, cloned for every line with the light 0.6B model, one request at a time
# so a 4 GB GPU never runs out of memory. Each take is checked with a local Whisper; a take that
# drops or slurs words is regenerated with another seed. Silence is trimmed, word timings saved.
# usage (from promo/):  python scripts/motion-voice.py [--base http://127.0.0.1:7860] [--stt <python> <stt.py>]
import argparse, difflib, hashlib, json, os, re, subprocess, sys, time

ap = argparse.ArgumentParser()
ap.add_argument('--base', default='http://127.0.0.1:7860')
ap.add_argument('--stt', nargs=2, metavar=('PYTHON', 'SCRIPT'), help='faster-whisper runner that prints JSON per file')
ap.add_argument('--only', default='')
args = ap.parse_args()

sys.path.insert(0, os.path.abspath('../pinokio_agent/skills/api/Qwen3-TTS-Pinokio.git/clients'))
from tts import Qwen  # noqa: E402

FPS = 30
FF = os.path.abspath('node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe')
OUT = 'public/vo3'
RAW = f'{OUT}/raw'
cfg = json.load(open('src/motion.json', encoding='utf-8'))
os.makedirs(RAW, exist_ok=True)
try:
    index = json.load(open(f'{OUT}/index.json', encoding='utf-8'))
except FileNotFoundError:
    index = {}

q = Qwen(args.base)
NUM = {'45': 'сорок пять', '128': 'сто двадцать восемь', '22': 'двадцать два', '3d': 'три дэ', 'орт': 'о эр тэ', 'powerpoint': 'пауэр поинт'}


def norm(t):
    t = t.lower().replace('ё', 'е')
    for k, v in NUM.items():
        t = t.replace(k, v.replace('ё', 'е'))
    return re.sub(r'[^a-zа-я]', '', t)


def stt(paths):
    if not args.stt:
        return {p: None for p in paths}
    out = subprocess.run([args.stt[0], args.stt[1], *paths], capture_output=True, text=True, encoding='utf-8').stdout
    res = {}
    for line in out.splitlines():
        try:
            d = json.loads(line)
            res[d['file']] = d
        except json.JSONDecodeError:
            pass
    return res


def trim(src, dst, a, b):
    """cut to [a, b] seconds, loudness-normalised 44.1 kHz mono wav (the bundled ffmpeg has no afade; Remotion fades)"""
    subprocess.run([FF, '-y', '-v', 'quiet', '-i', src, '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=7', '-ar', '44100', '-ac', '1', '-c:a', 'pcm_s16le', dst], check=True)


print('freeing GPU memory…', flush=True)
try:
    q.unload_all()
except Exception as e:  # nothing loaded is fine
    print('  ', e)

for vid, lines in cfg['videos'].items():
    if args.only and vid != args.only:
        continue
    prev = index.get(vid, [])
    out = []
    for i, text in enumerate(lines):
        key = hashlib.sha1(f"{cfg['ref']['file']}|{cfg['seed']}|{text}".encode()).hexdigest()[:12]
        if i < len(prev) and prev[i].get('key') == key and os.path.exists(f'{OUT}/{prev[i]["file"]}'):
            out.append(prev[i])
            continue
        best = None
        for attempt in range(4):
            seed = cfg['seed'] + attempt * 101
            raw = f'{RAW}/{vid}-{i}-{key}-{seed}.wav'
            t0 = time.time()
            if not os.path.exists(raw):
                q.clone(cfg['ref']['file'], cfg['ref']['text'], text, raw, language='Russian', size='0.6B', seed=seed)
            d = stt([raw])[raw]
            score = difflib.SequenceMatcher(None, norm(text), norm(d['text'])).ratio() if d else 1.0
            low = min([w['p'] for w in d['words']] or [0]) if d else 1.0
            print(f'{vid}-{i} seed {seed}: {score:.2f} min p {low:.2f} ({time.time() - t0:.0f} s) | {d["text"] if d else ""}', flush=True)
            cand = (score + 0.15 * low, raw, d)
            if not best or cand[0] > best[0]:
                best = cand
            if score >= 0.93 and low >= 0.25:
                break
            time.sleep(2)
        _, raw, d = best
        words = d['words'] if d else []
        a = max(0.0, words[0]['s'] - 0.06) if words else 0.0
        b = words[-1]['e'] + 0.28 if words else None
        if b is None:
            b = float(re.search(r'Duration: \d+:\d+:([\d.]+)', subprocess.run([FF, '-i', raw], capture_output=True, text=True).stderr).group(1))
        name = f'{vid}-{i}.wav'
        trim(raw, f'{OUT}/{name}', a, b)
        out.append({
            'key': key,
            'file': name,
            'text': text,
            'len': int(round((b - a) * FPS)),
            'words': [{'w': w['w'], 's': round((w['s'] - a) * FPS, 1), 'e': round((w['e'] - a) * FPS, 1)} for w in words],
        })
        index[vid] = out + prev[len(out):]
        json.dump(index, open(f'{OUT}/index.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    index[vid] = out
    json.dump(index, open(f'{OUT}/index.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('done', flush=True)
