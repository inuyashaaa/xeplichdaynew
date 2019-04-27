
exports.up = function (knex, Promise) {
  return knex.schema.createTable('lop', function (table) {
    table.increments()
    table.string('name')
    table.string('khoahoc')
    table.string('buoihoc')
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('lop')
}
