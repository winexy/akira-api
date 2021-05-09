import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common'
import firebase from 'firebase-admin'
import {isString} from 'lodash'
import {Request} from 'express'
import {Maybe, just, none} from '@sweet-monads/maybe'

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest()
    const token = this.extractToken(request)

    if (token.isNone()) {
      return false
    }

    const auth = firebase.auth()
    const idToken = await auth.verifyIdToken(token.value)
    const user = await auth.getUserByEmail(idToken.email)

    request.user = user

    return true
  }

  extractToken(request: Request): Maybe<string> {
    const header = request.header('authorization')
    const prefix = 'Bearer '

    if (isString(header) && header.startsWith(prefix)) {
      return just(header.slice(prefix.length))
    }

    return none()
  }
}
