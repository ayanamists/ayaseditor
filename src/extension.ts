// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as editor from './editor';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "ayaseditor" is now active!');

	let disposable = vscode.commands.registerTextEditorCommand(
		'ayaseditor.Return', (te, e, args) => {
			editor.ReturnAction(te);
		});

	let disposable2 = vscode.commands.registerTextEditorCommand(
		'ayaseditor.Tab', (te, e, args) => {
			editor.TabAction(te);
		}
	);

	let disposable3 = vscode.commands.registerTextEditorCommand(
		'ayaseditor.Insert', (te, e, args) => {
			let pos = te.selection.active;
			e.insert(pos, 'λ');
		}
	);

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
	context.subscriptions.push(disposable3);
}

// this method is called when your extension is deactivated
export function deactivate() { }
