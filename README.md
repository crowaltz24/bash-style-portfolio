# Terminal Portfolio (bash‑style)

Web terminal that presents a developer portfolio using a faux bash shell + neofetch style system block. It supports themed ANSI output, a virtual filesystem (VFS) you can explore, and themes and stuff.

## Feature Highlights
* Neofetch clone: side‑by‑side ASCII art + info
* Rich command set (resume sections, theming, utilities, fun extras)
* Virtual filesystem mirroring resume structure (directories + .txt content files)
* Theming (dark, light, matrix, mono, solarized + secret)
* ANSI parsing for classy theme switching
* Realistic prompt user@host:cwd$ with cwd tracking and cd navigation (supports ., .., ~, absolute-ish)
* History & editing: up/down history cycling, left/right caret movement, Home/End, insertion editing, Ctrl+C cancel
* Hidden theme unlock mechanic

## Command Cheat Sheet
```
help                   Grouped help (includes builtins)
clear                  Clear the screen
date                   Current date/time
pwd / cd / cd ..       Print / change directory
ls [path]              List directory contents (colorized)
tree [path]            Recursive tree view (hides secret key file)
cat <file>             Print file content
whoami                 Show username
neofetch               ASCII art + profile/system summary
palette                Display active ANSI category mapping
theme list             List visible themes (secret hidden until unlocked)
theme set <name>       Apply a theme
unlock-theme <name>    Unlock hidden theme (after finding key)
8ball <question?>      Magic 8-Ball (requires a multi-word question)

Resume / Profile:
about | summary | skills | stack | experience | education | projects | certs | social | contact
```

### Virtual Filesystem Layout
Navigate with `cd`, inspect with `ls`, `tree`, and `cat`:
```
~/
	readme.txt            Quick usage & summary
	about/ about.txt
	summary/ summary.txt
	skills/               Per category subdirectories each containing <category>.txt
	experience/           One directory per company + experience.txt aggregate
	education/ education.txt
	projects/ <project>/ project.txt (one directory per project)
	certs/ certs.txt
	social/ github.txt, linkedin.txt
	contact/ email.txt
	misc/ dragon.txt, procrastination.txt (easter eggs)
```
Aggregated files (skills.txt, experience.txt, projects.txt) also exist inside their parent directories.

### Theming & ANSI Palette
`theme list` shows non-secret themes. `theme set <name>` applies instantly by updating CSS variables; previously printed output recolors because ANSI segments are styled via CSS palette variables. Use `palette` to view the current theme's semantic category mapping (personal/system/resume/theme/special/file/dir/dim). The secret theme adds a body class for a subtle neon glow.

### Secret Theme Unlock
CURRENTLY A BIT PROBLEMATIC, WILL FIX
1. Explore the file system.
2. Find & `cat` the hidden `.key` file (it's suppressed in `tree`!).

### Customisation
Edit `src/terminal/profile.ts` to change:
* Identity (name/title/location/email/social links)
* Skill categories & ordering
* Projects / experience / certifications / education
* Birthdate (affects uptime calculation in neofetch)

Add or adjust commands in `src/terminal/commands.ts` (extend the `commands` map or themed command handler). 

Virtual filesystem structure is generated in `src/terminal/virtualfs.ts` - you can add dynamic files or new directories there.

### Possible Future Enhancements
* Tab completion / suggestions
* Additional mini-games or fun misc stuff