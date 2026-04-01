/* =========================================
   TASKORA - Smart Task Manager
   Pure Vanilla JS - Structured & Modular
========================================= */

const taskList = document.getElementById("taskList");
const taskModal = document.getElementById("taskModal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const searchInput = document.getElementById("searchInput");
const taskCount = document.getElementById("taskCount");
const progressBar = document.getElementById("progressBar");
const themeToggle = document.getElementById("themeToggle");
const emptyState = document.getElementById("emptyState");

let tasks = JSON.parse(localStorage.getItem("taskoraTasks")) || [];
let currentFilter = "all";
let editTaskId = null;

/* =========================
   MODAL CONTROLS
========================= */

openModalBtn.onclick = () => {
    taskModal.style.display = "flex";
};

closeModalBtn.onclick = () => {
    resetModal();
};

/* =========================
   SAVE TASK
========================= */

saveTaskBtn.onclick = () => {
    const title = document.getElementById("taskTitle").value.trim();
    const description = document.getElementById("taskDescription").value.trim();
    const priority = document.getElementById("taskPriority").value;
    const dueDate = document.getElementById("taskDueDate").value;
    const category = document.getElementById("taskCategory").value.trim();

    if (!title) {
        alert("Task title cannot be empty.");
        return;
    }

    if (editTaskId) {
        updateTask(editTaskId, title, description, priority, dueDate, category);
    } else {
        addTask(title, description, priority, dueDate, category);
    }

    resetModal();
};

/* =========================
   ADD TASK
========================= */

function addTask(title, description, priority, dueDate, category) {
    const newTask = {
        id: Date.now().toString(),
        title,
        description,
        priority,
        dueDate,
        category,
        completed: false
    };

    tasks.push(newTask);
    saveToLocalStorage();
    renderTasks();
}

/* =========================
   UPDATE TASK
========================= */

function updateTask(id, title, description, priority, dueDate, category) {
    tasks = tasks.map(task =>
        task.id === id
            ? { ...task, title, description, priority, dueDate, category }
            : task
    );

    editTaskId = null;
    saveToLocalStorage();
    renderTasks();
}

/* =========================
   DELETE TASK
========================= */

function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) return;

    tasks = tasks.filter(task => task.id !== id);
    saveToLocalStorage();
    renderTasks();
}

/* =========================
   TOGGLE COMPLETE
========================= */

function toggleComplete(id) {
    tasks = tasks.map(task =>
        task.id === id
            ? { ...task, completed: !task.completed }
            : task
    );

    saveToLocalStorage();
    renderTasks();
}

/* =========================
   RENDER TASKS
========================= */

function renderTasks() {
    taskList.innerHTML = "";

    let filteredTasks = tasks.filter(task => {
        if (currentFilter === "completed") return task.completed;
        if (currentFilter === "pending") return !task.completed;
        return true;
    });

    const searchValue = searchInput.value.toLowerCase();
    filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(searchValue)
    );

    if (filteredTasks.length === 0) {
        emptyState.style.display = "block";
    } else {
        emptyState.style.display = "none";
    }

    filteredTasks.forEach(task => {
        const card = document.createElement("div");
        card.className = "task-card";
        card.draggable = true;

        if (task.completed) {
            card.classList.add("completed");
        }

        card.innerHTML = `
            <div class="task-header">
                <div>
                    <input type="checkbox" ${task.completed ? "checked" : ""}>
                    <span class="task-title">${task.title}</span>
                </div>
                <div>
                    <button onclick="editTask('${task.id}')">✏️</button>
                    <button onclick="deleteTask('${task.id}')">🗑</button>
                </div>
            </div>
            <div class="task-description">${task.description || ""}</div>
            <div class="task-footer">
                <span class="priority ${task.priority}">${task.priority}</span>
                <span>${task.dueDate || ""}</span>
                <span>${task.category || ""}</span>
            </div>
        `;

        card.querySelector("input").addEventListener("change", () => {
            toggleComplete(task.id);
        });

        addDragEvents(card, task.id);
        taskList.appendChild(card);
    });

    updateStats();
}

/* =========================
   EDIT TASK
========================= */

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    document.getElementById("taskTitle").value = task.title;
    document.getElementById("taskDescription").value = task.description;
    document.getElementById("taskPriority").value = task.priority;
    document.getElementById("taskDueDate").value = task.dueDate;
    document.getElementById("taskCategory").value = task.category;

    editTaskId = id;
    taskModal.style.display = "flex";
}

/* =========================
   FILTER BUTTONS
========================= */

document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

/* =========================
   SEARCH
========================= */

searchInput.addEventListener("input", renderTasks);

/* =========================
   DRAG & DROP
========================= */

let dragStartId = null;

function addDragEvents(card, id) {
    card.addEventListener("dragstart", () => {
        dragStartId = id;
    });

    card.addEventListener("dragover", e => {
        e.preventDefault();
    });

    card.addEventListener("drop", () => {
        const draggedIndex = tasks.findIndex(t => t.id === dragStartId);
        const dropIndex = tasks.findIndex(t => t.id === id);

        const draggedItem = tasks.splice(draggedIndex, 1)[0];
        tasks.splice(dropIndex, 0, draggedItem);

        saveToLocalStorage();
        renderTasks();
    });
}

/* =========================
   STATS + PROGRESS
========================= */

function updateStats() {
    taskCount.textContent = `${tasks.length} Tasks`;

    const completed = tasks.filter(t => t.completed).length;
    const percentage = tasks.length
        ? (completed / tasks.length) * 100
        : 0;

    progressBar.style.width = percentage + "%";
}

/* =========================
   LOCAL STORAGE
========================= */

function saveToLocalStorage() {
    localStorage.setItem("taskoraTasks", JSON.stringify(tasks));
}

/* =========================
   DARK MODE
========================= */

themeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark");
});

/* =========================
   RESET MODAL
========================= */

function resetModal() {
    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDescription").value = "";
    document.getElementById("taskPriority").value = "low";
    document.getElementById("taskDueDate").value = "";
    document.getElementById("taskCategory").value = "";

    editTaskId = null;
    taskModal.style.display = "none";
}

/* =========================
   INIT
========================= */

renderTasks();