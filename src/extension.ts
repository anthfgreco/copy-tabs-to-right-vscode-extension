import * as vscode from "vscode";

/** Activate extension: registers the copy command. */
export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "copyTabsToRight.copyToClipboard",
    async () => {
      const tabs = getActiveAndRightTabs();
      if (tabs.length === 0) {
        void vscode.window.showInformationMessage("No tabs to copy.");
        return;
      }

      // Gather URIs from the tabs we care about (text + diff: modified side).
      const uris = dedupeUris(
        tabs.map(getPrimaryUriFromTab).filter((uri): uri is vscode.Uri => Boolean(uri)),
      );

      if (uris.length === 0) {
        void vscode.window.showInformationMessage("No text documents to copy.");
        return;
      }

      const documents = await loadTextDocuments(uris);
      const markdown = buildMarkdown(documents);
      await vscode.env.clipboard.writeText(markdown);

      void vscode.window.showInformationMessage(
        `Copied ${documents.length} file(s) to clipboard as Markdown.`,
      );
    },
  );

  context.subscriptions.push(disposable);
}

/** Returns the active tab and all tabs to its right within the active group. */
function getActiveAndRightTabs(): vscode.Tab[] {
  const activeGroup = vscode.window.tabGroups.activeTabGroup;
  if (!activeGroup || !activeGroup.activeTab) return [];

  const activeIndex = activeGroup.tabs.findIndex((tab) => tab === activeGroup.activeTab);
  const isActiveIndexValid = activeIndex >= 0;
  if (!isActiveIndexValid) return [];

  // Include the active tab itself, then everything to the right.
  return activeGroup.tabs.slice(activeIndex);
}

/** Extract a primary URI from a tab if it’s text-based; otherwise undefined. */
function getPrimaryUriFromTab(tab: vscode.Tab): vscode.Uri | undefined {
  const input = tab.input;

  if (input instanceof vscode.TabInputText) {
    return input.uri;
  }

  if (input instanceof vscode.TabInputTextDiff) {
    // Prefer the modified side for diffs.
    return input.modified;
  }

  // Notebooks, webviews, etc. are out-of-scope.
  return undefined;
}

/** Deduplicate resource URIs by their string form. */
function dedupeUris(uris: vscode.Uri[]): vscode.Uri[] {
  const seen = new Set<string>();
  const result: vscode.Uri[] = [];
  for (const uri of uris) {
    const key = uri.toString();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(uri);
  }
  return result;
}

/** Get currently open TextDocument for a URI, else open it from disk. */
async function getTextDocumentForUri(uri: vscode.Uri): Promise<vscode.TextDocument | undefined> {
  const openDoc = vscode.workspace.textDocuments.find((d) => d.uri.toString() === uri.toString());
  if (openDoc) return openDoc;

  try {
    const doc = await vscode.workspace.openTextDocument(uri);
    return doc;
  } catch {
    // Non-text or unreadable resource.
    return undefined;
  }
}

/** Load documents for URIs, filtering to text documents only. */
async function loadTextDocuments(uris: vscode.Uri[]): Promise<vscode.TextDocument[]> {
  const docs: vscode.TextDocument[] = [];
  for (const uri of uris) {
    const doc = await getTextDocumentForUri(uri);
    if (!doc) continue;
    // Filter out obviously non-text schemes if desired.
    docs.push(doc);
  }
  return docs;
}

/** Build Markdown with path markers and fenced code blocks for each document. */
export function buildMarkdown(documents: vscode.TextDocument[]): string {
  const parts: string[] = [];
  const codeFence = "`````";

  for (const doc of documents) {
    const uri = doc.uri;
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);

    const pathForHeading = workspaceFolder
      ? vscode.workspace.asRelativePath(uri, false)
      : uri.scheme === "file"
        ? uri.fsPath
        : uri.toString(true);

    parts.push(
      `### START FILE: ${pathForHeading}`,
      "",
      `${codeFence}${doc.languageId}`,
      doc.getText().trimEnd(),
      codeFence,
      "",
      `### END FILE: ${pathForHeading}`,
      "",
    );
  }

  return parts.join("\n");
}

// VS Code calls this on extension unload (not used here).
export function deactivate() {
  /* no-op */
}
