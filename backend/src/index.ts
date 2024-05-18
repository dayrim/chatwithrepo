import { app } from './app'
import { logger } from './logger'
import knex, { Knex } from 'knex'

const dbConfig = app.get('postgresql')!

const knexConfig: Knex.Config = {
  ...dbConfig,
  migrations: {
    directory: 'migrations',
    extension: 'js'
  }
}
const db = knex(knexConfig)

db.migrate
  .latest()
  .then(() => {
    logger.info('Migrations are finished')
    const port = app.get('port')
    const host = app.get('host')

    process.on('unhandledRejection', (reason) => logger.error('Unhandled Rejection %O', reason))

    app.listen(port).then(() => {
      logger.info(`Feathers app listening on http://${host}:${port}`)
    })
  })
  .catch((err: any) => {
    logger.error('Error running migrations', err)
    process.exit(1)
  })

export { app }
