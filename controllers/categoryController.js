const Category = require('../models/category')

async function getAllCategories(){
    const categories = await Category.find({}).exec()
    return categories
}

module.exports = {
    getAllCategories
}