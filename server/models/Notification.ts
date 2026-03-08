import mongoose, { Schema, Document, Types } from 'mongoose'

export interface INotification extends Document {
  userId:    Types.ObjectId
  title:     string
  body:      string
  read:      boolean
  createdAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title:  { type: String, required: true },
    body:   { type: String, required: true },
    read:   { type: Boolean, default: false },
  },
  { timestamps: true }
)

NotificationSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.model<INotification>('Notification', NotificationSchema)
