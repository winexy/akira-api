import {Knex} from 'knex'

const table = 'shared_tasks'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(table, t => {
    t.dropForeign('task_id')
    t.foreign('task_id').references('tasks.id').onDelete('CASCADE')
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable(table, t => {
    t.foreign('task_id').references('tasks.id')
  })
}
