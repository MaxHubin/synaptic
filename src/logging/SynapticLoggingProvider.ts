import { LoggingProvider } from '@fathym/common/log';
import { ConsoleHandler, LevelName, Logger, LoggerConfig } from '@std/log';

export class SynapticLoggingProvider extends LoggingProvider {
  public get Default(): Logger {
    return this.LoggerSync();
  }

  public get Runtime(): Logger {
    return this.LoggerSync(undefined, true);
  }

  constructor() {
    const loggingPackages = [
      '@fathym/common',
      '@fathym/common/build',
      '@fathym/common/deno-kv',
      '@fathym/common/path',
      '@fathym/eac',
      '@fathym/eac-api/client',
      '@fathym/eac-api/status',
      '@fathym/eac-runtime',
      '@fathym/synaptic',
      '@fathym/atomic-icons',
    ];

    super(import.meta, {
      handlers: {
        console: new ConsoleHandler('DEBUG'),
      },
      loggers: {
        default: {
          level: (Deno.env.get('LOGGING_DEFAULT_LEVEL') as LevelName) ?? 'DEBUG',
          handlers: ['console'],
        },

        '@ai-hunters/synaptic-runtime': {
          level: (Deno.env.get('LOGGING_DEFAULT_LEVEL') as LevelName) ?? 'DEBUG',
          handlers: ['console'],
        },

        ...loggingPackages.reduce((acc, name) => {
          const logLevelName = Deno.env.get('LOGGING_PACKAGE_LEVEL') ??
            Deno.env.get('LOGGING_DEFAULT_LEVEL') ??
            'DEBUG';

          acc[name] = {
            level: logLevelName as LevelName,
            handlers: ['console'],
          };
          return acc;
        }, {} as Record<string, LoggerConfig>),
      },
    });
  }
}
