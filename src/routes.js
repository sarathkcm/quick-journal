import { prepareRoutes } from "@curi/router";
import DayView from "./App/Components/DayView.svelte";
window.process = window.process || { env: {} };
const routes = prepareRoutes([
    {
        name: "Day",
        path: "",
        respond() {
            return {
                body: {
                    main: DayView,
                }
            }
        }
    },
]);

export default routes;