const ApiError = require("../exceptions/ApiError");
const TaskRepository = require("../repositories/TaskRepository");

const registerTask = async function (task) {
  var error = task.validateSync();

  if (error != null) {
    var array = [];
    if (error.name == "ValidationError") {
      for (var field in error.errors) {
        array.push(error.errors[field].message);
      }
    }
    throw new ApiError(400, array);
  } else if ((await TaskRepository.getTaskByUrl(task.url)) != null) {
    throw new ApiError(409, "Task with this url already exist");
  } else {
    task.ip = null;
    task.status = "pending";
    return TaskRepository.registerTask(task);
  }
};

const getTask = async function (id) {
  var task = await TaskRepository.getTaskById(id);

  if (!task) {
    throw new ApiError(400, "Task with this id doesn't exist");
  } else {
    return task;
  }
};

const getTasks = async function (filters) {
  var tasks = await TaskRepository.getTasks(filters);

  if (!tasks) {
    throw new ApiError(400, "No tasks found");
  } else {
    return tasks;
  }
};

const getLastTask = async function () {
  var task = await TaskRepository.getLastTask();

  if (!task) {
    throw new ApiError(400, "No task found");
  } else {
    return task;
  }
};

const deleteTask = async function (id) {
  var task = await TaskRepository.getTaskById(id);

  if (!task) {
    throw new ApiError(400, "Task with this id doesn't exist");
  } else {
    if (task.status != "awaitingDeletion") {
      task.status = "awaitingDeletion";
      updateTask(task, task._id);
      return "Task awaiting deletion";
    }
    await TaskRepository.deleteTask(id);
    return "Task deleted successfully";
  }
};

const updateTask = async function (updatedTask, id) {
  var task = await TaskRepository.getTaskById(id);

  console.log(updatedTask);
  console.log(id);

  if (!task) {
    throw new ApiError(400, "Task with this id doesn't exist");
  } else {
    if (updatedTask.ip) {
      task.ip = updatedTask.ip;
    }
    if (updatedTask.status) {
      task.status = updatedTask.status;
      if (task.status == "deleted") {
        return await TaskRepository.deleteTask(id);
      }
      task.status = updatedTask.status;
    }
    if (updatedTask.containerId) {
      task.containerId = updatedTask.containerId;
    }
    return await TaskRepository.updateTask(task);
  }
};

module.exports = {
  registerTask,
  getTask,
  getTasks,
  getLastTask,
  deleteTask,
  updateTask,
};
