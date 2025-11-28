# Copy Tabs to Right

Copy the current tab and all tabs to its right into your clipboard as a single Markdown snippet, ideal for pasting into an LLM prompt.

## How to use

1. Arrange your tabs as you like.
2. Open the Command Palette (Ctrl+Shift+P or Cmd+Shift+P).
3. Run: **"Copy Opened Files to Clipboard (To the Right)"**.
4. Paste the result into your LLM/chat for context.

## Example output

`src/server.ts` and `src/routes/user.ts` are opened tabs:

````md
### BEGIN FILE: src/server.ts

```ts
import { getUsers } from "./routes/user";
console.log("Server starting...");
```

### END FILE: src/server.ts

### BEGIN FILE: src/routes/user.ts

```ts
export function getUsers() {
  return [];
}
```

### END FILE: src/routes/user.ts
````
