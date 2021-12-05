import {Knex} from 'knex'

const table = 'tasks'
export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(table, t => {
    t.date('due_date').defaultTo(null)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable(table, t => {
    t.dropColumn('due_date')
  })
}
