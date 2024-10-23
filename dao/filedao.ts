import File from "../models/filemodel"; 

class Filedao{

    async addFile(name: string, path: string, category: string,size:number) {
        try {
            const newFile = new File({
                name,
                path,
                category,
                size
            });
            const savedFile = await newFile.save();
            return savedFile;
        } catch (err) {
            throw new Error(`Error saving file: ${err.message}`);
        }
    }

    async findFilesByCategory(category: string) {
        try {
            const files = await File.find({ category });
            return files;
        } catch (err) {
            throw new Error(`Error finding files by category: ${err.message}`);
        }
    }

    async deleteFileByName(name: string) {
        try {
            await File.deleteOne({ name });
            return `File "${name}" deleted successfully`;
        } catch (err) {
            throw new Error(`Error deleting file: ${err.message}`);
        }
    }
}


export default new Filedao()