const mongoose = require('mongoose');
const Technician = require('../models/Technician');

exports.createTechnician = async (req, res) => {
    try {
        const technicianId = req.body.TechnicianID || req.body.technicianId;
        const technicianName = req.body.TechnicianName || req.body.technicianName;

        if (!technicianId || !technicianName) {
            return res.status(400).json({ message: 'Technician ID and name are required' });
        }

        const technician = await Technician.create({
            TechnicianID: technicianId,
            TechnicianName: technicianName
        });

        res.status(201).json({ message: 'Technician created successfully', technician });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Technician ID already exists' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createMultipleTechnicians = async (req, res) => {
    try {
        const techniciansData = req.body;

        const technicians = await Technician.insertMany(techniciansData);

        res.status(201).json({ message: 'Technicians created successfully', technicians });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Technician ID already exists' });
        }

        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getTechnicians = async (req, res) => {
    try {
        const technicians = await Technician.find().sort({ TechnicianName: 1 });
        res.json(technicians);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getTechnicianById = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid technician id' });
        }

        const technician = await Technician.findById(req.params.id);
        if (!technician) {
            return res.status(404).json({ message: 'Technician not found' });
        }

        res.json(technician);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateTechnician = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid technician id' });
        }

        const updateData = {};
        if (req.body.technicianId !== undefined) updateData.TechnicianID = req.body.technicianId;
        if (req.body.TechnicianID !== undefined) updateData.TechnicianID = req.body.TechnicianID;
        if (req.body.technicianName !== undefined) updateData.TechnicianName = req.body.technicianName;
        if (req.body.TechnicianName !== undefined) updateData.TechnicianName = req.body.TechnicianName;

        const technician = await Technician.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        if (!technician) {
            return res.status(404).json({ message: 'Technician not found' });
        }

        res.json({ message: 'Technician updated successfully', technician });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Technician ID already exists' });
        }

        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteTechnician = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid technician id' });
        }

        const technician = await Technician.findByIdAndDelete(req.params.id);
        if (!technician) {
            return res.status(404).json({ message: 'Technician not found' });
        }

        res.json({ message: 'Technician deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};