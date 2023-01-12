import mongoose from 'mongoose'

const userSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
        },
        fullName: {
            type: String,
            required: [true, 'Please add a name'],
        },
        dob: {
            type: Date,
            required: [true, 'Please add a birth date'],
        },
        address: {
            type: String,
            required: [true, 'Please add an address'],
        },
        type: {
            type: String,
            default: "normal"
        },
        image: {
            type: String,
            default: "/images/user-icon.png"
        },
        subscription: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subscription',
            default: null
        },
        subscriptionStatus: {
            type: Boolean,
            default: null
        },
        paymentStatus: {
            type: Date,
            default: null
        },
        warning: {
            type: Number,
            default: 0
        },
        borrowAvailable: {
            type: Number,
            default: 0
        },
        maxAvailable: {
            type: Number,
            default: 0
        },
        security: {
            question:{
                type: String,
                default: null
            },
            answer: {
                type: String,
                default: null
            }
        }
    }
)

const User = mongoose.model('User', userSchema, 'user')

export {
    User
}