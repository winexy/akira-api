import * as Knex from 'knex'

const table = 'task_lists'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(table, t => {
    t.increments()
    t.string('title')
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(table)
}