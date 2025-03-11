import { useState, useEffect } from "react"
import { LOGIN } from "../queries"
import { useMutation } from "@apollo/client"

const LoginForm = (props) => {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const [login, result] = useMutation(LOGIN, {
        onError: (error) => {
            const messages = error.graphQLErrors(e => e.messages).join('\n')
            console.log(messages)
        }
    })

    useEffect(() => {
        if (result.data) {
            const token = result.data.login.value
            props.setToken(token)
            localStorage.setItem('user-token', token)
        }
    }, [result.data])

    if (!props.show) {
        return null
    }

    const submit = (e) => {
        e.preventDefault()

        login({variables: {username, password}})
        props.setPage('authors')
    }

    return (
        <div>
            <form onSubmit={submit}>
                <div>
                    username 
                    <input type="text" value={username} onChange={({target}) => setUsername(target.value)} />
                </div>
                <div>
                    password 
                    <input type="password" value={password} onChange={({target}) => setPassword(target.value)} />
                </div>
                <button type="submit">login</button>
                </form>
        </div>
    )
}
export default LoginForm