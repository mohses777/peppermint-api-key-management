import mongoose, { Schema } from 'mongoose';
import { IAccessLog } from '../interfaces/accessLog.interface';

const AccessLogSchema: Schema = new Schema(
    {
        apiKeyId: { type: Schema.Types.ObjectId, ref: 'ApiKey', required: true, index: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        endpoint: { type: String, required: true },
        method: { type: String, required: true },
        ipAddress: { type: String, required: true },
        userAgent: { type: String },
        statusCode: { type: Number, required: true },
        responseTime: { type: Number, required: true },
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: false }
);

AccessLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export default mongoose.model<IAccessLog>('AccessLog', AccessLogSchema);
