const filters = document.querySelectorAll("[data-filter]");
const cards = document.querySelectorAll("[data-task]");
const doneKey = "chand-done";
const meetingsKey = "chand-hidden-meetings";

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
  localStorage.removeItem(meetingsKey);
  document.querySelectorAll("[data-meeting]").forEach((meeting) => meeting.hidden = false);
  refreshTasks();
});

let hiddenMeetings = JSON.parse(localStorage.getItem(meetingsKey) || "[]");
document.querySelectorAll("[data-meeting]").forEach((meeting) => {
  meeting.hidden = hiddenMeetings.includes(meeting.dataset.meeting);
});

document.querySelectorAll("[data-clear-meeting]").forEach((button) => {
  button.addEventListener("click", () => {
    hiddenMeetings = [...new Set([...hiddenMeetings, button.dataset.clearMeeting])];
    localStorage.setItem(meetingsKey, JSON.stringify(hiddenMeetings));
    button.closest("[data-meeting]").hidden = true;
  });
});

const historyButton = document.querySelector("#history-toggle");
historyButton.addEventListener("click", () => {
  const expanded = historyButton.dataset.expanded === "true";
  document.querySelectorAll(".meeting-card.extra").forEach((meeting) => {
    meeting.classList.toggle("shown", !expanded);
  });
  historyButton.dataset.expanded = String(!expanded);
  historyButton.textContent = expanded ? "Show all meetings" : "Show highlights only";
});

refreshTasks();
