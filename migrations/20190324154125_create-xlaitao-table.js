exports.up = function (knex, Promise) {
  return knex.schema.createTable('xlaitao', function (table) {
    table.increments()
    table.text('value')
    table.integer('tongngay')
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('xlaitao')
}
