import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { commands, handleThemedCommand } from './terminal/commands';
import { PROFILE } from './terminal/profile';
import { buildRootFS, listDir, resolvePath } from './terminal/virtualfs';
import { applyTheme } from './terminal/commands';
import type { VDir } from './terminal/virtualfs';

// history entries
interface HistoryEntry { type: 'command' | 'output'; text: string }

// commands imported from ./terminal/commands

const App: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [input, setInput] = useState('');
  const [caretPos, setCaretPos] = useState(0);
  const [cursorRev, setCursorRev] = useState(0);
  useEffect(() => { setCursorRev(r => r + 1); }, [caretPos]);
  const scrollToBottom = () => {
    const el = bodyRef.current; if (!el) return;
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  };
  // raw command history (only commands the user executed)
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const focusHidden = () => hiddenInputRef.current?.focus();

  const append = (entries: HistoryEntry | HistoryEntry[]) => {
    setHistory(prev => prev.concat(entries));
  };

  // virtual filesystem
  const fsRootRef = useRef<VDir | null>(null);
  if (!fsRootRef.current) fsRootRef.current = buildRootFS();
  const [cwdSegs, setCwdSegs] = useState<string[]>([]); // relative to root (which represents ~)
  const cwdPath = () => (cwdSegs.length ? '~/' + cwdSegs.join('/') : '~');
  const runCommand = (raw: string) => {
    const cmd = raw.trim();
  const promptRendered = buildPrompt(cwdPath());

    stickRef.current = true;
    const forceScroll = () => scrollToBottom();
    if (!cmd) { append({ type: 'command', text: promptRendered }); forceScroll(); return; }
    const lower = cmd.toLowerCase();
    append({ type: 'command', text: `${promptRendered}${cmd}` });
    if (lower === 'clear') { setHistory([]); forceScroll(); return; }
    if (lower === 'pwd') { append({ type: 'output', text: '/home/' + PROFILE.shellUser + (cwdSegs.length? '/' + cwdSegs.join('/'):'') }); forceScroll(); return; }
    if (lower === 'cd') { setCwdSegs([]); forceScroll(); return; }
    if (lower.startsWith('cd ')) {
      const target = cmd.slice(3).trim();
      const { node, segments } = resolvePath(fsRootRef.current!, cwdSegs, target);
      if (node && node.type === 'dir') setCwdSegs(segments);
      else append({ type: 'output', text: `bash: cd: ${target}: No such file or directory` });
      forceScroll();
      return;
    }
    if (lower.startsWith('unlock-theme ')) {
      const name = cmd.slice('unlock-theme '.length).trim() as any;
      if (!name) { append({ type: 'output', text: 'Usage: unlock-theme <name>' }); forceScroll(); return; }

      // require that key file has been read ( via history search)
      const keySeen = history.some(h => h.type==='output' && /unlock-theme ultraviolet/.test(h.text));
      if (name === 'ultraviolet') {
        if (!keySeen) append({ type: 'output', text: 'Key not yet discovered.' });
        else {
          localStorage.setItem('uv-unlocked','1');
          append({ type: 'output', text: applyTheme('ultraviolet') });
        }
      } else append({ type: 'output', text: `Unknown hidden theme: ${name}` });
      forceScroll();
      return;
    }
    if (lower.startsWith('8ball')) {
      const q = raw.slice(5).trim();
      if (!q || q.indexOf(' ') === -1) { append({ type: 'output', text: 'Usage: 8ball <yes/no style question>' }); forceScroll(); return; }
      const answers = [
        'It is certain.', 'Without a doubt.', 'You may rely on it.', 'Yes – definitely.', 'Most likely.', 'Outlook good.', 'Yes.', 'Signs point to yes.',
        'Reply hazy, try again.', 'Ask again later.', 'Better not tell you now.', 'Cannot predict now.', 'Concentrate and ask again.',
        "Don't count on it.", 'My reply is no.', 'Outlook not so good.', 'Very doubtful.'
      ];
      append({ type: 'output', text: answers[Math.floor(Math.random()*answers.length)] });
      forceScroll();
      return;
    }
    if (lower === 'ls' || lower.startsWith('ls ')) {
      const targetArg = lower === 'ls' ? '' : cmd.slice(3).trim();
      const { node } = resolvePath(fsRootRef.current!, cwdSegs, targetArg);
      if (!node) append({ type: 'output', text: `ls: cannot access '${targetArg}': No such file or directory` });
      else if (node.type === 'file') append({ type: 'output', text: node.name });
      else {
        const names = listDir(node).map(n => {
          const child = node.children[n];
            return child.type === 'dir' ? `\x1b[34m${n}/\x1b[0m` : n; }).join('  ');
        append({ type: 'output', text: names || '' });
      }
      forceScroll();
      return;
    }
    if (lower === 'tree' || lower.startsWith('tree ')) {
      const targetArg = lower === 'tree' ? '' : cmd.slice(5).trim();
      const { node } = resolvePath(fsRootRef.current!, cwdSegs, targetArg);
      if (!node) { append({ type: 'output', text: `tree: '${targetArg}' not found` }); forceScroll(); return; }
      if (node.type === 'file') { append({ type: 'output', text: node.name }); forceScroll(); return; }
      const lines: string[] = [];
      const walk = (dir: any, prefix: string) => {
        // hide the secret key file from tree output
        const entries = Object.keys(dir.children)
          .filter(name => name !== '.ultraviolet.key')
          .sort();
        entries.forEach((name, idx) => {
          const child = dir.children[name];
          const isLast = idx === entries.length - 1;
          const branch = isLast ? '└── ' : '├── ';
          const colorName = child.type === 'dir' ? `\x1b[34m${name}/\x1b[0m` : name;
          lines.push(prefix + branch + colorName);
          if (child.type === 'dir') {
            walk(child, prefix + (isLast ? '    ' : '│   '));
          }
        });
      };
      const rootLabel = (targetArg || '.');
      lines.push(rootLabel);
      walk(node, '');
      append({ type: 'output', text: lines.join('\n') });
      forceScroll();
      return;
    }
    if (lower.startsWith('cat ')) {
      const filePath = cmd.slice(4).trim();
      const { node } = resolvePath(fsRootRef.current!, cwdSegs, filePath);
      if (!node) append({ type: 'output', text: `cat: ${filePath}: No such file or directory` });
      else if (node.type === 'dir') append({ type: 'output', text: `cat: ${filePath}: Is a directory` });
      else append({ type: 'output', text: node.content() });
      forceScroll();
      return;
    }
    // theme subcommands
    const themed = handleThemedCommand(cmd);
    if (themed !== null) { if (themed) append({ type: 'output', text: themed }); forceScroll(); return; }
    const handler = commands[lower];
    if (handler) {
      const out = handler();
      if (out) append({ type: 'output', text: out });
      forceScroll();
      return;
    }
    append({ type: 'output', text: `Command not found: ${cmd}` });
    forceScroll();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      runCommand(input);
      if (input.trim()) {
        setCommandHistory(prev => (prev[prev.length - 1] === input ? prev : [...prev, input]));
      }
  // reset navigation index implicitly by not using explicit pointer
      setInput('');
      setCaretPos(0);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      if (caretPos > 0) setCaretPos(caretPos - 1);
      e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      if (caretPos < input.length) setCaretPos(caretPos + 1);
      e.preventDefault();
    } else if (e.key === 'c' && e.ctrlKey) {
      append({ type: 'output', text: '^C' });
      setInput('');
      setCaretPos(0);
  // cancel navigation state
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      if (commandHistory.length) {
        // cycle through history from newest to oldest
        const idx = commandHistory.lastIndexOf(input);
        const nextIndex = idx <= 0 ? commandHistory.length - 1 : idx - 1;
        setInput(commandHistory[nextIndex]);
        setCaretPos(commandHistory[nextIndex].length);
      }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (commandHistory.length) {
        const idx = commandHistory.lastIndexOf(input);
        if (idx === -1 || idx === commandHistory.length - 1) setInput('');
        else setInput(commandHistory[idx + 1]);
        const val = (idx === -1 || idx === commandHistory.length - 1) ? '' : commandHistory[idx + 1];
        setCaretPos(val.length);
      }
      e.preventDefault();
    } else if (e.key === 'Backspace') {
      if (caretPos > 0) {
        setInput(input.slice(0, caretPos - 1) + input.slice(caretPos));
        setCaretPos(caretPos - 1);
      }
      e.preventDefault();
    } else if (e.key === 'Delete') {
      if (caretPos < input.length) {
        setInput(input.slice(0, caretPos) + input.slice(caretPos + 1));
      }
      e.preventDefault();
    } else if (e.key === 'Home') {
      setCaretPos(0);
      e.preventDefault();
    } else if (e.key === 'End') {
      setCaretPos(input.length);
      e.preventDefault();
    } else if (e.key.length === 1 && !e.altKey && !e.metaKey && !e.ctrlKey) {
      // printable character insertion at caret
      setInput(input.slice(0, caretPos) + e.key + input.slice(caretPos));
      setCaretPos(caretPos + 1);
      e.preventDefault();
    }
  };


  const stickRef = useRef(true); // whether we should keep sticking to bottom
  // user scroll position
  useEffect(() => {
    const el = bodyRef.current; if (!el) return;
    const onScroll = () => {
      // if near bottom keep stick on else disable
      stickRef.current = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);
  // scroll to bottom after history changes if sticking
  useEffect(() => {
    if (!stickRef.current) return;
    const el = bodyRef.current; if (!el) return;
    // DOM height updated
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }, [history]);
  useEffect(() => { focusHidden(); }, []);

  // Basic ANSI escape parser to colorize output lines (supports \x1b[...m)
  const renderWithAnsi = (text: string) => {
    const parts = text.split(/(\x1b\[[0-9;]*m)/g);
    const out: React.ReactNode[] = [];
    let curStyle: React.CSSProperties = {};
    const colorMap: Record<string,string> = {
      '30': '#6e7681', // black / muted
      '31': '#ff7b72',
      '32': 'var(--term-prompt)',
      '33': '#e3b341',
      '34': '#58a6ff',
      '35': '#d2a8ff',
      '36': '#39c5cf',
      '37': 'var(--term-fg)',
      '90': '#8b949e',
      '91': '#ffaba8',
      '92': '#56d364',
      '93': '#e3b341',
      '94': '#79c0ff',
      '95': '#d2a8ff',
      '96': '#56d4dd',
      '97': '#ffffff'
    };
    parts.forEach((seg, i) => {
      const m = seg.match(/^\x1b\[([0-9;]*)m$/);
      if (m) {
        const codes = m[1].split(';').filter(Boolean);
        if (codes.length === 0) {
          // ESC[m means reset
          curStyle = {};
        } else {
          codes.forEach(code => {
            if (code === '0') curStyle = {};
            else if (code === '1') curStyle = { ...curStyle, fontWeight: 600 };
            else if (code === '2') curStyle = { ...curStyle, opacity: 0.75 };
            else if (colorMap[code]) curStyle = { ...curStyle, color: colorMap[code] };
          });
        }
      } else if (seg) {
        out.push(<span style={curStyle} key={i}>{seg}</span>);
      }
    });
    return out;
  };

  const buildPrompt = (dirPath: string) => {
    const user = PROFILE.shellUser || 'user';
    const host = PROFILE.host || 'host';
    const path = dirPath;
    // ANSI colors: user (green), host (blue), path (cyan)
    return `\x1b[32m${user}\x1b[0m@\x1b[34m${host}\x1b[0m:\x1b[36m${path}\x1b[0m$ `;
  };

  return (
    <div className="terminal-bg" onClick={focusHidden}>
      <div className="terminal-window">
        <div className="terminal-titlebar">
          <div className="traffic-lights">
            <span className="tl tl-red" />
            <span className="tl tl-yellow" />
            <span className="tl tl-green" />
          </div>
          <div className="terminal-title">abhay@portfolio - bash</div>
        </div>
  <div className="terminal-body" ref={bodyRef}>
          {history.map((h, i) => (
            <pre key={i} className={`terminal-line ${h.type}`}>
              {renderWithAnsi(h.text)}
            </pre>
          ))}
          <div className="terminal-input-row">
            <span className="terminal-prompt">{renderWithAnsi(buildPrompt(cwdPath()))}</span>
            <div className="terminal-active-input" onClick={() => { // TODO: rudimentary click-to-set caret (end)
              focusHidden();
              setCaretPos(input.length);
            }}>
              <span className="typed">
                {input.slice(0, caretPos)}
                <span className="cursor-cell" key={cursorRev}>
                  <span className="cursor-char">{caretPos < input.length ? (input[caretPos] === ' ' ? '\u00A0' : input[caretPos]) : '\u00A0'}</span>
                  <span className="cursor-block" />
                </span>
                {caretPos < input.length ? input.slice(caretPos + 1) : ''}
              </span>
            </div>
            <input
              ref={hiddenInputRef}
              className="terminal-hidden-input"
              // keep value for accessibility, manual key handling manages state
              value={input}
              onChange={(e) => { setInput(e.target.value); setCaretPos(e.target.value.length); }}
              onKeyDown={handleKeyDown}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              aria-label="terminal input"
            />
          </div>
        </div>
  <div className="terminal-footer">Type 'help' to list commands. Example: neofetch | tree | about</div>
      </div>
    </div>
  );
};

export default App;




