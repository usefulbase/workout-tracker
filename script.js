let plans = JSON.parse(localStorage.getItem("plans")) || [];
let results = JSON.parse(localStorage.getItem("results")) || [];

window.addEventListener("DOMContentLoaded", () => {
  renderAll();
});

function savePlan() {
  const text = document.getElementById("planInput").value.trim();
  if (!text) return alert("予定を入力してください");

  const parsed = parseWorkoutText(text);

  plans.push({
    date: parsed.date,
    raw: text,
    exercises: parsed.exercises,
    createdAt: new Date().toISOString()
  });

  localStorage.setItem("plans", JSON.stringify(plans));
  renderAll();
  alert("予定を保存しました");
}

function saveResult() {
  const text = document.getElementById("resultInput").value.trim();
  if (!text) return alert("実績を入力してください");

  const parsed = parseWorkoutText(text);

  results.push({
    date: parsed.date,
    raw: text,
    exercises: parsed.exercises,
    createdAt: new Date().toISOString()
  });

  localStorage.setItem("results", JSON.stringify(results));
  renderAll();
  alert("実績を保存しました");
}

function parseWorkoutText(text) {
  const lines = text.split("\n").map(line => line.trim()).filter(Boolean);
  let date = lines[0] || "日付不明";
  date = date.replace("予定", "").trim();

  const exercises = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    const match = line.match(/^(.+?)(\d+(?:\.\d+)?)×(\d+(?:\.\d+)?)×(\d+)$/);

    if (match) {
      exercises.push({
        name: match[1].trim(),
        weight: Number(match[2]),
        reps: Number(match[3]),
        sets: Number(match[4]),
        raw: line
      });
    }
  }

  return { date, exercises };
}

function renderAll() {
  renderCompare();
  renderLastResult();
  makeChatGPTText();
}

function getLatestPlan() {
  return plans[plans.length - 1] || null;
}

function getLatestResult() {
  return results[results.length - 1] || null;
}

function getPreviousResult() {
  if (results.length < 2) return null;
  return results[results.length - 2];
}

function renderCompare() {
  const area = document.getElementById("compareArea");
  const plan = getLatestPlan();
  const result = getLatestResult();

  if (!plan || !result) {
    area.innerHTML = "<p>予定と実績を保存すると比較できます。</p>";
    return;
  }

  const rows = [];

  plan.exercises.forEach(planEx => {
    const matched = result.exercises.filter(r => r.name === planEx.name);

    if (matched.length === 0) {
      rows.push({
        name: planEx.name,
        plan: formatExercise(planEx),
        result: "なし",
        status: "未実施",
        className: "less"
      });
      return;
    }

    const planVolume = volume(planEx);
    const resultVolume = matched.reduce((sum, ex) => sum + volume(ex), 0);

    let status = "達成";
    let className = "ok";

    if (resultVolume > planVolume) {
      status = "予定以上";
      className = "more";
    } else if (resultVolume < planVolume) {
      status = "少し不足";
      className = "less";
    }

    rows.push({
      name: planEx.name,
      plan: formatExercise(planEx),
      result: matched.map(formatExercise).join(" / "),
      status,
      className
    });
  });

  const extraExercises = result.exercises.filter(resultEx => {
    return !plan.exercises.some(planEx => planEx.name === resultEx.name);
  });

  extraExercises.forEach(ex => {
    rows.push({
      name: ex.name,
      plan: "予定なし",
      result: formatExercise(ex),
      status: "追加",
      className: "more"
    });
  });

  area.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>種目</th>
          <th>予定</th>
          <th>実績</th>
          <th>判定</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(row => `
          <tr>
            <td>${row.name}</td>
            <td>${row.plan}</td>
            <td>${row.result}</td>
            <td><span class="badge ${row.className}">${row.status}</span></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderLastResult() {
  const area = document.getElementById("lastResultArea");
  const last = getLatestResult();

  if (!last) {
    area.innerHTML = "<p>まだ実績がありません。</p>";
    return;
  }

  const grouped = {};

  last.exercises.forEach(ex => {
    if (!grouped[ex.name]) grouped[ex.name] = [];
    grouped[ex.name].push(ex);
  });

  area.innerHTML = `
    <p><strong>${last.date}</strong></p>
    ${Object.keys(grouped).map(name => `
      <div class="log-item">
        <strong>${name}</strong><br>
        ${grouped[name].map(formatExercise).join(" / ")}
      </div>
    `).join("")}
  `;
}

function makeChatGPTText() {
  const textarea = document.getElementById("chatgptCopy");
  const last = getLatestResult();
  const prev = getPreviousResult();

  let text = "";

  text += "次回の筋トレメニューを相談したいです。\n\n";

  if (last) {
    text += "前回の実績は以下です。\n";
    text += last.raw + "\n\n";
  }

  if (prev) {
    text += "その前の実績は以下です。\n";
    text += prev.raw + "\n\n";
  }

  text += "無理しすぎず、前回より少しだけ伸ばすメニューを考えてください。\n";
  text += "疲労が残る場合の軽めメニューも一緒に提案してください。";

  textarea.value = text;
}

function copyForChatGPT() {
  const textarea = document.getElementById("chatgptCopy");
  textarea.select();
  document.execCommand("copy");
  alert("ChatGPT相談用の文章をコピーしました");
}

function formatExercise(ex) {
  return `${ex.weight}×${ex.reps}×${ex.sets}`;
}

function volume(ex) {
  return ex.weight * ex.reps * ex.sets;
}

function clearAllData() {
  if (!confirm("すべてのデータを削除しますか？")) return;

  localStorage.removeItem("plans");
  localStorage.removeItem("results");

  plans = [];
  results = [];

  renderAll();
  alert("削除しました");
}