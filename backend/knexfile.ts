// For more information about this file see https://dove.feathersjs.com/guides/cli/databases.html
import { app } from './src'

// Load our database connection info from the app configuration
const config = {
  ...app.get('postgresql'),
  migrations: {
    directory: 'migrations',
    extension: 'js'
  }
}

module.exports = config
