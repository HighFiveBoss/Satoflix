import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
//import pg from "pg";
import sqlite3 from 'sqlite3';

const app = express();
const port = 3000;
const APIKey0 = 'e0aa5baafamshba73e975ca7ffdcp19f192jsneed6227668f7';
const APIKey1 = '74c0434c46msh3a062b2096052f9p171104jsnd24893c2aeb7';

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

let lite = new sqlite3.Database('satoflix.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('SQLite veritabanına bağlandı. sqlite');
  }
});


let user;
let idArray = [];
let login=false;

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth()+1;
const currentDay = currentDate.getDate();

const date=currentDay+"-"+currentMonth+"-"+currentYear;
console.log(date);

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

app.get("/login.ejs", (req, res) => {
    res.render("login.ejs");
});

app.get("/register.ejs", (req, res) => {
    res.render("register.ejs");
});

app.get("/profile.ejs", (req, res) => {
  console.log("userrrrrr: "+user);
  console.log(user.username);
  //console.log(username);
  console.log(user.email);
  //console.log(email);
    const username=user.username;
    const email=user.email;

  res.render("profile.ejs", {
    username,
    email,
});
});

app.get("/password.ejs", (req, res) => {
  res.render("password.ejs");
});


app.post('/profile.ejs', async (req, res) => {
  const email = req.body.email;
  const username = req.body.username;

  // user=result.rows[0];
  try {
    const updateQuery = `
    UPDATE Users 
    SET username = ?, email = ?
    WHERE user_id = ?
  `;
    
  lite.run(updateQuery, [username, email, user.user_id], function(err) {
    if (err) {
      return console.error(err.message);
    }

    const selectQuery = `SELECT * FROM Users WHERE user_id = ?`;

    lite.all(selectQuery, [user.user_id], (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      console.log('Güncellenmiş satır:', row);
      user=row[0];
      // Burada güncellenmiş satır verisini kullanabilirsin
    });
  });
} catch (err) {
  console.error('Hata:', err);
}
  
  res.redirect('/index-profile.ejs');
});

app.post('/password.ejs', async (req, res) => {
  const password = req.body.newPassword;

  
lite.run(`UPDATE Users SET password = ? WHERE user_id = ?`, [password, user.user_id], function(err) {
  if (err) {
    console.error('Hata:', err.message);
  } else {
    lite.get('SELECT * FROM Users WHERE user_id = ?', [user.user_id], (err, row) => {
      if (err) {
        console.error('Hata:', err.message);
      } else {
        console.log('Güncellenen satır:', row);
        user=row;
      }
    });
  }
});



  res.redirect('/index-profile.ejs');
});

app.post('/login.ejs', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    let flag =false;

    console.log(email);
    console.log(password);

    lite.all(
        `SELECT Users.*, Role.*
         FROM Users
         JOIN Role ON Users.role_id = Role.role_id
         WHERE Users.email = ? AND Users.password = ?`,
        [email, password],
        (err, res) => {
        if (err) {
            console.error('Hata:', err);
          } else {
            //console.log('Sonuçlar:', res.rows);
            user=res[0];
          }
        if(res.length>0 && res[0].role_name=="user"){
            console.log("user : "+res[0].username +" log in");
            //res.redirect('/');
            flag=true;
            console.log("sorgu içi flag: "+flag);
           }
        else if(res.length>0 && res[0].role_name=="admin"){
            console.log("admin : "+res[0].username +" log in");
            //res.redirect('/');
            flag=true;
          }
        else{
            console.log("Login Failed! your username or password is incorrect please try again.");
          }
        }
      );
    
    await waitOneSec();
    console.log("wait önce si flag: "+flag);
    if(flag){
        console.log("if flag içeri : "+flag);
        res.redirect('/index-profile.ejs');
        login=true;
    }
    else{
        res.redirect('/login.ejs');
    }
    
});

app.post('/register.ejs', (req, res) => {
    const password = req.body.password;
    const username = req.body.username;
    const email = req.body.email;
    let roleid;

    console.log(email);
    console.log(username);
    console.log(password);

    lite.run('INSERT INTO Role(role_name) VALUES(?) RETURNING *',
     ["user"], (err, res) => {
        if (err) {
        console.error('Ekleme hatası:', err);
      } else {
        console.log('Yeni kullanıcı eklendi:');
        //console.log('Yeni kullanıcı eklendi:', res.rows[0]);
      }
    });

    lite.all('SELECT role_id FROM Role ORDER BY role_id DESC LIMIT 1',[], (err, res) => {
        if (err) {
          console.error('Hata:', err);
        } else {
          //console.log('Son eklenen veri:', res.rows[0]);
          console.log('Son eklenen veri:', res[0]);
          roleid=res[0];
          let roleidString = roleid.role_id.toString();
          let roleidINTEGER = parseInt(roleidString);

          console.log("sdsadsdadsasad" +typeof roleidINTEGER);
          console.log("aaaaaaaaaaaaaa"+ roleidINTEGER);
          lite.run('INSERT INTO Users(username, email, password, role_id) VALUES(?, ?, ?, ?) RETURNING *',
     [username, email, password, roleidINTEGER], (err, res) => {
      if (err) {
        console.error('Ekleme hatası:', err);
      } else {
        console.log('Yeni kullanıcı eklendi:');
        //console.log('Yeni kullanıcı eklendi:', res.rows[0]);
      }
    });
        }
    });
  
    res.redirect('/');
});

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function waitOneSec() {
    console.log('start timer');
    await delay(1000);
    console.log('after 1 second');
}

