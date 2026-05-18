import React from 'react'; // Add this line
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
 
import Home from './Home.jsx';
import { RouterProvider } from 'react-router-dom';
import { router } from './route/Route.jsx';

import '@fontsource/cormorant-garamond'; 
import store from './redux/store.js';
 
import { Provider } from "react-redux";


createRoot(document.getElementById('root')).render(
  <StrictMode>
      <Provider store={store}> 
   <RouterProvider router={router}> 
      <Home />
   </RouterProvider>
    
    </Provider>
  </StrictMode>,
);

