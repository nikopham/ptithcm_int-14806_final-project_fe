import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { ThemeProvider } from "next-themes";
import { store } from "@/app/store";
import { AppRouter } from "@/router";
import "@/index.css"; 

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system">
      <Provider store={store}>
        <AppRouter />
      </Provider>
    </ThemeProvider>
  </React.StrictMode>
);
