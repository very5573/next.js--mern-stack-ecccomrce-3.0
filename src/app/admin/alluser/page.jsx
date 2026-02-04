"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "@/utils/axiosInstance";

// UI Components
import { AppButton } from "../../components/UI/Button";
import { AlertDialogModal } from "../../components/UI/AlertDialogModal";
import SelectBasic from "../../components/UI/Select";

// MUI Icons (icons only)
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";

const AdminUsersPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);

  /* ===================== FETCH USERS ===================== */
  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/admin/users");
      setUsers(data?.users || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== FETCH SINGLE USER ===================== */
  const fetchSingleUser = async (id) => {
    try {
      const { data } = await API.get(`/admin/user/${id}`);
      setSelectedUser(data.user);
    } catch {
      toast.error("Failed to fetch user details");
    }
  };

  /* ===================== UPDATE ROLE ===================== */
  const updateUserRole = async (id, role) => {
    const originalUsers = [...users];

    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, role } : u))
    );

    try {
      await API.put(`/admin/user/${id}`, { role });
      toast.success("Role updated successfully");
    } catch {
      setUsers(originalUsers);
      toast.error("Failed to update role");
    }
  };

  /* ===================== DELETE USER ===================== */
  const confirmDelete = async () => {
    if (!deleteUserId) return;

    const originalUsers = [...users];
    setUsers((prev) => prev.filter((u) => u._id !== deleteUserId));

    try {
      await API.delete(`/admin/user/${deleteUserId}`);
      toast.success("User deleted successfully");
    } catch {
      setUsers(originalUsers);
      toast.error("Failed to delete user");
    } finally {
      setDeleteUserId(null);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  /* ===================== UI ===================== */
  return (
    <div className="relative overflow-x-auto rounded-none border border-gray-700 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 shadow-2xl">

      {/* ===================== TABLE ===================== */}
      {loading ? (
        <div className="p-8 text-gray-400">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="p-8 text-gray-400">No users found.</div>
      ) : (
        <table className="w-full table-fixed border-collapse text-sm text-left">

          {/* Caption */}
          <caption className="bg-gray-800 px-6 py-5 text-left">
            <h2 className="text-lg font-semibold text-white">
              Admin Users
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Manage users, roles, view details & delete accounts
            </p>
          </caption>

          {/* Header */}
          <thead className="bg-gray-850 border-b border-gray-700 text-gray-300">
            <tr>
              <th className="px-6 py-4 w-60 border-r border-gray-700">User ID</th>
              <th className="px-6 py-4 border-r border-gray-700">Name</th>
              <th className="px-6 py-4 border-r border-gray-700">Email</th>
              <th className="px-6 py-4 border-r border-gray-700">Role</th>
              <th className="px-6 py-4 border-r border-gray-700 text-right">View</th>
              <th className="px-6 py-4 text-right">Delete</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {users.map((u, i) => (
              <tr
                key={u._id}
                className={`border-b border-gray-700 transition
                  ${i % 2 === 0 ? "bg-gray-900" : "bg-gray-850"}
                  hover:bg-gray-800`}
              >
                <td className="px-6 py-4 break-words border-r border-gray-700 text-gray-300">
                  {u._id}
                </td>

                <td className="px-6 py-4 border-r border-gray-700 text-gray-200">
                  {u.name}
                </td>

                <td className="px-6 py-4 border-r border-gray-700 text-gray-400 break-words">
                  {u.email}
                </td>

                <td className="px-6 py-4 border-r border-gray-700">
                  <SelectBasic
                    value={u.role}
                    options={["user", "admin"]}
                    onChange={(val) => updateUserRole(u._id, val)}
                    className="bg-gray-700 text-white rounded-lg px-2 py-1"
                  />
                </td>

                <td className="px-6 py-4 text-right border-r border-gray-700">
                  <AppButton
                    variant="auto"
                    onClick={() => fetchSingleUser(u._id)}
                    className=""
                  >
                    <VisibilityIcon fontSize="small" />
                  </AppButton>
                </td>

                <td className="px-6 py-4 text-right">
                  <AppButton
                    variant="auto"
                    onClick={() => setDeleteUserId(u._id)}
                    className=""
                  >
                    <DeleteIcon fontSize="small" />
                  </AppButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ===================== USER DETAILS ===================== */}
      {selectedUser && (
        <div className="m-6 rounded-xl border border-gray-700 bg-gray-800 p-5 shadow-xl">
          <h3 className="mb-3 text-lg font-semibold text-white">
            User Details
          </h3>
          <p className="text-gray-300"><strong>ID:</strong> {selectedUser._id}</p>
          <p className="text-gray-300"><strong>Name:</strong> {selectedUser.name}</p>
          <p className="text-gray-300"><strong>Email:</strong> {selectedUser.email}</p>
          <p className="text-gray-300"><strong>Role:</strong> {selectedUser.role}</p>
        </div>
      )}

      {/* ===================== DELETE MODAL ===================== */}
      <AlertDialogModal
        open={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default AdminUsersPanel;
