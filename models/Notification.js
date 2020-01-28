const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
	recipient: {
		type: String,
		required: true,
		min: 2,
		max: 255
	},
	sender: {
		type: String,
		required: true,
		min: 2,
		max: 255
	},
	read: {
		type: String,
		required: true,
		min: 2,
		max: 50
	},
	screamId: {
		type: String,
		required: true,
		min: 2,
		max: 255
	},
	type: {
		type: String,
		required: true,
		min: 2,
		max: 50
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model("Notification", notificationSchema);
