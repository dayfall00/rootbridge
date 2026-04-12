import { collection, doc, getDocs, setDoc, query, where, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";

export const uploadProductImage = async (file, path) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
};

export const createProduct = async (productData, imageFile) => {
  try {
    const productId = doc(collection(db, "products")).id;
    let imageUrl = null;
    
    if (imageFile) {
      const path = `products/${productId}/${imageFile.name}`;
      imageUrl = await uploadProductImage(imageFile, path);
    }
    
    const finalProduct = {
      ...productData,
      productId,
      imageUrl
    };
    
    await setDoc(doc(db, "products", productId), finalProduct);
    return finalProduct;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const subscribeToProducts = (callback) => {
  const q = query(collection(db, "products"));
  return onSnapshot(q, (snapshot) => {
    const products = [];
    snapshot.forEach((doc) => {
      products.push(doc.data());
    });
    callback(products);
  });
};
