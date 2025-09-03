// src/commands/downloadDataset.ts

import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as os from 'os';
import { KaggleDataset } from '../kaggleDatasetProvider';

export async function downloadDatasetCommand(context: vscode.ExtensionContext, dataset: KaggleDataset) {
    if (!dataset) { return; }

    const options: vscode.OpenDialogOptions = {
        canSelectMany: false,
        openLabel: 'Select Folder to Download Dataset',
        canSelectFiles: false,
        canSelectFolders: true,
    };
    const folderUri = await vscode.window.showOpenDialog(options);
    if (!folderUri || !folderUri[0]) { return; }

    const downloadPath = folderUri[0].fsPath;
    vscode.window.showInformationMessage(`Downloading dataset "${dataset.label}" to ${downloadPath}...`);

    const storagePath = context.globalStorageUri.fsPath;
    const coreCommand = `kaggle datasets download -d "${dataset.ref}" -p "${downloadPath}" --unzip`;
    let command: string;

    if (os.platform() === 'win32') {
        command = `set "KAGGLE_CONFIG_DIR=${storagePath}" && ${coreCommand}`;
    } else {
        command = `KAGGLE_CONFIG_DIR=${storagePath} ${coreCommand}`;
    }

    exec(command, (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage(`Failed to download dataset: ${stderr || error.message}`);
            return;
        }
        vscode.window.showInformationMessage(`Successfully downloaded and unzipped dataset "${dataset.label}".`);
    });
}