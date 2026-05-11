const Maintenance = require('../models/Maintenance');
const Equipment = require('../models/Equipment');
const Technician = require('../models/Technician');

// Get equipment status report
exports.getEquipmentStatusReport = async (req, res) => {
    try {
        const equipmentStats = await Equipment.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    equipment: { $push: { EquipmentCode: '$EquipmentCode', EquipmentName: '$EquipmentName' } }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        res.json({
            message: 'Equipment status report generated successfully',
            data: equipmentStats
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get maintenance history report
exports.getMaintenanceHistoryReport = async (req, res) => {
    try {
        const { startDate, endDate, equipmentId } = req.query;

        let matchConditions = {};

        if (startDate && endDate) {
            matchConditions.ServiceDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (equipmentId) {
            matchConditions.Equipment = require('mongoose').Types.ObjectId(equipmentId);
        }

        const maintenanceHistory = await Maintenance.aggregate([
            { $match: matchConditions },
            {
                $lookup: {
                    from: 'equipments',
                    localField: 'Equipment',
                    foreignField: '_id',
                    as: 'equipment'
                }
            },
            {
                $lookup: {
                    from: 'technicians',
                    localField: 'Technician',
                    foreignField: '_id',
                    as: 'technician'
                }
            },
            {
                $unwind: '$equipment'
            },
            {
                $unwind: '$technician'
            },
            {
                $project: {
                    ServiceCode: 1,
                    ServiceDate: 1,
                    cost: 1,
                    'equipment.EquipmentCode': 1,
                    'equipment.EquipmentName': 1,
                    'technician.TechnicianID': 1,
                    'technician.TechnicianName': 1
                }
            },
            {
                $sort: { ServiceDate: -1 }
            }
        ]);

        const totalCost = maintenanceHistory.reduce((sum, record) => sum + record.cost, 0);

        res.json({
            message: 'Maintenance history report generated successfully',
            totalRecords: maintenanceHistory.length,
            totalCost: totalCost,
            data: maintenanceHistory
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get technician workload report
exports.getTechnicianWorkloadReport = async (req, res) => {
    try {
        const technicianWorkload = await Maintenance.aggregate([
            {
                $lookup: {
                    from: 'technicians',
                    localField: 'Technician',
                    foreignField: '_id',
                    as: 'technician'
                }
            },
            {
                $unwind: '$technician'
            },
            {
                $group: {
                    _id: '$Technician',
                    technicianName: { $first: '$technician.TechnicianName' },
                    technicianID: { $first: '$technician.TechnicianID' },
                    totalServices: { $sum: 1 },
                    totalCost: { $sum: '$cost' },
                    averageCost: { $avg: '$cost' },
                    services: {
                        $push: {
                            ServiceCode: '$ServiceCode',
                            ServiceDate: '$ServiceDate',
                            cost: '$cost'
                        }
                    }
                }
            },
            {
                $sort: { totalServices: -1 }
            }
        ]);

        res.json({
            message: 'Technician workload report generated successfully',
            data: technicianWorkload
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get cost analysis report
exports.getCostAnalysisReport = async (req, res) => {
    try {
        const { year, month } = req.query;

        let matchConditions = {};

        if (year) {
            const startDate = new Date(year, month ? month - 1 : 0, 1);
            const endDate = new Date(year, month ? month : 12, month ? 0 : 31, 23, 59, 59);
            matchConditions.ServiceDate = {
                $gte: startDate,
                $lte: endDate
            };
        }

        const costAnalysis = await Maintenance.aggregate([
            { $match: matchConditions },
            {
                $lookup: {
                    from: 'equipments',
                    localField: 'Equipment',
                    foreignField: '_id',
                    as: 'equipment'
                }
            },
            {
                $unwind: '$equipment'
            },
            {
                $group: {
                    _id: {
                        equipment: '$Equipment',
                        equipmentName: '$equipment.EquipmentName'
                    },
                    totalCost: { $sum: '$cost' },
                    serviceCount: { $sum: 1 },
                    averageCost: { $avg: '$cost' },
                    minCost: { $min: '$cost' },
                    maxCost: { $max: '$cost' },
                    services: {
                        $push: {
                            ServiceCode: '$ServiceCode',
                            ServiceDate: '$ServiceDate',
                            cost: '$cost'
                        }
                    }
                }
            },
            {
                $sort: { totalCost: -1 }
            }
        ]);

        const overallStats = await Maintenance.aggregate([
            { $match: matchConditions },
            {
                $group: {
                    _id: null,
                    totalMaintenanceCost: { $sum: '$cost' },
                    totalServices: { $sum: 1 },
                    averageServiceCost: { $avg: '$cost' },
                    highestCost: { $max: '$cost' },
                    lowestCost: { $min: '$cost' }
                }
            }
        ]);

        res.json({
            message: 'Cost analysis report generated successfully',
            overallStats: overallStats[0] || {},
            equipmentCostBreakdown: costAnalysis
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};