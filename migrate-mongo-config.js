require('ts-node/register/transpile-only');
const config = require('./src/config/index').default;

const configMongo = {
  mongodb: {
    url: config.db.uri,
    databaseName: "peppermint-test",

    options: {
    }
  },
  migrationsDir: "migrations",
  changelogCollectionName: "changelog",
  migrationFileExtension: ".js",
  useFileHash: false,
  moduleSystem: 'commonjs',
};

module.exports = configMongo;
