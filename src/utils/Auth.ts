import { Types } from "mongoose";
import users_model, { type User } from "../DB/Models/UsersModels";

const Auth = async (user_id: string, role?: User["role"]) => {
    if (!Types.ObjectId.isValid(user_id)) {
        throw new Error("user_id must be valid");
    }
    const user = await users_model.findById(user_id);
    if (!user) {
        throw new Error("user not found");
    }
    if (!user.confirmed) {
        throw new Error("please confirm your email");
    }
    if (undefined !== role && user.role !== role) {
        throw new Error("not Authorized");
    }
    return user;
};
export default Auth;
