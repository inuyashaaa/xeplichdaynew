module.exports = {
  development: {
    client: 'mysql',
    connection: {
      host: '127.0.0.1',
      user: 'root',
      password: '12345678',
      database: 'xeplich'
    }
  },
  staging: {
    client: 'mysql',
    connection: {
      host: '127.0.0.1',
      user: 'root',
      password: '12345678',
      database: 'xeplich'
    }
  },
  production:
    {
      client: 'mysql',
      connection: {
        host: 'us-cdbr-iron-east-03.cleardb.net',
        user: 'be2116ad002a99',
        password: '8cc83443',
        database: 'heroku_0ce804d378ed945'
      }
    }
}
