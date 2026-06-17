const TaskModel = require("../src/models/tasks.model")
const tasksController = require("../src/controllers/tasks.controller")

jest.mock("../src/models/tasks.model")

// Because there is no services, it was all implemented in the controller 
// Given by the AI Claude Code to help with the expect of the res values
function mockRes() {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe("getTasks", () => {
  it("return all tasks and with no query params", () => {
    const tasks = [{ id: "1", title: "A" }]
    TaskModel.findAll.mockReturnValue(tasks)

    const req = { query: {} }
    const res = mockRes()

    tasksController.getTasks(req, res)

    expect(TaskModel.findAll).toHaveBeenCalledWith({
      status: undefined,
      assignee: undefined,
      priority: undefined,
    })
    expect(res.json).toHaveBeenCalledWith({ success: true, data: tasks })
    expect(res.status).not.toHaveBeenCalled()
  })

  it("return a empty list when no tasks match the query", () => {
    TaskModel.findAll.mockReturnValue([])
    const req = { query: { status: "doing", assignee: "alice", priority: "high" } }
    const res = mockRes()

    tasksController.getTasks(req, res)

    expect(TaskModel.findAll).toHaveBeenCalledWith({
      status: "doing",
      assignee: "alice",
      priority: "high",
    })
    expect(res.json).toHaveBeenCalledWith({ success: true, data: []})
  })
})

describe("getTaskById", () => {
  it("returns error 404 when task does not exist", () => {
    TaskModel.findById.mockReturnValue(null)
    const req = { params: { id: "missing" } }
    const res = mockRes()

    tasksController.getTaskById(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Task not found",
    })
  })

  it("return task when it exists and match the id", () => {
    const task = { id: "1", title: "A" }
    TaskModel.findById.mockReturnValue(task)
    const req = { params: { id: "1" } }
    const res = mockRes()

    tasksController.getTaskById(req, res)

    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith({ success: true, data: task })
  })
})

describe("createTask", () => {
  
  it("returns error 400 when title is missing", () => {
    const req = { body: { description: "no title here" } }
    const res = mockRes()

    tasksController.createTask(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Title is required",
    })
    expect(TaskModel.create).not.toHaveBeenCalled()
  })

  it("returns 400 when status is not valid", () => {
    const req = { body: { title: "Task", status: "blocked" } }
    const res = mockRes()

    tasksController.createTask(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Status must be one of: todo, doing, done",
    })
    expect(TaskModel.create).not.toHaveBeenCalled()
  })

  it("returns 400 when priority is not valid", () => {
    const req = { body: { title: "Task", priority: "urgent" } }
    const res = mockRes()

    tasksController.createTask(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Priority must be one of: LOW, MEDIUM, HIGH",
    })
    expect(TaskModel.create).not.toHaveBeenCalled()
  })

  it("create a task when input is valid", () => {
    const body = {
      title: "Task",
      description: "A task with a lot of work to do !!",
      status: "todo",
      priority: "medium",
      assignee: "bob",
      dueDate: "2026-07-01",
    }
    const created = { id: "1", ...body }
    TaskModel.create.mockReturnValue(created)
    const req = { body }
    const res = mockRes()

    tasksController.createTask(req, res)

    expect(TaskModel.create).toHaveBeenCalledWith(body)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ success: true, data: created })
  })

  it("create a task when there is no status provided", () => {
    const body = { title: "Task with no status" }
    TaskModel.create.mockReturnValue({ id: "1", ...body })
    const req = { body }
    const res = mockRes()

    tasksController.createTask(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
  })
})

