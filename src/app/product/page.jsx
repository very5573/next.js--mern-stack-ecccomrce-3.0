"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useDebounce } from "use-debounce";
import API from "../../utils/axiosInstance";
import UIPagination from "../components/UI/UIPagination";
import SliderSizes from "../components/UI/Slider";
import { addCartItem } from "../../redux/slices/cartSlice";
import CategoryFilter from "../components/UI/CategoryFilter";
import { Rating } from "@mui/material"; // Only MUI Rating retained

const Product = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [debouncedPriceRange] = useDebounce(priceRange, 300);

  const keyword = useSelector((state) => state?.search?.keyword) || "";
  const [debouncedKeyword] = useDebounce(keyword, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword, debouncedPriceRange, selectedCategory]);

  const handleAddToCart = async (productId) => {
    try {
      await dispatch(addCartItem({ productId, quantity: 1 })).unwrap();
      toast.success("🛒 Product added to cart!");
    } catch (err) {
      toast.error(err.message || "Failed to add product to cart");
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      let query = `/products?page=${page}`;
      if (debouncedKeyword.trim())
        query += `&keyword=${debouncedKeyword.trim()}`;
      if (selectedCategory) query += `&categoryId=${selectedCategory}`;
      query += `&price[gte]=${debouncedPriceRange[0]}&price[lte]=${debouncedPriceRange[1]}`;

      const { data } = await API.get(query);
      setProducts(data.products || []);
      const total = data.filteredProductsCount || 0;
      const perPage = data.resultPerPage || 1;
      setTotalPages(Math.ceil(total / perPage));
    } catch {
      toast.error("❌ Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [debouncedKeyword, debouncedPriceRange, page, selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading)
    return (
      <div className="flex justify-center items-center mt-16">
        <div className="animate-spin border-4 border-gray-200 border-t-blue-500 rounded-full w-10 h-10"></div>
      </div>
    );

  if (!products.length)
    return (
      <div className="flex flex-col items-center mt-16">
        <h2 className="text-2xl font-bold text-gray-700">No products found 😔</h2>
        <button
          className="mt-4 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
          onClick={() => router.push("/")}
        >
          Back to Shop
        </button>
      </div>
    );

  return (
    <div className="p-6 -mt-16">
      {/* HEADER */}
      <div className="flex justify-between mb-6 items-center">
        <h2 className="text-3xl font-extrabold flex items-center gap-2 text-gray-800">
          All Products <span className="text-xl"></span>
        </h2>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* SIDEBAR */}
        <div className="md:w-1/4 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl sticky top-20 h-fit">
          <h3 className="font-bold mb-4 text-lg text-gray-800">Filters</h3>

          <CategoryFilter
            categories={categories}
            setCategories={setCategories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          <p className="mt-4 mb-2 font-semibold text-gray-700">Price</p>
          <SliderSizes
            value={priceRange}
            onChange={(e, val) => setPriceRange(val)}
          />
          <div className="flex justify-between mt-2 text-sm text-gray-600 font-medium">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>

        {/* PRODUCT GRID */}
        <div className="md:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p._id}
              className="rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col cursor-pointer bg-white"
            >
              {/* IMAGE */}
              <div
                className="w-full h-96 overflow-hidden rounded-t-2xl group"
                onClick={() => router.push(`/product/${p._id}`)}
              >
                <img
                  src={p.images?.[0]?.url || "/placeholder.png"}
                  alt={p.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* PRODUCT INFO */}
              <div className="flex flex-col flex-1 justify-between p-5">
                <div className="flex flex-col gap-2">
                  {/* PRODUCT NAME */}
                  <h3
                    className="font-semibold text-lg text-gray-800 line-clamp-2 break-words"
                    title={p.name} // Tooltip full name
                  >
                    {p.name}
                  </h3>

                  {/* PRICE */}
                  <p className="text-blue-600 mt-1 font-bold text-lg">₹{p.price}</p>

                  {/* RATING */}
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <Rating value={p.ratings || 0} readOnly size="small" />
                    <span className="text-gray-500">({p.numOfReviews || 0})</span>
                  </div>
                </div>

                {/* ADD TO CART */}
                <button
                  disabled={!p.inStock}
                  className={`mt-4 py-3 rounded-xl w-full flex items-center justify-center transition-all duration-300 text-white font-semibold text-lg ${
                    p.inStock
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-indigo-500 hover:to-blue-500"
                      : "bg-gray-400 cursor-not-allowed text-gray-700"
                  }`}
                  onClick={() => handleAddToCart(p._id)}
                >
                  {p.inStock ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PAGINATION */}
      <div className="mt-10 flex justify-center">
        <UIPagination
          totalPages={totalPages}
          page={page}
          onChange={(e, val) => setPage(val)}
        />
      </div>
    </div>
  );
};

export default Product;