import { PROFILE } from './profile';
// Raw ASCII art (large) loaded from external file for easier editing
import asciiArt from '../assets/neofetch.txt?raw';

// Theme definitions
export type ThemeName = 'dark' | 'light' | 'matrix' | 'mono' | 'solarized' | 'ultraviolet';
const THEMES: Record<ThemeName, Record<string, string>> = {
  dark: {
    '--term-bg': '#161b22', '--term-border': '#30363d', '--term-fg': '#e6edf3', '--term-fg-muted': '#94a3b8', '--term-prompt': '#3fb950', '--term-cursor': '#e6edf3', '--term-titlebar-bg1': '#20262e', '--term-titlebar-bg2': '#1a2027', '--term-footer-fg': '#586069', '--term-scrollbar': '#30363d', '--term-scrollbar-hover': '#484f58', '--page-bg': '#0d1117'
  },
  light: {
    '--term-bg': '#ffffff', '--term-border': '#d0d7de', '--term-fg': '#24292f', '--term-fg-muted': '#57606a', '--term-prompt': '#0969da', '--term-cursor': '#24292f', '--term-titlebar-bg1': '#f6f8fa', '--term-titlebar-bg2': '#eaeef2', '--term-footer-fg': '#57606a', '--term-scrollbar': '#d0d7de', '--term-scrollbar-hover': '#afb8c1', '--page-bg': '#f0f2f4'
  },
  matrix: {
    '--term-bg': '#000000', '--term-border': '#003300', '--term-fg': '#00ff66', '--term-fg-muted': '#009944', '--term-prompt': '#00ff99', '--term-cursor': '#00ff66', '--term-titlebar-bg1': '#001a00', '--term-titlebar-bg2': '#001300', '--term-footer-fg': '#008833', '--term-scrollbar': '#003300', '--term-scrollbar-hover': '#005500', '--page-bg': '#000000'
  },
  mono: {
    '--term-bg': '#1b1b1b', '--term-border': '#333333', '--term-fg': '#f0f0f0', '--term-fg-muted': '#b5b5b5', '--term-prompt': '#f0f0f0', '--term-cursor': '#ffffff', '--term-titlebar-bg1': '#262626', '--term-titlebar-bg2': '#1f1f1f', '--term-footer-fg': '#9a9a9a', '--term-scrollbar': '#333333', '--term-scrollbar-hover': '#4a4a4a', '--page-bg': '#121212'
  },
  solarized: {
    '--term-bg': '#002b36', '--term-border': '#073642', '--term-fg': '#eee8d5', '--term-fg-muted': '#93a1a1', '--term-prompt': '#b58900', '--term-cursor': '#eee8d5', '--term-titlebar-bg1': '#073642', '--term-titlebar-bg2': '#002b36', '--term-footer-fg': '#93a1a1', '--term-scrollbar': '#073642', '--term-scrollbar-hover': '#586e75', '--page-bg': '#001f27'
  },
  ultraviolet: {
    '--term-bg': '#120019', '--term-border': '#3d0d52', '--term-fg': '#f5e9ff', '--term-fg-muted': '#bfa3d4', '--term-prompt': '#d66bff', '--term-cursor': '#ffb3ff', '--term-titlebar-bg1': '#22072e', '--term-titlebar-bg2': '#170520', '--term-footer-fg': '#a87fc2', '--term-scrollbar': '#3d0d52', '--term-scrollbar-hover': '#5a1478', '--page-bg': '#0b0010'
  },
};

export const applyTheme = (name: ThemeName): string => {
  const theme = THEMES[name];
  if (!theme) return `Theme not found: ${name}`;
  const root = document.documentElement;
  Object.entries(theme).forEach(([k, v]) => root.style.setProperty(k, v));
  // Special glow effect for ultraviolet
  if (typeof document !== 'undefined') {
    document.body.classList.toggle('uv-glow', name === 'ultraviolet');
  }
  localStorage.setItem('terminal-theme', name);
  return `Theme set to ${name}`;
};

const detectCurrentTheme = (): ThemeName => {
  const saved = localStorage.getItem('terminal-theme') as ThemeName | null;
  if (saved && (saved in THEMES)) return saved;
  return 'dark';
};

