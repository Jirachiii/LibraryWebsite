import mongoose from 'mongoose'

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Please add a name'],
            unique: true,
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
        },
        fullName: {
            type: String,
            default: null
        },
        address: {
            type: String,
            default: null
        },
        dob: {
            type: Date,
            default: null
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
        },
        userType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UserType',
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
        priority: {
            type: Number,
            default: 3,
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

const userTypeSchema = mongoose.Schema(
    {
        longestBorrowDate: {
            type: Number
        },
        maxBook: {
            type: Number
        },
        monthlyPrice: {
            type: Number
        },
        typeName: {
            type: String
        },
        yearlyPrice: {
            type: Number
        }
    }
)


const UserType = mongoose.model('UserType', userTypeSchema,'userType')
const User = mongoose.model('User', userSchema,'user')

export {
    User,
    UserType
}
