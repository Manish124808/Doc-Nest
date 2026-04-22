import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    roomId:     { type: String, required: true, index: true },
    sender:     { type: String, required: true },
    senderType: { type: String, enum: ['user', 'doctor'], required: true },
    name:       { type: String, required: true },
    message:    { type: String, default: '' },
    imageUrl:   { type: String, default: null },
    isRead:     { type: Boolean, default: false },  
    readAt:     { type: Date, default: null },       
    time:       { type: Date, default: Date.now }
});

const messageModel = mongoose.models.message || mongoose.model('message', messageSchema);
export default messageModel;