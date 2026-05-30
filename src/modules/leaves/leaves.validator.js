const { isValidDate } = require('../../utils/dates');
const { Errors } = require('../../utils/errors');

const VALID_LEAVE_TYPES = ['annual', 'sick', 'unpaid'];
const VALID_STATUSES    = ['pending', 'approved', 'rejected', 'cancelled'];


function validateSubmitBody(req, res, next) {
  const { start_date, end_date, leave_type, reason } = req.body;
  const errors = [];

  if (!start_date) {
    errors.push('start_date is required.');
  } else if (!isValidDate(start_date)) {
    errors.push('start_date must be a valid date in YYYY-MM-DD format.');
  }

  if (!end_date) {
    errors.push('end_date is required.');
  } else if (!isValidDate(end_date)) {
    errors.push('end_date must be a valid date in YYYY-MM-DD format.');
  }

  if (errors.length === 0 && end_date < start_date) {
    errors.push('end_date must be greater than or equal to start_date.');
  }

  if (!leave_type) {
    errors.push('leave_type is required.');
  } else if (!VALID_LEAVE_TYPES.includes(leave_type)) {
    errors.push(`leave_type must be one of: ${VALID_LEAVE_TYPES.join(', ')}.`);
  }

  if (reason !== undefined && typeof reason !== 'string') {
    errors.push('reason must be a string.');
  }

  if (errors.length > 0) {
    return next(Errors.validation('Validation failed.', errors));
  }

  next();
}


function validateListQuery(req, res, next) {
  const { status, leave_type, from, to } = req.query;
  const errors = [];

  if (status && !VALID_STATUSES.includes(status)) errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}.`);
  if (leave_type && !VALID_LEAVE_TYPES.includes(leave_type)) errors.push(`leave_type must be one of: ${VALID_LEAVE_TYPES.join(', ')}.`);
  if (from && !isValidDate(from)) errors.push('from must be a valid date in YYYY-MM-DD format.');
  if (to && !isValidDate(to)) errors.push('to must be a valid date in YYYY-MM-DD format.');
  if (from && to && to < from) errors.push('to must be greater than or equal to from.');

  if (errors.length > 0) {
    return next(Errors.validation('Invalid query parameters.', errors));
  }

  next();
}

function validateManagerListQuery(req, res, next) {
  const { user_id, from, to } = req.query;
  const errors = [];

  if (user_id && isNaN(parseInt(user_id))) errors.push('user_id must be a valid integer.');
  if (from && !isValidDate(from)) errors.push('from must be a valid date in YYYY-MM-DD format.');
  if (to && !isValidDate(to)) errors.push('to must be a valid date in YYYY-MM-DD format.');
  if (from && to && to < from) errors.push('to must be greater than or equal to from.');

  if (errors.length > 0) {
    return next(Errors.validation('Invalid query parameters.', errors));
  }

  next();
}

module.exports = { 
    validateSubmitBody, 
    validateListQuery, 
    validateManagerListQuery 
};