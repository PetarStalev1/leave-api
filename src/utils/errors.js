class AppError extends Error {
    constructor(status, code, message, details = null)
    {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

const Errors = {
    // bad request\
    validation: (message, details) => new AppError(400, 'VALIDATION_ERROR', message, details),

    // errors from lack of privilages 
    missingToken: () => new AppError(401, 'MISSING_TOKEN', 'Authorization header is required.'),
    invalidToken: () => new AppError(401, 'INVALID_TOKEN','Token is invalid or has expired.'),
    invalidCredentials: () => new AppError(401,'INVALID_CREDANTIALS', 'Invalid email or password.'),


    // forbidden errors
    forbiden: (msg) => new AppError(403, 'FORBIDDEN', msg || 'You do not have permission to perform this action'),
    ownLeave: () => new AppError(403, 'CANNOT_ACT_ON_OWN_LEAVE', 'You cannot approve or reject your own leave request'),


    // missing resource
    notFound: (resource) => new AppError(404, 'NOT_FOUND', `${resource || 'Resource'} not found.`),


    // conflicts with the request
    overlap: () => new AppError(409, 'LEAVE_OVERLAP','This request overlaps with an existing approved leave.'),
    alreadyProcessed:() => new AppError(409, 'ALREADY_PROCESSED','This leave request has already been processed.'),

    // system is not able to process this request
    insufficientBalance: (remaining, request) => 
        new AppError(422, 'INSUFFICIENT_BALANCE', `Insufficient leave balanace. You have ${remaining} working days remaining but requsted ${request}.`),
    pastDate: () => new AppError(422, 'PAST_DATE', 'Leave requests cannot start in the past.'),
    weekendOnly: () => new AppError(422,'WEEKEND_ONLY', 'The selected date range conatins no working days.'),
    endBeforeStart: () => new AppError(422, 'END_BEFORE_START', 'End date must be greater than or equal to start date.')
}

module.exports = { AppError, Errors }