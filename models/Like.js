const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
	userHandle: {
		type: String,
		required: true,
		min: 2,
		max: 255
	},
	screamId: {
		type: String,
		required: true,
		min: 2
	},
	date: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model("Like", likeSchema);
