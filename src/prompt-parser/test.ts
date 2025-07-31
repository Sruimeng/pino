/**
 * 提示词解析模块测试
 */
import { PromptParserImpl } from '../prompt-parser';

async function runTests() {
  const parser = new PromptParserImpl();
  
  // 测试用例
  const testCases = [
    'Create a "React component" that implements "user authentication"',
    'Explain how "virtual DOM" works in "React applications"',
    'Fix the "memory leak" issue in this "JavaScript function"',
    'Optimize the "database query" for better "performance"'
  ];
  
  console.log('Prompt Parser Test Results:');
  console.log('==========================');
  
  for (const prompt of testCases) {
    console.log(`\nOriginal Prompt: "${prompt}"`);
    const result = await parser.parse(prompt);
    console.log(`Enhanced Prompt: "${result.enhancedPrompt}"`);
    console.log(`Intent: ${result.intent}`);
    console.log(`Key Info: [${result.keyInfo.join(', ')}]`);
    console.log(`Context Dependencies: [${result.contextDependencies.join(', ')}]`);
  }
}

// 运行测试
runTests().catch(console.error);