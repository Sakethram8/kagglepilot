// src/commands/watchNotebook.ts

import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as os from 'os';
import { KaggleNotebook } from '../kaggleNotebookProvider';

export function watchNotebookCommand(
    context: vscode.ExtensionContext,
    notebook: KaggleNotebook,
    watchOutputChannel: vscode.OutputChannel,
    activeWatcher: NodeJS.Timeout | null,
    onWatcherChange: (watcher: NodeJS.Timeout | null) => void
) {
    if (!notebook) {
        return;
    }

    if (activeWatcher) {
        clearInterval(activeWatcher);
    }

    watchOutputChannel.clear();
    watchOutputChannel.show(true);
    watchOutputChannel.appendLine(`[INFO] Starting to watch notebook: "${notebook.label}" (${notebook.ref})`);

    const storagePath = context.globalStorageUri.fsPath;

    const checkStatus = () => {
        const coreCommand = `kaggle kernels status "${notebook.ref}"`;
        let command: string;

        if (os.platform() === 'win32') {
            command = `set "KAGGLE_CONFIG_DIR=${storagePath}" && ${coreCommand}`;
        } else {
            command = `KAGGLE_CONFIG_DIR=${storagePath} ${coreCommand}`;
        }

        exec(command, (error, stdout, stderr) => {
            const timestamp = new Date().toLocaleTimeString();
            const currentWatcher = activeWatcher; // Capture current watcher state

            if (error) {
                watchOutputChannel.appendLine(`[${timestamp}] [ERROR] Failed to get status: ${stderr}`);
                if (currentWatcher) {clearInterval(currentWatcher);}
                onWatcherChange(null);
                return;
            }

            const status = stdout.trim();
            watchOutputChannel.appendLine(`[${timestamp}] [STATUS] ${status}`);

            if (status === 'complete' || status === 'error' || status === 'cancelled') {
                if (currentWatcher) {clearInterval(currentWatcher);}
                onWatcherChange(null);
                watchOutputChannel.appendLine(`[INFO] Watcher stopped. Final status: ${status}`);
                vscode.window.showInformationMessage(`Notebook "${notebook.label}" has finished with status: ${status}`);
            }
        });
    };

    checkStatus();
    const newWatcher = setInterval(checkStatus, 30000);
    onWatcherChange(newWatcher);
}