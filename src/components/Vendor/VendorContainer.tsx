import { useEffect, useMemo, useState } from 'react';
import { useNavigation } from '../../services/navigationService';
import { useAuth } from '../../hooks/useAuth';
import { vendorDataService, type VendorNotificationLive } from '../../services/vendorDataService';
import { VendorDashboard } from '../Dashboard/VendorDashboard';
import BatchList, { type VendorBatch } from '../VendorPages/BatchList';
import ShipmentsList, { type VendorShipment } from '../VendorPages/ShipmentsList';
import Notifications from '../VendorPages/Notifications';
import MyProfile from '../VendorPages/MyProfile';
import BatchDetails from '../VendorPages/BatchDetails';
import ShipmentDetails from '../VendorPages/ShipmentDetails';
import QRActivityDetails from '../VendorPages/QRActivityDetails';
import QRGenerator from '../QR/QRGenerator';

export default function VendorContainer() {
  const { currentRoute } = useNavigation();
  const { userData } = useAuth();
  const vendorId = (userData as any)?.vendorId || (userData as any)?.uid || 'default';

  const [batches, setBatches] = useState<VendorBatch[]>([]);
  const [shipments, setShipments] = useState<VendorShipment[]>([]);
  const [notifications, setNotifications] = useState<VendorNotificationLive[]>([]);
  const [profile, setProfile] = useState<{ name?: string; email?: string; phone?: string } | null>(null);

  useEffect(() => {
    const unsubs: Array<() => void> = [];
    unsubs.push(vendorDataService.subscribeBatches(vendorId, (rows: any[]) => {
      setBatches(rows as unknown as VendorBatch[]);
    }));
    unsubs.push(vendorDataService.subscribeShipments(vendorId, (rows: any[]) => {
      setShipments(rows as unknown as VendorShipment[]);
    }));
    unsubs.push(vendorDataService.subscribeNotifications(vendorId, (rows) => setNotifications(rows)));
    (async () => {
      const p = await vendorDataService.getProfile(vendorId);
      setProfile({ name: (p as any)?.name, email: (p as any)?.email, phone: (p as any)?.phone });
    })();
    return () => { unsubs.forEach((u) => u && u()); };
  }, [vendorId]);

  const content = useMemo(() => {
    switch (currentRoute) {
      case 'dashboard':
        return <VendorDashboard />;
      case 'inventory':
        return <BatchList batches={batches} onViewBatch={(id) => {/* route to details if needed */}} />;
      case 'shipments':
        return <ShipmentsList shipments={shipments} onViewShipment={(id) => {/* route to details if needed */}} />;
      case 'qr-generate':
        return <QRGenerator />;
      case 'alerts':
        return <Notifications items={notifications} onMarkRead={(id) => vendorDataService.markNotificationRead(vendorId, id)} />;
      case 'settings':
        return <MyProfile initial={profile || {}} company={{}} onSave={(data) => vendorDataService.saveProfile(vendorId, data)} />;
      case 'batch-details':
        return <BatchDetails batchId={''} />;
      case 'shipment-details':
        return <ShipmentDetails shipmentId={''} />;
      case 'qr-activity-details':
        return <QRActivityDetails qrId={''} />;
      default:
        return <VendorDashboard />;
    }
  }, [currentRoute, batches, shipments, notifications, profile, vendorId]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {content}
    </div>
  );
}
