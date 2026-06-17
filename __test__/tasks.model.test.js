// The model reads data/seed.json and keeps `tasks` as in-memory module
// state, mutated by create/update/delete. To keep tests isolated from each
// other, we reset the module registry before each test and re-require it,
// so every test starts from the same seed data (30 real tasks, see
// data/seed.json — 14 todo, 11 doing, 5 done, including 4 with a null
// dueDate, which matters for the getStats overdue calculation tested in
// the controller suite).

function loadFreshModel() {
  jest.resetModules()
  return require("../src/models/tasks.model")
}

let TaskModel

beforeEach(() => {
  TaskModel = loadFreshModel()
})

describe("findAll", () => {
  test("returns all seeded tasks when no filters given", () => {
    const result = TaskModel.findAll()
    expect(result).toHaveLength(30)
  })

  test("filters by status", () => {
    const result = TaskModel.findAll({ status: "done" })
    expect(result).toHaveLength(5)
    result.forEach((t) => expect(t.status).toBe("done"))
  })

  test("filters by assignee", () => {
    const result = TaskModel.findAll({ assignee: "alice" })
    expect(result).toHaveLength(9)
    result.forEach((t) => expect(t.assignee).toBe("alice"))
  })

  test("filters by priority using loose equality", () => {
    const result = TaskModel.findAll({ priority: "HIGH" })
    expect(result).toHaveLength(15)
  })

  test("combines multiple filters", () => {
    const result = TaskModel.findAll({ status: "todo", assignee: "alice" })
    expect(result).toHaveLength(3)
  })

  test("returns empty array when no task matches filters", () => {
    const result = TaskModel.findAll({ assignee: "nobody" })
    expect(result).toEqual([])
  })
})

describe("findById", () => {
  test("returns the task when id matches (string id is coerced)", () => {
    const result = TaskModel.findById("1")
    expect(result).toMatchObject({
      id: 1,
      title: "Configurer l'environnement de développement",
    })
  })

  test("returns the task when id is passed as a number", () => {
    const result = TaskModel.findById(2)
    expect(result).toMatchObject({ id: 2, assignee: "bob" })
  })

  test("returns undefined when no task matches", () => {
    const result = TaskModel.findById(999)
    expect(result).toBeUndefined()
  })
})

describe("create", () => {
  test("creates a task with provided fields and defaults applied", () => {
    const created = TaskModel.create({ title: "New task" })

    expect(created).toMatchObject({
      title: "New task",
      description: "",
      status: "todo",
      priority: "MEDIUM",
      assignee: null,
    })
    expect(created.id).toBe(31) // next id after the highest seeded id (30)
    expect(created.createdAt).toBeDefined()
  })

  test("creates a task using all explicitly provided fields", () => {
    const input = {
      title: "Explicit task",
      description: "desc",
      status: "doing",
      priority: "HIGH",
      assignee: "carol",
      dueDate: "2026-08-01",
    }
    const created = TaskModel.create(input)

    expect(created).toMatchObject(input)
  })

  test("increments id on each subsequent create", () => {
    const first = TaskModel.create({ title: "A" })
    const second = TaskModel.create({ title: "B" })

    expect(second.id).toBe(first.id + 1)
  })

  test("newly created task is retrievable via findById and included in findAll", () => {
    const created = TaskModel.create({ title: "Findable" })

    expect(TaskModel.findById(created.id)).toEqual(created)
    expect(TaskModel.findAll()).toHaveLength(31)
  })
})

describe("update", () => {
  test("returns null when the task does not exist", () => {
    const result = TaskModel.update(999, { title: "Nope" })
    expect(result).toBeNull()
  })

  test("merges provided fields into the existing task", () => {
    const result = TaskModel.update(1, { title: "Updated title", priority: "LOW" })

    expect(result).toMatchObject({
      id: 1,
      title: "Updated title",
      priority: "LOW",
      status: "done", // untouched field preserved from seed data
    })
  })

  test("does not allow id to be overwritten by the update payload", () => {
    const result = TaskModel.update(1, { id: 999, title: "Still id 1" })
    expect(result.id).toBe(1)
  })

  test("persists the update so a subsequent findById reflects it", () => {
    TaskModel.update(4, { status: "doing" })
    const refetched = TaskModel.findById(4)
    expect(refetched.status).toBe("doing")
  })
})

describe("delete", () => {
  test("returns null when the task does not exist", () => {
    const result = TaskModel.delete(999)
    expect(result).toBeNull()
  })

  test("removes and returns the task when it exists", () => {
    const result = TaskModel.delete(1)
    expect(result).toMatchObject({ id: 1, assignee: "alice" })
    expect(TaskModel.findById(1)).toBeUndefined()
  })

  test("reduces the total count after deletion", () => {
    TaskModel.delete(1)
    expect(TaskModel.findAll()).toHaveLength(29)
  })
})

describe("getAll", () => {
  test("returns the full task list, same as findAll with no filters", () => {
    expect(TaskModel.getAll()).toEqual(TaskModel.findAll())
  })

  test("reflects mutations made via create/update/delete", () => {
    TaskModel.create({ title: "Tracked" })
    expect(TaskModel.getAll()).toHaveLength(31)
  })
})
