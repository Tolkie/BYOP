var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var TaskSchema = new Schema(
  {
    url: {
      type: String,
      required: [true, "url field required"],
    },
    ip: {
      type: String,
      required: [false],
    },
    status: {
      type: String,
      required: [false],
    },
    containerId: {
      type: String,
      required: [false],
    },
  },
  { timestamps: true, collection: "tasks" }
);

const TaskModel = mongoose.model("TaskModel", TaskSchema);

module.exports = TaskModel;
