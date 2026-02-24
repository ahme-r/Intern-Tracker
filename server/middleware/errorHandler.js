const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log to console for dev
    console.error(err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found with id of ${err.value}`;
        return res.status(404).json({
            error: {
                message,
                code: 'NOT_FOUND'
            }
        });
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        return res.status(409).json({
            error: {
                message,
                code: 'DUPLICATE_ERROR'
            }
        });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({
            error: {
                message: message.join(', '),
                code: 'VALIDATION_ERROR'
            }
        });
    }

    res.status(error.statusCode || 500).json({
        error: {
            message: error.message || 'Server Error',
            code: error.code || 'SERVER_ERROR'
        }
    });
};

module.exports = errorHandler;
