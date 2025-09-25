import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/markdown-page',
    component: ComponentCreator('/markdown-page', '3d7'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', 'c08'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', 'ab0'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', '990'),
            routes: [
              {
                path: '/docs/intro',
                component: ComponentCreator('/docs/intro', '61d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/SDK_INTEGRATION_GUIDE',
                component: ComponentCreator('/docs/SDK_INTEGRATION_GUIDE', '0d1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/subscription',
                component: ComponentCreator('/docs/subscription', '215'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', 'e5f'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
