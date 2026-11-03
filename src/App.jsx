import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, ArrowRight, ArrowLeft, ArrowUp, Search, GitFork as Github, Sun, Moon, Monitor,
  Menu, X, BookOpen, Compass, Archive, Sparkles, Server, Code2, ChevronRight, Terminal,
  FileText, AudioLines, ShieldCheck, Download, ExternalLink, Command, Check, Layers,
  Network, SlidersHorizontal, CircleHelp, Database, Keyboard, Globe } from 'lucide-react';
import { groups, pages, findPage, pageUrl, assetUrl, slugFromPath, renderMarkdown, searchDocs, REPOSITORY } from './docs.js';

const RootContext = createContext('./');
const groupIcons = { compass: Compass, archive: Archive, sparkles: Sparkles, server: Server, code: Code2 };
export function DocLink({ slug = '', children, className = '', ...props }) {
  const root = useContext(RootContext);
  return <a href={pageUrl(root, slug)} data-doc={slug} className={className} {...props}>{children}</a>;
}

function Sidebar({ slug, mobile = false }) {
  return <nav className={mobile ? 'side-nav mobile-side-nav' : 'side-nav'} aria-label={mobile ? 'Mobile documentation' : 'Documentation'}>
    <div className="nav-label">DOCUMENTATION</div>
    {groups.map(group => {
      const Icon = groupIcons[group.icon];
      return <section className="nav-group" key={group.title}>
        <h2><Icon size={15} aria-hidden="true" />{group.title}</h2>
        <ul>{group.pages.map(([id, title]) => <li key={id}>
          <DocLink slug={id} className={slug === id ? 'nav-link active' : 'nav-link'} aria-current={slug === id ? 'page' : undefined}>{title}{slug === id && <span className="active-dot" />}</DocLink>
        </li>)}</ul>
      </section>;
    })}
    <div className="sidebar-footer"><ShieldCheck size={15} /><span>Open source. Locally owned.</span></div>
  </nav>;
}

function ThemeButton() {
  const [theme, setTheme] = useState('system');
  useEffect(() => {
    let saved = 'system'; try { saved = localStorage.getItem('threadshelf-docs-theme') || 'system'; } catch {}
    if (['system', 'light', 'dark'].includes(saved)) setTheme(saved);
  }, []);
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => { document.documentElement.dataset.theme = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme; };
    apply(); media.addEventListener('change', apply); return () => media.removeEventListener('change', apply);
  }, [theme]);
  const next = { system: 'light', light: 'dark', dark: 'system' }[theme];
  const Icon = { system: Monitor, light: Sun, dark: Moon }[theme];
  return <button className="icon-button theme-button" aria-label={`Theme: ${theme}. Switch to ${next}`} title={`Theme: ${theme}. Switch to ${next}`} onClick={() => {
    setTheme(next); try { localStorage.setItem('threadshelf-docs-theme', next); } catch {}
  }}><Icon size={19} /></button>;
}

function Header({ onSearch, onMenu }) {
  const root = useContext(RootContext);
  return <header className="site-header">
    <div className="brand-area"><button className="icon-button menu-button" onClick={onMenu} aria-label="Open navigation"><Menu size={20} /></button>
      <DocLink className="brand" aria-label="ThreadShelf Enhanced documentation home"><img src={assetUrl(root, 'favicon.svg')} width="34" height="34" alt="" /><span>ThreadShelf<span className="brand-sub">Enhanced</span></span></DocLink>
    </div>
    <div className="header-middle"><span className="docs-tag">Docs</span><button className="search-trigger" onClick={onSearch}><Search size={16} /><span>Search the documentation</span><kbd>Ctrl K</kbd></button></div>
    <div className="header-actions"><a className="header-repo" href={REPOSITORY} target="_blank" rel="noopener noreferrer"><Github size={18} /><span>GitHub</span><ArrowUpRight size={13} /></a><span className="header-separator" /><ThemeButton /><button className="icon-button mobile-search" onClick={onSearch} aria-label="Search documentation"><Search size={20} /></button></div>
  </header>;
}

