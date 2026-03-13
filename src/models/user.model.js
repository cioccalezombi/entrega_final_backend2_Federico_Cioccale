import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },

  last_name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  age: {
    type: Number,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Carts",
  },

  role: {
    type: String,
    enum: ["user", "admin", "premium"],
    default: "user",
  },

  resetToken: {
    type: String,
    default: null,
  },

  resetTokenExpires: {
    type: Date,
    default: null,
  },
});

export const User = mongoose.model("Users", userSchema);
