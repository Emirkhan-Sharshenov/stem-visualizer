/* Checks the ORT main test bank. Run: npx tsx src/lib/ort/paper.test.ts */
import { ORT_DRILLS, ortDrill, ortSection } from './paper';
import { ORT_SECTIONS } from './sections';
import { PASSAGES } from './reading';
import { ANALOGIES, COMPLETIONS, GRAMMAR } from './verbal';

let failed = 0;
const ok = (cond: boolean, msg: string) => {
  if (!cond) failed++;
  if (!cond || !msg.startsWith('·')) console.log(`${cond ? 'ok  ' : 'FAIL'} ${msg}`);
};

// the official numbers: 150 tasks in 215 minutes
ok(ORT_SECTIONS.reduce((a, s) => a + s.questions, 0) === 150, 'the sections add up to 150 tasks');
ok(ORT_SECTIONS.reduce((a, s) => a + s.minutes, 0) === 215, 'the sections add up to 215 minutes');

// every paper: the right count, the right number of options, no repeats, a valid answer and a reason
for (let seed = 1; seed <= 300; seed++) {
  for (const s of ORT_SECTIONS) {
    const qs = ortSection(s.id, seed * 131);
    ok(qs.length === s.questions, `· ${s.id} seed ${seed} has ${qs.length} tasks`);
    ok(new Set(qs.map((q) => q.id)).size === qs.length, `· ${s.id} seed ${seed} ids are unique`);
    if (s.id === 'math') ok(new Set(qs.map((q) => q.prompt.ru)).size === qs.length, `· maths seed ${seed}: a task appears twice`);
    for (const q of qs) {
      const texts = q.options.map((o) => o.ru);
      const want = q.kind === 'pick5' ? 5 : 4;
      ok(texts.length === want, `· ${q.id}: ${texts.length} options, wanted ${want}: ${q.prompt.ru}`);
      ok(new Set(texts).size === texts.length, `· ${q.id}: repeated options ${texts.join(' | ')}: ${q.prompt.ru}`);
      ok(q.correct >= 0 && q.correct < texts.length, `· ${q.id}: answer index ${q.correct}: ${q.prompt.ru}`);
      ok(!!q.explain?.ru && !/undefined|NaN|Infinity/.test(`${q.prompt.ru} ${q.prompt.en} ${texts.join(' ')} ${q.explain.ru}`), `· ${q.id}: bad text: ${q.prompt.ru} ${texts.join(' | ')}`);
    }
  }
}
ok(true, 'bank checked over 300 papers');

// the same seed gives the same paper, so a test survives a reload
for (const s of ORT_SECTIONS) ok(JSON.stringify(ortSection(s.id, 77)) === JSON.stringify(ortSection(s.id, 77)), `${s.id}: stable for a seed`);

// maths goes from easy to hard: comparisons first, five-option tasks after
{
  const qs = ortSection('math', 5);
  ok(qs.slice(0, 30).every((q) => q.kind === 'compare') && qs.slice(30).every((q) => q.kind === 'pick5'), 'maths: comparisons, then five-option tasks');
}

// a reading paper keeps whole texts and each question carries its text
{
  const qs = ortSection('reading', 9);
  ok(qs.every((q) => q.passage), 'every reading question has its text');
  ok(new Set(qs.map((q) => q.passage!.title)).size === 4, 'a reading paper uses 4 texts');
}

// the banks: no item twice, and the model pair never reappears among its own answers
for (const [name, bank] of [['analogies', ANALOGIES], ['completions', COMPLETIONS], ['grammar', GRAMMAR]] as const) {
  ok(new Set(bank.map((r) => r[0] + r[1])).size === bank.length, `${name}: ${bank.length} different items`);
  for (const r of bank) ok(new Set(r.slice(1, 5)).size === 4, `· ${name}: repeated answers in «${r[0]}»`);
}
for (const r of COMPLETIONS) {
  const gaps = r[0].split('___').length - 1;
  for (const a of r.slice(1, 5)) ok(a.split(' / ').length === gaps, `· completion «${r[0]}»: «${a}» fills ${a.split(' / ').length} of ${gaps} gaps`);
}
ok(PASSAGES.every((p) => p.questions.length === 8), `${PASSAGES.length} texts with 8 questions each`);

// drills: every kind gives tasks with valid answers, and the drawings are present where promised
for (const d of ORT_DRILLS) {
  for (let seed = 1; seed <= 40; seed++) {
    const qs = ortDrill(d.id, seed * 17);
    ok(qs.length >= 8, `· drill ${d.id} seed ${seed}: ${qs.length} tasks`);
    for (const q of qs) {
      const texts = q.options.map((o) => o.ru);
      ok(new Set(texts).size === texts.length && q.correct >= 0 && q.correct < texts.length, `· drill ${d.id}: bad options ${texts.join(' | ')}: ${q.prompt.ru}`);
      ok(!/undefined|NaN|Infinity/.test(`${q.prompt.ru} ${texts.join(' ')} ${q.explain?.ru} ${q.figure ?? ''}`), `· drill ${d.id}: bad text ${q.prompt.ru} ${texts.join(' | ')}`);
    }
    if (d.id === 'figure') ok(qs.every((q) => q.figure?.startsWith('<svg')), `· figure drill seed ${seed}: every task has a drawing`);
    if (d.id === 'reading') ok(qs.every((q) => q.passage), `· reading drill seed ${seed}: every task has its text`);
  }
  ok(true, `drill ${d.id}: 40 sets checked`);
}
// a full maths section now mixes in drawings
ok(Array.from({ length: 20 }, (_, s) => ortSection('math', s + 1).filter((q) => q.figure).length).every((n) => n >= 2), 'every maths paper has tasks with drawings');

// subject tests: 40 tasks of four or five options each, the same for a seed
for (const subj of ['physics', 'chemistry', 'biology', 'mathematics']) {
  const qs = ortSection(`subj:${subj}`, 4242);
  ok(qs.length === 40 && qs.every((q) => q.options.length >= 4 && q.options.length <= 5 && q.correct >= 0 && q.correct < q.options.length), `subject ${subj}: ${qs.length} tasks with 4–5 options`);
}
// comparisons carry their two columns for the booklet layout
ok(ortSection('math', 3).filter((q) => q.kind === 'compare').every((q) => q.columns?.a.ru && q.columns.b.ru), 'every comparison has columns A and B');

console.log(failed ? `\n${failed} failed` : '\nall passed');
process.exit(failed ? 1 : 0);
