/**
 * 提示词解析模块接口定义
 */

export interface ParsedPrompt {
  /**
   * 原始提示词
   */
  originalPrompt: string;
  
  /**
   * 提取的关键信息
   */
  keyInfo: string[];
  
  /**
   * 识别的意图
   */
  intent: string;
  
  /**
   * 上下文依赖关系
   */
  contextDependencies: string[];
  
  /**
   * 优化后的提示词
   */
  enhancedPrompt: string;
}

export interface PromptParser {
  /**
   * 解析提示词
   * @param prompt 用户输入的提示词
   * @returns 解析结果
   */
  parse(prompt: string): Promise<ParsedPrompt>;
  
  /**
   * 提取关键信息
   * @param prompt 提示词
   * @returns 关键信息数组
   */
  extractKeyInfo(prompt: string): string[];
  
  /**
   * 识别意图
   * @param prompt 提示词
   * @returns 意图识别结果
   */
  identifyIntent(prompt: string): string;
  
  /**
   * 分析上下文依赖
   * @param prompt 提示词
   * @returns 上下文依赖数组
   */
  analyzeContextDependencies(prompt: string): string[];
  
  /**
   * 增强提示词
   * @param parsedPrompt 解析后的提示词对象
   * @returns 增强后的提示词
   */
  enhancePrompt(parsedPrompt: ParsedPrompt): string;
}