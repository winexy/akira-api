import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common'
import firebase from 'firebase-admin'
import {Request} from 'express'
import * as O from 'fp-ts/lib/Option'
import * as S from 'fp-ts/lib/string'
import {constant, pipe} from 'fp-ts/lib/function'
import {dropLeft} from 'fp-ts-std/String'
import * as TO from 'fp-ts/lib/TaskOption'
import {tap} from 'fp-ts-std/IO'

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest()
    const auth = firebase.auth()

    const runTask = pipe(
      this.extractToken(request),
      TO.fromOption,
      TO.chain(this.verifyToken(auth)),
      TO.map(idToken => idToken.email),
      TO.filter(S.isString),
      TO.chain(this.getUserByEmail(auth)),
      TO.chainFirstIOK(
        tap(user => () => {
          request.user = user
        })
      ),
      TO.match(constant(false), constant(true))
    )

    return runTask()
  }

  private extractToken(request: Request): O.Option<string> {
    const prefix = 'Bearer '

    return pipe(
      request.header('authorization'),
      O.fromPredicate(S.isString),
      O.filter(S.startsWith(prefix)),
      O.map(dropLeft(S.size(prefix)))
    )
  }

  private verifyToken(auth: firebase.auth.Auth) {
    return (token: string) => {
      return TO.tryCatch(() => auth.verifyIdToken(token))
    }
  }

  private getUserByEmail(auth: firebase.auth.Auth) {
    return (email: string) => {
      return TO.tryCatch(() => auth.getUserByEmail(email))
    }
  }
}
