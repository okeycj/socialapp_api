const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
// Import Routes
const authRoute = require("./routes/auth");
const screamRoute = require("./routes/scream");

dotenv.config();

// Connect to db
mongoose.connect(
	process.env.DB_CONNECT,
	{
		useUnifiedTopology: true,
		useNewUrlParser: true,
		useFindAndModify: false
	},
	() => console.log("connected to db")
);

// Middleware
app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use(cors());
// Route Middlewares
app.use("/api/user", authRoute);
app.use("/api/scream", screamRoute);
app.listen(5000, () => console.log("Server Up and Running"));
