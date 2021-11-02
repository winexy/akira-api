import {ArgumentsHost, Catch, ExceptionFilter, HttpStatus} from '@nestjs/common'
import {DBError} from 'db-errors'
import {Response} from 'express'

type Params<Type = string, Meta = Record<string, unknown>> = {
  type: Type
  message: string
  meta?: Meta
}

export enum UserErrorEnum {
  Duplicate = 'duplicate',
  BadRequest = 'bad-request',
  Internal = 'internal',
  NoAccess = 'no-access',
  NotFound = 'not-found',
  DbQuery = 'db-query',
  UnknownDbQuery = 'unknown-db-query'
}

export type DBQueryError = UserError<UserErrorEnum.DbQuery, {reason: DBError}>

export const isDbQueryError = (err: UserError): err is DBQueryError =>
  err.type === UserErrorEnum.DbQuery

export const isUniqueViolation = (error: UserError) => {
  return (
    isDbQueryError(error) && error.meta?.reason.name === 'UniqueViolationError'
  )
}
export class UserError<
  Type extends UserErrorEnum = UserErrorEnum,
  Meta extends Record<string, unknown> = Record<string, unknown>
> {
  private readonly $message: string
  private readonly $type: Type
  private readonly $meta: Meta | null

  static of<
    Type extends UserErrorEnum,
    Meta extends Record<string, unknown> = Record<string, unknown>
  >(params: Params<Type, Meta>) {
    return new UserError(params)
  }

  constructor(params: Params<Type, Meta>) {
    this.$type = params.type
    this.$message = params.message
    this.$meta = params.meta ?? null
  }

  get meta() {
    return this.$meta
  }

  get type() {
    return this.$type
  }

  toJSON() {
    return {
      type: this.$type,
      message: this.$message,
      meta: this.$meta
    }
  }

  getHttpCode() {
    switch (this.$type) {
      case UserErrorEnum.Duplicate:
        return HttpStatus.CONFLICT
      case UserErrorEnum.Internal:
        return HttpStatus.INTERNAL_SERVER_ERROR
      case UserErrorEnum.NoAccess:
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
