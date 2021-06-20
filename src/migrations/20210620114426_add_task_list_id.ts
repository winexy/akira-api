import * as Knex from 'knex'

const table = 'tasks'
export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(table, t => {
    t.integer('list_id').defaultTo(null)

    t.foreign('list_id').references('task_lists.id').onDelete('SET DEFAULT')
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable(table, t => {
    t.dropColumn('list_id')
  })
}
