const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
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
	screamId: {
		type: String,
		required: true
	},
	userImage: {
		type: String,
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model("Comment", commentSchema);
