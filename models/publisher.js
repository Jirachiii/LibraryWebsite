import mongoose from "mongoose"

const publisherSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please enter publisher name']
        },
        image: {
            type: String,
            default: "/images/book-cover-demo.webp"
        },
    }
)

const Publisher = mongoose.model('Publisher', publisherSchema, 'publisher')

export {
    Publisher
}