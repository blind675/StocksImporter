import { Schema, Document, model } from 'mongoose';

export interface Problems extends Document{
    ticker: string;
    problem: string;
}

const ProblemsSchema = new Schema<Problems>({
    ticker: { type: String, required: true },
    problem: { type: String, required: true },
});

const ProblemsModel = model<Problems>('Problems', ProblemsSchema);

export default ProblemsModel;
