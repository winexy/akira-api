import * as Knex from 'knex'

const table = 'recurrences'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(table, t => {
    t.increments()
    t.string('rule').notNullable()
    t.date('next_date').notNullable()
    t.uuid('source_task_id').notNullable()

    t.foreign('source_task_id').references('tasks.id')
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(table)
}
