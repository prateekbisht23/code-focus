import * as vscode from 'vscode';
import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Analyzes a focal file to find all related files (dependencies and dependents)
 * @param focalFileUri The URI of the file to analyze
 * @returns Promise that resolves to an array of related file URIs
 */
export async function analyzeFile(focalFileUri: vscode.Uri): Promise<vscode.Uri[]> {
    try {
        console.log('🔍 Analyzing file:', vscode.workspace.asRelativePath(focalFileUri));

        // Execute both dependency and dependent analysis in parallel for better performance
        const [dependencies, dependents] = await Promise.all([
            getDependencies(focalFileUri),
            getDependents(focalFileUri)
        ]);

        console.log('📦 Found dependencies:', dependencies.map(uri => vscode.workspace.asRelativePath(uri)));
        console.log('🔗 Found dependents:', dependents.map(uri => vscode.workspace.asRelativePath(uri)));

        // Combine all related files: the focal file itself, its dependencies, and its dependents
        const allRelatedFiles = [focalFileUri, ...dependencies, ...dependents];

        // Remove duplicates by converting to Set and back to array
        const uniqueFiles = Array.from(
            new Set(allRelatedFiles.map(uri => uri.toString()))
        ).map(uriString => vscode.Uri.parse(uriString));

        console.log('✅ Total unique related files:', uniqueFiles.length, uniqueFiles.map(uri => vscode.workspace.asRelativePath(uri)));

        return uniqueFiles;
    } catch (error) {
        console.error('Error analyzing file:', error);
        return [focalFileUri]; // Return at least the focal file if analysis fails
    }
}

/**
 * Helper function to find all files that the given file depends on (imports)
 * @param fileUri The URI of the file to analyze for dependencies
 * @returns Promise that resolves to an array of dependency file URIs
 */
async function getDependencies(fileUri: vscode.Uri): Promise<vscode.Uri[]> {
    try {
        // Read the file content
        const document = await vscode.workspace.openTextDocument(fileUri);
        const sourceText = document.getText();

        // Parse the content into a TypeScript AST
        const sourceFile = ts.createSourceFile(
            fileUri.fsPath,
            sourceText,
            ts.ScriptTarget.Latest,
            true
        );

        const dependencies: vscode.Uri[] = [];
        const fileDir = path.dirname(fileUri.fsPath);

        // Traverse the AST to find import declarations
        function visit(node: ts.Node) {
            if (ts.isImportDeclaration(node)) {
                const moduleSpecifier = node.moduleSpecifier;

                // Check if it's a string literal (module path)
                if (ts.isStringLiteral(moduleSpecifier)) {
                    const importPath = moduleSpecifier.text;

                    // Filter for relative paths only (starting with ./ or ../)
                    if (importPath.startsWith('./') || importPath.startsWith('../')) {
                        try {
                            // Resolve the relative path to an absolute path
                            let resolvedPath = path.resolve(fileDir, importPath);

                            console.log(`🔍 Resolving import: ${importPath} -> ${resolvedPath}`);

                            // Add extension if no extension is present
                            if (!path.extname(resolvedPath)) {
                                // Try different extensions in order of preference
                                const extensions = ['.ts', '.tsx', '.js', '.jsx'];
                                let foundPath = null;

                                for (const ext of extensions) {
                                    const testPath = resolvedPath + ext;
                                    try {
                                        // Check if file exists by trying to create a URI and access it
                                        const testUri = vscode.Uri.file(testPath);
                                        // Use synchronous existence check for now
                                        if (fs.existsSync(testPath)) {
                                            foundPath = testPath;
                                            console.log(`✅ Found file: ${foundPath}`);
                                            break;
                                        }
                                    } catch {
                                        // File doesn't exist, continue to next extension
                                    }
                                }

                                if (foundPath) {
                                    resolvedPath = foundPath;
                                } else {
                                    // Default to .ts if no file is found
                                    resolvedPath = resolvedPath + '.ts';
                                    console.log(`⚠️ No file found, defaulting to: ${resolvedPath}`);
                                }
                            }

                            // Convert to vscode.Uri and add to dependencies
                            const dependencyUri = vscode.Uri.file(resolvedPath);
                            dependencies.push(dependencyUri);
                        } catch (error) {
                            console.warn(`Failed to resolve import path: ${importPath}`, error);
                        }
                    }
                }
            }

            // Continue traversing child nodes
            ts.forEachChild(node, visit);
        }

        // Start the AST traversal
        visit(sourceFile);

        console.log(`📦 Dependencies found for ${vscode.workspace.asRelativePath(fileUri)}:`, dependencies.map(uri => vscode.workspace.asRelativePath(uri)));

        return dependencies;
    } catch (error) {
        console.error('Error getting dependencies for file:', fileUri.fsPath, error);
        return [];
    }
}

