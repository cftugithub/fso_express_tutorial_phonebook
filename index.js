const express = require("express");
const app = express();

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
app.get("/api/info", (req, res) => {
  const numPersons = persons.length;

  const date = new Date();
  const dataToSend = `
    <p>Phonebook has info for ${numPersons} people</p>
    <p>${date}</p>
    `;

  res.send(dataToSend);
});

// get all persons
app.get("/api/persons", (req, res) => {
  res.json(persons);
});

const generateId = () => {
  return Math.floor(Math.random() * 1000);
};

// create a person
app.post("/api/persons", (req, res) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "content missing",
    });
  }

  const nameToCheck = body.name;
  console.log(nameToCheck);

  if (!persons.find((person) => person.name === nameToCheck)) {
    const person = {
      name: body.name,
      number: body.number,
      id: generateId(),
    };

    persons = persons.concat(person);
    console.log(person);
    res.json(person);
  } else {
    return res.status(400).json({
      error: "name must be unique",
    });
  }
});

// get one person
app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);

  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

// delete a person
app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  console.log(id);
  persons = persons.filter((person) => person.id !== id);

  res.status(204).end();
});

// listening
const PORT = process.env.PORT || 3002;
app.listen(PORT);
console.log(`running on port ${PORT}`);