// theme from localStorage
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('terminal-theme') as ThemeName | null;
  if (saved && (saved in THEMES)) {
    requestAnimationFrame(() => applyTheme(saved));
  }
}

// formatters
const pad = (s: string, w: number) => s.padEnd(w, ' ');

// Theme-aware ANSI palette helper
interface AnsiPalette {
  personal: string; // labels for personal info
  system: string;   // labels for system info
  resume: string;   // resume/help grouping
  theme: string;    // theme commands
  special: string;  // neofetch / highlighted
  file: string;     // ls file entries
  dir: string;      // ls directories
  dim: string;      // meta/dim text
  bold: string;     // bold modifier
  reset: string;    // reset code
}
const buildPalette = (t: ThemeName): AnsiPalette => {
  // Use brighter / distinct ANSI codes per theme for clearer category separation
  switch (t) {
    case 'matrix': // green world – differentiate with cyan & yellow accents
      return {
        personal:'96',   // bright cyan labels for personal info
        system:'92',     // bright green for system
        resume:'32',     // normal green for resume buckets
        theme:'93',      // bright yellow for theme commands
        special:'95',    // bright magenta for neofetch
        file:'92',       // bright green files
        dir:'36',        // cyan directories
        dim:'90', bold:'1', reset:'0'
      };
    case 'light': // lighter bg needs stronger hues
      return {
        personal:'35',   // magenta
        system:'34',     // blue
        resume:'32',     // green
        theme:'33',      // yellow
        special:'95',    // bright magenta highlight
        file:'32',       // green files
        dir:'34',        // blue dirs
        dim:'90', bold:'1', reset:'0'
      };
    case 'mono': // grayscale – differentiate with weight only
      return {
        personal:'97', system:'97', resume:'97', theme:'97', special:'97', file:'97', dir:'97', dim:'90', bold:'1', reset:'0'
      };
    case 'solarized': // earth tones approximated
      return {
        personal:'36',   // cyan
        system:'33',     // yellow
        resume:'32',     // green
        theme:'35',      // magenta accent
        special:'94',    // blue for neofetch
        file:'32',       // green files
        dir:'36',        // cyan dirs
        dim:'90', bold:'1', reset:'0'
      };
    case 'dark':
    default:
      return {
        personal:'36',   // cyan
        system:'33',     // yellow
        resume:'32',     // green
        theme:'35',      // magenta
        special:'95',    // bright magenta highlight
        file:'32',       // green files
        dir:'34',        // blue dirs
        dim:'90', bold:'1', reset:'0'
      };
  }
};

// Re-usable ANSI helpers for resume sections
const paletteHelpers = () => {
  const theme = detectCurrentTheme();
  const pal = buildPalette(theme);
  const label = (s: string, code: string = pal.resume) => `\x1b[${pal.bold};${code}m${s}\x1b[0m`;
  const dim = (s: string) => `\x1b[${pal.dim}m${s}\x1b[0m`;
  const bullet = (s: string) => `${dim('•')} ${s}`;
  return { pal, label, dim, bullet };
};

