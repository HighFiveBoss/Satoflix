import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;
const APIKey0 = 'e0aa5baafamshba73e975ca7ffdcp19f192jsneed6227668f7';
const APIKey1 = '74c0434c46msh3a062b2096052f9p171104jsnd24893c2aeb7';

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

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function waitOneSec() {
    console.log('start timer');
    await delay(750);
    console.log('after 1 second');
}

//randomMovieImageLink1 randomMovie1 randomMovieDate1 randomMovieResolution1 randomMovieDurationTime1 randomMovieRating1

app.get("/", async (req, res) => {
    const upcomingMovies = await getUpcomingMovies(4),
        topRatedMovies = await getTopRatedMovies(8),
        topRatedSeries = await getTopRatedSeries(4);


    const upcomingMoviesIds = upcomingMovies.map(item => item.id.slice(7, -1)),
        topRatedMoviesIds = topRatedMovies.map(item => item.id.slice(7, -1)),
        topRatedSeriesIds = topRatedSeries.map(item => item.id.slice(7, -1));

    const upcomingMoviesDetails = await Promise.all(
        upcomingMoviesIds.map(async (upcomingMovieId) => {
            const { imdbID, Title, Poster, Year } = await getDetails(upcomingMovieId);
            return { imdbID, Title, Poster, Year };
        })
    );
    await waitOneSec();
        
    const topRatedMoviesDetails = await Promise.all(
        topRatedMoviesIds.map(async (topRatedMovieId) => {
            const { imdbID, Title, Poster, Year, Runtime, imdbRating } = await getDetails(topRatedMovieId);
            return { imdbID, Title, Poster, Year, Runtime, imdbRating };
        })
    );

   await waitOneSec();

    const topRatedSeriesDetails = await Promise.all(
        topRatedSeriesIds.map(async (topRatedSeriesId) => {
            const { imdbID, Title, Poster, Year, Runtime, imdbRating } = await getDetails(topRatedSeriesId);
            return { imdbID, Title, Poster, Year, Runtime, imdbRating };
        })
    );

    res.render("index.ejs", {
        upcomingMovies: upcomingMoviesDetails,
        topRatedMovies: topRatedMoviesDetails,
        topRatedSeries: topRatedSeriesDetails
    });
});

app.post("/movie-details.ejs", async (req, res) => {
    const id = req.body["movieId"];

    const movieDetails = await getDetails(id);

    const relatedMoviesIds = await getMoreLikeThis(id, 4);


    const relatedMoviesDetails = await Promise.all(
        relatedMoviesIds.map(async (relatedMoviesId) => {
            const { imdbID, Title, Poster, Year, Runtime, imdbRating } = await getDetails(relatedMoviesId.slice(7, -1));
            return { imdbID, Title, Poster, Year, Runtime, imdbRating };
        })
    );


    res.render("movie-details.ejs", {
        movieDetails: movieDetails,
        relatedMoviesDetails: relatedMoviesDetails
    });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});