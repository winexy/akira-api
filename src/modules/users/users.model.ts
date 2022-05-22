import {f, Infer, required, string} from '@winexy/fuji'
import {Model} from 'objection'

export type UserEntity = {
  uid: UID
  email: string
  display_name: string | null
  fcm_token: string
  created_at: string
  updated_at: string
}

export type PublicUserEntity = {
  uid: UID
  email: string
}

export class UserModel extends Model implements UserEntity {
  uid: string
  email: string
  display_name: string | null
  fcm_token: string
  created_at: string
  updated_at: string

  static tableName = 'users'

  static idColumn = 'uid'
}

export const syncUserMetaSchema = f.shape({
  fcm_token: f(string(), required())
})

export type SyncUserMeta = Infer<typeof syncUserMetaSchema>

export type InsertableUser = Omit<UserEntity, 'created_at' | 'updated_at'>

export const findUserSchema = f.shapeRequired({
  email: f(string(), required())
})

export type FindUserParams = Infer<typeof findUserSchema>
