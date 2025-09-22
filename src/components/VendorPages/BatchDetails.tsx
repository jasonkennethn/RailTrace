import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CopyButton } from '../ui/CopyButton';
import VendorFooterNav from './VendorFooterNav';
import { ChevronDown, ChevronUp, Package, FileText, Image, MessagesSquare, ArrowLeft, Edit } from 'lucide-react';

export interface BatchDetailsProps {
	batchId: string;
	onBack?: () => void;
}

const Section: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; }>
= ({ title, icon, children, defaultOpen = true }) => {
	const [open, setOpen] = useState(defaultOpen);
	return (
		<Card>
			<CardHeader>
				<button className="w-full flex items-center justify-between" onClick={() => setOpen(!open)}>
					<div className="flex items-center gap-2">
						{icon}
						<h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
					</div>
					{open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
				</button>
			</CardHeader>
			{open && <CardContent>{children}</CardContent>}
		</Card>
	);
};

export default function BatchDetails({ batchId, onBack }: BatchDetailsProps) {
	return (
		<div className="vendor-scope min-h-screen pb-20" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
			{/* Sticky Header */}
			<header className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-token shadow-sm" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
				<Button variant="ghost" size="sm" onClick={onBack} aria-label="Back">
					<ArrowLeft className="h-5 w-5" style={{ color: 'var(--color-text-primary)' }} />
				</Button>
				<h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Batch #{batchId}</h1>
				<Button variant="ghost" size="sm" aria-label="Edit Batch">
					<Edit className="h-5 w-5" style={{ color: 'var(--color-text-primary)' }} />
				</Button>
			</header>

			<main className="p-4 space-y-4">
				{/* Overview */}
				<Card>
					<CardHeader>
						<h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Batch Overview</h2>
					</CardHeader>
					<CardContent>
						<div className="space-y-3 text-sm">
							<div className="flex justify-between">
								<span className="text-[var(--color-text-secondary)]">Batch Number</span>
								<span className="font-mono" style={{ color: 'var(--color-text-primary)' }}>
									{batchId} <CopyButton value={batchId} />
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-[var(--color-text-secondary)]">Fitting Type</span>
								<span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>—</span>
							</div>
							<div className="flex justify-between">
								<span className="text-[var(--color-text-secondary)]">Quantity</span>
								<span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>—</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-[var(--color-text-secondary)]">Status</span>
								<Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Ready</Badge>
							</div>
							<div className="flex justify-between">
								<span className="text-[var(--color-text-secondary)]">Created Date</span>
								<span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>—</span>
							</div>
							<div className="flex justify-between">
								<span className="text-[var(--color-text-secondary)]">Expected Delivery</span>
								<span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>—</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Progress Timeline */}
				<Card>
					<CardHeader>
						<h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Batch Progress Timeline</h2>
					</CardHeader>
					<CardContent>
						<ol className="relative pl-6 space-y-4">
							<div className="absolute left-0 top-0 h-full border-l-2 border-dashed" style={{ borderColor: 'var(--color-border)' }} />
							<li className="relative">
								<div className="absolute left-[-2.05rem] top-1.5 flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 0 0 4px var(--color-bg-primary)' }} />
								<p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Created</p>
								<p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>—</p>
							</li>
							<li className="relative">
								<div className="absolute left-[-2.05rem] top-1.5 flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 0 0 4px var(--color-bg-primary)' }} />
								<p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>In Production</p>
								<p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>—</p>
							</li>
							<li className="relative">
								<div className="absolute left-[-2.05rem] top-1.5 flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 0 0 4px var(--color-bg-primary)' }} />
								<p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Shipped</p>
								<p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>—</p>
							</li>
							<li className="relative">
								<div className="absolute left-[-2.05rem] top-1.5 flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600" style={{ boxShadow: '0 0 0 4px var(--color-bg-primary)' }} />
								<p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Delivered</p>
								<p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Pending</p>
							</li>
						</ol>
					</CardContent>
				</Card>

				{/* Documents */}
				<Card>
					<CardHeader>
						<h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Attached Documents</h2>
					</CardHeader>
					<CardContent>
						<div className="space-y-3 text-sm">
							<div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
								<div className="flex items-center gap-3">
									<div className="flex items-center justify-center w-10 h-10 rounded-full text-[var(--color-primary)]" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)' }}>
										<FileText className="h-5 w-5" />
									</div>
									<div>
										<p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Bill of Lading</p>
										<p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>PDF</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Button variant="ghost" size="icon" aria-label="Preview"><span className="material-symbols-outlined">visibility</span></Button>
									<Button variant="ghost" size="icon" aria-label="Download"><span className="material-symbols-outlined">download</span></Button>
								</div>
							</div>

							<div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
								<div className="flex items-center gap-3">
									<div className="flex items-center justify-center w-10 h-10 rounded-full text-[var(--color-primary)]" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)' }}>
										<FileText className="h-5 w-5" />
									</div>
									<div>
										<p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Quality Certificates</p>
										<p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>PDF</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Button variant="ghost" size="icon" aria-label="Preview"><span className="material-symbols-outlined">visibility</span></Button>
									<Button variant="ghost" size="icon" aria-label="Download"><span className="material-symbols-outlined">download</span></Button>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Fitting Details */}
				<Card>
					<CardHeader>
						<h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Fitting Details</h2>
					</CardHeader>
					<CardContent>
						<div className="space-y-3 text-sm">
							<div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
								<div className="flex items-center gap-3">
									<div className="flex items-center justify-center w-10 h-10 text-xl rounded-full text-[var(--color-primary)]" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)' }}>
										<span className="material-symbols-outlined">qr_code_2</span>
									</div>
									<div>
										<p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>QR ID: 1234…5678</p>
										<p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Type: —</p>
									</div>
								</div>
								<span className="px-2 py-1 text-xs font-medium rounded-full bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200">Good</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Comments / Notes */}
				<Card>
					<CardHeader>
						<h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Comments/Notes</h2>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full" style={{ backgroundColor: 'var(--color-bg-secondary)' }} />
								<div>
									<div className="flex items-baseline gap-2">
										<p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Vendor Support</p>
										<p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>—</p>
									</div>
									<p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>—</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<div className="flex-1">
									<label className="sr-only" htmlFor="add-note">Add a note</label>
									<input id="add-note" placeholder="Add a note…" className="w-full h-12 px-4 text-sm rounded-lg border border-token bg-transparent focus:ring-2 focus:ring-[var(--color-primary)]" style={{ color: 'var(--color-text-primary)' }} />
								</div>
								<Button aria-label="Send" className="h-12 w-12 p-0"><span className="material-symbols-outlined">send</span></Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</main>

			<VendorFooterNav active="batches" />
		</div>
	);
}