//randomMovieImageLink1 randomMovie1 randomMovieDate1 randomMovieResolution1 randomMovieDurationTime1 randomMovieRating1

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


lite.all("SELECT * FROM Movies WHERE imdb_rating IS NULL AND (year = '2023' OR year = '2024');", [], (err, rows) => {
  if (err) {
      console.error(err.message);
  } else {
    upcomingMovies=rows;
    console.log("sql lite : sdadsaads "+rows);
      // Process the retrieved rows
      rows.forEach(row => {
          console.log(row); // Display each row
      });
  }
});


      await waitOneSec();

        /*
    const topRatedMoviesDetails = await Promise.all(
        topRatedMoviesIds.map(async (topRatedMovieId) => {
            const { imdbID, Title, Poster, Year, Runtime, imdbRating, Plot } = await getDetails(topRatedMovieId);
            return { imdbID, Title, Poster, Year, Runtime, imdbRating, Plot };
        })
    );

   await waitOneSec();

   */


lite.all("SELECT * FROM Movies WHERE imdb_rating > 0 ORDER BY imdb_rating DESC LIMIT 8", [], (err, rows) => {
  if (err) {
      console.error(err.message);
  } else {
    topRatedMovies=rows;
    console.log("sql lite : sdadsaads "+rows);
      // Process the retrieved rows
      rows.forEach(row => {
          console.log(row); // Display each row
      });
  }
});

  await waitOneSec();



    lite.all("SELECT * FROM Series WHERE imdb_rating > 0 ORDER BY imdb_rating DESC LIMIT 4", [], (err, rows) => {
      if (err) {
          console.error(err.message);
      } else {
        topRatedSeries=rows;
        console.log("sql lite : sdadsaads "+rows);
          // Process the retrieved rows
          rows.forEach(row => {
              console.log(row); // Display each row
          });
      }
    });

      await waitOneSec();
    

    res.render("index.ejs", {
        
        upcomingMovies: upcomingMovies,
        topRatedMovies: topRatedMovies,
        topRatedSeries: topRatedSeries
        
    });
});

///////index-profile

app.get("/index-profile.ejs", async (req, res) => {
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



    lite.all("SELECT * FROM Movies WHERE imdb_rating IS NULL AND (year = '2023' OR year = '2024');", [], (err, rows) => {
      if (err) {
          console.error(err.message);
      } else {
        upcomingMovies=rows;
        console.log("sql lite : sdadsaads "+rows);
          // Process the retrieved rows
          rows.forEach(row => {
              console.log(row); // Display each row
          });
      }
    });
    await waitOneSec();



lite.all("SELECT * FROM Movies WHERE imdb_rating > 0 ORDER BY imdb_rating DESC LIMIT 8", [], (err, rows) => {
  if (err) {
      console.error(err.message);
  } else {
    topRatedMovies=rows;
    console.log("sql lite : sdadsaads "+rows);
      // Process the retrieved rows
      rows.forEach(row => {
          console.log(row); // Display each row
      });
  }
});
await waitOneSec();



    lite.all("SELECT * FROM Series WHERE imdb_rating > 0 ORDER BY imdb_rating DESC LIMIT 4", [], (err, rows) => {
      if (err) {
          console.error(err.message);
      } else {
        topRatedSeries=rows;
        console.log("sql lite : sdadsaads "+rows);
          // Process the retrieved rows
          rows.forEach(row => {
              console.log(row); // Display each row
          });
      }
    });
    await waitOneSec();
  

  res.render("index-profile.ejs", {
      
      upcomingMovies: upcomingMovies,
      topRatedMovies: topRatedMovies,
      topRatedSeries: topRatedSeries
      
  });
});

