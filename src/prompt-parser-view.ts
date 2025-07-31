import * as vscode from 'vscode';
import { PromptParserImpl } from './prompt-parser';

export class PromptParserViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'pino.promptParserView';
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,

            localResourceRoots: [
                this._extensionUri
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'parsePrompt': {
                    await this._parsePrompt(data.prompt);
                    break;
                }
                case 'getCurrentEditorText': {
                    this._getCurrentEditorText();
                    break;
                }
            }
        });
    }

    private async _parsePrompt(prompt: string) {
        try {
            const parser = new PromptParserImpl();
            const result = await parser.parse(prompt);

            this._view?.webview.postMessage({
                type: 'parseResult',
                result: result
            });
        } catch (error: any) {
            this._view?.webview.postMessage({
                type: 'error',
                message: error.message
            });
        }
    }

    private _getCurrentEditorText() {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            const text = selection.isEmpty 
                ? editor.document.getText() 
                : editor.document.getText(selection);
            
            this._view?.webview.postMessage({
                type: 'currentEditorText',
                text: text
            });
        } else {
            this._view?.webview.postMessage({
                type: 'currentEditorText',
                text: ''
            });
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource};">
                <title>Prompt Parser</title>
                <style>
                    body {
                        font-family: var(--vscode-font-family);
                        font-size: var(--vscode-font-size);
                        color: var(--vscode-foreground);
                        background-color: var(--vscode-sideBar-background);
                        margin: 0;
                        padding: 10px;
                    }

                    .container {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    }

                    .section {
                        background: var(--vscode-sideBar-background);
                        border: 1px solid var(--vscode-panel-border);
                        border-radius: 4px;
                        padding: 8px;
                    }

                    .section-title {
                        font-weight: bold;
                        margin-bottom: 8px;
                        color: var(--vscode-titleBar-activeForeground);
                    }

                    textarea {
                        width: 100%;
                        min-height: 80px;
                        background: var(--vscode-input-background);
                        color: var(--vscode-input-foreground);
                        border: 1px solid var(--vscode-input-border);
                        border-radius: 2px;
                        padding: 4px;
                        font-family: var(--vscode-font-family);
                        font-size: var(--vscode-font-size);
                        resize: vertical;
                        box-sizing: border-box;
                    }

                    button {
                        background: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        padding: 4px 8px;
                        border-radius: 2px;
                        cursor: pointer;
                        font-size: var(--vscode-font-size);
                        margin-right: 4px;
                    }

                    button:hover {
                        background: var(--vscode-button-hoverBackground);
                    }

                    button:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }

                    .result-item {
                        margin-bottom: 8px;
                    }

                    .result-label {
                        font-weight: bold;
                        color: var(--vscode-textLink-foreground);
                        display: block;
                        margin-bottom: 2px;
                    }

                    .result-value {
                        background: var(--vscode-textBlockQuote-background);
                        border-left: 2px solid var(--vscode-textBlockQuote-border);
                        padding: 4px 6px;
                        font-size: 0.9em;
                        color: var(--vscode-textPreformat-foreground);
                        word-break: break-word;
                    }

                    .loading {
                        text-align: center;
                        color: var(--vscode-textPreformat-foreground);
                        font-style: italic;
                    }

                    .error {
                        color: var(--vscode-errorForeground);
                        background: var(--vscode-inputValidation-errorBackground);
                        border: 1px solid var(--vscode-inputValidation-errorBorder);
                        padding: 4px;
                        border-radius: 2px;
                    }

                    .hidden {
                        display: none;
                    }

                    .small-text {
                        font-size: 0.8em;
                        color: var(--vscode-descriptionForeground);
                    }

                    .action-buttons {
                        display: flex;
                        gap: 4px;
                        margin-top: 4px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="section">
                        <div class="section-title">📝 输入提示词</div>
                        <textarea id="promptInput" placeholder="输入你的提示词，或点击获取当前编辑器内容..."></textarea>
                        <div class="action-buttons">
                            <button id="getCurrentTextButton" title="获取当前编辑器选中的文本">获取文本</button>
                            <button id="parseButton" title="解析提示词">解析</button>
                            <button id="clearButton" title="清空">清空</button>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">🔄 解析结果</div>
                        <div id="loading" class="loading hidden">
                            正在解析...
                        </div>
                        
                        <div id="results" class="hidden">
                            <div class="result-item">
                                <span class="result-label">🎯 意图:</span>
                                <div id="intent" class="result-value">-</div>
                            </div>
                            
                            <div class="result-item">
                                <span class="result-label">🔑 关键词:</span>
                                <div id="keyInfo" class="result-value">-</div>
                            </div>
                            
                            <div class="result-item">
                                <span class="result-label">🌐 上下文:</span>
                                <div id="contextDependencies" class="result-value">-</div>
                            </div>
                            
                            <div class="result-item">
                                <span class="result-label">✨ 增强提示词:</span>
                                <div id="enhancedPrompt" class="result-value small-text">-</div>
                            </div>
                        </div>
                        
                        <div id="error" class="error hidden"></div>
                    </div>

                    <div class="section">
                        <div class="section-title">💡 使用提示</div>
                        <div class="small-text">
                            • 在编辑器中选中任意文本，点击"获取文本"自动填充<br>
                            • 支持中文和英文提示词<br>
                            • 解析结果可直接复制使用
                        </div>
                    </div>
                </div>

                <script>
                    const vscode = acquireVsCodeApi();

                    // DOM元素
                    const promptInput = document.getElementById('promptInput');
                    const getCurrentTextButton = document.getElementById('getCurrentTextButton');
                    const parseButton = document.getElementById('parseButton');
                    const clearButton = document.getElementById('clearButton');
                    const loading = document.getElementById('loading');
                    const results = document.getElementById('results');
                    const error = document.getElementById('error');

                    // 事件监听器
                    getCurrentTextButton.addEventListener('click', () => {
                        vscode.postMessage({ type: 'getCurrentEditorText' });
                    });

                    parseButton.addEventListener('click', () => {
                        const prompt = promptInput.value.trim();
                        if (!prompt) {
                            showError('请输入提示词');
                            return;
                        }
                        
                        vscode.postMessage({ type: 'parsePrompt', prompt: prompt });
                    });

                    clearButton.addEventListener('click', () => {
                        promptInput.value = '';
                        clearResults();
                    });

                    promptInput.addEventListener('keydown', (e) => {
                        if (e.ctrlKey && e.key === 'Enter') {
                            parseButton.click();
                        }
                    });

                    // 监听来自扩展的消息
                    window.addEventListener('message', event => {
                        const message = event.data;
                        
                        switch (message.type) {
                            case 'parseResult':
                                hideLoading();
                                showResults(message.result);
                                break;
                            case 'currentEditorText':
                                if (message.text) {
                                    promptInput.value = message.text;
                                } else {
                                    showError('没有选中文本或当前没有打开的文件');
                                }
                                break;
                            case 'error':
                                hideLoading();
                                showError(message.message);
                                break;
                        }
                    });

                    function showLoading() {
                        loading.classList.remove('hidden');
                        results.classList.add('hidden');
                        error.classList.add('hidden');
                    }

                    function hideLoading() {
                        loading.classList.add('hidden');
                        results.classList.remove('hidden');
                        error.classList.add('hidden');
                    }

                    function showResults(result) {
                        document.getElementById('intent').textContent = result.intent || '未知';
                        document.getElementById('keyInfo').textContent = (result.keyInfo || []).join(', ') || '无';
                        document.getElementById('contextDependencies').textContent = (result.contextDependencies || []).join(', ') || '无';
                        document.getElementById('enhancedPrompt').textContent = result.enhancedPrompt || '无';
                    }

                    function showError(message) {
                        error.textContent = message;
                        error.classList.remove('hidden');
                        results.classList.add('hidden');
                        loading.classList.add('hidden');
                    }

                    function clearResults() {
                        results.classList.add('hidden');
                        error.classList.add('hidden');
                    }

                    // 初始化时获取当前文本
                    vscode.postMessage({ type: 'getCurrentEditorText' });
                </script>
            </body>
            </html>`;
    }
}