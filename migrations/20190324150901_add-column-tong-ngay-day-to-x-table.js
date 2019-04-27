exports.up = function (knex, Promise) {
  return knex.schema.alterTable('x', function (table) {
    table.integer('tongngay')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('x', function (table) {
    table.dropColumn('tongngay')
  })
}
