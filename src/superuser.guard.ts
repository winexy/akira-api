import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common'
import {Request} from 'express'
import * as O from 'fp-ts/lib/Option'
import {constant, pipe} from 'fp-ts/lib/function'
import {ConfigService} from '@nestjs/config'
import {AppConfig} from './env.validation'

@Injectable()
export class SuperUserGuard implements CanActivate {
  constructor(private readonly configService: ConfigService<AppConfig>) {}

  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest()

    const isSuperUser = (user: Request['user']) =>
      user.uid === this.configService.get('SUPERUSER_UID')

    return pipe(
      O.fromNullable(request.user),
      O.map(isSuperUser),
      O.getOrElse(constant(false))
    )
  }
}
