

import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as os from 'os';

/**
 * Represents a single Kaggle Notebook in our sidebar view.
 */
export class KaggleNotebook extends vscode.TreeItem {
    constructor(
        public readonly label: string, // The notebook's title
        public readonly ref: string    // The reference ID (e.g., "username/notebook-slug")
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.tooltip = `Ref: ${this.ref}`;
        this.description = `Last run: N/A`;
        this.contextValue = 'notebook'; // Connects this item to our pull command
    }
    // Use a built-in icon for notebooks
    iconPath = new vscode.ThemeIcon('notebook');
}

/**
 * This class provides the data for the "My Notebooks" sidebar view.
 */
export class KaggleNotebookProvider implements vscode.TreeDataProvider<KaggleNotebook> {

    constructor(private configPath: string) { }

    getTreeItem(element: KaggleNotebook): vscode.TreeItem {
        return element;
    }

    getChildren(element?: KaggleNotebook): Thenable<KaggleNotebook[]> {
        if (element) {
            return Promise.resolve([]);
        }
        return this.getKaggleNotebooks();
    }

    private async getKaggleNotebooks(): Promise<KaggleNotebook[]> {
        return new Promise((resolve) => {
            // --- THIS IS THE CORRECTED COMMAND ---
            const coreCommand = 'kaggle kernels list --mine --csv';
            let command: string;

            // Build the command in a way that works on Windows, macOS, and Linux
            if (os.platform() === 'win32') {
                command = `set "KAGGLE_CONFIG_DIR=${this.configPath}" && ${coreCommand}`;
            } else {
                command = `KAGGLE_CONFIG_DIR=${this.configPath} ${coreCommand}`;
            }
            // ------------------------------------

            exec(command, (error, stdout, stderr) => {
                if (error) {
                    vscode.window.showErrorMessage(`Failed to fetch notebooks: ${stderr || error.message}`);
                    return resolve([]);
                }
                
                const lines = stdout.trim().split('\n').slice(1);
                if (lines.length === 0) {
                    return resolve([]);
                }

                // Robust parsing to handle commas in titles
                const notebooks = lines.map(line => {
                    const ref = line.substring(0, line.indexOf(','));
                    const restOfLine = line.substring(line.indexOf(',') + 1);
                    const title = restOfLine.substring(0, restOfLine.indexOf(','));
                    const cleanTitle = title.replace(/^"|"$/g, '');
                    return new KaggleNotebook(cleanTitle, ref);
                });

                resolve(notebooks);
            });
        });
    }
}