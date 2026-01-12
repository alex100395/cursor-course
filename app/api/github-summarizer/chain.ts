import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

// Strict schema for structured output
export const summarySchema = z.object({
  summary: z.string().describe('A comprehensive summary of the GitHub repository'),
  cool_facts: z.array(z.string()).describe('A list of interesting or notable facts about the repository'),
}).strict();

// Type inference from schema
export type SummaryOutput = z.infer<typeof summarySchema>;

// Function to generate summary using LangChain with strict structured output
export async function generateSummary(readmeContent: string): Promise<SummaryOutput> {
  // Step 1: Initialize the model
  const model = new ChatOpenAI({
    model: 'gpt-4o-mini', // You can change this to 'gpt-4', 'gpt-3.5-turbo', etc.
    temperature: 0.7,
    openAIApiKey: process.env.OPENAI_API_KEY, // Explicitly use env variable
  });

  // Step 2: Bind withStructuredOutput to the model
  const modelWithStructure = model.withStructuredOutput(summarySchema, {
    name: 'github_repository_summary',
    method: 'function_calling', // Use function calling for strict schema enforcement
    strict: true, // Enforce strict schema validation
  });

  // Step 3: Create the prompt template
  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      'You are an expert at analyzing GitHub repositories. Your task is to summarize repositories based on their README content. Always provide a comprehensive summary and at least 3-5 interesting facts about the repository.',
    ],
    [
      'human',
      'Summarize this GitHub repository from this README file content:\n\n{readmeContent}',
    ],
  ]);

  // Step 4: Create the chain with the structured output model
  const chain = prompt.pipe(modelWithStructure);

  // Step 5: Invoke the chain with the readme content
  const result = await chain.invoke({
    readmeContent: readmeContent,
  });

  // Step 6: Validate the result against the schema (extra safety)
  return summarySchema.parse(result);
}
