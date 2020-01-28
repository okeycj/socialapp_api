const router = require("express").Router();
const Scream = require("../models/Scream");
const User = require("../models/User");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const Like = require("../models/Like");
const { auth } = require("./verifyToken");
const { screamValidation } = require("../validation");

router.get("/allscreams", async (req, res) => {
	const allScreams = await Scream.find();
	if (!allScreams)
		return res.status(500).json({ error: "No Scream avaliable" });
	res.status(200).json(allScreams);
});

router.post("/addscream", auth, async (req, res) => {
	// console.log(req);
	const { error } = screamValidation(req.body);
	if (error) return res.status(400).json({ error: error.details[0].message });

	const idExist = await User.findOne({ _id: req.user._id });
	if (!idExist) return res.status(400).json({ error: "User Doesn't exists" });

	const newScream = new Scream({
		body: req.body.body,
		userHandle: idExist.userHandle,
		userImage: idExist.profilePics,
		likeCount: 0,
		commentCount: 0
	});
	try {
		const savedScream = await newScream.save();
		res.status(200).json(newScream);
	} catch (err) {
		res.status(400).json({ error: err });
	}
});

router.get("/:id", async (req, res) => {
	let screamData = {};
	const scream = await Scream.findOne({ _id: req.params.id });
	if (!scream) return res.status(500).json({ error: "No Scream avaliable" });
	const comments = await Comment.find({ screamId: req.params.id });
	if (!comments) comments = "";
	screamData.comments = [];
	screamData.scream = scream;
	comments.forEach(doc => {
		screamData.comments.push(doc);
	});
	res.status(200).json(screamData);
});

router.get("/like/:id", auth, async (req, res) => {
	// console.log(req);
	const scream = await Scream.findOne({ _id: req.params.id });
	if (!scream) return res.status(500).json({ error: "No Scream avaliable" });

	const userExist = await User.findOne({ _id: req.user._id });
	if (!userExist) return res.status(400).json({ error: "User Doesn't exists" });

	const like = await Like.findOne({
		screamId: req.params.id,
		userHandle: userExist.userHandle
	});
	if (!like) {
		const newLike = new Like({
			userHandle: userExist.userHandle,
			screamId: req.params.id
		});

		try {
			await newLike.save();
			newLikeCount = scream.likeCount + 1;
			const saveLike = await Scream.findOneAndUpdate(
				{ _id: req.params.id },
				{ $set: { likeCount: newLikeCount } },
				{ new: true }
			);
			const newNotification = new Notification({
				recipient: scream.userHandle,
				sender: userExist.userHandle,
				read: false,
				screamId: req.params.id,
				type: "like"
			});

			try {
				await newNotification.save();
				res.status(200).json(saveLike);
			} catch (err) {
				console.log(err);
			}
		} catch (err) {
			res.status(500).json({ error: err });
		}
	} else {
		res.status(400).json({ error: "Scream already liked" });
	}
});

router.get("/unlike/:id", auth, async (req, res) => {
	const scream = await Scream.findOne({ _id: req.params.id });
	if (!scream) return res.status(500).json({ error: "No Scream avaliable" });

	const userExist = await User.findOne({ _id: req.user._id });
	if (!userExist) return res.status(400).json({ error: "User Doesn't exists" });

	const like = await Like.findOne({
		screamId: req.params.id,
		userHandle: userExist.userHandle
	});
	if (like) {
		newLikeCount = scream.likeCount - 1;
		const deleteLike = await Like.deleteOne({
			screamId: req.params.id,
			userHandle: userExist.userHandle
		});
		if (deleteLike) {
			const saveLike = await Scream.findOneAndUpdate(
				{ _id: req.params.id },
				{ $set: { likeCount: newLikeCount } },
				{ new: true }
			);
			res.status(200).json(saveLike);
		} else {
			res.status(400).json({ error: "Unable to Unlike" });
		}
	} else {
		res.status(400).json({ error: "Scream already unliked" });
	}
});

router.delete("/:id", auth, async (req, res) => {
	const idExist = await Scream.findOne({ _id: req.params.id });
	if (!idExist) return res.status(400).json({ error: "Scream Doesn't exists" });

	const userExist = await User.findOne({ _id: req.user._id });
	if (!userExist) return res.status(400).json({ error: "User Doesn't exists" });

	if (idExist.userHandle != userExist.userHandle)
		return res.status(200).json({ error: "Unauthorised" });

	const deleteScream = await Scream.deleteOne({ _id: req.params.id });
	if (deleteScream)
		return res.status(200).json({ message: "Scream deleted successfully" });
	return res.status(500).json({ error: "Couldn't Delete Scream" });
});

router.post("/comment/:screamId", auth, async (req, res) => {
	if (req.body.body.trim() === "")
		return res.status(400).json({ error: "Must not be empty" });

	const idExist = await Scream.findOne({ _id: req.params.screamId });
	if (!idExist) return res.status(400).json({ error: "Scream Doesn't exists" });

	const userExist = await User.findOne({ _id: req.user._id });
	if (!userExist) return res.status(400).json({ error: "User Doesn't exists" });

	const newComment = new Comment({
		screamId: req.params.screamId,
		userHandle: userExist.userHandle,
		userImage: userExist.profilePics,
		body: req.body.body
	});

	try {
		await newComment.save();
		const newCommentCount = idExist.commentCount + 1;
		const newNotification = new Notification({
			recipient: idExist.userHandle,
			sender: userExist.userHandle,
			read: false,
			screamId: req.params.screamId,
			type: "comment"
		});

		try {
			await newNotification.save();

			const savedComment = await Scream.findOneAndUpdate(
				{ _id: req.params.screamId },
				{ $set: { commentCount: newCommentCount } }
			);

			res.status(200).json(newComment);
		} catch (err) {
			console.log(err);
		}
	} catch (err) {
		res.status(500).json({ error: err });
	}
});

module.exports = router;
