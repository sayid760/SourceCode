import { registerApplication, start } from "../../../lib/esm/single-spa.dev";
console.log(registerApplication);
// registerApplication({
//   name: "@single-spa/welcome",
//   app: () =>
//     System.import(
//       "https://unpkg.com/single-spa-welcome/dist/single-spa-welcome.js"
//     ),
//   activeWhen: ["/"],
// });

registerApplication({
  name: "@sigrid/navbar",
  app: () => System.import("@sigrid/navbar"), //  System.import(http://localhost:8082/js/app.js)
  activeWhen: ["/"],
});

registerApplication({
  name: "@sigrid/app1",
  app: () => System.import("@sigrid/app1"),
  activeWhen: ["/vue"],
});

registerApplication({
  name: "@sigrid/app2",
  app: () => System.import("@sigrid/app2"),
  activeWhen: ["/vuetify"],
});

start({
  urlRerouteOnly: true,
});
