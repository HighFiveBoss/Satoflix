import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
//import pg from "pg";
import sqlite3 from 'sqlite3';

const app = express();
const port = 3000;
const APIKey0 = 'e0aa5baafamshba73e975ca7ffdcp19f192jsneed6227668f7';
const APIKey1 = '42c5decb58msh74886a334bd2607p10ef77jsna37889a6a2ce';

/*
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "Satoflixdb",
    password: "salihkara",
    port: 5432,
  });
db.connect();  
*/

const lite = new sqlite3.Database('satoflix.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connect to SQLite database');
  }
});


let user;
let idArray = [];
let login = false;

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;
const currentDay = currentDate.getDate();

const date = currentDay + "-" + currentMonth + "-" + currentYear;


app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

async function getUpcomingMovies(limit = 20) {
  const today = new Date();
  const options = {
    method: 'GET',
    url: 'https://imdb8.p.rapidapi.com/title/get-coming-soon-movies',
    params: {
      homeCountry: 'US',
      purchaseCountry: 'US',
      currentCountry: 'US',
      today: today.toISOString().slice(0, 10)
    },
    headers: {
      'X-RapidAPI-Key': APIKey1,
      'X-RapidAPI-Host': 'imdb8.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    return response.data.slice(0, limit);
  } catch (error) {
    console.error(error);
  }
}

async function getTopRatedMovies(limit = 20) {

  const options = {
    method: 'GET',
    url: 'https://imdb8.p.rapidapi.com/title/get-top-rated-movies',
    headers: {
      'X-RapidAPI-Key': APIKey1,
      'X-RapidAPI-Host': 'imdb8.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    return response.data.slice(0, limit);
  } catch (error) {
    console.error(error);
  }
}

async function getTopRatedSeries(limit = 20) {

  const options = {
    method: 'GET',
    url: 'https://imdb8.p.rapidapi.com/title/get-top-rated-tv-shows',
    headers: {
      'X-RapidAPI-Key': APIKey1,
      'X-RapidAPI-Host': 'imdb8.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    return response.data.slice(0, limit);
  } catch (error) {
    console.error(error);
  }
}

async function getDetails(id) {
  const options = {
    method: 'GET',
    url: 'https://movie-database-alternative.p.rapidapi.com/',
    params: {
      r: 'json',
      i: id
    },
    headers: {
      'X-RapidAPI-Key': APIKey0,
      'X-RapidAPI-Host': 'movie-database-alternative.p.rapidapi.com'
    }
  };


  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error(error);
  }

}

async function getMoreLikeThis(id, limit = 10) {
  const options = {
    method: 'GET',
    url: 'https://imdb8.p.rapidapi.com/title/get-more-like-this',
    params: {
      tconst: id
    },
    headers: {
      'X-RapidAPI-Key': APIKey1,
      'X-RapidAPI-Host': 'imdb8.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    return response.data.slice(0, limit);
  } catch (error) {
    console.error(error);
  }
}

async function getMovieByName(name) {
  const options = {
    method: 'GET',
    url: 'https://movie-database-alternative.p.rapidapi.com/',
    params: {
      s: name,
      r: 'json'
    },
    headers: {
      'X-RapidAPI-Key': 'e0aa5baafamshba73e975ca7ffdcp19f192jsneed6227668f7',
      'X-RapidAPI-Host': 'movie-database-alternative.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

async function getMoreDetails(id) {
  const options = {
    method: 'GET',
    url: 'https://mdblist.p.rapidapi.com/',
    params: {i: id},
    headers: {
      'X-RapidAPI-Key': APIKey0,
      'X-RapidAPI-Host': 'mdblist.p.rapidapi.com'
    }
  };
  
  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

const getAll = (query, variables) => {
  return new Promise((resolve, reject) => {
    lite.all(query, variables, (err, rows) => {
      if (err) {
        console.error(err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

app.get("/login.ejs", (req, res) => {
  res.render("login.ejs");
});

app.get("/register.ejs", (req, res) => {
  res.render("register.ejs");
});

app.get("/profile.ejs", (req, res) => {
  const username = user.username;
  const email = user.email;

  res.render("profile.ejs", {
    username,
    email,
  });
});

app.get("/password.ejs", (req, res) => {
  res.render("password.ejs");
});

app.get("/movies.ejs", async (req, res) => {
  let moviesgenres;
  let categoryCounter = {};
  const query = `
    SELECT *
    FROM Movies
    JOIN moviegenres ON Movies.movie_id = moviegenres.movie_id
    JOIN Genres ON moviegenres.genre_id = Genres.genre_id;
`;

  await new Promise((resolve, reject) => {
    lite.all(query, [], (err, rows) => {
      if (err) {
        console.error(err.message);
        reject(err);
        return;
      }
      moviesgenres = rows;
      moviesgenres.forEach((row) => {
        const category = row.genre;
        if (!categoryCounter[category]) {
          categoryCounter[category] = 0;
        }
        categoryCounter[category]++;
      });
      resolve();
    });
  });

  res.render("movies.ejs", {
    login: login,
    moviesgenres: moviesgenres,
    categoryCounter: categoryCounter
  });
});

app.post('/search', async (req, res) => {
  let genreIDArray = [];
  let castIDArray = [];
  const search = req.body.searchQuery;
  const resultList = await getMovieByName(search);



  if(resultList.Response === 'True'){
    let movieDetails = await getDetails(resultList.Search[0].imdbID);  

  if (movieDetails.Type === "series") {
    lite.serialize(async () => {

        let genre = movieDetails.Genre;
        let splitGenre = genre.split(", ");

        let cast = movieDetails.Actors;
        let splitCast = cast.split(", ");

        for (let j = 0; j < splitGenre.length; j++) {
          lite.run(`INSERT INTO Genres(genre)
            SELECT ?
            WHERE NOT EXISTS (
                SELECT 1 FROM Genres WHERE genre = ?
            )`, [splitGenre[j], splitGenre[j]], function (err) {
            if (err) {
              console.error('ERROR:', err);
            }
          });


          await wait100();

          lite.all('SELECT genre_id FROM Genres WHERE genre = ? ', [splitGenre[j]], (err, rows) => {
            if (err) {
              return console.error(err.message);
            }
            genreIDArray.push(rows[0].genre_id);
          });


          await wait100();

          lite.run(`INSERT INTO seriesgenres(series_id,genre_id)
                SELECT ?, ?
                WHERE NOT EXISTS (
                    SELECT 1 FROM seriesgenres WHERE series_id = ? AND genre_id = ?
                )`, [movieDetails.imdbID, genreIDArray[genreIDArray.length - 1], movieDetails.imdbID, genreIDArray[genreIDArray.length - 1]], function (err) {
            if (err) {
              console.error('ERROR:', err);
            }
          });

          await wait100();

        }

        for (let k = 0; k < splitCast.length; k++) {
          lite.run(`INSERT INTO Actors(actor)
            SELECT ?
            WHERE NOT EXISTS (
                SELECT 1 FROM Actors WHERE actor = ?
            )`, [splitCast[k], splitCast[k]], function (err) {
            if (err) {
              console.error('ERROR:', err);
            }
          });


          await wait100();

          lite.all('SELECT actor_id FROM Actors WHERE actor = ? ', [splitCast[k]], (err, rows) => {
            if (err) {
              return console.error(err.message);
            }
            castIDArray.push(rows[0].actor_id);
          });


          await wait100();

          lite.run(`INSERT INTO movieseriesactors(series_id,actor_id)
                SELECT ?, ?
                WHERE NOT EXISTS (
                    SELECT 1 FROM movieseriesactors WHERE series_id = ? AND actor_id = ?
                )`, [movieDetails.imdbID, castIDArray[castIDArray.length - 1], movieDetails.imdbID, castIDArray[castIDArray.length - 1]], function (err) {
            if (err) {
              console.error('ERROR:', err);
            }
          });

          await wait100();

        }


        if (movieDetails.imdbRating == 'N/A') {
          movieDetails.imdbRating = null;
        }
        let director = movieDetails.Director;
        let splitDirector = director.split(", ");
      
        lite.run('INSERT INTO Series(series_id, title, poster, year, runtime, imdb_rating, plot, director) VALUES(?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (series_id) DO NOTHING RETURNING *',
          [movieDetails.imdbID, movieDetails.Title, movieDetails.Poster, movieDetails.Year,
            movieDetails.Runtime, movieDetails.imdbRating, movieDetails.Plot, splitDirector[0]], (err, res) => {
            if (err) {
              console.error('ERROR:', err);
            } 
          });
        await wait100();


      
    });
  }
  else if (movieDetails.Type === "movie") {
    lite.serialize(async () => {
     

        let genre = movieDetails.Genre;
        let splitGenre = genre.split(", ");

        let cast = movieDetails.Actors;
        let splitCast = cast.split(", ");

        for (let j = 0; j < splitGenre.length; j++) {
          lite.run(`INSERT INTO Genres(genre)
            SELECT ?
            WHERE NOT EXISTS (
                SELECT 1 FROM Genres WHERE genre = ?
            )`, [splitGenre[j], splitGenre[j]], function (err) {
            if (err) {
              console.error('ERROR:', err);
            }
          });


          await wait100();

          lite.all('SELECT genre_id FROM Genres WHERE genre = ? ', [splitGenre[j]], (err, rows) => {
            if (err) {
              return console.error(err.message);
            }
            genreIDArray.push(rows[0].genre_id);
          });


          await wait100();

          lite.run(`INSERT INTO moviegenres(movie_id,genre_id)
                SELECT ?, ?
                WHERE NOT EXISTS (
                    SELECT 1 FROM moviegenres WHERE movie_id = ? AND genre_id = ?
                )`, [movieDetails.imdbID, genreIDArray[genreIDArray.length - 1], movieDetails.imdbID, genreIDArray[genreIDArray.length - 1]], function (err) {
            if (err) {
              console.error('ERROR:', err);
            }
          });

          await wait100();

        }

        for (let k = 0; k < splitCast.length; k++) {
          lite.run(`INSERT INTO Actors(actor)
            SELECT ?
            WHERE NOT EXISTS (
                SELECT 1 FROM Actors WHERE actor = ?
            )`, [splitCast[k], splitCast[k]], function (err) {
            if (err) {
              console.error('ERROR:', err);
            }
          });


          await wait100();

          lite.all('SELECT actor_id FROM Actors WHERE actor = ? ', [splitCast[k]], (err, rows) => {
            if (err) {
              return console.error(err.message);
            }
            castIDArray.push(rows[0].actor_id);
          });


          await wait100();

          lite.run(`INSERT INTO movieseriesactors(movie_id,actor_id)
                SELECT ?, ?
                WHERE NOT EXISTS (
                    SELECT 1 FROM movieseriesactors WHERE movie_id = ? AND actor_id = ?
                )`, [movieDetails.imdbID, castIDArray[castIDArray.length - 1], movieDetails.imdbID, castIDArray[castIDArray.length - 1]], function (err) {
            if (err) {
              console.error('ERROR:', err);
            }
          });

          await wait100();

        }


        if (movieDetails.imdbRating == 'N/A') {
          movieDetails.imdbRating = null;
        }
        let director = movieDetails.Director;
        let splitDirector = director.split(", ");
                 
        lite.run('INSERT INTO Movies(movie_id, title, poster, year, runtime, imdb_rating, plot, director) VALUES(?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (movie_id) DO NOTHING RETURNING *',
          [movieDetails.imdbID, movieDetails.Title, movieDetails.Poster, movieDetails.Year,
            movieDetails.Runtime, movieDetails.imdbRating, movieDetails.Plot, splitDirector[0]], (err, res) => {
            if (err) {
              console.error('ERROR:', err);
            } 
          });
        await wait100();

    });
  }
  }
  

  if (resultList.Response === 'False') {
    res.render("search.ejs", {
      login: login,
      search: search,
      searchItems: [],
      response: false
    });
  } else {
    res.render("search.ejs", {
      login: login,
      search: search,
      searchItems: resultList.Search,
      response: true
    });
  }
});

app.get("/series.ejs", async (req, res) => {
  let seriesgenres;
  let categoryCounter = {};
  const query = `
    SELECT *
    FROM Series
    JOIN seriesgenres ON Series.series_id = seriesgenres.series_id
    JOIN Genres ON seriesgenres.genre_id = Genres.genre_id;
`;

  await new Promise((resolve, reject) => {
    lite.all(query, [], (err, rows) => {
      if (err) {
        console.error(err.message);
        reject(err);
        return;
      }
      seriesgenres = rows;
      seriesgenres.forEach((row) => {
        const category = row.genre;
        if (!categoryCounter[category]) {
          categoryCounter[category] = 0;
        }
        categoryCounter[category]++;
      });
      resolve();
    });
  });
  

  res.render("series.ejs", {
    login: login,
    seriesgenres: seriesgenres,
    categoryCounter: categoryCounter
  });
});


app.get("/best-actors.ejs", async (req, res) => {
  let bestActors;
  let actorCounter = [];
  const query = `
  SELECT *
  FROM (
      SELECT Actors.actor_id,Actors.actor, Movies.*, 
             ROW_NUMBER() OVER(PARTITION BY Actors.actor_id ORDER BY Movies.movie_id) AS row_num
      FROM Actors
      JOIN movieseriesactors ON Actors.actor_id = movieseriesactors.actor_id
      JOIN Movies ON movieseriesactors.movie_id = Movies.movie_id
      WHERE Actors.actor_id IN (57, 20, 26, 21, 82, 90, 17, 101, 119, 128)
  ) AS actor_movies
  WHERE row_num <= 4
  ORDER BY actor_id, movie_id, imdb_rating DESC  
`;

  await new Promise((resolve, reject) => {
    lite.all(query, [], (err, rows) => {
      if (err) {
        console.error(err.message);
        reject(err);
        return;
      }
      bestActors = rows;
      for(let i=0;i<bestActors.length;i++){
        if(bestActors[i].row_num==1){
          actorCounter.push(bestActors[i].actor);
        }
      }
      resolve();
    });
  });


  res.render("best-actors.ejs", {
    login: login,
    bestActors: bestActors,
    actorCounter: actorCounter
  });
});


app.post('/profile.ejs', async (req, res) => {
  const email = req.body.email;
  const username = req.body.username;
  let formId = req.body.form_id;
  

  if (formId === 'logOutButton') {
    login = false;
  } else {

    try {
      const updateQuery = `
    UPDATE Users 
    SET username = ?, email = ?
    WHERE user_id = ?
  `;

      lite.run(updateQuery, [username, email, user.user_id], function (err) {
        if (err) {
          return console.error(err.message);
        }

        const selectQuery = `SELECT * FROM Users WHERE user_id = ?`;

        lite.all(selectQuery, [user.user_id], (err, row) => {
          if (err) {
            return console.error(err.message);
          }
          user = row[0];
        });
      });
    } catch (err) {
      console.error('Error:', err);
    }
  }

  res.redirect('/');
});

app.post('/password.ejs', async (req, res) => {
  const password = req.body.newPassword;


  lite.run(`UPDATE Users SET password = ? WHERE user_id = ?`, [password, user.user_id], function (err) {
    if (err) {
      console.error('Error:', err.message);
    } else {
      lite.get('SELECT * FROM Users WHERE user_id = ?', [user.user_id], (err, row) => {
        if (err) {
          console.error('Error:', err.message);
        } else {
          user = row;
        }
      });
    }
  });



  res.redirect('/');
});

app.post('/login.ejs', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let flag = false;

  await new Promise((resolve, reject) => {
    lite.all(
      `SELECT Users.*, Role.*
           FROM Users
           JOIN Role ON Users.role_id = Role.role_id
           WHERE Users.email = ? AND Users.password = ?`,
      [email, password],
      (err, res) => {
        if (err) {
          console.error('Error:', err);
          reject(err);
        } else {
          user = res[0];
        }
        if (res.length > 0 && res[0].role_name == "user") {
          //res.redirect('/');
          flag = true;
        }
        else if (res.length > 0 && res[0].role_name == "admin") {
          //res.redirect('/');
          flag = true;
        }
        else {
          console.log("Login Failed! your username or password is incorrect please try again.");
        }
        resolve();
      }
    );
  });

  if (flag) {
    res.redirect('/');
    login = true;
  }
  else {
    res.redirect('/login.ejs');
  }

});

app.post('/register.ejs', (req, res) => {
  const password = req.body.password;
  const username = req.body.username;
  const email = req.body.email;
  let roleid;


  lite.run('INSERT INTO Role(role_name) VALUES(?) RETURNING *',
    ["user"], (err, res) => {
      if (err) {
        console.error('ERROR:', err);
      }
    });

  lite.all('SELECT role_id FROM Role ORDER BY role_id DESC LIMIT 1', [], (err, res) => {
    if (err) {
      console.error('ERROR:', err);
    } else {
      roleid = res[0];
      let roleidString = roleid.role_id.toString();
      let roleidINTEGER = parseInt(roleidString);

      lite.run('INSERT INTO Users(username, email, password, role_id) VALUES(?, ?, ?, ?) RETURNING *',
        [username, email, password, roleidINTEGER], (err, res) => {
          if (err) {
            console.error('ERROR:', err);
          }
        });
    }
  });

  res.redirect('/');
});

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

async function wait100() {
  await delay(100);
}

app.get("/favorites.ejs", async (req, res) => {
  let favorites = [];

  favorites = await new Promise((resolve, reject) => {
    lite.all("SELECT * FROM Movies JOIN Favorites ON Movies.movie_id = Favorites.movie_id WHERE Favorites.user_id = ?;", [user.user_id], (err, rows) => {
      if (err) {
        console.error(err.message);
        reject(err);
      } else {
        rows.forEach(row => favorites.push(row));
        resolve(favorites);
      }
    });
  });
  favorites = await new Promise((resolve, reject) => {
    lite.all("SELECT * FROM Series JOIN Favorites ON Series.series_id = Favorites.series_id WHERE Favorites.user_id = ?;", [user.user_id], (err, rows) => {
      if (err) {
        console.error(err.message);
        reject(err);
      } else {
        rows.forEach(row => favorites.push(row));
        resolve(favorites);
      }
    });
  });
  res.render('favorites.ejs', {
    favorites: favorites,
    login: login
  });
});

app.get("/watchlist.ejs", async (req, res) => {
  let watchlist = [];

  watchlist = await new Promise((resolve, reject) => {
    lite.all("SELECT * FROM Movies JOIN Watchlist ON Movies.movie_id = Watchlist.movie_id WHERE Watchlist.user_id = ?;", [user.user_id], (err, rows) => {
      if (err) {
        console.error(err.message);
        reject(err);
      } else {
        rows.forEach(row => watchlist.push(row));
        resolve(watchlist);
      }
    });
  });
  watchlist = await new Promise((resolve, reject) => {
    lite.all("SELECT * FROM Series JOIN Watchlist ON Series.series_id = Watchlist.series_id WHERE Watchlist.user_id = ?;", [user.user_id], (err, rows) => {
      if (err) {
        console.error(err.message);
        reject(err);
      } else {
        rows.forEach(row => watchlist.push(row));
        resolve(watchlist);
      }
    });
  });
  res.render('watchlist.ejs', {
    watchList: watchlist,
    login: login
  });
  
});

app.get("/", async (req, res) => {
  let upcomingMovies;
  let topRatedMovies;
  let topRatedSeries;

  /*
  const upcomingMovies = await getUpcomingMovies(4),
      topRatedMovies = await getTopRatedMovies(8),
      topRatedSeries = await getTopRatedSeries(4);


  const upcomingMoviesIds = upcomingMovies.map(item => item.id.slice(7, -1)),
      topRatedMoviesIds = topRatedMovies.map(item => item.id.slice(7, -1)),
      topRatedSeriesIds = topRatedSeries.map(item => item.id.slice(7, -1)); 


  const upcomingMoviesDetails = await Promise.all(
      upcomingMoviesIds.map(async (upcomingMovieId) => {
          const { imdbID, Title, Poster, Year, Runtime, imdbRating, Plot } = await getDetails(upcomingMovieId);
          return { imdbID, Title, Poster, Year, Runtime, imdbRating, Plot };
      })
  );
  await waitOneSec();
*/


  // upcomingMovies = await new Promise((resolve, reject) => {
  //   lite.all("SELECT * FROM Movies WHERE imdb_rating IS NULL AND (year = '2023' OR year = '2024');", [], (err, rows) => {
  //   if (err) {
  //     console.error(err.message);
  //     reject(err);
  //   } else {
  //     resolve(rows);
  //   }
  //   });
  // });


  upcomingMovies = await getAll("SELECT * FROM Movies WHERE imdb_rating IS NULL AND (year = '2023' OR year = '2024');", []);



  topRatedMovies = await getAll("SELECT * FROM Movies WHERE imdb_rating > 0 ORDER BY imdb_rating DESC LIMIT 8", []);



  topRatedSeries = await getAll("SELECT * FROM Series WHERE imdb_rating > 0 ORDER BY imdb_rating DESC LIMIT 4", []);

  const heroMovie = await new Promise((resolve, reject) => {
    lite.get('SELECT * FROM Movies WHERE movie_id = ?;',
      ['tt15398776'], (err, res) => {
        if (err) {
          console.error('An error has accorded : ', err);
          reject(err);
        } else {
          resolve(res);
        }
      });
  });
  const heroMovieBackdrop = "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg";

  res.render("index.ejs", {

    login: login,
    heroMovie: heroMovie,
    backdrop: heroMovieBackdrop,
    upcomingMovies: upcomingMovies,
    topRatedMovies: topRatedMovies,
    topRatedSeries: topRatedSeries

  });
});

app.post("/movie-details.ejs", async (req, res) => {
  let genreIDArray = [];
  let castIDArray = [];
  let commentArray = [];
  const id = req.body["movieId"];
  let isFavMovie = false;
  let inWatchlist = false;
  const movieDetails = await getDetails(id);
  const relatedMoviesIds = await getMoreLikeThis(id, 4);
  const moreDetails = await getMoreDetails(id);


  let relatedMoviesDetails = await Promise.all(
    relatedMoviesIds.map(async (relatedMoviesId) => {
      const { imdbID, Title, Poster, Year, Runtime, imdbRating, Plot, Genre, Director, Type , Actors } = await getDetails(relatedMoviesId.slice(7, -1));
      return { imdbID, Title, Poster, Year, Runtime, imdbRating, Plot, Genre, Director , Type, Actors };
    })
  );

    //await waitOneSec();
    lite.serialize(async () => {
      for (let i = 0; i < relatedMoviesDetails.length; i++) {
        

        if (relatedMoviesDetails[i].Type === "series") {

        let genre = relatedMoviesDetails[i].Genre;
        let splitGenre = genre.split(", ");

        let cast = relatedMoviesDetails[i].Actors;
        let splitCast = cast.split(", ");

        for (let j = 0; j < splitGenre.length; j++) {
          lite.run(`INSERT INTO Genres(genre)
            SELECT ?
            WHERE NOT EXISTS (
                SELECT 1 FROM Genres WHERE genre = ?
            )`, [splitGenre[j], splitGenre[j]], function (err) {
            if (err) {
              console.error('ERROR:', err);
            }
          });


          await wait100();

          lite.all('SELECT genre_id FROM Genres WHERE genre = ? ', [splitGenre[j]], (err, rows) => {
            if (err) {
              return console.error(err.message);
            }
            genreIDArray.push(rows[0].genre_id);
          });


          await wait100();

          lite.run(`INSERT INTO seriesgenres(series_id,genre_id)
                SELECT ?, ?
                WHERE NOT EXISTS (
                    SELECT 1 FROM seriesgenres WHERE series_id = ? AND genre_id = ?
                )`, [relatedMoviesDetails[i].imdbID, genreIDArray[genreIDArray.length - 1], relatedMoviesDetails[i].imdbID, genreIDArray[genreIDArray.length - 1]], function (err) {
            if (err) {
              console.error('ERROR:', err);
            } 
          });

          await wait100();

        }



        for (let k = 0; k < splitCast.length; k++) {
          lite.run(`INSERT INTO Actors(actor)
            SELECT ?
            WHERE NOT EXISTS (
                SELECT 1 FROM Actors WHERE actor = ?
            )`, [splitCast[k], splitCast[k]], function (err) {
            if (err) {
              console.error('ERROR:', err);
            }
          });


          await wait100();

          lite.all('SELECT actor_id FROM Actors WHERE actor = ? ', [splitCast[k]], (err, rows) => {
            if (err) {
              return console.error(err.message);
            }
            castIDArray.push(rows[0].actor_id);
          });


          await wait100();

          lite.run(`INSERT INTO movieseriesactors(series_id,actor_id)
                SELECT ?, ?
                WHERE NOT EXISTS (
                    SELECT 1 FROM movieseriesactors WHERE series_id = ? AND actor_id = ?
                )`, [relatedMoviesDetails[i].imdbID, castIDArray[castIDArray.length - 1], relatedMoviesDetails[i].imdbID, castIDArray[castIDArray.length - 1]], function (err) {
            if (err) {
              console.error('ERROR:', err);
            }
          });

          await wait100();

        }




        if (relatedMoviesDetails[i].imdbRating == 'N/A') {
          relatedMoviesDetails[i].imdbRating = null;
        }
        let director = relatedMoviesDetails[i].Director;
        let splitDirector = director.split(", ");
            
        lite.run('INSERT INTO Series(series_id, title, poster, year, runtime, imdb_rating, plot, director) VALUES(?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (series_id) DO NOTHING RETURNING *',
          [relatedMoviesDetails[i].imdbID, relatedMoviesDetails[i].Title, relatedMoviesDetails[i].Poster, relatedMoviesDetails[i].Year,
          relatedMoviesDetails[i].Runtime, relatedMoviesDetails[i].imdbRating, relatedMoviesDetails[i].Plot, splitDirector[0]], (err, res) => {
            if (err) {
              console.error('ERROR:', err);
            }
          });
        await wait100();


      }

        else if (relatedMoviesDetails[i].Type === "movie") {

              let genre = relatedMoviesDetails[i].Genre;
              let splitGenre = genre.split(", ");

              let cast = relatedMoviesDetails[i].Actors;
              let splitCast = cast.split(", ");

              for (let j = 0; j < splitGenre.length; j++) {
                lite.run(`INSERT INTO Genres(genre)
                  SELECT ?
                  WHERE NOT EXISTS (
                      SELECT 1 FROM Genres WHERE genre = ?
                  )`, [splitGenre[j], splitGenre[j]], function (err) {
                  if (err) {
                    console.error('ERROR:', err);
                  }
                });
      
      
                await wait100();
      
                lite.all('SELECT genre_id FROM Genres WHERE genre = ? ', [splitGenre[j]], (err, rows) => {
                  if (err) {
                    return console.error(err.message);
                  }
                  genreIDArray.push(rows[0].genre_id);
                });
      
      
                await wait100();
      
                lite.run(`INSERT INTO moviegenres(movie_id,genre_id)
                      SELECT ?, ?
                      WHERE NOT EXISTS (
                          SELECT 1 FROM moviegenres WHERE movie_id = ? AND genre_id = ?
                      )`, [relatedMoviesDetails[i].imdbID, genreIDArray[genreIDArray.length - 1], relatedMoviesDetails[i].imdbID, genreIDArray[genreIDArray.length - 1]], function (err) {
                  if (err) {
                    console.error('ERROR:', err);
                  } 
                });
      
                await wait100();
      
              }

              for (let k = 0; k < splitCast.length; k++) {
                lite.run(`INSERT INTO Actors(actor)
                  SELECT ?
                  WHERE NOT EXISTS (
                      SELECT 1 FROM Actors WHERE actor = ?
                  )`, [splitCast[k], splitCast[k]], function (err) {
                  if (err) {
                    console.error('ERROR:', err);
                  }
                });
      
      
                await wait100();
      
                lite.all('SELECT actor_id FROM Actors WHERE actor = ? ', [splitCast[k]], (err, rows) => {
                  if (err) {
                    return console.error(err.message);
                  }
                  castIDArray.push(rows[0].actor_id);
                });
      
      
                await wait100();
      
                lite.run(`INSERT INTO movieseriesactors(movie_id,actor_id)
                      SELECT ?, ?
                      WHERE NOT EXISTS (
                          SELECT 1 FROM movieseriesactors WHERE movie_id = ? AND actor_id = ?
                      )`, [relatedMoviesDetails[i].imdbID, castIDArray[castIDArray.length - 1], relatedMoviesDetails[i].imdbID, castIDArray[castIDArray.length - 1]], function (err) {
                  if (err) {
                    console.error('ERROR:', err);
                  }
                });
                await wait100();
              }


              if (relatedMoviesDetails[i].imdbRating == 'N/A') {
                relatedMoviesDetails[i].imdbRating = null;
              }
              let director = relatedMoviesDetails[i].Director;
              let splitDirector = director.split(", ");
      
              lite.run('INSERT INTO Movies(movie_id, title, poster, year, runtime, imdb_rating, plot, director) VALUES(?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (movie_id) DO NOTHING RETURNING *',
                [relatedMoviesDetails[i].imdbID, relatedMoviesDetails[i].Title, relatedMoviesDetails[i].Poster, relatedMoviesDetails[i].Year,
                relatedMoviesDetails[i].Runtime, relatedMoviesDetails[i].imdbRating, relatedMoviesDetails[i].Plot, splitDirector[0]], (err, res) => {
                  if (err) {
                    console.error('ERROR:', err);
                  }
                });
              await wait100(); 
              
        }
    }
    });
  

 

  ///// write cooment
  if (login) {
    let comment = req.body.comment;
    const favMovId = req.body.favMovieId;
    const watchlistId = req.body.watchlistMovieId;

    if (typeof comment !== 'undefined' && movieDetails.Type === "movie") {
      lite.run('INSERT INTO Reviews(comment, date, user_id, movie_id) VALUES(?, ?, ?, ?) RETURNING *',
        [comment, date, user.user_id, id], (err, res) => {
          if (err) {
            console.error('ERROR:', err);
          }
        });
    } else if (typeof comment !== 'undefined' && movieDetails.Type === "series") {
      lite.run('INSERT INTO Reviews(comment, date, user_id, series_id) VALUES(?, ?, ?, ?) RETURNING *',
        [comment, date, user.user_id, id], (err, res) => {
          if (err) {
            console.error('ERROR:', err);
          } 
        });
    }
    if (typeof favMovId !== 'undefined' && movieDetails.Type === 'movie') {
      await new Promise((resolve, reject) => {
        lite.get('SELECT favorite_id FROM Favorites WHERE user_id = ? AND (movie_id = ?  OR series_id = ?);',
          [user.user_id, id, id], (err, res) => {
            if (err) {
              console.error('An error has accorded : ', err);
              reject(err);
            } else {
              if (typeof res != 'undefined') {
                isFavMovie = true;
              }
              resolve(res);
            }
          });
      });

      if (isFavMovie) {
        await new Promise((resolve, reject) => {
          lite.run('DELETE FROM Favorites WHERE user_id = ? AND (movie_id = ? OR series_id = ?);',
            [user.user_id, id, id], (err, res) => {
              if (err) {
                console.error('An error has accorded : ', err);
                reject(err);
              } else {
                isFavMovie = false;
                resolve();
              }
            });
        });

      } else {
        lite.run('INSERT INTO Favorites(user_id, movie_id) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM Favorites WHERE user_id = ? AND movie_id = ?)',
          [user.user_id, id, user.user_id, id], (err, res) => {
            if (err) {
              console.error('An error has accorded : ', err);
            }
          });
      }
    } else if (typeof favMovId !== 'undefined' && movieDetails.Type === 'series') {
      lite.run('INSERT INTO Favorites(user_id, series_id) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM Favorites WHERE user_id = ? AND series_id = ?)',
        [user.user_id, id, user.user_id, id], (err, res) => {
          if (err) {
            console.error('An error has accorded : ', err);
          }
        });
    }
    if (typeof watchlistId !== 'undefined' && movieDetails.Type === 'movie') {
      await new Promise((resolve, reject) => {
        lite.get('SELECT id FROM Watchlist WHERE user_id = ? AND (movie_id = ?  OR series_id = ?);',
          [user.user_id, id, id], (err, res) => {
            if (err) {
              console.error('An error has accorded : ', err);
              reject(err);
            } else {
              if (typeof res != 'undefined') {
                inWatchlist = true;
              }
              resolve(res);
            }
          });
      });
      if(inWatchlist) {
        await new Promise((resolve, reject) => {
          lite.run('DELETE FROM Watchlist WHERE user_id = ? AND (movie_id = ? OR series_id = ?);',
            [user.user_id, id, id], (err, res) => {
              if (err) {
                console.error('An error has accorded : ', err);
                reject(err);
              } else {
                inWatchlist = false;
                resolve();
              }
            });
        });
      } else {
        lite.run('INSERT INTO Watchlist(user_id, movie_id) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM Watchlist WHERE user_id = ? AND movie_id = ?)',
        [user.user_id, id, user.user_id, id], (err, res) => {
          if (err) {
            console.error('An error has accorded : ', err);
          }
        });
      }
    } else if (typeof watchlistId !== 'undefined' && movieDetails.Type === 'series') {
      lite.run('INSERT INTO Watchlist(user_id, series_id) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM Watchlist WHERE user_id = ? AND series_id = ?)',
        [user.user_id, id, user.user_id, id], (err, res) => {
          if (err) {
            console.error('An error has accorded : ', err);
          }
        });
    }
    await new Promise((resolve, reject) => {
      lite.get('SELECT favorite_id FROM Favorites WHERE user_id = ? AND (movie_id = ?  OR series_id = ?);',
        [user.user_id, id, id], (err, res) => {
          if (err) {
            console.error('An error has accorded : ', err);
            reject(err);
          } else {
            if (typeof res != 'undefined') {
              isFavMovie = true;
            }
            resolve(res);
          }
        });
    });
    await new Promise((resolve, reject) => {
      lite.get('SELECT id FROM Watchlist WHERE user_id = ? AND (movie_id = ?  OR series_id = ?);',
        [user.user_id, id, id], (err, res) => {
          if (err) {
            console.error('An error has accorded : ', err);
            reject(err);
          } else {
            if (typeof res != 'undefined') {
              inWatchlist = true;
            }
            resolve(res);
          }
        });
    });
  }
  // } else {
  //   res.redirect("/register.ejs")
  // }

  //// read comment
  if (movieDetails.Type === "movie") {
    let query = `
      SELECT Reviews.comment, Users.username, Reviews.date
      FROM Reviews
      INNER JOIN Users ON Reviews.user_id = Users.user_id
      INNER JOIN Movies ON Reviews.movie_id = Movies.movie_id
      WHERE Movies.movie_id = ?
    `;

    commentArray = await new Promise((resolve, reject) => {
      lite.all(query, [id], (err, res) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        else {
          resolve(res);
        }
      });
    });
  }
  else if (movieDetails.Type === "series") {
    let query = `
      SELECT Reviews.comment, Users.username, Reviews.date
      FROM Reviews
      INNER JOIN Users ON Reviews.user_id = Users.user_id
      INNER JOIN Series ON Reviews.series_id = Series.series_id
      WHERE Series.series_id = ?
    `;

    commentArray = await new Promise((resolve, reject) => {
      lite.all(query, [id], (err, res) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        else {
          resolve(res);
        }
      });
    });
  }
  let backdrop = null, trailer = null;
  if (moreDetails.backdrop != null){
    backdrop = moreDetails.backdrop;
  }

  if(moreDetails.trailer != null){
    trailer = moreDetails.trailer.slice(28);
  }

  res.render("movie-details.ejs", {
    login: login,
    isFavorite: isFavMovie,
    inWatchlist: inWatchlist,
    movieDetails: movieDetails,
    relatedMoviesDetails: relatedMoviesDetails,
    commentArray: commentArray,
    background: backdrop,
    trailer: trailer
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});