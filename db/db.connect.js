const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

const mongoURI = process.env.MONGO_URI;

const initialization = async () => {
  try {
    const connectDb = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    if (connectDb) console.log("Connected to DB");
  } catch (error) {
    console.log(error);
  }
};

module.exports = { initialization };
