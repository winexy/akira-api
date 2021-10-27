import * as Knex from 'knex'

const table = 'tasks'
export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(table, t => {
    t.integer('recurrence_id').defaultTo(null)
    t.foreign('recurrence_id').references('recurrences.id').onDelete('SET NULL')
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable(table, t => {
    t.dropColumn('recurrence_id')
  })
}
