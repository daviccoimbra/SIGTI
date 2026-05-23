import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  ...(isProduction ? {} : {
    transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
  }),
  serializers: {
    req: (r: Record<string, unknown>) => ({ method: r.method, url: r.url }),
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
  },
});
