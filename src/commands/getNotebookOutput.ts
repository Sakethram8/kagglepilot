// src/commands/getNotebookOutput.ts

import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as os from 'os';
import { KaggleNotebook } from '../kaggleNotebookProvider';

export async function getNotebookOutputCommand(context: vscode.ExtensionContext, notebook: KaggleNotebook) {
    if (!notebook) {
        vscode.window.showErrorMessage('Please select a notebook from the sidebar.');
        return;
    }

    const options: vscode.OpenDialogOptions = {
        canSelectMany: false,
        openLabel: 'Select Folder for Output',
        canSelectFiles: false,
        canSelectFolders: true,
    };
    const folderUri = await vscode.window.showOpenDialog(options);
    if (!folderUri || !folderUri[0]) {
        return;
    }

    const downloadPath = folderUri[0].fsPath;
    vscode.window.showInformationMessage(`Downloading output for "${notebook.label}" to ${downloadPath}...`);

    const storagePath = context.globalStorageUri.fsPath;
    const coreCommand = `kaggle kernels output "${notebook.ref}" -p "${downloadPath}"`;
    let command: string;

    if (os.platform() === 'win32') {
        command = `set "KAGGLE_CONFIG_DIR=${storagePath}" && ${coreCommand}`;
    } else {
        command = `KAGGLE_CONFIG_DIR=${storagePath} ${coreCommand}`;
    }

    exec(command, (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage(`Failed to get output: ${stderr || error.message}`);
            return;
        }
        vscode.window.showInformationMessage(`Successfully downloaded output for "${notebook.label}".`);
    });
}