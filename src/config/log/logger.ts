import { createLogger, format, transports } from 'winston';

export const requestData = {
  requestTraceId: undefined,
};

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
});

if (process.env.NODE_ENV === 'production') {
  //   const newrelicFormatter = require('@newrelic/winston-enricher');
  //   logger.clear().add(
  //     new transports.Console({
  //       format: format.combine(
  //         format.splat(),
  //         format((info) => {
  //           if (requestData.requestTraceId) {
  //             info['requestTraceId'] = requestData.requestTraceId;
  //           }
  //           return info;
  //         })(),
  //         newrelicFormatter(),
  //       ),
  //     }),
  //   );
} else {
  const customFormat = format.printf((info) => {
    const { level, message } = info;

    return JSON.stringify({
      'entity.type': 'SERVICE',
      hostname: 'localhost',
      level: level,
      message: message,
      timestamp: new Date(),
      requestTraceId: requestData.requestTraceId ?? '',
    });
  });

  // TODO: project label
  const projectLabel = '';

  logger.clear().add(
    new transports.Console({
      format: format.combine(
        format.label({ label: projectLabel }),
        format.timestamp(),
        customFormat,
      ),
    }),
  );
}

export default logger;
