import { registerApplication, start } from "../../../src/index";

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

export const go = (pathname) => {
  history.pushState({}, null, pathname);
  reroute();
};
