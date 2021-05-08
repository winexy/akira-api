import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common'
import firebase from 'firebase-admin'
import {get, isString} from 'lodash'
import {Maybe, just, none} from '@sweet-monads/maybe'

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()
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

  extractToken(request: unknown): Maybe<string> {
    const header = get(request, 'headers.authorization')
    const prefix = 'Bearer '

    if (isString(header) && header.startsWith(prefix)) {
      return just(header.slice(prefix.length))
    }

    return none()
  }
}
