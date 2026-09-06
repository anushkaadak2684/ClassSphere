const Joi = require('joi');

/**
 * User Schemas
 */
const syncUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'User name cannot be empty',
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required',
  }),
  role: Joi.string().valid('teacher', 'student').required().messages({
    'any.only': 'Role must be either teacher or student',
    'any.required': 'Role is required',
  }),
  avatarUrl: Joi.string().uri().allow('').optional().messages({
    'string.uri': 'Avatar URL must be a valid URL',
  }),
});

const updateMeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional().messages({
    'string.min': 'Name must be at least 2 characters',
  }),
  avatarUrl: Joi.string().uri().allow('').optional().messages({
    'string.uri': 'Avatar URL must be a valid URL',
  }),
}).min(1).messages({
  'object.min': 'At least one field (name or avatarUrl) must be provided for update',
});

/**
 * Classroom Schemas
 */
const createClassroomSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required().messages({
    'string.empty': 'Classroom name cannot be empty',
    'string.min': 'Classroom name must be at least 2 characters',
    'any.required': 'Classroom name is required',
  }),
  subject: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Subject cannot be empty',
    'string.min': 'Subject must be at least 2 characters',
    'any.required': 'Subject is required',
  }),
  description: Joi.string().trim().max(1000).allow('').optional(),
});

const updateClassroomSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).optional(),
  subject: Joi.string().trim().min(2).max(100).optional(),
  description: Joi.string().trim().max(1000).allow('').optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided to update the classroom',
});

const joinClassroomSchema = Joi.object({
  joinCode: Joi.string()
    .trim()
    .uppercase()
    .alphanum()
    .length(6)
    .required()
    .messages({
      'string.empty': 'Classroom join code is required',
      'string.length': 'Join code must be exactly 6 characters',
      'string.alphanum': 'Join code must contain only alphanumeric characters',
      'any.required': 'Classroom join code is required',
    }),
});

/**
 * Assignment Schemas
 */
const createAssignmentSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required().messages({
    'string.empty': 'Assignment title cannot be empty',
    'string.min': 'Assignment title must be at least 3 characters',
    'any.required': 'Assignment title is required',
  }),
  description: Joi.string().trim().max(5000).allow('').optional(),
  dueDate: Joi.date().iso().required().messages({
    'date.format': 'Due date must be a valid ISO date',
    'any.required': 'Due date is required',
  }),
  maxMarks: Joi.number().integer().min(1).max(1000).default(100).messages({
    'number.base': 'Maximum marks must be a valid number',
    'number.min': 'Maximum marks must be at least 1',
    'number.max': 'Maximum marks cannot exceed 1000',
  }),
});

const updateAssignmentSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).optional(),
  description: Joi.string().trim().max(5000).allow('').optional(),
  dueDate: Joi.date().iso().optional(),
  maxMarks: Joi.number().integer().min(1).max(1000).optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided to update the assignment',
});

/**
 * Submission & Grading Schemas
 */
const gradeSubmissionSchema = Joi.object({
  marks: Joi.number().min(0).max(1000).required().messages({
    'number.base': 'Marks must be a valid numerical value',
    'number.min': 'Marks cannot be negative',
    'any.required': 'Marks are required to grade submission',
  }),
  feedback: Joi.string().trim().max(3000).allow('').optional(),
});

module.exports = {
  syncUserSchema,
  updateMeSchema,
  createClassroomSchema,
  updateClassroomSchema,
  joinClassroomSchema,
  createAssignmentSchema,
  updateAssignmentSchema,
  gradeSubmissionSchema,
};
