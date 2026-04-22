import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({


    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'doctor',
        required: true
    },


    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },


    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'appointment',
        required: true,
        unique: true
    },

    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500, default: '' },
    isRated: { type: Boolean, default: false },
    isReviewed: { type: Boolean, default: false },

}, { timestamps: true });

reviewSchema.post('save', async function () {
    const Review = mongoose.model('Review');

    const stats = await Review.aggregate([
        { $match: { doctor: this.doctor } },
        {
            $group: {
                _id: '$doctor',
                avg: { $avg: '$rating' },
                count: { $sum: 1 }
            }
        }
    ]);
    await mongoose.model('doctor').findByIdAndUpdate(this.doctor, {
        averageRating: stats.length > 0 ? parseFloat(stats[0].avg.toFixed(1)) : 0,
        totalReviews: stats.length > 0 ? stats[0].count : 0
    });
});

reviewSchema.post('findOneAndDelete', async function (doc) {
    if (!doc) return;

    const Review = mongoose.model('Review');

    const stats = await Review.aggregate([
        { $match: { doctor: doc.doctor } },
        {
            $group: {
                _id:   '$doctor',
                avg:   { $avg: '$rating' },
                count: { $sum: 1 }
            }
        }
    ]);

    await mongoose.model('doctor').findByIdAndUpdate(doc.doctor, {
        averageRating: stats.length > 0 ? parseFloat(stats[0].avg.toFixed(1)) : 0,
        totalReviews:  stats.length > 0 ? stats[0].count : 0
    });
});

const reviewModel = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export default reviewModel;