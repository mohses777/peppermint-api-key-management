import { Document, Types } from 'mongoose';

export interface IAccessLog extends Document {
    apiKeyId: Types.ObjectId;
    userId: Types.ObjectId;
    endpoint: string;
    method: string;
    ipAddress: string;
    userAgent?: string;
    statusCode: number;
    responseTime: number;
    timestamp: Date;
}
