import { Schema, Document, model } from 'mongoose';

export interface ClosedDate extends Document{
    date: Date;
}

const ClosedDateSchema = new Schema<ClosedDate>({
    date: { type: Date, required: true }
});

const ClosedDatesModel = model<ClosedDate>('ClosedDates', ClosedDateSchema);

export default ClosedDatesModel;
