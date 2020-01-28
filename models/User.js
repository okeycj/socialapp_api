const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	userHandle: {
		type: String,
		required: true,
		min: 6,
		max: 255
	},
	email: {
		type: String,
		required: true,
		max: 255,
		min: 6
	},
	password: {
		type: String,
		required: true,
		max: 1024,
		min: 6
	},
	profilePics: {
		type: String,
		required: true,
		min: 2
	},
	bio: {
		type: String
	},
	website: {
		type: String
	},
	location: {
		type: String
	},
	date: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model("User", userSchema);
