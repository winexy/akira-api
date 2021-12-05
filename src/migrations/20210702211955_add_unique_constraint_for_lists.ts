import {Knex} from 'knex'

const table = 'task_lists'
export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(table, t => {
    t.unique(['author_uid', 'title'])
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable(table, t => {
    t.dropUnique(['author_uid', 'title'])
  })
}
