import mongoose from 'mongoose'

const subscriptionSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            default: null
        },
        price: {
            type: Number,
            default: null
        },
        borrowAmount: {
            type: Number,
            default: 5
        },
        borrowDuration: {
            type: Number,
            default: 30
        }
    }
)

const Subscription = mongoose.model('Subscription', subscriptionSchema, 'subscription')

export {
    Subscription
}
