import mongoose from "mongoose"

const authorSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please enter author name']
        },
        image: {
            type: Image,
            default: "/images/author-demo.jpg"
        },
    }
)

const author = mongoose.model('author', authorSchema)

module.exports = author