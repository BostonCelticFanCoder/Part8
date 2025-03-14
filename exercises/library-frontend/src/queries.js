import { gql } from "@apollo/client";

export const ALL_AUTHORS = gql`
query  {
  allAuthors  {
    name
    born
    bookCount
  }
}
`


export const ALL_BOOKS = gql`
  query AllBooks($genre: String) {
  allBooks(genre: $genre) {
    genres
    published
    title
    author {
      name
    }
  }
}
`
export const ADD_BOOK = gql`
mutation addBook($title: String!, $published: Int!, $author: String!, $genres: [String!]) {
  addBook(
    title: $title
    published: $published
    author: $author
    genres: $genres
  ) {
      title
      author {
        name
      }
      published
      genres
  }
}
`

export const EDIT_AUTHOR = gql`
mutation editAuthor($name: String!, $setBornTo: Int!) {
  editAuthor(
    name: $name
    setBornTo: $setBornTo
  ) {
    name
    born
    bookCount
  }
}
`

export const LOGIN = gql`
mutation login($username: String!, $password: String!) {
  login(
    username: $username
    password: $password
  ) {
    value  
  }
}
`

export const ME = gql`
query {
  me {
    
    favoriteGenre
  }
}
`