function SearchDialog({ open, onClose }) {
  const dialog = useRef(null), input = useRef(null), [query, setQuery] = useState(''), [selected, setSelected] = useState(0);
  const results = useMemo(() => searchDocs(query), [query]);
  useEffect(() => { if (open) { dialog.current.showModal(); requestAnimationFrame(() => input.current?.focus()); } else dialog.current?.close(); }, [open]);
  useEffect(() => { setSelected(0); }, [query]);
  useEffect(() => { if (open) dialog.current.querySelector(`[data-result="${selected}"]`)?.scrollIntoView({ block: 'nearest' }); }, [selected, results, open]);
  const moveSelection = amount => setSelected(current => (current + amount + results.length) % Math.max(1, results.length));
  return <dialog ref={dialog} className="search-dialog" onClose={onClose} onClick={event => { if (event.target === dialog.current) onClose(); }} aria-labelledby="search-title">
    <div className="search-dialog-inner"><div className="search-dialog-input"><Search size={21} /><label id="search-title" htmlFor="docs-search" className="sr-only">Search documentation</label><input ref={input} id="docs-search" role="combobox" aria-autocomplete="list" aria-expanded={open} aria-activedescendant={results[selected] ? `search-option-${results[selected].slug || 'home'}` : undefined} placeholder="Search guides, settings, commands…" value={query} onChange={event => setQuery(event.target.value)} autoComplete="off" aria-controls="search-results" onKeyDown={event => {
      if (event.key === 'ArrowDown') { event.preventDefault(); moveSelection(1); }
      if (event.key === 'ArrowUp') { event.preventDefault(); moveSelection(-1); }
      if (event.key === 'Enter') { event.preventDefault(); dialog.current.querySelector(`[data-result="${selected}"]`)?.click(); }
    }} /><button className="icon-button" onClick={onClose} aria-label="Close search"><X size={18} /></button></div>
      <div className="search-meta" aria-live="polite">{query.trim() ? `${results.length} ${results.length === 1 ? 'guide' : 'guides'} found` : 'POPULAR GUIDES'}<span>Search stays in this browser</span></div>
      <div id="search-results" role="listbox" aria-label="Matching documentation guides" className="search-results">{results.length ? results.map((result, index) => <DocLink slug={result.slug} key={result.slug} id={`search-option-${result.slug || 'home'}`} role="option" tabIndex={-1} aria-selected={selected === index} className={`search-result ${selected === index ? 'selected' : ''}`} data-result={index} onMouseEnter={() => setSelected(index)}>
        <FileText size={19} /><span><small>{result.group}</small><strong>{result.title}</strong><span className="search-snippet">{result.snippet}</span></span><ArrowUpRight size={15} />
      </DocLink>) : <div className="empty-search"><CircleHelp size={28} /><h3>No guide matches “{query}”</h3><p>Try a shorter term such as “LAN”, “import”, “voice”, or an environment variable.</p></div>}</div>
      <div className="search-footer"><span><kbd>↑</kbd><kbd>↓</kbd> navigate <kbd>↵</kbd> open</span><span><kbd>Esc</kbd> close</span></div>
    </div>
  </dialog>;
}

function MobileMenu({ open, onClose, slug }) {
  const dialog = useRef(null);
  useEffect(() => { open ? dialog.current.showModal() : dialog.current.close(); }, [open]);
  return <dialog ref={dialog} className="mobile-menu-dialog" aria-label="Documentation navigation" onClose={onClose} onClick={event => { if (event.target === dialog.current) onClose(); }}><div className="mobile-menu-top"><span>Documentation</span><button className="icon-button" onClick={onClose} aria-label="Close navigation"><X size={20} /></button></div><Sidebar slug={slug} mobile /></dialog>;
}

const searchChoices = [
  { id: 'hybrid', label: 'A topic and a few words', name: 'Hybrid search', icon: Layers, example: 'retry strategy for uploads', text: 'Combine lexical matches and semantic similarity. Start here when you remember the subject and some of the language.', detail: 'Use the web interface, archive HTTP API, or search CLI. Reader v1 and MCP keep their own semantic and keyword modes.' },
  { id: 'exact', label: 'An exact phrase or error', name: 'Exact search', icon: Code2, example: 'ECONNREFUSED', text: 'Look for text that actually appears in an archived turn. Good for identifiers, error messages, and names.', detail: 'The interface calls this Exact; the API and CLI call the mode keyword. Turn off restrictive role, date, or model filters if a known phrase is missing.' },
  { id: 'semantic', label: 'The idea, not the words', name: 'Semantic search', icon: Sparkles, example: 'keeping long imports recoverable', text: 'Search by meaning with local embeddings. A result can be relevant even when it uses different words.', detail: 'Embeddings must be available for indexed content. Open the complete thread to verify the context; similarity is a retrieval signal, not a factual guarantee.' }
];

