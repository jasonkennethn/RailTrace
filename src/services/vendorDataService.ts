import { onSnapshot, collection, query, orderBy, limit, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface VendorStatsLive {
  totalBatches: number;
  pendingShipments: number;
  completedShipments: number;
  qrCodesGenerated: number;
  blockchainRecords: number;
}

export interface VendorBatchLive {
  id: string;
  batchNumber: string;
  fittingType: string;
  quantity: number;
  status: 'manufacturing' | 'ready' | 'shipped' | 'delivered';
  createdAt?: any;
  expectedDelivery?: any;
}

export interface VendorShipmentLive {
  id: string;
  batchId: string;
  destination: string;
  status: 'pending' | 'in_transit' | 'delivered';
  trackingNumber: string;
  createdAt?: any;
}

export interface VendorNotificationLive {
  id: string;
  title: string;
  message: string;
  type: 'inspection' | 'anomaly' | 'review' | 'system';
  priority?: 'low' | 'medium' | 'high';
  read?: boolean;
  createdAt?: any;
}

export interface VendorQRActivityLive {
  id: string;
  related?: string;
  lastActivity?: any;
  scans?: number;
}

export const vendorDataService = {
  subscribeStats(vendorId: string, cb: (stats: VendorStatsLive) => void) {
    const ref = collection(db, `vendors/${vendorId}/stats`);
    const q = query(ref, orderBy('timestamp', 'desc'), limit(1));
    return onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const d: any = snap.docs[0].data();
        cb({
          totalBatches: d.totalBatches || 0,
          pendingShipments: d.pendingShipments || 0,
          completedShipments: d.completedShipments || 0,
          qrCodesGenerated: d.qrCodesGenerated || 0,
          blockchainRecords: d.blockchainRecords || 0,
        });
      } else {
        cb({ totalBatches: 0, pendingShipments: 0, completedShipments: 0, qrCodesGenerated: 0, blockchainRecords: 0 });
      }
    });
  },

  subscribeBatches(vendorId: string, cb: (batches: VendorBatchLive[]) => void) {
    const ref = collection(db, `vendors/${vendorId}/batches`);
    const q = query(ref, orderBy('createdAt', 'desc'), limit(50));
    return onSnapshot(q, (snap) => {
      const items: VendorBatchLive[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      cb(items);
    });
  },

  subscribeShipments(vendorId: string, cb: (shipments: VendorShipmentLive[]) => void) {
    const ref = collection(db, `vendors/${vendorId}/shipments`);
    const q = query(ref, orderBy('createdAt', 'desc'), limit(50));
    return onSnapshot(q, (snap) => {
      const items: VendorShipmentLive[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      cb(items);
    });
  },

  subscribeNotifications(vendorId: string, cb: (items: VendorNotificationLive[]) => void) {
    const ref = collection(db, `vendors/${vendorId}/notifications`);
    const q = query(ref, orderBy('createdAt', 'desc'), limit(100));
    return onSnapshot(q, (snap) => {
      const items: VendorNotificationLive[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      cb(items);
    });
  },

  subscribeQRActivity(vendorId: string, cb: (items: VendorQRActivityLive[]) => void) {
    const ref = collection(db, `vendors/${vendorId}/qrActivity`);
    const q = query(ref, orderBy('lastActivity', 'desc'), limit(100));
    return onSnapshot(q, (snap) => {
      const items: VendorQRActivityLive[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      cb(items);
    });
  },

  async markNotificationRead(vendorId: string, id: string) {
    const ref = doc(db, `vendors/${vendorId}/notifications/${id}`);
    const cur = await getDoc(ref);
    if (cur.exists()) {
      await setDoc(ref, { read: true }, { merge: true });
    }
  },

  async getProfile(vendorId: string) {
    const ref = doc(db, `vendors/${vendorId}/profile/profile`);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : {};
  },

  async saveProfile(vendorId: string, data: any) {
    const ref = doc(db, `vendors/${vendorId}/profile/profile`);
    await setDoc(ref, data, { merge: true });
  },

  subscribePerformance(vendorId: string, cb: (rows: Array<{ label: string; batches?: number; shipments?: number }>) => void) {
    const ref = collection(db, `vendors/${vendorId}/metricsDaily`);
    const q = query(ref, orderBy('date', 'desc'), limit(30));
    return onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => {
        const v: any = d.data();
        return { label: v.dateLabel || v.date, batches: v.batches || 0, shipments: v.shipments || 0 };
      }).reverse();
      cb(items);
    });
  },

  subscribeFittingTypes(vendorId: string, cb: (rows: Array<{ name: string; value: number; count?: number }>) => void) {
    const ref = collection(db, `vendors/${vendorId}/fittingTypeAgg`);
    const q = query(ref, orderBy('count', 'desc'));
    return onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => {
        const v: any = d.data();
        return { name: v.name, value: v.value ?? v.count ?? 0, count: v.count };
      });
      cb(items);
    });
  },
};
