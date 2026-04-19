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

### Quiz workflow

```
1. list_contents <courseId>              → find the quiz contentId
2. get_quiz_questions <url|ids>          → load questions + options + attempt policy
3. save_quiz_answer (per question)       → save each answer individually
4. submit_quiz (confirm first!)          → finalize and submit the attempt
```

Supported question types in `save_quiz_answer`:

| `question.type`   | `answer` format                                                                |
|-------------------|--------------------------------------------------------------------------------|
| `eitherOr`        | boolean (`true` = Verdadero, `false` = Falso)                                  |
| `multipleanswer`  | number — 0-based index of the chosen option                                    |
| `fimb`            | JSON string `'{"BLANK-1":"value1","BLANK-2":"value2"}'` — read names from `question.blanks` |

### Feedback workflow

```
1. get_assignment_feedback <courseId>    → scores + instructor comments + feedback files for all assignments
2. download_feedback_file <ids>          → download an annotated file the professor attached to the grade
```

## Agent behavior rules

- **Always confirm before submitting** (`submit_attempt`, `submit_quiz`). Show the user what will be submitted and ask for confirmation. Never submit silently.
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
| `download_attachment` | Download file to disk |
| `download_file_url` | Download a bbcswebdav URL directly |
| `submit_attempt` | Submit assignment (confirm first!) |
| `get_assignment_feedback` | Scores + instructor comments + feedback files for all assignments in a course |
| `download_feedback_file` | **[EXPERIMENTAL]** Download a file the professor attached to a graded attempt |
| `get_quiz_questions` | Load quiz questions + options from an attempt (URL or IDs) |
| `save_quiz_answer` | Save one answer without submitting |
| `submit_quiz` | Finalize and submit a quiz attempt (confirm first!) |
| `raw_api` | Any other Blackboard endpoint |
