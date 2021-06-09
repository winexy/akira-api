import * as Knex from 'knex'

const table = 'tasks'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(table, t => {
    t.text('description').defaultTo('')
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable(table, t => {
    t.dropColumn('description')
  })
}
