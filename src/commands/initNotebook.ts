// src/commands/initNotebook.ts

import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

// A simple boilerplate for a new Jupyter Notebook
const boilerplateIpynb = `{
 "cells": [
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "# This is a boilerplate notebook.\\n",
    "# Your code here!"
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "Python 3",
   "language": "python",
   "name": "python3"
  },
  "language_info": {
   "name": "python"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 4
}`;

export async function initNotebookCommand(context: vscode.ExtensionContext) {
    // 1. Ask user for a root folder
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage("Please open a workspace folder to create the notebook in.");
        return;
    }
    const rootPath = workspaceFolders[0].uri.fsPath;

    // 2. Ask user for a notebook name (slug)
    const notebookSlug = await vscode.window.showInputBox({
        prompt: "Enter a URL-friendly name for your new notebook (e.g., 'my-first-analysis')",
        validateInput: text => {
            return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(text) ? null : "Must be lowercase alphanumeric with dashes.";
        }
    });

    if (!notebookSlug) { return; }

    const notebookDir = path.join(rootPath, notebookSlug);
    const notebookFilePath = path.join(notebookDir, `${notebookSlug}.ipynb`);

    // 3. Use the Progress API for better UX
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Initializing Kaggle notebook: ${notebookSlug}`,
        cancellable: false
    }, async (progress) => {
        progress.report({ increment: 10, message: "Creating directory..." });
        if (fs.existsSync(notebookDir)) {
            vscode.window.showErrorMessage(`A directory named '${notebookSlug}' already exists.`);
            return;
        }
        fs.mkdirSync(notebookDir);
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX

        progress.report({ increment: 30, message: "Creating boilerplate .ipynb file..." });
        fs.writeFileSync(notebookFilePath, boilerplateIpynb);
        await new Promise(resolve => setTimeout(resolve, 500));

        progress.report({ increment: 50, message: "Running 'kaggle kernels init'..." });
        const storagePath = context.globalStorageUri.fsPath;
        const coreCommand = `kaggle kernels init -p "${notebookDir}"`;
        let command: string;
        if (os.platform() === 'win32') {
            command = `set "KAGGLE_CONFIG_DIR=${storagePath}" && ${coreCommand}`;
        } else {
            command = `KAGGLE_CONFIG_DIR=${storagePath} ${coreCommand}`;
        }

        return new Promise<void>((resolve) => {
            exec(command, async (error, stdout, stderr) => {
                if (error) {
                    vscode.window.showErrorMessage(`Failed to initialize metadata: ${stderr || error.message}`);
                    resolve();
                    return;
                }
                progress.report({ increment: 100, message: "Done!" });
                vscode.window.showInformationMessage(`Successfully initialized notebook '${notebookSlug}'.`);
                
                // Open the new files for the user
                const doc = await vscode.workspace.openTextDocument(notebookFilePath);
                await vscode.window.showTextDocument(doc);
                
                const metadataDoc = await vscode.workspace.openTextDocument(path.join(notebookDir, 'kernel-metadata.json'));
                await vscode.window.showTextDocument(metadataDoc, { viewColumn: vscode.ViewColumn.Beside });
                resolve();
            });
        });
    });
}