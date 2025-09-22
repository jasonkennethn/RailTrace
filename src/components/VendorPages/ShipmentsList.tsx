import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CopyButton } from '../ui/CopyButton';
import { Filter, Search, Eye, Truck, CheckCircle, Clock } from 'lucide-react';
import VendorFooterNav from './VendorFooterNav';

export type ShipmentStatus = 'pending' | 'in_transit' | 'delivered';

export interface VendorShipment {
	id: string;
	batchId: string;
	destination: string;
	status: ShipmentStatus;
	trackingNumber: string;
	createdAt?: Date | string | number;
}

export interface ShipmentsListProps {
	shipments?: VendorShipment[];
	onViewShipment?: (shipmentId: string) => void;
	onFilterClick?: () => void;
}

const truncateId = (value: string, start: number = 5, end: number = 4) => {
	if (!value) return '';
	return value.length <= start + end ? value : `${value.slice(0, start)}…${value.slice(-end)}`;
};

const statusPill = (status: ShipmentStatus) => {
	switch (status) {
		case 'pending':
			return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
		case 'in_transit':
			return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
		case 'delivered':
			return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
		default:
			return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
	}
};

const statusIcon = (status: ShipmentStatus) => {
	switch (status) {
		case 'pending':
			return <Clock className="h-4 w-4" />;
		case 'in_transit':
			return <Truck className="h-4 w-4" />;
		case 'delivered':
			return <CheckCircle className="h-4 w-4" />;
		default:
			return <Clock className="h-4 w-4" />;
	}
};

export default function ShipmentsList({ shipments = [], onViewShipment, onFilterClick }: ShipmentsListProps) {
	return (
		<div className="vendor-scope min-h-screen pb-20" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
			{/* Sticky Header with search and filter chips */}
			<header className="sticky top-0 z-10" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
				<div className="px-4 pt-3 pb-2 border-b border-token">
					<div className="flex items-center justify-between gap-2">
						<h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Recent Shipments</h1>
						<Button variant="outline" size="sm" className="border-token" onClick={onFilterClick}>Filter</Button>
					</div>
					<div className="relative mt-3">
						<input
							type="search"
							placeholder="Search by tracking number or batch ID"
							className="w-full rounded-full border border-token bg-transparent pl-10 pr-4 py-3 text-sm"
							style={{ color: 'var(--color-text-primary)' }}
						/>
						<Search className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-icon-inactive)' }} />
					</div>
					<div className="flex gap-2 overflow-x-auto py-2">
						<button className="whitespace-nowrap rounded-full bg-[color:var(--color-primary)]/10 px-4 py-2 text-sm font-medium" style={{ color: 'var(--color-primary)' }}>All</button>
						<button className="whitespace-nowrap rounded-full border border-token bg-transparent px-4 py-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>In Transit</button>
						<button className="whitespace-nowrap rounded-full border border-token bg-transparent px-4 py-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Delivered</button>
						<button className="whitespace-nowrap rounded-full border border-token bg-transparent px-4 py-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Delayed</button>
					</div>
				</div>
			</header>

			<div className="p-4 space-y-3">
				{shipments.map((s) => (
					<Card key={s.id}>
						<CardContent>
							<div className="flex items-center justify-between gap-3">
								<div className="min-w-0">
									<p className="font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{s.destination}</p>
									<p className="text-sm flex items-center gap-2">
										<span className="font-mono" style={{ color: 'var(--color-text-secondary)' }}>{truncateId(s.trackingNumber)}</span>
										<CopyButton value={s.trackingNumber} />
										<span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Batch: {truncateId(s.batchId)}</span>
									</p>
									<p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Created: {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '-'}</p>
								</div>
								<div className="flex items-center gap-2 shrink-0">
									<Badge className={statusPill(s.status)}>
										<span className="flex items-center gap-1 capitalize">{statusIcon(s.status)} {s.status.replace('_',' ')}</span>
									</Badge>
									<Button variant="outline" size="sm" onClick={() => onViewShipment?.(s.id)}>
										<Eye className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<VendorFooterNav active="shipments" />
		</div>
	);
}
