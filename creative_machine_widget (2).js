// Creative Machine — iOS Native Widget v3
// Нативный стиль как системные виджеты iOS
//
// ⚙️ ВСТАВЬ СВОЙ GIST URL (без хэша ревизии!):
const GIST_URL = "https://gist.githubusercontent.com/khami-val/f9717592e4d432304943d612178e042a/raw/4326eb47cb31d5914f95166504c41467f481cac1/cm_tasks.json"

// ─────────────────────────────────────────────
async function fetchData() {
  try {
    const req = new Request(GIST_URL + "?t=" + Date.now())
    req.timeoutInterval = 6
    return await req.loadJSON()
  } catch(e) { return null }
}

function getCurrentTask(data) {
  if (!data?.weeks) return null
  const done = data.done || {}
  for (let wi = 0; wi < data.weeks.length; wi++) {
    for (let ti = 0; ti < data.weeks[wi].tasks.length; ti++) {
      if (!done[`${wi}_${ti}`]) {
        const total = data.weeks.reduce((s, w) => s + w.tasks.length, 0)
        const doneCount = Object.values(done).filter(Boolean).length
        return {
          text: data.weeks[wi].tasks[ti].text,
          day: data.weeks[wi].tasks[ti].day,
          week: data.weeks[wi].label,
          phase: data.weeks[wi].phase,
          done: doneCount,
          total: total,
          pct: Math.round((doneCount / total) * 100)
        }
      }
    }
  }
  return { allDone: true }
}

// ─────────────────────────────────────────────
// accessoryRectangular — прямоугольник под часами
// Системные шрифты iOS, без фона, нативный вид
// ─────────────────────────────────────────────
function buildLockscreen(task) {
  const w = new ListWidget()
  w.setPadding(0, 0, 0, 0)

  const root = w.addStack()
  root.layoutVertically()
  root.spacing = 0

  if (!task) {
    const t1 = root.addText("Creative Machine")
    t1.font = Font.caption1()
    t1.textOpacity = 0.5
    root.addSpacer(2)
    const t2 = root.addText("Синхронизируй план в мини-апп")
    t2.font = Font.body()
    t2.minimumScaleFactor = 0.7
    t2.lineLimit = 2
    return w
  }

  if (task.allDone) {
    const t1 = root.addText("Creative Machine")
    t1.font = Font.caption1()
    t1.textOpacity = 0.5
    root.addSpacer(2)
    const t2 = root.addText("Все задачи выполнены ✓")
    t2.font = Font.headline()
    return w
  }

  // Верхняя строка: метка + прогресс
  const top = root.addStack()
  top.layoutHorizontally()
  top.centerAlignContent()

  const label = top.addText("Creative Machine")
  label.font = Font.caption2()
  label.textOpacity = 0.45

  top.addSpacer()

  const prog = top.addText(task.done + "/" + task.total)
  prog.font = Font.caption2()
  prog.textOpacity = 0.35

  root.addSpacer(3)

  // Текст задачи — главный, самый крупный
  const taskText = root.addText(task.text)
  taskText.font = Font.headline()
  taskText.minimumScaleFactor = 0.75
  taskText.lineLimit = 2

  root.addSpacer(3)

  // Нижняя строка: день · фаза
  const bottom = root.addText(task.day + "  ·  " + task.phase)
  bottom.font = Font.caption1()
  bottom.textOpacity = 0.4
  bottom.lineLimit = 1

  return w
}

// ─────────────────────────────────────────────
// Small — домашний экран
// ─────────────────────────────────────────────
function buildSmall(task) {
  const w = new ListWidget()
  w.setPadding(16, 16, 16, 16)

  if (!task) {
    w.addSpacer()
    const t = w.addText("Открой мини-апп и синхронизируй план")
    t.font = Font.footnote()
    t.textOpacity = 0.6
    t.minimumScaleFactor = 0.7
    t.lineLimit = 3
    w.addSpacer()
    return w
  }

  if (task.allDone) {
    w.addSpacer()
    const t1 = w.addText("✓")
    t1.font = Font.systemFont(32)
    w.addSpacer(4)
    const t2 = w.addText("Все задачи\nвыполнены")
    t2.font = Font.headline()
    w.addSpacer()
    return w
  }

  const brand = w.addText("CREATIVE MACHINE")
  brand.font = Font.systemFont(9)
  brand.textOpacity = 0.4

  w.addSpacer(6)

  const pBar = w.addText(task.pct + "% выполнено")
  pBar.font = Font.caption1()
  pBar.textOpacity = 0.5

  w.addSpacer(8)

  const day = w.addText(task.day)
  day.font = Font.caption1()
  day.textOpacity = 0.5

  w.addSpacer(2)

  const taskText = w.addText(task.text)
  taskText.font = Font.headline()
  taskText.minimumScaleFactor = 0.7
  taskText.lineLimit = 4

  w.addSpacer()

  const phase = w.addText(task.phase)
  phase.font = Font.caption2()
  phase.textOpacity = 0.35
  phase.lineLimit = 1

  return w
}

// ─────────────────────────────────────────────
// accessoryInline — однострочный над часами
// ─────────────────────────────────────────────
function buildInline(task) {
  const w = new ListWidget()
  if (!task) {
    const t = w.addText("Creative Machine: синхронизируй план")
    t.font = Font.caption1()
    return w
  }
  if (task.allDone) {
    const t = w.addText("✓ Creative Machine: все задачи готовы")
    t.font = Font.caption1()
    return w
  }
  const t = w.addText(task.day + ": " + task.text)
  t.font = Font.caption1()
  t.minimumScaleFactor = 0.8
  t.lineLimit = 1
  return w
}

// ─────────────────────────────────────────────
// accessoryCircular — круглый
// ─────────────────────────────────────────────
function buildCircular(task) {
  const w = new ListWidget()
  w.setPadding(4, 4, 4, 4)

  const stack = w.addStack()
  stack.layoutVertically()
  stack.centerAlignContent()
  stack.spacing = 1

  if (!task || task.allDone) {
    stack.addSpacer()
    const icon = stack.addText(task?.allDone ? "✓" : "!")
    icon.font = Font.boldSystemFont(20)
    icon.centerAlignText()
    stack.addSpacer()
    return w
  }

  stack.addSpacer()

  const dayNum = task.day.replace(/[^0-9]/g, "")
  const num = stack.addText(dayNum)
  num.font = Font.boldSystemFont(22)
  num.centerAlignText()

  const dayLabel = stack.addText("ДЕНЬ")
  dayLabel.font = Font.systemFont(8)
  dayLabel.textOpacity = 0.45
  dayLabel.centerAlignText()

  stack.addSpacer()

  const pct = stack.addText(task.pct + "%")
  pct.font = Font.caption2()
  pct.textOpacity = 0.4
  pct.centerAlignText()

  stack.addSpacer()

  return w
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
const data = await fetchData()
const task = getCurrentTask(data)
const family = config.widgetFamily

let widget

switch(family) {
  case "accessoryRectangular":
    widget = buildLockscreen(task)
    break
  case "accessoryInline":
    widget = buildInline(task)
    break
  case "accessoryCircular":
    widget = buildCircular(task)
    break
  default:
    widget = buildSmall(task)
    break
}

if (config.runsInWidget) {
  Script.setWidget(widget)
} else {
  // Превью при запуске — меняй метод для разных форматов:
  await widget.presentSmall()
  // await widget.presentAccessoryRectangular()
}

Script.complete()
