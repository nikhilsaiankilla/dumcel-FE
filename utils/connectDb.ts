// utils/connectDb.ts
import mongoose from "mongoose";

let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = {
    conn: null,
    promise: null,
};

export async function connectDb(): Promise<typeof mongoose> {
    if (cached.conn) {
        return cached.conn; // reuse existing connection
    }

    if (!process.env.MONGO_DB_URI) {
        throw new Error("MongoDB URI is not defined");
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGO_DB_URI).then((mongoose) => {
            return mongoose;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}
