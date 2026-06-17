function loadFreshModel() {
  jest.resetModules()
  return require("../src/models/tasks.model")
}

let TaskModel

beforeEach(() => {
  TaskModel = loadFreshModel()
})

describe("findAll", () => {
  test("return all tasks with no filter", () => {
    const result = TaskModel.findAll()
    expect(result).toHaveLength(30)
  })

  test("filter by status", () => {
    const result = TaskModel.findAll({ status: "done" })
    expect(result).toHaveLength(5)
    result.forEach((t) => expect(t.status).toBe("done"))
  })

  test("filter by assignee", () => {
    const result = TaskModel.findAll({ assignee: "alice" })
    expect(result).toHaveLength(9)
    result.forEach((t) => expect(t.assignee).toBe("alice"))
  })

  test("filter by priority", () => {
    const result = TaskModel.findAll({ priority: "HIGH" })
    expect(result).toHaveLength(15)
  })

  test("filter with multiple filter", () => {
    const result = TaskModel.findAll({ status: "todo", assignee: "alice" })
    expect(result).toHaveLength(3)
  })

  test("return empty array when no matching tasks to filters", () => {
    const result = TaskModel.findAll({ assignee: "nobody" })
    expect(result).toEqual([])
  })
})

describe("findById", () => {
  test("return the task by id as string", () => {
    const result = TaskModel.findById("1")
    expect(result).toMatchObject({
      id: 1,
      title: "Configurer l'environnement de développement",
    })
  })

  test("return the task by id as number", () => {
    const result = TaskModel.findById(2)
    expect(result).toMatchObject({ id: 2, assignee: "bob" })
  })

  test("return undefined with no matching task", () => {
    const result = TaskModel.findById(999)
    expect(result).toBeUndefined()
  })
})

describe("create", () => {
  test("create task with default values", () => {
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

  test("create task with all field provided", () => {
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
})

describe("update", () => {
  test("returns null when task don't exist", () => {
    const result = TaskModel.update(999, { title: "Nope" })
    expect(result).toBeNull()
  })

  test("update task", () => {
    const result = TaskModel.update(1, { title: "Updated title", priority: "LOW" })

    expect(result).toMatchObject({
      id: 1,
      title: "Updated title",
      priority: "LOW",
      status: "done", // untouched field preserved from seed data
    })
  })

  test("cannot update id", () => {
    const result = TaskModel.update(1, { id: 999, title: "Still id 1" })
    expect(result.id).toBe(1)
  })

  test("update status", () => {
    TaskModel.update(4, { status: "doing" })
    const refetched = TaskModel.findById(4)
    expect(refetched.status).toBe("doing")
  })
})

describe("delete", () => {
  test("return null when task don't exist", () => {
    const result = TaskModel.delete(999)
    expect(result).toBeNull()
  })

  test("delete task", () => {
    const result = TaskModel.delete(1)
    expect(result).toMatchObject({ id: 1, assignee: "alice" })
    expect(TaskModel.findById(1)).toBeUndefined()
  })
})
