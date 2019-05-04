var express = require('express');
var router = express.Router();
var path = require('path');

// Connect string to MySQL
var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'fling.seas.upenn.edu',
  user: 'fts',
  password: 'ftt282210',
  database: 'fts'
});

connection.connect(function(err) {
  if (err) {
    console.log("Error Connection to DB" + err);
    return;
  }
  console.log("Connection established...");
});

/* GET home page. */
router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'login.html'));
});

router.get('/dashboard', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'dashboard.html'));
});

router.get('/reference', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'reference.html'));
});

router.get('/recommendations', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'recommendations.html'));
});

router.get('/bestof', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'bestof.html'));
});

router.get('/posters', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'posters.html'));
});


// To add a new page, use the templete below
/*
router.get('/routeName', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'fileName.html'));
});
*/

// Login uses POST request
router.post('/login', function(req, res) {
  // use console.log() as print() in case you want to debug, example below:
  // console.log(req.body); will show the print result in your terminal

  // req.body contains the json data sent from the loginController
  // e.g. to get username, use req.body.username

  var query = "INSERT IGNORE INTO User VALUES('" + req.body.username + "','" + req.body.password + "');"; 
  /* Write your query here and uncomment line 21 in javascripts/app.js*/
  
  connection.query(query, function(err, rows, fields) {
    console.log("rows", rows);
    console.log("fields", fields);
    if (err) console.log('insert error: ', err);
    else {
      res.json({
        result: 'success'
      });
    }
  });
});

// get all the user info
router.get('/showAllUsers', function(req, res) {
  var query = "SELECT DISTINCT * FROM User;"; 
  connection.query(query, function(err, rows, fields) {
    if (err) console.log('get user info error: ', err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});

// Dashboard: show movie genres
router.get('/showAllGenres', function(req, res) {
  var query = "SELECT DISTINCT genre FROM Genres;";
  connection.query(query, function(err, rows, fields) {
    if (err) console.log('get genres error: ', err);
    else {
      // console.log(rows);
      res.json(rows);
    }
  });
});

// Dashboard: show top 10 moives of clicked genre 
router.get('/showTopMovies/:genre', function(req, res) {
  console.log(req.params.genre);
  var query = "SELECT DISTINCT title, rating, vote_count as votes FROM Movies M, Genres G WHERE G.genre='" + req.params.genre + "' AND G.movie_id=M.id ORDER BY rating DESC, votes DESC LIMIT 10;"; 
  connection.query(query, function(err, rows, fields) {
    if (err) console.log('get top movies error: ', err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});

// Recommendation Page
router.get('/rec/:movieId', function(req, res) {
  // Fetch genres of given movie id
  var key = req.params.movieId;
  var query = "SELECT DISTINCT genre FROM Genres G WHERE G.movie_id=\"" + key + "\";";
  connection.query(query, function(err, rows, fields) {
    
    if (err) {
      console.log('get recommendations error: ', err);
    }
    
    else {
      // rows contain the genres of the movie with id=key
      console.log("movie has", rows.length, "genres");
      
      // Get 10 recommendations that cover all genres.
      var results = [];
      var size = rows.length;
      var lim = Math.floor( 10 / Math.min(rows.length,10) );
      var re = 10 - (lim * Math.min(rows.length,10));
      
      for(var i = 0; i < Math.min(rows.length - 1,10); i++){
        query = "SELECT title, genre " + 
                "FROM Movies M, Genres G " + 
                "WHERE M.id=G.movie_id AND M.id<>\"" + key + "\" AND G.genre=\"" + rows[i].genre + "\" " + 
                "ORDER BY RAND() " + 
                "LIMIT " + lim + ";";
        
        connection.query(query, function(err,rows,fields){
          if (err){
            response.send({err:err});
          }
          for (var j in rows){
            results.push(rows[j]);
          }
        });
      }

      var lastGenre = re + lim;
      query2 = "SELECT title, genre " + 
      "FROM Movies M, Genres G " + 
      "WHERE M.id=G.movie_id AND M.id<>\"" + key + "\" AND G.genre=\"" + rows[rows.length - 1].genre + "\" " + 
      "ORDER BY RAND() " + 
      "LIMIT " + lastGenre + ";";
      console.log("lastGenre:", rows[rows.length - 1].genre);
      connection.query(query2, function(err,rows,fields){
        if (err){
          response.send({err:err});
        }
        for(var k = 0; k < rows.length; k++){
          results.push(rows[k]);
        }
        //console.log(rows);
        res.json(results);
        console.log(results);
      });
      console.log('success');
    }
  });
});


// Best Of Page: Year Menu
router.get('/getYear', function(req, res) {
  var query = "SELECT DISTINCT release_year FROM Movies WHERE (release_year < 2018 AND release_year > 1999)" +
              "ORDER BY release_year;";
  
  connection.query(query, function(err, rows, fields) {
    if (err) console.log('get years error: ', err);
    
    else {
      // console.log(rows);
      res.json(rows);
    }
  });  
});

// Best Of Page: Get top voted moives of selected year 
router.get('/showBests/:yearSelected', function(req, res) {
  console.log(req.params.yearSelected);
  
  var query = "SELECT DISTINCT G.genre, MY.title, MAX(MY.vote_count) AS votes"+
              " FROM (SELECT * FROM Movies WHERE release_year = '"+ req.params.yearSelected + "')AS MY"+
              " LEFT OUTER JOIN Genres G ON G.movie_id = MY.id GROUP BY G.genre;";

  connection.query(query, function(err, rows, fields) {
    if (err) console.log('get movies by year error: ', err);
    else { 
      console.log(rows);
      res.json(rows);
    }
  });
});


// Poster : show 12 movies
router.get('/pickIds', function(req, res) {
  var query = "SELECT DISTINCT imdb_id, title FROM Movies ORDER BY RAND() LIMIT 12;"; 
  connection.query(query, function(err, rows, fields) {
    if (err) console.log('get posters error: ', err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});




// template for GET requests
/*
router.get('/routeName/:customParameter', function(req, res) {

  var myData = req.params.customParameter;    // if you have a custom parameter
  var query = '';

  // console.log(query);

  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      res.json(rows);
    }
  });
});
*/

module.exports = router;
