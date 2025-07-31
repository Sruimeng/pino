我看到你想要在 Claude 聊天界面中直接看到扩展效果。但是 VS Code 扩展需要在 VS Code 环境中运行，无法直接在这里展示。

不过我可以帮你创建一个简化的 Web 版本来演示功能：

````html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pino Prompt Parser - Web Demo</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5em;
        }
        
        .input-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
            color: #555;
        }
        
        textarea {
            width: 100%;
            min-height: 120px;
            padding: 15px;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            font-size: 16px;
            font-family: inherit;
            resize: vertical;
            box-sizing: border-box;
            transition: border-color 0.3s;
        }
        
        textarea:focus {
            outline: none;
            border-color: #667eea;
        }
        
        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            transition: transform 0.2s;
            width: 100%;
        }
        
        button:hover {
            transform: translateY(-2px);
        }
        
        .results {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 5px solid #667eea;
        }
        
        .result-item {
            margin-bottom: 15px;
            padding: 10px;
            background: white;
            border-radius: 8px;
        }
        
        .result-label {
            font-weight: bold;
            color: #667eea;
            display: block;
            margin-bottom: 5px;
        }
        
        .result-value {
            color: #333;
            font-family: 'Courier New', monospace;
            background: #f1f3f4;
            padding: 8px;
            border-radius: 5px;
        }
        
        .hidden {
            display: none;
        }
        
        .loading {
            text-align: center;
            color: #667eea;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌲 Pino Prompt Parser</h1>
        
        <div class="input-group">
            <label for="promptInput">输入你的提示词：</label>
            <textarea 
                id="promptInput" 
                placeholder="例如：请帮我写一个关于春天的诗歌，要求有意境，字数控制在100字以内..."
            ></textarea>
        </div>
        
        <button id="parseButton">🚀 解析提示词</button>
        
        <div id="loading" class="loading hidden">
            正在解析中，请稍候...
        </div>
        
        <div id="results" class="results hidden">
            <h3>📊 解析结果</h3>
            
            <div class="result-item">
                <span class="result-label">📝 原始提示词:</span>
                <div id="originalPrompt" class="result-value"></div>
            </div>
            
            <div class="result-item">
                <span class="result-label">✨ 增强提示词:</span>
                <div id="enhancedPrompt" class="result-value"></div>
            </div>
            
            <div class="result-item">
                <span class="result-label">🎯 识别意图:</span>
                <div id="intent" class="result-value"></div>
            </div>
            
            <div class="result-item">
                <span class="result-label">🔑 关键信息:</span>
                <div id="keyInfo" class="result-value"></div>
            </div>
            
            <div class="result-item">
                <span class="result-label">🔗 上下文依赖:</span>
                <div id="contextDependencies" class="result-value"></div>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('parseButton').addEventListener('click', async () => {
            const prompt = document.getElementById('promptInput').value.trim();
            
            if (!prompt) {
                alert('请输入提示词！');
                return;
            }
            
            // 显示加载状态
            document.getElementById('loading').classList.remove('hidden');
            document.getElementById('results').classList.add('hidden');
            
            // 模拟解析过程
            setTimeout(() => {
                const result = parsePrompt(prompt);
                showResults(result);
                
                document.getElementById('loading').classList.add('hidden');
                document.getElementById('results').classList.remove('hidden');
            }, 1500);
        });
        
        function parsePrompt(prompt) {
            // 模拟智能解析逻辑
            const keywords = extractKeywords(prompt);
            const intent = detectIntent(prompt);
            const context = detectContext(prompt);
            
            return {
                originalPrompt: prompt,
                enhancedPrompt: enhancePrompt(prompt, keywords, intent),
                intent: intent,
                keyInfo: keywords,
                contextDependencies: context
            };
        }
        
        function extractKeywords(prompt) {
            const commonWords = ['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这样'];
            const words = prompt.split(/[\s，。！？；：""''（）【】]/);
            return words.filter(word => 
                word.length > 1 && 
                !commonWords.includes(word) && 
                /[\u4e00-\u9fa5a-zA-Z]/.test(word)
            ).slice(0, 5);
        }
        
        function detectIntent(prompt) {
            if (prompt.includes('写') || prompt.includes('创作')) return '创作类';
            if (prompt.includes('分析') || prompt.includes('解释')) return '分析类';
            if (prompt.includes('翻译')) return '翻译类';
            if (prompt.includes('帮助') || prompt.includes('教')) return '辅助类';
            if (prompt.includes('总结') || prompt.includes('概括')) return '总结类';
            return '通用对话';
        }
        
        function detectContext(prompt) {
            const contexts = [];
            if (prompt.includes('文学') || prompt.includes('诗歌') || prompt.includes('小说')) contexts.push('文学');
            if (prompt.includes('技术') || prompt.includes('编程') || prompt.includes('代码')) contexts.push('技术');
            if (prompt.includes('商业') || prompt.includes('营销') || prompt.includes('管理')) contexts.push('商业');
            if (prompt.includes('教育') || prompt.includes('学习') || prompt.includes('知识')) contexts.push('教育');
            if (prompt.includes('艺术') || prompt.includes('设计') || prompt.includes('创意')) contexts.push('艺术');
            
            return contexts.length > 0 ? contexts : ['通用'];
        }
        
        function enhancePrompt(original, keywords, intent) {
            let enhanced = `作为一个专业的${intent}助手，`;
            enhanced += `请基于以下关键要素：${keywords.join('、')}，`;
            enhanced += `来处理这个请求：${original}`;
            enhanced += ` 请确保回答准确、详细且有针对性。`;
            
            return enhanced;
        }
        
        function showResults(result) {
            document.getElementById('originalPrompt').textContent = result.originalPrompt;
            document.getElementById('enhancedPrompt').textContent = result.enhancedPrompt;
            document.getElementById('intent').textContent = result.intent;
            document.getElementById('keyInfo').textContent = result.keyInfo.join(', ');
            document.getElementById('contextDependencies').textContent = result.contextDependencies.join(', ');
        }
        
        // 添加回车键支持
        document.getElementById('promptInput').addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                document.getElementById('parseButton').click();
            }
        });
    </script>
</body>
</html>
````

这个 Web 版本包含了：

1. **美观的界面** - 渐变背景和现代化设计
2. **智能解析** - 模拟关键词提取、意图识别等功能
3. **实时反馈** - 加载动画和结果展示
4. **交互体验** - 支持 Ctrl+Enter 快捷键

你可以将这段代码保存为 HTML 文件，用浏览器打开就能看到效果！

要在 VS Code 扩展中看到真正的效果，你需要：
1. 按 F5 启动调试
2. 在新窗口的侧边栏找到 "Pino Prompt Parser" 面板
3. 或使用命令面板 (Cmd+Shift+P) 搜索相关命令

Similar code found with 2 license types