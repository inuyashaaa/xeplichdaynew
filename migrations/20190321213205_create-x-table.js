exports.up = function (knex, Promise) {
  return knex.schema.createTable('x', function (table) {
    table.increments()
    table.text('value')
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('x')
}
