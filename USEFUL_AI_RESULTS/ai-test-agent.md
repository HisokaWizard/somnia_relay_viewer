Отличные уточняющие вопросы! Давайте соберем все воедино, напишем полный код и разберем все детали, чтобы у вас была цельная и рабочая картина.

### Вопрос 1: Как агент узнает, откуда брать контекст?

Вы правы, мы не указываем ему другие файлы напрямую. И в этом вся суть автономности! Агент узнает о них в два шага, и все это происходит внутри `codeRetrieverTool`.

1.  **Агент получает Задачу:** В начальном промпте мы говорим: "Напиши тест для файла `./src/components/MyComponent.tsx`. Вот его код. **Используй `codeRetrieverTool`, чтобы получить контекст**".
2.  **Агент вызывает `codeRetrieverTool`:** Он передает инструменту путь, который мы ему дали (`./src/components/MyComponent.tsx`).
3.  **Инструмент делает "грязную" работу:**
    - Он **читает содержимое** файла `MyComponent.tsx`.
    - Внутри этого кода он находит все строки импорта, например: `import { api } from '../api/api';` или `import { Button } from './Button';`.
    - Он берет эти относительные пути (`../api/api` и `./Button`) и, зная расположение `MyComponent.tsx`, вычисляет их полные пути на диске.
    - Он **читает содержимое** этих найденных файлов (`api.ts` и `Button.tsx`).
    - Он объединяет код этих файлов в одну большую строку и **возвращает ее агенту**.

Таким образом, агент, не зная ничего, кроме одного файла, делегирует задачу сбора контекста специализированному инструменту, который сам анализирует зависимости и "донасыщает" контекст.

### Вопрос 2: Интеграция с GigaChat и полный код

Адаптация под GigaChat — отличный пример гибкости LangChain. Нам нужно будет установить пакет `@langchain/community` и заменить модель `ChatOpenAI` на `GigaChat`. Авторизация будет происходить через переменные окружения.

Давайте теперь напишем весь проект с нуля.

---

### Финальный код проекта

#### 1. Структура проекта

```
/my-test-agent
|-- /aistore
|   |-- state.ts
|   |-- tools.ts
|   |-- graph.ts
|-- /src
|   |-- components
|   |   |-- MyComponent.tsx  // <-- Файл, который мы будем тестировать
|-- .env
|-- package.json
|-- index.ts             // <-- Основной файл для запуска
```

#### 2. Зависимости (`package.json`)

```json
{
  "name": "ai-test-agent",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node --loader ts-node/esm index.ts"
  },
  "dependencies": {
    "@langchain/community": "^0.2.20",
    "@langchain/core": "0.3.61",
    "@langchain/langgraph": "0.3.5",
    "axios": "1.4.0",
    "dotenv": "^16.4.5",
    "glob": "^11.0.0",
    "langchain": "0.3.29"
  },
  "devDependencies": {
    "@types/node": "^20.14.10",
    "ts-node": "^10.9.2",
    "typescript": "^5.5.3"
  }
}
```

**Установка:** `npm install`

#### 3. Переменные окружения (`.env`)

Создайте файл `.env` в корне проекта. **GIGACHAT_CREDENTIALS** — это ваш авторизационный токен для API GigaChat.

```
# .env
GIGACHAT_CREDENTIALS="Ваш_авторизационный_ключ_здесь"
```

#### 4. Инструменты (`aistore/tools.ts`)

Здесь мы реализуем все наши инструменты, включая `codeRetrieverTool`.

```typescript
// aistore/tools.ts
import { DynamicTool } from '@langchain/core/tools';
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

// --- Tool 1: Code Retriever ---
// Эта функция парсит код на предмет локальных импортов (начинающихся с ./ или ../)
const parseImports = (code: string): string[] => {
  const importRegex = /from\s+['"]((?:\.\/|\.\.\/)[^'"]+)['"]/g;
  const imports = new Set<string>();
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    imports.add(match[1]);
  }
  return Array.from(imports);
};

export const codeRetrieverTool = new DynamicTool({
  name: 'CodeRetriever',
  description:
    'Reads the target file, finds all local imports, and retrieves the code from those imported files to provide context. Input should be the path to the target file.',
  func: async (targetFilePath: string) => {
    try {
      console.log(`[Tool] Running CodeRetriever for: ${targetFilePath}`);
      const sourceCode = await fs.readFile(targetFilePath, 'utf-8');
      const relativeImports = parseImports(sourceCode);

      if (relativeImports.length === 0) {
        return 'No local imports found in the target file.';
      }

      let context = '';
      for (const relativeImport of relativeImports) {
        const importPath = path.resolve(
          path.dirname(targetFilePath),
          relativeImport
        );
        const possiblePaths = [
          `${importPath}.ts`,
          `${importPath}.tsx`,
          `${importPath}/index.ts`,
          `${importPath}/index.tsx`,
        ];

        let foundPath: string | undefined;
        for (const p of possiblePaths) {
          try {
            await fs.access(p);
            foundPath = p;
            break;
          } catch {}
        }

        if (foundPath) {
          console.log(`[Tool] Found context file: ${foundPath}`);
          const importedCode = await fs.readFile(foundPath, 'utf-8');
          context += `\n\n// Context from: ${path.relative(process.cwd(), foundPath)}\n\`\`\`typescript\n${importedCode}\n\`\`\`\n`;
        }
      }
      return context || 'Could not retrieve code for any imports.';
    } catch (error: any) {
      return `Error retrieving code context: ${error.message}`;
    }
  },
});

