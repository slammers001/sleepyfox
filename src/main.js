"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var client_1 = require("react-dom/client");
var core_1 = require("@mantine/core");
var notifications_1 = require("@mantine/notifications");
var modals_1 = require("@mantine/modals");
var App_1 = require("./App");
require("@mantine/core/styles.css");
require("@mantine/notifications/styles.css");
require("@mantine/dropzone/styles.css");
require("./index.css");
var theme = (0, core_1.createTheme)({
    primaryColor: 'blue',
    defaultRadius: 'md',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    components: {
        Button: {
            defaultProps: {
                radius: 'md',
            },
        },
    },
});
var root = (0, client_1.createRoot)(document.getElementById('root'));
root.render(<react_1.default.StrictMode>
    <core_1.MantineProvider theme={theme} defaultColorScheme="light">
      <modals_1.ModalsProvider>
        <notifications_1.Notifications position="top-right" zIndex={1000}/>
        <App_1.default />
      </modals_1.ModalsProvider>
    </core_1.MantineProvider>
  </react_1.default.StrictMode>);
