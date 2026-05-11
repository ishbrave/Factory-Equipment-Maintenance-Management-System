const mongoose = require('mongoose');
const Maintenance = require('../models/Maintenance');
const Equipment = require('../models/Equipment');
const Technician = require('../models/Technician');

exports.createMaintenance = async (req, res) => {
    try {
        const serviceCode = req.body.ServiceCode || req.body.serviceCode;
        const serviceDate = req.body.ServiceDate || req.body.serviceDate;
        const cost = req.body.cost;
        const equipmentId = req.body.Equipment || req.body.equipment;
        const technicianId = req.body.Technician || req.body.technician;
        const serviceType = req.body.ServiceType || req.body.serviceType;
        const description = req.body.Description || req.body.description;
        const partsReplaced = req.body.PartsReplaced || req.body.partsReplaced;

        if (!serviceCode || !cost || !equipmentId || !technicianId) {
            return res.status(400).json({ message: 'Service code, cost, equipment ID, and technician ID are required' });
        }

        // Validate equipment exists
        const equipment = await Equipment.findById(equipmentId);
        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        // Validate technician exists
        const technician = await Technician.findById(technicianId);
        if (!technician) {
            return res.status(404).json({ message: 'Technician not found' });
        }

        const maintenance = await Maintenance.create({
            ServiceCode: serviceCode,
            ServiceDate: serviceDate || new Date(),
            cost,
            Equipment: equipmentId,
            Technician: technicianId,
            ServiceType: serviceType,
            Description: description,
            PartsReplaced: partsReplaced || []
        });

        // Update equipment status to 'Under Maintenance'
        await Equipment.findByIdAndUpdate(equipmentId, { status: 'Under Maintenance' });

        res.status(201).json({ message: 'Maintenance record created successfully', maintenance });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Service code already exists' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createMultipleMaintenances = async (req, res) => {
    try {
        const maintenancesData = req.body;

        // Validate all equipment and technician IDs exist
        for (const maintenanceData of maintenancesData) {
            const equipment = await Equipment.findById(maintenanceData.Equipment);
            if (!equipment) {
                return res.status(404).json({ message: `Equipment with ID ${maintenanceData.Equipment} not found` });
            }

            const technician = await Technician.findById(maintenanceData.Technician);
            if (!technician) {
                return res.status(404).json({ message: `Technician with ID ${maintenanceData.Technician} not found` });
            }
        }

        const maintenances = await Maintenance.insertMany(maintenancesData);

        // Update equipment statuses
        for (const maintenanceData of maintenancesData) {
            await Equipment.findByIdAndUpdate(maintenanceData.Equipment, { status: 'Under Maintenance' });
        }

        res.status(201).json({ message: 'Maintenance records created successfully', maintenances });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Service code already exists' });
        }

        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getMaintenance = async (req, res) => {
    try {
        const maintenances = await Maintenance.find()
            .populate('Equipment', 'EquipmentCode EquipmentName status')
            .populate('Technician', 'TechnicianID TechnicianName')
            .sort({ ServiceDate: -1 });
        res.json(maintenances);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getMaintenanceById = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid maintenance id' });
        }

        const maintenance = await Maintenance.findById(req.params.id)
            .populate('Equipment', 'EquipmentCode EquipmentName status')
            .populate('Technician', 'TechnicianID TechnicianName');

        if (!maintenance) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }

        res.json(maintenance);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateMaintenance = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid maintenance id' });
        }

        const newEquipmentId = req.body.Equipment || req.body.equipment;
        const newTechnicianId = req.body.Technician || req.body.technician;

        // If equipment is being changed, validate new equipment exists
        if (newEquipmentId) {
            const newEquipment = await Equipment.findById(newEquipmentId);
            if (!newEquipment) {
                return res.status(404).json({ message: 'New equipment not found' });
            }
        }

        // If technician is being changed, validate new technician exists
        if (newTechnicianId) {
            const newTechnician = await Technician.findById(newTechnicianId);
            if (!newTechnician) {
                return res.status(404).json({ message: 'New technician not found' });
            }
        }

        const updateData = { ...req.body };
        if (req.body.equipment !== undefined) updateData.Equipment = req.body.equipment;
        if (req.body.Equipment !== undefined) updateData.Equipment = req.body.Equipment;
        if (req.body.technician !== undefined) updateData.Technician = req.body.technician;
        if (req.body.Technician !== undefined) updateData.Technician = req.body.Technician;
        if (req.body.serviceType !== undefined) updateData.ServiceType = req.body.serviceType;
        if (req.body.ServiceType !== undefined) updateData.ServiceType = req.body.ServiceType;
        if (req.body.description !== undefined) updateData.Description = req.body.description;
        if (req.body.Description !== undefined) updateData.Description = req.body.Description;
        if (req.body.partsReplaced !== undefined) updateData.PartsReplaced = req.body.partsReplaced;
        if (req.body.PartsReplaced !== undefined) updateData.PartsReplaced = req.body.PartsReplaced;

        const maintenance = await Maintenance.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        }).populate('Equipment', 'EquipmentCode EquipmentName status')
          .populate('Technician', 'TechnicianID TechnicianName');

        if (!maintenance) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }

        res.json({ message: 'Maintenance record updated successfully', maintenance });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Service code already exists' });
        }

        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteMaintenance = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid maintenance id' });
        }

        const maintenance = await Maintenance.findByIdAndDelete(req.params.id);
        if (!maintenance) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }

        // Update equipment status back to 'Available' if it was under maintenance
        await Equipment.findByIdAndUpdate(maintenance.Equipment, { status: 'Available' });

        res.json({ message: 'Maintenance record deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
