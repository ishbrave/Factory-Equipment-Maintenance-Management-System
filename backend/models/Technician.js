const mongoose = require('mongoose');

const TechnicianSchema = new mongoose.Schema({
    TechnicianID: {
        type: String,
        required: true,
        unique: true
    },
    TechnicianName: {
        type: String,
        required: true,
        trim: true
    }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      if (ret.TechnicianID) {
        ret.technicianId = ret.TechnicianID;
        delete ret.TechnicianID;
      }
      if (ret.TechnicianName) {
        ret.technicianName = ret.TechnicianName;
        delete ret.TechnicianName;
      }
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      if (ret.TechnicianID) {
        ret.technicianId = ret.TechnicianID;
        delete ret.TechnicianID;
      }
      if (ret.TechnicianName) {
        ret.technicianName = ret.TechnicianName;
        delete ret.TechnicianName;
      }
      return ret;
    }
  }
});

module.exports = mongoose.model('Technician', TechnicianSchema);
