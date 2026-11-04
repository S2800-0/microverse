import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./styles.css";
import {ExperienceRecovery} from "./components/ExperienceRecovery.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ExperienceRecovery><App /></ExperienceRecovery>
  </React.StrictMode>,
);
