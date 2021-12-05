import {Knex} from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('tasks', t => {
    t.uuid('source_task_id').defaultTo(null)
    t.foreign('source_task_id').references('tasks.id').onDelete('SET NULL')
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('tasks', t => {
    t.dropColumn('source_task_id')
  })
}
