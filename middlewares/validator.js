// middlewares/validator.js
const mongoose = require('mongoose');

exports.validateId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        let err = new Error('Invalid item ID');
        err.status = 400;
        return next(err);
    }
    next();
};