function SearchGuide({ compact = false }) {
  const [choice, setChoice] = useState('hybrid'), selected = searchChoices.find(item => item.id === choice), Icon = selected.icon;
  return <section className={`search-guide ${compact ? 'compact' : ''}`} aria-labelledby="search-guide-title"><div className="section-eyebrow"><SlidersHorizontal size={15} /> INTERACTIVE GUIDE</div><h2 id="search-guide-title">What do you remember?</h2><p className="muted">Choose a starting point for your next archive search.</p>
    <div className="choice-tabs" role="group" aria-label="What you remember">{searchChoices.map(item => <button key={item.id} aria-pressed={choice === item.id} className={choice === item.id ? 'selected' : ''} onClick={() => setChoice(item.id)}>{item.label}</button>)}</div>
    <div className="choice-result" aria-live="polite"><div className="choice-icon"><Icon size={25} /></div><div><span className="recommendation">TRY {selected.name.toUpperCase()}</span><h3>{selected.name}</h3><p>{selected.text}</p><div className="example-query"><Search size={15} /><code>{selected.example}</code><span>example query</span></div><p className="choice-detail">{selected.detail}</p><DocLink slug="search" className="text-link">Read the search guide <ArrowRight size={15} /></DocLink></div></div>
  </section>;
}

const walkthroughs = [
  ['quick-start', '01', 'Build your first archive', 'Install, import a small export, and open your first search result.', Download],
  ['local-models', '02', 'Run a model locally', 'Set up a runtime, discover models, and start a conversation.', Sparkles],
  ['speech', '03', 'Give a response a voice', 'Enable speech and choose local or remote text-to-speech.', AudioLines],
  ['network-access', '04', 'Use a headless server', 'Connect from a trusted LAN and configure the right permissions.', Network]
];

function Home() {
  const root = useContext(RootContext), [view, setView] = useState('reader');
  const screenshots = { reader: ['01-reader-dark.png', '02-reader-light.png'], search: ['06-search-light.png', '06-search-light.png'], speech: ['09-speech-dark.png', '10-speech-light.png'] };
  return <main id="main-content" className="home-main" tabIndex={-1}>
    <section className="hero"><div className="hero-copy"><span className="eyebrow"><span className="status-dot" /> THE THREADSHELF ENHANCED HANDBOOK</span><h1 tabIndex={-1}>Your conversations.<br /><span>Ready to rediscover.</span></h1><p className="hero-description">Turn scattered AI exports into a searchable, readable archive. Learn how to import, explore, continue, and listen — on your own server.</p><div className="hero-actions"><DocLink slug="quick-start" className="button primary">Start here <ArrowRight size={17} /></DocLink><DocLink slug="installation" className="button secondary"><Terminal size={16} /> Install ThreadShelf</DocLink></div><div className="hero-facts"><span><Database size={14} /> Local archive & search</span><span><Code2 size={14} /> Open source</span><span><Globe size={14} /> Optional remote providers</span></div></div>
      <div className="hero-orbit" aria-hidden="true"><div className="orbit-ring r1" /><div className="orbit-ring r2" /><div className="orbit-ring r3" /><div className="orbit-core"><img src={assetUrl(root, 'favicon.svg')} alt="" /></div><span className="orbit-node n1"><FileText size={21} /></span><span className="orbit-node n2"><Search size={21} /></span><span className="orbit-node n3"><AudioLines size={21} /></span><span className="orbit-node n4"><Code2 size={21} /></span></div>
    </section>
    <section className="product-preview" aria-label="ThreadShelf Enhanced interface"><div className="preview-toolbar"><span className="preview-label"><span className="status-dot" /> A LOOK INSIDE</span><div role="group" aria-label="Interface preview" className="preview-tabs">{['reader', 'search', 'speech'].map(id => <button key={id} className={view === id ? 'selected' : ''} aria-pressed={view === id} onClick={() => setView(id)}>{id[0].toUpperCase() + id.slice(1)}</button>)}</div></div><a className="theme-image dark-image" href={assetUrl(root, `media/${screenshots[view][0]}`)} target="_blank" rel="noopener noreferrer" aria-label="Open full-size application screenshot"><img src={assetUrl(root, `media/${screenshots[view][0]}`)} alt={`ThreadShelf Enhanced ${view} interface with synthetic demonstration content`} width="1600" height="1000" /></a><a className="theme-image light-image" href={assetUrl(root, `media/${screenshots[view][1]}`)} target="_blank" rel="noopener noreferrer" aria-label="Open full-size application screenshot"><img src={assetUrl(root, `media/${screenshots[view][1]}`)} alt={`ThreadShelf Enhanced ${view} interface with synthetic demonstration content`} width="1600" height="1000" /></a><div className="preview-caption"><span>Real application screenshots. Synthetic example conversations.</span><DocLink slug="reader">Explore the reader <ArrowUpRight size={14} /></DocLink></div></section>
    <section className="walkthrough-section"><div className="section-heading"><div><span className="section-eyebrow">FIND YOUR STARTING POINT</span><h2>A guide for what comes next.</h2></div><span className="section-count">{pages.length} practical guides</span></div><div className="walkthroughs">{walkthroughs.map(([slug, number, title, text, Icon]) => <DocLink slug={slug} key={slug} className="walkthrough"><span className="walkthrough-number">{number}</span><div className="walkthrough-copy"><Icon size={23} /><h3>{title}</h3><p>{text}</p></div><ArrowUpRight className="walkthrough-arrow" size={18} /></DocLink>)}</div></section>
    <SearchGuide />
    <section className="doc-directory"><div className="section-heading"><div><span className="section-eyebrow">THE COMPLETE HANDBOOK</span><h2>Follow the thread.</h2></div><BookOpen size={27} /></div><div className="directory-grid">{groups.slice(1).map(group => { const Icon = groupIcons[group.icon]; return <div key={group.title}><h3><Icon size={18} />{group.title}</h3>{group.pages.map(([slug, title]) => <DocLink slug={slug} key={slug}>{title}<ChevronRight size={14} /></DocLink>)}</div>; })}</div></section>
    <div className="home-note"><ShieldCheck size={23} /><div><h3>Know where your data goes.</h3><p>Archive storage and search run locally. Model downloads and optional external AI, speech, or image requests have their own network boundaries.</p><DocLink slug="privacy-security" className="text-link">Read the privacy guide <ArrowRight size={15} /></DocLink></div></div>
    <Footer />
  </main>;
}

