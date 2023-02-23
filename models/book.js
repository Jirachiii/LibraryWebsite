import mongoose from "mongoose"

const bookTagSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please enter tag name"]
        }
    }
)

const bookSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please enter book name"],
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Author',
            required: [true, "Please enter book author"]
        },
        publisher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Publisher',
            required: [true, "Please enter book publisher"],
        },
        language: {
            type: String,
        },
        page: {
            type: Number,
        },
        description: {
            type: String,
            default: "none",
        },
        tags: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'BookTag',
            required: [true, "Please enter at least one tag"],
        },
        rating: {
            type: Number,
            default: 0
        },
        image: {
            type: String,
            default: "/images/book-cover-demo.jpg"
        },
        timesBorrowed: {
            type: Number,
            default: 0
        },
    }
)

const bookCopySchema = mongoose.Schema(
    {
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book',
            required: [true, "Please enter book reference"]
        },
        condition: {
            type: String,
            default: 'new'
        },
        status: {
            type: Boolean,
            default: false
        }
    }
)
const BookCopy = mongoose.model('BookCopy', bookCopySchema, 'bookCopy')
const BookTag = mongoose.model('BookTag', bookTagSchema, 'bookTag')
const Book = mongoose.model('Book', bookSchema, 'book')

export {
    Book,
    BookTag,
    BookCopy
}