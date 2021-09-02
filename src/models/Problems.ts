import { Schema, Document, model } from 'mongoose';

export interface Problems extends Document{
    ticker: string;
    problem: string;
}

const ProblemsSchema = new Schema<Problems>({
    symbol: { type: String, required: true },
    problem: { type: String, required: true },
});

const ProblemsModel = model<Problems>('Problems', ProblemsSchema);

export default ProblemsModel;
