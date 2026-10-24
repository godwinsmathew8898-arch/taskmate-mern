import { useEffect, useState } from "react";

import { getTasks, createTask, updateTask, deleteTask } from "./api/taskApi";

function App() {
  const [tasks, setTasks] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [filter, setFilter] = useState("all");
  const [busyTaskId, setBusyTaskId] = useState(null);
  const [theme, setTheme] = useState("light");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setEditingId(null);
  };

  // Load tasks from backend
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setError("");
        const data = await getTasks();
        setTasks(data.tasks);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving || busyTaskId) return;

    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const taskData = {
        title,
        description,
        priority,
      };

      if (editingId) {
        // UPDATE EXISTING TASK
        const data = await updateTask(editingId, taskData);

        setTasks((previousTasks) =>
          previousTasks.map((task) =>
            task._id === editingId ? data.task : task,
          ),
        );
      } else {
        // CREATE NEW TASK
        const data = await createTask(taskData);

        setTasks((previousTasks) => [data.task, ...previousTasks]);
      }

      // Clear form after success
      resetForm();
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleComplete = async (task) => {
    if (busyTaskId || saving) return;

    try {
      setBusyTaskId(task._id);
      setError("");

      const data = await updateTask(task._id, {
        completed: !task.completed,
      });

      setTasks((previousTasks) =>
        previousTasks.map((item) => (item._id === task._id ? data.task : item)),
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setBusyTaskId(null);
    }
  };

  const handleEdit = (task) => {
    if (saving || busyTaskId) return;
    setEditingId(task._id);

    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    if (busyTaskId || saving) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setBusyTaskId(id);
      setError("");

      await deleteTask(id);

      setTasks((previousTasks) =>
        previousTasks.filter((task) => task._id !== id),
      );

      // Clear the form if the deleted task was being edited
      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setBusyTaskId(null);
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true;
  });

  const toggleTheme = () => {
    setTheme((previousTheme) => previousTheme === "light" ? "dark" : "light");
  };

  return (
    <div data-theme={theme} className="min-h-screen bg-base-200 text-base-content p-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary">TaskMate</h1>

          <p className="mt-2 opacity-70">Organize your tasks efficiently.</p>
          <button type="button" className="btn btn-outline mt-4" onClick={toggleTheme}>
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </header>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="text-sm opacity-70">Total Tasks</h2>
              <p className="text-3xl font-bold">{totalTasks}</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="text-sm opacity-70">Completed</h2>
              <p className="text-3xl font-bold text-success">{completedTasks}</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="text-sm opacity-70">Pending</h2>
              <p className="text-3xl font-bold text-warning">{pendingTasks}</p>
            </div>
          </div>
        </section>

        {/* Add Task Form */}
        <div className="card mb-6 bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">{editingId ? "Edit Task" : "Add New Task"}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Task title"
                className="input w-full"
                disabled={saving}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={100}
                required
              />

              <textarea
                placeholder="Task description"
                className="textarea w-full"
                disabled={saving}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />

              <select
                className="select w-full"
                disabled={saving}
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
              >
                <option value="low">Low priority</option>
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
              </select>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={saving || Boolean(busyTaskId)}
              >
                {saving ? "Saving..." : editingId ? "Update Task" : "Add Task"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-ghost w-full"
                  disabled={saving}
                  onClick={resetForm}
                >
                  Cancel Editing
                </button>
              )}
            </form>
          </div>
        </div>

        {error && (
          <div role="alert" className="alert alert-error mb-4">
            <span>{error}</span>
            <button type="button" className="btn btn-sm" onClick={() => setError("")}>
              Dismiss
            </button>
          </div>
        )}

        {/* Task List */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <h2 className="card-title">My Tasks</h2>
              <div className="flex flex-wrap gap-2">
                {["all", "pending", "completed"].map((option) => (
                  <button
                    type="button"
                    key={option}
                    onClick={() => setFilter(option)}
                    className={`btn btn-sm ${filter === option ? "btn-primary" : "btn-outline"}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div role="status" aria-label="Loading tasks" className="flex justify-center py-10">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : filteredTasks.length === 0 ? (
              <p>{tasks.length === 0 ? "No tasks yet. Add your first task!" : "No tasks match this filter."}</p>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <div
                    key={task._id}
                    className="rounded-lg border border-base-300 p-4"
                  >
                    <div className="flex items-start gap-3">
                      {/* Complete checkbox */}
                      <input
                        type="checkbox"
                        className="checkbox checkbox-success mt-1"
                        aria-label={`Mark ${task.title} as ${task.completed ? "pending" : "completed"}`}
                        disabled={Boolean(busyTaskId) || saving}
                        checked={task.completed}
                        onChange={() => handleToggleComplete(task)}
                      />

                      {/* Task information */}
                      <div className="min-w-0 flex-1">
                        <h3
                          className={`font-semibold break-words ${
                            task.completed ? "line-through opacity-50" : ""
                          }`}
                        >
                          {task.title}
                        </h3>

                        <p className="mt-1 whitespace-pre-wrap break-words text-sm opacity-70">
                          {task.description}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="badge badge-primary">
                            {task.priority}
                          </span>

                          <span
                            className={
                              task.completed
                                ? "badge badge-success"
                                : "badge badge-warning"
                            }
                          >
                            {task.completed ? "Completed" : "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        className="btn btn-sm btn-outline"
                        disabled={Boolean(busyTaskId) || saving}
                        onClick={() => handleEdit(task)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-error"
                        disabled={Boolean(busyTaskId) || saving}
                        onClick={() => handleDelete(task._id)}
                      >
                        {busyTaskId === task._id ? "Working..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <footer className="mt-10 text-center text-sm opacity-60">
          TaskMate — Built with the MERN Stack
        </footer>
      </div>
    </div>
  );
}

export default App;
