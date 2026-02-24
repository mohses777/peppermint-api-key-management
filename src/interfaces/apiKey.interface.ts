import { Document, Types } from 'mongoose';

export interface IApiKey extends Document {
    userId: Types.ObjectId;
    name: string;
    keyHash: string;
    keyPrefix: string;
    isActive: boolean;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    revokedAt?: Date;
    rotatedFromId?: Types.ObjectId;
}
