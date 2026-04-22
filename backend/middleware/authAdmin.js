import jwt from 'jsonwebtoken'

const authAdmin = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Not authorized: Token missing' })
        }

        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Admin token payload must contain role: 'admin'
        if (decoded.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Admin access only' })
        }

        next()
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' })
    }
}

export default authAdmin
