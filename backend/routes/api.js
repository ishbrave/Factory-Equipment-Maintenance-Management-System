const express = require('express');
const router = express.Router();

// Import controllers
const authController = require('../controllers/authController');
const equipmentController = require('../controllers/equipmentController');
const technicianController = require('../controllers/technicianController');
const maintenanceController = require('../controllers/maintenanceController');
const reportController = require('../controllers/reportController');

// Import middleware
const auth = require('../Middleware/authMiddleware');

// Auth routes
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);

// Equipment routes (protected)
router.post('/equipment', auth, equipmentController.createEquipment);
router.post('/equipment/bulk', auth, equipmentController.createMultipleEquipments);
router.get('/equipment', auth, equipmentController.getEquipment);
router.get('/equipment/:id', auth, equipmentController.getEquipmentById);
router.put('/equipment/:id', auth, equipmentController.updateEquipment);
router.delete('/equipment/:id', auth, equipmentController.deleteEquipment);

// Technician routes (protected)
router.post('/technicians', auth, technicianController.createTechnician);
router.post('/technicians/bulk', auth, technicianController.createMultipleTechnicians);
router.get('/technicians', auth, technicianController.getTechnicians);
router.get('/technicians/:id', auth, technicianController.getTechnicianById);
router.put('/technicians/:id', auth, technicianController.updateTechnician);
router.delete('/technicians/:id', auth, technicianController.deleteTechnician);

// Maintenance routes (protected)
router.post('/maintenance', auth, maintenanceController.createMaintenance);
router.post('/maintenance/bulk', auth, maintenanceController.createMultipleMaintenances);
router.get('/maintenance', auth, maintenanceController.getMaintenance);
router.get('/maintenance/:id', auth, maintenanceController.getMaintenanceById);
router.put('/maintenance/:id', auth, maintenanceController.updateMaintenance);
router.delete('/maintenance/:id', auth, maintenanceController.deleteMaintenance);

// Report routes (protected)
router.get('/reports/equipment-status', auth, reportController.getEquipmentStatusReport);
router.get('/reports/maintenance-history', auth, reportController.getMaintenanceHistoryReport);
router.get('/reports/technician-workload', auth, reportController.getTechnicianWorkloadReport);
router.get('/reports/cost-analysis', auth, reportController.getCostAnalysisReport);

module.exports = router;
