import { configApiRef, createApiFactory, createPlugin, createRoutableExtension, discoveryApiRef, fetchApiRef, githubAuthApiRef } from '@backstage/core-plugin-api';
import {JacocoReportsClient} from './apiClients/jacocoReports';
import {jacocoReportsApiRef} from './apiRefs/jacocoReports';

import { rootRouteRef } from './routes';

export const jacocoReportsPlugin = createPlugin({
  id: 'jacoco-reports',
  apis: [
    createApiFactory({
      api: jacocoReportsApiRef,
      deps: {
        configApi: configApiRef,
        githubAuthApi: githubAuthApiRef,
        fetchApi: fetchApiRef,
        discoveryApi: discoveryApiRef,
      },
      factory: ({configApi, githubAuthApi, fetchApi, discoveryApi}) => 
        new JacocoReportsClient({configApi, githubAuthApi, fetchApi, discoveryApi})
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const JacocoReportsPage = jacocoReportsPlugin.provide(
  createRoutableExtension({
    name: 'JacocoReportsPage',
    component: () =>
      import('./components/TestReportsCard').then(m => m.TestReportsCard),
    mountPoint: rootRouteRef,
  }),
);