app.post("/movie-details.ejs", async (req, res) => {
    let commentArray=[];
    let id = req.body["movieId"];
    console.log(id);
    idArray.push(id);
    id=idArray[idArray.length - 1];
    if(id==undefined){
      id=idArray[idArray.length - 2];
    }
    console.log(id);
    let movieDetails = await getDetails(id);
    console.log(movieDetails);
    let relatedMoviesIds = await getMoreLikeThis(id, 4);
    console.log(relatedMoviesIds);

    let relatedMoviesDetails = await Promise.all(
        relatedMoviesIds.map(async (relatedMoviesId) => {
            const { imdbID, Title, Poster, Year, Runtime, imdbRating, Plot } = await getDetails(relatedMoviesId.slice(7, -1));
            return { imdbID, Title, Poster, Year, Runtime, imdbRating, Plot };
        })
    );
    console.log(relatedMoviesDetails);

    if(movieDetails.Type==="series"){
        for(let i=0;i<relatedMoviesDetails.length;i++){
            if(relatedMoviesDetails[i].imdbRating=='N/A'){
              relatedMoviesDetails[i].imdbRating=null;
            }          
            lite.run('INSERT INTO Series(series_id, title, poster, year, runtime, imdb_rating, plot) VALUES(?, ?, ?, ?, ?, ?, ?) ON CONFLICT (series_id) DO NOTHING RETURNING *',
         [relatedMoviesDetails[i].imdbID, relatedMoviesDetails[i].Title, relatedMoviesDetails[i].Poster, relatedMoviesDetails[i].Year, 
         relatedMoviesDetails[i].Runtime, relatedMoviesDetails[i].imdbRating, relatedMoviesDetails[i].Plot], (err, res) => {
          if (err) {
            console.error('Ekleme hatası:', err);
          } else {
            console.log('Yeni kullanıcı eklendi:');
            //console.log('Yeni kullanıcı eklendi:', res.rows[0]);
          }
        });
        }
    }
    else{
        for(let i=0;i<relatedMoviesDetails.length;i++){
          if(relatedMoviesDetails[i].imdbRating=='N/A'){
            relatedMoviesDetails[i].imdbRating=null;
          } 
            lite.run('INSERT INTO Movies(movie_id, title, poster, year, runtime, imdb_rating, plot) VALUES(?, ?, ?, ?, ?, ?, ?) ON CONFLICT (movie_id) DO NOTHING RETURNING *',
         [relatedMoviesDetails[i].imdbID, relatedMoviesDetails[i].Title, relatedMoviesDetails[i].Poster, relatedMoviesDetails[i].Year, 
         relatedMoviesDetails[i].Runtime, relatedMoviesDetails[i].imdbRating, relatedMoviesDetails[i].Plot], (err, res) => {
          if (err) {
            console.error('Ekleme hatası:', err);
          } else {
            console.log('Yeni kullanıcı eklendi:');
            //console.log('Yeni kullanıcı eklendi:', res.rows[0]);
          }
        });
        }
    }    
    


    console.log(movieDetails.Plot);
    console.log(movieDetails.Type);
    console.log("dsadsasdsadsadsadasd");
    console.log(movieDetails);

    ///// comment yazma
    if(login){
      let comment = req.body.comment;
      let username=user.username;
      
      console.log("comment : "+comment);
      console.log("username : "+username);
      if(typeof comment !== 'undefined' && movieDetails.Type==="movie"){
        lite.run('INSERT INTO Reviews(comment, date, user_id, movie_id) VALUES(?, ?, ?, ?) RETURNING *',
        [comment, date,user.user_id, id], (err, res) => {
         if (err) {
           console.error('Ekleme hatası:', err);
         } else {
           console.log('Yeni kullanıcı eklendi:');
         }
       });
      } else if(typeof comment !== 'undefined' && movieDetails.Type==="series"){
        lite.run('INSERT INTO Reviews(comment, date, user_id, series_id) VALUES(?, ?, ?, ?) RETURNING *',
        [comment, date,user.user_id, id], (err, res) => {
         if (err) {
           console.error('Ekleme hatası:', err);
         } else {
           console.log('Yeni kullanıcı eklendi:');
         }
       });
      }
    }
    
    //// comment okuma
    if(movieDetails.Type==="movie"){
      let query = `
      SELECT Reviews.comment, Users.username, Reviews.date
      FROM Reviews
      INNER JOIN Users ON Reviews.user_id = Users.user_id
      INNER JOIN Movies ON Reviews.movie_id = Movies.movie_id
      WHERE Movies.movie_id = ?
    `;
    
    lite.all(query, [id], (err, res) => {
      if (err) {
        console.error(err);
      }
      else{
        commentArray=res;
      }
    });
    }
    else if(movieDetails.Type==="series"){
      let query = `
      SELECT Reviews.comment, Users.username, Reviews.date
      FROM Reviews
      INNER JOIN Users ON Reviews.user_id = Users.user_id
      INNER JOIN Series ON Reviews.series_id = Series.series_id
      WHERE Series.series_id = ?
    `;
    
    lite.all(query, [id], (err, res) => {
      if (err) {
        console.error(err);
      }
      else{
        commentArray=res;
      }
    });
    }
  

await waitOneSec();
console.log("arrrayyyyyy: "+commentArray);


    res.render("movie-details.ejs", {
        movieDetails: movieDetails,
        relatedMoviesDetails: relatedMoviesDetails,
        commentArray: commentArray
    });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});