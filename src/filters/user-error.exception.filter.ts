import {ArgumentsHost, Catch, ExceptionFilter, HttpStatus} from '@nestjs/common'
import {Response} from 'express'

type Params = {
  type: string
  message: string
}

export class UserError {
  private readonly message: string
  private readonly type: string

  static of(params: Params) {
    return new UserError(params)
  }

  constructor(params: Params) {
    this.type = params.type
    this.message = params.message
  }

  toJSON() {
    return {
      type: this.type,
      message: this.message
    }
  }
}

@Catch(UserError)
export class UserErrorFilter implements ExceptionFilter {
  catch(userError: UserError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response: Response = ctx.getResponse()

    response.status(HttpStatus.BAD_REQUEST).json(userError.toJSON())
  }
}
