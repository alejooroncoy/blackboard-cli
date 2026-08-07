# Installing Campus for an AI agent

This file is for AI agents (Cline, Cursor, Claude Code and similar) that install
MCP servers on the user's behalf. Humans should read `README.md` instead — it is
in Spanish and covers everything, not just the MCP part.

Campus connects a student's university systems to their AI assistant. Today it
implements Blackboard Learn (UPC Aula Virtual); Canvas and Moodle are planned.

## What you need to know before installing

**No API key, no environment variables.** Campus does not use an institutional
Blackboard developer key. It authenticates with the student's own SSO session,
opened in a real browser on their machine. There is nothing for you to configure
and no secret for you to ask for.

**The login step is human-only.** It opens Chromium against the university's
Microsoft SSO, which requires the student's password and usually MFA. You cannot
complete it for them. Install the server, then tell them to run the login command
themselves.

**Everything stays local.** The session is stored on the user's machine; no
credentials pass through any server of ours.

## Install

Add this to the MCP configuration file of the client you are setting up:

```json
{
  "mcpServers": {
    "campus": {
      "command": "npx",
      "args": ["campus-cli", "mcp"]
    }
  }
}
```

`npx` downloads the package on first run, so a separate install step is optional.
If you prefer it resident:

```bash
npm install -g campus-cli
```

and then use `"command": "campus", "args": ["mcp"]`.

Node.js 18 or newer is required.

## After installing

Tell the user to run this in their own terminal:

```bash
campus account login    # or: npx campus-cli account login
```

A browser window opens. They sign in with their Campus account and then with
their university account. During the Microsoft step, they should tick
**"Don't show this again"** and click **Yes** on the "Stay signed in?" prompt —
otherwise the session will not persist.

## Verify

Once they report being logged in, call the `blackboard_whoami` tool. If it
returns the student's name, the installation works. If it fails with a session
error, that is recoverable: ask them to run `campus login` again.

Never treat a session error as a broken install.

## What the server exposes

Nineteen tools under the `blackboard_` prefix: courses, contents and
attachments, announcements, assignments with due dates, grades, instructor
feedback, submission history, file downloads and uploads, draft saving, final
submission, and a raw API escape hatch.

One behavioural rule matters: `blackboard_submit_attempt` sends an assignment to
the professor and cannot be undone. Always show the user what will be submitted
and get their confirmation first. Saving a draft
(`blackboard_save_attempt_draft`) is safe and needs no confirmation.

## Links

- Repository — https://github.com/alejooroncoy/campus-cli
- npm — https://www.npmjs.com/package/campus-cli
- Docs — https://campuscli.com/blackboard-mcp/
- Hosted MCP endpoint — https://mcp.campuscli.com/mcp (free during beta)
