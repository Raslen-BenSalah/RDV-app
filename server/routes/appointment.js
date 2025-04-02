const express = require('express');
const Appointment = require('../models/Appointment');
const authenticateToken  = require('../middleware/authMiddleware'); // Ensure user is authenticated
const router = express.Router();

// 📌 Create an appointment
router.post('/create', authenticateToken, async (req, res) => {
    try {
        const { professionalId, date } = req.body;
        const appointment = new Appointment({
            client: req.user.id,
            professional: professionalId,
            date
        });
        await appointment.save();
        res.redirect('/appointments'); // Redirect to list after creating
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// 📌 Get all appointments (for logged-in user)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const appointments = await Appointment.find({ client: req.user.id })
            .populate('professional', 'name email')
            .sort({ date: 1 });

        res.render('appointments/list', { appointments, title: 'My Appointments' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// 📌 Edit an appointment (view form)
router.get('/edit/:id', authenticateToken, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).send('Appointment not found');

        res.render('appointments/edit', { appointment, title: 'Edit Appointment' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// 📌 Update an appointment (submit edit form)
router.post('/edit/:id', authenticateToken, async (req, res) => {
    try {
        const { date } = req.body;
        await Appointment.findByIdAndUpdate(req.params.id, { date });
        res.redirect('/appointments');
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// 📌 Delete an appointment
router.post('/delete/:id', authenticateToken, async (req, res) => {
    try {
        await Appointment.findByIdAndDelete(req.params.id);
        res.redirect('/appointments');
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
