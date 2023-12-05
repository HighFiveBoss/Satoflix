import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;
const APIKey = '92c82bfb05msh7f5fda15c6bcfa4p104ebfjsnee15a1104b2d';

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
            'X-RapidAPI-Key': APIKey,
            'X-RapidAPI-Host': 'imdb8.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options);
        return response.data.slice(0 , limit);
    } catch (error) {
        console.error(error);
    }
}

async function getTopRatedMovies(limit = 20) {

    const options = {
        method: 'GET',
        url: 'https://imdb8.p.rapidapi.com/title/get-top-rated-movies',
        headers: {
            'X-RapidAPI-Key': APIKey,
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
            'X-RapidAPI-Key': APIKey,
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
        url: 'https://imdb8.p.rapidapi.com/title/get-overview-details',
        params: {
            tconst: id,
            currentCountry: 'US'
        },
        headers: {
            'X-RapidAPI-Key': APIKey,
            'X-RapidAPI-Host': 'imdb8.p.rapidapi.com'
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
            'X-RapidAPI-Key': APIKey,
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

app.get("./login.ejs", (req, res) => {
    res.render("login.ejs");
});


//randomMovieImageLink1 randomMovie1 randomMovieDate1 randomMovieResolution1 randomMovieDurationTime1 randomMovieRating1

app.get("/", async (req, res) => {
    const upcomingMovies = await getUpcomingMovies(4),
        topRatedMovies = await getTopRatedMovies(8),
        topRatedSeries = await getTopRatedSeries(4);


    const upcomingMoviesIds = upcomingMovies.map(item => item.id.slice(7, -1)),
    topRatedMoviesIds = topRatedMovies.map(item => item.id.slice(7, -1)),
    topRatedSeriesIds = topRatedSeries.map(item => item.id.slice(7, -1));

    const upcomingMoviesDetails = [];

    for (const upcomingMovieId of upcomingMoviesIds) {
        const { id, title: { image: { url }, title, year } } = await getDetails(upcomingMovieId); 
        upcomingMoviesDetails.push({ id, url, title, year });
    };

    const topRatedMoviesDetails = [];

    for (const topRatedMovieId of topRatedMoviesIds) {
        const { id, title: { image: { url }, runningTimeInMinutes, title, year }, ratings: { rating } } = await getDetails(topRatedMovieId);
        topRatedMoviesDetails.push({ id, url, title, year, runningTimeInMinutes, rating});
    };

    const topRatedSeriesDetails = [];

    for (const topRatedSeriesId of topRatedSeriesIds) {
        const { id, title: { image: { url }, runningTimeInMinutes, title, year}, ratings: { rating } } = await getDetails(topRatedSeriesId);
        topRatedSeriesDetails.push({ id, url, runningTimeInMinutes, title, year, rating});
    };



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

    const relatedMoviesDetails = [];
    for (const relatedMoviesId of relatedMoviesIds) {
        const { id, title: { image: { url }, runningTimeInMinutes, title, year}, ratings: { rating } } = await getDetails(relatedMoviesId.slice(7, -1));
        relatedMoviesDetails.push({ id, url, runningTimeInMinutes, title, year, rating});
    };


    res.render("movie-details.ejs", {
        movieDetails: movieDetails,
        relatedMoviesDetails: relatedMoviesDetails
    });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});