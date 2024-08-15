import { type Logger } from 'pino'

declare global {
  // eslint-disable-next-line no-var
  var logger: Logger
}
