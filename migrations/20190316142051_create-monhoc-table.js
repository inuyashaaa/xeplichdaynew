
exports.up = function (knex, Promise) {
  return knex.schema.createTable('monhoc', function (table) {
    table.increments()
    table.string('mamonhoc')
    table.string('name')
    table.integer('sotinchi')
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('monhoc')
}
