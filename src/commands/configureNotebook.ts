// src/commands/configureNotebook.ts

import * as vscode from 'vscode';
import * as fs from 'fs';

export function configureNotebookCommand(context: vscode.ExtensionContext, fileUri: vscode.Uri) {
    const metadataPath = fileUri.fsPath;

    const panel = vscode.window.createWebviewPanel(
        'notebookConfig',
        'Configure Notebook',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    panel.webview.html = getWebviewContent(metadata);

    panel.webview.onDidReceiveMessage(
        (updatedMetadata) => {
            fs.writeFileSync(metadataPath, JSON.stringify(updatedMetadata, null, 2));
            panel.dispose();
            vscode.window.showInformationMessage('Notebook configuration saved!');
        },
        undefined,
        context.subscriptions
    );
}

function getWebviewContent(metadata: any): string {
    const isChecked = (value: boolean) => value ? 'checked' : '';
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notebook Configuration</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 0 20px; }
            .setting { margin: 15px 0; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input[type="text"] { width: 100%; padding: 8px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; }
            button { background-color: #007acc; color: white; border: none; padding: 10px 15px; cursor: pointer; border-radius: 4px; }
            .checkbox-group { display: flex; align-items: center; }
            .checkbox-group input { margin-right: 10px; }
        </style>
    </head>
    <body>
        <h2>Notebook Settings</h2>
        <div class="setting checkbox-group">
            <input type="checkbox" id="enable_gpu" ${isChecked(metadata.enable_gpu)}>
            <label for="enable_gpu">Enable GPU</label>
        </div>
        <div class="setting checkbox-group">
            <input type="checkbox" id="enable_internet" ${isChecked(metadata.enable_internet)}>
            <label for="enable_internet">Enable Internet</label>
        </div>
        <div class="setting">
            <label for="dataset_sources">Dataset Sources (comma-separated, e.g., user/dataset-slug)</label>
            <input type="text" id="dataset_sources" value="${(metadata.dataset_sources || []).join(', ')}">
        </div>
        <button id="save-btn">Save Configuration</button>
        <script>
            const vscode = acquireVsCodeApi();
            document.getElementById('save-btn').addEventListener('click', () => {
                const updatedMetadata = {
                    ...${JSON.stringify(metadata)},
                    enable_gpu: document.getElementById('enable_gpu').checked,
                    enable_internet: document.getElementById('enable_internet').checked,
                    dataset_sources: document.getElementById('dataset_sources').value.split(',').map(s => s.trim()).filter(s => s)
                };
                vscode.postMessage(updatedMetadata);
            });
        </script>
    </body>
    </html>`;
}