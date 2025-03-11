const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')
const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const Author = require('./models/authors')
const Book = require('./models/books')
const User = require('./models/user')

const MONGODB_URI = process.env.MONGODB_URI

mongoose.connect(MONGODB_URI)
.then(async () => {
  console.log('connected to MongoDB Database')
  })
.catch((error) => {
  console.log('Failed to connect', error.message)
})


let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  { 
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  { 
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]

/*
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
*/

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },  
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'Demons',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]

/*
  you can remove the placeholder query once your first one has been implemented 
*/
const typeDefs = `
  type Book {
    id: ID!
    title: String!
    published: Int!
    author: Author!
    genres: [String!]
  }
  
  type Author {
    id: ID!
    name: String!
    born: Int
    bookCount: Int!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ) : Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }
`

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      let filters = {}

      if (args.author) {
        const author = await Author.findOne({name: args.author})
        if (author) {
          filters.author = author._id
        }
      }

      if (args.genre) {
        filters.genres = {$in: [args.genre]}
      }

      return await Book.find(filters)
    }
    ,
    allAuthors: async () => {
      return await Author.find({})
    },
    me: (root, args, context) => {
      return context.currentUser
    },
    
  },
  Book: {
    author: async (root) => {
      return await Author.findById(root.author)
    }
  },
  Author: {
    bookCount: async (root) => {
      return await Book.countDocuments({ author: root._id })
    }
  },
  Mutation: {
    addBook: async (root, args) => {
      let existingAuthor = await Author.findOne({name: args.author})
      if (!existingAuthor) {
        if (args.author.length < 4) {
          throw new GraphQLError('Author name is too short', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.author,
            }
          })
        }
        existingAuthor = new Author({name: args.author, id: uuid()})
        try {
          await existingAuthor.save()
        } catch (error) {
          throw new GraphQLError('An error with the author name provided has occured', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.author,
              error
            }
          })
        }
      }

      if (args.title.length < 5) {
        throw new GraphQLError('Book title is too short', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.title,
            error
          }
        })
      }
      let newBook = new Book({...args, id: uuid(), author: existingAuthor._id})
      try {
        await newBook.save()
      } catch (error) {
        throw new GraphQLError('An error has occured while attempting to save the book', 
          {extensions: {code: 'BAD_USER_INPUT', error}}
        )
      }
      return newBook
    },
    editAuthor: async (root, args, context) => {
      let author = await Author.findOne({name: args.name})

      const currentUser = context.currentUser

      if (!currentUser) {
        throw new GraphQLError('not authorized', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }

      if (author) {
        let updatedValue = await Author.findOneAndUpdate(
          {name: args.name}, 
          {
          $set: {
            born: args.setBornTo
          },
          new: true
          },
          {new: true}
        )
        return updatedValue
      }
      return null
    },
    createUser: async (root, args, context) => {
      const user = new User({username: args.username, favoriteGenre: args.favoriteGenre})
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new GraphQLError('not authorized', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }

      return user.save()
      .catch(error => {
        throw new GraphQLError('Creating user failed; username must be at least 3 characters', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.username,
            error
          }
        })
      })
    },
    login: async (root, args) => {
      const user = await User.findOne({username: args.username})

      if (!user || args.password !== process.env.PASSWORD) {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }

      const userForToken = {
        username: args.username,
        id: user._id,
      }

      return {value: jwt.sign(userForToken, process.env.JWT_SECRET)}
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({req, res}) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith('Bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), process.env.JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return {currentUser}
    }
  }
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})