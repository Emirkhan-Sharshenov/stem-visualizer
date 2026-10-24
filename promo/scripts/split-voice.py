"""Splits each voice take (zd-01.mp3, no-01.mp3, …) into the lines of its section in the script.

The take is cut into speech chunks at its pauses; lines are runs of consecutive chunks. A run fits a line when
its speaking time matches the line's syllables at the take's own pace, and when it has no more inner pauses
than the line has punctuation marks inside it (people pause at commas, dashes and full stops, not mid-phrase).
Prints the chosen split and writes [start, end] seconds per line to the given voice.json.
Check the printout: a line squeezed into half a second means a cut landed in the wrong pause; fix it in voice.json.
usage: python scripts/split-voice.py [script.md voice-dir out.json]
       defaults: DAILY-PROBLEM-SCRIPT.md public/vo5 src/reel/daily/voice.json"""
import json, os, re, subprocess, sys

PROMO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FF = PROMO + r'\node_modules\@remotion\compositor-win32-x64-msvc\ffmpeg.exe'
SCRIPT, AUDIO, OUT = (sys.argv[1:4] if len(sys.argv) > 3 else ['DAILY-PROBLEM-SCRIPT.md', 'public/vo5', 'src/reel/daily/voice.json'])
script = open(os.path.join(PROMO, SCRIPT), encoding='utf-8').read().split('## Ударения')[0]
sections = re.split(r'^## ([a-z]+-\d\d)[^\n]*\n', script, flags=re.M)
texts = {sections[i]: [l for l in sections[i + 1].strip().split('\n') if l and not l.startswith('#')] for i in range(1, len(sections), 2)}

VOWELS = 'аеёиоуыэюяaeiou'
syl = lambda s: sum(ch in VOWELS for ch in s.lower())
# punctuation inside a line where a pause is natural (the line's own final mark does not count)
marks = lambda s: len(re.findall(r'[,—:.?!]', s.rstrip(' .?!')))


def chunks(path):
    out = subprocess.run([FF, '-hide_banner', '-i', path, '-af', 'silencedetect=noise=-35dB:d=0.2', '-f', 'null', '-'], capture_output=True, text=True, encoding='utf-8', errors='replace').stderr
    dur = re.search(r'Duration: (\d+):(\d+):([\d.]+)', out)
    total = int(dur[1]) * 3600 + int(dur[2]) * 60 + float(dur[3])
    st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', out)]
    en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', out)]
    res, a = [], 0.0
    for s, e in zip(st, en):
        if s - a > 0.05:
            res.append((a, s))
        a = e
    if total - a > 0.1:
        res.append((a, total))
    return res


result = {}
for zid, lines in texts.items():
    ch = chunks(os.path.join(PROMO, AUDIO, f'{zid}.mp3'))
    n, k = len(ch), len(lines)
    speech = sum(e - s for s, e in ch)
    rate = speech / sum(syl(l) for l in lines)  # seconds per syllable in this take
    INF = float('inf')

    def cost(i, a, b):  # line i spoken over chunks a..b-1
        talk = sum(ch[j][1] - ch[j][0] for j in range(a, b))
        expect = syl(lines[i]) * rate
        extra = max(0, (b - a - 1) - marks(lines[i]))
        return ((talk - expect) / expect) ** 2 + 0.15 * extra

    dp = [[INF] * (n + 1) for _ in range(k + 1)]
    back = [[-1] * (n + 1) for _ in range(k + 1)]
    dp[0][0] = 0
    for i in range(k):
        for a in range(n):
            if dp[i][a] == INF:
                continue
            for b in range(a + 1, n + 1):
                c = dp[i][a] + cost(i, a, b)
                if c < dp[i + 1][b]:
                    dp[i + 1][b], back[i + 1][b] = c, a
    bounds, b = [], n
    for i in range(k, 0, -1):
        a = back[i][b]
        bounds.append((a, b))
        b = a
    bounds.reverse()
    spans = [[round(ch[a][0], 2), round(ch[b - 1][1], 2)] for a, b in bounds]
    result[zid] = spans
    print(f'{zid}  {len(ch)} chunks, {rate:.3f} s/syllable, cost {dp[k][n]:.2f}', file=sys.stderr)
    for (s, e), (a, b), l in zip(spans, bounds, lines):
        print(f'   {s:6.2f}-{e:6.2f} {b - a} chunk(s)  {l[:64]}', file=sys.stderr)

json.dump(result, open(os.path.join(PROMO, OUT), 'w'), indent=1)
