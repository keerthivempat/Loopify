// Purpose: Mongoose schema & model for application users
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  age: { type: Number, required: true },
  contactNumber: { type: String, required: true },
  password: { type: String, required: true },
  cartCount: { type: Number, default: 0 },
});

module.exports = mongoose.model('User', UserSchema);
