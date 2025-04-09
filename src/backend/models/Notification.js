import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  notificationId: {
    type: String,
    required: true,
    unique: true
  },
  recipientId: {
    type: String,
    required: true
  },
  recipientType: {
    type: String,
    enum: ['student', 'faculty'],
    required: true
  },
  documentId: String,
  message: String,
  read: {
    type: Boolean,
    default: false
  },
  actionRequired: Boolean,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;