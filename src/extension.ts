import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as child_process from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.runDotNetCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found. Open a .cs file to run.');
            return;
        }

        const document = editor.document;
        const code = document.getText();

        const tempDir = path.join(os.tmpdir(), 'run-dotnet-code');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        const tempFile = path.join(tempDir, 'Program.cs');
        fs.writeFileSync(tempFile, code);

        const csprojFile = path.join(tempDir, 'temp.csproj');
        fs.writeFileSync(csprojFile, generateCsprojFile());

        const outputChannel = vscode.window.createOutputChannel('Run .NET Code');
        outputChannel.show(true);
        outputChannel.appendLine('Running .NET code...');

        const command = `dotnet run --project ${csprojFile}`;
        child_process.exec(command, (error, stdout, stderr) => {
            if (error) {
                outputChannel.appendLine(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                outputChannel.appendLine(`stderr: ${stderr}`);
                return;
            }
            outputChannel.appendLine(`Output: ${stdout}`);
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}

function generateCsprojFile(): string {
    return `
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
</Project>
`;
}