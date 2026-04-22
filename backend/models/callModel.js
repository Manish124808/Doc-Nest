import mongoose from 'mongoose';

const callSchema = new mongoose.Schema(
    {
       roomId: {
         type: String, required: true, unique: true
        },

        callerId: {
            type:     mongoose.Schema.Types.ObjectId,
            required: true,
            refPath:  'callerModel'  
        },
        callerModel: {
            type:     String,
            required: true,
            enum:     ['user', 'doctor']  
        },

        receiverId: {
            type:     mongoose.Schema.Types.ObjectId,
            required: true,
            refPath:  'receiverModel'  
        },
        receiverModel: {
            type:     String,
            required: true,
            enum:     ['user', 'doctor']
        },

        callType: {
            type:    String,
            enum:    ['audio', 'video'],
            default: 'audio'
        },

        status: {
            type:    String,
            enum:    [
                'initiated',  
                'ringing',   
                'accepted',  
                'rejected',   
                'missed',     
                'ended',      
                'failed'      
            ],
            default: 'initiated'
        },

        startedAt: {
            type: Date,
            default: null  
        },
        endedAt: {
            type: Date,
            default: null  
        },

        duration: {
            type:    Number,
        },

        appointmentId: {
            type:    mongoose.Schema.Types.ObjectId,
            ref:     'appointment',
            default: null
        }
    },
    { timestamps: true }  
)

callSchema.pre('save', function (next) {
    if (this.startedAt && this.endedAt) {
        this.duration = Math.floor(
            (this.endedAt - this.startedAt) / 1000
        )
    }
    next()
})

const callModel = mongoose.models.call || mongoose.model('call', callSchema)
export default callModel