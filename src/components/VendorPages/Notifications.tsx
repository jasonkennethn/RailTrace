import { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Bell, Filter, Search, Check } from 'lucide-react';
import VendorFooterNav from './VendorFooterNav';

export interface VendorNotification {
	id: string;
	title: string;
	message: string;
	type: 'inspection' | 'anomaly' | 'review' | 'system';
	priority?: 'low' | 'medium' | 'high';
	read?: boolean;
	createdAt?: Date | string | number;
}

export interface NotificationsProps {
	items?: VendorNotification[];
	onMarkRead?: (id: string) => void;
	onFilterClick?: () => void;
}

export default function Notifications({ items = [], onMarkRead, onFilterClick }: NotificationsProps) {
	const grouped = useMemo(() => {
		return items.reduce((acc, n) => {
			const day = n.createdAt ? new Date(n.createdAt as any).toDateString() : 'Unknown';
			(acc[day] = acc[day] || []).push(n);
			return acc;
		}, {} as Record<string, VendorNotification[]>);
	}, [items]);

	const typeColor = (t: VendorNotification['type']) => {
		switch (t) {
			case 'inspection': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
			case 'anomaly': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
			case 'review': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400';
			default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
		}
	};

	return (
		<div className="vendor-scope min-h-screen pb-20" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
			{/* Sticky Header */}
			<header className="sticky top-0 z-10" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
				<div className="px-4 pt-3 pb-2 border-b border-token">
					<div className="flex items-center justify-between gap-2">
						<div className="flex items-center gap-2">
							<Bell className="h-5 w-5" />
							<h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Notifications</h1>
						</div>
						<Button variant="outline" size="sm" className="border-token" onClick={onFilterClick}>Filter</Button>
					</div>
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 mt-3">
						<div className="rounded-xl border border-token p-4" style={{ backgroundColor: 'var(--color-card)' }}>
							<p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Total</p>
							<p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{items.length}</p>
						</div>
						<div className="rounded-xl border border-token p-4" style={{ backgroundColor: 'var(--color-card)' }}>
							<p className="text-sm" style={{ color: 'var(--color-primary)' }}>Unread</p>
							<p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{items.filter(i => !i.read).length}</p>
						</div>
						<div className="rounded-xl border border-token p-4" style={{ backgroundColor: 'var(--color-card)' }}>
							<p className="text-sm" style={{ color: '#ef4444' }}>Critical</p>
							<p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{items.filter(i => i.priority === 'high').length}</p>
						</div>
					</div>
					<div className="sticky top-[73px] z-10 -mt-4 pt-2" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
						<div className="space-y-3">
							<div className="relative">
								<input
									type="search"
									placeholder="Search notifications..."
									className="w-full rounded-full border border-token bg-transparent pl-12 pr-4 py-3 text-sm"
									style={{ color: 'var(--color-text-primary)' }}
								/>
								<Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-icon-inactive)' }} />
							</div>
							<div className="flex gap-2 overflow-x-auto pb-2 -mb-2">
								<button className="flex-shrink-0 rounded-full border border-token bg-[color:var(--color-primary)]/10 px-4 py-2 text-sm font-medium" style={{ color: 'var(--color-primary)' }}>All</button>
								<button className="flex-shrink-0 rounded-full border border-token bg-transparent px-4 py-2 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>System</button>
								<button className="flex-shrink-0 rounded-full border border-token bg-transparent px-4 py-2 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Batch</button>
								<button className="flex-shrink-0 rounded-full border border-token bg-transparent px-4 py-2 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Shipment</button>
								<button className="flex-shrink-0 rounded-full border border-token bg-transparent px-4 py-2 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Alert</button>
								<button className="flex-shrink-0 rounded-full border border-token bg-transparent px-4 py-2 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Unread</button>
							</div>
						</div>
					</div>
				</div>
			</header>

			<div className="p-4 space-y-4">
				{Object.entries(grouped).map(([day, list]) => (
					<div key={day} className="space-y-2">
						<p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{day}</p>
						{list.map((n) => (
							<Card key={n.id}>
								<CardContent>
									<div className="flex items-start justify-between gap-4">
										<div className="min-w-0">
											<div className="flex items-center gap-2">
												<Badge className={typeColor(n.type)}>{n.type}</Badge>
												{!n.read && <span className="h-3 w-3 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />}
											</div>
											<p className="font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{n.title}</p>
											<p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{n.message}</p>
										</div>
										<div className="shrink-0 flex items-center gap-2">
											<p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{n.createdAt ? new Date(n.createdAt as any).toLocaleString() : ''}</p>
											{!n.read && (
												<Button variant="outline" size="sm" onClick={() => onMarkRead?.(n.id)}>
													<Check className="h-4 w-4 mr-1" /> Mark read
												</Button>
											)}
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				))}
			</div>

			<VendorFooterNav active="alerts" />
		</div>
	);
}
