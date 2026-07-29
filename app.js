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
  weekendBrief.hidden = !(ready && inWindow && weekendBrief.dataset.briefDate === date);
};

refreshWeekendBriefWindow();
window.setInterval(refreshWeekendBriefWindow, 60_000);
