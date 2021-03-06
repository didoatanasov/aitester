// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  SESSION_TIMEOUT: 1800, // Timeout in seconds
  ALLOW_FEEDBACK: true,
  HTTP_TIMEOUT: 10000,
  APP_TYPE: 'mobile',
  version: '1.0.0',
  buildDate: 'Wed, 25 Sep 2019 05:35:22 GMT'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
