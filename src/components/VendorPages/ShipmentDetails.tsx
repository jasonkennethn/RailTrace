import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import VendorFooterNav from './VendorFooterNav';
import { ArrowLeft, Edit } from 'lucide-react';

export interface ShipmentDetailsProps {
	shipmentId: string;
	onBack?: () => void;
}

export default function ShipmentDetails({ shipmentId, onBack }: ShipmentDetailsProps) {
	return (
		<div className="vendor-scope min-h-screen pb-20" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
			{/* Sticky Header */}
			<header className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-token shadow-sm" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
				<Button variant="ghost" size="sm" onClick={onBack} aria-label="Back">
					<ArrowLeft className="h-5 w-5" style={{ color: 'var(--color-text-primary)' }} />
				</Button>
				<h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>#{shipmentId}</h1>
				<Button variant="ghost" size="sm" aria-label="Edit">
					<Edit className="h-5 w-5" style={{ color: 'var(--color-text-primary)' }} />
				</Button>
			</header>

			<main className="p-4 space-y-4">
				{/* Overview */}
				<Card>
					<CardHeader>
						<h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Shipment Overview</h2>
					</CardHeader>
					<CardContent>
						<div className="space-y-3 text-sm">
							<div className="flex justify-between items-center">
								<span className="text-[var(--color-text-secondary)]">Tracking Number</span>
								<span className="font-mono" style={{ color: 'var(--color-text-primary)' }}>#{shipmentId}</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-[var(--color-text-secondary)]">Status</span>
								<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[color:var(--color-primary)]/10" style={{ color: 'var(--color-primary)' }}>In Transit</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-[var(--color-text-secondary)]">Origin</span>
								<span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>—</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-[var(--color-text-secondary)]">Destination</span>
								<span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>—</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-[var(--color-text-secondary)]">Est. Delivery</span>
								<span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>—</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-[var(--color-text-secondary)]">Batch ID</span>
								<span className="font-medium text-[color:var(--color-primary)]">—</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Tracking Timeline */}
				<Card>
					<CardHeader>
						<h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Tracking Timeline</h2>
					</CardHeader>
					<CardContent>
						<div className="relative pl-6">
							<div className="absolute left-[34px] top-2 bottom-2 w-0.5" style={{ backgroundColor: 'var(--color-border)' }} />
							<div className="relative mb-6">
								<div className="absolute left-0 flex items-center justify-center w-8 h-8 rounded-full text-white" style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 0 0 4px var(--color-bg-primary)' }}>•</div>
								<div className="ml-12">
									<p className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>Shipped</p>
									<p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>—</p>
								</div>
							</div>
							<div className="relative mb-6">
								<div className="absolute left-0 flex items-center justify-center w-8 h-8 rounded-full text-white" style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 0 0 4px var(--color-bg-primary)' }}>•</div>
								<div className="ml-12">
									<p className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>In Transit</p>
									<p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>—</p>
								</div>
							</div>
							<div className="relative">
								<div className="absolute left-0 flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--color-text-secondary) 30%, transparent)', boxShadow: '0 0 0 4px var(--color-bg-primary)' }}>•</div>
								<div className="ml-12">
									<p className="font-medium text-sm" style={{ color: 'var(--color-text-secondary)' }}>Delivered</p>
									<p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Pending</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Documents */}
				<Card>
					<CardHeader>
						<h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Attached Documents</h2>
					</CardHeader>
					<CardContent>
						<ul className="space-y-3 text-sm">
							<li className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
								<div className="flex items-center gap-3">
									<div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }}>⎘</div>
									<div>
										<p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Proof of Delivery.pdf</p>
										<p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>—</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Button variant="ghost" size="sm">Preview</Button>
									<Button variant="ghost" size="sm">Download</Button>
								</div>
							</li>
						</ul>
					</CardContent>
				</Card>

				{/* Associated Batches */}
				<Card>
					<CardHeader>
						<h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Associated Batches</h2>
					</CardHeader>
					<CardContent>
						<ul className="space-y-3 text-sm">
							<li className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
								<div className="flex items-center gap-3">
									<div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }}>⌂</div>
									<div>
										<p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>B-xxxxxxxxx</p>
										<p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>—</p>
									</div>
								</div>
								<Button variant="ghost" size="sm">Copy</Button>
							</li>
						</ul>
					</CardContent>
				</Card>

				{/* Comments */}
				<Card>
					<CardHeader>
						<h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Comments / Notes</h2>
					</CardHeader>
					<CardContent>
						<div className="flex items-end gap-2">
							<textarea className="flex-1 h-24 rounded-lg border border-token bg-transparent p-3 text-sm" placeholder="Add internal notes..." style={{ color: 'var(--color-text-primary)' }} />
							<Button className="h-10 px-4">Add</Button>
						</div>
					</CardContent>
				</Card>
			</main>

			<VendorFooterNav active="shipments" />
		</div>
	);
}
