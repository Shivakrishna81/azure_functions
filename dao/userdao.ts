import User from "../models/usermodel";

class Userdao{

    async findByEmail(email: string): Promise<any | null> {
        try {
            const user = await User.findOne({ email: email });
            return user;
        } catch (error) {
            throw new Error(`Error while finding a user: ${error.message}`);
        }
    }

    async createUser(userDetails: any) {
        try {
            const newUser = new User({ ...userDetails });
            const savedUser = await newUser.save();
            return savedUser;
        } catch (err) {
            throw new Error(`Error while creating a user: ${err.message}`);
        }
    }

    async findAllUsers() {
        try {
            const users = await User.find({});
            return users;
        } catch (err) {
            throw new Error(`Error while fetching a users: ${err.message}`);
        }
    }

    async deleteUserByEmail(userMail: string) {
        try {
            const result = await User.deleteOne({ email: userMail });
            return result;
        } catch (err) {
            throw new Error(`Error deleting user: ${err.message}`);
        }
    }
}


export default new Userdao()