import { Schema, Document, model } from 'mongoose';

export interface Track extends Document{
    symbol: string;
    lastUpdate: Date;
}

const TrackSchema = new Schema<Track>({
    symbol: { type: String, required: true },
    lastUpdate: Date,
});

const TrackModel = model<Track>('Tracks', TrackSchema);

export default TrackModel;
// module.exports = TrackModel;
