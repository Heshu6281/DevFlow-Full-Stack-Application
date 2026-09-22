const Joi = require("joi");

const createProjectSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(150)
    .required(),

  description: Joi.string()
    .trim()
    .allow("")
    .max(1000),

  status: Joi.string()
    .valid("To Do", "In Progress", "Completed")
    .default("To Do"),

  progress: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .default(0),

  technologies: Joi.array()
    .items(Joi.string().trim())
    .default([]),
});

const updateProjectSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(150),

  description: Joi.string()
    .trim()
    .allow("")
    .max(1000),

  status: Joi.string()
    .valid("To Do", "In Progress", "Completed"),

  progress: Joi.number()
    .integer()
    .min(0)
    .max(100),

  technologies: Joi.array()
    .items(Joi.string().trim()),
}).min(1);

module.exports = {
  createProjectSchema,
  updateProjectSchema,
};