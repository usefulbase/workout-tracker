let plans = [];
let workouts = [];
let currentExercises = [];

document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setTodayDate();
  setupEvents();
  renderAll();
  showStatus("アプリを読み込みました");
});

function setupEvents() {
  document.getElementById("savePlanBtn").addEventListener("click", savePlan);
  document.getElementById("addExerciseBtn").addEventListener("click", addExercise);
  document.getElementById("saveWorkoutBtn").addEventListener("click", saveWorkout);
  document.getElementById("clearAllBtn").addEventListener("click", clearAllData);

  document.getElementById("exerciseName").addEventListener("change", () => {
    const select = document.getElementById("exerciseName");
    const custom = document.getElementById("customExerciseName");

    if (select.value === "その他") {
      custom.classList.remove("hidden");
    } else {
      custom.classList.add("hidden");
      custom.value = "";
    }
  });
}

function loadData() {
  plans = JSON.parse(localStorage.getItem("workoutTrackerPlans")) || [];
  workouts = JSON.parse(localStorage.getItem("workoutTrackerWorkouts")) || [];
}

function saveData() {
  localStorage.setItem("workoutTrackerPlans", JSON.stringify(plans));
  localStorage.setItem("workoutTrackerWorkouts", JSON.stringify(workouts));
}

function setTodayDate() {
  const dateInput = document.getElementById("workoutDate");
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  dateInput.value = `${yyyy}-${mm}-${dd}`;
}

function savePlan() {
  const text = document.getElementById("planInput").value.trim();

  if (!text) {
    showStatus("予定メモが空です");
    alert("予定メモを入力してください");
    return;
  }

  plans.push({
    date: getDisplayDate(),
    raw: text,
    createdAt: new Date().toISOString()
  });

  saveData();

  document.getElementById("planInput").value = "";
  renderAll();

  showStatus(`予定メモを保存しました。予定メモ ${plans.length}件 / 実績 ${workouts.length}件`);
}

function addExercise() {
  const select = document.getElementById("exerciseName");
  const custom = document.getElementById("customExerciseName");

  const name = select.value === "その他"
    ? custom.value.trim()
    : select.value;

  const weightValue = document.getElementById("weightInput").value;
  const repsValue = document.getElementById("repsInput").value;
  const setsValue = document.getElementById("setsInput").value;

  if (!name) {
    showStatus("種目名が空です");
    alert("種目名を入力してください");
    return;
  }

  if (weightValue === "" || repsValue === "" || setsValue === "") {
    showStatus("重量・回数・セットのどれかが空です");
    alert("重量・回数・セットを入力してください");
    return;
  }

  const exercise = {
    name,
    weight: Number(weightValue),
    reps: Number(repsValue),
    sets: Number(setsValue)
  };

  currentExercises.push(exercise);

  clearExerciseInputs();
  renderCurrentWorkout();

  showStatus(`${name} ${formatExercise(exercise)} を追加しました`);
}

function clearExerciseInputs() {
  document.getElementById("weightInput").value = "";
  document.getElementById("repsInput").value = "";
  document.getElementById("setsInput").value = "";
}

function saveWorkout() {
  if (currentExercises.length === 0) {
    showStatus("保存する実績がありません");
    alert("先に「実績に追加」を押してください");
    return;
  }

  const workout = {
    date: getDisplayDate(),
    exercises: [...currentExercises],
    createdAt: new Date().toISOString()
  };

  workouts.push(workout);
  saveData();

  currentExercises = [];
  renderAll();

  showStatus(`実績を保存しました。保存済み実績 ${workouts.length}件`);
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
    <div class="date-title">最新の予定メモ：${escapeHtml(latest.date)}</div>
    <div class="memo-box">${escapeHtml(latest.raw)}</div>
  `;
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
        <span>${escapeHtml(ex.name)} ${formatExercise(ex)}</span>
        <button class="small-btn delete-btn" data-index="${index}">削除</button>
      </div>
    `).join("")}
  `;

  area.querySelectorAll(".delete-btn").forEach(button => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      currentExercises.splice(index, 1);
      renderCurrentWorkout();
      showStatus("入力中の実績を削除しました");
    });
  });
}

function renderLastWorkout() {
  const area = document.getElementById("lastWorkoutArea");

  if (workouts.length === 0) {
    area.innerHTML = `<p class="empty">まだ実績がありません。</p>`;
    return;
  }

  const last = workouts[workouts.length - 1];

  area.innerHTML = `
    <div class="date-title">${escapeHtml(last.date)}</div>
    ${last.exercises.map(ex => `
      <div class="workout-line">
        <span>${escapeHtml(ex.name)} ${formatExercise(ex)}</span>
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

  area.innerHTML = reversed.map((workout, reversedIndex) => {
    const originalIndex = workouts.length - 1 - reversedIndex;

    return `
      <div class="history-item">
        <div class="history-header" data-body="historyBody${reversedIndex}">
          ${escapeHtml(workout.date)}
        </div>
        <div class="history-body" id="historyBody${reversedIndex}">
          ${workout.exercises.map(ex => `
            <div class="workout-line">
              <span>${escapeHtml(ex.name)} ${formatExercise(ex)}</span>
            </div>
          `).join("")}
          <button class="delete-btn history-delete-btn" data-index="${originalIndex}">
            この日の実績を削除
          </button>
        </div>
      </div>
    `;
  }).join("");

  area.querySelectorAll(".history-header").forEach(header => {
    header.addEventListener("click", () => {
      const bodyId = header.dataset.body;
      document.getElementById(bodyId).classList.toggle("open");
    });
  });

  area.querySelectorAll(".history-delete-btn").forEach(button => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      deleteWorkout(index);
    });
  });
}

function deleteWorkout(index) {
  if (!confirm("この日の実績を削除しますか？")) return;

  workouts.splice(index, 1);
  saveData();
  renderAll();

  showStatus(`実績を削除しました。保存済み実績 ${workouts.length}件`);
}

function clearAllData() {
  if (!confirm("すべてのデータを削除しますか？")) return;

  plans = [];
  workouts = [];
  currentExercises = [];

  localStorage.removeItem("workoutTrackerPlans");
  localStorage.removeItem("workoutTrackerWorkouts");

  renderAll();

  showStatus("すべてのデータを削除しました");
}

function formatExercise(ex) {
  return `${ex.weight}×${ex.reps}×${ex.sets}`;
}

function showStatus(message) {
  const area = document.getElementById("statusArea");
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  area.textContent = `${message}（${hh}:${mm}）`;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}