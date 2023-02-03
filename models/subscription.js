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
            default: null
        },
        borrowDuration: {
            type: Number,
            default: null
        }
    }
)

const Subscription = mongoose.model('Subscription', subscriptionSchema, 'subscription')

export {
    Subscription
}
