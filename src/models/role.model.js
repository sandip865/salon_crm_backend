const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
  },
  salonId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Salon',
    required: false // Default roles like SUPER_ADMIN are global
  },
  permissions: [
    {
      resource: { 
        type: String, 
        required: true 
      },
      actions: [{ 
        type: String, 
        enum: ['C', 'R', 'U', 'D'] // Create, Read, Update, Delete
      }]
    }
  ]
,
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
