import { ChakraProvider, ColorModeScript, extendTheme } from "@chakra-ui/react";
import { Configuration, OpenAIApi } from "openai";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { App } from "./App";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  styles: {
    global: {
      html: {
        height: "100%",
        width: "100%",
      },
      body: {
        bg: "gray.800",
        height: "100%",
      },
      "#root": {
        height: "100%",
      },
    },
  },
});

const configuration = new Configuration({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});

export const openai = new OpenAIApi(configuration);

root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <>
        {localStorage.setItem("chakra-ui-color-mode", "dark")}
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </>
    </ChakraProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
