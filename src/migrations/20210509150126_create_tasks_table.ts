import * as Knex from 'knex'

const tableName = 'tasks'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(tableName, t => {
    t.increments()
    t.string('title').notNullable()
    t.string('author_uid').notNullable()
    t.boolean('is_completed').notNullable().defaultTo(false)
    t.boolean('is_important').notNullable().defaultTo(false)
    t.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tableName)
}
