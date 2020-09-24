const TaskModel = require("../models/TaskModel");

const registerTask = async function (task) {
  task.save();
  return task;
};

const getLastTask = async function () {
  return await TaskModel.find().limit(1);
};

const getTaskById = async function (id) {
  return await TaskModel.findOne({ _id: id });
};

const getTaskByUrl = async function (url) {
  return await TaskModel.findOne({ url: url });
};

const getTaskByIp = async function (ip) {
  return await TaskModel.findOne({ ip: ip });
};

const getTasks = async function (filters) {
  return await TaskModel.find(filters);
};

const updateTask = async function (task) {
  task.save();
  return task;
};

const deleteTask = async function (id) {
  return await TaskModel.deleteOne({ _id: id });
};

module.exports = {
  registerTask,
  getLastTask,
  getTaskById,
  getTaskByUrl,
  getTaskByIp,
  getTasks,
  updateTask,
  deleteTask,
};
