import {Knex} from 'knex'

const table = 'checklist'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(table, t => {
    t.increments()
    t.string('title').notNullable()
    t.uuid('task_id').notNullable()
    t.boolean('is_completed').defaultTo(false)

    t.foreign('task_id').references('tasks.id').onDelete('CASCADE')
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(table)
}
