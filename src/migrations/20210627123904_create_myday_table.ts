import * as Knex from 'knex'

const table = 'myday'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(table, t => {
    t.uuid('task_id').primary().notNullable()
    t.string('author_uid').notNullable()

    t.foreign('task_id').references('tasks.id').onDelete('CASCADE')
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(table)
}
