if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();

// import the model
const Person = require("./models/person");

const morgan = require("morgan");

// use cors (cross origin resource sharing)
const cors = require("cors");
app.use(cors());

//use json parser
app.use(express.json());

// display front end from static files
app.use(express.static("dist"));

morgan.token("content", function (req, res) {
  //console.log(req.body);
  return JSON.stringify(req.body);
});

// use middleware
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms - :content"
  )
);

// hardcode data
let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

// routes
app.get("/", (req, res) => {
  res.send("<h1>Hello world!</h1>");
});

// get info
app.get("/api/info", async (req, res) => {
  // change this to read from MongoDB

  //const numPersons = persons.length;
  const numPersons = await Person.countDocuments();

  const date = new Date();
  const dataToSend = `
    <p>Phonebook has info for ${numPersons} people</p>
    <p>${date}</p>
    `;

  res.send(dataToSend);
});

// get all persons
app.get("/api/persons", (req, res) => {
  //res.json(persons);
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

const generateId = () => {
  return Math.floor(Math.random() * 1000);
};

// create a person
app.post("/api/persons", (req, res, next) => {
  const body = req.body;

  if (body.name === undefined || body.number === undefined) {
    return res.status(400).json({
      error: "content missing",
    });
  }

  const nameToCheck = body.name;
  console.log(nameToCheck);

  // find the document by name
  const personSearch = Person.findOne({ name: nameToCheck }).then((person) => {
    if (person) {
      console.log("found", person);
    } else {
      console.log("adding new person");
      const person = new Person({
        name: body.name,
        number: body.number,
      });

      // save the person
      person
        .save()
        .then((savedPerson) => {
          res.json(savedPerson);
        })
        .catch((error) => next(error));
    }
  });
});

// get one person
// use the DB
app.get("/api/persons/:id", async (req, res) => {
  const id = req.params.id;
  const person = await Person.findById(id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

// delete a person
// using findByIdAndRemove
app.delete("/api/persons/:id", (req, res, next) => {
  // const id = Number(req.params.id);
  // console.log(id);
  // persons = persons.filter((person) => person.id !== id);

  // res.status(204).end();
  Person.findByIdAndRemove(req.params.id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

// update a person
app.put("/api/persons/:id", (req, res, next) => {
  const body = req.body;
  const person = {
    name: body.name,
    number: body.number,
  };

  // add validations when updating
  Person.findByIdAndUpdate(req.params.id, person, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatedPerson) => {
      res.json(updatedPerson);
    })
    .catch((error) => next(error));
});

// unknown route handler - second to last to use
// this should come after the routes
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

// error handler - last one to use
// this should be the last middleware loaded
const errorHandler = (error, request, response, next) => {
  console.error(error.message);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformed id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).send({ error: error.message });
  }
  next(error);
};

app.use(errorHandler);

// listening
const PORT = process.env.PORT || 3002;
app.listen(PORT);
console.log(`running on port ${PORT}`);
