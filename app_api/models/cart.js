const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    tripCode: {
        type: String,
        required: true
    },
    tripName: {
        type: String,
        required: true
    },
    tripImage: {
        type: String,
        required: true
    },
    resort: {
        type: String,
        required: true
    },
    length: {
        type: String,
        required: true
    },
    pricePerPerson: {
        type: Number,
        required: true
    },
    travelers: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    travelDate: {
        type: Date,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    }
});

const cartSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    items: [cartItemSchema],
    totalPrice: {
        type: Number,
        default: 0
    },
    itemCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

cartSchema.methods.calculateTotals = function() {
    this.itemCount = this.items.length;
    this.totalPrice = this.items.reduce((total, item) => total + item.subtotal, 0);
};

const Cart = mongoose.model('carts', cartSchema);
module.exports = Cart;
