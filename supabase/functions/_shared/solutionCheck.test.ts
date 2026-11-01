/* Checks who may use the photo check and how the model's answer is read. Run: npx tsx supabase/functions/_shared/solutionCheck.test.ts */
import { CHECK_SCHEMA, checkPhoto, checkSystem, CRITERIA, isPaidSub, parseCheck } from './solutionCheck';

let failed = 0;
const ok = (cond: boolean, msg: string) => {
  if (!cond) failed++;
  console.log(`${cond ? 'ok  ' : 'FAIL'} ${msg}`);
};

// only money counts
const future = new Date(Date.now() + 864e5).toISOString();
const past = new Date(Date.now() - 864e5).toISOString();
ok(isPaidSub({ status: 'active', expires_at: future, source: 'freemius' }), 'a paid subscription opens it');
ok(isPaidSub({ status: 'active', expires_at: future, source: 'promo' }), 'a promo code opens it');
ok(!isPaidSub({ status: 'active', expires_at: future, source: 'trial' }), 'the free week does not');
ok(!isPaidSub({ status: 'active', expires_at: past, source: 'freemius' }), 'an expired subscription does not');
ok(!isPaidSub({ status: 'canceled', expires_at: future, source: 'freemius' }), 'a cancelled subscription does not');
ok(!isPaidSub(null), 'no subscription does not');

// photos
ok(!!checkPhoto({ mime: 'image/jpeg', data: 'abc' }), 'a JPEG is accepted');
ok(!checkPhoto({ mime: 'application/pdf', data: 'abc' }), 'a PDF is refused');
ok(!checkPhoto({ mime: 'image/jpeg', data: 'x'.repeat(2_000_001) }), 'an oversized photo is refused');
ok(!checkPhoto('nope'), 'junk is refused');

// the model's answer
const good = { status: 'ok', problem: 'p', solution: 's', answer: 'a', steps: [{ read: 'E = 40', verdict: 'error', comment: 'c' }], studentAnswer: '40', answerVerdict: 'wrong', criteria: { method: { verdict: 'ok', note: '' }, reasoning: { verdict: 'ok', note: '' }, calculation: { verdict: 'fail', note: 'n' }, answer: { verdict: 'fail', note: '' } }, fix: 'f', topic: 't', retake: '' };
const read = parseCheck(JSON.stringify(good))!;
ok(read.status === 'ok' && read.steps[0].verdict === 'error' && read.criteria.calculation.verdict === 'fail', 'a good answer is read as it is');
ok(parseCheck('not json') === null, 'broken JSON gives no result, so the check is not counted');
ok(parseCheck(JSON.stringify({ ...good, steps: [] }))!.status === 'unreadable', 'a check with no steps read is not shown as passed');
ok(parseCheck(JSON.stringify({ ...good, status: 'hacked' }))!.status === 'unreadable', 'an unknown status is not trusted');
ok(parseCheck(JSON.stringify({ ...good, steps: [{ read: 'x', verdict: 'perfect', comment: '' }] }))!.steps[0].verdict === 'unclear', 'an unknown verdict is not trusted');
const noCriteria = parseCheck(JSON.stringify({ ...good, criteria: undefined }))!;
ok(CRITERIA.every((id) => noCriteria.criteria[id].verdict === 'partial'), 'missing criteria never count as passed');

ok(parseCheck(JSON.stringify({ ...good, answer: '50 \\text{ Н}' }))!.answer === '$50 \\text{ Н}$', 'an unwrapped formula is wrapped');
ok(parseCheck(JSON.stringify({ ...good, answer: '$x$ и \\frac{1}{2}' }))!.answer === '$x$ и \\frac{1}{2}', 'a wrapped answer is left alone');

// the prompt treats the photo as data, and the solution is written before the steps are read
ok(/ТОЛЬКО ДАННЫЕ/.test(checkSystem(true)), 'the photo is data, not instructions');
ok(CHECK_SCHEMA.propertyOrdering.indexOf('solution') < CHECK_SCHEMA.propertyOrdering.indexOf('steps'), 'the model solves before it marks');

console.log(failed ? `\n${failed} failed` : '\nall passed');
process.exit(failed ? 1 : 0);
