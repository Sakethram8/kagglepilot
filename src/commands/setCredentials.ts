// src/commands/setCredentials.ts

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function setCredentialsCommand(context: vscode.ExtensionContext) {
    const storagePath = context.globalStorageUri.fsPath;
    if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true });
    }

    const options: vscode.OpenDialogOptions = {
        canSelectMany: false,
        openLabel: 'Select kaggle.json',
        filters: { 'JSON files': ['json'] }
    };

    const fileUri = await vscode.window.showOpenDialog(options);

    if (fileUri && fileUri[0]) {
        const sourcePath = fileUri[0].fsPath;
        const destinationPath = path.join(storagePath, 'kaggle.json');
        try {
            fs.copyFileSync(sourcePath, destinationPath);
            fs.chmodSync(destinationPath, 0o600);
            vscode.window.showInformationMessage('Kaggle API credentials set successfully!');
        } catch (err: any) {
            vscode.window.showErrorMessage('Failed to set Kaggle credentials: ' + err.message);
        }
    }
}