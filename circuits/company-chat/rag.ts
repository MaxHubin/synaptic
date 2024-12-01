import {
  CircuitConfiguration,
  CircuitContext,
  EaCAzureSearchAIVectorStoreDetails,
  EaCChatPromptNeuron,
  EaCCheerioWebDocumentLoaderDetails,
  EaCCompoundDocumentLoaderDetails,
  EaCDenoKVIndexerDetails,
  EaCDenoKVSaverPersistenceDetails,
  EaCGraphCircuitDetails,
  lastAiNotHumanMessages,
} from '@fathym/synaptic';
import { AzureAISearchQueryType } from '@langchain/community/vectorstores/azure_aisearch';
import SynapticPlugin from '../../src/plugins/SynapticPlugin.ts';
import {
  CompanyChatGraphState,
  CompanyChatGraphStateSchema,
} from '../../src/circuits/company-chat/CompanyChatGraphState.ts';
import { END, START } from '@langchain/langgraph';
import { BaseMessage, HumanMessage } from '@langchain/core/messages';
import { CompanyChatCircuitInput } from '../../src/circuits/company-chat/CompanyChatCircuitInput.ts';
import { RunnableConfig } from '@langchain/core/runnables';

export const Configure: CircuitConfiguration<'Graph'> = (
  ctx: CircuitContext
) => {
  const AIHuntersCompanyInfoUrls = loadCompanyInfoUrls();

  return {
    AIaC: {
      Indexers: {
        'company-chat': {
          Details: {
            Type: 'DenoKV',
            Name: 'AIHunters',
            Description: 'The AI Hunters document indexer to use.',
            DenoKVDatabaseLookup: 'thinky',
            RootKey: ['Synaptic', 'Indexers', 'CompanyChat'],
          } as EaCDenoKVIndexerDetails,
        },
      },
      Loaders: {
        ...AIHuntersCompanyInfoUrls.reduce((acc, url) => {
          acc[url] = {
            Details: {
              Type: 'CheerioWeb',
              URL: url,
            } as EaCCheerioWebDocumentLoaderDetails,
          };

          return acc;
        }, {} as Record<string, { Details: EaCCheerioWebDocumentLoaderDetails }>),
        ['company-chat']: {
          Details: {
            Type: 'CompoundDocument',
            LoaderLookups: AIHuntersCompanyInfoUrls.map((url) =>
              ctx.AIaCLookup(url)
            ),
          } as EaCCompoundDocumentLoaderDetails,
        },
      },
      Persistence: {
        'company-chat': {
          Details: {
            Type: 'DenoKVSaver',
            DatabaseLookup: 'thinky',
            RootKey: ['Thinky', 'company-chat'],
            CheckpointTTL: 1 * 1000 * 60 * 60 * 24 * 7, // 7 Days
          } as EaCDenoKVSaverPersistenceDetails,
        },
      },
      Retrievers: {
        [`company-chat`]: {
          Details: {
            RefreshOnStart: false,
            LoaderLookups: [ctx.AIaCLookup('company-chat')],
            LoaderTextSplitterLookups: {
              [ctx.AIaCLookup('company-chat')]: ctx.AIaCLookup(
                'html',
                SynapticPlugin.name
              ),
            },
            IndexerLookup: ctx.AIaCLookup('company-chat'),
            VectorStoreLookup: ctx.AIaCLookup('company-chat'),
          },
        },
      },
      VectorStores: {
        ['company-chat']: {
          Details: {
            Type: 'AzureSearchAI',
            Name: 'Azure Search AI',
            Description:
              'The Vector Store for interacting with Azure Search AI.',
            APIKey: Deno.env.get('AZURE_AI_SEARCH_KEY')!,
            Endpoint: Deno.env.get('AZURE_AI_SEARCH_ENDPOINT')!,
            EmbeddingsLookup: ctx.AIaCLookup(
              'azure-openai',
              SynapticPlugin.name
            ),
            IndexerLookup: ctx.AIaCLookup('company-chat'),
            IndexName: 'company-chat',
            QueryType: AzureAISearchQueryType.SimilarityHybrid,
          } as EaCAzureSearchAIVectorStoreDetails,
        },
      },
    },
    Type: 'Graph',
    Name: 'RAG Chat',
    Description:
      'This circuit is used to have conversation about AI Hunters and all its capabilities.',
    IsCallable: true,
    PersistenceLookup: ctx.AIaCLookup('company-chat'),
    InputSchema: CompanyChatCircuitInput,
    State: CompanyChatGraphState,
    BootstrapInput({ Input }: CompanyChatCircuitInput) {
      return {
        Messages: Input ? [new HumanMessage(Input)] : [],
      };
    },
    Neurons: {
      chat: 'company-chat',
      welcome: {
        Type: 'ChatPrompt',
        PersonalityLookup: `${SynapticPlugin.name}|Employee`,
        SystemMessage: `Greet the user, and let them know you can help answer any AI Hunters related questions. `,
        NewMessages: [new HumanMessage('Hi')],
        Neurons: {
          '': `llm`,
        },
        BootstrapOutput(msg: BaseMessage) {
          return {
            Messages: [msg],
          } as CompanyChatGraphState;
        },
      } as EaCChatPromptNeuron,
    },
    Edges: {
      [START]: {
        Node: {
          chat: 'chat',
          welcome: 'welcome',
          [END]: END,
        },
        Condition(state: CompanyChatGraphState, cfg: RunnableConfig) {
          const lastAiMsgs = lastAiNotHumanMessages(state.Messages);

          if (cfg?.configurable?.peek || lastAiMsgs?.length) {
            return END;
          }

          if (!state.Messages?.length) {
            return 'welcome';
          }

          return 'chat';
        },
      },
      welcome: END,
      chat: END,
    },
  } as EaCGraphCircuitDetails;
};

function loadCompanyInfoUrls() {
  return [
    'https://aihunters.com/',
    'https://aihunters.com/services/',
    'https://aihunters.com/technology/',
    'https://aihunters.com/company/',
    'https://aihunters.com/company/about/',
    'https://aihunters.com/company/contact/',
    'https://cognitivemill.com/',
    'https://cognitivemill.com/solutions/',
    'https://cognitivemill.com/solutions/#ott',
    'https://cognitivemill.com/solutions/automated-movie-trailers/',
    'https://cognitivemill.com/solutions/end-credits-detection/',
    'https://cognitivemill.com/solutions/metadata-recognition/',
    'https://cognitivemill.com/solutions/automated-nudity-filtering/',
    'https://cognitivemill.com/solutions/automated-subtitle-generation/',
    'https://cognitivemill.com/solutions/#advertising',
    'https://cognitivemill.com/solutions/video-ad-detection/',
    'https://cognitivemill.com/solutions/video-ad-insertion/',
    'https://cognitivemill.com/solutions/logo-detection/',
    'https://cognitivemill.com/solutions/#sports',
    'https://cognitivemill.com/solutions/sports-highlights/',
    'https://cognitivemill.com/solutions/esports-highlights/',
    'https://cognitivemill.com/solutions/#promotion',
    'https://cognitivemill.com/solutions/video-clipping/',
    'https://cognitivemill.com/solutions/automated-video-summarization/',
    'https://cognitivemill.com/solutions/video-cropping/',
    'https://cognitivemill.com/products/',
    'https://cognitivemill.com/about/',
    'https://klipmeapp.com/',
    'https://klipmeapp.com/how-it-works',
  ];
}
