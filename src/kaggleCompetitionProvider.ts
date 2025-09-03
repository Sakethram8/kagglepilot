// src/kaggleCompetitionProvider.ts

import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as os from 'os';

/**
 * Represents a competition item in the sidebar.
 */
export class Competition extends vscode.TreeItem {
    constructor(
        public readonly label: string, // The display name for the UI
        public readonly ref: string    // The unique ID slug for the CLI (e.g., "titanic")
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.tooltip = `Competition ID: ${this.ref}`;
        // This value connects this tree item to the "download" command in package.json
        this.contextValue = 'competition';
    }
    // Use a built-in VS Code icon
    iconPath = new vscode.ThemeIcon('trophy');
}

/**
 * This class fetches and provides the competition data for the sidebar view.
 */
export class KaggleCompetitionProvider implements vscode.TreeDataProvider<Competition> {

    constructor(private configPath: string) { }

    getTreeItem(element: Competition): vscode.TreeItem {
        return element;
    }

    getChildren(element?: Competition): Thenable<Competition[]> {
        if (element) {
            return Promise.resolve([]); // Competitions are always top-level
        } else {
            return this.getKaggleCompetitions();
        }
    }

    private async getKaggleCompetitions(): Promise<Competition[]> {
        return new Promise((resolve) => {
            const coreCommand = 'kaggle competitions list --csv';
            let command: string;

            // Build the command in a way that works on Windows, macOS, and Linux
            if (os.platform() === 'win32') {
                command = `set "KAGGLE_CONFIG_DIR=${this.configPath}" && ${coreCommand}`;
            } else {
                command = `KAGGLE_CONFIG_DIR=${this.configPath} ${coreCommand}`;
            }

            exec(command, (error, stdout, stderr) => {
                if (error) {
                    vscode.window.showErrorMessage(`Kaggle CLI Error: ${stderr || error.message}`);
                    return resolve([]);
                }
                
                const lines = stdout.trim().split('\n').slice(1); // Get all lines except the header
                if (lines.length === 0) {
                    return resolve([]);
                }

                // --- NEW ROBUST PARSING LOGIC ---
                const competitions = lines.map(line => {
                    const firstColumn = line.substring(0, line.indexOf(','));
                    let ref: string;

                    // Check if the first column is a full URL
                    if (firstColumn.startsWith('https://www.kaggle.com/c/')) {
                        ref = firstColumn.substring('https://www.kaggle.com/c/'.length);
                    } else if (firstColumn.startsWith('https://www.kaggle.com/competitions/')) {
                        ref = firstColumn.substring('https://www.kaggle.com/competitions/'.length);
                    }
                    else {
                        // Otherwise, assume it's already the correct slug
                        ref = firstColumn;
                    }
                    
                    // The label can be the same as the ref for simplicity
                    const label = ref;

                    return new Competition(label, ref);
                }).filter(c => c.ref); // Filter out any empty or invalid lines

                resolve(competitions);
            });
        });
    }
}