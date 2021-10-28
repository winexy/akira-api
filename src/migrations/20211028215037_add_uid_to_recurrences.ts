import * as Knex from 'knex'

const table = 'recurrences'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(table, t => {
    t.string('author_uid').notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable(table, t => {
    t.dropColumn('author_uid')
  })
}
