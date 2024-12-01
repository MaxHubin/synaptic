import { InferSynapticState } from '@fathym/synaptic';
import { BaseMessage } from '@langchain/core/messages';
import { Annotation } from '@langchain/langgraph';
import { z, ZodType } from 'zod';

export const CompanyChatGraphState = {
  Messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
};

export type CompanyChatGraphState = InferSynapticState<
  typeof CompanyChatGraphState
>;

export const CompanyChatGraphStateSchema = z.object({
  Messages: z.array(z.instanceof(BaseMessage)),
});

export type CompanyChatGraphStateSchema = z.infer<
  ZodType<typeof CompanyChatGraphStateSchema>
>;
