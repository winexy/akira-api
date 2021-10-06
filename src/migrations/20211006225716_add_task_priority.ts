import * as Knex from 'knex'

const table = 'tasks'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(table, t => {
    t.enum('priority', ['low', 'medium', 'high', 'critical']).defaultTo(
      'medium'
    )
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable(table, t => {
    t.dropColumn('priority')
  })
}
