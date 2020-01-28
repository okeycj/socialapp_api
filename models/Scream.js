const mongoose = require("mongoose");

const screamSchema = new mongoose.Schema({
	userHandle: {
		type: String,
		required: true,
		min: 2,
		max: 255
	},
	body: {
		type: String,
		required: true,
		min: 6
	},
	userImage: {
		type: String,
		required: true,
		min: 3
	},
	likeCount: {
		type: Number,
		required: true
	},
	commentCount: {
		type: Number,
		required: true
	},
	date: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model("Scream", screamSchema);
