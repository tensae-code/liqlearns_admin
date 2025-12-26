import React from 'react';
import { PhoneInput as ReactPhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  countryCode,
  onCountryCodeChange,
  className = '',
  placeholder = 'Phone Number',
  required = false
}) => {
  // Combine dial code and phone number for react-international-phone
  const fullPhoneValue = value.startsWith('+') ? value : `+${value}`;

  const handlePhoneChange = (phone: string, metadata: any) => {
    onChange(phone);
    if (metadata?.country) {
      onCountryCodeChange(metadata.country.iso2.toUpperCase());
    }
  };

  return (
    <div className="space-y-3">
      {/* Two-line layout: Country selector on top, dial code + input on bottom */}
      <ReactPhoneInput
        defaultCountry={countryCode.toLowerCase()}
        value={fullPhoneValue}
        onChange={handlePhoneChange}
        className={`rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-indigo-500 ${className}`}
        inputClassName="!border-0 !focus:ring-0 !text-sm !w-full !py-3.5 !px-4 !rounded-lg"
        countrySelectorStyleProps={{
          buttonClassName: "!border-0 !rounded-lg !py-3.5 !px-3 hover:!bg-orange-50 !transition-all !duration-200",
          dropdownStyleProps: {
            className: "!rounded-xl !shadow-2xl !border-2 !border-gray-200",
            listItemClassName: "hover:!bg-orange-50 !transition-all !duration-150 !py-3 !px-4",
          }
        }}
        placeholder={placeholder}
        inputProps={{
          required: required,
          autoComplete: 'tel',
        }}
      />
    </div>
  );
};

export default PhoneInput;