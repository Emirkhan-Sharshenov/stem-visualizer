# Contact sheet of recorded frames: python scripts/sheet.py <rec> [frames...]  (default: every mark)
import json, sys
from PIL import Image
rec = sys.argv[1]
m = json.load(open(f'public/rec/{rec}/manifest.json', encoding='utf-8'))
frames = [int(x) for x in sys.argv[2:]] or sorted({min(v + 20, m['frames'] - 1) for v in m['marks'].values()})
ims = [Image.open(f'public/rec/{rec}/{f:05d}.jpg').resize((216, 384)) for f in frames]
sheet = Image.new('RGB', (len(ims) * 222, 384), 'white')
for i, im in enumerate(ims):
    sheet.paste(im, (i * 222, 0))
out = sys.argv[0].replace('sheet.py', f'../out/sheet-{rec}.jpg')
sheet.save(out, quality=80)
print(out, frames, m['marks'])
