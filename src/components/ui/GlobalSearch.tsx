import React, { useEffect, useMemo, useRef, useState } from 'react';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface GlobalSearchProps {
  placeholder?: string;
  className?: string;
}

export function GlobalSearch({ placeholder = 'Search…', className = '' }: GlobalSearchProps) {
  const [queryText, setQueryText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [tx, setTx] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [reports, setReports] = useState<Array<{ id: string; title: string; category: string; period: string }>>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load lightweight, recent datasets for quick search
  useEffect(() => {
    const unsubTx = onSnapshot(
      query(collection(db, 'events'), orderBy('createdAt', 'desc'), limit(20)),
      (snap) => setTx(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
    );

    const unsubVendors = onSnapshot(
      query(collection(db, 'vendors'), orderBy('updatedAt', 'desc'), limit(20)),
      (snap) => setVendors(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
    );

    // Mock reports list (can be replaced by a collection)
    setReports([
      { id: 'r1', title: 'Monthly Inspection Summary', category: 'inspections', period: 'Last 30 days' },
      { id: 'r2', title: 'Vendor Performance Analysis', category: 'vendors', period: 'Last 30 days' },
      { id: 'r3', title: 'Blockchain Audit Report', category: 'blockchain', period: 'Last 7 days' },
    ]);

    return () => { unsubTx(); unsubVendors(); };
  }, []);

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const q = queryText.trim().toLowerCase();
  const results = useMemo(() => {
    if (q.length < 2) return { reports: [], vendors: [], tx: [] };
    const r = reports.filter(x =>
      x.title.toLowerCase().includes(q) || x.category.toLowerCase().includes(q)
    ).slice(0, 5);
    const v = vendors.filter(x => {
      const name = String(x.name || x.vendorName || '').toLowerCase();
      const status = String(x.status || '').toLowerCase();
      return name.includes(q) || status.includes(q);
    }).slice(0, 5);
    const t = tx.filter(x => {
      const type = String(x.type || '').toLowerCase();
      const hash = String(x.partHash || x.id || '').toLowerCase();
      return type.includes(q) || hash.includes(q);
    }).slice(0, 5);
    return { reports: r, vendors: v, tx: t };
  }, [q, reports, vendors, tx]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        value={queryText}
        onChange={(e) => { setQueryText(e.target.value); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
        className="w-full pl-10 pr-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-content-light dark:text-content-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        placeholder={placeholder}
      />
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-subtle-light dark:text-subtle-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>

      {isOpen && q.length >= 2 && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark shadow-lg overflow-hidden">
          <div className="max-h-80 overflow-y-auto">
            {/* Reports */}
            <div className="p-3 border-b border-border-light dark:border-border-dark">
              <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark mb-2">Reports</p>
              {results.reports.length ? results.reports.map(r => (
                <div key={r.id} className="flex items-center justify-between p-2 rounded hover:bg-black/5 dark:hover:bg-white/5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground-light dark:text-foreground-dark truncate">{r.title}</p>
                    <p className="text-xs text-subtle-light dark:text-subtle-dark truncate">{r.category} • {r.period}</p>
                  </div>
                  <button
                    onClick={() => {
                      try {
                        window.dispatchEvent(new CustomEvent('vendor-tab-change', { detail: { tab: 'reports' } }));
                      } catch {}
                      setIsOpen(false);
                      setQueryText('');
                    }}
                    className="text-xs text-primary hover:text-primary/80"
                  >
                    Open
                  </button>
                </div>
              )) : <p className="text-xs text-subtle-light dark:text-subtle-dark">No matches</p>}
            </div>

            {/* Vendors */}
            <div className="p-3 border-b border-border-light dark:border-border-dark">
              <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark mb-2">Vendors</p>
              {results.vendors.length ? results.vendors.map(v => (
                <div key={v.id} className="flex items-center justify-between p-2 rounded hover:bg-black/5 dark:hover:bg.white/5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground-light dark:text-foreground-dark truncate">{v.name || v.vendorName || 'Vendor'}</p>
                    <p className="text-xs text-subtle-light dark:text-subtle-dark truncate">{v.status || 'Active'}</p>
                  </div>
                  <button className="text-xs text-primary hover:text-primary/80">View</button>
                </div>
              )) : <p className="text-xs text-subtle-light dark:text-subtle-dark">No matches</p>}
            </div>

            {/* Transactions */}
            <div className="p-3">
              <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark mb-2">Transactions</p>
              {results.tx.length ? results.tx.map(x => (
                <div key={x.id} className="flex items-center justify-between p-2 rounded hover:bg-black/5 dark:hover:bg-white/5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground-light dark:text-foreground-dark truncate">{x.type || 'Transaction'}</p>
                    <p className="text-xs text-subtle-light dark:text-subtle-dark truncate">{x.partHash || x.id}</p>
                  </div>
                  <button className="text-xs text-primary hover:text-primary/80">Open</button>
                </div>
              )) : <p className="text-xs text-subtle-light dark:text-subtle-dark">No matches</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


