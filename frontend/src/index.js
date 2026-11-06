import { Buffer } from "buffer";
import "./index.css";
import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import * as serviceworker from './serviceWorker';
import App from "./App";

window.Buffer = Buffer;

ReactDOM.render(
	<CssBaseline>
		<App />
	</CssBaseline>,
	document.getElementById("root"),
	() => {
		window.finishProgress();
	}
);

// Em dev o service worker cacheia / e APIs e pode deixar o ecrã preso no loading; em produção mantém PWA.
if (process.env.NODE_ENV === "production") {
	serviceworker.register();
} else {
	serviceworker.unregister();
}
