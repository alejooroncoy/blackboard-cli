# blackboard-cli — Agent Guide

This CLI gives Claude direct access to UPC Aula Virtual (Blackboard Learn). Use it to help students check their courses, assignments, grades, and download materials — all without opening a browser.

## Setup

Before using any tool, the user must be authenticated:

```bash
blackboard login        # opens browser for Microsoft SSO
blackboard whoami       # verify session is active
```

If you get `Not authenticated`, ask the user to run `blackboard login`.

## Primary workflow

```
1. list_courses                           → find the relevant courseId
2. list_assignments <courseId>            → see pending tasks + due dates
3. get_grades <courseId>                  → check current grades
4. list_contents <courseId>               → browse course materials
5. list_contents <courseId> <parentId>    → navigate into a subfolder
6. list_attachments <courseId> <contentId>→ find downloadable files
```

## Agent behavior rules

- **Always confirm before submitting** (`submit_attempt`). Show the user what will be submitted and ask for confirmation. Never submit silently.
- **Show grades in context** — when showing grades, also show the assignment name, max score, and due date if available.
- **Navigate content recursively** — if the user asks for materials, explore subfolders using `list_contents` with `parentId`.
- **Use `raw_api` for anything not covered** — the Blackboard REST API is extensive. If there's no specific tool, use `raw_api` with the correct endpoint.
- **Session errors are recoverable** — if you get a session error, tell the user to run `blackboard login` (not a fatal error).
- **Respect rate limits** — don't fan out more than 5 parallel API calls.

## Key IDs

Course IDs look like `_529580_1`. Content and column IDs follow the same pattern.

## Useful endpoints (via raw_api)

```
GET /learn/api/public/v1/users/me
GET /learn/api/public/v1/users/{userId}/courses
GET /learn/api/public/v1/courses/{courseId}/contents
GET /learn/api/public/v1/courses/{courseId}/contents/{id}/children
GET /learn/api/public/v1/courses/{courseId}/announcements
GET /learn/api/public/v2/courses/{courseId}/gradebook/columns
GET /learn/api/public/v2/courses/{courseId}/gradebook/columns/{id}/attempts
GET /learn/api/public/v1/courses/{courseId}/contents/{id}/attachments
GET /learn/api/public/v1/courses/{courseId}/contents/{id}/attachments/{id}/download
```

## MCP tools available

| Tool | What it does |
|------|-------------|
| `whoami` | Current student info |
| `system_version` | Server version |
| `list_courses` | All enrolled courses |
| `get_course` | Single course details |
| `list_contents` | Course materials tree |
| `list_announcements` | Course announcements |
| `list_assignments` | Tasks with due dates + grades |
| `list_attempts` | Submission history |
| `get_grades` | Full grade report for a course |
| `list_attachments` | Files in a content item |
| `download_attachment` | Download file (base64) |
| `submit_attempt` | Submit assignment (confirm first!) |
| `raw_api` | Any other Blackboard endpoint |
