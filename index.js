// implement your API here
const express = require('express');
const db = require('./data/db.js');
const server = express();

server.use(express.json());

server.get("/", (req, res) => {
    res.send({ api: 'api is up and running...' });
});

// Creates a user using the information sent inside the `request body`.
server.post("/users", (req, res) => {

    // Get the data the client sent
    const userData = req.body; // Express does not know how to parse JSON

    if (!userData.name || !userData.bio) {
        res
            .status(400)
            .json({ errorMessage: 'Please provide a name and bio for the user.' });
    }

    // Call the db and add the user
    db
        .insert(userData)
        .then(({ id }) => {
            db
                .findById(id)
                .then(addedUser => {
                    res
                        .status(201)
                        .json(addedUser);
                })
                .catch(error => {
                    console.log('error on POST /user', error);
                    res
                        .status(500)
                        .json({ errorMessage: 'There was an error while saving the user to the database' })
                });
        })
})

// Returns an array of all the user objects contained in the database.
server.get("/users", (req, res) => {

    db
        .find()
        .then((users) => {
            res.status(200).json(users);
        })
        .catch((error) => {
            console.log('error on the GET/users', error);
            res
                .status(500)
                .json({ errorMessage: 'The users information could not be retrieved.' });
        });
});

// Returns the user object with the specified `id`.
server.get("/users/:id", (req, res) => {
    const { id } = req.params;

    db
        .findById(id)
        .then((user) => {
            console.log(user);
            if (user) {
                res
                    .status(200)
                    .json(user);
            } else {
                res
                    .status(404)
                    .json({ errorMessage: 'The user with the specified ID does not exist.' });
            }
        })
        .catch((error) => {
            console.log(error);
            res
                .status(500)
                .json({ errorMessage: 'The user information could not be retrieved.' });
        });
});

// Removes the user with the specified `id` and returns the deleted user.
server.delete("/users/:id", (req, res) => {
    const { id } = req.params;

    db
        .remove(id)
        .then((deleted) => {
            if (deleted) {
                res
                    .status(200)
                    .json({ errorMessage: 'User removed successfully.' });
            } else {
                res
                    .status(404)
                    .json({ errorMessage: 'The user with the specified ID does not exist.' });
            }
        })
        .catch((error) => {
            console.log('error on the DELETE/users/', error);
            res
                .status(500)
                .json({ errorMessage: 'The user could not be removed.' });
        });
});

// Updates the user with the specified `id` using data from the `request body`. Returns the modified document, NOT the origial.
server.put("/users/:id", (req, res) => {
    const { id } = req.params;
    const { name, bio } = req.body;

    if (!name || !bio) {
        res
            .status(400)
            .json({ errorMessage: 'Please provide a name and bio for the user.' });

        return;
    }

    db
        .update(id, { name, bio })
        .then((updated) => {
            if (updated) {
                db
                    .findById(id)
                    .then((user) =>
                        res
                            .status(200)
                            .json(user)).catch((error) => {
                                console.log(error);
                                res
                                    .status(500)
                                    .json({ errorMessage: 'The user informatmion could not be retrieved.' });
                            });
            } else {
                res
                    .status(404)
                    .json({ errorMessage: 'The user with the specified ID does not exist.' });
            }
        })
        .catch((error) => {
            console.log(error);
            res
                .status(500)
                .json({ errorMessage: 'The user information could not be modified.' });
        });
})


const port = 4000;
server.listen(port, () =>
    console.log(`\n ** API running on port ${port} **\n`)
);