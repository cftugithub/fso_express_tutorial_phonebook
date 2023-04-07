const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
const url = process.env.MONGODB_URI;

console.log("connecting to mongodb");

mongoose
  .connect(url)
  .then((result) => {
    console.log("connected to mongodb");
  })
  .catch((error) => {
    console.log("error connecting to mongodb:", error.message);
  });

// define schema for a person
const personSchema = new mongoose.Schema({
  // add validations
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    minlength: 8,
    required: true,
    validate: {
      validator: (n) => {
        const testexp = /\d{2,3}-\d{5,}|\d{8,/;
        return testexp.test(n);
      },
    },
  },
});

// set the schema using transform
personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
