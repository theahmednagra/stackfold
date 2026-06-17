import mongoose from "mongoose";

type connectionObject = {
    isConnected?: number
}

const connection: connectionObject = {}

export async function connectToDatabase(): Promise<void> {
    if (connection.isConnected) {
        console.log("Already connected to database.")
        return
    }
    try {
        const db = await mongoose.connect(process.env.MONGODB_URL || "", {})
        connection.isConnected = db.connections[0].readyState
        console.log("Successfully connected to database.")
        return
    } catch (error) {
        console.log("Database connection failed.", error)
        process.exit(1)
    }
}