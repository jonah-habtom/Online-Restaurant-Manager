const express = require("express");
const fs = require("fs");
let app = express();

app.set("view engine", "pug");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));


let restaurants = {};  //Holds each restaurant in the system as an object
let idArray = [];      //Holds the id of each restaurant
let uniqueId = 3;      //Variable to be incremented each time a new restaurant is added to ensure each restaurant has a unique id

//Reads the restaurant information
fs.readdir("./restaurants", (err, files) => {
    if (err) {
        console.log(err);
        return;
    } 
    //Loops through all the files and stores the data for the JSON files
    for (let i=0; i < files.length; i++) {
        if (files[i].endsWith(".json")) {
            let restaurant = require("./restaurants/" + files[i]);
            restaurants[restaurant.id] = restaurant;    //Adds restaurant object to the restaurants object
            idArray.push(restaurant.id);  //Adds the id of the restaurant to the array of ids
        }
    }

    //Starts the server after loading each restaurant
    app.listen(3000);
    console.log("Server listening at http://localhost:3000");
});

//Route handlers to display the home page and page to add a new restaurant
app.get("/", (req, res) => {res.render("home");});
app.get("/addrestaurant", (req,res) => {res.render("add", {restaurants: restaurants});});

//Route handler for /restaurants
app.get("/restaurants", (req,res) => {res.format({
        //Displays the page with the a list of restaurants if html is requested
        "text/html": () => {
            res.set("Content-Type", "text/html");
            res.render("browse", {restaurants: restaurants});
        },
        //Sends a json object with the array of restaurant ids
        "application/json": () => {
            res.set("Content-Type", "application/json");
            res.status(200);
            res.json({"restaurants": idArray});
        },
        "default": () => {
            res.status(406);
            res.send("Not acceptable");
        }
    });
});

//Route handler for a specific restaurant
app.get("/restaurants/:restID", (req,res) => {
    let id = req.params.restID;

    res.format({
        //Attempts to send the page with all the restaurant data if html is requested
        "text/html": () => {
            //Looks for the id in the restaurants object and renders the html page for the given restaurant
            if (restaurants.hasOwnProperty(id)) {
                res.set("Content-Type", "text/html");
                res.render("restaurant", {restaurant: restaurants[id]});
            } else {
                //Sends a 404 status if the id does not exist
                res.status(404);
                res.send("The restaurant with ID " + id + " does not exist");
            }
        },
        //Sends the restaurant object as json if json is requested
        "application/json": () => {
            res.set("Content-Type", "application/json");
            res.status(200);
            res.json(restaurants[id]);
        },
        "default": () => {
            res.status(406);
            res.send("Not acceptable");
        }
    });
});

//Handles post requested when a new restaurant is sent to the server
app.post("/restaurants", (req,res) => {
    let newRestaurant = req.body;
    
    //Sends a 400 bad request status if the data for the new restaurant is invalid
    if (newRestaurant["name"] == "" || newRestaurant["delivery_fee"] == null || newRestaurant["min_order"] == null || newRestaurant["delivery_fee"] < 0 || newRestaurant["min_order"] < 0) {
        res.status(400);
        res.send("New restaurant data is not valid");
    } else {
        //Create a new restaurant object that assigns the restaurant a unique id, an empty menu, and fills in the name, min order and delivery fee keys
        let newRestaurantObj = {id: uniqueId, name: newRestaurant["name"], min_order: newRestaurant["min_order"], delivery_fee: newRestaurant["delivery_fee"], menu: {}};

        //Adds the restaurant to the restaurants object and increments the unique id for the next restaurant to be added
        restaurants[uniqueId] = newRestaurantObj;
        idArray.push(uniqueId);
        uniqueId++;

        res.status(201);
        res.json(newRestaurantObj);
    }
});

//Route handler for put requests, which handle updating the data for a specific restaurant
app.put("/restaurants/:restID", (req, res) => {
    let id = req.params.restID;

    //Assigns the body of the request to the restaurant with the id in the restaurants object to update it with new data
    if(restaurants.hasOwnProperty(id)) {
        restaurants[id] = req.body;
        res.status(200);
        //Sends empty request to client to notify that the data has been updated successfully
        res.send();
    } else {
        //Sends a 404 error if the id does not exist
        res.status(404);
        res.send("ID does not exist in server.")
    }
});