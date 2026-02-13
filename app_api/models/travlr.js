const mongoose = require('mongoose');

// Define the trip schema const 
tripSchema = new mongoose.Schema({
    code: { type: String, required: true, index: true },
    name: { type: String, required: true, index: true },
    length: { type: String, required: true },
    start: { type: Date, required: true },
    resort: { type: String, required: true },
    perPerson: { type: Number, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['beach', 'cruise', 'mountain', 'other'],
        default: 'other'
    }
});

// Compound text index for full-text search
// Weights determine relevance ranking:
//   - name: 10 (highest priority - trip titles)
//   - resort: 5 (medium priority - destination names)
//   - category: 3 (medium-low priority - trip type)
//   - description: 1 (lowest priority - general content)
tripSchema.index(
    {
        name: 'text',
        resort: 'text',
        category: 'text',
        description: 'text'
    },
    {
        weights: {
            name: 10,
            resort: 5,
            category: 3,
            description: 1
        },
        name: 'trip_text_index'
    }
);

const Trip = mongoose.model('trips', tripSchema);
module.exports = Trip;