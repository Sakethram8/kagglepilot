// src/extension.ts

import * as vscode from 'vscode';
import { KaggleCompetitionProvider, Competition } from './kaggleCompetitionProvider';
import { KaggleDatasetProvider, KaggleDataset } from './kaggleDatasetProvider';
import { KaggleNotebookProvider, KaggleNotebook } from './kaggleNotebookProvider';

// Import all refactored commands
import { setCredentialsCommand } from './commands/setCredentials';
import { downloadCompetitionCommand } from './commands/downloadCompetition';
import { pullNotebookCommand } from './commands/pullNotebook';
import { pushNotebookCommand } from './commands/pushNotebook';
import { getNotebookStatusCommand } from './commands/getNotebookStatus';
import { getNotebookOutputCommand } from './commands/getNotebookOutput';
import { configureNotebookCommand } from './commands/configureNotebook';
import { watchNotebookCommand } from './commands/watchNotebook';
import { downloadDatasetCommand } from './commands/downloadDataset';
import { searchDatasetsCommand } from './commands/searchDatasets';
import { initNotebookCommand } from './commands/initNotebook';

/**
 * This is the main function that runs when your extension is activated.
 * It sets up all the commands and sidebar views.
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "kagglepilot" is now active!');

    // --- SETUP SHARED RESOURCES ---
    const watchOutputChannel = vscode.window.createOutputChannel("Kaggle Watch");
    let activeWatcher: NodeJS.Timeout | null = null;

    // --- SETUP SIDEBAR DATA PROVIDERS ---
    const competitionProvider = new KaggleCompetitionProvider(context.globalStorageUri.fsPath);
    const notebookProvider = new KaggleNotebookProvider(context.globalStorageUri.fsPath);
    const datasetProvider = new KaggleDatasetProvider(context.globalStorageUri.fsPath);

    vscode.window.registerTreeDataProvider('kaggleCompetitions', competitionProvider);
    vscode.window.registerTreeDataProvider('kaggleNotebooks', notebookProvider);
    vscode.window.registerTreeDataProvider('kaggleDatasets', datasetProvider);


    // --- REGISTER ALL COMMANDS ---
    const commands = [
        vscode.commands.registerCommand('kagglepilot.setCredentials', () => setCredentialsCommand(context)),
        vscode.commands.registerCommand('kagglepilot.downloadCompetition', (item: Competition) => downloadCompetitionCommand(context, item)),
        vscode.commands.registerCommand('kagglepilot.pullNotebook', (item: KaggleNotebook) => pullNotebookCommand(context, item)),
        vscode.commands.registerCommand('kagglepilot.pushNotebook', (uri: vscode.Uri) => pushNotebookCommand(context, uri)),
        vscode.commands.registerCommand('kagglepilot.getNotebookStatus', (item: KaggleNotebook) => getNotebookStatusCommand(context, item)),
        vscode.commands.registerCommand('kagglepilot.getNotebookOutput', (item: KaggleNotebook) => getNotebookOutputCommand(context, item)),
        vscode.commands.registerCommand('kagglepilot.configureNotebook', (uri: vscode.Uri) => configureNotebookCommand(context, uri)),
        vscode.commands.registerCommand('kagglepilot.downloadDataset', (item: KaggleDataset) => downloadDatasetCommand(context, item)),
        vscode.commands.registerCommand('kagglepilot.searchDatasets', () => searchDatasetsCommand(datasetProvider)),
        vscode.commands.registerCommand('kagglepilot.initNotebook', () => initNotebookCommand(context)),
        vscode.commands.registerCommand('kagglepilot.watchNotebook', (item: KaggleNotebook) => {
            watchNotebookCommand(context, item, watchOutputChannel, activeWatcher, (newWatcher) => {
                activeWatcher = newWatcher;
            });
        })
    ];

    // Add all command disposables to the extension context
    context.subscriptions.push(...commands);
}

// This method is called when your extension is deactivated
export function deactivate() {}