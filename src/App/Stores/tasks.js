import { writable, readable } from 'svelte/store';

import low from "lowdb";
import _ from "lodash";
import lodashId from "lodash-id";
import LocalStorage from "lowdb/adapters/LocalStorage";

const adapter = new LocalStorage('database', { defaultValue: { tasks: [] } })

const db = low(adapter)

db._.mixin(lodashId)

function createTasksStore() {
    let filter;
    const { subscribe, set } = writable([]);
    if (db.get('tasks').value().length == 0) {
        // _.range(500).forEach(element => {
        // db.get('tasks').insert({ title: `Task number ${element}`, date: new Date() }).write();
        // });

        db.get('tasks').insert({ title: "First Task", date: new Date() }).write();
        db.get('tasks').insert({ title: "Second Task", date: new Date() }).write();
        db.get('tasks').insert({ title: "Third Task", date: new Date() }).write();
        db.get('tasks').insert({ title: "4th Task", date: new Date() }).write();
        db.get('tasks').insert({ title: "5th Task", date: new Date() }).write();
        db.get('tasks').insert({ title: "6th Task", date: new Date() }).write();
        db.get('tasks').insert({ title: "7th Task", date: new Date() }).write();
        db.get('tasks').insert({ title: "8th Task", date: new Date() }).write();

    }

    return {
        subscribe,
        add: addTask,
        remove: removeTask,
        update: updateTask,
        load: (filterFunc) => {
            filter = filterFunc || (() => true);
            const tasks = db.get('tasks');
            set(tasks.filter(filter).value())
        },
        refresh: () => {
            const tasks = db.get('tasks');
            set(tasks.filter(filter).value())
        },
    };

    function addTask(task, before) {
        const tasks = db.get('tasks');
        if (!before) {
            tasks.insert(task).write();
        }
        else {
            const newTasks = [...tasks.slice(0, tasks.findIndex(t => t.id === before.id) - 1), task, ...tasks.slice(tasks.findIndex(t => t.id === before.id), tasks.length)]
            db.set('tasks', newTasks)
        }
        set(db.get('tasks').filter(filter).value());
    }



    function removeTask(task) {
        const tasks = db.get('tasks');
        const taskToRemove = tasks.getById(task.id).value();
        if (!taskToRemove) return;
        tasks.remove(taskToRemove).write();
        set(tasks.filter(filter).value());
    }

    function updateTask(task) {
        const tasks = db.get('tasks');
        tasks.getById(task.id).assign(task).write();
        set(tasks.filter(filter).value());
    }
}

export const taskStore = createTasksStore();