const Joi = require("joi");

const createUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),

  email: Joi.string().trim().email().max(150).required(),

  role: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .default("Software Developer"),
});

const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),

  email: Joi.string().trim().email().max(150),

  role: Joi.string()
    .trim()
    .min(2)
    .max(100),
}).min(1);

module.exports = {
  createUserSchema,
  updateUserSchema,
};