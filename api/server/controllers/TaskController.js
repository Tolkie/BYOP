const TaskBusiness = require("../business/TaskBusinessLogic");
const TaskModel = require("../models/TaskModel");

exports.getLastTask = async function (req, res, next) {
  try {
    var task = await TaskBusiness.getLastTask();

    res.status(200).json({
      status: 200,
      message: "Ok",
      task: task,
    });
  } catch (err) {
    next(err);
  }
};

exports.getTask = async function (req, res, next) {
  try {
    var task = await TaskBusiness.getTask(req.params.id);

    res.status(200).json({
      status: 200,
      message: "Ok",
      task: task,
    });
  } catch (err) {
    next(err);
  }
};

exports.getTasks = async function (req, res, next) {
  try {
    var tasks = await TaskBusiness.getTasks(req.query);

    res.status(200).json({
      status: 200,
      message: "Ok",
      tasks: tasks,
    });
  } catch (err) {
    next(err);
  }
};

exports.registerTask = async function (req, res, next) {
  try {
    var task = new TaskModel(req.body);

    task = await TaskBusiness.registerTask(task);
    res.status(200).json({
      statusCode: 200,
      message: "Task registered successfully",
      task: task,
    });
  } catch (err) {
    next(err);
  }
};

exports.putTask = async function (req, res, next) {
  try {
    var updatedTask = new TaskModel(req.body);
    var task = await TaskBusiness.updateTask(updatedTask, req.params.id);

    res.status(200).json({
      statusCode: 200,
      message: "Task updated successfully",
      task: task,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async function (req, res, next) {
  try {
    var message = await TaskBusiness.deleteTask(req.params.id);

    res.status(200).json({
      statusCode: 200,
      message: message,
    });
  } catch (err) {
    next(err);
  }
};
