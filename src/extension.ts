// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { FocusViewProvider } from './FocusViewProvider';
import { analyzeFile } from './analyzer';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "focus" is now active!');

	// Create a new instance of FocusViewProvider
	const focusViewProvider = new FocusViewProvider();

	// Register the FocusViewProvider as a TreeDataProvider for the codeFocus view
	const treeDataProvider = vscode.window.registerTreeDataProvider('codeFocus', focusViewProvider);

	// Register the focus.start command
	const focusStartCommand = vscode.commands.registerCommand('focus.start', async (fileUri: vscode.Uri) => {
		// If no fileUri is provided (e.g., from command palette), use the active editor
		if (!fileUri) {
			const activeEditor = vscode.window.activeTextEditor;
			if (activeEditor) {
				fileUri = activeEditor.document.uri;
			} else {
				vscode.window.showInformationMessage('No file selected. Please open a TypeScript or JavaScript file and try again, or right-click on a file in the Explorer.');
				return;
			}
		}

		// Check if the file is a supported type
		const supportedExtensions = ['.ts', '.tsx', '.js', '.jsx'];
		const fileExtension = fileUri.path.toLowerCase().substring(fileUri.path.lastIndexOf('.'));
		if (!supportedExtensions.includes(fileExtension)) {
			vscode.window.showInformationMessage('Please select a TypeScript or JavaScript file (.ts, .tsx, .js, .jsx).');
			return;
		}

		// Show progress notification while analyzing
		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Window,
			title: "Analyzing file dependencies...",
			cancellable: false
		}, async (progress) => {
			try {
				// Report initial progress
				progress.report({ message: "Finding related files..." });

				// Analyze the file to get related files
				const relatedFiles = await analyzeFile(fileUri);

				// Report completion
				progress.report({ message: "Analysis complete!" });

				// Refresh the view with the related files
				focusViewProvider.refresh(relatedFiles);

				// Bring the Code Focus view into focus
				await vscode.commands.executeCommand('codeFocus.focus');

				// Show success message with count of related files
				const fileCount = relatedFiles.length;
				vscode.window.showInformationMessage(
					`Found ${fileCount} related file${fileCount !== 1 ? 's' : ''} for ${vscode.workspace.asRelativePath(fileUri)}`
				);

			} catch (error) {
				console.error('Error during file analysis:', error);
				vscode.window.showErrorMessage('Failed to analyze file dependencies. Please check the console for details.');
			}
		});
	});

	// Register the focus.clear command
	const focusClearCommand = vscode.commands.registerCommand('focus.clear', () => {
		// Clear the view by calling refresh with no arguments
		focusViewProvider.refresh();
		vscode.window.showInformationMessage('Code Focus view cleared.');
	});

	// Add all disposables to context subscriptions
	context.subscriptions.push(
		treeDataProvider,
		focusStartCommand,
		focusClearCommand
	);
}

// This method is called when your extension is deactivated
export function deactivate() { }