// neofetch output
export const buildNeofetch = (): string => {
  const currentTheme = (() => {
    try { return detectCurrentTheme(); } catch { return 'dark'; }
  })();
  // C"uptime" as age since birthdate in profile (YYYY-MM-DD)
  const birthIso = PROFILE as any as { birthdate?: string }; // widen
  const birth = birthIso.birthdate ? new Date(`${birthIso.birthdate}T00:00:00Z`) : new Date('2005-11-24T00:00:00Z');
  const now = new Date();
  // years
  let years = now.getFullYear() - birth.getFullYear();
  const hadBirthdayThisYear = (now.getMonth() > birth.getMonth()) || (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
  if (!hadBirthdayThisYear) years--;
  const lastBirthdayYear = hadBirthdayThisYear ? now.getFullYear() : now.getFullYear() - 1;
  const lastBirthday = new Date(Date.UTC(lastBirthdayYear, birth.getMonth(), birth.getDate()));
  const daysSinceBirthday = Math.floor((now.getTime() - lastBirthday.getTime()) / 86400000);
  const totalDays = Math.floor((now.getTime() - birth.getTime()) / 86400000);
  const uptimeStr = `${years}y ${daysSinceBirthday}d (≈${totalDays} days)`;
  const pal = buildPalette(currentTheme as ThemeName);
  const L = (code: string, label: string) => `\x1b[${pal.bold};${code}m${label}\x1b[0m`;
  const infoLines = [
    `${L(pal.personal,'Name')}:      ${PROFILE.name}`,
    `${L(pal.personal,'Title')}:     ${PROFILE.title}`,
    `${L(pal.personal,'Location')}:  ${PROFILE.location}`,
    `${L(pal.personal,'Email')}:     ${PROFILE.email}`,
    `${L(pal.personal,'GitHub')}:    ${PROFILE.github}`,
    `${L(pal.personal,'LinkedIn')}:  ${PROFILE.linkedin}`,
    '',
  `${L(pal.system,'OS')}:        Web (Browser)`,
  `${L(pal.system,'Host')}:      ${PROFILE.host || 'portfolio'}`,
  `${L(pal.system,'Shell')}:     bash (emulated)`,
  `${L(pal.system,'Terminal')}:  web tty`,
    `${L(pal.system,'Theme')}:     ${currentTheme}`,
    `${L(pal.system,'CPU')}:       Brain`,
    `${L(pal.system,'Uptime')}:    ${uptimeStr}`
  ];
  const artLinesRaw = asciiArt.replace(/\s+$/g, '').split(/\r?\n/);
  // preserve left whitespace, trim only trailing
  const artLines = artLinesRaw.map(l => l.replace(/\s+$/,' '));
  const artWidth = Math.max(...artLines.map(l => l.length));
  const gap = '    '; // GAP B/W art and text 
  const rowCount = Math.max(artLines.length, infoLines.length);
  const rows: string[] = [];
  for (let i=0;i<rowCount;i++) {
    const art = (artLines[i] || '').padEnd(artWidth, ' ');
    const info = infoLines[i] || '';
    rows.push(info ? art + gap + info : art);
  }
  return rows.join('\n') + '\n';
};

export type CommandFn = () => string;

export const commands: Record<string, CommandFn> = {
  help: () => {
    const theme = detectCurrentTheme();
    const pal = buildPalette(theme);
    const color = (code:string,s:string)=>`\x1b[${pal.bold};${code}m${s}\x1b[0m`;
    // Unified command list (include builtins from App.tsx)
    const rows: { cmd: string; desc: string; cat: keyof AnsiPalette | 'builtin'; }[] = [
      { cmd:'help', desc:'Show this help', cat:'system' },
      { cmd:'clear', desc:'Clear screen', cat:'system' },
      { cmd:'date', desc:'Show current date', cat:'system' },
      { cmd:'pwd', desc:'Print working directory', cat:'system' },
      { cmd:'ls [path]', desc:'List directory contents', cat:'system' },
      { cmd:'tree [path]', desc:'Recursive directory listing', cat:'system' },
      { cmd:'cd <dir>', desc:'Change directory (.., ., ~ supported)', cat:'system' },
      { cmd:'cat <file>', desc:'Print file contents', cat:'system' },
  { cmd:'8ball <q>', desc:'Magic 8-Ball answer', cat:'special' },
      { cmd:'neofetch', desc:'Profile/system summary', cat:'special' },
      { cmd:'palette', desc:'Show active ANSI palette', cat:'theme' },
      { cmd:'theme list', desc:'List available themes', cat:'theme' },
      { cmd:'theme set <name>', desc:'Switch theme', cat:'theme' },
  { cmd:'unlock-theme <name>', desc:'Unlock hidden theme (look around for the key!)', cat:'theme' },
      { cmd:'about', desc:'Brief profile + summary', cat:'resume' },
      { cmd:'summary', desc:'One-line summary', cat:'resume' },
      { cmd:'skills', desc:'Detailed skills listing', cat:'resume' },
      { cmd:'stack', desc:'Alias of skills', cat:'resume' },
      { cmd:'experience', desc:'Experience entries', cat:'resume' },
      { cmd:'education', desc:'Education history', cat:'resume' },
      { cmd:'projects', desc:"Project highlights", cat:'resume' },
      { cmd:'certs', desc:'Certifications list', cat:'resume' },
      { cmd:'social', desc:'Social links', cat:'resume' },
      { cmd:'contact', desc:'Contact info', cat:'resume' },
      { cmd:'whoami', desc:'Display username', cat:'resume' }
    ];
    const longest = Math.max(...rows.map(r => r.cmd.length));
    const lines = [color(pal.personal,'Commands'), ''];
    rows.forEach(r => {
      const code = r.cat === 'system' ? pal.system : r.cat === 'theme' ? pal.theme : r.cat === 'special' ? pal.special : pal.resume;
      lines.push(`  ${color(code,r.cmd.padEnd(longest,' '))}  ${r.desc}`);
    });
    lines.push('', `Type ${color(pal.special,'neofetch')} for an overview, or explore the virtual FS with ${color(pal.system,'ls')}, ${color(pal.system,'tree')}, ${color(pal.system,'cat readme.txt')}`);
    return lines.join('\n');
  },
  palette: () => {
    const theme = detectCurrentTheme();
    const pal = buildPalette(theme);
    const demo = (code:string,label:string) => `\x1b[${pal.bold};${code}m${label}\x1b[0m -> ${code}`;
    return [
      `Theme: ${theme}`,
      demo(pal.personal,'personal'),
      demo(pal.system,'system'),
      demo(pal.resume,'resume'),
      demo(pal.theme,'theme'),
      demo(pal.special,'special'),
      demo(pal.file,'file'),
      demo(pal.dir,'dir'),
      demo(pal.dim,'dim')
    ].join('\n');
  },
  clear: () => '',
  neofetch: () => buildNeofetch(),
  '8ball': () => 'Usage: 8ball <question>',
  theme: () => {
    const current = detectCurrentTheme();
    return [
      `Current theme: ${current}`,
    //   `Available: ${Object.keys(THEMES).join(', ')}`,
      'Usage:',
      '  theme list            # list themes',
      '  theme set <name>      # switch theme'
    ].join('\n');
  },
  'theme:list': () => {
    const unlocked = localStorage.getItem('uv-unlocked') === '1';
    return Object.keys(THEMES)
      .filter(n => n !== 'ultraviolet' || unlocked)
      .filter(n => n !== 'ultraviolet' || unlocked)
      .filter((n,i,a)=>a.indexOf(n)===i)
      .filter(n => n !== 'ultraviolet' || unlocked)
      .join('\n');
  },
  'theme:set': () => 'Use: theme set <name>',
  about: () => {
    const { label, dim } = paletteHelpers();
    return [
      `${label(PROFILE.name)} — ${PROFILE.title}`,
      dim(PROFILE.location),
      `GitHub: ${PROFILE.github}`,
      `LinkedIn: ${PROFILE.linkedin}`,
      '',
      PROFILE.summary || '—',
      '',
      PROFILE.languages?.length ? `${label('Languages')}: ${PROFILE.languages.join(', ')}` : '',
      PROFILE.hobbies?.length ? `${label('Hobbies')}: ${PROFILE.hobbies.join(', ')}` : ''
    ].filter(Boolean).join('\n');
  },
  summary: () => {
    const { label } = paletteHelpers();
    return `${label('Summary')}: ${PROFILE.summary || 'No summary provided.'}`;
  },
  skills: () => {
    const { label, bullet } = paletteHelpers();
    const order: (keyof typeof PROFILE.skills)[] = [
      'languages','frontend','backend','ml','data','databases','devops','tools','other','soft'
    ];
    const labels: Record<string,string> = {
      languages: 'Programming', frontend: 'Frontend', backend: 'Backend', ml: 'ML / AI',
      data: 'Data', databases: 'Databases', devops: 'DevOps', tools: 'Tools', other: 'Other', soft: 'Soft Skills'
    };
    return order
      .filter(k => (PROFILE.skills as any)[k]?.length)
      .map(k => `${label(labels[k] || k)}\n  ${(PROFILE.skills as any)[k].map((x:string)=>bullet(x)).join('\n  ')}`)
      .join('\n\n');
  },
  stack: () => commands.skills(),
  experience: () => {
    const { label, bullet } = paletteHelpers();
    return [label('Experience'), ...PROFILE.experience.map(e => bullet(`${pad(e.period,13)} ${e.role} @ ${e.company}\n    ${e.note}`))].join('\n');
  },
  education: () => {
    const { label, bullet } = paletteHelpers();
    return [label('Education'), ...PROFILE.education.map(e => bullet(`${e.degree} — ${e.school} (${e.period})`))].join('\n');
  },
  projects: () => {
    const { label, bullet } = paletteHelpers();
    return [label('Projects'), ...PROFILE.projects.map(p => bullet(`${p.name}: ${p.desc} (${p.url})`))].join('\n');
  },
  social: () => {
    const { label } = paletteHelpers();
    return [label('Social'), `GitHub:   ${PROFILE.github}`, `LinkedIn: ${PROFILE.linkedin}`].join('\n');
  },
  contact: () => {
    const { label } = paletteHelpers();
    return [label('Contact'), `Email: ${PROFILE.email}`, `GitHub: ${PROFILE.github}`, `LinkedIn: ${PROFILE.linkedin}`].join('\n');
  },
  'unlock-theme': () => 'Usage: unlock-theme <name> (after discovering a key file)',
  certs: () => {
    const { label, bullet } = paletteHelpers();
    return PROFILE.certifications?.length ? [label('Certifications'), ...PROFILE.certifications.map(c => bullet(c))].join('\n') : 'No certifications listed.';
  },
  whoami: () => PROFILE.name,
  ls: () => {
    const t = detectCurrentTheme();
    const pal = buildPalette(t);
    const cDir = (s:string) => `\x1b[${pal.dir}m${s}\x1b[0m`;
    const cFile = (s:string) => `\x1b[${pal.file}m${s}\x1b[0m`;
    const cMeta = (s:string) => `\x1b[${pal.dim}m${s}\x1b[0m`;
    const lines: string[] = [];
    const push = (l: string) => lines.push(l);
    const skillOrder: (keyof typeof PROFILE.skills)[] = ['languages','frontend','backend','ml','data','databases','devops','tools','other','soft'];
    push(cDir('resume/'));
    push('  ' + cFile('about'));
    push('  ' + cFile('summary'));
    push('  ' + cDir('skills/'));
    const visibleSkillKeys = skillOrder.filter(k => (PROFILE.skills as any)[k]?.length);
    visibleSkillKeys.forEach((k, idx) => {
      const isLast = idx === visibleSkillKeys.length - 1;
      const prefix = isLast ? '    └─' : '    ├─';
      const arr = (PROFILE.skills as any)[k] as string[];
      push(`${prefix} ${cFile(k)} ${cMeta('('+arr.length+')')}`);
    });
    push(`  ${cFile('experience')} ${cMeta('('+PROFILE.experience.length+')')}`);
    push(`  ${cFile('education')} ${cMeta('('+PROFILE.education.length+')')}`);
    push(`  ${cFile('projects')} ${cMeta('('+PROFILE.projects.length+')')}`);
    if (PROFILE.certifications?.length) push(`  ${cFile('certs')} ${cMeta('('+PROFILE.certifications.length+')')}`);
    push(`  ${cFile('theme')} ${cMeta('# theme list | theme set <name>')}`);
    push('');
    push(cMeta('Tip: use help for full command list.'));
    return lines.join('\n');
  },
  date: () => new Date().toString(),
};

// Compound theme commands when invoked from main runner
export const handleThemedCommand = (raw: string): string | null => {
  const parts = raw.trim().split(/\s+/);
  if (parts[0] !== 'theme') return null;
  if (parts.length === 1) return commands.theme();
  if (parts[1] === 'list') return Object.keys(THEMES).join('\n');
  if (parts[1] === 'set') {
    if (!parts[2]) return 'Specify a theme name. Usage: theme set <name>';
    return applyTheme(parts[2] as ThemeName);
  }
  return 'Unknown theme subcommand. Use: theme list | theme set <name>';
};

export const availableThemes = Object.keys(THEMES) as ThemeName[];
