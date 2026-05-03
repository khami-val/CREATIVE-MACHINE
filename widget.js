// Creative Machine — Lockscreen Widget
// Версия: 1.0
// Установка: вставь этот скрипт в Scriptable, добавь виджет на экран блокировки
//
// ⚙️ НАСТРОЙКА: вставь свой Gist URL ниже
const GIST_URL = "https://gist.githubusercontent.com/YOUR_USERNAME/YOUR_GIST_ID/raw/cm_tasks.json";
// Как получить URL: см. инструкцию в мини-апп → кнопка "Синхронизировать с виджетом"

const TAG_EMOJI = {
  content: "📢",
  tech: "⚙️",
  teach: "📚",
  money: "💰"
};

async function loadData() {
  try {
    const req = new Request(GIST_URL + "?t=" + Date.now());
    req.timeoutInterval = 5;
    const data = await req.loadJSON();
    return data;
  } catch(e) {
    return null;
  }
}

function findCurrentTask(data) {
  if (!data || !data.weeks) return null;
  const done = data.done || {};
  
  // Найти первую невыполненную задачу
  for (let wi = 0; wi < data.weeks.length; wi++) {
    const week = data.weeks[wi];
    for (let ti = 0; ti < week.tasks.length; ti++) {
      const key = `${wi}_${ti}`;
      if (!done[key]) {
        return {
          task: week.tasks[ti],
          weekLabel: week.label,
          weekPhase: week.phase,
          weekIndex: wi,
          taskIndex: ti,
          totalTasks: data.weeks.reduce((s, w) => s + w.tasks.length, 0),
          doneTasks: Object.values(done).filter(Boolean).length
        };
      }
    }
  }
  return null; // всё выполнено
}

// ─── LOCKSCREEN WIDGET (accessoryRectangular) ────────────────────────────────
function buildLockscreenWidget(info) {
  const w = new ListWidget();
  
  if (!info) {
    // Нет данных — показать заглушку
    const stack = w.addStack();
    stack.layoutVertically();
    const title = stack.addText("CREATIVE MACHINE");
    title.font = Font.boldMonospacedSystemFont(9);
    title.textOpacity = 0.5;
    stack.addSpacer(3);
    const msg = stack.addText("Синхронизируй план в мини-апп");
    msg.font = Font.systemFont(11);
    msg.textOpacity = 0.7;
    return w;
  }
  
  if (info === "done") {
    const stack = w.addStack();
    stack.layoutVertically();
    const title = stack.addText("CREATIVE MACHINE ✓");
    title.font = Font.boldMonospacedSystemFont(9);
    title.textOpacity = 0.6;
    stack.addSpacer(3);
    const msg = stack.addText("Все задачи выполнены!");
    msg.font = Font.systemFont(12);
    return w;
  }
  
  const stack = w.addStack();
  stack.layoutVertically();
  stack.spacing = 2;
  
  // Заголовок: бренд + прогресс
  const headerStack = stack.addStack();
  headerStack.layoutHorizontally();
  const brand = headerStack.addText("CM");
  brand.font = Font.boldMonospacedSystemFont(9);
  brand.textOpacity = 0.5;
  headerStack.addSpacer();
  const progress = headerStack.addText(`${info.doneTasks}/${info.totalTasks}`);
  progress.font = Font.monospacedSystemFont(9);
  progress.textOpacity = 0.4;
  
  stack.addSpacer(2);
  
  // День + неделя
  const metaStack = stack.addStack();
  const meta = metaStack.addText(`${info.task.day}  ·  ${info.weekLabel}`);
  meta.font = Font.mediumSystemFont(10);
  meta.textOpacity = 0.55;
  
  // Задача (главный текст)
  const taskText = stack.addText(info.task.text);
  taskText.font = Font.semiboldSystemFont(13);
  taskText.minimumScaleFactor = 0.7;
  taskText.lineLimit = 2;
  
  stack.addSpacer(2);
  
  // Тег
  const tag = stack.addText(`${TAG_EMOJI[info.task.tag] || "•"}  ${info.weekPhase}`);
  tag.font = Font.systemFont(10);
  tag.textOpacity = 0.45;
  
  return w;
}

// ─── HOME SCREEN WIDGET (small) ──────────────────────────────────────────────
function buildSmallWidget(info) {
  const w = new ListWidget();
  w.backgroundColor = new Color("#0d0d0d");
  w.setPadding(14, 14, 14, 14);
  
  if (!info || info === "done") {
    const t = w.addText(info === "done" ? "✓ Всё готово!" : "Синхронизируй план");
    t.font = Font.mediumSystemFont(14);
    t.textColor = new Color("#E8FF47");
    return w;
  }
  
  // Бренд
  const brand = w.addText("CREATIVE\nMACHINE");
  brand.font = Font.boldMonospacedSystemFont(10);
  brand.textColor = new Color("#E8FF47");
  brand.textOpacity = 0.7;
  
  w.addSpacer(8);
  
  // Прогресс-бар
  const pct = Math.round((info.doneTasks / info.totalTasks) * 100);
  const filled = Math.round(pct / 10);
  const bar = "█".repeat(filled) + "░".repeat(10 - filled);
  const barText = w.addText(bar + `  ${pct}%`);
  barText.font = Font.monospacedSystemFont(8);
  barText.textColor = new Color("#E8FF47");
  barText.textOpacity = 0.5;
  
  w.addSpacer(10);
  
  // День
  const day = w.addText(info.task.day + "  " + (TAG_EMOJI[info.task.tag] || ""));
  day.font = Font.mediumSystemFont(11);
  day.textColor = new Color("#ffffff");
  day.textOpacity = 0.5;
  
  w.addSpacer(4);
  
  // Задача
  const task = w.addText(info.task.text);
  task.font = Font.semiboldSystemFont(13);
  task.textColor = new Color("#ffffff");
  task.minimumScaleFactor = 0.75;
  task.lineLimit = 3;
  
  return w;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const data = await loadData();
const current = data ? findCurrentTask(data) : null;
const info = !data ? null : (!current ? "done" : current);

const family = config.widgetFamily;
let widget;

if (family === "accessoryRectangular" || family === "accessoryCircular" || family === "accessoryInline") {
  widget = buildLockscreenWidget(info);
} else {
  // small / medium — домашний экран
  widget = buildSmallWidget(info);
}

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  // Превью при запуске в Scriptable
  await widget.presentSmall();
}

Script.complete();
