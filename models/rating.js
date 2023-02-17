import mongoose from "mongoose"

const ratingSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            require: [true,'Please enter user objectId'],
        },
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book',
            require: [true,'Please enter book objectId'],
        },
        rating: {
            type: Number,
            require: [true,'Please enter rating value'],
        }
    }
)

const Rating = mongoose.model('Rating', ratingSchema, 'rating')

export {
    Rating
}