function Toc({ headings, slug }) {
  const [active, setActive] = useState('');
  useEffect(() => {
    const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); }); }, { rootMargin: '-80px 0px -65% 0px' });
    headings.forEach(item => { const node = document.getElementById(item.id); if (node) observer.observe(node); });
    return () => observer.disconnect();
  }, [slug]);
  return <aside className="page-toc"><span className="toc-heading">ON THIS PAGE</span><nav aria-label="On this page">{headings.map(item => <a key={item.id} href={`#${item.id}`} className={`${active === item.id ? 'active' : ''} ${item.depth === 3 ? 'toc-nested' : ''}`}>{item.text}</a>)}</nav><div className="toc-help"><CircleHelp size={17} /><strong>Need a hand?</strong><DocLink slug="troubleshooting">Troubleshooting <ArrowUpRight size={13} /></DocLink><a href={`${REPOSITORY}/issues`} target="_blank" rel="noopener noreferrer">Report an issue <ArrowUpRight size={13} /></a></div></aside>;
}

function Footer() {
  return <footer className="site-footer"><span>ThreadShelf Enhanced <span className="footer-dot">·</span> Documentation</span><div><a href={REPOSITORY} target="_blank" rel="noopener noreferrer">Source <ArrowUpRight size={12} /></a><DocLink slug="contributing">MIT license</DocLink><DocLink slug="privacy-security">Privacy</DocLink></div></footer>;
}

function Article({ page }) {
  const root = useContext(RootContext);
  const rendered = useMemo(() => renderMarkdown(page.raw, root), [page.slug, page.raw, root]);
  const index = pages.indexOf(page), previous = pages[index - 1], next = pages[index + 1];
  return <div className="article-layout"><main id="main-content" className="article-main" tabIndex={-1}><div className="breadcrumb"><DocLink>Docs</DocLink><ChevronRight size={13} /><span>{page.group}</span></div><header className="article-header"><span className="section-eyebrow">{page.group.toUpperCase()}</span><h1 tabIndex={-1}>{page.title}</h1><p className="article-description">{page.description}</p><div className="article-meta"><BookOpen size={14} /><span>{page.minutes} min read</span><span>•</span><span>Public handbook</span><button className="print-button" onClick={() => window.print()}>Print guide <ExternalLink size={12} /></button></div></header>
      {page.slug === 'search' && <SearchGuide compact />}
      <div className="prose" dangerouslySetInnerHTML={{ __html: rendered.html }} />
      <div className="article-source-note"><Code2 size={17} /><p>Behavior is documented from the Enhanced source. For changes after this handbook was built, check the <a href={`${REPOSITORY}/blob/master/CHANGELOG.md`} target="_blank" rel="noopener noreferrer">project changelog</a>.</p></div>
      <nav className="page-pagination" aria-label="Next and previous guides">{previous ? <DocLink slug={previous.slug}><ArrowLeft size={18} /><span><small>Previous</small>{previous.title}</span></DocLink> : <span />}{next && <DocLink slug={next.slug} className="next"><span><small>Next</small>{next.title}</span><ArrowRight size={18} /></DocLink>}</nav><Footer />
    </main><Toc headings={rendered.headings} slug={page.slug} /></div>;
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) { try { await navigator.clipboard.writeText(value); return true; } catch {} }
  const previousFocus = document.activeElement;
  const element = document.createElement('textarea');
  try { element.value = value; element.style.cssText = 'position:fixed;opacity:0;pointer-events:none;'; document.body.appendChild(element); element.select(); return document.execCommand('copy'); }
  catch { return false; }
  finally { element.remove(); previousFocus?.focus?.({ preventScroll: true }); }
}

