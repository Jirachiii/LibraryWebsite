import mongoose from 'mongoose'

const couponSchema = mongoose.Schema(
    {
        name: {
            type: String
        },
        owner: {
            type: String
        },
        startDate: {
            type: Date
        },
        endDate: {
            type: Date
        },
        bookAmountIncrease: {
            type: Number
        },
        regisPriceDecrease: {
            type: Number
        },
        image: {
            type: String
        }
    }
)


const Coupon = mongoose.model('Coupon',couponSchema,'coupon')

export {
    Coupon
}