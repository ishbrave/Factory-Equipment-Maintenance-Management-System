const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema({
    ServiceCode: {
        type: String,
        required: true,
        unique: true
    },
    ServiceDate: {
        type: Date,
        default: Date.now
    },
    NextServiceDate: {
        type: Date,
    },
    cost: {
        type:Number,
        required:true,
        min:0
    },
    ServiceType: {
        type: String,
        default: 'Preventive'
    },
    Description: {
        type: String,
    },
    PartsReplaced: {
        type: [String],
        default: []
    },
    Equipment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Equipment',
        required: true
    },
    Technician: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Technician',
        required: true
    }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      if (ret.ServiceCode) {
        ret.serviceCode = ret.ServiceCode;
        delete ret.ServiceCode;
      }
      if (ret.ServiceDate) {
        ret.serviceDate = ret.ServiceDate;
        delete ret.ServiceDate;
      }
      if (ret.NextServiceDate) {
        ret.nextServiceDate = ret.NextServiceDate;
        delete ret.NextServiceDate;
      }
      if (ret.ServiceType) {
        ret.serviceType = ret.ServiceType;
        delete ret.ServiceType;
      }
      if (ret.Description) {
        ret.description = ret.Description;
        delete ret.Description;
      }
      if (ret.PartsReplaced) {
        ret.partsReplaced = ret.PartsReplaced;
        delete ret.PartsReplaced;
      }
      if (ret.Equipment) {
        ret.equipment = ret.Equipment;
        delete ret.Equipment;
      }
      if (ret.Technician) {
        ret.technician = ret.Technician;
        delete ret.Technician;
      }
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      if (ret.ServiceCode) {
        ret.serviceCode = ret.ServiceCode;
        delete ret.ServiceCode;
      }
      if (ret.ServiceDate) {
        ret.serviceDate = ret.ServiceDate;
        delete ret.ServiceDate;
      }
      if (ret.NextServiceDate) {
        ret.nextServiceDate = ret.NextServiceDate;
        delete ret.NextServiceDate;
      }
      if (ret.ServiceType) {
        ret.serviceType = ret.ServiceType;
        delete ret.ServiceType;
      }
      if (ret.Description) {
        ret.description = ret.Description;
        delete ret.Description;
      }
      if (ret.PartsReplaced) {
        ret.partsReplaced = ret.PartsReplaced;
        delete ret.PartsReplaced;
      }
      if (ret.Equipment) {
        ret.equipment = ret.Equipment;
        delete ret.Equipment;
      }
      if (ret.Technician) {
        ret.technician = ret.Technician;
        delete ret.Technician;
      }
      return ret;
    }
  }
});

module.exports = mongoose.model('Maintenance', MaintenanceSchema);
