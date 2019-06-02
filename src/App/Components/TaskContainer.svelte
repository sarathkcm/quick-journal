<script>
  import Task from "./Task.svelte";
  import { createEventDispatcher } from "svelte";
  export let tasks;

  function makeAsChild(task, index) {
    if (!tasks[index - 1]) return;
    const parentTask = tasks[index - 1];
    const parentTaskToUpdate = {
      ...parentTask,
      children: [...(parentTask.children || []), task]
    };
    tasks[index - 1] = parentTaskToUpdate;
    tasks = tasks.filter(t => t.id !== task.id);
  }

  function onTaskUpdates(
    { detail: { update, addToRoot, remove, moveUp, moveDown } },
    task,
    index
  ) {
    if (addToRoot) {
      tasks = [
        ...tasks.slice(0, index+1),
        ...addToRoot,
        ...tasks.slice(index+1, tasks.length)
      ];
    }
    if (update) {
      update.forEach(task => {
        const taskIndex = tasks.findIndex(a => a.id === task.id);
        tasks = [
          ...tasks.slice(0, taskIndex),
          task,
          ...tasks.slice(taskIndex + 1, tasks.length)
        ];
      });
    }
    if (remove) {
      remove.forEach(task => {
        const taskIndex = tasks.findIndex(a => a.id === task.id);
        tasks = [
          ...tasks.slice(0, taskIndex),
          ...tasks.slice(taskIndex + 1, tasks.length)
        ];
      });
    }
    if (moveUp && moveUp.length > 0) {
      var thisTaskIndex = tasks.findIndex(a => a.id === moveUp[0].id);
      if (thisTaskIndex != 0) {
        tasks = [
          ...tasks.slice(0, thisTaskIndex - 1),
          ...moveUp,
          ...tasks.slice(thisTaskIndex - 1, thisTaskIndex),
          ...tasks.slice(
            thisTaskIndex + moveUp.length,
            tasks.length
          )
        ];
      }
    }
    if (moveDown && moveDown.length > 0) {
      var thisTaskIndex = tasks.findIndex(a => a.id === moveDown[0].id);
      if (thisTaskIndex + moveDown.length < tasks.length) {
        tasks = [
          ...tasks.slice(0, thisTaskIndex),
          ...tasks.slice(
            thisTaskIndex + moveDown.length,
            thisTaskIndex + moveDown.length + 1
          ),
          ...moveDown,
          ...tasks.slice(
            thisTaskIndex + moveDown.length + 1,
            tasks.length
          )
        ];
      }
    }
  }
</script>

{#each tasks as task, index (task.id)}
  <Task
    {task}
    on:make-child={() => makeAsChild(task, index)}
    on:updates={event => onTaskUpdates(event, task, index)} />
{/each}
