const Category = require('../models/category')

async function getAllCategories(){
    const cats = await Category.find({}).exec()
    return cats
}

module.exports = {
    getAllCategories
}