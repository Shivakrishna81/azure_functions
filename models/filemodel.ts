const mongoose =require('mongoose');


const fileSchema: any= new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        path: {
            type: String,
            required: true,
        },
        category: {
            type: String,
        },
        size:{
            type:Number
        }
    },
    { timestamps: true }
);


const File = mongoose.model('FileDB', fileSchema);

export default File;
