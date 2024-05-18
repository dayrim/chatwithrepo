/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // Ensure the UUID extension is enabled (PostgreSQL)
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

  // Create users table
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    table.string('subscriptionStatus').defaultTo('inactive').nullable() // e.g., active, inactive, pending
    table.string('subscriptionType').nullable() // e.g., basic, premium
    table.timestamp('subscriptionExpiresAt').nullable() // To track when the subscription needs renewal
    table.string('stripeCustomerId').unique().nullable()
    table.string('email').unique().nullable()
    table.string('password').nullable()
    table.string('githubId').nullable()
    table.boolean('isAdmin').nullable()
    table.string('geminiApiKey').nullable()
    table.integer('maxTries').defaultTo(0)
    table.string('name').nullable()
    table.timestamp('createdAt').defaultTo(knex.fn.now())
    table.timestamp('updatedAt').defaultTo(knex.fn.now())
  })

  // Create repositories table
  await knex.schema.createTable('repositories', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    table.string('domain').notNullable()
    table.string('provider').notNullable()
    table.string('repoName').notNullable()
    table.uuid('userId').references('id').inTable('users').onDelete('CASCADE')
    table.timestamp('createdAt').defaultTo(knex.fn.now())
    table.timestamp('updatedAt').defaultTo(knex.fn.now())
  })

  // Create repositoryFiles table
  await knex.schema.createTable('respoitoryFiles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    table.string('filePath').notNullable()
    table.string('googleFileUrl').nullable()
    table.string('googleFileName').nullable()
    table.string('sha256Hash').nullable()
    table.timestamp('expirationTime').nullable()
    table.uuid('repositoryId').references('id').inTable('repositories').onDelete('CASCADE')
    table.timestamp('createdAt').defaultTo(knex.fn.now())
    table.timestamp('updatedAt').defaultTo(knex.fn.now())
  })

  // Create chatSessions table
  await knex.schema.createTable('chatSessions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    table.text('title')
    table.uuid('repositoryId').references('id').inTable('repositories').onDelete('SET NULL')
    table.uuid('userId').references('id').inTable('users').onDelete('CASCADE')
    table.timestamp('createdAt').defaultTo(knex.fn.now())
    table.timestamp('updatedAt').defaultTo(knex.fn.now())
  })

  // Create messages table
  await knex.schema.createTable('messages', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    table.text('text')
    table.text('role')
    table.uuid('userId').references('id').inTable('users').onDelete('CASCADE')
    table.uuid('chatSessionId').references('id').inTable('chatSessions').onDelete('CASCADE')
    table.timestamp('createdAt').defaultTo(knex.fn.now())
    table.timestamp('updatedAt').defaultTo(knex.fn.now())
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('respoitoryFiles')
  await knex.schema.dropTableIfExists('repositories')
  await knex.schema.dropTableIfExists('messages')
  await knex.schema.dropTableIfExists('chatSessions')
  await knex.schema.dropTableIfExists('users')
}
