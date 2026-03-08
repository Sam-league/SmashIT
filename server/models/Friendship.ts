import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IFriendship extends Document {
  userId:    Types.ObjectId
  friendId:  Types.ObjectId
  status:    'pending' | 'accepted'
  createdAt: Date
}

const FriendshipSchema = new Schema<IFriendship>(
  {
    userId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    friendId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status:   { type: String, enum: ['pending', 'accepted'], default: 'pending' },
  },
  { timestamps: true }
)

FriendshipSchema.index({ userId: 1, status: 1 })
FriendshipSchema.index({ friendId: 1, status: 1 })

export default mongoose.model<IFriendship>('Friendship', FriendshipSchema)
