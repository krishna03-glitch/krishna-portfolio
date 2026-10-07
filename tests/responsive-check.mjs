// Static regression checks for the portfolio's mobile view.
// Run: node tests/responsive-check.mjs   (no dependencies)
// These guard the mobile fixes in index.html; they do not replace a real
// device/browser check (see README "Mobile check" for the manual pass).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
let failures = 0;
const check = (name, ok) => {
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + name);
  if (!ok) failures++;
};

// 1. Viewport allows user zoom (never disable pinch-zoom for mobile)
const viewport = html.match(/<meta name="viewport" content="([^"]*)">/);
check('viewport meta present', !!viewport);
check('viewport uses device width', !!viewport && viewport[1].includes('width=device-width'));
check('viewport does not disable zoom', !!viewport && !/maximum-scale|user-scalable\s*=\s*no/i.test(viewport[1]));

// 2. Overflow guards: long unbreakable content must not widen the page
check('contact handles truncate', html.includes('.contact-list a span{') && html.includes('text-overflow:ellipsis'));
check('code filename truncates', html.includes('.code-filename{') && html.includes('.code-head-left{min-width:0'));
check('SBL footer wraps', html.includes('.sbl-foot{flex-wrap:wrap'));
check('math equations scroll in-card', html.includes('.math-card .eq,.maths-t-math .eq{') && html.includes('overflow-x:auto'));
check('graph formulas scroll in-card', html.includes('#graph-theory .graph-card>div:nth-of-type(2){overflow-x:auto'));
check('toast capped to viewport', html.includes('#toast{max-width:calc(100vw - 32px)'));
check('social dock wraps', html.includes('.social-dock{flex-wrap:wrap}'));

// 3. Small-screen stacking / type
check('SBL metrics stack <=600px', /@media\(max-width:600px\)\{\.sbl-result\{grid-template-columns:1fr\}/.test(html));

// 4. Touch targets >= 44px on coarse/small screens
for (const sel of ['.project-link{min-height:44px', '#pde-ml .pde-btn{min-height:44px',
  '#pde-ml .pde-tab{min-height:44px', '.code-runbtn{min-height:44px',
  '#resume .resume-actions a{min-height:44px']) {
  check('tap target 44px: ' + sel.slice(0, 34), html.includes(sel));
}
check('switch hit-area expanded', html.includes('#pde-ml .toggle::after{content:"";position:absolute;inset:-12px}'));

// 5. iOS: form controls must not trigger auto-zoom (<16px)
check('lab select >=16px on mobile', html.includes('#pde-ml .pde-row select{font-size:16px'));

// 6. Touch: no layout-shifting hover motion, static orbs for battery
check('hover shifts neutralized on touch', html.includes('@media(hover:none){.project:hover{padding-left:0'));
check('orbs static <=600px', html.includes('.orb{animation:none}'));

// 7. Mobile perf: fullscreen bg canvas capped below 2x DPR (1.5 max)
check('neural bg DPR capped at 1.5', html.includes('dpr=Math.min(devicePixelRatio||1,1.5)'));
check('dead observer block removed', !html.includes('Pause when off-screen'));

// 8. No-JS: reveal-gated sections must still show
check('noscript reveal fallback', html.includes('<noscript><style>.reveal{opacity:1!important'));

// 9. Document integrity: balanced style/script tags
for (const tag of ['style', 'script']) {
  const open = (html.match(new RegExp('<' + tag + '[ >]', 'g')) || []).length;
  const close = (html.match(new RegExp('</' + tag + '>', 'g')) || []).length;
  check(tag + ' tags balanced (' + open + '/' + close + ')', open > 0 && open === close);
}

if (failures) { console.error('\n' + failures + ' check(s) failed'); process.exit(1); }
console.log('\nAll mobile checks passed');
