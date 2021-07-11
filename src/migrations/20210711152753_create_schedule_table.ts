import * as Knex from 'knex'

const table = 'scheduled_tasks'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(table, t => {
    t.increments()
    t.uuid('task_id').notNullable()
    t.date('date').notNullable()

    t.foreign('task_id').references('tasks.id').onDelete('CASCADE')
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(table)
}
