require("dotenv").config();
const express = require("express");
const res = require("express/lib/response");
const morgan = require("morgan");
const app = express();
const db = require("./db");
const cors = require("cors");

// Logs response status and time (ms)
app.use(morgan("dev"));

// Middleware
// If define before route handlers, will be executed first
// Without next(), will drop the original request (GET, POST, PUT, ...)
app.use((req, res, next) => {
    // res.status(404).json({
    //     status: 'fail'
    // });
    console.log('YAY MIDDLEWARE')
    next();
});

// Allow CORS
app.use(cors())
// Convert client's response from JSON to Javascript object
app.use(express.json());

// GET all restaurants
app.get("/api/v1/restaurants", async (req, res) => {
    try {
        const restaurantRatingsData = await db.query(
            "SELECT * FROM restaurants LEFT JOIN (SELECT restaurant_id, COUNT(*), TRUNC(AVG(rating),1) AS average_rating FROM reviews GROUP BY restaurant_id) reviews ON restaurants.id = reviews.restaurant_id;"
        );

        res.status(200).json({
            status: "success",
            results: restaurantRatingsData.rows.length,
            data: {
                restaurants: restaurantRatingsData.rows
            },
        });
    } catch (err) {
        console.log('ERROR: ', err);
    }

});

// GET a restaurant
app.get("/api/v1/restaurants/:id", async (req, res) => {
    console.log(req.params.id);
    try {
        // Use $1 to prevent SQL injection attacks
        const restaurant = await db.query(
            "SELECT * FROM restaurants LEFT JOIN (SELECT restaurant_id, COUNT(*), TRUNC(AVG(rating),1) AS average_rating FROM reviews GROUP BY restaurant_id) reviews ON restaurants.id = reviews.restaurant_id where id=$1;", [req.params.id]
        );

        // Get all reviews for restaurant
        const reviews = await db.query(
            "select * from reviews where restaurant_id=$1", [req.params.id]
        );

        res.status(200).json({
            status: "success",
            data: {
                restaurant: restaurant.rows[0],
                reviews: reviews.rows
            },
        });

    } catch (err) {
        console.log('ERROR: ', err);
    }
    console.log(req);

});

// CREATE a restaurant
app.post("/api/v1/restaurants", async (req, res) => {
    try {
        const results = await db.query(
            "INSERT INTO restaurants (name, location, price_range) values ($1, $2, $3) returning *",
            [req.body.name, req.body.location, req.body.price_range]
        );
        res.status(201).json({
            status: "success",
            data: {
                restaurant: results.rows[0]
            },
        });
    } catch (err) {
        console.log('ERROR: ', err);
    }

});

// UPDATE restaurant
app.put("/api/v1/restaurants/:id", async (req, res) => {
    try {
        const results = await db.query(
            "UPDATE restaurants SET name=$1, location=$2, price_range=$3 where id=$4 returning *",
            [req.body.name, req.body.location, req.body.price_range, req.params.id]
        );
        res.status(200).json({
            status: "success",
            data: {
                restaurant: results.rows[0]
            },
        })
    } catch (err) {
        console.log('ERROR: ', err);
    }

});

// DELETE restaurant
app.delete("/api/v1/restaurants/:id", async (req, res) => {
    try {
        const results = await db.query(
            "DELETE FROM restaurants where id=$1",
            [req.params.id]
        );
        res.status(200).json({
            status: "success",
        })
    } catch (err) {
        console.log('ERROR: ', err);
    }
});

app.post("/api/v1/restaurants/:id/addReview", async (req, res) => {
    try {
        const newReview = await db.query(
            "INSERT INTO reviews (restaurant_id, name, content, rating) values ($1, $2, $3, $4) returning *",
            [req.params.id, req.body.name, req.body.content, req.body.rating]
        );
        res.status(201).json({
            status: "success",
            data: {
                review: newReview.rows[0]
            }
        })

    } catch (err) {
        console.log('ERROR: ', err);
    }
})

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`You are listening on PORT ${port}`)
});