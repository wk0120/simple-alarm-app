(() => {
  const STORAGE_KEY = "simple-alarm:alarms";

  const clockEl = document.getElementById("clock");
  const dateEl = document.getElementById("date");
  const formEl = document.getElementById("alarmForm");
  const timeInput = document.getElementById("alarmTime");
  const labelInput = document.getElementById("alarmLabel");
  const listEl = document.getElementById("alarmList");
  const modalEl = document.getElementById("ringModal");
  const ringTimeEl = document.getElementById("ringTime");
  const ringLabelEl = document.getElementById("ringLabel");
  const stopBtn = document.getElementById("stopBtn");

  let alarms = loadAlarms();
  let lastTickKey = "";
  let audioCtx = null;
  let beepTimer = null;

  function loadAlarms() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveAlarms() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
  }

  function makeId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function pad2(n) {
    return n.toString().padStart(2, "0");
  }

  function formatClock(d) {
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  }

  const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  function formatDate(d) {
    return `${WEEKDAYS[d.getDay()]} · ${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`;
  }

  function tickKey(d) {
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }

  function render() {
    listEl.innerHTML = "";

    if (alarms.length === 0) {
      const empty = document.createElement("li");
      empty.className = "alarm-list__empty";
      empty.textContent = "まだアラームがないよ";
      listEl.appendChild(empty);
      return;
    }

    const sorted = [...alarms].sort((a, b) => a.time.localeCompare(b.time));

    for (const alarm of sorted) {
      const li = document.createElement("li");
      li.className = "alarm-item" + (alarm.enabled ? "" : " alarm-item--off");

      const main = document.createElement("div");
      main.className = "alarm-item__main";

      const time = document.createElement("span");
      time.className = "alarm-item__time";
      time.textContent = alarm.time;
      main.appendChild(time);

      if (alarm.label) {
        const label = document.createElement("span");
        label.className = "alarm-item__label";
        label.textContent = alarm.label;
        main.appendChild(label);
      }

      const actions = document.createElement("div");
      actions.className = "alarm-item__actions";

      const toggleLabel = document.createElement("label");
      toggleLabel.className = "switch";
      const toggle = document.createElement("input");
      toggle.type = "checkbox";
      toggle.checked = alarm.enabled;
      toggle.addEventListener("change", () => {
        alarm.enabled = toggle.checked;
        saveAlarms();
        render();
      });
      const slider = document.createElement("span");
      slider.className = "switch__slider";
      toggleLabel.appendChild(toggle);
      toggleLabel.appendChild(slider);

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn btn--ghost";
      delBtn.textContent = "削除";
      delBtn.addEventListener("click", () => {
        alarms = alarms.filter((a) => a.id !== alarm.id);
        saveAlarms();
        render();
      });

      actions.appendChild(toggleLabel);
      actions.appendChild(delBtn);

      li.appendChild(main);
      li.appendChild(actions);
      listEl.appendChild(li);
    }
  }

  function startBeep() {
    try {
      if (!audioCtx) {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        audioCtx = new Ctor();
      }
      if (audioCtx.state === "suspended") audioCtx.resume();
    } catch {
      audioCtx = null;
    }

    function beepOnce() {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.45);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    }

    beepOnce();
    beepTimer = setInterval(beepOnce, 800);
  }

  function stopBeep() {
    if (beepTimer) {
      clearInterval(beepTimer);
      beepTimer = null;
    }
  }

  function ring(alarm) {
    ringTimeEl.textContent = alarm.time;
    ringLabelEl.textContent = alarm.label || "";
    modalEl.hidden = false;
    startBeep();
  }

  stopBtn.addEventListener("click", () => {
    modalEl.hidden = true;
    stopBeep();
  });

  function tick() {
    const now = new Date();
    clockEl.textContent = formatClock(now);
    if (dateEl) dateEl.textContent = formatDate(now);

    const key = tickKey(now);
    if (key !== lastTickKey && now.getSeconds() === 0) {
      lastTickKey = key;
      const due = alarms.find((a) => a.enabled && a.time === key);
      if (due) ring(due);
    } else if (now.getSeconds() !== 0 && key !== lastTickKey) {
      lastTickKey = "";
    }
  }

  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const time = timeInput.value;
    if (!time) return;
    const label = labelInput.value.trim();

    alarms.push({
      id: makeId(),
      time,
      label,
      enabled: true,
    });
    saveAlarms();
    render();

    timeInput.value = "";
    labelInput.value = "";
  });

  render();
  tick();
  setInterval(tick, 1000);
})();