/**
 * Helper function to find all files that depend on the given file (import it)
 * @param focalFileUri The URI of the file to find dependents for
 * @returns Promise that resolves to an array of dependent file URIs
 */
async function getDependents(focalFileUri: vscode.Uri): Promise<vscode.Uri[]> {
    try {
        console.log('🔍 Looking for dependents of:', vscode.workspace.asRelativePath(focalFileUri));

        // Find all TypeScript files in the workspace, excluding node_modules
        const allFiles = await vscode.workspace.findFiles(
            '**/*.{ts,tsx,js,jsx}',
            '**/node_modules/**'
        );

        console.log(`📁 Found ${allFiles.length} files to check for dependents`);

        const dependents: vscode.Uri[] = [];
        const focalFilePath = focalFileUri.fsPath;

        // Check each file to see if it imports the focal file
        for (const fileUri of allFiles) {
            // Skip the focal file itself
            if (fileUri.toString() === focalFileUri.toString()) {
                continue;
            }

            try {
                // Read and parse the file
                const document = await vscode.workspace.openTextDocument(fileUri);
                const sourceText = document.getText();

                const sourceFile = ts.createSourceFile(
                    fileUri.fsPath,
                    sourceText,
                    ts.ScriptTarget.Latest,
                    true
                );

                const fileDir = path.dirname(fileUri.fsPath);
                let importsTarget = false;

                // Check if this file imports the focal file
                function visit(node: ts.Node) {
                    if (ts.isImportDeclaration(node)) {
                        const moduleSpecifier = node.moduleSpecifier;

                        if (ts.isStringLiteral(moduleSpecifier)) {
                            const importPath = moduleSpecifier.text;

                            // Check relative imports
                            if (importPath.startsWith('./') || importPath.startsWith('../')) {
                                try {
                                    let resolvedPath = path.resolve(fileDir, importPath);

                                    console.log(`🔍 Checking if ${vscode.workspace.asRelativePath(fileUri)} imports focal file via: ${importPath} -> ${resolvedPath}`);

                                    // Add appropriate extension if no extension is present
                                    if (!path.extname(resolvedPath)) {
                                        // Try different extensions to match the focal file
                                        const extensions = ['.ts', '.tsx', '.js', '.jsx'];
                                        for (const ext of extensions) {
                                            const testPath = resolvedPath + ext;
                                            if (path.normalize(testPath) === path.normalize(focalFilePath)) {
                                                console.log(`✅ Found dependent: ${vscode.workspace.asRelativePath(fileUri)} imports focal file`);
                                                importsTarget = true;
                                                break;
                                            }
                                        }
                                    } else {
                                        // Has extension, direct comparison
                                        if (path.normalize(resolvedPath) === path.normalize(focalFilePath)) {
                                            console.log(`✅ Found dependent: ${vscode.workspace.asRelativePath(fileUri)} imports focal file`);
                                            importsTarget = true;
                                        }
                                    }
                                } catch (error) {
                                    // Ignore resolution errors for individual imports
                                }
                            }
                        }
                    }

                    // Continue traversing if we haven't found a match yet
                    if (!importsTarget) {
                        ts.forEachChild(node, visit);
                    }
                }

                visit(sourceFile);

                // If this file imports the focal file, add it to dependents
                if (importsTarget) {
                    dependents.push(fileUri);
                }
            } catch (error) {
                console.warn(`Failed to analyze file for dependents: ${fileUri.fsPath}`, error);
            }
        }

        return dependents;
    } catch (error) {
        console.error('Error getting dependents for file:', focalFileUri.fsPath, error);
        return [];
    }
}

/**
 * Utility function to normalize file paths for comparison
 * @param filePath The file path to normalize
 * @returns Normalized file path
 */
function normalizePath(filePath: string): string {
    return path.normalize(filePath).toLowerCase();
}