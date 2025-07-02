'use client';

import { useState } from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function Switch({ checked, onChange, disabled = false }: SwitchProps) {
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