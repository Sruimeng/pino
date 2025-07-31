/**
 * 提示词解析器实现
 */
import { ParsedPrompt, PromptParser } from './types';

export class PromptParserImpl implements PromptParser {
  /**
   * 解析提示词
   * @param prompt 用户输入的提示词
   * @returns 解析结果
   */
  async parse(prompt: string): Promise<ParsedPrompt> {
    const keyInfo = this.extractKeyInfo(prompt);
    const intent = this.identifyIntent(prompt);
    const contextDependencies = this.analyzeContextDependencies(prompt);
    const enhancedPrompt = this.enhancePrompt({
      originalPrompt: prompt,
      keyInfo,
      intent,
      contextDependencies,
      enhancedPrompt: ''
    });
    
    return {
      originalPrompt: prompt,
      keyInfo,
      intent,
      contextDependencies,
      enhancedPrompt
    };
  }
  
  /**
   * 提取关键信息
   * @param prompt 提示词
   * @returns 关键信息数组
   */
  extractKeyInfo(prompt: string): string[] {
    // 简单实现：提取用引号括起来的内容作为关键信息
    const quotedRegex = /["'](.*?)["']/g;
    const matches = [];
    let match;
    
    while ((match = quotedRegex.exec(prompt)) !== null) {
      matches.push(match[1]);
    }
    
    // 如果没有引号括起来的内容，提取重要的名词
    if (matches.length === 0) {
      const nounRegex = /\b([A-Za-z]{4,})\b/g;
      let nounMatch;
      
      while ((nounMatch = nounRegex.exec(prompt)) !== null) {
        matches.push(nounMatch[1]);
      }
    }
    
    return [...new Set(matches)]; // 去重
  }
  
  /**
   * 识别意图
   * @param prompt 提示词
   * @returns 意图识别结果
   */
  identifyIntent(prompt: string): string {
    // 简单实现：基于关键词识别意图
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('create') || lowerPrompt.includes('generate') || lowerPrompt.includes('make')) {
      return 'creation';
    }
    
    if (lowerPrompt.includes('explain') || lowerPrompt.includes('describe') || lowerPrompt.includes('what is')) {
      return 'explanation';
    }
    
    if (lowerPrompt.includes('fix') || lowerPrompt.includes('error') || lowerPrompt.includes('bug')) {
      return 'debugging';
    }
    
    if (lowerPrompt.includes('optimize') || lowerPrompt.includes('improve') || lowerPrompt.includes('better')) {
      return 'optimization';
    }
    
    return 'general';
  }
  
  /**
   * 分析上下文依赖
   * @param prompt 提示词
   * @returns 上下文依赖数组
   */
  analyzeContextDependencies(prompt: string): string[] {
    // 简单实现：识别可能的上下文依赖
    const dependencies = [];
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('function') || lowerPrompt.includes('method')) {
      dependencies.push('code_context');
    }
    
    if (lowerPrompt.includes('variable') || lowerPrompt.includes('const') || lowerPrompt.includes('let')) {
      dependencies.push('variable_context');
    }
    
    if (lowerPrompt.includes('class') || lowerPrompt.includes('interface')) {
      dependencies.push('type_context');
    }
    
    if (lowerPrompt.includes('file') || lowerPrompt.includes('module')) {
      dependencies.push('file_context');
    }
    
    return dependencies;
  }
  
  /**
   * 增强提示词
   * @param parsedPrompt 解析后的提示词对象
   * @returns 增强后的提示词
   */
  enhancePrompt(parsedPrompt: ParsedPrompt): string {
    const { originalPrompt, keyInfo, intent, contextDependencies } = parsedPrompt;
    
    // 基于解析结果构建增强提示词
    let enhanced = originalPrompt;
    
    // 添加意图上下文
    if (intent !== 'general') {
      enhanced = `[Intent: ${intent}] ${enhanced}`;
    }
    
    // 添加关键信息上下文
    if (keyInfo.length > 0) {
      enhanced = `[Key Info: ${keyInfo.join(', ')}] ${enhanced}`;
    }
    
    // 添加上下文依赖
    if (contextDependencies.length > 0) {
      enhanced = `[Context: ${contextDependencies.join(', ')}] ${enhanced}`;
    }
    
    return enhanced;
  }
}