import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { CopyButton } from '../ui/CopyButton';
import VendorFooterNav from './VendorFooterNav';
import { ArrowLeft } from 'lucide-react';

export interface QRActivityDetailsProps {
	qrId: string;
	onBack?: () => void;
}

const truncate = (v: string) => (v && v.length > 10 ? `${v.slice(0, 5)}…${v.slice(-4)}` : v);

export default function QRActivityDetails({ qrId, onBack }: QRActivityDetailsProps) {
	return (
		<div className="vendor-scope min-h-screen pb-20" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
			{/* Sticky Header */}
			<header className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-token shadow-sm" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
				<Button variant="ghost" size="sm" onClick={onBack} aria-label="Back">
					<ArrowLeft className="h-5 w-5" style={{ color: 'var(--color-text-primary)' }} />
				</Button>
				<h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>QR ID: {truncate(qrId)}</h1>
				<div className="w-9" />
			</header>

			<main className="p-4 space-y-4">
				{/* Overview */}
				<Card>
					<CardHeader>
						<h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>QR Overview</h2>
					</CardHeader>
					<CardContent>
						<div className="space-y-3 text-sm">
							<div className="flex justify-between items-center">
								<span className="text-[var(--color-text-secondary)]">Associated Part ID</span>
								<span className="font-mono" style={{ color: 'var(--color-text-primary)' }}>—</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-[var(--color-text-secondary)]">Status</span>
								<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[color:var(--color-primary)]/10" style={{ color: 'var(--color-primary)' }}>Active</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-[var(--color-text-secondary)]">Generated Date</span>
								<span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>—</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-[var(--color-text-secondary)]">Last Scanned</span>
								<span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>—</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-[var(--color-text-secondary)]">Generation Location</span>
								<span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>—</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Activity Log */}
				<Card>
					<CardHeader>
						<h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Activity Log</h2>
					</CardHeader>
					<CardContent>
						<div className="relative space-y-6">
							<div className="absolute left-5 top-5 bottom-5 w-0.5" style={{ backgroundColor: 'var(--color-border)' }} />
							<div className="relative flex items-start">
								<div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>QR</div>
								<div className="ml-4">
									<p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Generated</p>
									<p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>—</p>
								</div>
							</div>
							<div className="relative flex items-start">
								<div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>•</div>
								<div className="ml-4">
									<p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Scanned</p>
									<p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>—</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Associated Part Details */}
				<Card>
					<CardHeader>
						<h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Associated Part Details</h2>
					</CardHeader>
					<CardContent>
						<div className="space-y-3 text-sm">
							<div className="flex justify-between items-center"><span className="text-[var(--color-text-secondary)]">Part Type</span><span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>—</span></div>
							<div className="flex justify-between items-center"><span className="text-[var(--color-text-secondary)]">Condition</span><span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>—</span></div>
							<div className="flex justify-between items-center"><span className="text-[var(--color-text-secondary)]">Warranty Expiry</span><span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>—</span></div>
							<div className="flex justify-between items-center"><span className="text-[var(--color-text-secondary)]">Vendor ID</span><span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>—</span></div>
							<div className="flex justify-between items-center"><span className="text-[var(--color-text-secondary)]">Current Location</span><span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>—</span></div>
						</div>
						<Button className="mt-4 w-full" variant="outline">View Full Part Details</Button>
					</CardContent>
				</Card>

				{/* Attached Documents */}
				<Card>
					<CardHeader>
						<h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Attached Documents</h2>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
								<div className="flex items-center gap-4">
									<div className="flex items-center justify-center w-10 h-10 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }}>⎘</div>
									<div>
										<p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Part_Certificate.pdf</p>
										<p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>—</p>
									</div>
								</div>
								<Button variant="ghost" size="sm">Download</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Comments */}
				<Card>
					<CardHeader>
						<h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Comments/Notes</h2>
					</CardHeader>
					<CardContent>
						<div className="flex items-end gap-2">
							<input className="flex-1 h-12 rounded-lg border border-token bg-transparent px-4 text-sm" placeholder="Add a note..." style={{ color: 'var(--color-text-primary)' }} />
							<Button className="h-12 px-4">Add Note</Button>
						</div>
					</CardContent>
				</Card>
			</main>

			<VendorFooterNav active="qr" />
		</div>
	);
}
