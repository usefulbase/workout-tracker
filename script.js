let workouts = [];
let currentExercises = [];

document.addEventListener("DOMContentLoaded", function () {
  workouts = JSON.parse(localStorage.getItem("workoutTrackerWorkouts")) || [];

  const statusArea = document.getElementById("statusArea");
  statusArea.textContent = "アプリを読み込みました";

  setTodayDate();
  setupButtons();
  renderAll();
});

function setupButtons() {
  document.getElementById("addExerciseBtn").onclick = addExercise;
  document.getElementById("saveWorkoutBtn").onclick = saveWorkout;
  document.getElementById("clearAllBtn").onclick = clearAllData;
  document.getElementById("savePlanBtn").onclick = savePlan;
}

function setTodayDate() {
  const dateInput = document.getElementById("workoutDate");
  const today = new Date();
  dateInput.value = today.toISOString().slice(0, 10);
}

function savePlan() {
  const text = document.getElementById("planInput").value.trim();
  const area = document.getElementById("todayPlanArea");

  if (!text) {
    alert("予定メモを入力してください");
    return;
  }

  localStorage.setItem("workoutTrackerPlan", text);

  area.innerHTML = `
    <div class="date-title">最新の予定メモ</div>
    <div class="memo-box">${text.replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</div>
  `;

  document.getElementById("planInput").value = "";
  showStatus("予定メモを保存しました");
}

function addExercise() {
  const nameSelect = document.getElementById("exerciseName");
  let name = nameSelect.value;

  if (name === "その他") {
    name = document.getElementById("customExerciseName").value.trim();
  }

  const weight = document.getElementById("weightInput").value;
  const reps = document.getElementById("repsInput").value;
  const sets = document.getElementById("setsInput").value;

  if (!name || !weight || !reps || !sets) {
    alert("種目・重量・回数・セットを入力してください");
    return;
  }

  currentExercises.push({
    name: name,
    weight: weight,
    reps: reps,
    sets: sets
  });

  document.getElementById("weightInput").value = "";
  document.getElementById("repsInput").value = "";
  document.getElementById("setsInput").value = "";

  renderCurrentWorkout();
  showStatus("実績に追加しました");
}

function saveWorkout() {
  if (currentExercises.length === 0) {
    alert("先に実績を追加してください");
    return;
  }

  const dateValue = document.getElementById("workoutDate").value;
  const date = formatDate(dateValue);

  workouts.push({
    date: date,
    exercises: currentExercises
  });

  localStorage.setItem("workoutTrackerWorkouts", JSON.stringify(workouts));

  currentExercises = [];

  renderAll();
  showStatus("実績を保存しました");
}

function renderAll() {
  renderPlan();
  renderCurrentWorkout();
  renderLastWorkout();
  renderHistory();
}

function renderPlan() {
  const text = localStorage.getItem("workoutTrackerPlan");
  const area = document.getElementById("todayPlanArea");

  if (!text) {
    area.innerHTML = `<p class="empty">まだ予定メモはありません。</p>`;
    return;
  }

  area.innerHTML = `
    <div class="date-title">最新の予定メモ</div>
    <div class="memo-box">${text.replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</div>
  `;
}

function renderCurrentWorkout() {
  const area = document.getElementById("currentWorkoutArea");

  if (currentExercises.length === 0) {
    area.innerHTML = `<p class="empty">まだ実績が追加されていません。</p>`;
    return;
  }

  area.innerHTML = currentExercises.map(function (ex, index) {
    return `
      <div class="workout-line">
        <span>${ex.name} ${ex.weight}×${ex.reps}×${ex.sets}</span>
        <button class="small-btn delete-btn" onclick="removeCurrentExercise(${index})">削除</button>
      </div>
    `;
  }).join("");
}

function removeCurrentExercise(index) {
  currentExercises.splice(index, 1);
  renderCurrentWorkout();
  showStatus("入力中の実績を削除しました");
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
    ${last.exercises.map(function (ex) {
      return `<div class="workout-line"><span>${ex.name} ${ex.weight}×${ex.reps}×${ex.sets}</span></div>`;
    }).join("")}
  `;
}

function renderHistory() {
  const area = document.getElementById("historyArea");

  if (workouts.length === 0) {
    area.innerHTML = `<p class="empty">まだ履歴がありません。</p>`;
    return;
  }

  const reversed = workouts.slice().reverse();

  area.innerHTML = reversed.map(function (workout, index) {
    const originalIndex = workouts.length - 1 - index;

    return `
      <div class="history-item">
        <div class="history-header" onclick="toggleHistory(${index})">
          ${workout.date}
        </div>
        <div class="history-body" id="historyBody${index}">
          ${workout.exercises.map(function (ex) {
            return `<div class="workout-line"><span>${ex.name} ${ex.weight}×${ex.reps}×${ex.sets}</span></div>`;
          }).join("")}
          <button class="delete-btn" onclick="deleteWorkout(${originalIndex})">この日の実績を削除</button>
        </div>
      </div>
    `;
  }).join("");
}

function toggleHistory(index) {
  const body = document.getElementById("historyBody" + index);
  body.classList.toggle("open");
}

function deleteWorkout(index) {
  if (!confirm("この日の実績を削除しますか？")) return;

  workouts.splice(index, 1);
  localStorage.setItem("workoutTrackerWorkouts", JSON.stringify(workouts));
  renderAll();
  showStatus("実績を削除しました");
}

function clearAllData() {
  if (!confirm("すべて削除しますか？")) return;

  workouts = [];
  currentExercises = [];
  localStorage.removeItem("workoutTrackerWorkouts");
  localStorage.removeItem("workoutTrackerPlan");

  renderAll();
  showStatus("すべて削除しました");
}

function formatDate(value) {
  if (!value) return "日付不明";

  const parts = value.split("-");
  return Number(parts[1]) + "/" + Number(parts[2]);
}

function showStatus(text) {
  const statusArea = document.getElementById("statusArea");
  statusArea.textContent = text;
}