// --- Tool 2: Test Validator ---
export const testValidatorTool = new DynamicTool({
  name: 'TestValidator',
  description:
    'Validates the provided test code by running Jest and ESLint. Input is the raw test code as a string. Returns a JSON object with success status and logs.',
  func: async (input: string) => {
    console.log('[Tool] Running TestValidator...');
    const testFilePath = path.join(process.cwd(), '__temp_test__.test.tsx');
    try {
      await fs.writeFile(testFilePath, input);
      // Здесь должны быть ваши реальные команды для eslint и jest.
      // Для примера, мы просто проверим синтаксис TypeScript.
      // В реальном проекте: execSync(`npx eslint ${testFilePath} && npx jest ${testFilePath}`)
      execSync(`npx tsc --noEmit ${testFilePath}`); // Простая проверка синтаксиса

      console.log('[Tool] Validation successful.');
      await fs.unlink(testFilePath);
      return JSON.stringify({
        success: true,
        logs: 'Test passed syntax check.',
      });
    } catch (error: any) {
      console.log('[Tool] Validation failed.');
      if (await fs.stat(testFilePath).catch(() => false)) {
        await fs.unlink(testFilePath);
      }
      // Возвращаем stdout и stderr для анализа LLM
      const logs = error.stdout?.toString() + error.stderr?.toString();
      return JSON.stringify({ success: false, logs: logs });
    }
  },
});

// --- Tool 3: File Saver ---
export const fileSaveTool = new DynamicTool({
  name: 'FileSaver',
  description:
    "Saves the given content to a specified file path. Input should be a JSON string with 'path' and 'content' keys.",
  func: async (input: string) => {
    console.log(`[Tool] Running FileSaver...`);
    try {
      const { path: filePath, content } = JSON.parse(input);
      await fs.writeFile(filePath, content);
      const successMessage = `File successfully saved to ${filePath}`;
      console.log(`[Tool] ${successMessage}`);
      return successMessage;
    } catch (error: any) {
      return `Error saving file: ${error.message}. Input was: ${input}`;
    }
  },
});
```

#### 5. Состояние графа (`aistore/state.ts`)

Это простое определение типа для сообщений, которые передаются между узлами.

```typescript
// aistore/state.ts
import { BaseMessage } from '@langchain/core/messages';

export interface AgentState {
  messages: BaseMessage[];
}
```

#### 6. Граф агента (`aistore/graph.ts`)

Здесь мы собираем все вместе: GigaChat, инструменты и логику LangGraph.

```typescript
// aistore/graph.ts
import { StateGraph, END } from '@langchain/langgraph';
import { ToolExecutor } from '@langchain/langgraph/prebuilt';
import { GigaChat } from '@langchain/community/chat_models/gigachat';
import { BaseMessage, AIMessage } from '@langchain/core/messages';
import { createReactAgent } from 'langchain/agents/react/agent';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { pull } from 'langchain/hub';
import type { PromptTemplate } from '@langchain/core/prompts';

import { codeRetrieverTool, testValidatorTool, fileSaveTool } from './tools.js';
import type { AgentState } from './state.js';

