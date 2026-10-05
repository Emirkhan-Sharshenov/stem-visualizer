# Raises every voice line to a peak of -1 dBFS so it sits clearly above the music.
# usage (any Python with numpy + soundfile): python scripts/normalize-voice.py
import glob, numpy as np, soundfile as sf
for f in sorted(glob.glob('public/voice/*.mp3')):
    x, sr = sf.read(f)
    gain = 10 ** (-1 / 20) / np.abs(x).max()
    sf.write(f, x * gain, sr, format='MP3')
    print(f, f'+{20*np.log10(gain):.1f} dB')
