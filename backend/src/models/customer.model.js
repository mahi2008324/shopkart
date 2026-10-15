import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    wishlist: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product'
        }
      ],
      default: []
    },
    cart: {
      type: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
          },
          quantity: {
            type: Number,
            default: 1,
            min: [1, 'Quantity cannot be less than 1']
          }
        }
      ],
      default: []
    }
  },
  { timestamps: true }
);

export default mongoose.model('Customer', customerSchema);
