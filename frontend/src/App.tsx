import { useRoutes } from "react-router"
import { ErrorBoundary } from "./components/ErrorBoundary"
import routes from "./routes"

function App() {
  const element = useRoutes(routes)

  return (
    <ErrorBoundary>
      {element}
    </ErrorBoundary>
  )
}

export default App
