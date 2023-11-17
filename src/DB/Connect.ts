import mongoose from "mongoose";
import { db_url } from "../utils/Envs";

const Connect = async () => {
    try {
        const db = await mongoose?.connect(db_url, {
            connectTimeoutMS: 100,
            dbName: "app",
        });
        console.log("Connected");
        return db;
    } catch (error) {
        console.error("error : ", error);
        throw new Error();
    }
};

export default Connect;
