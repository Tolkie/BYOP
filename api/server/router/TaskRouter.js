var express = require("express");
var router = express.Router();

var TaskController = require("../controllers/TaskController");

router.get("/task", TaskController.getLastTask);
router.get("/tasks", TaskController.getTasks);
router.get("/task/:id", TaskController.getTask);
router.post("/task", TaskController.registerTask);
router.put("/task/:id", TaskController.putTask);
router.delete("/task/:id", TaskController.deleteTask);

module.exports = router;
