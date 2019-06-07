<script>
  import { createEventDispatcher, tick } from "svelte";
  import lodashId from "lodash-id";
  import _ from "lodash";
  import { DateTime } from "luxon";

  _.mixin(lodashId);
  export let task;

  const dispatch = createEventDispatcher();

  async function handleKeyEvent(e) {
    if (e.altKey && e.code == "KeyD") {
      e.preventDefault();
      e.stopPropagation();
      toggleCompleted();
      await tick();
      document.getElementById(task.id).focus();
    } else if (e.altKey && e.code == "KeyC") {
      e.preventDefault();
      e.stopPropagation();
      toggleCancel();
      await tick();
      document.getElementById(task.id).focus();
    } else if (!e.shiftKey && e.code == "Tab") {
      e.preventDefault();
      e.stopPropagation();
      dispatch("make-child", {
        task
      });
      await tick();
      document.getElementById(task.id).focus();
    } else if (e.shiftKey && e.code == "Tab") {
      e.preventDefault();
      e.stopPropagation();
      dispatch("make-root", {
        task
      });
      await tick();
      document.getElementById(task.id).focus();
    } else if (!e.shiftKey && !e.altKey && e.code == "Enter") {
      e.preventDefault();
      e.stopPropagation();
      let newTask = _.insert([], { title: "", date: new Date() });
      dispatch("updates", {
        addToRoot: [newTask]
      });
      await tick();
      document.getElementById(newTask.id).focus();
    } else if (e.altKey && e.code == "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
      dispatch("updates", {
        moveUp: [task]
      });
      await tick();
      document.getElementById(task.id).focus();
    } else if (e.altKey && e.code == "ArrowDown") {
      e.preventDefault();
      e.stopPropagation();
      dispatch("updates", {
        moveDown: [task]
      });
      await tick();
      document.getElementById(task.id).focus();
    } else if (!e.altKey && e.code == "ArrowDown") {
      e.preventDefault();
      e.stopPropagation();
      dispatch("focusbelow", { task });
    } else if (!e.altKey && e.code == "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
      dispatch("focusabove", { task });
    } else if (!e.altKey && e.code == "Backspace") {
      if (task.title) return;
      e.preventDefault();
      e.stopPropagation();
      dispatch("focusabove", { task });
      dispatch("updates", { remove: [task] });
    } else if (e.altKey && e.code == "Enter") {
      e.preventDefault();
      e.stopPropagation();
      var event = document.createEvent("HTMLEvents");
      event.initEvent("contextmenu", false, true);
      document.getElementById(`holder-${task.id}`).dispatchEvent(event);
      document.getElementById(`contextMenu-${task.id}`).focus();
    }
  }

  function toggleCompleted() {
    task.completed = !task.completed;
    dispatch("updates", {
      update: [task]
    });
  }

  function toggleCancel() {
    task.cancelled = !task.cancelled;
    dispatch("updates", {
      update: [task]
    });
  }

  function makeChildAsSubChild(childTask, index) {
    if (!task.children[index - 1]) return;
    const parentTask = task.children[index - 1];
    const parentTaskToUpdate = {
      ...parentTask,
      children: [...(parentTask.children || []), childTask]
    };
    task.children[index - 1] = parentTaskToUpdate;
    task.children = task.children.filter(t => t.id !== childTask.id);
    dispatch("updates", {
      update: [task]
    });
  }

  function makeChildAsRoot(childTask, index) {
    const taskToUpdate = {
      ...task,
      children: task.children.filter(t => t.id !== childTask.id)
    };

    dispatch("updates", {
      update: [taskToUpdate],
      addToRoot: [childTask]
    });
  }

  function onChildTaskUpdates(
    { detail: { update, addToRoot, remove, moveUp, moveDown } },
    childTask,
    index
  ) {
    if (addToRoot) {
      task.children = [
        ...task.children.slice(0, index + 1),
        ...addToRoot,
        ...task.children.slice(index + 1, task.children.length)
      ];
    }
    if (update) {
      update.forEach(updatedTask => {
        const taskIndex = task.children.findIndex(a => a.id === updatedTask.id);
        task.children = [
          ...task.children.slice(0, taskIndex),
          updatedTask,
          ...task.children.slice(taskIndex + 1, task.children.length)
        ];
      });
    }
    if (remove) {
      remove.forEach(removedTask => {
        const taskIndex = task.children.findIndex(a => a.id === removedTask.id);
        task.children = [
          ...task.children.slice(0, taskIndex),
          ...task.children.slice(taskIndex + 1, task.children.length)
        ];
      });
    }
    if (moveUp && moveUp.length > 0) {
      var thisTaskIndex = task.children.findIndex(a => a.id === moveUp[0].id);
      if (thisTaskIndex != 0) {
        task.children = [
          ...task.children.slice(0, thisTaskIndex - 1),
          ...moveUp,
          ...task.children.slice(thisTaskIndex - 1, thisTaskIndex),
          ...task.children.slice(
            thisTaskIndex + moveUp.length,
            task.children.length
          )
        ];
      }
    }
    if (moveDown && moveDown.length > 0) {
      var thisTaskIndex = task.children.findIndex(a => a.id === moveDown[0].id);
      if (thisTaskIndex + moveDown.length < task.children.length) {
        task.children = [
          ...task.children.slice(0, thisTaskIndex),
          ...task.children.slice(
            thisTaskIndex + moveDown.length,
            thisTaskIndex + moveDown.length + 1
          ),
          ...moveDown,
          ...task.children.slice(
            thisTaskIndex + moveDown.length + 1,
            task.children.length
          )
        ];
      }
    }
  }

  async function handleInput(event) {
    event.preventDefault();
    event.stopPropagation();
    let val = document.getElementById(task.id).innerHTML;
    task.title = val;
  }
  let dateTimeString;
  $: dateTimeString = DateTime.fromISO(task.date).toLocaleString(
    DateTime.DATE_HUGE
  );

  function addMenu() {
    window
      .$(`#holder-${task.id}`)
      .contextMenu("menu", `#contextMenu-${task.id}`, {
        triggerOn: "contextmenu"
      });

       window
      .$(`#datepicker-${task.id}`)
      .datepicker({
        inline:true,
        container:`#datepicker-${task.id}`
      });
  }
