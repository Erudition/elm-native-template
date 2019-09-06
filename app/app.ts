/*
In NativeScript, the app.ts file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.
*/


import { elmNative } from "./elm-native";
var elmApp;

console.warn("Before elmNative and doc is ");
elmNative(elmApp, {});
console.warn("After elmNative and doc is ");

// import * as application from "tns-core-modules/application";
//
// application.run({ moduleName: "app-root" });

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/
