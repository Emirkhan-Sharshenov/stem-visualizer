"""Translate the strings listed by `node scripts/translate-ky.mjs --dump todo.json` into Kyrgyz on the local GPU with
NLLB-200 (CTranslate2, int8) and merge them into src/i18n/ky-auto.json. Resumable: saves every few hundred strings.
  python scripts/translate-ky-local.py todo.json [model_dir]
The model (CC-BY-NC): JustFrederik/nllb-200-distilled-1.3B-ct2-int8 from Hugging Face."""
import json, os, re, sys, time
# CUDA 12 cuBLAS from pip (nvidia-cublas-cu12) when it isn't installed system-wide
try:
    import nvidia.cublas
    _bin = os.path.join(list(nvidia.cublas.__path__)[0], 'bin')
    os.add_dll_directory(_bin)
    os.environ['PATH'] = _bin + os.pathsep + os.environ['PATH']
except Exception:
    pass
import ctranslate2, sentencepiece as spm

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'src', 'i18n', 'ky-auto.json')
if sys.argv[1] == '--polish':
    # tidy an existing ky-auto.json with the rules below, without translating anything
    todo = []
else:
    todo = json.load(open(sys.argv[1], encoding='utf-8'))
model = sys.argv[2] if len(sys.argv) > 2 else os.path.expanduser(r'~\models\nllb-1.3b-ct2')
done = json.load(open(OUT, encoding='utf-8')) if os.path.exists(OUT) else {}
todo = [s for s in todo if s not in done]

if sys.argv[1] == '--polish':
    pass
sp = spm.SentencePieceProcessor(model_file=os.path.join(model, 'sentencepiece.bpe.model'))
tr = ctranslate2.Translator(model, device=os.environ.get('KY_DEVICE', 'cuda'), compute_type='int8_float32' if os.environ.get('KY_DEVICE', 'cuda') == 'cuda' else 'int8', inter_threads=1, intra_threads=os.cpu_count() or 4)
CYR = re.compile('[А-Яа-яЁё]')
# sentences, lines, and dashes between clauses (the model has no token for — and would write ⁇)
SPLIT = re.compile(r'(?<=[.!?…:;])\s+(?=[А-ЯЁA-Z0-9«(—–-])|\n+|\s+[—–]\s+')
UNK = sp_unk = None

def pieces(s):
    """sentences of a string, with the separators kept so it can be put back together"""
    out, last = [], 0
    for m in SPLIT.finditer(s):
        out.append((s[last:m.start()], m.group(0)))
        last = m.end()
    out.append((s[last:], ''))
    return out

# every distinct sentence once
sents = sorted({p for s in todo for p, _ in pieces(s) if CYR.search(p)}, key=len)
total = sum(len(x) for x in sents)
print(f'{len(todo)} strings, {len(sents)} distinct sentences, {total:,} characters', flush=True)
cache = {}
t0, doneChars = time.time(), 0

def unknown_chars(x):
    """characters the model can't spell (ℓ, ₀, →…), in order, to put back where it writes ⁇"""
    out = []
    for ch in x:
        if not ch.isspace() and sp.piece_to_id(ch) == sp.unk_id() and sp.piece_to_id('▁' + ch) == sp.unk_id():
            ids = sp.encode(ch)
            if sp.unk_id() in ids: out.append(ch)
    return out

def run(batch):
    src = [['rus_Cyrl'] + sp.encode(x, out_type=str)[:400] + ['</s>'] for x in batch]
    res = tr.translate_batch(src, target_prefix=[['kir_Cyrl']] * len(src), beam_size=2, max_batch_size=24,
                             batch_type='examples', max_decoding_length=512, repetition_penalty=1.1, no_repeat_ngram_size=4)
    for x, r in zip(batch, res):
        y = sp.decode(r.hypotheses[0][1:]).strip()
        # keep the original's outer spacing and a missing final full stop
        if not re.search(r'[.!?…]$', x.strip()) and y.endswith('.') : y = y[:-1]
        unk = unknown_chars(x)
        y = re.sub(r'\s*⁇\s*', lambda m: (unk.pop(0) if unk else ''), y) if '⁇' in y else y
        if x[:1].islower() and y[:1].isupper(): y = y[:1].lower() + y[1:]
        cache[x] = y

def assemble():
    for s in todo:
        if s in done: continue
        parts = pieces(s)
        if all((not CYR.search(p)) or p in cache for p, _ in parts):
            done[s] = polish(s, ''.join((cache.get(p, p) if CYR.search(p) else p) + sep for p, sep in parts)) if keep(s) else s

SUP = str.maketrans('⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉⁺⁻₊₋', '01234567890123456789+-+-')
def polish(src, out):
    """put back what the model flattens: superscript and subscript digits in formulas, spaces around «»"""
    for tok in set(re.findall(r'[0-9A-Za-zА-Яа-яЁё·×^()]*[¹²³⁰-⁹₀-₉⁺⁻₊₋]+[0-9A-Za-zА-Яа-яЁё⁰-⁹₀-₉⁺⁻₊₋()]*', src)):
        flat = tok.translate(SUP)
        if tok not in out and flat in out: out = out.replace(flat, tok)
    out = re.sub(r'(?<=\w)«', ' «', out)
    out = re.sub(r'»(?=\w)', '» ', out)
    return out

def keep(src):
    """data tables and letter lists are never shown as they are written"""
    return ('|' not in src and '=>' not in src and ');' not in src and len(src) < 1500
            and not re.fullmatch(r'(\S{1,2}\s+)+\S{1,2}', src.strip()))

def save():
    tmp = OUT + '.tmp'
    json.dump(dict(sorted(done.items())), open(tmp, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    os.replace(tmp, OUT)

if sys.argv[1] == '--polish':
    done = {k: (polish(k, v) if keep(k) else k) for k, v in done.items() if keep(k)}
    save(); print(f'polished, {len(done)} kept'); sys.exit(0)
B = 48
for i in range(0, len(sents), B):
    batch = sents[i:i + B]
    run(batch)
    doneChars += sum(len(x) for x in batch)
    if (i // B) % 10 == 0 or i + B >= len(sents):
        assemble(); save()
        el = time.time() - t0
        print(f'{doneChars:,}/{total:,} chars  {el/60:.1f} min  ~{(total-doneChars)/max(doneChars,1)*el/60:.0f} min left', flush=True)
assemble(); save()
print(f'saved {len(done)} translations', flush=True)
