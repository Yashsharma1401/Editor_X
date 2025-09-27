import { Navigate } from 'react-router-dom'
import App from './App.jsx'

import HomeRedirect from './screens/HomeRedirect.jsx'
import CanvasPage from './screens/CanvasPage.jsx'
import CompletionMessage from './screens/CompletionMessage.jsx'

const routes = [
  {
    path: '/',
    element: <HomeRedirect />,
  },
  {
    path: '/canvas/:id',
    element: <CanvasPage />,
  },
  {
    path: '/done',
    element: <CompletionMessage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]

export default routes


