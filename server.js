var express = require('express');
var mysql = require('mysql');
var app = express();
var fs = require("fs");
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer(); // for parsing multipart/form-data

/*var connection = mysql.createConnection({
  host : 'localhost',
  port : 8889,
  database : 'test',
  user : 'root',
  password : 'root'
});*/

app.use(express.static('public'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', function(req, res){
	res.redirect("/home");
});

app.get('/getBooks', function (req, res) {

	var connection = createConnection();
    connection.connect();

	connection.query("SELECT * from book", function(err, rows, fields) {
  		if (err) throw err;
  		res.json(rows);
	});

	connection.end();
});

app.get('/getBooks/:filter', function (req, res) {

	console.log('filter='+req.params.filter);
	var connection = createConnection();
    connection.connect();

	connection.query("SELECT * FROM book WHERE name like '%" + req.params.filter + "%'", function(err, rows, fields) {
  		if (err) throw err;
  		res.json(rows);
	});

	connection.end();
});

app.post('/getBooks', upload.array(), function (req, res) {

	var connection = createConnection();
    connection.connect();

	connection.query("SELECT b.*, rating from book b LEFT JOIN my m ON b.id = m.book_id LEFT JOIN rating r ON m.user_id = r.user_id AND m.book_id = r.book_id  WHERE m.user_id='" + req.body.user_id + "'", function(err, rows, fields) {
  		if (err) throw err;
  		res.json(rows);
	});

	connection.end();
});

app.get('/getBook/:bookID', function(req, res) {
  fs.readFile('books/'+ req.params.bookID +'.txt', function (err, data) {
  	if (err) {
  		return console.error(err);
  	}
  	res.send(data.toString());
  });

});

app.get('/book/:bookID', function(req, res) {
  fs.readFile('books/index.html', function (err, data) {
  	if (err) {
  		return console.error(err);
  	}
  	res.send(data.toString());
  });

});

app.post('/buy', upload.array(), function (req, res) {
	var connection = createConnection();
    connection.connect();

    connection.query("INSERT INTO my (`user_id`, `book_id`) VALUES ('" + req.body.user_id + "', '" + req.body.book_id + "'); INSERT INTO rating VALUES (" + req.body.user_id + ", " + req.body.book_id + ", 0)", function(err, rows, fields) {
  		if (err) throw err;
  		res.send('success');
	});
});

app.post('/rate', upload.array(), function (req, res) {
	var connection = createConnection();
    connection.connect();

    connection.query("UPDATE rating SET rating = " + req.body.rate + " WHERE user_id = " + req.body.user_id + " AND book_id = " + req.body.book_id, function(err, rows, fields) {
  		if (err) throw err;
  		res.send('success');
	});
});

app.post('/login', upload.array(), function (req, res) {
	var connection = createConnection();
    connection.connect();

	connection.query("SELECT * from user WHERE name='" + req.body.username + "' AND password='" + req.body.password + "'", function(err, rows, fields) {
  		if (err) throw err;
  		if(rows.length > 0){
  			res.json(rows[0]);
  			console.log('user :' + req.body.username + ' login');
  		}
  		else{
  			res.send('fail');
  		}
	});

	connection.end();
});

app.post('/regis', upload.array(), function (req, res) {

	var connection = createConnection();
    connection.connect();

    connection.query("INSERT INTO user (`name`, `password`, `last_name`) VALUES ('" + req.body.username + "', '" + req.body.password + "', 'noooo')", function(err, rows, fields) {
  		if (err) throw err;
	});

	console.log(req.body.username + ' ' + req.body.password);
	res.json(req.body.username + ' ' + req.body.password);
});

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

});

function createConnection(){
	return mysql.createConnection({
  		host : 'localhost',
  		port : 8889,
  		database : 'test',
  		user : 'root',
  		password : 'root',
  		multipleStatements : true
	});
}