import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  name:          string
  email:         string
  password:      string
  points:        number
  currentStreak: number
  bestStreak:    number
  fcmToken?:     string
  utcOffset:     number  // minutes ahead of UTC (e.g. IST = 330)
  createdAt:     Date
}

const UserSchema = new Schema<IUser>(
  {
    name:          { type: String, required: true, trim: true },
    email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:      { type: String, required: true },
    points:        { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    bestStreak:    { type: Number, default: 0 },
    fcmToken:      { type: String },
    utcOffset:     { type: Number, default: 0 },
  },
  { timestamps: true }
)


export default mongoose.model<IUser>('User', UserSchema)
