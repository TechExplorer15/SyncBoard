/**
 * Reusable form input with label and error display.
 */
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`
            block w-full px-4 py-3 rounded-xl border
            text-gray-900 placeholder-gray-400 bg-gray-50
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white
            transition-all duration-200
            ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
