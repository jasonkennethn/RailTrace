import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import VendorFooterNav from './VendorFooterNav';

export interface MyProfileProps {
  initial?: { name?: string; email?: string; phone?: string };
  company?: { name?: string; gst?: string };
  onSave?: (data: { name?: string; email?: string; phone?: string }) => void;
}

export default function MyProfile({ initial, company, onSave }: MyProfileProps) {
  const [form, setForm] = useState({ name: initial?.name || '', email: initial?.email || '', phone: initial?.phone || '' });
  const [dirty, setDirty] = useState(false);

  const update = (k: keyof typeof form, v: string) => { setForm({ ...form, [k]: v }); setDirty(true); };

  return (
    <div className="vendor-scope min-h-screen pb-20" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>Basic Info</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="block mb-1" style={{ color: 'var(--color-text-secondary)' }}>Name</span>
                <input className="w-full rounded-lg border border-token bg-transparent px-3 py-2"
                  value={form.name} onChange={(e) => update('name', e.target.value)} />
              </label>
              <label className="text-sm">
                <span className="block mb-1" style={{ color: 'var(--color-text-secondary)' }}>Email</span>
                <input className="w-full rounded-lg border border-token bg-transparent px-3 py-2"
                  value={form.email} onChange={(e) => update('email', e.target.value)} />
              </label>
              <label className="text-sm">
                <span className="block mb-1" style={{ color: 'var(--color-text-secondary)' }}>Phone</span>
                <input className="w-full rounded-lg border border-token bg-transparent px-3 py-2"
                  value={form.phone} onChange={(e) => update('phone', e.target.value)} />
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>Company Info</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Company</p>
                <p>{company?.name || '-'}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>GST</p>
                <p>{company?.gst || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>Documents</h3>
          </CardHeader>
          <CardContent>
            <div className="text-sm">Upload and manage documents here.</div>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-3 border-t" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        <div className="max-w-7xl mx-auto flex justify-end">
          <Button disabled={!dirty} onClick={() => { onSave?.(form); setDirty(false); }}>Save Changes</Button>
        </div>
      </div>

      <VendorFooterNav active="profile" />
    </div>
  );
}
