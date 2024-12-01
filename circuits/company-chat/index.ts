import {
  CircuitConfiguration,
  CircuitContext,
  EaCChatPromptNeuron,
  EaCDocumentsAsStringNeuron,
  EaCRetrieverNeuron,
} from '@fathym/synaptic';
import { CompanyChatGraphState } from '../../src/circuits/company-chat/CompanyChatGraphState.ts';
import SynapticPlugin from '../../src/plugins/SynapticPlugin.ts';

export const Configure: CircuitConfiguration<'Linear'> = (
  ctx: CircuitContext
) => {
  return {
    Type: 'Linear',
    Neurons: {
      State: '$pass',
      Context: {
        Type: 'ChatPrompt',
        PersonalityLookup: `${SynapticPlugin.name}|RAG:History`,
        Neurons: {
          '': `llm:string`,
        },
        Synapses: {
          '': {
            Type: 'Retriever',
            RetrieverLookup: `company-chat:rag|company-chat`,
            Neurons: {
              '': {
                Type: 'DocumentsAsString',
              } as EaCDocumentsAsStringNeuron,
            },
          } as EaCRetrieverNeuron,
        },
      } as EaCChatPromptNeuron,
    },
    Synapses: {
      '': {
        Type: 'ChatPrompt',
        BootstrapInput(input: {
          State: CompanyChatGraphState;
          Context: string;
        }) {
          return {
            ...input.State,
            Context: input.Context,
          };
        },
        PersonalityLookup: `${SynapticPlugin.name}|Employee:RAG`,
        Neurons: {
          '': `llm`,
        },
      } as EaCChatPromptNeuron,
    },
    BootstrapOutput<BaseMessage, CompanyChatGraphState>(msg: BaseMessage) {
      return {
        Messages: [msg],
      } as CompanyChatGraphState;
    },
  };
};
