const Joi = require("joi");

const createTaskSchema = Joi.object({
  project_id: Joi.number()
    .integer()
    .positive()
    .required(),

  assigned_to: Joi.number()
    .integer()
    .positive()
    .allow(null),

  title: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required(),

  description: Joi.string()
    .trim()
    .allow("")
    .max(2000),

  priority: Joi.string()
    .valid("High", "Medium", "Low")
    .default("Medium"),

  status: Joi.string()
    .valid("To Do", "In Progress", "Completed", "Blocked")
    .default("To Do"),

  progress: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .default(0),

  due_date: Joi.date()
    .iso()
    .allow(null, ""),
});

const updateTaskSchema = Joi.object({
  project_id: Joi.number()
    .integer()
    .positive(),

  assigned_to: Joi.number()
    .integer()
    .positive()
    .allow(null),

  title: Joi.string()
    .trim()
    .min(2)
    .max(200),

  description: Joi.string()
    .trim()
    .allow("")
    .max(2000),

  priority: Joi.string()
    .valid("High", "Medium", "Low"),

  status: Joi.string()
    .valid("To Do", "In Progress", "Completed", "Blocked"),

  progress: Joi.number()
    .integer()
    .min(0)
    .max(100),

  due_date: Joi.date()
    .iso()
    .allow(null, ""),
}).min(1);

const updateTaskStatusSchema = Joi.object({
  status: Joi.string()
    .valid("To Do", "In Progress", "Completed", "Blocked")
    .required(),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
};