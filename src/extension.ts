// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { PromptParserImpl } from './prompt-parser';
import { PromptParserViewProvider } from './prompt-parser-view';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "pino" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('pino.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from pino!');
	});

	// 注册新的命令用于测试提示词解析功能
	const promptParserDisposable = vscode.commands.registerCommand('pino.parsePrompt', async () => {
		// 获取用户输入的提示词
		const prompt = await vscode.window.showInputBox({
			prompt: 'Enter a prompt to parse',
			placeHolder: 'Enter your prompt here...'
		});

		if (prompt) {
			try {
				// 使用提示词解析器解析提示词
				const parser = new PromptParserImpl();
				const result = await parser.parse(prompt);

				// 在输出面板中显示结果
				const outputChannel = vscode.window.createOutputChannel('Pino Prompt Parser');
				outputChannel.show();
				outputChannel.appendLine('Prompt Parser Results:');
				outputChannel.appendLine('=====================');
				outputChannel.appendLine(`Original Prompt: "${result.originalPrompt}"`);
				outputChannel.appendLine(`Enhanced Prompt: "${result.enhancedPrompt}"`);
				outputChannel.appendLine(`Intent: ${result.intent}`);
				outputChannel.appendLine(`Key Info: [${result.keyInfo.join(', ')}]`);
				outputChannel.appendLine(`Context Dependencies: [${result.contextDependencies.join(', ')}]`);

				vscode.window.showInformationMessage('Prompt parsed successfully! Check the output panel for results.');
			} catch (error) {
				vscode.window.showErrorMessage(`Error parsing prompt: ${error}`);
			}
		}
	});

	// 注册新的命令用于打开提示词增强UI界面
	const promptEnhancerDisposable = vscode.commands.registerCommand('pino.openPromptEnhancer', () => {
		PromptEnhancerPanel.createOrShow(context.extensionUri);
	});

	// 如果面板已经存在，更新其扩展URI
	if (vscode.window.registerWebviewPanelSerializer) {
		// Make sure we register a serializer in activation event
		vscode.window.registerWebviewPanelSerializer(PromptEnhancerPanel.viewType, {
			async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
				console.log(`Got state: ${state}`);
				PromptEnhancerPanel.revive(webviewPanel, context.extensionUri);
			}
		});
	}

	// 注册右侧面板视图
	const provider = new PromptParserViewProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(PromptParserViewProvider.viewType, provider)
	);

	context.subscriptions.push(disposable);
	context.subscriptions.push(promptParserDisposable);
	context.subscriptions.push(promptEnhancerDisposable);
}

/**
 * 提示词增强面板管理类
 */
class PromptEnhancerPanel {
	/**
	 * 跟踪当前打开的面板
	 */
	public static currentPanel: PromptEnhancerPanel | undefined;

	public static readonly viewType = 'promptEnhancer';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(extensionUri: vscode.Uri) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// 如果我们已经有了一个面板，显示它
		if (PromptEnhancerPanel.currentPanel) {
			PromptEnhancerPanel.currentPanel._panel.reveal(column);
			return;
		}

		// 否则，创建一个新的面板
		const panel = vscode.window.createWebviewPanel(
			PromptEnhancerPanel.viewType,
			'Prompt Enhancer',
			column || vscode.ViewColumn.One,
			{
				// 在webview中启用脚本
				enableScripts: true,

				// 保留上下文时，webview内容会被保留
				retainContextWhenHidden: true
			}
		);

		PromptEnhancerPanel.currentPanel = new PromptEnhancerPanel(panel, extensionUri);
	}

	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		PromptEnhancerPanel.currentPanel = new PromptEnhancerPanel(panel, extensionUri);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
		this._extensionUri = extensionUri;

		// 设置webview的HTML内容
		this._update();

		// 监听面板何时被关闭
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// 更新面板的HTML内容
		this._panel.onDidChangeViewState(
			() => {
				if (this._panel.visible) {
					this._update();
				}
			},
			null,
			this._disposables
		);

		// 处理来自webview的消息
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'enhancePrompt':
						this._enhancePrompt(message.prompt);
						return;
				}
			},
			null,
			this._disposables
		);
	}

	public dispose() {
		PromptEnhancerPanel.currentPanel = undefined;

		// 清理资源
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private async _enhancePrompt(prompt: string) {
		try {
			// 使用提示词解析器解析提示词
			const parser = new PromptParserImpl();
			const result = await parser.parse(prompt);

			// 将结果发送回webview
			this._panel.webview.postMessage({ command: 'enhanceResult', result });
		} catch (error: any) {
			// 发送错误信息回webview
			this._panel.webview.postMessage({ command: 'enhanceResult', error: error.message });
		}
	}

	private _update() {
		this._panel.title = "Prompt Enhancer";
		this._panel.webview.html = this._getHtmlForWebview();
	}

	private _getHtmlForWebview() {
		// 本地HTML文件的路径
		const htmlPath = vscode.Uri.joinPath(this._extensionUri, 'src', 'webview', 'promptEnhancer.html');
		
		// 读取HTML文件内容
		try {
			const htmlContent = require('fs').readFileSync(htmlPath.fsPath, 'utf8');
			return htmlContent;
		} catch (error: any) {
			return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Prompt Enhancer</title>
</head>
<body>
	<h1>Prompt Enhancer</h1>
	<p>Error loading UI: ${error.message}</p>
</body>
</html>`;
		}
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
