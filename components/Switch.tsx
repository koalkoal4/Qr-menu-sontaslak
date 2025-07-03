'use client';

import { useState } from 'react';

// --- DEĞİŞİKLİK: 'id' prop'u eklendi ---
interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string; // id'yi opsiyonel bir prop olarak ekliyoruz
}

export default function Switch({ checked, onChange, disabled = false, id }: SwitchProps) {
  const [isEnabled, setIsEnabled] = useState(checked);

  const toggleSwitch = () => {
    if (disabled) return;
    const newState = !isEnabled;
    setIsEnabled(newState);
    onChange(newState);
  };

  return (
    <button
      type="button"
      id={id} // id'yi butona atıyoruz
      onClick={toggleSwitch}
      className={`${
        isEnabled ? 'bg-indigo-600' : 'bg-gray-200'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
      role="switch"
      aria-checked={isEnabled}
      disabled={disabled}
    >
      <span
        aria-hidden="true"
        className={`${
          isEnabled ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );
}