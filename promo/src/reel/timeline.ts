/* Timing of the voiced vertical reels. The voice is one take; it is cut after the question line so the viewer
   gets three seconds to think, then resumes with the solution. Scene starts follow the lines of the take. */

export type Role = 'hook' | 'cond' | 'ask' | 'step' | 'answer' | 'cta';

export const FPS = 30;
export const VOICE_AT = 6;
export const THINK = 90;

/** until the take is split: a guess of each line's place from its length */
function estimate(lines: [Role, string][]): [number, number][] {
  let t = 0;
  return lines.map(([, text]) => {
    const len = text.split(/\s+/).length / 2.6;
    const span: [number, number] = [t, t + len];
    t += len + 0.45;
    return span;
  });
}

export function timeline(p: { lines: [Role, string][]; voice?: [number, number][] }) {
  const v = p.voice ?? estimate(p.lines);
  const ask = p.lines.findIndex(([r]) => r === 'ask');
  const aEnd = v[ask][1];
  const bStart = v[ask + 1][0];
  const think = VOICE_AT + Math.round(aEnd * FPS) + 8;
  const bAt = think + THINK + 6;
  const at = (i: number, sec: number) => (i <= ask ? VOICE_AT + Math.round(sec * FPS) : bAt + Math.round((sec - bStart + 0.15) * FPS));
  const lines = v.map(([a, b], i) => [at(i, a), at(i, b)] as [number, number]);
  const first = (role: Role) => lines[p.lines.findIndex(([r]) => r === role)][0];
  const problem = (p.lines.some(([r]) => r === 'cond') ? first('cond') : first('ask')) - 4;
  const answer = first('answer') - 4;
  const cta = first('cta') - 4;
  const total = lines[lines.length - 1][1] + 50;
  return {
    lines,
    steps: lines.filter((_, i) => p.lines[i][0] === 'step').map(([a]) => a),
    scenes: { hook: 0, problem, think, solve: bAt, answer, cta, total },
    audio: { aLen: Math.round((aEnd + 0.25) * FPS), bAt, bFrom: Math.max(0, Math.round((bStart - 0.15) * FPS)) },
  };
}
export type Timeline = ReturnType<typeof timeline>;
