// src/commands/pushNotebook.ts

import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

export async function pushNotebookCommand(context: vscode.ExtensionContext, fileUri: vscode.Uri) {
    if (!fileUri) {
        vscode.window.showErrorMessage("Could not identify the notebook file to push.");
        return;
    }

    const notebookPath = fileUri.fsPath;
    const notebookDir = path.dirname(notebookPath);
    const metadataPath = path.join(notebookDir, 'kernel-metadata.json');

    if (!fs.existsSync(metadataPath)) {
        vscode.window.showErrorMessage("Could not find 'kernel-metadata.json' in the same folder. Please pull or initialize the notebook first.");
        return;
    }

    // --- PRE-FLIGHT CHECK WORKFLOW ---

    // 1. Read current settings from metadata
    let metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

    // 2. GPU Configuration Quick Pick
    const gpuSelection = await vscode.window.showQuickPick(
        [
            { label: "On", description: "Enable GPU Acceleration", picked: metadata.enable_gpu === true },
            { label: "Off", description: "Disable GPU Acceleration", picked: metadata.enable_gpu === false }
        ],
        { title: "Step 1/3: GPU Configuration", placeHolder: "Select GPU status" }
    );
    if (!gpuSelection) {
        vscode.window.showInformationMessage("Push cancelled.");
        return; // User cancelled
    }
    metadata.enable_gpu = gpuSelection.label === "On";

    // 3. Internet Configuration Quick Pick
    const internetSelection = await vscode.window.showQuickPick(
        [
            { label: "On", description: "Enable Internet Access", picked: metadata.enable_internet === true },
            { label: "Off", description: "Disable Internet Access", picked: metadata.enable_internet === false }
        ],
        { title: "Step 2/3: Internet Access", placeHolder: "Select Internet status" }
    );
    if (!internetSelection) {
        vscode.window.showInformationMessage("Push cancelled.");
        return; // User cancelled
    }
    metadata.enable_internet = internetSelection.label === "On";

    // 4. Dataset Sources Input Box
    const datasetSources = await vscode.window.showInputBox({
        title: "Step 3/3: Dataset Sources",
        prompt: "Enter dataset sources, comma-separated (e.g., user/dataset-slug)",
        value: (metadata.dataset_sources || []).join(', ')
    });
    if (datasetSources === undefined) {
        vscode.window.showInformationMessage("Push cancelled.");
        return; // User cancelled
    }
    metadata.dataset_sources = datasetSources.split(',').map(s => s.trim()).filter(s => s);

    // --- END OF PRE-FLIGHT CHECK ---

    // Save the potentially modified settings back to the file
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    // Proceed with the push using a Progress Indicator for better UX
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Pushing "${path.basename(notebookPath)}" to Kaggle`,
        cancellable: false
    }, async (progress) => {
        progress.report({ increment: 20, message: "Preparing to push..." });
        await new Promise(resolve => setTimeout(resolve, 1000)); // UX delay

        const storagePath = context.globalStorageUri.fsPath;
        const coreCommand = `kaggle kernels push -p "${notebookDir}"`;
        let command: string;
        if (os.platform() === 'win32') {
            command = `set "KAGGLE_CONFIG_DIR=${storagePath}" && ${coreCommand}`;
        } else {
            command = `KAGGLE_CONFIG_DIR=${storagePath} ${coreCommand}`;
        }

        return new Promise<void>((resolve) => {
            progress.report({ increment: 50, message: "Uploading files..." });
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    vscode.window.showErrorMessage(`Failed to push notebook: ${stderr || error.message}`);
                } else {
                    vscode.window.showInformationMessage(`Successfully pushed notebook. It is now being processed by Kaggle.`);
                }
                progress.report({ increment: 100, message: "Done!" });
                resolve();
            });
        });
    });
}