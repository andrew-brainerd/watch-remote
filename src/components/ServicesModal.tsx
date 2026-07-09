import { useEffect, useState } from 'react';
import { updateWatchSettings } from '@/api/watchApi';
import { useServicesStore } from '@/stores/servicesStore';
import { usePrefsStore } from '@/stores/prefsStore';

interface ServicesModalProps {
  open: boolean;
  current: string[];
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}

export const ServicesModal = ({ open, current, onClose, onSaved }: ServicesModalProps) => {
  const catalog = useServicesStore(s => s.catalog);
  const loadCatalog = useServicesStore(s => s.load);
  const hideOwnedAddons = usePrefsStore(s => s.hideOwnedAddons);
  const setHideOwnedAddons = usePrefsStore(s => s.setHideOwnedAddons);
  const [selected, setSelected] = useState<Set<string>>(new Set(current));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelected(new Set(current));
    loadCatalog();
  }, [open, current, loadCatalog]);

  if (!open) return null;

  const toggle = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const save = async () => {
    setSaving(true);
    try {
      await updateWatchSettings([...selected]);
      await onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-xl border border-line bg-panel p-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-neutral-100">My streaming services</h3>
        <p className="mt-1 text-xs text-neutral-500">Casting prefers a title on one of these.</p>

        {catalog.length === 0 ? (
          <p className="mt-3 text-xs text-neutral-500">Loading…</p>
        ) : (
          <div className="mt-3 grid max-h-64 grid-cols-2 gap-1 overflow-y-auto">
            {catalog.map(service => {
              const on = selected.has(service.id);
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => toggle(service.id)}
                  className={`truncate rounded border px-2 py-1 text-left text-xs transition-colors ${
                    on ? 'border-accent bg-accent/20 text-white' : 'border-line bg-panel-2 text-neutral-300'
                  }`}
                >
                  {service.name}
                </button>
              );
            })}
          </div>
        )}

        <label className="mt-4 flex items-start gap-2 text-xs text-neutral-300">
          <input
            type="checkbox"
            checked={hideOwnedAddons}
            onChange={e => setHideOwnedAddons(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
          />
          <span>
            Hide add-on options for services I already have
            <span className="mt-0.5 block text-[11px] text-neutral-500">
              e.g. skip Prime&rsquo;s Crunchyroll add-on if you subscribe to Crunchyroll directly
            </span>
          </span>
        </label>

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded px-3 py-1.5 text-xs text-neutral-400 hover:text-white">
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded bg-accent px-3 py-1.5 text-xs text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
