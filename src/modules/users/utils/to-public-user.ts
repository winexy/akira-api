import {UserEntity, PublicUserEntity} from '../users.model'

export const toPublicUser = (user: UserEntity): PublicUserEntity => ({
  uid: user.uid,
  email: user.email
})
