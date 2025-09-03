// src/commands/searchDatasets.ts

import * as vscode from 'vscode';
import { KaggleDatasetProvider } from '../kaggleDatasetProvider';

export async function searchDatasetsCommand(datasetProvider: KaggleDatasetProvider) {
    const searchQuery = await vscode.window.showInputBox({
        prompt: 'Enter a search term for datasets',
        placeHolder: 'e.g., "finance" or "london weather"'
    });

    if (searchQuery === undefined) {
        return; // User cancelled the input box
    }

    // Tell the provider to refresh with the new search query
    datasetProvider.refresh(searchQuery);
}