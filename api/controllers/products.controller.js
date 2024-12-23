import Product from "../models/products.module.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({ message: "products successdully founded", products });
  } catch (error) {
    console.log("Error in getAllProducts controller");
    res.status(401).json({ message: "server Error", error: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    // lean returns js object and is faster than the mongodb object
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    if (!featuredProducts) {
      return res.status(404).json({ message: "there is no featured products" });
    }
    res
      .status(200)
      .json({ message: "fetured products found", featuredProducts });
  } catch (error) {
    console.log("Error happend on getFeatured Products route");
    res.status(401).json({ message: "Server Error", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const file = req.file;
    console.log(file.filename);
    const { name, description, price, image, category } = req.body;
    let cloudinaryResponse = null;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      // if there was no image then pass empty string
      image: file.filename,
    });
    res.status(201).json({ message: "product created successfully", product });
  } catch (error) {
    console.log("Error in createProduct controller: " + error.message);
    res.status(500).json({ message: "server Error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(401).json({ message: "product not found" });
    }
    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0]; // extract the file id from cloudinary url
      try {
        // delete image from cloud
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log("deleted image from cloudinary");
      } catch (error) {
        console.log("Error deleting image from cloudinary" + error.message);
        res.status(401);
      }
    }
    // delete image from mongodb
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "product deleted successfully" });
  } catch (error) {
    console.log("Error in deleteProduccts controller");
    res.status(500).json({ message: "server error", error: error.message });
  }
};
export const getRecommendedProducts = async (req, res) => {
  try {
    // aggregate is for choosing random products from db
    const products = await Product.aggregate([
      { $sample: { size: 3 } },
      {
        $project: {
          _id: 1,
          neme: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      },
    ]);
    res.json(products);
  } catch (error) {
    console.log("Error in get recommended controller");
    res.status(401).json({ message: "server Error", error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find(category);
    res.json(products);
  } catch (error) {
    console.log("Error in get recommended controller");
    res.status(401).json({ message: "server Error", error: error.message });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    }
    res.status(404).json({ message: "no product found" });
  } catch (error) {
    console.log("Error in get recommended controller");
    res.status(401).json({ message: "server Error", error: error.message });
  }
};


// {
//   "name": "shampo",
//   "description": "desc",
//   "price": 100,
//   "category":"ai",
//   "image": "data:image/jpeg;base64,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"
// }