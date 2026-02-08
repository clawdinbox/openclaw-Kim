# Content Pipeline API

Automates the flow from drafted content to scheduled posts on various platforms.

## Features

1.  **Content Reading:** Reads content from `documents/linkedin-drafts/` and `documents/x-drafts/`.
2.  **Post Formatting:** Formats content for the Postiz API using a JSON structure.
3.  **Queue System:** Manages scheduled posts via a simple JSON queue file.
4.  **Basic CLI:** A command-line interface tool for queuing posts.

## Requirements

-   Node.js (v18 or later recommended)

## Installation

1.  Clone this repository.
2.  Navigate to the `infrastructure/content-pipeline-api` directory.
3.  Run:
    ```bash
    npm install uuid
    ```
    *(Note: `uuid` is used for generating unique post IDs.)*

## Postiz API JSON Structure

The API expects content in the following JSON format:

```json
{
  "platform": "linkedin" | "x",
  "content": "Your post content here.",
  "schedule_time": "YYYY-MM-DDTHH:MM:SSZ"
}
```

## Queue File Structure (`queue.json`)

The queue is managed in a JSON file, typically located at `queue.json`. It stores an array of post objects:

```json
[
  {
    "id": "unique-post-id-generated-by-uuid",
    "platform": "linkedin" | "x",
    "content": "Your post content here.",
    "status": "queued" | "processing" | "sent" | "failed",
    "scheduled_at": "YYYY-MM-DDTHH:MM:SSZ",
    "created_at": "YYYY-MM-DDTHH:MM:SSZ"
  }
]
```

## CLI Usage

The command-line interface allows you to queue posts directly.

```bash
npm run queue-post --platform=<x|linkedin> --file=<path/to/your/draft.txt> --time=<YYYY-MM-DDTHH:MM:SSZ>
```

**Example:**
```bash
npm run queue-post --platform=x --file=documents/x-drafts/my-first-post.txt --time=2026-02-09T09:00:00Z
```
*(Note: The `npm run` command assumes `package.json` is configured with appropriate scripts.)*

---
*This project is built using Node.js and relies on JSON files for persistence.*