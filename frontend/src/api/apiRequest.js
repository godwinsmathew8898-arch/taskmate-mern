const API_URL = "http://localhost:5000/api/tasks";

const apiRequest = async (endpoint = "", options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

// GET all tasks
export const getTasks = () => {
  return apiRequest();
};

// POST a new task
export const createTask = (taskData) => {
  return apiRequest("", {
    method: "POST",
    body: JSON.stringify(taskData),
  });
};

// PATCH an existing task
export const updateTask = (id, taskData) => {
  return apiRequest(`/${id}`, {
    method: "PATCH",
    body: JSON.stringify(taskData),
  });
};

// DELETE a task
export const deleteTask = (id) => {
  return apiRequest(`/${id}`, {
    method: "DELETE",
  });
};