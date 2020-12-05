const test = require("firebase-functions-test")(
  {
    databaseURL: "https://final-project-pemrog-web.firebaseio.com",
    projectId: "final-project-pemrog-web",
    storageBucket: "final-project-pemrog-web.appspot.com",
  },
  "../final-project-pemrog-web-firebase-adminsdk-ax161-e6fee3d348.json"
);
test.mockConfig({
  algolia: { app: "VC8WCMFUPU", key: "992f28c233e01c9e8c8c0a7c3b5d2056" },
});
const myFunctions = require("../index.js");
