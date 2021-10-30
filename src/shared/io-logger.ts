import {Logger} from '@nestjs/common'
import {IO} from 'fp-ts/lib/IO'

export class IOLogger {
  private logger: Logger

  private constructor(context: string) {
    this.logger = new Logger(context)
  }

  static of(context: string) {
    return new IOLogger(context)
  }

  log(...args: Parameters<typeof Logger['log']>): IO<void> {
    return () => this.logger.log(...args)
  }

  error(...args: Parameters<typeof Logger['error']>): IO<void> {
    return () => this.logger.error(...args)
  }

  debug(...args: Parameters<typeof Logger['debug']>): IO<void> {
    return () => this.logger.debug(...args)
  }
}
