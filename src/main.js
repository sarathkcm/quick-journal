import { browser } from "@hickory/browser";
import { createRouter, announce } from "@curi/router";

import routes from "./routes";
import App from './App/App.svelte';

const router = createRouter(browser, routes, {
	sideEffects: [
		announce(({ response }) => {
			return `Navigated to ${response.location.pathname}`;
		})
	]
});
const app = new App({
	target: document.body,
	props: {
		router
	}
});

export default app;