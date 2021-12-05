import {Knex} from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', t => {
    t.string('uid').notNullable()
    t.string('email').notNullable()
    t.string('display_name')
    t.string('fcm_token')
    t.unique(['uid'])
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users')
}
