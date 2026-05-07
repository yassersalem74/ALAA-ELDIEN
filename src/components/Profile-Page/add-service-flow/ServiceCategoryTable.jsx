import { useState } from "react";
import { updateService } from "../../api/services/service.api.js";
import Toast from "../../common/Toast";

export default function ServiceCategoryTable({ category, services, onBack, onRefresh }) {
  const [editingService, setEditingService] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [toast, setToast] = useState(null);

  const handleEdit = (service) => {
    setEditingService(service.id);
    setEditForm({
      name: service.name,
      price: service.price,
      currency: service.currency,
      categoryName: service.categoryName,
      isAvailable: service.isAvailable,
      timeslotDurationInMin: service.timeslotDurationInMin,
      numberOfCustomerPerTimeSlots: service.numberOfCustomerPerTimeSlots,
    });
  };

  const handleSaveEdit = async () => {
    try {
      await updateService(editingService, editForm);
      setToast({
        id: Date.now(),
        type: "success",
        message: "Service updated successfully.",
      });
      setEditingService(null);
      onRefresh();
    } catch (err) {
      setToast({
        id: Date.now(),
        type: "error",
        message: "Failed to update service.",
      });
      console.error(err);
    }
  };

  const handleCancelEdit = () => {
    setEditingService(null);
    setEditForm({});
  };

  const handleDelete = async (serviceId) => {
    // For now, just show a message. In real implementation, call delete API
    setToast({
      id: Date.now(),
      type: "info",
      message: "Delete functionality not implemented yet.",
    });
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-[0px_12px_40px_rgba(17,27,71,0.06)]">
      <Toast
        key={toast?.id}
        type={toast?.type}
        message={toast?.message}
        onClose={() => setToast(null)}
      />

      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF3FF] text-[#011C60] hover:bg-[#011C60] hover:text-white transition"
        >
          ←
        </button>
        <div>
          <h3 className="font-['Roboto'] text-[24px] font-semibold text-[#011C60]">
            {category.title}
          </h3>
          <p className="font-['Roboto'] text-[14px] text-[#6777A0]">
            Manage your services in this category
          </p>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-['Roboto'] text-[16px] text-[#6777A0]">
            No services in this category yet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#E6E8EF]">
                <th className="text-left py-3 px-4 font-['Roboto'] text-[14px] font-semibold text-[#011C60]">
                  Service Name
                </th>
                <th className="text-left py-3 px-4 font-['Roboto'] text-[14px] font-semibold text-[#011C60]">
                  Price
                </th>
                <th className="text-left py-3 px-4 font-['Roboto'] text-[14px] font-semibold text-[#011C60]">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-['Roboto'] text-[14px] font-semibold text-[#011C60]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-b border-[#F8F9FC]">
                  <td className="py-4 px-4">
                    {editingService === service.id ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-2 py-1 border border-[#E6E8EF] rounded"
                      />
                    ) : (
                      <span className="font-['Roboto'] text-[14px] text-[#011C60]">
                        {service.name}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {editingService === service.id ? (
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                        className="w-full px-2 py-1 border border-[#E6E8EF] rounded"
                      />
                    ) : (
                      <span className="font-['Roboto'] text-[14px] text-[#011C60]">
                        {service.currency} {service.price}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {editingService === service.id ? (
                      <select
                        value={editForm.isAvailable}
                        onChange={(e) => setEditForm({ ...editForm, isAvailable: e.target.value === 'true' })}
                        className="px-2 py-1 border border-[#E6E8EF] rounded"
                      >
                        <option value="true">Available</option>
                        <option value="false">Unavailable</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        service.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {service.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {editingService === service.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="px-3 py-1 bg-[#011C60] text-white rounded text-sm hover:bg-[#02267F]"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}