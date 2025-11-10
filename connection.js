var mysql = require("mysql");
var util = require("util");
var conn = mysql.createConnection({
    "host":"bgbr5xdlqzjt3aaunr10-mysql.services.clever-cloud.com",
    "user":"ux1qgsohvr6zubpy",
    "password":"uObpgxWB2kmFY2ZSQlGg",
    "database":"bgbr5xdlqzjt3aaunr10"
});

var exe = util.promisify(conn.query).bind(conn);

module.exports = exe;
