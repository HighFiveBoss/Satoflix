import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";

const app = express();
const port = 3000;
const APIKey0 = 'e0aa5baafamshba73e975ca7ffdcp19f192jsneed6227668f7';
const APIKey1 = '74c0434c46msh3a062b2096052f9p171104jsnd24893c2aeb7';

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "Satoflixdb",
    password: "salihkara",
    port: 5432,
  });
db.connect();  

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

  try {
    const query = `
      UPDATE Users 
      SET username = $1, email = $2
      WHERE user_id = $3
      RETURNING *`;
    
    const values = [username, email, user.user_id]; 

    const result = await db.query(query, values);
    console.log('Güncellenmiş satır:', result.rows[0]);
    user=result.rows[0];
  } catch (err) {
    console.error('Hata:', err);
  }
  
  res.redirect('/index-profile.ejs');
});

app.post('/password.ejs', async (req, res) => {
  const password = req.body.newPassword;

  try {
    const query = `
      UPDATE Users 
      SET password = $1
      WHERE user_id = $2
      RETURNING *`;
    
    const values = [password, user.user_id]; 

    const result = await db.query(query, values);
    console.log('Güncellenmiş satır:', result.rows[0]);
    user=result.rows[0];
  } catch (err) {
    console.error('Hata:', err);
  }

  res.redirect('/index-profile.ejs');
});

