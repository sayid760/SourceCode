import { registerApplication, start } from "../../../src/index";

registerApplication({
  name: "sss",
  app: () => System.import("http://localhost:8080/js/app.js"),
  activeWhen: ["/"],
});

start({
  urlRerouteOnly: true,
});
