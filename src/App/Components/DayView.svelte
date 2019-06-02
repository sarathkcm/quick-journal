<script>
  import { taskStore } from "../Stores/tasks";
  import { DateTime } from "luxon";
  import _ from "lodash";
  import TaskContainer from "./TaskContainer.svelte";

  const tomorrow = DateTime.fromJSDate(new Date())
    .plus({ days: 1 })
    .startOf("day");

  function todaysTaskFilter(task) {
    return DateTime.fromJSDate(new Date(task.date)) <= tomorrow;
  }

  taskStore.load(todaysTaskFilter);
</script>

<TaskContainer tasks={$taskStore} />
