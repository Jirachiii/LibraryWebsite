import mongoose from "mongoose"

const authorSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please enter author name']
        },
        image: {
            type: String,
            default: "/images/author-demo.jpg"
        },
    }
)

const Author = mongoose.model('author', authorSchema)

export {
    Author
}