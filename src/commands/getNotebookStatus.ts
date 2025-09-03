// src/commands/getNotebookStatus.ts

import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as os from 'os';
import { KaggleNotebook } from '../kaggleNotebookProvider';

export function getNotebookStatusCommand(context: vscode.ExtensionContext, notebook: KaggleNotebook) {
    if (!notebook) {
        vscode.window.showErrorMessage('Please select a notebook from the sidebar.');
        return;
    }

    vscode.window.showInformationMessage(`Fetching status for "${notebook.label}"...`);

    const storagePath = context.globalStorageUri.fsPath;
    const coreCommand = `kaggle kernels status "${notebook.ref}"`;
    let command: string;

    if (os.platform() === 'win32') {
        command = `set "KAGGLE_CONFIG_DIR=${storagePath}" && ${coreCommand}`;
    } else {
        command = `KAGGLE_CONFIG_DIR=${storagePath} ${coreCommand}`;
    }

    exec(command, (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage(`Failed to get status: ${stderr || error.message}`);
            return;
        }
        const status = stdout.trim();
        vscode.window.showInformationMessage(`Status for "${notebook.label}": ${status}`);
    });
}