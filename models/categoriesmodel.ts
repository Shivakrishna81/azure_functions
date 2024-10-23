const mongoose = require('mongoose');


const categorySchema: any = new mongoose.Schema(
    {

        categoryName: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        }
    },
    { timestamps: true }
);


const categories = mongoose.model('categories', categorySchema);

export default categories;
