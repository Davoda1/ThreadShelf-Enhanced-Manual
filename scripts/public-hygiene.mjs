// These checks catch common accidental disclosures. Editorial review is still required.
const rules = [
  ['GitHub access token', /\b(?:github_pat_[A-Za-z0-9_]{40,}|gh[pousr]_[A-Za-z0-9]{30,})\b/],
  ['API secret', /\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{32,}\b/],
  ['AWS access key', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ['Private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['Private workspace path', /\/(?:workspace\/scratch|root\/\.codex)\//],
  ['Internal message metadata', /(?:^|\n)\s*(?:Message Type:\s*(?:MESSAGE|FINAL_ANSWER)|Task name:\s*\/root|assistant to=)/],
  ['Conversation-specific authoring text', /\b(?:as an AI (?:assistant|language model)|(?:generated|written) by (?:ChatGPT|Codex)|our (?:previous )?(?:chat|conversation) (?:about|history)|from\s+our\s+previous\s+discussion)\b/i]
];

export function inspectPublicText(text) {
  return rules.flatMap(([rule, expression]) => {
    const match = expression.exec(text);
    return match ? [{ rule, line: text.slice(0, match.index).split('\n').length }] : [];
  });
}

export function forbiddenPublicPath(path) {
  const name = path.replaceAll('\\', '/');
  return /(?:^|\/)(?:\.env(?:\..*)?|id_(?:rsa|ed25519)|credentials\.json|\.codex|\.openai)(?:\/|$)/i.test(name)
    || /\.(?:pem|key|p12|pfx|sqlite3?|db|log|zip)$/i.test(name);
}
