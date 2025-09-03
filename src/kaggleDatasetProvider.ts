// src/kaggleDatasetProvider.ts

import * as vscode from 'vscode';
import { spawn } from 'child_process';

export class KaggleDataset extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly ref: string
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.tooltip = `Ref: ${this.ref}`;
        this.description = this.ref;
        this.contextValue = 'dataset';
    }
    iconPath = new vscode.ThemeIcon('database');
}

export class KaggleDatasetProvider implements vscode.TreeDataProvider<KaggleDataset> {

    private _onDidChangeTreeData: vscode.EventEmitter<KaggleDataset | undefined | null | void> = new vscode.EventEmitter<KaggleDataset | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<KaggleDataset | undefined | null | void> = this._onDidChangeTreeData.event;

    private currentSearchQuery: string | undefined = undefined;

    constructor(private configPath: string) { }

    refresh(searchQuery?: string): void {
        this.currentSearchQuery = searchQuery;
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: KaggleDataset): vscode.TreeItem {
        return element;
    }

    getChildren(element?: KaggleDataset): Thenable<KaggleDataset[]> {
        if (element) {
            return Promise.resolve([]);
        }
        return this.getKaggleDatasets(this.currentSearchQuery);
    }

    private async getKaggleDatasets(searchQuery?: string): Promise<KaggleDataset[]> {
        return new Promise((resolve) => {
            const args = ['datasets', 'list', '--csv', '--page', '1'];
            if (searchQuery) {
                args.push('--search', searchQuery);
            }

            // --- THE DEFINITIVE FIX: Force Python to use UTF-8 ---
            const env = { 
                ...process.env, 
                'KAGGLE_CONFIG_DIR': this.configPath,
                'PYTHONIOENCODING': 'UTF-8' // This solves the encoding crash
            };

            const kaggleProcess = spawn('kaggle', args, { env });

            let stdoutData = '';
            let stderrData = '';

            kaggleProcess.stdout.on('data', (data) => {
                stdoutData += data.toString();
            });

            kaggleProcess.stderr.on('data', (data) => {
                stderrData += data.toString();
            });

            kaggleProcess.on('close', (code) => {
                if (code !== 0) {
                    vscode.window.showErrorMessage(`Failed to fetch datasets. Kaggle CLI exited with code ${code}. Error: ${stderrData}`);
                    return resolve([]);
                }

                const lines = stdoutData.trim().split('\n').slice(1);
                if (lines.length === 0) {
                    vscode.window.showInformationMessage(searchQuery ? `No datasets found for "${searchQuery}"` : 'No datasets found.');
                    return resolve([]);
                }

                const datasets = lines.map(line => {
                    try {
                        const match = line.match(/^([^,]+),("(?:[^"]|"")*"|[^,]*)/);
                        if (!match) { return null; }
                        const ref = match[1];
                        let title = match[2];
                        if (title.startsWith('"') && title.endsWith('"')) {
                            title = title.slice(1, -1).replace(/""/g, '"');
                        }
                        if (!ref || !title) { return null; }
                        return new KaggleDataset(title, ref);
                    } catch (e) {
                        console.error(`Failed to parse dataset line: "${line}"`, e);
                        return null;
                    }
                }).filter(d => d !== null) as KaggleDataset[];

                resolve(datasets);
            });
        });
    }
}