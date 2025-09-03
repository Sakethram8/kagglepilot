// src/commands/pullNotebook.ts

import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { KaggleNotebook } from '../kaggleNotebookProvider';

export async function pullNotebookCommand(context: vscode.ExtensionContext, notebook: KaggleNotebook) {
    if (!notebook) {
        vscode.window.showErrorMessage('Please select a notebook from the sidebar.');
        return;
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage("Please open a folder or workspace to organize your notebooks in.");
        return;
    }
    const rootPath = workspaceFolders[0].uri.fsPath;

    // --- NEW LOGIC: Create a dedicated folder for the notebook ---
    // Extract the notebook's slug (e.g., 'my-cool-notebook' from 'username/my-cool-notebook')
    const notebookSlug = notebook.ref.split('/')[1];
    const downloadPath = path.join(rootPath, notebookSlug);

    // Create the directory if it doesn't exist
    if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath, { recursive: true });
    }
    // -----------------------------------------------------------

    vscode.window.showInformationMessage(`Pulling "${notebook.label}" into folder: ${notebookSlug}`);

    const storagePath = context.globalStorageUri.fsPath;
    // The -m flag downloads the notebook's metadata as well
    const coreCommand = `kaggle kernels pull "${notebook.ref}" -p "${downloadPath}" -m`;
    let command: string;

    if (os.platform() === 'win32') {
        command = `set "KAGGLE_CONFIG_DIR=${storagePath}" && ${coreCommand}`;
    } else {
        command = `KAGGLE_CONFIG_DIR=${storagePath} ${coreCommand}`;
    }

    exec(command, async (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage(`Failed to pull notebook: ${stderr || error.message}`);
            return;
        }

        vscode.window.showInformationMessage(`Successfully pulled "${notebook.label}".`);

        const notebookFileName = stdout.trim().split(' ').pop();
        if (notebookFileName && notebookFileName.endsWith('.ipynb')) {
            const notebookPath = path.join(downloadPath, notebookFileName);
            try {
                const doc = await vscode.workspace.openTextDocument(notebookPath);
                await vscode.window.showTextDocument(doc);
            } catch (e: any) {
                vscode.window.showErrorMessage(`Failed to open notebook file: ${e.message}`);
            }
        }
    });
}