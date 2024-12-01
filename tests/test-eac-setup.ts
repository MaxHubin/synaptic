import {
  buildEaCTestIoC,
  EaCRuntimePlugin,
  EverythingAsCode,
  EverythingAsCodeSynaptic,
} from './tests.deps.ts';
import MyCoreRuntimePlugin from '../src/plugins/MyCoreRuntimePlugin.ts';

export const AI_LOOKUP = 'core';

const testEaC = {} as EverythingAsCodeSynaptic;

export async function buildTestIoC(
  eac: EverythingAsCode,
  plugins: EaCRuntimePlugin[] = [new MyCoreRuntimePlugin()],
  useDefault = true,
  useDefaultPlugins = false,
) {
  return await buildEaCTestIoC(
    useDefault ? testEaC : {},
    eac,
    plugins,
    useDefaultPlugins,
  );
}
