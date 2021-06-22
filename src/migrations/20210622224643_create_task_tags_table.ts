import * as Knex from 'knex'

const table = 'tasks_tags'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(table, t => {
    t.increments()
    t.uuid('task_id').notNullable()
    t.integer('tag_id').notNullable()

    t.unique(['task_id', 'tag_id'])

    t.foreign('tag_id').references('tags.id').onDelete('CASCADE')
    t.foreign('task_id').references('tasks.id').onDelete('CASCADE')
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(table)
}
