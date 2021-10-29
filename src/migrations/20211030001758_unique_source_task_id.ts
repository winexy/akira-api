import * as Knex from 'knex'

const table = 'recurrences'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(table, t => {
    t.unique(['source_task_id'])
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable(table, t => {
    t.dropUnique(['source_task_id'])
  })
}
