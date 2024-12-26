const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    owners: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    tags: [
      {
        type: String,
        required: true,
      },
    ],

    timeToComplete: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Todo", "In Progress", "Completed", "Blocked"],
      default: "Todo",
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;

// Automatically update the updatedAt field whenever the document gets updated.
taskSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});
