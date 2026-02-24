const Intern = require('../models/Intern');

// @desc    Create intern
// @route   POST /api/interns
exports.createIntern = async (req, res, next) => {
    try {
        const intern = await Intern.create(req.body);
        res.status(201).json(intern);
    } catch (err) {
        next(err);
    }
};

// @desc    List interns (with search + filter + pagination)
// @route   GET /api/interns
exports.getInterns = async (req, res, next) => {
    try {
        const { q, status, role, page = 1, limit = 10 } = req.query;
        const query = {};

        // Search by name or email
        if (q) {
            query.$or = [
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } }
            ];
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Filter by role
        if (role) {
            query.role = role;
        }

        const skip = (page - 1) * limit;
        const total = await Intern.countDocuments(query);
        const interns = await Intern.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.status(200).json({
            data: interns,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single intern
// @route   GET /api/interns/:id
exports.getIntern = async (req, res, next) => {
    try {
        const intern = await Intern.findById(req.params.id);
        if (!intern) {
            const error = new Error('Intern not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            return next(error);
        }
        res.status(200).json(intern);
    } catch (err) {
        next(err);
    }
};

// @desc    Update intern
// @route   PATCH /api/interns/:id
exports.updateIntern = async (req, res, next) => {
    try {
        const intern = await Intern.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!intern) {
            const error = new Error('Intern not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            return next(error);
        }
        res.status(200).json(intern);
    } catch (err) {
        next(err);
    }
};

// @desc    Delete intern
// @route   DELETE /api/interns/:id
exports.deleteIntern = async (req, res, next) => {
    try {
        const intern = await Intern.findByIdAndDelete(req.params.id);
        if (!intern) {
            const error = new Error('Intern not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            return next(error);
        }
        res.status(204).send();
    } catch (err) {
        next(err);
    }
};
