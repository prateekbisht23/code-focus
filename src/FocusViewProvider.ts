import * as vscode from 'vscode';

export class FocusViewProvider implements vscode.TreeDataProvider<vscode.Uri> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.Uri | undefined | null | void> = new vscode.EventEmitter<vscode.Uri | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.Uri | undefined | null | void> = this._onDidChangeTreeData.event;

    private focusedFiles: vscode.Uri[] = [];

    /**
     * Refreshes the view with new files or clears the list if no files are provided
     * @param files Optional array of file URIs to display. If not provided, clears the list.
     */
    refresh(files?: vscode.Uri[]): void {
        if (files) {
            this.focusedFiles = files;
        } else {
            this.focusedFiles = [];
        }
        this._onDidChangeTreeData.fire();
    }

    /**
     * Returns a TreeItem representation of the given file URI
     * @param element The file URI to create a TreeItem for
     * @returns A configured TreeItem that opens the file when clicked
     */
    getTreeItem(element: vscode.Uri): vscode.TreeItem {
        // Use just the filename for display, not the full path
        const fileName = element.path.split('/').pop() || 'Unknown';
        const relativePath = vscode.workspace.asRelativePath(element);

        const treeItem = new vscode.TreeItem(
            fileName,
            vscode.TreeItemCollapsibleState.None
        );

        // Configure the command to open the file when clicked
        treeItem.command = {
            command: 'vscode.open',
            title: 'Open File',
            arguments: [element]
        };

        // Set appropriate icon based on file type
        treeItem.iconPath = vscode.ThemeIcon.File;

        // Add tooltip with full relative path for context
        treeItem.tooltip = relativePath;

        // Set resource URI for proper file icon display
        treeItem.resourceUri = element;

        return treeItem;
    }

    /**
     * Returns the children of the given element, or root items if element is undefined
     * @param element The parent element, or undefined for root items
     * @returns A thenable that resolves to an array of child URIs
     */
    getChildren(element?: vscode.Uri): Thenable<vscode.Uri[]> {
        if (element === undefined) {
            // Return root items (our focused files)
            return Promise.resolve(this.focusedFiles);
        } else {
            // Our tree is only one level deep, so no children for file items
            return Promise.resolve([]);
        }
    }

    /**
     * Gets the parent of the given element
     * @param element The element to get the parent for
     * @returns The parent element, or undefined if element is a root item
     */
    getParent?(element: vscode.Uri): vscode.ProviderResult<vscode.Uri> {
        // Since our tree is only one level deep, all items are root items
        return undefined;
    }
}