import winston, { createLogger, format, transports } from 'winston'
import util from 'util'
import chalk from 'chalk'

// Define custom log levels if needed
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
}

export const logger = createLogger({
  levels: levels,
  level: 'silly', // Lowest level of log messages to show
  format: format.combine(
    format.colorize({ all: true }), // Colorize the entire message
    format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
    format.printf(({ level, message, timestamp, ...metadata }) => {
      let msg = `${timestamp} [${level}]: ${chalk.white(message)}`
      // Filter out Winston's internal symbols
      const filteredMetadata = Object.keys(metadata).reduce((acc: any, key) => {
        if (key !== 'Symbol(level)' && key !== 'Symbol(splat)') {
          acc[key] = metadata[key]
        }
        return acc
      }, {})
      if (Object.keys(filteredMetadata).length !== 0) {
        // Use util.inspect for metadata, enabling colors
        msg += `${util.inspect(filteredMetadata, { depth: null, colors: true })}`
      }
      return msg
    })
  ),
  transports: [new transports.Console()]
})
