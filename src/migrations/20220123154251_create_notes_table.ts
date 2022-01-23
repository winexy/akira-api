import {Knex} from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('notes', t => {
    t.uuid('uuid').primary().defaultTo(knex.raw('gen_random_uuid()'))
    t.text('content').defaultTo('')
    t.string('title', 255).defaultTo('Untitled')
    t.string('author_uid').notNullable()
    t.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('notes')
}
