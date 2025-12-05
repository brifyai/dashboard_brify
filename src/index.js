import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './assets/css/App.css';

import App from './App';

// Create router with future flags to suppress warnings
const router = createBrowserRouter([
  {
    path: "/*",
    element: <App />,
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
