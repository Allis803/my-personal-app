
const $ = (id) => document.getElementById(id);

function readSaved(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

let tasks = readSaved("myspace-tasks", []);
if (!Array.isArray(tasks)) tasks = [];

let savedName = readSaved("myspace-name", "Friend");
let theme = readSaved("myspace-theme", "dark");

if (typeof savedName !== "string") savedName = "Friend";
if (theme !== "light" && theme !== "dark") theme = "dark";

function showDate() {
  $("today").textContent = new Date().toLocaleDateString(
    undefined,
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  );
}

function applyTheme() {
  document.body.classList.toggle("light", theme === "light");
  $("themeBtn").textContent = theme === "light" ? "🌙" : "☀️";
  document.querySelector('meta[name="theme-color"]')
    .setAttribute("content", theme === "light" ? "#f1f5f9" : "#101827");
}

function updateName() {
  $("displayName").textContent = savedName || "Friend";
  $("nameInput").value = savedName === "Friend" ? "" : savedName;

  $("nameEntry").style.display =
    savedName === "Friend" ? "" : "none";
}

function renderTasks() {
  const list = $("taskList");
  list.replaceChildren();

  tasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = "task-item" + (task.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", "Mark task complete");

    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      save("myspace-tasks", tasks);
      renderTasks();
    });

    const label = document.createElement("label");
    label.textContent = task.text;

    const remove = document.createElement("button");
    remove.className = "delete-btn";
    remove.textContent = "Delete";
    remove.setAttribute("aria-label", "Delete " + task.text);

    remove.addEventListener("click", () => {
      tasks = tasks.filter((t) => t.id !== task.id);
      save("myspace-tasks", tasks);
      renderTasks();
    });

    item.append(checkbox, label, remove);
    list.appendChild(item);
  });

  $("emptyTasks").hidden = tasks.length > 0;
  $("totalTasks").textContent = tasks.length;
  $("doneTasks").textContent = tasks.filter((t) => t.done).length;
}

$("taskForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const text = $("taskInput").value.trim();
  if (!text) return;

  tasks.unshift({
    id: Date.now().toString() + Math.random().toString(36).slice(2),
    text,
    done: false
  });

  save("myspace-tasks", tasks);
  renderTasks();
  $("taskInput").value = "";
  $("taskInput").focus();
});

$("saveName").addEventListener("click", () => {
  savedName = $("nameInput").value.trim().slice(0, 30) || "Friend";
  save("myspace-name", savedName);
  updateName();
});

$("themeBtn").addEventListener("click", () => {
  theme = theme === "dark" ? "light" : "dark";
  save("myspace-theme", theme);
  applyTheme();
});

$("notes").value = readSaved("myspace-notes", "");
if (typeof $("notes").value !== "string") $("notes").value = "";

$("notes").addEventListener("input", () => {
  const success = save("myspace-notes", $("notes").value);
  $("saveStatus").textContent = success
    ? "Saved on this device ✓"
    : "Could not save. Check your device storage.";
});

showDate();
applyTheme();
updateName();
renderTasks();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
