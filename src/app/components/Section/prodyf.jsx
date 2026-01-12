
// "use client";

// import { useEffect, useState, useMemo } from "react";
// import { useRouter } from "next/navigation";
// import { toast } from "react-toastify";
// import API from "../../../utils/axiosInstance";
// import OrderStatusUpdater from "../../components/Section/OrderStatusUpdater";
// import { AppButton } from "../../components/UI/Button";
// import { AlertDialogModal } from "../../components/UI/AlertDialogModal";

// // Icons
// import DeleteIcon from "@mui/icons-material/Delete";
// import InventoryIcon from "@mui/icons-material/Inventory";
// import AccessTimeIcon from "@mui/icons-material/AccessTime";

// // Pagination
// import UIPagination from "../../components/UI/UIPagination";
// import OrdersFilterBar from "../../components/Section/OrderSearchFilter";
// import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
// import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

// export default function AllOrdersPage() {
//   const [orders, setOrders] = useState([]);
//   const [filters, setFilters] = useState({});
//   const [sortBy, setSortBy] = useState("createdAt");
//   const [sortOrder, setSortOrder] = useState("desc");

//   const [totalAmount, setTotalAmount] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [selectedOrders, setSelectedOrders] = useState([]);
//   const [deleteOrderId, setDeleteOrderId] = useState(null);

//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   const router = useRouter();
//   const fetchOrders = async (
//     pageNumber = 1,
//     appliedFilters = filters,
//     appliedSortBy = sortBy,
//     appliedOrder = sortOrder
//   ) => {
//     setLoading(true);

//     try {
//       const params = new URLSearchParams({
//         page: pageNumber,
//         limit: 10,
//         sortBy: appliedSortBy, // ✅ ADD
//         order: appliedOrder, // ✅ ADD
//         ...appliedFilters,
//       });

//       const { data } = await API.get(`/admin/orders?${params.toString()}`);

//       setOrders(data.orders);
//       setTotalAmount(data.totalAmount);
//       setTotalPages(data.totalPages);
//       setPage(data.currentPage);
//       setError("");
//     } catch (err) {
//       setError("Failed to fetch orders");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Single Delete
//   const confirmDelete = async () => {
//     if (!deleteOrderId) return;

//     const originalOrders = [...orders];
//     setOrders((prev) => prev.filter((o) => o._id !== deleteOrderId));
//     toast.info("Deleting...");

//     try {
//       await API.delete("/admin/orders", {
//         data: { orderIds: [deleteOrderId] },
//       });
//       toast.success("Order deleted successfully");
//       fetchOrders(page, filters);
//     } catch (err) {
//       setOrders(originalOrders);
//       toast.error("Failed to delete order");
//     }

//     setDeleteOrderId(null);
//   };

//   // Bulk Delete
//   const confirmBulkDelete = async () => {
//     if (selectedOrders.length === 0) return;

//     const originalOrders = [...orders];
//     setOrders((prev) => prev.filter((o) => !selectedOrders.includes(o._id)));
//     toast.info("Deleting selected orders...");

//     try {
//       await API.delete("/admin/orders", {
//         data: { orderIds: selectedOrders },
//       });
//       toast.success("Selected orders deleted successfully");
//       setSelectedOrders([]);
//       fetchOrders(page, filters);
//     } catch (err) {
//       setOrders(originalOrders);
//       toast.error("Failed to delete selected orders");
//     }
//   };

//   useEffect(() => {
//     fetchOrders(1, filters);
//   }, []);

//   // Handle select/deselect
//   const toggleSelectOrder = (id) => {
//     setSelectedOrders((prev) =>
//       prev.includes(id) ? prev.filter((oid) => oid !== id) : [...prev, id]
//     );
//   };

//   const toggleSelectAll = () => {
//     if (selectedOrders.length === orders.length) {
//       setSelectedOrders([]);
//     } else {
//       setSelectedOrders(orders.map((o) => o._id));
//     }
//   };
//   const toggleSort = (field) => {
//     let newOrder = "desc";

//     // same field par dubara click → order reverse
//     if (sortBy === field) {
//       newOrder = sortOrder === "asc" ? "desc" : "asc";
//     }

//     setSortBy(field);
//     setSortOrder(newOrder);

//     // backend ko field + order bhej raha hai
//     fetchOrders(1, filters, field, newOrder);
//   };

//   const handleApplyFilters = (newFilters) => {
//     setFilters(newFilters);
//     fetchOrders(1, newFilters);
//   };

//   // Desktop Rows
//   const desktopRows = useMemo(
//     () =>
//       orders.map((order) => (
//         <tr
//           key={order._id}
//           className="bg-neutral-primary-soft border-b border-default hover:bg-neutral-secondary-medium transition-colors duration-200"
//         >
//           <td className="w-6 p-4 border-r border-default">
//             <input
//               type="checkbox"
//               checked={selectedOrders.includes(order._id)}
//               onChange={() => toggleSelectOrder(order._id)}
//               className="w-6 h-6 border-2 border-default-medium rounded-sm bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft transition"
//             />
//           </td>

