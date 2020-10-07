const TaskModel = require("../models/TaskModel");

const registerTask = async function (task) {
  task.save();
  return task;
};

const getLastTask = async function () {
  return await TaskModel.find({ status: "pending" })
    .sort({ createdAt: -1 })
    .limit(1)
    .select(["-__v", "-createdAt", "-updatedAt"]);
};

const getTaskById = async function (id) {
  return await TaskModel.findOne({ _id: id }).select([
    "-__v",
    "-createdAt",
    "-updatedAt",
  ]);
};

const getTaskByUrl = async function (url) {
  return await TaskModel.findOne({ url: url }).select([
    "-__v",
    "-createdAt",
    "-updatedAt",
  ]);
};

const getTaskByIp = async function (ip) {
  return await TaskModel.findOne({ ip: ip }).select([
    "-__v",
    "-createdAt",
    "-updatedAt",
  ]);
};

const getTasks = async function (filters) {
  return await TaskModel.find(filters).select([
    "-__v",
    "-createdAt",
    "-updatedAt",
  ]);
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
