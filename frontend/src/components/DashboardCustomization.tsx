import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DotsSixVertical } from '@phosphor-icons/react';

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

// Sortable item component
const SortableWidgetItem = ({
  id,
  title,
  isEnabled,
  onToggle,
}: {
  id: string;
  title: string;
  isEnabled: boolean;
  onToggle: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      className="mb-2 flex items-center border p-3 transition-colors duration-150"
      style={{
        ...style,
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        zIndex: isDragging ? 10 : 1,
        boxShadow: isDragging ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      }}
    >
      <div
        {...attributes}
        {...listeners}
        className="mr-3 cursor-grab focus:outline-none"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <DotsSixVertical size={20} weight="regular" />
      </div>
      <label className="flex items-center flex-1 cursor-pointer">
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={() => onToggle(id)}
          className="h-5 w-5 rounded border"
          style={{ borderColor: 'var(--border-default)', accentColor: 'var(--color-primary-600)' }}
        />
        <span className="ml-3 font-medium" style={{ color: 'var(--text-primary)' }}>{title}</span>
      </label>
    </div>
  );
};

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
  const [orderedWidgets, setOrderedWidgets] = useState<{ id: string; title: string }[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchPreferences = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/v1/dashboard/preferences');
        
        const layoutOrder = response.data.layoutOrder || [];
        const enabledWidgets = response.data.enabledWidgets || [];
        
        setPreferences({ layoutOrder, enabledWidgets });

        // Build initial ordered list
        let initialOrder = [...availableWidgets];
        if (layoutOrder.length > 0) {
          // Sort available widgets based on layoutOrder
          initialOrder.sort((a, b) => {
            const indexA = layoutOrder.indexOf(a.id);
            const indexB = layoutOrder.indexOf(b.id);
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          });
        }
        setOrderedWidgets(initialOrder);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load preferences');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchPreferences();
      setSuccess(false);
      setError('');
    }
  }, [isOpen, availableWidgets]);

  const handleToggleWidget = (widgetId: string) => {
    setPreferences((prev) => {
      // If empty array, assume all enabled, then we initialize it with all other widgets except this one
      let currentEnabled = prev.enabledWidgets;
      if (currentEnabled.length === 0) {
        currentEnabled = availableWidgets.map(w => w.id);
      }
      
      const isEnabled = currentEnabled.includes(widgetId);
      if (isEnabled) {
        return {
          ...prev,
          enabledWidgets: currentEnabled.filter((id) => id !== widgetId),
        };
      } else {
        return {
          ...prev,
          enabledWidgets: [...currentEnabled, widgetId],
        };
      }
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setOrderedWidgets((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Update layoutOrder in preferences state
        setPreferences(prev => ({
          ...prev,
          layoutOrder: newOrder.map(w => w.id)
        }));
        
        return newOrder;
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);
    
    // Ensure we save the latest order even if user didn't drag anything but opened it for the first time
    const currentOrder = preferences.layoutOrder.length > 0 
      ? preferences.layoutOrder 
      : orderedWidgets.map(w => w.id);
      
    try {
      await api.patch('/api/v1/dashboard/preferences', {
        layoutOrder: currentOrder,
        enabledWidgets: preferences.enabledWidgets.length === 0 ? availableWidgets.map(w => w.id) : preferences.enabledWidgets,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-overlay)', backdropFilter: 'blur(8px)' }}>
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-lg border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-md)' }}>
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ backgroundColor: 'var(--color-neutral-50)', borderColor: 'var(--border-default)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Customize Dashboard</h2>
          <button
            onClick={onClose}
            className="transition-colors duration-150 hover:text-[var(--text-primary)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 rounded-lg p-3 text-sm" style={{ backgroundColor: 'var(--color-error-50)', color: 'var(--color-error-700)' }}>
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 rounded-lg p-3 text-sm" style={{ backgroundColor: 'var(--color-success-50)', color: 'var(--color-success-700)' }}>
              Preferences saved successfully!
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2" style={{ borderColor: 'var(--color-primary-600)' }}></div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="mb-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Drag to reorder widgets, or check/uncheck to show/hide them on your dashboard.
              </p>
              
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={orderedWidgets.map(w => w.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-1">
                    {orderedWidgets.map((widget) => {
                      const isEnabled = preferences.enabledWidgets.includes(widget.id) || 
                                        preferences.enabledWidgets.length === 0;
                      
                      return (
                        <SortableWidgetItem
                          key={widget.id}
                          id={widget.id}
                          title={widget.title}
                          isEnabled={isEnabled}
                          onToggle={handleToggleWidget}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
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
