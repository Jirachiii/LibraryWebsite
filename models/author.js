import mongoose from "mongoose"

const authorSchema = mongoose.Schema(
    {
        authorName: {
            type: String,
            required: [true, 'Please enter author name']
        },
        authorImage: {
            type: Image,
        },
    }
)

const author = mongoose.model('author', authorSchema)

module.exports = author