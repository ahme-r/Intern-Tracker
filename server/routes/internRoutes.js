const express = require('express');
const router = express.Router();
const {
    createIntern,
    getInterns,
    getIntern,
    updateIntern,
    deleteIntern
} = require('../controllers/internController');

router.route('/')
    .get(getInterns)
    .post(createIntern);

router.route('/:id')
    .get(getIntern)
    .patch(updateIntern)
    .delete(deleteIntern);

module.exports = router;
