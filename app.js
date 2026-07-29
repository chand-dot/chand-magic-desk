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
