import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IUserAchievement extends Document {
  userId:          Types.ObjectId
  achievementName: string
  dateUnlocked:    Date
}

const UserAchievementSchema = new Schema<IUserAchievement>(
  {
    userId:          { type: Schema.Types.ObjectId, ref: 'User', required: true },
    achievementName: { type: String, required: true },
    dateUnlocked:    { type: Date, default: Date.now },
  },
  { timestamps: false }
)

UserAchievementSchema.index({ userId: 1 })

export default mongoose.model<IUserAchievement>('UserAchievement', UserAchievementSchema)
