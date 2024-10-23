const mongoose=require( 'mongoose');


const userSchema: any = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        role: {
            type: String,
            default: 'Member',
        },
        categories: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
);


const User = mongoose.model('UserDB', userSchema);

export default User;
