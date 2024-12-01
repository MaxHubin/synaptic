import * as _azureSearch from 'npm:@azure/search-documents@12.1.0';
import * as _parse from 'npm:pdf-parse@1.1.1';
import * as _htmlToText from 'npm:html-to-text@9.0.5';
import { DefaultEaCConfig, defineEaCConfig, EaCRuntime } from '@fathym/eac-runtime';
import SynapticRuntimePlugin from '../src/plugins/SynapticRuntimePlugin.ts';
import { SynapticLoggingProvider } from '../src/logging/SynapticLoggingProvider.ts';

export const config = defineEaCConfig({
  LoggingProvider: new SynapticLoggingProvider(),
  Plugins: [...(DefaultEaCConfig.Plugins || []), new SynapticRuntimePlugin()],
});

export function configure(_rt: EaCRuntime): Promise<void> {
  return Promise.resolve();
}
