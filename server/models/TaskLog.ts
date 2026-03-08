import mongoose, { Schema, Document, Types } from 'mongoose'

export interface ITaskLog extends Document {
  taskId:  Types.ObjectId
  userId:  Types.ObjectId
  date:    Date
  status:  'completed' | 'missed'
  points:  number
}

const TaskLogSchema = new Schema<ITaskLog>(
  {
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date:   { type: Date, required: true },
    status: { type: String, enum: ['completed', 'missed'], required: true },
    points: { type: Number, required: true },
  },
  { timestamps: true }
)

TaskLogSchema.index({ userId: 1, date: -1 })
TaskLogSchema.index({ taskId: 1, date: -1 })

export default mongoose.model<ITaskLog>('TaskLog', TaskLogSchema)
