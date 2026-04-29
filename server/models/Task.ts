import mongoose, { Schema, Document, Types } from 'mongoose'

export interface ITask extends Document {
  userId:        Types.ObjectId
  title:         string
  type:          'daily' | 'scheduled'
  dueDate?:      Date
  reminderTimes: string[]
  points:        number
  penalty:       number
  createdAt:     Date
}

const TaskSchema = new Schema<ITask>(
  {
    userId:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title:         { type: String, required: true, trim: true },
    type:          { type: String, enum: ['daily', 'scheduled'], required: true },
    dueDate:       { type: Date },
    reminderTimes: { type: [String], default: ['09:00'] },
    points:        { type: Number, default: 10 },
    penalty:       { type: Number, default: 5 },
  },
  { timestamps: true }
)

TaskSchema.index({ userId: 1, type: 1 })

export default mongoose.model<ITask>('Task', TaskSchema)