//           <th className="px-6 py-4 font-medium text-heading whitespace-nowrap border-r border-default">
//             {order._id}
//           </th>

//           <td className="px-6 py-4 border-r border-default text-gray-200">
//             {order.user?.name}
//           </td>

//           <td className="px-6 py-4 border-r border-default text-gray-200">
//             {order.user?.email}
//           </td>

//           <td className="px-6 py-4 font-semibold border-r border-default text-green-400">
//             ₹{order.totalPrice}
//           </td>

//           <td className="px-6 py-4 border-r border-default">
//             <OrderStatusUpdater
//               orderId={order._id}
//               currentStatus={order.orderStatus}
//               onStatusChange={() => fetchOrders(page, filters)}
//             />
//           </td>

//           <td className="px-6 py-4 text-right border-r border-default">
//             <AppButton
//               variant="contained"
//               className="hover:shadow-md transition"
//               onClick={() => router.push(`/admin/all-orders/${order._id}`)}
//             >
//               View
//             </AppButton>
//           </td>

//           <td className="px-6 py-4 text-right">
//             <AppButton
//               variant="outlined"
//               color="error"
//               className="hover:bg-red-600 hover:text-white transition"
//               onClick={() => setDeleteOrderId(order._id)}
//             >
//               <DeleteIcon fontSize="small" className="mr-1" /> Delete
//             </AppButton>
//           </td>
//         </tr>
//       )),
//     [orders, selectedOrders, page, filters]
//   );
//   return (
//     <div className="p-6 max-w-7xl mx-auto mt-10 bg-gray-900 text-white rounded-lg shadow-lg">
//       <h2 className="text-3xl font-bold flex items-center gap-3 mb-4 text-gradient-to-r from-purple-400 via-pink-500 to-red-500">
//         <InventoryIcon className="text-2xl" /> All Orders
//       </h2>

//       <p className="text-lg font-semibold mb-6 text-green-400">
//         Total Revenue: ₹{totalAmount}
//       </p>

//       <OrdersFilterBar onApply={handleApplyFilters} />

//       {selectedOrders.length > 0 && (
//         <div className="mb-6 flex items-center gap-4">
//           <OrderStatusUpdater
//             orderIds={selectedOrders}
//             onStatusChange={() => fetchOrders(page, filters)}
//           />
//           <AppButton
//             variant="outlined"
//             color="error"
//             className="hover:bg-red-600 hover:text-white transition"
//             onClick={confirmBulkDelete}
//           >
//             <DeleteIcon className="mr-1" /> Delete Selected (
//             {selectedOrders.length})
//           </AppButton>
//         </div>
//       )}

//       <div className="relative overflow-x-auto bg-neutral-primary-soft shadow-md rounded-xl border border-default">
//         <table className="w-full text-sm text-left text-body border-collapse">
//           <thead className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white border-b border-white">
//             <tr className="uppercase text-xs tracking-wider border-b border-white">
//               <th className="px-6 py-3 border-r border-white">
//                 <input
//                   type="checkbox"
//                   checked={
//                     selectedOrders.length === orders.length && orders.length > 0
//                   }
//                   onChange={toggleSelectAll}
//                   className="w-6 h-6 border border-white rounded-sm bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft transition"
//                 />
//               </th>
//               <th className="px-6 py-3 border-r border-white">Order ID</th>
//               <th className="px-6 py-3 border-r border-white">User</th>
//               <th className="px-6 py-3 border-r border-white">Email</th>
//               <th
//                 onClick={() => toggleSort("totalPrice")}
//                 className="px-6 py-3 border-r border-white cursor-pointer select-none"
//               >
//                 <div className="flex items-center gap-1 justify-center">
//                   Total
//                   {sortBy === "totalPrice" &&
//                     (sortOrder === "asc" ? (
//                       <ArrowUpwardIcon
//                         fontSize="small"
//                         className="text-yellow-300"
//                       />
//                     ) : (
//                       <ArrowDownwardIcon
//                         fontSize="small"
//                         className="text-yellow-300"
//                       />
//                     ))}
//                 </div>
//               </th>
//               <th className="px-6 py-3 border-r border-white select-none">
//                 Status
//               </th>

//               <th className="px-6 py-3 text-center border-r border-white">
//                 View
//               </th>
//               <th className="px-6 py-3 text-center border-white">Delete</th>
//             </tr>
//           </thead>
//           <tbody>{desktopRows}</tbody>
//         </table>
//       </div>

//       {loading && (
//         <p className="text-center mt-6 flex items-center justify-center gap-2 text-gray-300">
//           <AccessTimeIcon fontSize="small" /> Loading orders...
//         </p>
//       )}

//       {error && <p className="text-center text-red-600 mt-6">{error}</p>}

//       <div className="flex justify-center mt-6">
//         <UIPagination
//           totalPages={totalPages}
//           page={page}
//           onChange={(event, value) => {
//             setPage(value);
//             fetchOrders(value, filters);
//           }}
//         />
//       </div>

//       <AlertDialogModal
//         open={!!deleteOrderId}
//         onClose={() => setDeleteOrderId(null)}
//         onConfirm={confirmDelete}
//       />
//     </div>
//   );
// }
