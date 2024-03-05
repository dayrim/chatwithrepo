import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  // Ensure the UUID extension is enabled (PostgreSQL)
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

  await knex.schema.createTable('chatSession', (table) => {
    // Use UUID for the primary key of the chat session
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))

    // Assuming 'title' is a text field
    table.text('title')

    // Foreign key reference to 'users' table
    table.uuid('userId').references('id').inTable('users').onDelete('CASCADE')

    // Timestamps
    table.timestamp('createdAt').defaultTo(knex.fn.now())
    table.timestamp('updatedAt').defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('chatSession')
}
