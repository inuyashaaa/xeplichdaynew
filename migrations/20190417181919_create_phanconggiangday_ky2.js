
exports.up = function (knex, Promise) {
  return knex.schema.createTable('phanconggiangday2', function (table) {
    table.increments()
    table.integer('idmonhoc')
    table.integer('idgiangvien')
    table.integer('idlop')
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('phanconggiangday2')
}
