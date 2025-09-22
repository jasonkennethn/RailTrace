import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { QrCode, Search, Filter, Eye } from 'lucide-react';
import VendorFooterNav from './VendorFooterNav';

export interface QRActivityItem {
	id: string;
	related?: string;
	lastActivity?: Date | string | number;
	scans?: number;
}

export interface QRActivityListProps {
	items?: QRActivityItem[];
	onView?: (id: string) => void;
	onFilterClick?: () => void;
}

export default function QRActivityList({ items = [], onView, onFilterClick }: QRActivityListProps) {
	return (
		<div className="vendor-scope min-h-screen pb-20" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
			{/* Sticky Header */}
			<header className="sticky top-0 z-10" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
				<div className="px-4 pt-3 pb-2 border-b border-token">
					<div className="flex items-center justify-between gap-2">
						<div className="flex items-center gap-2">
							<div className="h-8 w-8 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
								<QrCode className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
							</div>
							<h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>QR Activity</h1>
						</div>
						<Button variant="outline" size="sm" className="border-token" onClick={onFilterClick}>Filter</Button>
					</div>
					<div className="relative mt-3">
						<input
							type="search"
							placeholder="Search QR ID or Part Type"
							className="w-full rounded-lg border border-token bg-transparent pl-9 pr-3 py-2 text-sm"
							style={{ color: 'var(--color-text-primary)' }}
						/>
						<Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-icon-inactive)' }} />
					</div>
					<div className="flex gap-2 overflow-x-auto py-2">
						<button className="px-4 py-2 text-sm font-medium rounded-full bg-[color:var(--color-primary)]/10" style={{ color: 'var(--color-primary)' }}>All</button>
						<button className="px-4 py-2 text-sm font-medium rounded-full border border-token bg-transparent" style={{ color: 'var(--color-text-secondary)' }}>Scanned</button>
						<button className="px-4 py-2 text-sm font-medium rounded-full border border-token bg-transparent" style={{ color: 'var(--color-text-secondary)' }}>Unscanned</button>
						<button className="px-4 py-2 text-sm font-medium rounded-full border border-token bg-transparent" style={{ color: 'var(--color-text-secondary)' }}>Generated</button>
					</div>
				</div>
			</header>

			<div className="p-4 space-y-3">
				{items.map((it) => (
					<Card key={it.id}>
						<CardContent>
							<div className="flex items-center justify-between gap-3">
								<div className="min-w-0">
									<p className="text-sm font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>QR ID: <span className="font-medium">{it.id}</span></p>
									<p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Associated Part: {it.related || '-'}</p>
									<p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{it.lastActivity ? `Updated: ${new Date(it.lastActivity as any).toLocaleString()}` : '-'}</p>
								</div>
								<Button variant="outline" size="sm" onClick={() => onView?.(it.id)}>
									<Eye className="h-4 w-4" />
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
				{items.length === 0 && (
					<p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>No QR activity found</p>
				)}
			</div>

			<VendorFooterNav active="qr" />
		</div>
	);
}
