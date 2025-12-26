import React, { useState } from 'react';
import 'react-international-phone/style.css';
import { PhoneInput as InternationalPhoneInput } from 'react-international-phone';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { MapPin, Target } from 'lucide-react';

interface GeneralQuestionsStepProps {
  formData: {
    address: string;
    dateOfBirth: string;
    country: string;
    state: string;
    city: string;
    phone?: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const countries = [
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' }
];

const GeneralQuestionsStep: React.FC<GeneralQuestionsStepProps> = ({ formData, onInputChange }) => {
  const [phone, setPhone] = useState(formData.phone || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressSuggestions] = useState<string[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handlePhoneChange = (phone: string) => {
    // Phone number already comes formatted with country code from react-international-phone
    // No need to add any additional formatting - just save it as-is
    setPhone(phone);
    onInputChange('phone', phone);
  };

  const handleUsePreciseLocation = async () => {
    setIsGettingLocation(true);
    try {
      // Get precise location using browser geolocation API
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            // Use reverse geocoding to get address
            // For now, just log the coordinates
            console.log('Location:', position.coords.latitude, position.coords.longitude);
            // You can integrate with a geocoding service here
            setIsGettingLocation(false);
          },
          (error) => {
            console.error('Error getting location:', error);
            setIsGettingLocation(false);
          }
        );
      }
    } catch (error) {
      console.error('Location error:', error);
      setIsGettingLocation(false);
    }
  };

  const handleAddressSelect = (suggestion: string) => {
    onInputChange('address', suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Tell us more about you</h3>
        <p className="text-gray-600">Complete your profile information</p>
      </div>

      {/* Enhanced International Phone Input with Flag Display */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number *
        </label>
        <InternationalPhoneInput
          defaultCountry="et"
          value={phone}
          onChange={handlePhoneChange}
          inputClassName="!border-gray-300 !focus:ring-2 !focus:ring-orange-500 !focus:border-orange-500 !rounded-lg !text-sm !w-full"
          countrySelectorStyleProps={{
            buttonClassName: '!border-0 !bg-gray-50 !rounded-l-lg',
          }}
          className="rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-orange-500 overflow-hidden"
        />
        <p className="text-xs text-gray-500 mt-1">
          Select your country and enter your phone number
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date of Birth *
        </label>
        <Input
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => onInputChange('dateOfBirth', e.target.value)}
          required
        />
      </div>

      <div className="space-y-4">
        {/* Address with Autocomplete and Precise Location */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Street Address *
          </label>
          <div className="relative">
            <Input
              type="text"
              value={formData.address}
              onChange={(e) => onInputChange('address', e.target.value)}
              placeholder="123 Main Street, City, Country"
              className="w-full pr-12"
              required
              onFocus={() => formData.address.length >= 1 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              autoComplete="street-address"
              name="address"
            />
            
            {/* Use Precise Location Button */}
            <button
              type="button"
              onClick={handleUsePreciseLocation}
              disabled={isGettingLocation}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Use Precise Location"
            >
              {isGettingLocation ? (
                <div className="w-5 h-5 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Target className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Address Suggestions Dropdown */}
          {showSuggestions && addressSuggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-2xl shadow-lg max-h-60 overflow-y-auto">
              {addressSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleAddressSelect(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors duration-150 flex items-center gap-2 border-b border-gray-100 last:border-b-0"
                >
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Country Selection with Flags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country *
          </label>
          <Select
            value={formData.country || ''}
            onChange={(e) => {
              onInputChange('country', e.target.value);
              // Reset state and city when country changes
              onInputChange('state', '');
              onInputChange('city', '');
            }}
            required
            autoComplete="country"
          >
            <option value="">Select Country</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name}
              </option>
            ))}
          </Select>
        </div>

        {/* State Selection (conditional) */}
        {formData.country && ['US', 'CA', 'AU', 'IN', 'DE'].includes(formData.country) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State/Province *
            </label>
            <Input
              type="text"
              value={formData.state || ''}
              onChange={(e) => onInputChange('state', e.target.value)}
              placeholder="Enter State/Province"
              required
              autoComplete="address-level1"
            />
          </div>
        )}

        {/* City Input */}
        {formData.country && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <Input
              type="text"
              value={formData.city || ''}
              onChange={(e) => onInputChange('city', e.target.value)}
              placeholder="Enter your city name"
              required
              autoComplete="address-level2"
              name="city"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneralQuestionsStep;