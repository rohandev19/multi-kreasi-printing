import React, { useState, useEffect } from 'react';
import api from '../api/axios';

interface WidgetPreference {
  layoutOrder: string[];
  enabledWidgets: string[];
}

interface DashboardCustomizationProps {
  isOpen: boolean;
  onClose: () => void;
  availableWidgets: { id: string; title: string }[];
  onSaved: () => void;
}

export const DashboardCustomization: React.FC<DashboardCustomizationProps> = ({
  isOpen,
  onClose,
  availableWidgets,
  onSaved,
}) => {
  const [preferences, setPreferences] = useState<WidgetPreference>({
    layoutOrder: [],
    enabledWidgets: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPreferences();
      setSuccess(false);
      setError('');
    }
  }, [isOpen]);

  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const response = await api.get('/v1/dashboard/preferences');
      setPreferences({
        layoutOrder: response.data.layoutOrder || [],
        enabledWidgets: response.data.enabledWidgets || [],
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWidget = (widgetId: string) => {
    setPreferences((prev) => {
      const isEnabled = prev.enabledWidgets.includes(widgetId);
      if (isEnabled) {
        return {
          ...prev,
          enabledWidgets: prev.enabledWidgets.filter((id) => id !== widgetId),
        };
      } else {
        return {
          ...prev,
          enabledWidgets: [...prev.enabledWidgets, widgetId],
        };
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await api.patch('/v1/dashboard/preferences', {
        layoutOrder: preferences.layoutOrder,
        enabledWidgets: preferences.enabledWidgets,
      });
      setSuccess(true);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">Customize Dashboard</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-emerald-50 text-emerald-600 p-3 rounded-lg text-sm">
              Preferences saved successfully!
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-500 mb-2">
                Select which widgets you want to see on your dashboard.
              </p>
              
              <div className="space-y-2">
                {availableWidgets.map((widget) => {
                  const isEnabled = preferences.enabledWidgets.includes(widget.id) || 
                                    preferences.enabledWidgets.length === 0; // If empty, assume all enabled or default
                  
                  return (
                    <label
                      key={widget.id}
                      className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => handleToggleWidget(widget.id)}
                        className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="ml-3 font-medium text-slate-700">
                        {widget.title}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};
