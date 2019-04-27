exports.up = function (knex, Promise) {
  return knex.schema.createTable('xrandom2', function (table) {
    table.increments()
    table.text('value')
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('xrandom2')
}
