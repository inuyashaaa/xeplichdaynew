const dbConfig = process.env.NODE_ENV === 'production' ? {
  client: 'mysql',
  connection: {
    host: 'us-cdbr-iron-east-03.cleardb.net',
    user: 'be2116ad002a99',
    password: '8cc83443',
    database: 'heroku_0ce804d378ed945'
  }
} : {
  client: 'mysql',
  connection: {
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'xeplich'
  }
}

module.exports = dbConfig
