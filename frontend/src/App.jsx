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

  // Load tasks from backend
  useEffect(() => {
    const loadTasks = async () => {
      try {
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
      setTitle("");
      setDescription("");
      setPriority("medium");
      setEditingId(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      setError("");

      const data = await updateTask(task._id, {
        completed: !task.completed,
      });

      setTasks((previousTasks) =>
        previousTasks.map((item) => (item._id === task._id ? data.task : item)),
      );
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEdit = (task) => {
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
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteTask(id);

      setTasks((previousTasks) =>
        previousTasks.filter((task) => task._id !== id),
      );

      // Clear the form if the deleted task was being edited
      if (editingId === id) {
        setEditingId(null);
        setTitle("");
        setDescription("");
        setPriority("medium");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary">TaskMate</h1>

          <p className="mt-2 opacity-70">Organize your tasks efficiently.</p>
        </header>

        {/* Add Task Form */}
        <div className="card mb-6 bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Add New Task</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Task title"
                className="input w-full"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={100}
                required
              />

              <textarea
                placeholder="Task description"
                className="textarea w-full"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />

              <select
                className="select w-full"
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
                disabled={saving}
              >
                {saving ? "Saving..." : editingId ? "Update Task" : "Add Task"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-ghost w-full"
                  disabled={saving}
                  onClick={() => {
                    setEditingId(null);
                    setTitle("");
                    setDescription("");
                    setPriority("medium");
                  }}
                >
                  Cancel Editing
                </button>
              )}
            </form>
          </div>
        </div>

        {error && (
          <div role="alert" className="alert alert-error mb-4">
            {error}
          </div>
        )}

        {/* Task List */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">My Tasks</h2>

            {loading ? (
              <p>Loading tasks...</p>
            ) : tasks.length === 0 ? (
              <p>No tasks yet. Add your first task!</p>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className="rounded-lg border border-base-300 p-4"
                  >
                    <div className="flex items-start gap-3">
                      {/* Complete checkbox */}
                      <input
                        type="checkbox"
                        className="checkbox checkbox-success mt-1"
                        checked={task.completed}
                        onChange={() => handleToggleComplete(task)}
                      />

                      {/* Task information */}
                      <div className="flex-1">
                        <h3
                          className={`font-semibold ${
                            task.completed ? "line-through opacity-50" : ""
                          }`}
                        >
                          {task.title}
                        </h3>

                        <p className="mt-1 text-sm opacity-70">
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
                        onClick={() => handleEdit(task)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-error"
                        onClick={() => handleDelete(task._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
