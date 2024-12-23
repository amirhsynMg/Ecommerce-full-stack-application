import Product from "../models/products.module.js";

export const getCartProducts = async (req, res) => {
  try {
    const products = await Product.find({ _id: { $in: req.user.cardItem } });

    // quantity is not added i must add it for each of them
    const cardItems = products.map((product) => {
      const item = req.user.cardItem.find(
        (cardItem) => cardItem.id === product.id
      );
      return { ...product.toJSON(), quantity };
    });
    res.json(cardItems);
  } catch (error) {
    console.log("server Error: " + error.message);
  }
};
export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    const existingItem = user.cardItem.find((item) => item.id === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cardItem.push(productId);
    }
    await user.save();
    res.json(user.cardItem);
  } catch (error) {
    console.log("error in addTocart controller: " + error);
    res.status(500).json({ message: "server error", error: error.message });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;
    if (!productId) {
      user.cardItem = [];
    } else {
      user.cardItem = user.cardItem.filter((item) => item.id !== productId);
    }
    await user.save();
    res.json(user.cardItem);
  } catch (error) {
    console.log("error in remove allFromCart controller: " + error.message);
    res.status(500).json({ message: "server Error", error: error.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const productId = req.params.id;
    const quantity = req.quantity;
    const user = req.user;
    const existingItem = user.cardItem.find((item) => item.id === productId);

    if (existingItem) {
      if (quantity == 0) {
        user.cardItem = user.cardItem.filter((item) => item.id !== productId);
        await user.save();
        res.json(user.cardItem);
      }

      existingItem.quantity = quantity;
      await user.save();
      res.json(user.cardItem);
    }
  } catch (error) {
    console.log("error in update quantity controller");
    res.status(500).json({ message: "server Error: " + error.message });
  }
};
