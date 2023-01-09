import mongoose from "mongoose"

const bookSchema = mongoose.Schema(
    {
        bookname: {
            type: String,
            required: [true, "Please enter book name"],
        },
        author: {
            type: [author.authorName],
        },
        publisher: {
            type: String,
            required: [true, "Please enter book publisher"],
        },
        language: {
            type: String,
            required: [true, "Please enter book language"],
        },
        page: {
            type: Number,
        },
        description: {
            type: String,
            default: "none",
        },
        image: {
            type: Image,
        },
        bookTag: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'booktag',
            required: [true, "Please enter at least one tag"],
            default: null
        },
        rating: {
            type: Number,
            required: [true]
        },
        bowworedTime: {
            type: Number,
            required: [true]
        },
        note: {
            type: String,
            default: "none",
        },
        availableStatus: {
            type: Number,
            default: 1,
        },
    }
)

const tag = mongoose.Schema(
    {
        tagName: {
            type: String,
        },
    }
)

const booktag = mongoose.model('booktag', tag)
module.exports = mongoose.model('book', bookSchema)