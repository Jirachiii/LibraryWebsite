import mongoose from "mongoose"

var author = require('../models/author.js')
var book = require('../models/book.js')
var User = require('../models/user.js')

const notiSchema = mongoose.Schema (
    {
        bookname: {
            type: [book.bookname]
        },
        author: {
            type: [author.authorName]
        },
        userName: {
            type: [User.email]
        },
    }
)

const noti = mongoose.model('notiSchema', notiSchema)

module.exports = noti