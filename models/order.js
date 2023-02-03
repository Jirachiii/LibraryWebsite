import mongoose from "mongoose"

const orderSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            require: [true, 'Please enter user objectId'],
        },
        book: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Book',
            require: [true, 'Please enter book objectId'],
        },
        copy: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'BookCopy',
            require: [true, 'Please enter book copy objectId'],
        },
        status: {
            type: [Boolean],
            require: [true, 'Please enter borrow status'],
        },
        borrowDate: {
            type: [Date],
            require: [true, 'Please enter borrow date'],
        },
        returnDate: {
            type: [Date],
            require: [true, 'Please enter return date'],
        },
    }
)

const Order = mongoose.model('Order', orderSchema, 'order')

export {
    Order
}