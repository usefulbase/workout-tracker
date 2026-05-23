let plans = JSON.parse(localStorage.getItem("plans")) || [];
let workouts = JSON.parse(localStorage.getItem("workouts")) || [];
let currentExercises = [];

window.addEventListener("DOMContentLoaded", () => {
  setTodayDate();
  setupExerciseSelect();
  renderAll();
});

function setTodayDate() {
  const dateInput = document.getElementById("workoutDate");
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  dateInput.value = `${yyyy}-${mm}-${dd}`;
}

function setupExerciseSelect() {
  const select = document.getElementById("exerciseName");
  const custom = document.getElementById("customExerciseName");

  select.addEventListener("change", () => {
    if (select.value === "その他") {
      custom.classList.remove("hidden");
    } else {
      custom.classList.add("hidden");
      custom.value = "";
    }
  });
}

function savePlan() {
  const text = document.getElementById("planInput").value.trim();

  if (!text) {
    alert("予定メモを入力してください");
    return;
  }

  plans.push({
    date: getDisplayDate(),
    raw: text,
    createdAt: new Date().toISOString()
  });

  localStorage.setItem("plans", JSON.stringify(plans));
  document.getElementById("planInput").value = "";
  renderTodayPlan();

  alert("予定メモを保存しました");
}

function addExercise() {
  const select = document.getElementById("exerciseName");
  const custom = document.getElementById("customExerciseName");

  const name = select.value === "その他"
    ? custom.value.trim()
    : select.value;

  const weight = document.getElementById("weightInput").value;
  const reps = document.getElementById("repsInput").value;
  const sets = document.getElementById("setsInput").value;

  if (!name) {
    alert("種目名を入力してください");
    return;
  }

  if (weight === "" || reps === "" || sets === "") {
    alert("重量・回数・セットを入力してください");
    return;
  }

  currentExercises.push({
    name,
    weight: Number(weight),
    reps: Number(reps),
    sets: Number(sets)
  });

  clearExerciseInputs();
  renderCurrentWorkout();
}

function clearExerciseInputs() {
  document.getElementById("weightInput").value = "";
  document.getElementById("repsInput").value = "";
  document.getElementById("setsInput").value = "";
}

function renderCurrentWorkout() {
  const area = document.getElementById("currentWorkoutArea");

  if (currentExercises.length === 0) {
    area.innerHTML = `<p class="empty">まだ実績が追加されていません。</p>`;
    return;
  }

  area.innerHTML = `
    <div class="date-title">入力中の実績</div>
    ${currentExercises.map((ex, index) => `
      <div class="workout-line">
        <span>${ex.name} ${formatExercise(ex)}</span>
        <button class="small-btn delete-btn" onclick="removeCurrentExercise(${index})">削除</button>
      </div>
    `).join("")}
  `;
}

function removeCurrentExercise(index) {
  currentExercises.splice(index, 1);
  renderCurrentWorkout();
}

function saveWorkout() {
  if (currentExercises.length === 0) {
    alert("実績を追加してください");
    return;
  }

  const date = getDisplayDate();

  workouts.push({
    date,
    exercises: currentExercises,
    createdAt: new Date().toISOString()
  });

  localStorage.setItem("workouts", JSON.stringify(workouts));

  currentExercises = [];
  renderAll();

  alert("実績を保存しました");
}

function getDisplayDate() {
  const value = document.getElementById("workoutDate").value;

  if (!value) return "日付不明";

  const [yyyy, mm, dd] = value.split("-");
  return `${Number(mm)}/${Number(dd)}`;
}

function renderAll() {
  renderTodayPlan();
  renderCurrentWorkout();
  renderLastWorkout();
  renderHistory();
}

function renderTodayPlan() {
  const area = document.getElementById("todayPlanArea");

  if (plans.length === 0) {
    area.innerHTML = `<p class="empty">まだ予定メモはありません。</p>`;
    return;
  }

  const latest = plans[plans.length - 1];

  area.innerHTML = `
    <div class="date-title">最新の予定メモ</div>
    <div class="memo-box">${escapeHtml(latest.raw)}</div>
  `;
}

function renderLastWorkout() {
  const area = document.getElementById("lastWorkoutArea");

  if (workouts.length === 0) {
    area.innerHTML = `<p class="empty">まだ実績がありません。</p>`;
    return;
  }

  const last = workouts[workouts.length - 1];

  area.innerHTML = `
    <div class="date-title">${last.date}</div>
    ${last.exercises.map(ex => `
      <div class="workout-line">
        <span>${ex.name} ${formatExercise(ex)}</span>
      </div>
    `).join("")}
  `;
}

function renderHistory() {
  const area = document.getElementById("historyArea");

  if (workouts.length === 0) {
    area.innerHTML = `<p class="empty">まだ履歴がありません。</p>`;
    return;
  }

  const reversed = [...workouts].reverse();

  area.innerHTML = reversed.map((workout, index) => {
    const originalIndex = workouts.length - 1 - index;

    return `
      <div class="history-item">
        <div class="history-header" onclick="toggleHistory(${index})">
          ${workout.date}
        </div>
        <div class="history-body" id="historyBody${index}">
          ${workout.exercises.map(ex => `
            <div class="workout-line">
              <span>${ex.name} ${formatExercise(ex)}</span>
            </div>
          `).join("")}
          <button class="delete-btn" onclick="deleteWorkout(${originalIndex})">この日の実績を削除</button>
        </div>
      </div>
    `;
  }).join("");
}

function toggleHistory(index) {
  const body = document.getElementById(`historyBody${index}`);
  body.classList.toggle("open");
}

function deleteWorkout(index) {
  if (!confirm("この日の実績を削除しますか？")) return;

  workouts.splice(index, 1);
  localStorage.setItem("workouts", JSON.stringify(workouts));
  renderAll();
}

function clearAllData() {
  if (!confirm("すべてのデータを削除しますか？")) return;

  plans = [];
  workouts = [];
  currentExercises = [];

  localStorage.removeItem("plans");
  localStorage.removeItem("workouts");

  renderAll();

  alert("すべて削除しました");
}

function formatExercise(ex) {
  return `${ex.weight}×${ex.reps}×${ex.sets}`;
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}