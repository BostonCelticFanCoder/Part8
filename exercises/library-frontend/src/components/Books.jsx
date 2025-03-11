import { useQuery } from "@apollo/client"
import { ALL_BOOKS } from "../queries"
import { useEffect, useState } from "react"

const Books = (props) => {
  const [filterGenre, setFilterGenre] = useState(null)
  const [allGenres, setAllGenres] = useState([])
  const { loading, error, data, refetch } = useQuery(ALL_BOOKS, {
    variables: { genre: filterGenre || "" },
  })

  useEffect(() => {
    if (filterGenre != null) {
      refetch({ genre: filterGenre })
    }
  }, [filterGenre, refetch])

  useEffect(() => {
    if (data && allGenres.length === 0) {
      const genres = new Set()
      data.allBooks.forEach(book => {
        book.genres.forEach(genre => {
          genres.add(genre)
        })
      })
      setAllGenres(Array.from(genres))
    }
  }, [data, allGenres.length])

  if (!props.show) {
    return null
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  const books = data ? data.allBooks : []

  const genresToShow = filterGenre ? allGenres.concat(['clear']) : allGenres.filter((genre) => genre !== "clear")

  return (
    <div>
      <h2>books</h2>
      {filterGenre ? <p>in genre <b>{filterGenre}</b></p> : null}

      <table style={{ marginTop: '-20px' }}>
        <tbody>
          <tr>
            <th></th>
            <th style={{ textAlign: "left" }}>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {genresToShow.map(genre => (
        <button key={genre} onClick={() => setFilterGenre(genre === "clear" ? null : genre)}>{genre}</button>
      ))}
    </div>
  )
}

export default Books