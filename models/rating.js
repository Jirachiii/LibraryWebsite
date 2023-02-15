import mongoose from "mongoose"

const orderSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            require: [true, 'Please enter user objectId'],
        },
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book',
            require: [true, 'Please enter book objectId'],
        },
        rating: {
            type: Number,
            require: [true, 'Please enter book objectId'],
        }
    }
)

const Rating = mongoose.model('Rating', orderSchema, 'rating')

export {
    Rating
}