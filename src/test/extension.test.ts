import { strict as assert } from "node:assert";
import * as vscode from "vscode";
import { buildMarkdown } from "../extension";

suite("Markdown output", () => {
  test("formats one file with the expected spacing and fences", async () => {
    const document = await vscode.workspace.openTextDocument({
      language: "typescript",
      content: 'console.log("Server starting...");\n',
    });

    const path = document.uri.toString(true);
    const actual = buildMarkdown([document]);

    const expected = [
      `### START FILE: ${path}`,
      "",
      "`````typescript",
      'console.log("Server starting...");',
      "`````",
      "",
      `### END FILE: ${path}`,
      "",
    ].join("\n");

    assert.equal(actual, expected);
  });

  test("preserves document order", async () => {
    const first = await vscode.workspace.openTextDocument({
      language: "typescript",
      content: "export const first = true;",
    });
    const second = await vscode.workspace.openTextDocument({
      language: "typescript",
      content: "export const second = true;",
    });

    const actual = buildMarkdown([first, second]);

    assert.ok(actual.indexOf(first.uri.toString(true)) < actual.indexOf(second.uri.toString(true)));
  });

  test("normalizes trailing file newlines", async () => {
    const withoutNewline = await vscode.workspace.openTextDocument({
      language: "typescript",
      content: "export const value = 1;",
    });
    const withNewline = await vscode.workspace.openTextDocument({
      language: "typescript",
      content: "export const value = 1;\n",
    });

    const firstOutput = buildMarkdown([withoutNewline]);
    const secondOutput = buildMarkdown([withNewline]);

    const normalizePath = (text: string) =>
      text
        .replaceAll(withoutNewline.uri.toString(true), "<path>")
        .replaceAll(withNewline.uri.toString(true), "<path>");

    assert.equal(normalizePath(firstOutput), normalizePath(secondOutput));
  });
});