</script>

<style>
  .cancelled {
    text-decoration-line: line-through;
  }

  input:focus {
    outline: none;
    border-bottom: 1px gray solid;
  }

  input {
    border: 0;
    margin: 2px;
    padding: 1px;
  }
  .date {
    font-size: 7pt;
    margin-left: 25px;
    color: gray;
  }
  .date:focus {
    outline: none;
  }
</style>

<div
  style="margin-left:20px;"
  on:keydown={handleKeyEvent}
  class="holder"
  id="holder-{task.id}">

  <input
    type="checkbox"
    bind:checked={task.completed}
    style="display:inline-block" />
  <input
    type="text"
    tabindex="0"
    class:cancelled={task.cancelled}
    id={task.id}
    style="display:inline-block"
    contenteditable
    bind:value={task.title}
    autocomplete="off"
    placeholder="Enter task description" />

  <div class="date" tabindex="0"> {dateTimeString} </div>

  {#if task.children}
    {#each task.children as child, index (child.id)}
      <svelte:self
        task={child}
        on:make-child={() => makeChildAsSubChild(child, index)}
        on:make-root={() => makeChildAsRoot(child, index)}
        on:updates={event => onChildTaskUpdates(event, task, index)}
        on:focusbelow
        on:focusabove />
    {/each}
  {/if}
</div>

<svelte:window on:DOMContentLoaded={addMenu} />

<ul class="contextMenu" id="contextMenu-{task.id}">
  <li on:click={toggleCompleted}>
    <span>
      <i class="iw-mIcon fas fa-check" style="color:Green" />
    </span>
    Mark as {task.completed ? 'incomplete' : 'completed'}
    <span class="shortcut">Alt+D</span>
  </li>
  <li on:click={toggleCancel}>
    <span>
      <i class="iw-mIcon fas fa-ban " style="color:Tomato" />
      Mark as {task.cancelled ? 'not cancelled' : 'cancelled'}
    </span>
    <span class="shortcut">Alt+C</span>
  </li>
  <hr />
  <li on:click={toggleCancel}>
    <span>
      <i class="iw-mIcon fas fa-calendar " style="color:skyblue" />
      Move to
    </span>
    <ul>
      <li>Tomorrow</li>
      <li>Next working day</li>
      <li>
        Next week
        <ul>
          <li>Monday</li>
          <li>Tuesday</li>
          <li>Wednesday</li>
          <li>Thursday</li>
          <li>Friday</li>
          <li>Saturday</li>
          <li>Sunday</li>
        </ul>
      </li>
      <li>Next month</li>
      <li>Select date
      <ul>
      <li>
      <div id="datepicker-{task.id}" class="date-picker">
      </div>
      </li>
      </ul>
      </li>
    </ul>
  </li>
</ul>
