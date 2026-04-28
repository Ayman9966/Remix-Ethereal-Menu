import { toast } from 'sonner';
import { 
  upsertMenuItem, deleteMenuItem, 
  upsertCategory, deleteCategory, 
  upsertBrandSettings, createOrder, 
  updateOrderStatus 
} from './supabase-store';
import { loadFromStorage, saveToStorage } from './storage';

export type SyncOperationType = 
  | 'UPSERT_ITEM' | 'DELETE_ITEM' 
  | 'UPSERT_CATEGORY' | 'DELETE_CATEGORY' 
  | 'UPSERT_BRAND' | 'CREATE_ORDER' | 'UPDATE_ORDER_STATUS';

export interface SyncOperation {
  id: string;
  type: SyncOperationType;
  payload: any;
  timestamp: number;
  retryCount: number;
}

const SYNC_QUEUE_KEY = 'syncQueue';

class SyncEngine {
  private queue: SyncOperation[] = [];
  private isProcessing = false;
  private onStatusChange?: (status: 'synced' | 'syncing' | 'error', count: number, queue: SyncOperation[]) => void;
  private onOperationComplete?: (type: SyncOperationType, payload: any, result: any) => void;

  constructor() {
    this.queue = loadFromStorage(SYNC_QUEUE_KEY, []);
  }

  public setStatusCallback(cb: (status: 'synced' | 'syncing' | 'error', count: number, queue: SyncOperation[]) => void) {
    this.onStatusChange = cb;
    this.notify();
  }

  public setOperationCompleteCallback(cb: (type: SyncOperationType, payload: any, result: any) => void) {
    this.onOperationComplete = cb;
  }

  public enqueue(type: SyncOperationType, payload: any) {
    const op: SyncOperation = {
      id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0
    };
    this.queue.push(op);
    this.save();
    this.notify();
    this.processQueue();
  }

  private save() {
    saveToStorage(SYNC_QUEUE_KEY, this.queue);
  }

  private notify() {
    if (this.onStatusChange) {
      const status = this.isProcessing ? 'syncing' : this.queue.length > 0 ? 'syncing' : 'synced';
      this.onStatusChange(status, this.queue.length, [...this.queue]);
    }
  }

  public getQueue() {
    return [...this.queue];
  }

  public getPendingCount() {
    return this.queue.length;
  }

  public async processQueue() {
    if (this.isProcessing || this.queue.length === 0 || !navigator.onLine) {
      this.notify();
      return;
    }

    this.isProcessing = true;
    this.notify();

    // Work on a copy to avoid mutation issues during async calls
    const currentQueue = [...this.queue];
    const failedOps: SyncOperation[] = [];

    for (const op of currentQueue) {
      try {
        const result = await this.executeOperation(op);
        
        if (this.onOperationComplete) {
          try {
            this.onOperationComplete(op.type, op.payload, result);
          } catch (e) {
            console.error('[sync] Error in onOperationComplete callback:', e);
          }
        }

        // If success, remove from real queue
        this.queue = this.queue.filter(q => q.id !== op.id);
        this.save();
      } catch (err) {
        console.error(`[sync] Operation ${op.id} failed:`, err);
        op.retryCount++;
        if (op.retryCount < 5) {
          failedOps.push(op);
        } else {
          // Permanently failed after 5 retries
          this.queue = this.queue.filter(q => q.id !== op.id);
          this.save();
          toast.error(`Sync failed for ${op.type}. Data might be inconsistent.`);
        }
      }
      this.notify();
    }

    this.isProcessing = false;
    this.notify();

    // If we have failed ops, we'll try again later when online status changes
  }

  private async executeOperation(op: SyncOperation) {
    switch (op.type) {
      case 'UPSERT_ITEM':
        return upsertMenuItem(op.payload);
      case 'DELETE_ITEM':
        return deleteMenuItem(op.payload.id);
      case 'UPSERT_CATEGORY':
        return upsertCategory(op.payload);
      case 'DELETE_CATEGORY':
        return deleteCategory(op.payload.id);
      case 'UPSERT_BRAND':
        return upsertBrandSettings(op.payload);
      case 'CREATE_ORDER':
        return createOrder(op.payload);
      case 'UPDATE_ORDER_STATUS':
        return updateOrderStatus(op.payload.id, op.payload.status);
      default:
        throw new Error(`Unknown operation type: ${op.type}`);
    }
  }
}

export const syncEngine = new SyncEngine();
