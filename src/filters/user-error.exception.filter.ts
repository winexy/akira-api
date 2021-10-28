import {ArgumentsHost, Catch, ExceptionFilter, HttpStatus} from '@nestjs/common'
import {Response} from 'express'

type Params = {
  type: string
  message: string
  meta?: Record<any, unknown>
}

export class UserError {
  private readonly message: string
  private readonly type: string
  private readonly meta: Record<any, unknown> | null

  static Duplicate = 'duplicate'
  static BadRequest = 'bad-request'
  static Internal = 'internal'
  static NoAccess = 'no-access'
  static NotFound = 'not-found'
  static DbQuery = 'db-query'
  static UnknownDbQuery = 'unknown-db-query'

  static of(params: Params) {
    return new UserError(params)
  }

  constructor(params: Params) {
    this.type = params.type
    this.message = params.message
    this.meta = params.meta ?? null
  }

  toJSON() {
    return {
      type: this.type,
      message: this.message,
      meta: this.meta
    }
  }

  getHttpCode() {
    switch (this.type) {
      case UserError.Duplicate:
        return HttpStatus.CONFLICT
      case UserError.Internal:
        return HttpStatus.INTERNAL_SERVER_ERROR
      case UserError.NoAccess:
        return HttpStatus.FORBIDDEN
      default:
        return HttpStatus.BAD_REQUEST
    }
  }
}

@Catch(UserError)
export class UserErrorFilter implements ExceptionFilter {
  catch(userError: UserError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response: Response = ctx.getResponse()

    response.status(userError.getHttpCode()).json(userError.toJSON())
  }
}
