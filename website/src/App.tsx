import { RouterProvider } from 'react-router-dom'
import router from './routes/router'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AuthInitializer from '@/components/common/AuthInitializer'


const queryClient = new QueryClient()

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        <RouterProvider router={router} />
      </AuthInitializer>
      </QueryClientProvider>
    </Provider>
  )
}

export default App