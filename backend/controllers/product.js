const Product = require("../models/Product");
module.exports.getAllProducts = async (req, res, next) => {
  try {
    const { q } = req.query;
    let filter = {};

    if (search && search !== "null" && search !== "") {
      const searchRegex = new RegExp(search, "i");
      filter = {
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { category: searchRegex },
          { highlights: searchRegex },
          { "colors.name": searchRegex },
          { "sizes.name": searchRegex }
        ]
      };
    }

    const products = await Product.find(filter);


res.status(200).json(products);

  } catch (err) {
    next(err); 
  }
};

  module.exports.getProductById = async (req, res, next) => {
    try {
      let id = req.params.id;
      const product = await Product.findById(id);
      if (!product) {
        const err = new Error("Product not found");
        err.statusCode = 404;
        return next(err);
      }
      res.json(product);
    } catch (err) {
      next(err);
    }
  };

module.exports.createProduct = async (req, res, next) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json({ message: "Product created successfully", product: newProduct });
  } catch (err) {
    next(err);
  }
};

module.exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await Product.findOneAndDelete({ _id: id });

    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports.updateProduct = async (req, res, next) => {
  try {
    let { id } = req.params;
    let product = await Product.findByIdAndUpdate(id, req.body, { new: true });
    if (!product) {
      const err = new Error("Product not found");
      err.statusCode = 404;
      return next(err);
    }
    res.status(200).json({ message: "Product updated successfully", product });
  } catch (err) {
    next(err);
  }
};
