import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'
import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'

const Authors = (props) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{query: ALL_AUTHORS}],
    onError: (error) => {
      const messages = error.graphQLErrors.map(e => e.message).join('\n')
      console.log(messages)
    } 
  })

  const result = useQuery(ALL_AUTHORS)

  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  } 

  if (result.error) {
    return <div>Error: {result.error.message}</div>
  }
  const authors = result.data ? result.data.allAuthors : [];


  const submit = async (event) => {
    event.preventDefault()

    if (name && Number.isInteger(born)) {
      editAuthor({ variables: {name: name, setBornTo: born}})
    } else {
      console.log('Fields are empty')
  }
    setBorn('')
    setName('')

  }


  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={submit}>
        <h2>Set birthyear</h2>
        <div>
          name
          <select defaultValue={authors[0].name} onChange={e => setName(e.target.value)}>
            {authors.map((a => (
              <option key={authors.indexOf(a)} value={a.name}>{a.name}</option>
            )))}
          </select>
        </div>
        <div>
          born
        <input type="number" value={born} onChange={({target}) => setBorn(parseInt(target.value))} />
        </div>
        <button type="submit" >update author</button>
      </form>
    </div>
  )
}

export default Authors
