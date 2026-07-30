const passwordGate = document.querySelector("#password-gate");
const dashboard = document.querySelector("#dashboard");
const passwordForm = document.querySelector("#password-form");
const passwordInput = document.querySelector("#dashboard-password");
const passwordError = document.querySelector("#password-error");
const accessKey = "chand-desk-access";
const passwordHash = "4f55bc45281e8b93bbd1acdaf7fe746a46b44b3ef8a288693c2753d92e6b21fa";

function unlockDashboard() {
  passwordGate.hidden = true;
  dashboard.hidden = false;
}

if (sessionStorage.getItem(accessKey) === "granted") {
  unlockDashboard();
}

passwordForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const bytes = new TextEncoder().encode(passwordInput.value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const enteredHash = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  if (enteredHash === passwordHash) {
    sessionStorage.setItem(accessKey, "granted");
    passwordError.hidden = true;
    passwordInput.value = "";
    unlockDashboard();
    return;
  }

  passwordError.hidden = false;
  passwordInput.select();
});

const filters = document.querySelectorAll("[data-filter]");
const cards = document.querySelectorAll("[data-task]");
const doneKey = "chand-done";

let done = JSON.parse(localStorage.getItem(doneKey) || "[]");
let activeFilter = "All";

function refreshTasks() {
  let visible = 0;
  cards.forEach((card) => {
    const show = !done.includes(card.dataset.task) &&
      (activeFilter === "All" || card.dataset.channel === activeFilter);
    card.hidden = !show;
    if (show) visible += 1;
  });
  document.querySelector("#open-count").textContent = String(cards.length - done.length);
  document.querySelector("#empty-state").hidden = visible !== 0;
}

filters.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filters.forEach((item) => item.classList.toggle("active", item === button));
    refreshTasks();
  });
});

document.querySelectorAll("[data-done]").forEach((button) => {
  button.addEventListener("click", () => {
    done = [...new Set([...done, button.dataset.done])];
    localStorage.setItem(doneKey, JSON.stringify(done));
    refreshTasks();
  });
});

document.querySelector("#restore").addEventListener("click", () => {
  done = [];
  localStorage.removeItem(doneKey);
  refreshTasks();
});

refreshTasks();

const weekendBrief = document.querySelector("#weekend-brief");
const refreshWeekendBriefWindow = () => {
  if (!weekendBrief) return;
  const content = weekendBrief.querySelector(".brief-content");
  const standby = weekendBrief.querySelector(".brief-standby");
  const timer = weekendBrief.querySelector(".brief-timer");
  const ready = weekendBrief.dataset.summaryReady === "true";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type) => parts.find((part) => part.type === type)?.value;
  const date = `${get("year")}-${get("month")}-${get("day")}`;
  const inWindow = get("weekday") === "Mon" && Number(get("hour")) === 10;
  const showSummary = ready && inWindow && weekendBrief.dataset.briefDate === date;
  content.hidden = !showSummary;
  standby.hidden = showSummary;
  timer.textContent = showSummary ? "Clears at 11:00 AM ET" : "Next brief ? Monday 10:00 AM ET";
};

refreshWeekendBriefWindow();
window.setInterval(refreshWeekendBriefWindow, 60_000);

const remindersKey = "chand-reminders";
const reminderForm = document.querySelector("#reminder-form");
const reminderTitle = document.querySelector("#reminder-title");
const reminderDue = document.querySelector("#reminder-due");
const reminderList = document.querySelector("#reminder-list");
const reminderAlert = document.querySelector("#reminder-alert");
let reminders = [];

try {
  reminders = JSON.parse(localStorage.getItem(remindersKey) || "[]");
} catch {
  reminders = [];
}

const saveReminders = () => localStorage.setItem(remindersKey, JSON.stringify(reminders));
const formatDue = (due) => new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
}).format(new Date(due));

const renderReminders = () => {
  reminderList.replaceChildren();
  if (reminders.length === 0) {
    const empty = document.createElement("div");
    empty.className = "reminder-empty";
    empty.textContent = "No reminders yet.";
    reminderList.append(empty);
    return;
  }

  reminders
    .sort((a, b) => new Date(a.due) - new Date(b.due))
    .forEach((reminder) => {
      const item = document.createElement("article");
      item.className = `reminder-item${reminder.done ? " completed" : ""}`;

      const copy = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = reminder.title;
      const due = document.createElement("span");
      due.textContent = formatDue(reminder.due);
      copy.append(title, due);

      const actions = document.createElement("div");
      const doneButton = document.createElement("button");
      doneButton.type = "button";
      doneButton.textContent = reminder.done ? "Undo" : "Done";
      doneButton.addEventListener("click", () => {
        reminder.done = !reminder.done;
        saveReminders();
        renderReminders();
      });
      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.textContent = "Remove";
      removeButton.addEventListener("click", () => {
        reminders = reminders.filter((item) => item.id !== reminder.id);
        saveReminders();
        renderReminders();
      });
      actions.append(doneButton, removeButton);
      item.append(copy, actions);
      reminderList.append(item);
    });
};

reminderForm.addEventListener("submit", (event) => {
  event.preventDefault();
  reminders.push({
    id: String(Date.now()),
    title: reminderTitle.value.trim(),
    due: reminderDue.value,
    done: false,
    notified: false,
  });
  saveReminders();
  reminderForm.reset();
  renderReminders();
});

document.querySelector("#enable-notifications").addEventListener("click", async () => {
  if ("Notification" in window) await Notification.requestPermission();
});

const checkReminders = () => {
  let changed = false;
  reminders.forEach((reminder) => {
    if (!reminder.done && !reminder.notified && new Date(reminder.due).getTime() <= Date.now()) {
      reminder.notified = true;
      changed = true;
      reminderAlert.hidden = false;
      reminderAlert.textContent = `Reminder: ${reminder.title}`;
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Chand?s Magic Desk", { body: reminder.title });
      }
    }
  });
  if (changed) saveReminders();
};

renderReminders();
checkReminders();
window.setInterval(checkReminders, 30_000);

// A bookmarked page always loads the latest deployment; an open tab refreshes every hour.
window.setTimeout(() => window.location.reload(), 60 * 60 * 1000);
