import { useEffect, useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import LoginForm from "./components/LoginForm"
import { useApolloClient } from "@apollo/client";
import { useQuery } from "@apollo/client";
import Recommendations from "./components/Recommend";

const App = () => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  const userToken = localStorage.getItem('user-token')


  useEffect(() => {
    userToken ? setToken(userToken) : null
  }, [userToken])
  


  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token && <button onClick={() => setPage("add")}>add book</button>}
        {token && <button onClick={() => setPage("recommend")}>recommend</button>}
        {token ? <button onClick={logout}>logout</button> :
        <button onClick={() => setPage("login")}>login</button>}
      </div>

      <Authors show={page === "authors"} />

      <Books show={page === "books"} />


      <LoginForm show={page === "login"} setToken={setToken} setPage={setPage} />


      <NewBook show={page === "add"} />

      <Recommendations show={page === "recommend"} />

    </div>
  );
};

export default App;
