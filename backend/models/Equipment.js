const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema({
    EquipmentCode: {
         type: String, 
         required: true, 
         unique: true 
        },
    EquipmentName: {
         type: String, 
         required: true
    },
    status: {
        type: String,
        enum: ['Available', 'In Use', 'Under Maintenance'],
        default: 'Available'
    }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      if (ret.EquipmentCode) {
        ret.equipmentCode = ret.EquipmentCode;
        delete ret.EquipmentCode;
      }
      if (ret.EquipmentName) {
        ret.equipmentName = ret.EquipmentName;
        delete ret.EquipmentName;
      }
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      if (ret.EquipmentCode) {
        ret.equipmentCode = ret.EquipmentCode;
        delete ret.EquipmentCode;
      }
      if (ret.EquipmentName) {
        ret.equipmentName = ret.EquipmentName;
        delete ret.EquipmentName;
      }
      return ret;
    }
  }
});
module.exports = mongoose.model('Equipment', EquipmentSchema);