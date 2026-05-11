const mongoose = require('mongoose');
const Equipment = require('../models/Equipment');

exports.createEquipment = async (req, res) => {
    try {
        const equipmentCode = req.body.EquipmentCode || req.body.equipmentCode;
        const equipmentName = req.body.EquipmentName || req.body.equipmentName;
        const status = req.body.status;

        if (!equipmentCode || !equipmentName || status === undefined) {
            return res.status(400).json({ message: 'Equipment code, name, and status are required' });
        }

        const equipment = await Equipment.create({
            EquipmentCode: equipmentCode,
            EquipmentName: equipmentName,
            status
        });

        res.status(201).json({ message: 'Equipment created successfully', equipment });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Equipment code already exists' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });    
    }
};

exports.createMultipleEquipments = async (req, res) => {
    try {
        const equipmentsData = req.body;

        const equipments = await Equipment.insertMany(equipmentsData);

        res.status(201).json({ message: 'Equipments created successfully', equipments });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Equipment code already exists' });
        }

        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getEquipment = async (req, res) => {
    try {
        const equipments = await Equipment.find().sort({ EquipmentName: 1 });
        res.json(equipments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getEquipmentById = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid equipment id' });
        }

        const equipment = await Equipment.findById(req.params.id);
        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        res.json(equipment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateEquipment = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid equipment id' });
        }

        const updateData = {};
        if (req.body.equipmentCode !== undefined) updateData.EquipmentCode = req.body.equipmentCode;
        if (req.body.EquipmentCode !== undefined) updateData.EquipmentCode = req.body.EquipmentCode;
        if (req.body.equipmentName !== undefined) updateData.EquipmentName = req.body.equipmentName;
        if (req.body.EquipmentName !== undefined) updateData.EquipmentName = req.body.EquipmentName;
        if (req.body.status !== undefined) updateData.status = req.body.status;

        const equipment = await Equipment.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        res.json({ message: 'Equipment updated successfully', equipment });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Equipment code already exists' });
        }

        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteEquipment = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid equipment id' });
        }

        const equipment = await Equipment.findByIdAndDelete(req.params.id);
        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        res.json({ message: 'Equipment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
