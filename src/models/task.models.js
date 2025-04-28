import mongoose, { Schema } from "mongoose";
import { TaskStatusesEnum, AvailableTaskStatuses } from "../utils/constants.js";

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: AvailableTaskStatuses,
      default: TaskStatusesEnum.TODO,
    },
    attachements: {
      type: [
        {
          url: String,
          memeType: String,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Task = mongoose.model("Task", taskSchema);
