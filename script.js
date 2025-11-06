const API_URL = 'https://dummyjson.com/todos';

const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskList = document.querySelector('#task-list .list-group');
const taskCounter = document.getElementById('task-counter');

let tasks = [];

async function fetchTasks() {
    try {
        const response = await fetch(`${API_URL}?limit=20`);
        if (!response.ok) throw new Error('Не удалось загрузить задачи');
        const data = await response.json();
        tasks = data.todos;
        renderTasks();
    } catch (error) {
        console.error('Ошибка при загрузке задач:', error);
    }
}

function updateTaskCounter() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    taskCounter.textContent = `${totalTasks} задач всего, ${completedTasks} выполнено`;
}

async function addTask(title) {
    const task = {
        todo: title,
        completed: false,
        userId: 1
    };
    try {
        const response = await fetch(`${API_URL}/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        });
        const responseBody = await response.json();
        if (!response.ok) throw new Error('Не удалось добавить задачу');
        tasks.push(responseBody);
        renderTasks();
        logAction('POST', `${API_URL}/add`, task, response.status, responseBody);
    } catch (error) {
        console.error('Ошибка при добавлении задачи:', error);
    }
}

async function updateTaskTitle(taskId, newTitle) {
    try {
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ todo: newTitle })
        });
        const responseBody = await response.json();
        if (!response.ok) throw new Error('Не удалось обновить название задачи');
        tasks = tasks.map(task => task.id === taskId ? { ...task, todo: newTitle } : task);
        renderTasks();
        logAction('PATCH', `${API_URL}/${taskId}`, { todo: newTitle }, response.status, responseBody);
    } catch (error) {
        console.error('Ошибка при обновлении названия задачи:', error);
    }
}

async function changeTaskStatus(taskId, completed) {
    try {
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed })
        });
        const responseBody = await response.json();
        if (!response.ok) throw new Error('Не удалось изменить статус задачи');
        tasks = tasks.map(task => task.id === taskId ? { ...task, completed } : task);
        renderTasks();
        logAction('PATCH', `${API_URL}/${taskId}`, { completed }, response.status, responseBody);
    } catch (error) {
        console.error('Ошибка при изменении статуса задачи:', error);
    }
}

async function deleteTask(taskId) {
    try {
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'DELETE'
        });
        const responseBody = await response.json();
        if (!response.ok) throw new Error('Не удалось удалить задачу');
        tasks = tasks.filter(task => task.id !== taskId);
        renderTasks();
        logAction('DELETE', `${API_URL}/${taskId}`, null, response.status, responseBody);
    } catch (error) {
        console.error('Ошибка при удалении задачи:', error);
    }
}

function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = 'list-group-item task-item';
        taskItem.innerHTML = `
            <input type="checkbox" class="form-check-input accent-pink-500" ${task.completed ? 'checked ' : ''} onchange="changeTaskStatus(${task.id}, this.checked)">
            <input type="text" class="form-control task-title" value="${task.todo}" onchange="updateTaskTitle(${task.id}, this.value)">
            <button class="btn btn-danger" onclick="deleteTask(${task.id})">Удалить</button>
        `;
        taskList.appendChild(taskItem);
    });
    updateTaskCounter();
}

function logAction(method, url, body, status, responseBody) {
    const now = new Date();
    const time = now.toLocaleTimeString();
    const logMessage = {
        method,
        url,
        date: now.toISOString(),
        status,
        responseBody,
        body
    };
    console.log(`[${time}] ${method} ${url} - Status: ${status}`);
    console.log('Request Body:', body);
    console.log('Response Body:', responseBody);
}

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (taskTitleInput.value.trim()) {
        addTask(taskTitleInput.value);
        taskTitleInput.value = '';
    }
});

fetchTasks();