export const createAgentWorkflow = async () => {
  // 1. Инициализируем модель GigaChat, она сама подхватит креды из .env
  const model = new GigaChat({
    temperature: 0.1,
    model: 'GigaChat-Pro', // Используем Pro модель для лучших результатов
  });

  // 2. Создаем исполнитель инструментов
  const tools = [testValidatorTool, codeRetrieverTool, fileSaveTool];
  const toolExecutor = new ToolExecutor({ tools });

  // 3. Создаем агента. Мы используем React Agent, который хорошо работает с инструментами.
  // createOpenAIToolsAgent заточен под OpenAI, а createReactAgent более универсален.
  const prompt = await pull<PromptTemplate>('hwchase17/react');
  const agent = await createReactAgent({
    llm: model,
    tools,
    prompt,
  });

  // 4. Определяем узлы для графа
  const agentNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const agentOutcome = await agent.invoke({
      input: state.messages[state.messages.length - 1].content,
      chat_history: state.messages
        .slice(0, -1)
        .map((m) => m.content.toString())
        .join('\n'),
    });

    // Преобразуем вывод агента в сообщение AIMessage
    const aiMessage = new AIMessage({
      content: agentOutcome.log,
      tool_calls: agentOutcome.tool_calls,
    });

    return { messages: [aiMessage] };
  };

  const toolNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const lastMessage = state.messages[state.messages.length - 1];
    if (
      !lastMessage ||
      !(lastMessage instanceof AIMessage) ||
      !lastMessage.tool_calls
    ) {
      throw new Error('Logic error: toolNode called without tool_calls');
    }

    const toolOutput = await toolExecutor.invoke({
      tool_calls: lastMessage.tool_calls,
    });

    return { messages: toolOutput.tool_code_outputs };
  };

  // Условное ребро: решаем, продолжать ли цикл
  const shouldContinue = (state: AgentState) => {
    const lastMessage = state.messages[state.messages.length - 1];
    if (!(lastMessage instanceof AIMessage)) {
      return 'end';
    }
    return lastMessage.tool_calls && lastMessage.tool_calls.length > 0
      ? 'continue'
      : 'end';
  };

  // 5. Собираем граф
  const workflow = new StateGraph<AgentState>({
    channels: {
      messages: {
        value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
        default: () => [],
      },
    },
  });

  workflow.addNode('agent', agentNode);
  workflow.addNode('tools', toolNode);

  workflow.setEntryPoint('agent');

  workflow.addConditionalEdges('agent', shouldContinue, {
    continue: 'tools',
    end: END,
  });

  workflow.addEdge('tools', 'agent');

  return workflow.compile();
};
```

#### 7. Файл запуска (`index.ts`)

Это главный скрипт, который готовит задачу и запускает нашего агента.

```typescript
// index.ts
import 'dotenv/config'; // Загружает .env файл в process.env
import { createAgentWorkflow } from './aistore/graph.js';
import fs from 'fs/promises';
import { HumanMessage } from '@langchain/core/messages';
import path from 'path';

async function main() {
  // ---- Подготовка ----
  const targetFile = path.resolve('./src/components/MyComponent.tsx');
  const testFile = targetFile.replace('.tsx', '.test.tsx');

  // Убедимся, что файл для теста существует (создадим dummy-файл)
  await fs.mkdir(path.dirname(targetFile), { recursive: true });
  await fs.writeFile(
    targetFile,
    `
        import React from 'react';
        
        // Предположим, у нас есть простой компонент кнопки
        export const MySimpleButton = ({ onClick, children }) => {
            return <button onClick={onClick}>{children}</button>;
        }
        
        export const MyComponent = () => {
            const handleClick = () => {
                console.log('Button clicked!');
            };
            return (
                <div>
                    <h1>Test Component</h1>
                    <MySimpleButton onClick={handleClick}>Click Me</MySimpleButton>
                </div>
            );
        };
    `
  );

  const sourceCode = await fs.readFile(targetFile, 'utf-8');

  // ---- Формулировка задачи для агента ----
  const task = `
        You are an expert TypeScript testing engineer. Your goal is to write a unit test for a given file.

        **File to Test:** \`${targetFile}\`
        **Test File Path:** \`${testFile}\`

        **File Content:**
        \`\`\`typescript
        ${sourceCode}
        \`\`\`

        **Your step-by-step instructions:**
        1.  **Retrieve Context:** Start by using the \`CodeRetriever\` tool with the path \`${targetFile}\`. This is a mandatory first step to understand all dependencies.
        2.  **Generate Test Code:** Based on the source code and the retrieved context, write a complete unit test using Jest and React Testing Library. The test should be robust and cover the main functionality.
        3.  **Validate:** Use the \`TestValidator\` tool to check your generated test code. Pass the entire code as a string to this tool.
        4.  **Analyze & Iterate:**
            - If validation is successful (\`"success": true\`), proceed to step 5.
            - If validation fails, carefully analyze the error logs returned by the tool. **Rewrite the test code to fix the errors** and go back to step 3 to validate again. Do not give up after one failure. Try to fix it.
        5.  **Save the File:** Once the test is valid, use the \`FileSaver\` tool to save the code. The input for this tool must be a JSON string like this: \`{"path": "${testFile}", "content": "..."}\`.
        6.  **Final Answer:** After saving the file, your final answer should be a confirmation message, for example: "Test successfully created and saved to ${testFile}".

        Start by retrieving the context.
    `;

  // ---- Запуск агента ----
  console.log('🚀 Starting AI Test Agent...');
  const app = await createAgentWorkflow();
  const initialState: { messages: HumanMessage[] } = {
    messages: [new HumanMessage(task)],
  };

  // Потоковая обработка для вывода логов в реальном времени
  for await (const event of await app.stream(initialState, {
    recursionLimit: 15,
  })) {
    const [nodeName, nodeValue] = Object.entries(event)[0];
    console.log(`\n--- Executing Node: ${nodeName} ---`);
    console.log(JSON.stringify(nodeValue, null, 2));
  }

  console.log('\n✅ Agent finished its work.');
}

main().catch(console.error);
```

Этот полный пример решает все поставленные задачи: использует GigaChat, автономно находит контекст через `codeRetrieverTool`, валидирует свою работу и сохраняет результат, работая в цикле до достижения успеха.
