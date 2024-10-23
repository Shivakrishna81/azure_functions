import categories from "../models/categoriesmodel";


class Categorydao {
    async getAllUserCategories(categoryValues: string[]) {
        try {
            const categoriesData = await categories.find({ value: { $in: categoryValues } })
            return categoriesData
        } catch (err) {
            throw new Error(`Error while fetching the categories:${err.message}`)
        }
    }

    async addCategory(categoryName: string, value: string) {
        try {
            const data = new categories({ categoryName, value })
            await data.save()
        } catch(err) {
            throw new Error (err.message)
        }

    }
}


export default new Categorydao()