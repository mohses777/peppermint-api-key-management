import mongoose, { Schema } from 'mongoose';
import { IApiKey } from '../interfaces/apiKey.interface';

const ApiKeySchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        name: { type: String, required: true, trim: true },
        keyHash: { type: String, required: true, unique: true },
        keyPrefix: { type: String, required: true },
        isActive: { type: Boolean, default: true, index: true },
        expiresAt: { type: Date },
        revokedAt: { type: Date },
        rotatedFromId: { type: Schema.Types.ObjectId, ref: 'ApiKey' },
    },
    { timestamps: true }
);

ApiKeySchema.index({ userId: 1, isActive: 1 });
ApiKeySchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model<IApiKey>('ApiKey', ApiKeySchema);

