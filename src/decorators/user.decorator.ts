import {createParamDecorator, ExecutionContext} from '@nestjs/common'
import {get, PropertyPath} from 'lodash'

export const User = createParamDecorator(
  (path: PropertyPath, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user

    return path ? get(user, path) : user
  }
)
