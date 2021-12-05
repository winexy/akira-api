import {Knex} from 'knex'

const table = 'tags'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(table, t => {
    t.increments()
    t.string('uid').notNullable()
    t.string('name', 60).notNullable()
    t.string('hex_bg', 7).notNullable()
    t.string('hex_color', 7).notNullable()
    t.unique(['uid', 'name'])
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('tags')
}
