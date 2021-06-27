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

  static DUPLICATE = 'duplicate'

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
    if (this.type === UserError.DUPLICATE) {
      return HttpStatus.CONFLICT
    }

    return HttpStatus.BAD_REQUEST
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
