import { EaCRuntimeConfig, EaCRuntimePlugin, EaCRuntimePluginConfig } from '@fathym/eac-runtime';
import {
  EaCAzureOpenAIEmbeddingsDetails,
  EaCAzureOpenAILLMDetails,
  EaCLLMNeuron,
  EaCPassthroughNeuron,
  EaCRecursiveCharacterTextSplitterDetails,
  EaCStringOutputParserNeuron,
  EverythingAsCodeSynaptic,
} from '@fathym/synaptic';
import { MessagesPlaceholder } from '@langchain/core/prompts';

export default class SynapticPlugin implements EaCRuntimePlugin {
  constructor() {}

  public Setup(_config: EaCRuntimeConfig) {
    const pluginConfig: EaCRuntimePluginConfig = {
      Name: SynapticPlugin.name,
      EaC: {
        AIs: {
          [SynapticPlugin.name]: {
            Embeddings: {
              ['azure-openai']: {
                Details: {
                  Type: 'AzureOpenAI',
                  Name: 'Azure OpenAI LLM Embeddings',
                  Description: 'The LLM for interacting with Azure OpenAI.',
                  APIKey: Deno.env.get('AZURE_OPENAI_KEY')!,
                  Instance: Deno.env.get('AZURE_OPENAI_INSTANCE')!,
                  // DeploymentName: 'text-embedding-3-large',
                  DeploymentName: 'text-embedding-ada-002',
                } as EaCAzureOpenAIEmbeddingsDetails,
              },
            },
            LLMs: {
              ['azure-openai']: {
                Details: {
                  Type: 'AzureOpenAI',
                  Name: 'Azure OpenAI LLM',
                  Description: 'The LLM for interacting with Azure OpenAI.',
                  APIKey: Deno.env.get('AZURE_OPENAI_KEY')!,
                  Instance: Deno.env.get('AZURE_OPENAI_INSTANCE')!,
                  DeploymentName: 'gpt-4o',
                  ModelName: 'gpt-4o',
                  Streaming: true,
                  Verbose: false,
                } as EaCAzureOpenAILLMDetails,
              },
            },
            Personalities: {
              [`Employee`]: {
                PersonalityLookups: ['ai-hunters'],
                Details: {
                  SystemMessages: [
                    `You are the most knowledgable AI Hunters employee, not because you already know it all and how to relate your real-world experience to your AI Hunters knowledge, but also because you are willing to take the time to refresh your knowledge on AI Hunters and relate it not to just your real-world experience, but also the context of the user's questions. `,
                  ],
                },
              },
              [`Employee:RAG`]: {
                PersonalityLookups: [`Employee`],
                Details: {
                  SystemMessages: [
                    `Use the following pieces of retrieved context to answer the question. `,
                    `Use five sentences maximum so you can keep the answer concise. `,
                  ],
                  Instructions: [
                    `Make sure to only pull from the context and your experience, otherwise say you don't know or ask clarifying questions.`,
                    `Context:\n{Context}`,
                  ],
                  NewMessages: [new MessagesPlaceholder('Messages')],
                },
              },
              [`RAG:History`]: {
                Details: {
                  SystemMessages: [
                    'Given a chat history and the latest user question which might reference context in the chat history, formulate a standalone question which can be understood without the chat history. Do NOT answer the question, just reformulate it if needed and otherwise return it as is. ',
                  ],
                  Insturctions: [
                    'Never respond to the users questions, only work to provide the question the user is most likely asking.',
                    'If there are no messages between you and the user, do NOT make anything up, just simply KEEP YOUR MOUTH SHUT please, and return an empty message.',
                  ],
                  Messages: [new MessagesPlaceholder('Messages')],
                },
              },
              ['ai-hunters']: {
                Details: {
                  SystemMessages: [
                    `You are Thinky, the user's AI Hunters assistant. `,
                  ],
                  Instructions: [
                    `If you don't know the answer, it is ok to say you don't know and/or to ask clarifying questions.`,
                  ],
                },
              },
            },
            TextSplitters: {
              html: {
                Details: {
                  Type: 'RecursiveCharacter',
                  FromLanguage: 'html',
                  TransformerLookup: 'HtmlToText',
                } as EaCRecursiveCharacterTextSplitterDetails,
              },
            },
          },
        },
        Circuits: {
          $neurons: {
            $pass: {
              Type: 'Passthrough',
            } as EaCPassthroughNeuron,
            '$string-output': {
              Type: 'StringOutputParser',
            } as EaCStringOutputParserNeuron,
            [`llm`]: {
              Type: 'LLM',
              LLMLookup: `${SynapticPlugin.name}|azure-openai`,
            } as EaCLLMNeuron,
            [`llm:string`]: [
              `llm`,
              {
                Neurons: {
                  '': '$string-output',
                },
              } as Partial<EaCLLMNeuron>,
            ],
          },
        },
      } as EverythingAsCodeSynaptic,
    };

    return Promise.resolve(pluginConfig);
  }
}
