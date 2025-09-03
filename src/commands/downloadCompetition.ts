// src/commands/downloadCompetition.ts

import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as os from 'os';
import { Competition } from '../kaggleCompetitionProvider';

export async function downloadCompetitionCommand(context: vscode.ExtensionContext, competition: Competition) {
    if (!competition) {
        vscode.window.showErrorMessage("Please select a competition from the sidebar.");
        return;
    }

    // 1. Prompt user for a download location
    const options: vscode.OpenDialogOptions = {
        canSelectMany: false,
        openLabel: 'Select Download Folder',
        canSelectFiles: false,
        canSelectFolders: true,
    };

    const folderUri = await vscode.window.showOpenDialog(options);
    if (folderUri && folderUri[0]) {
        const downloadPath = folderUri[0].fsPath;
        vscode.window.showInformationMessage(`Downloading data for "${competition.label}" to ${downloadPath}...`);

        // 2. Build the cross-platform CLI command
        const storagePath = context.globalStorageUri.fsPath;
        const coreCommand = `kaggle competitions download -c "${competition.ref}" -p "${downloadPath}" --force`;
        let command: string;

        if (os.platform() === 'win32') {
            command = `set "KAGGLE_CONFIG_DIR=${storagePath}" && ${coreCommand}`;
        } else {
            command = `KAGGLE_CONFIG_DIR=${storagePath} ${coreCommand}`;
        }

        // 3. Execute the command
        exec(command, (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Download failed: ${stderr || error.message}`);
                return;
            }
            vscode.window.showInformationMessage(`Successfully downloaded data for "${competition.label}".`);
        });
    }
}