app.post('/login.ejs', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    let flag =false;

    console.log(email);
    console.log(password);

    db.query(
        `SELECT Users.*, Role.*
         FROM Users
         JOIN Role ON Users.role_id = Role.role_id
         WHERE Users.email = $1 AND Users.password = $2`,
        [email, password],
        (err, res) => {
        if (err) {
            console.error('Hata:', err);
          } else {
            console.log('Sonuçlar:', res.rows);
            user=res.rows[0];
          }
        if(res.rows.length>0 && res.rows[0].role_name=="user"){
            console.log("user : "+res.rows[0].username +" log in");
            //res.redirect('/');
            flag=true;
            console.log("sorgu içi flag: "+flag);
           }
        else if(res.rows.length>0 && res.rows[0].role_name=="admin"){
            console.log("admin : "+res.rows[0].username +" log in");
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

    db.query('INSERT INTO Role(role_name) VALUES($1) RETURNING *',
     ["user"], (err, res) => {
        if (err) {
        console.error('Ekleme hatası:', err);
      } else {
        console.log('Yeni kullanıcı eklendi:', res.rows[0]);
      }
    });

    db.query('SELECT role_id FROM Role ORDER BY role_id DESC LIMIT 1', (err, res) => {
        if (err) {
          console.error('Hata:', err);
        } else {
          console.log('Son eklenen veri:', res.rows[0]);
          roleid=res.rows[0];
          let roleidString = roleid.role_id.toString();
          let roleidINTEGER = parseInt(roleidString);

          console.log("sdsadsdadsasad" +typeof roleidINTEGER);
          console.log("aaaaaaaaaaaaaa"+ roleidINTEGER);
          db.query('INSERT INTO Users(username, email, password, role_id) VALUES($1, $2, $3, $4) RETURNING *',
     [username, email, password, roleidINTEGER], (err, res) => {
      if (err) {
        console.error('Ekleme hatası:', err);
      } else {
        console.log('Yeni kullanıcı eklendi:', res.rows[0]);
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


    /* sql insert
    for(let i=0;i<upcomingMoviesDetails.length;i++){
        db.query('INSERT INTO Movies(movie_id, title, poster, year, runtime,imdb_rating, plot) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
     [upcomingMoviesDetails[i].imdbID, upcomingMoviesDetails[i].Title, upcomingMoviesDetails[i].Poster, upcomingMoviesDetails[i].Year,
     upcomingMoviesDetails[i].Runtime, null, upcomingMoviesDetails[i].Plot], (err, res) => {
        if (err) {
        console.error('Ekleme hatası:', err);
      } else {
        console.log('Yeni kullanıcı eklendi:', res.rows[0]);
      }
    });
    }
    */

    db.query('SELECT * FROM Movies WHERE imdb_rating IS NULL AND (year = \'2023\' OR year = \'2024\')', (err, res) => {
        if (err) {
          console.error('Hata:', err);
        } else {
          console.log('Sonuçlar:', res.rows);
          upcomingMovies=res.rows;
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

   //console.log(topRatedMoviesDetails);
  /* sql insert
   for(let i=0;i<topRatedMoviesDetails.length;i++){
    db.query('INSERT INTO Movies(movie_id, title, poster, year, runtime, imdb_rating, plot) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
     [topRatedMoviesDetails[i].imdbID, topRatedMoviesDetails[i].Title, topRatedMoviesDetails[i].Poster, topRatedMoviesDetails[i].Year, 
     topRatedMoviesDetails[i].Runtime, topRatedMoviesDetails[i].imdbRating, topRatedMoviesDetails[i].Plot], (err, res) => {
      if (err) {
        console.error('Ekleme hatası:', err);
      } else {
        console.log('Yeni kullanıcı eklendi:', res.rows[0]);
      }
    });
   }
*/

db.query('SELECT * FROM Movies WHERE imdb_rating > 0 ORDER BY imdb_rating DESC LIMIT 8', (err, res) => {
    if (err) {
      console.error('Hata:', err);
    } else {
      console.log('Sonuçlar:', res.rows);
      topRatedMovies=res.rows;     
    }
  });
  await waitOneSec();


/*
    const topRatedSeriesDetails = await Promise.all(
        topRatedSeriesIds.map(async (topRatedSeriesId) => {
            const { imdbID, Title, Poster, Year, Runtime, imdbRating, Plot} = await getDetails(topRatedSeriesId);
            return { imdbID, Title, Poster, Year, Runtime, imdbRating, Plot };
        })
    );
    */

    //console.log(topRatedSeriesDetails);
/* sql insert
    for(let i=0;i<topRatedSeriesDetails.length;i++){
        db.query('INSERT INTO Series(series_id, title, poster, year, runtime, imdb_rating, plot) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
     [topRatedSeriesDetails[i].imdbID, topRatedSeriesDetails[i].Title, topRatedSeriesDetails[i].Poster, topRatedSeriesDetails[i].Year, 
     topRatedSeriesDetails[i].Runtime, topRatedSeriesDetails[i].imdbRating, topRatedSeriesDetails[i].Plot], (err, res) => {
      if (err) {
        console.error('Ekleme hatası:', err);
      } else {
        console.log('Yeni kullanıcı eklendi:', res.rows[0]);
      }
    });
    }
  */ 

    db.query('SELECT * FROM Series WHERE imdb_rating > 0 ORDER BY imdb_rating DESC LIMIT 4', (err, res) => {
        if (err) {
          console.error('Hata:', err);
        } else {
          console.log('Sonuçlar:', res.rows);
          topRatedSeries=res.rows;
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


  /* sql insert
  for(let i=0;i<upcomingMoviesDetails.length;i++){
      db.query('INSERT INTO Movies(movie_id, title, poster, year, runtime,imdb_rating, plot) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
   [upcomingMoviesDetails[i].imdbID, upcomingMoviesDetails[i].Title, upcomingMoviesDetails[i].Poster, upcomingMoviesDetails[i].Year,
   upcomingMoviesDetails[i].Runtime, null, upcomingMoviesDetails[i].Plot], (err, res) => {
      if (err) {
      console.error('Ekleme hatası:', err);
    } else {
      console.log('Yeni kullanıcı eklendi:', res.rows[0]);
    }
  });
  }
  */

  db.query('SELECT * FROM Movies WHERE imdb_rating IS NULL AND (year = \'2023\' OR year = \'2024\')', (err, res) => {
      if (err) {
        console.error('Hata:', err);
      } else {
        console.log('Sonuçlar:', res.rows);
        upcomingMovies=res.rows;
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

 //console.log(topRatedMoviesDetails);
/* sql insert
 for(let i=0;i<topRatedMoviesDetails.length;i++){
  db.query('INSERT INTO Movies(movie_id, title, poster, year, runtime, imdb_rating, plot) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
   [topRatedMoviesDetails[i].imdbID, topRatedMoviesDetails[i].Title, topRatedMoviesDetails[i].Poster, topRatedMoviesDetails[i].Year, 
   topRatedMoviesDetails[i].Runtime, topRatedMoviesDetails[i].imdbRating, topRatedMoviesDetails[i].Plot], (err, res) => {
    if (err) {
      console.error('Ekleme hatası:', err);
    } else {
      console.log('Yeni kullanıcı eklendi:', res.rows[0]);
    }
  });
 }
*/

db.query('SELECT * FROM Movies WHERE imdb_rating > 0 ORDER BY imdb_rating DESC LIMIT 8', (err, res) => {
  if (err) {
    console.error('Hata:', err);
  } else {
    console.log('Sonuçlar:', res.rows);
    topRatedMovies=res.rows;     
  }
});
await waitOneSec();


/*
  const topRatedSeriesDetails = await Promise.all(
      topRatedSeriesIds.map(async (topRatedSeriesId) => {
          const { imdbID, Title, Poster, Year, Runtime, imdbRating, Plot} = await getDetails(topRatedSeriesId);
          return { imdbID, Title, Poster, Year, Runtime, imdbRating, Plot };
      })
  );
  */

  //console.log(topRatedSeriesDetails);
/* sql insert
  for(let i=0;i<topRatedSeriesDetails.length;i++){
      db.query('INSERT INTO Series(series_id, title, poster, year, runtime, imdb_rating, plot) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
   [topRatedSeriesDetails[i].imdbID, topRatedSeriesDetails[i].Title, topRatedSeriesDetails[i].Poster, topRatedSeriesDetails[i].Year, 
   topRatedSeriesDetails[i].Runtime, topRatedSeriesDetails[i].imdbRating, topRatedSeriesDetails[i].Plot], (err, res) => {
    if (err) {
      console.error('Ekleme hatası:', err);
    } else {
      console.log('Yeni kullanıcı eklendi:', res.rows[0]);
    }
  });
  }
*/ 

  db.query('SELECT * FROM Series WHERE imdb_rating > 0 ORDER BY imdb_rating DESC LIMIT 4', (err, res) => {
      if (err) {
        console.error('Hata:', err);
      } else {
        console.log('Sonuçlar:', res.rows);
        topRatedSeries=res.rows;
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
            db.query('INSERT INTO Series(series_id, title, poster, year, runtime, imdb_rating, plot) VALUES($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (series_id) DO NOTHING RETURNING *',
         [relatedMoviesDetails[i].imdbID, relatedMoviesDetails[i].Title, relatedMoviesDetails[i].Poster, relatedMoviesDetails[i].Year, 
         relatedMoviesDetails[i].Runtime, relatedMoviesDetails[i].imdbRating, relatedMoviesDetails[i].Plot], (err, res) => {
          if (err) {
            console.error('Ekleme hatası:', err);
          } else {
            console.log('Yeni kullanıcı eklendi:', res.rows[0]);
          }
        });
        }
    }
    else{
        for(let i=0;i<relatedMoviesDetails.length;i++){
          if(relatedMoviesDetails[i].imdbRating=='N/A'){
            relatedMoviesDetails[i].imdbRating=null;
          } 
            db.query('INSERT INTO Movies(movie_id, title, poster, year, runtime, imdb_rating, plot) VALUES($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (movie_id) DO NOTHING RETURNING *',
         [relatedMoviesDetails[i].imdbID, relatedMoviesDetails[i].Title, relatedMoviesDetails[i].Poster, relatedMoviesDetails[i].Year, 
         relatedMoviesDetails[i].Runtime, relatedMoviesDetails[i].imdbRating, relatedMoviesDetails[i].Plot], (err, res) => {
          if (err) {
            console.error('Ekleme hatası:', err);
          } else {
            console.log('Yeni kullanıcı eklendi:', res.rows[0]);
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
        db.query('INSERT INTO Reviews(comment, date, user_id, movie_id) VALUES($1, $2, $3, $4) RETURNING *',
        [comment, date,user.user_id, id], (err, res) => {
         if (err) {
           console.error('Ekleme hatası:', err);
         } else {
           console.log('Yeni kullanıcı eklendi:', res.rows[0]);
         }
       });
      } else if(typeof comment !== 'undefined' && movieDetails.Type==="series"){
        db.query('INSERT INTO Reviews(comment, date, user_id, series_id) VALUES($1, $2, $3, $4) RETURNING *',
        [comment, date,user.user_id, id], (err, res) => {
         if (err) {
           console.error('Ekleme hatası:', err);
         } else {
           console.log('Yeni kullanıcı eklendi:', res.rows[0]);
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
      WHERE Movies.movie_id = $1
    `;
    
    db.query(query, [id], (err, res) => {
      if (err) {
        console.error(err);
      }
      else{
        commentArray=res.rows;
        console.log(res.rows);
        console.log(res.rows.length);
        console.log("commentssssssssss :"+res.rows[0]);
      }
    });
    }
    else if(movieDetails.Type==="series"){
      let query = `
      SELECT Reviews.comment, Users.username, Reviews.date
      FROM Reviews
      INNER JOIN Users ON Reviews.user_id = Users.user_id
      INNER JOIN Series ON Reviews.series_id = Series.series_id
      WHERE Series.series_id = $1
    `;
    
    db.query(query, [id], (err, res) => {
      if (err) {
        console.error(err);
      }
      else{
        commentArray=res.rows;
        console.log(res.rows);
        console.log(res.rows.length);
        console.log("commentssssssssss :"+res.rows[0]);
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