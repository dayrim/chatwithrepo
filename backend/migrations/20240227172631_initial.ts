import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  // Ensure the UUID extension is enabled (PostgreSQL)
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

  // Create users table
  await knex.schema.createTable('users', (table) => {
    // Use UUID for the ID column
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))

    // Add new fields for subscription management
    table.string('subscriptionStatus').defaultTo('inactive').nullable() // e.g., active, inactive, pending
    table.string('subscriptionType').nullable() // e.g., basic, premium
    table.timestamp('subscriptionExpiresAt').nullable() // To track when the subscription needs renewal

    // Optionally, if you want to track the Stripe customer ID for ease of management
    table.string('stripeCustomerId').unique().nullable()

    // Make the existing columns nullable
    table.string('email').unique().nullable()
    table.string('password').nullable()
    table.string('githubId').nullable()
    table.boolean('isAdmin').nullable()
    table.string('geminiApiKey').nullable()
    table.integer('maxTries').defaultTo(0)
    // Add a 'name' column, also nullable
    table.string('name').nullable()

    // Manually add timestamps in camelCase
    table.timestamp('createdAt').defaultTo(knex.fn.now())
    table.timestamp('updatedAt').defaultTo(knex.fn.now())
  })

  // Create chatSessions table
  await knex.schema.createTable('chatSessions', (table) => {
    // Use UUID for the primary key of the chat session
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))

    // Assuming 'title' is a text field
    table.text('title')

    table.text('repositoryPath')

    // Foreign key reference to 'users' table
    table.uuid('userId').references('id').inTable('users').onDelete('CASCADE')

    // Timestamps
    table.timestamp('createdAt').defaultTo(knex.fn.now())
    table.timestamp('updatedAt').defaultTo(knex.fn.now())
  })

  // Create messages table
  await knex.schema.createTable('messages', (table) => {
    // Use UUID for the primary key
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))

    table.text('text')

    table.text('role')
    table.uuid('userId').references('id').inTable('users').onDelete('CASCADE')
    table.uuid('chatSessionId').references('id').inTable('chatSessions').onDelete('CASCADE')

    table.timestamp('createdAt').defaultTo(knex.fn.now())
    table.timestamp('updatedAt').defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  // Drop messages table
  await knex.schema.dropTableIfExists('messages')

  // Drop chatSessions table
  await knex.schema.dropTableIfExists('chatSessions')

  // Drop users table
  await knex.schema.dropTableIfExists('users')
}
