export const REPOSITORY = 'https://github.com/Davoda1/ThreadShelf-Enhanced';
export const groups = [
  { title: 'Get started', icon: 'compass', pages: [
    ['', 'Introduction', 'A local home for your AI conversations.'],
    ['quick-start', 'Quick start', 'From a fresh installation to your first useful search.'],
    ['installation', 'Installation', 'Set up a project-local runtime on Linux or Windows.']
  ] },
  { title: 'Your archive', icon: 'archive', pages: [
    ['imports', 'Import conversations', 'Supported exports, media companions, and practical import rules.'],
    ['collections', 'Collections & insights', 'Organize your archive and understand what it contains.'],
    ['background-jobs', 'Import jobs', 'Follow progress, recover interrupted work, and manage resources.'],
    ['search', 'Search & discovery', 'Use exact, semantic, and hybrid retrieval with focused filters.'],
    ['reader', 'Read & export', 'Rich content, original data, images, and reusable exports.']
  ] },
  { title: 'AI, notes & speech', icon: 'sparkles', pages: [
    ['ai-chat', 'Chat with AI', 'Continue a thread, use archive tools, or start a private chat.'],
    ['local-models', 'Local models', 'Configure llama.cpp and Strata for local generation.'],
    ['remote-providers', 'Remote providers', 'Connect OpenRouter and OpenAI-compatible services.'],
    ['markdown-notes', 'Markdown notes', 'Connect live note folders with controlled read and write access.'],
    ['speech', 'Text-to-speech', 'Choose a voice, play responses, and manage saved audio.']
  ] },
  { title: 'Run your server', icon: 'server', pages: [
    ['configuration', 'Configuration', 'Environment variables, persistent settings, and data paths.'],
    ['network-access', 'Network & headless use', 'Configure trusted-LAN access and exact browser origins.'],
    ['backup-migration', 'Backups & migration', 'Move installations and preserve a recoverable archive.'],
    ['privacy-security', 'Privacy & security', 'Understand local storage, external requests, and access boundaries.'],
    ['troubleshooting', 'Troubleshooting', 'Diagnose installation, search, models, speech, and network issues.']
  ] },
  { title: 'Reference', icon: 'code', pages: [
    ['http-api', 'Archive HTTP API', 'Search, browse, and retrieve complete conversations.'],
    ['model-api', 'Local model API', 'Use the OpenAI and Anthropic-compatible inference routes.'],
    ['mcp', 'MCP integration', 'Give an MCP client access to archive and note tools.'],
    ['cli', 'Command-line tools', 'Parse, import, search, and inspect from a terminal.'],
    ['architecture', 'How it works', 'The archive, embeddings, publication pipeline, and provider layers.'],
    ['compatibility', 'Compatibility', 'Understand API, export, and desktop-client boundaries.'],
    ['glossary', 'Glossary', 'A shared vocabulary for collections, chunks, models, and tools.'],
    ['contributing', 'Contributing & license', 'Development, responsible issue reports, and attribution.']
  ] }
];
