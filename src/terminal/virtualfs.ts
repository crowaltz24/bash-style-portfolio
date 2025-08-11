import { PROFILE } from './profile';
import { commands } from './commands';
import dragonArt from '../assets/dragon.txt?raw';

// virtual filesystem nodes
export type VFile = { type: 'file'; name: string; content: () => string };
export type VDir = { type: 'dir'; name: string; children: Record<string, VNode> };
export type VNode = VFile | VDir;

// future dynamic file support

// skill categories as directories
const buildSkillsDir = (): VDir => {
  const skillsRoot: VDir = { type: 'dir', name: 'skills', children: {} };
  const skillCats = PROFILE.skills as unknown as Record<string, readonly string[]>;
  Object.entries(skillCats).forEach(([cat, items]) => {
    skillsRoot.children[cat] = {
      type: 'dir',
      name: cat,
      children: {
        [`${cat}.txt`]: {
          type: 'file',
          name: `${cat}.txt`,
          content: () => `# ${cat}\n${items.join('\n')}`
        }
      }
    } as VDir;
  });
  // aggregated skills file
  skillsRoot.children['skills.txt'] = {
    type: 'file',
    name: 'skills.txt',
    content: () => Object.entries(skillCats)
      .map(([cat, items]) => `${cat.toUpperCase()}\n${items.join(', ')}`)
      .join('\n\n')
  };
  return skillsRoot;
};

// experience directories
const buildExperienceDir = (): VDir => {
  const expRoot: VDir = { type: 'dir', name: 'experience', children: {} };
  PROFILE.experience.forEach(exp => {
    const slug = exp.company.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    const dir: VDir = {
      type: 'dir',
      name: slug,
      children: {
        'details.txt': {
          type: 'file',
          name: 'details.txt',
          content: () => `${exp.role} @ ${exp.company}\n${exp.period}\n\n${exp.note ? exp.note : ''}`
        }
      }
    };
    expRoot.children[dir.name] = dir;
  });
  expRoot.children['experience.txt'] = {
    type: 'file',
    name: 'experience.txt',
    content: () => PROFILE.experience.map(e => `${e.period} - ${e.company} - ${e.role}`).join('\n')
  };
  return expRoot;
};

const buildProjectsDir = (): VDir => {
  const projRoot: VDir = { type: 'dir', name: 'projects', children: {} };
  PROFILE.projects.forEach(p => {
    const safe = p.name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    const isDepo = safe === 'depoindex';
    projRoot.children[safe] = {
      type: 'dir',
      name: safe,
      children: {
        'project.txt': { type: 'file', name: 'project.txt', content: () => `${p.name}\n${p.desc}\n${p.url || ''}` },
        ...(isDepo ? {
          '.ultraviolet.key': { type:'file', name:'.ultraviolet.key', content: () => `You found a luminous shard in DepoIndex.\n\nUnlock steps:\n  1. Run: cat .ultraviolet.key (done).\n  2. Run: unlock-theme ultraviolet\n\nToken: unlock-theme ultraviolet\n` }
        } : {})
      }
    } as VDir;
  });
  projRoot.children['projects.txt'] = { type: 'file', name: 'projects.txt', content: () => PROFILE.projects.map(p => p.name).join('\n') };
  return projRoot;
};

const buildCertsDir = (): VDir => ({
  type: 'dir',
  name: 'certs',
  children: {
    'certs.txt': { type: 'file', name: 'certs.txt', content: () => (PROFILE.certifications||[]).join('\n') }
  }
});

const buildSocialDir = (): VDir => ({
  type: 'dir',
  name: 'social',
  children: {
    'github.txt': { type: 'file', name: 'github.txt', content: () => PROFILE.github || '' },
    'linkedin.txt': { type: 'file', name: 'linkedin.txt', content: () => PROFILE.linkedin || '' }
  }
});

const buildContactDir = (): VDir => ({
  type: 'dir',
  name: 'contact',
  children: {
    'email.txt': { type: 'file', name: 'email.txt', content: () => PROFILE.email || '' }
  }
});

export const buildRootFS = (): VDir => ({
  type: 'dir',
  name: '',
  children: {
  'readme.txt': { type: 'file', name: 'readme.txt', content: () => `Terminal Portfolio (virtual FS)\n\nCommon commands:\n  help        - list commands\n  neofetch    - system / profile summary\n  ls [path]   - list directory\n  tree [path] - recursive directory tree\n  cat <file>  - view file\n  cd / cd ..  - navigate\n  theme list  - list themes\n  theme set <name> - switch theme\n\nKey directories:\n  about/ summary/ skills/ experience/ projects/ certs/ education/ social/ contact/\nSkill categories contain <category>.txt.\nProjects each have project.txt inside their directory.\nExperience entries have details.txt.\ncerts/ has certs.txt.\n\nProfile Summary:\n${(commands['summary']?.()||'').replace(/\x1b\[[0-9;]*m/g,'')}\n` },
    misc: { type: 'dir', name: 'misc', children: {
      'procrastination.txt': { type:'file', name:'procrastination.txt', content: () => 'You could be doing anything else, but here you are, exploring a fake file system. Good for you.' },
  'dragon.txt': { type:'file', name:'dragon.txt', content: () => dragonArt.replace(/\s+$/,'') }
    }} as VDir,
    about: { type: 'dir', name: 'about', children: { 'about.txt': { type: 'file', name: 'about.txt', content: () => (commands['about']?.()||'') } } } as VDir,
    summary: { type: 'dir', name: 'summary', children: { 'summary.txt': { type: 'file', name: 'summary.txt', content: () => (commands['summary']?.()||'') } } } as VDir,
    skills: buildSkillsDir(),
    experience: buildExperienceDir(),
    education: { type: 'dir', name: 'education', children: { 'education.txt': { type: 'file', name: 'education.txt', content: () => (commands['education']?.()||'') } } } as VDir,
    projects: buildProjectsDir(),
    certs: buildCertsDir(),
    social: buildSocialDir(),
    contact: buildContactDir()
  }
});

export const resolvePath = (root: VDir, cwd: string[], input: string): { node: VNode | null; segments: string[] } => {
  let parts: string[];
  if (!input || input === '.') parts = [...cwd];
  else if (input.startsWith('/')) parts = input.split('/').filter(Boolean);
  else if (input.startsWith('~')) parts = input.slice(1).split('/').filter(Boolean);
  else parts = [...cwd, ...input.split('/').filter(Boolean)];
  const segs: string[] = [];
  let node: VNode = root;
  for (const p of parts) {
    if (p === '.') continue;
    if (p === '..') { if (segs.length) segs.pop(); node = navigate(root, segs) || root; continue; }
    if (node.type !== 'dir') return { node: null, segments: cwd };
    const next = (node as VDir).children[p];
    if (!next) return { node: null, segments: cwd };
    segs.push(p);
    node = next;
  }
  return { node, segments: segs };
};

const navigate = (root: VDir, segs: string[]): VNode | null => {
  let cur: VNode = root;
  for (const s of segs) {
    if (cur.type !== 'dir') return null;
    const nxt: VNode | undefined = (cur as VDir).children[s];
    if (!nxt) return null;
    cur = nxt;
  }
  return cur;
};

export const listDir = (dir: VDir): string[] => Object.keys(dir.children).sort();
