import React, { useState } from 'react';
import { Coordinates } from '../types';
import { SAMPLE_ADDRESS_PRESETS, resolveSingaporeAddress } from '../data/singaporePostalData';
import { Search, MapPin, Compass, CheckCircle2, AlertCircle } from 'lucide-react';

interface AddressBarProps {
  currentAddress: string;
  postalCode: string;
  coords: Coordinates;
  planningArea: string;
  onAddressResolved: (address: string, postalCode: string, coords: Coordinates, area: string) => void;
}

export const AddressBar: React.FC<AddressBarProps> = ({
  currentAddress,
  postalCode,
  coords,
  planningArea,
  onAddressResolved,
}) => {
  const [inputValue, setInputValue] = useState(postalCode || currentAddress || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const query = inputValue.trim();
    if (!query) {
      setErrorMsg('Please enter a 6-digit Singapore postal code or street address.');
      return;
    }

    const resolved = resolveSingaporeAddress(query);
    // Extract postal code if present
    const postalMatch = query.match(/\b\d{6}\b/);
    const resolvedPostal = postalMatch ? postalMatch[0] : (query.length === 6 && /^\d+$/.test(query)) ? query : '';

    onAddressResolved(resolved.formattedAddress, resolvedPostal, resolved.coords, resolved.planningArea);
  };

  const handlePresetSelect = (presetName: string) => {
    const preset = SAMPLE_ADDRESS_PRESETS.find((p) => p.name === presetName);
    if (preset) {
      setInputValue(preset.postalCode);
      setErrorMsg(null);
      onAddressResolved(preset.address, preset.postalCode, preset.coords, preset.area);
    }
  };

  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Verify if within Singapore rough bounding box
        if (userLat >= 1.20 && userLat <= 1.48 && userLng >= 103.60 && userLng <= 104.05) {
          onAddressResolved(
            'Current Device Location (Singapore)',
            '',
            { lat: userLat, lng: userLng },
            'Detected Location'
          );
          setInputValue('Current Device Location');
        } else {
          // If user is outside SG, fallback gracefully with prompt
          setErrorMsg('Device location is outside Singapore. Falling back to Bishan Central.');
          const fallback = resolveSingaporeAddress('570123');
          onAddressResolved('Bishan Central (Default SG Hub)', '570123', fallback.coords, fallback.planningArea);
        }
      },
      () => {
        setIsLocating(false);
        // Common in iframe or when permission denied
        setErrorMsg('Location access was denied or unavailable. You can enter any 6-digit SG postal code below.');
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            Home Residential Address & Distance Origin
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            MOE Home-School Distance (HSD) calculates priority based on distance from your home to the school boundary.
          </p>
        </div>

        {/* Current Active Location Tag */}
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 self-start md:self-auto">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="font-medium text-slate-800">{planningArea}</span>
          <span className="text-slate-300">·</span>
          <span className="font-mono text-slate-500">
            {coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E
          </span>
        </div>
      </div>

      {/* Input Search Form */}
      <form onSubmit={handleSearch} className="mt-4 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter 6-digit Singapore Postal Code (e.g. 570220) or address..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 active:scale-[0.99] transition-all whitespace-nowrap shadow-sm"
          >
            Calculate Distance
          </button>

          <button
            type="button"
            onClick={handleUseGeolocation}
            disabled={isLocating}
            title="Detect GPS location"
            className="px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-[0.99] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap border border-slate-200"
          >
            <Compass className={`w-4 h-4 ${isLocating ? 'animate-spin text-slate-900' : 'text-slate-600'}`} />
            <span className="hidden sm:inline">{isLocating ? 'Locating...' : 'GPS'}</span>
          </button>
        </div>
      </form>

      {/* Error / Alert notice */}
      {errorMsg && (
        <div className="mt-2.5 flex items-center gap-2 text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Quick Location Presets for fast testing */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center flex-wrap gap-1.5">
        <span className="text-xs font-medium text-slate-400 mr-1">Quick Presets:</span>
        {SAMPLE_ADDRESS_PRESETS.map((preset) => {
          const isSelected = postalCode === preset.postalCode || currentAddress.includes(preset.area);
          return (
            <button
              key={preset.name}
              type="button"
              onClick={() => handlePresetSelect(preset.name)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                isSelected
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {preset.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
