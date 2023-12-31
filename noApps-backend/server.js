const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const Stream= require('stream'  )
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());
// MongoDB connection
const MONGODB_URI = process.env.MONGO_URI
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once("open", () => {
  console.log("Connected to MongoDB!");
});

// Defining the MongoDB Schema for the "user" collection
// const userSchema = new mongoose.Schema(
//   {
//     id: { type: String },
//     first_name: { type: String },
//     last_name: { type: String },
//     country_code: { type: String },
//     whatsapp_number: { type: Number },
//     email: { type: String },
//     tags: { type: String },
//   },
//   { timestamps: true }
// );

let User = db.collection("user");
console.log("User",User);

const storage = multer.memoryStorage();
  
  const upload = multer({ storage: storage }).single("csvFile");
  
  // Route for file upload and data insertion
  app.post("/upload", (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(502).json({ error: "Error uploading file",err });
      }
  
      // Reading the uploaded file and inserting data into the database
      const results = [];
      Stream.Readable.from(req.file.buffer)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", async () => {
          try {
            // Inserting data into the MongoDB database
            console.log("results----",results,results.length);
            console.log("after await----");
            return res.json({ message: "Data stored successfully",recordsProcessed:results.length });
          } catch (error) {
            console.error("Error storing data:", error);
            return res.status(500).json({ error: "Error storing data",error });
          }
        });
    });
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
