var app = angular.module('angularjsNodejsTutorial', []);

// Login Controller
app.controller('loginController', function($scope, $http) {
  $scope.verifyLogin = function() {
    // To check in the console if the variables are correctly storing the input:
    // console.log($scope.username, $scope.password);

    var request = $http({
      url: '/login',
      method: "POST",
      data: {
        'username': $scope.username,
        'password': $scope.password
      }
    })

    request.success(function(response) {
      // success
      console.log(response);
      if (response.result === "success") {
        // After you've written the INSERT query in routes/index.js, uncomment the following line
        window.location.href = "http://localhost:8081/dashboard"
      }
    });
    request.error(function(err) {
      // failed
      console.log("error: ", err);
    });

  };
});


// Dashboard Controller
app.controller('DashBoardController', function($scope, $http) {  
  // Show all users
  $scope.users = {};
  $scope.message="";
  console.log("controller");
    var request = $http({
      url: '/showAllUsers',
      method: "GET",
      data: {}
    });

    request.success(function(response){
      $scope.users = response;
    });
    
    request.error(function(err) {
      console.log("error: ", err);
    });

    // show all movie genres
    var genreRequest = $http({
      url: '/showAllGenres',
      method: "GET",
      data: {}
    });

    genreRequest.success(function(response){
      $scope.genres = response;
    });
    
    genreRequest.error(function(err) {
      console.log("error: ", err);
    });

    // function to show top movies by genre
    $scope.showMovies = function(genre){
    
    var ShowTopRequest = $http({
      url: '/showTopMovies/' + genre,
      method: "GET"
    });
    
    ShowTopRequest.success(function(response){
      $scope.showTab = true;
      $scope.genre = genre;
      // assig the top 10 movies to the table cells of top movies within the genre
      $scope.topMovies = response.slice( 0, Math.min(response.length,10) );
    }); 
    
    ShowTopRequest.error(function(err){
      console.log("show top movie by genre error: ", err);
    }); 
    };
}); 


  // Recommendations Controller
  app.controller('RecController', function($scope, $http) {
  $scope.rec = function() {
    console.log($scope.movieId);
    
    var request = $http({
      url: '/rec/' + $scope.movieId,
      method: "GET"
    })
    
    request.success(function(response) {
      console.log('res len = ',response.length);
      $scope.showHeader = true;
      $scope.recResults = response;
      if(response.length >= 1){
         $scope.recResults = response;
      }
    });

    request.error(function(err) {
      console.log("recommendation error: ", err);
    });
  };
});


// Best Of Page Controller
app.controller('BOController', function($scope, $http) {
    // Get 2000 - 2017 menu
    $scope.years = {};
    var request = $http({
      url: '/getyear',
      method: "GET",
      data: {} 
    });
    
    request.success(function(response){
      $scope.years = response;
    });
    
    request.error(function(err) {
      console.log("error: ", err);
    });

    
    // function: Top movies in each genre of selected year
    $scope.showBests = function(){
      var ShowBestRequest = $http({
        url: '/showBests/' + $scope.yearSelected,
        method: "GET"
      });
    
      ShowBestRequest.success(function(response){
        $scope.showBestOf = true; 
        $scope.bests = response;
      }); 
    
    ShowBestRequest.error(function(err){
      console.log("show bests error: ", err);
    }); 
    };
});



// Posters Controller
app.controller('PostersController', function($scope, $http) {
  var pickedId = [];
  var omdbId= []

  // Get 12 random imdb_ids from Movies.
  var requestId = $http({
    url: '/pickIds',
    method: "GET",
    data: {}
  });
  
  requestId.success(function(response){
    $scope.picked = response;
    pickedId = response;
    for(var i = 0; i < 12; i++){
      omdbId.push(pickedId[i].imdb_id);
    }
    console.log(omdbId);

    // Fetch omdb data
    $scope.re = [];
    
    for(var i = 0; i<12; i++){
      var request = $http({ 
        //url: 'https://www.omdbapi.com/?i=' + omdbId[i] + '&type=movie&r=json&apikey=c77a9a92',
        url: 'https://www.omdbapi.com/?i=' + omdbId[i] + '&type=movie&r=json&apikey=b2e0d4af',
        method: "GET",
        data: {} 
      });

      request.success(function(response){
        omdbObj = response;
        //console.log(response);
        $scope.re.push(omdbObj);
      });
       
      request.error(function(err) {
        console.log("error: ", err);
      });
    }
    console.log($scope.re);
  });  
  
  requestId.error(function(err) {
    console.log("error: ", err);
  });
  
});



// Template for adding a controller
/*
app.controller('dummyController', function($scope, $http) {
  // normal variables
  var dummyVar1 = 'abc';

  // Angular scope variables
  $scope.dummyVar2 = 'abc';

  // Angular function
  $scope.dummyFunction = function() {

  };
});
*/
