/* eslint-disable react/no-multi-comp */
/* eslint-disable react/display-name */
import React, { lazy } from 'react';
import { Redirect } from 'react-router-dom';
import AuthLayout from './layouts/Auth';
import ErrorLayout from './layouts/Error';

const routes = [
  {
    path: '/',
    exact: true,
    component: () => <Redirect to="/weather-data" />
  },
  {
    path: '/weather-data',
    component: AuthLayout,
    routes: [
      {
        path: '/weather-data',
        exact: true,
        component: lazy(() => import('views/WeatherDataExtractor'))
      },
      {
        component: () => <Redirect to="/errors/error-404" />
      } 
    ]
  },
  {
    path: '/errors',
    component: ErrorLayout,
    routes: [
      {
        path: '/errors/error-401',
        exact: true,
        component: lazy(() => import('views/Error401'))
      },
      {
        path: '/errors/error-404',
        exact: true,
        component: lazy(() => import('views/Error404'))
      },
      {
        path: '/errors/error-500',
        exact: true,
        component: lazy(() => import('views/Error500'))
      },
      {
        component: () => <Redirect to="/errors/error-404" />
      }
    ]
  }
   
];

export default routes;