describe("updateTask", () => {
  it("return error 404 when task does not exist", () => {
    TaskModel.findById.mockReturnValue(null)
    const req = { params: { id: "missing" }, body: { title: "x" } }
    const res = mockRes()

    tasksController.updateTask(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(TaskModel.update).not.toHaveBeenCalled()
  })

  it("update and return the task when it exists", () => {
    const existing = { id: "1", title: "Old" }
    const updated = { id: "1", title: "New" }
    TaskModel.findById.mockReturnValue(existing)
    TaskModel.update.mockReturnValue(updated)

    const req = { params: { id: "1" }, body: { title: "New" } }
    const res = mockRes()

    tasksController.updateTask(req, res)

    expect(TaskModel.update).toHaveBeenCalledWith("1", { title: "New" })
    expect(res.json).toHaveBeenCalledWith({ success: true, data: updated })
  })

  it("return error 400 when status is not valid", () => {
    const existing = { id: "1", title: "Old", status: "todo" }
    TaskModel.findById.mockReturnValue(existing)
    TaskModel.update.mockReturnValue({ ...existing, status: "not-a-real-status" })

    const req = { params: { id: "1" }, body: { status: "not-a-real-status" } }
    const res = mockRes()

    tasksController.updateTask(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it("return error 400 when priority is not valid", () => {
    const existing = { id: "1", title: "Old", priority: "MEDIUM" }
    TaskModel.findById.mockReturnValue(existing)
    TaskModel.update.mockReturnValue({ ...existing, priority: "not-a-real-priority" })

    const req = { params: { id: "1" }, body: { priority: "not-a-real-priority" } }
    const res = mockRes()

    tasksController.updateTask(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
  })
})

describe("deleteTask", () => {
  it("return error 404 when nothing was deleted", () => {
    TaskModel.delete.mockReturnValue(null)
    const req = { params: { id: "missing" } }
    const res = mockRes()

    tasksController.deleteTask(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Task not found",
    })
  })

  it("returns the deleted task on success", () => {
    const deleted = { id: "1", title: "Gone" }
    TaskModel.delete.mockReturnValue(deleted)
    const req = { params: { id: "1" } }
    const res = mockRes()

    tasksController.deleteTask(req, res)

    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith({ success: true, data: deleted })
  })
})

describe("moveTask", () => {
  it("return error 404 when task does not exist", () => {
    TaskModel.findById.mockReturnValue(null)
    const req = { params: { id: "missing" }, body: { status: "doing" } }
    const res = mockRes()

    tasksController.moveTask(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(TaskModel.update).not.toHaveBeenCalled()
  })

  it("return error 400 when status is missing from the body", () => {
    TaskModel.findById.mockReturnValue({ id: "1" })
    const req = { params: { id: "1" }, body: {} }
    const res = mockRes()

    tasksController.moveTask(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "New status is required",
    })
    expect(TaskModel.update).not.toHaveBeenCalled()
  })

  it("moves the task to the new status when valid", () => {
    const existing = { id: "1", status: "todo" }
    const moved = { id: "1", status: "doing" }
    TaskModel.findById.mockReturnValue(existing)
    TaskModel.update.mockReturnValue(moved)

    const req = { params: { id: "1" }, body: { status: "doing" } }
    const res = mockRes()

    tasksController.moveTask(req, res)

    expect(TaskModel.update).toHaveBeenCalledWith("1", { status: "doing" })
    expect(res.json).toHaveBeenCalledWith({ success: true, data: moved })
  })

  it("return error 400 when status is not valid", () => {
    TaskModel.findById.mockReturnValue({ id: "1", status: "todo" })
    TaskModel.update.mockReturnValue({ id: "1", status: "banana" })

    const req = { params: { id: "1" }, body: { status: "banana" } }
    const res = mockRes()

    tasksController.moveTask(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
  })
})

describe("getStats", () => {
  it("returns totals, byStatus, byPriority, and overdue count", () => {
    const now = new Date("2026-06-17T00:00:00Z")
    jest.useFakeTimers().setSystemTime(now)

    TaskModel.findAll.mockReturnValue([
      { status: "todo", priority: "high", dueDate: "2026-07-01" },
      { status: "todo", priority: "low", dueDate: "2026-07-01" },
      { status: "done", priority: "high", dueDate: "2026-01-01" },
    ])

    const req = {}
    const res = mockRes()

    tasksController.getStats(req, res)

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        total: 3,
        byStatus: { todo: 2, done: 1 },
        byPriority: { high: 2, low: 1 },
        overdue: 1,
      },
    })
  })

  it("does not count tasks with missing dueDate as overdue", () => {
    TaskModel.findAll.mockReturnValue([
      { status: "todo", priority: "high", dueDate: undefined },
    ])

    const req = {}
    const res = mockRes()

    tasksController.getStats(req, res)

    const payload = res.json.mock.calls[0][0]
    expect(payload.data.overdue).toBe(0)
  })

  it("does not count tasks with dueDate: null as overdue", () => {
    TaskModel.findAll.mockReturnValue([
      { status: "todo", priority: "high", dueDate: null },
    ])

    const req = {}
    const res = mockRes()

    tasksController.getStats(req, res)

    const payload = res.json.mock.calls[0][0]
    expect(payload.data.overdue).toBe(0)
  })
})
