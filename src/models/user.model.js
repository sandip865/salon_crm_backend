const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  clientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Client',
    required: function() { 
      // Required for everyone except SUPER_ADMIN
      if (this.role) {
        return false; // Complex to validate role name here, handled in controller
      }
      return true; 
    }
  },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { 
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid 10-digit mobile number!`
    }
  },
  role: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true 
  },
  salonId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Salon',
    // Required for OWNER and RECEPTIONIST, null for SUPER_ADMIN
    required: function() { 
      return false; 
    }
  },
  salons: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Salon'
  }],
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
