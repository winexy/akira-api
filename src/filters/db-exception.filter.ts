import {ArgumentsHost, Catch, ExceptionFilter} from '@nestjs/common'
import {DBError} from 'db-errors'
import {Response} from 'express'
import {NotFoundError} from 'objection'

@Catch(DBError, NotFoundError)
export class DbExceptionFilter implements ExceptionFilter {
  constructor(private readonly configService: AppConfigService) {}

  catch(exception: DBException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response: Response = ctx.getResponse()
    const status = this.matchStatus(exception)
    const payload = this.getPayload(exception)

    response.status(status).json(payload)
  }

  matchStatus(exception: DBException) {
    if (exception instanceof NotFoundError) {
      return 404
    }

    return 500
  }

  getPayload(exception: DBException) {
    const base = {
      type: exception.name
    }

    const extra =
      this.configService.get('NODE_ENV') === 'development' ? {...exception} : {}

    return {
      ...base,
      ...extra
    }
  }
}
