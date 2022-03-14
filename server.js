require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();

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

// Convert client's response from JSON to Javascript object
app.use(express.json());

// GET all restaurants
app.get("/api/v1/restaurants", (req, res) => {
    console.log('route handler ran')
    res.status(200).json({
        status: "success",
        data: {
            restaurant: ["mcdonalds", "wendys"]
        },
    })
});

// GET a restaurant
app.get("/api/v1/restaurants/:id", (req, res) => {
    console.log(req);
})

// CREATE a restaurant
app.post("/api/v1/restaurants", (req, res) => {
    console.log(req.body)
})

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`You are listening on PORT ${port}`)
});