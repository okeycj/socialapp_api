const router = require("express").Router();
const User = require("../models/User");
const Likes = require("../models/Like");
const Scream = require("../models/Scream");
const Notification = require("../models/Notification");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const { auth } = require("./verifyToken");
const {
	registerValidation,
	loginValidation,
	userDetailsValidation
} = require("../validation");
const multer = require("multer");

const storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, "./uploads/");
	},
	filename: function(req, file, cb) {
		cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
	}
});

const fileFilter = (req, file, cb) => {
	if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
		cb(null, true);
	} else {
		req.err = "image type is not supported";
		cb(null, false);
	}
};

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 1024 * 1024 * 5
	},
	fileFilter: fileFilter
});

router.post("/register", async (req, res) => {
	// LET VALIDATE THE DATA BEFORE WE SAVE
	const { error } = registerValidation(req.body);
	if (error) {
		if (/confirmPassword/.test(error.details[0].message))
			return res
				.status(400)
				.json({ confirmPassword: "confirm password must be same as password" });
		else return res.status(400).json({ error: error.details[0].message });
	}
	// Checking if the user is already in the database
	const emailExist = await User.findOne({ email: req.body.email });
	if (emailExist)
		return res.status(400).json({ general: "Email already exists" });
	const handleExist = await User.findOne({ userHandle: req.body.userHandle });
	if (handleExist)
		return res.status(400).json({ general: "Userhandle already exists" });

	// Hash the password
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(req.body.password, salt);

	const user = new User({
		userHandle: req.body.userHandle,
		email: req.body.email,
		password: hashedPassword,
		profilePics: "http://localhost:5000/uploads/profile.png",
		bio: "",
		website: "",
		location: ""
	});
	try {
		const savedUser = await user.save();
		// console.log(savedUser);
		const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
		res.header("auth_token", token).json({ token });
	} catch (err) {
		res.status(400).json({ general: err });
	}
});

router.post("/login", async (req, res) => {
	// LET VALIDATE THE DATA BEFORE WE SAVE
	const { error } = loginValidation(req.body);
	if (error) return res.status(400).json({ error: error.details[0].message });

	// Checking if the email is already exist
	const user = await User.findOne({ email: req.body.email });
	if (!user)
		return res.status(400).json({ general: "Email or Password is Wrong" });
	// PASSWORD IS CORRECT
	const validPass = await bcrypt.compare(req.body.password, user.password);
	if (!validPass) return res.status(400).json({ general: "Invalid password" });

	// Create and assign a token
	const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
	res.header("auth_token", token).json({ token });

	// res.send("Loginin");
});

router.post(
	"/uploadImage",
	[auth, upload.single("image")],
	async (req, res) => {
		const u = await User.findOne({ _id: req.user._id });
		if (!u) return res.status(400).json({ general: "User doesn't exists" });
		// console.log(req);
		if (req.err) res.status(400).json(req.err);
		const r = req.file.path.replace(/\\/g,"/"); 
		try {
			await User.updateOne(
				{ _id: req.user._id },
				{ $set: { profilePics: `http://localhost:5000/${r}` } }
			);
			// console.log(u.userHandle);
			const s = await Scream.updateMany(
				{ userHandle: u.userHandle },
				{ $set: { userImage: `http://localhost:5000/${r}` } }
			);
			// await User.save();
			res.status(200).json({ message: "Profile Pics Saved Successfully" });
		} catch (err) {
			res.status(400).json({ error: "unable to update" });
		}
	}
);

router.post("/userDetails", auth, async (req, res) => {
	let userDetails = userDetailsValidation(req.body);

	try {
		await User.updateOne({ _id: req.user._id }, { $set: userDetails });
		res.status(200).json({ message: "Details added successfully" });
	} catch (err) {
		res.status(500).json({ error: err.code });
	}
});

router.get("/authenticatedUser", auth, async (req, res) => {
	let userDetails = {};
	const user = await User.findOne({ _id: req.user._id });
	if (!user) return res.status(400).json(user);
	userDetails.credientials = user;
	userDetails.likes = [];
	userDetails.notifications = [];
	const likes = await Likes.find({ userHandle: user.userHandle });
	const notification = await Notification.find(
		{ recipient: user.userHandle },
		null,
		{ sort: { date: -1 }, limit: 20 }
	)
		.sort({ createdAt: "desc" })
		.limit(10);
	if (likes) {
		likes.forEach(docs => {
			userDetails.likes.push(docs);
		});
	}
	if (notification) {
		notification.forEach(docs => {
			userDetails.notifications.push(docs);
		});
	}
	res.status(200).json(userDetails);
});

router.get("/:handle", async (req, res) => {
	userData = {};
	const user = await User.findOne({ userHandle: req.params.handle });
	if (!user) return res.status(400).json({ error: "User Not Found" });
	userData.user = user;
	const scream = await Scream.find({ userHandle: req.params.handle });
	if (scream) {
		userData.scream = [];
		scream.forEach(docs => {
			userData.scream.push(docs);
		});
	}
	res.status(200).json(userData);
});

router.post("/markNotificationRead", async (req, res) => {
	req.body.forEach(async notificationId => {
		let marked = await Notification.findOneAndUpdate(
			{ _id: notificationId },
			{ $set: { read: "true" } },
			{ new: true }
		);
		if (!marked)
			return res.status(400).json({ error: "Unable to mark notification" });
	});
	res.status(200).json({ message: "Sucesssfully Marked" });
});
module.exports = router;
