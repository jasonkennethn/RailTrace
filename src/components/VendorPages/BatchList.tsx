import { useMemo } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CopyButton } from '../ui/CopyButton';
import { Filter, Search, Eye, Package, CheckCircle, Clock, Truck } from 'lucide-react';
import VendorFooterNav from './VendorFooterNav';

type BatchStatus = 'manufacturing' | 'ready' | 'shipped' | 'delivered';

export interface VendorBatch {
	id: string;
	batchNumber: string;
	fittingType: string;
	quantity: number;
	status: BatchStatus;
	createdAt?: Date | string | number;
	expectedDelivery?: Date | string | number;
}

export interface BatchListProps {
	batches?: VendorBatch[];
	onViewBatch?: (batchId: string) => void;
	onFilterClick?: () => void;
}

const truncateId = (value: string, start: number = 5, end: number = 4) => {
	if (!value) return '';
	return value.length <= start + end ? value : `${value.slice(0, start)}…${value.slice(-end)}`;
};

const statusPill = (status: BatchStatus) => {
	switch (status) {
		case 'manufacturing':
			return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
		case 'ready':
			return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
		case 'shipped':
			return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
		case 'delivered':
			return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
		default:
			return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
	}
};

const statusIcon = (status: BatchStatus) => {
	switch (status) {
		case 'manufacturing':
			return <Clock className="h-4 w-4" />;
		case 'ready':
			return <CheckCircle className="h-4 w-4" />;
		case 'shipped':
			return <Truck className="h-4 w-4" />;
		case 'delivered':
			return <CheckCircle className="h-4 w-4" />;
		default:
			return <Clock className="h-4 w-4" />;
	}
};

export default function BatchList({ batches = [], onViewBatch, onFilterClick }: BatchListProps) {
	const countByStatus = useMemo(() => {
		return batches.reduce(
			(acc, b) => {
				acc[b.status] = (acc[b.status] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		);
	}, [batches]);

	return (
		<div className="vendor-scope min-h-screen pb-20" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
			{/* Sticky Header + Filters */}
			<header className="sticky top-0 z-10" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
				<div className="px-4 pt-3 pb-2 border-b border-token">
					<div className="flex items-center justify-between gap-2">
						<div className="flex items-center gap-2">
							<div className="h-8 w-8 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
								<Package className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
							</div>
							<h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Recent Batches</h1>
						</div>
						<Button variant="outline" size="sm" className="border-token" onClick={onFilterClick}>Filter</Button>
					</div>
					<div className="relative mt-3">
						<input
							type="search"
							placeholder="Search by Batch Number or Fitting Type"
							className="w-full rounded-full border border-token bg-transparent pl-10 pr-4 py-3 text-sm"
							style={{ color: 'var(--color-text-primary)' }}
						/>
						<Search className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-icon-inactive)' }} />
					</div>
					<div className="flex gap-2 overflow-x-auto py-2">
						<button className="whitespace-nowrap rounded-full bg-[color:var(--color-primary)]/10 px-4 py-2 text-sm font-medium" style={{ color: 'var(--color-primary)' }}>All</button>
						<button className="whitespace-nowrap rounded-full border border-token bg-transparent px-4 py-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Pending</button>
						<button className="whitespace-nowrap rounded-full border border-token bg-transparent px-4 py-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Completed</button>
						<button className="whitespace-nowrap rounded-full border border-token bg-transparent px-4 py-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>In Progress</button>
					</div>
				</div>
			</header>

			<div className="p-4 space-y-3">
				{/* Status Summary */}
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
					{(['manufacturing','ready','shipped','delivered'] as BatchStatus[]).map((s) => (
						<div key={s} className="rounded-lg border border-token p-2" style={{ backgroundColor: 'var(--color-card)' }}>
							<p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{s.replace('_',' ')}</p>
							<p className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{countByStatus[s] || 0}</p>
						</div>
					))}
				</div>

				{/* List */}
				<div className="space-y-3">
					{batches.map((batch) => (
						<Card key={batch.id}>
							<CardContent>
								<div className="flex items-start justify-between gap-3">
									<div className="flex-1 min-w-0">
										<p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{batch.batchNumber}</p>
										<p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{batch.fittingType}</p>
										<p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>Quantity: {batch.quantity}</p>
									</div>
									<div className="flex flex-col items-end shrink-0">
										<Badge className={statusPill(batch.status)}>
											<span className="flex items-center gap-1 capitalize">{statusIcon(batch.status)} {batch.status.replace('_',' ')}</span>
										</Badge>
										<p className="mt-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>{batch.createdAt ? `Created: ${new Date(batch.createdAt).toLocaleDateString()}` : `Expected: ${batch.expectedDelivery ? new Date(batch.expectedDelivery).toLocaleDateString() : '-'}`}</p>
									</div>
								</div>
								<div className="mt-3 flex justify-end gap-2 border-t border-token pt-3">
									<Button variant="outline" size="sm" onClick={() => onViewBatch?.(batch.id)}>View Details</Button>
									<Button variant="outline" size="sm"><CopyButton value={batch.batchNumber} /></Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>

			<VendorFooterNav active="batches" />
		</div>
	);
}
