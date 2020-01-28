// VALIDATION
const Joi = require("@hapi/joi");

const isEmpty = string => {
	if (string.trim() === "") return true;
	else return false;
};

// Register Validation
const registerValidation = data => {
	const schema = Joi.object({
		userHandle: Joi.string()
			.min(6)
			.required(),
		email: Joi.string()
			.min(6)
			.required()
			.email(),
		password: Joi.string()
			.min(6)
			.required(),
		confirmPassword: Joi.ref("password")
	});
	return schema.validate(data);
};

// scream Validation
const screamValidation = data => {
	const schema = Joi.object({
		body: Joi.string()
			.min(6)
			.required()
	});
	return schema.validate(data);
};

const loginValidation = data => {
	const schema = Joi.object({
		email: Joi.string()
			.min(6)
			.required()
			.email(),
		password: Joi.string()
			.min(6)
			.required()
	});
	return schema.validate(data);
};

const userDetailsValidation = data => {
	let userDetails = {};

	if (!isEmpty(data.bio.trim())) userDetails.bio = data.bio;
	if (!isEmpty(data.website.trim())) {
		if (data.website.trim().substring(0, 4) !== "http") {
			userDetails.website = `http://${data.website.trim()}`;
		} else userDetails.website = data.website;
	}
	if (!isEmpty(data.location.trim())) userDetails.location = data.location;

	return userDetails;
};
module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.screamValidation = screamValidation;
module.exports.userDetailsValidation = userDetailsValidation;
