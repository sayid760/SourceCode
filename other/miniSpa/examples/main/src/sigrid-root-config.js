import { registerApplication, start } from "../../../src/index";
// import { registerApplication, start } from "../packages/single-spa.dev";

registerApplication({
  name: "@sigrid/app1",
  app: () => System.import("http://localhost:8080/js/app.js"),
  activeWhen: ["/"],
});

registerApplication({
  name: "@sigrid/app2",
  app: () => System.import("http://localhost:8081/js/app.js"),
  activeWhen: ["/vue2"],
});

start({
  urlRerouteOnly: true,
});
