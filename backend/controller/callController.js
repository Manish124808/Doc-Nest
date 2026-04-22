import callModel from '../models/callModel.js'

// ─── Start Call ───────────────────────────────────────────────────────────────
const startCall = async (req, res) => {
    try {
        const { roomId, callerId, callerModel, receiverId, receiverModel, callType, appointmentId } = req.body

        if (!roomId || !callerId || !receiverId) {
            return res.status(400).json({ success: false, message: 'roomId, callerId and receiverId are required.' })
        }

        const existingCall = await callModel.findOne({ roomId })
        if (existingCall) {
            return res.status(409).json({ success: false, message: 'A call with this roomId already exists.' })
        }

        const newCall = await callModel.create({
            roomId,
            callerId,
            callerModel,
            receiverId,
            receiverModel,
            callType:      callType || 'audio',
            status:        'ringing',
            appointmentId: appointmentId || null
        })

        return res.status(201).json({ success: true, message: 'Call started.', call: newCall })

    } catch (error) {
        console.error('[startCall]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

// ─── Call History ─────────────────────────────────────────────────────────────
const getCallHistory = async (req, res) => {
    try {
        const { userId } = req.params

        const calls = await callModel.find({
            $or: [{ callerId: userId }, { receiverId: userId }]
        }).sort({ createdAt: -1 })

        return res.json({ success: true, calls })

    } catch (error) {
        console.error('[getCallHistory]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

// ─── Update Call Status ───────────────────────────────────────────────────────
const updateCallStatus = async (req, res) => {
    try {
        const { roomId, status } = req.body
        const validStatuses      = ['ringing', 'accepted', 'rejected', 'ended', 'missed']

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}.` })
        }

        const updateData = { status }
        if (status === 'accepted') updateData.startedAt = new Date()
        if (['ended', 'rejected', 'missed'].includes(status)) updateData.endedAt = new Date()

        const call = await callModel.findOneAndUpdate({ roomId }, updateData, { new: true })
        if (!call) {
            return res.status(404).json({ success: false, message: 'Call not found.' })
        }

        return res.json({ success: true, call })

    } catch (error) {
        console.error('[updateCallStatus]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

export { startCall, getCallHistory, updateCallStatus }
