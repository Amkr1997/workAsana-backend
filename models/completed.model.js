const mongoose = require("mongoose");

const completedSchema = new mongoose.Schema(
  {
    taskName: {
      type: String,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  },
  { timestamps: true }
);

const Completed = mongoose.model("CompletedTasks", completedSchema);
module.exports = Completed;
