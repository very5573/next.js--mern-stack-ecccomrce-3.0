"use client";

function SelectBasic({ value, onChange, options = [], disabled = false }) {
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="
        w-full
        px-4 py-2
        border border-gray-300
        rounded-lg
        bg-white
        text-gray-800
        focus:outline-none
        focus:ring-2 focus:ring-blue-500
        focus:border-blue-500
        disabled:bg-gray-100
        disabled:cursor-not-allowed
      "
    >
      {/* Placeholder */}
      <option value="" disabled>
        Select...
      </option>

      {options.map((item, idx) => {
        const optionValue = item?.id ?? item?.value ?? item ?? "";
        const optionLabel =
          item?.name ??
          item?.label ??
          item?.title ??
          item?.status ??
          item ??
          "Unknown";

        return (
          <option key={idx} value={optionValue}>
            {optionLabel}
          </option>
        );
      })}
    </select>
  );
}

export default SelectBasic;
