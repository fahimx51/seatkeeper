import 'dotenv/config';
import mongoose from 'mongoose';

const dbUrl = process.env.DB_URI || '';

const connectDB = async () => {
    try {
        await mongoose.connect(dbUrl).then((data) => {
            console.log(`MongoDB connected with ${data.connection.host}`);
        });
    }
    catch (error) {
        console.log(error.message);
        setTimeout(connectDB, 5000);
    }
}

export default connectDB;