export function App({ initialSlug = '', root: initialRoot = './' }) {
  const [slug, setSlug] = useState(initialSlug), [root, setRoot] = useState(initialRoot), [searchOpen, setSearchOpen] = useState(false), [menuOpen, setMenuOpen] = useState(false), [progress, setProgress] = useState(0), [announcement, setAnnouncement] = useState('');
  const page = findPage(slug);
  useEffect(() => {
    const absoluteRoot = new URL(initialRoot, location.href).pathname; setRoot(absoluteRoot);
    const onPop = () => { const path = slugFromPath(location.pathname, absoluteRoot); setSlug(findPage(path).slug); requestAnimationFrame(() => location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView() : window.scrollTo(0, 0)); };
    const keys = event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setMenuOpen(false); setSearchOpen(value => !value); }
      if (event.key === '/' && !event.ctrlKey && !event.metaKey && !['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName) && !event.target.isContentEditable) { event.preventDefault(); setSearchOpen(true); }
    };
    const scroll = () => { const max = document.documentElement.scrollHeight - innerHeight; setProgress(max > 0 ? Math.min(100, scrollY / max * 100) : 0); };
    window.addEventListener('popstate', onPop); window.addEventListener('keydown', keys); window.addEventListener('scroll', scroll, { passive: true }); scroll();
    return () => { window.removeEventListener('popstate', onPop); window.removeEventListener('keydown', keys); window.removeEventListener('scroll', scroll); };
  }, []);
  useEffect(() => { document.title = `${page.slug ? `${page.title} · ` : ''}ThreadShelf Enhanced Documentation`; setAnnouncement(page.title); }, [slug]);
  const handleClick = async event => {
    const copy = event.target.closest?.('.copy-code');
    if (copy) { const code = copy.closest('.code-block').querySelector('code'); const ok = await copyText(code.textContent); copy.textContent = ok ? 'Copied!' : 'Copy failed'; setTimeout(() => { copy.textContent = 'Copy'; }, 1800); return; }
    const anchor = event.target.closest?.('a[data-doc]');
    if (!anchor || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); const target = anchor.dataset.doc; const hash = new URL(anchor.href).hash;
    if (location.pathname + location.hash !== pageUrl(root, target, hash)) history.pushState({}, '', pageUrl(root, target, hash));
    setSlug(target); setMenuOpen(false); setSearchOpen(false);
    requestAnimationFrame(() => { if (hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView(); else { window.scrollTo({ top: 0, behavior: 'instant' }); document.querySelector('main h1')?.focus({ preventScroll: true }); } });
  };
  return <RootContext.Provider value={root}><div onClick={handleClick}><a className="skip-link" href="#main-content">Skip to content</a><Header onSearch={() => { setMenuOpen(false); setSearchOpen(true); }} onMenu={() => setMenuOpen(true)} /><div className="reading-progress" aria-hidden="true" style={{ width: `${progress}%` }} /><aside className="desktop-sidebar"><Sidebar slug={slug} /></aside><div className={`content-shell ${slug ? 'is-article' : 'is-home'}`}>{slug ? <Article page={page} /> : <Home />}</div><SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} /><MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} slug={slug} /><div className="sr-only" aria-live="polite">{announcement}</div>{progress > 15 && <button className="back-to-top icon-button" onClick={() => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })} aria-label="Back to top"><ArrowUp size={18} /></button>}</div></RootContext.Provider>;
}
