/**
 * Application Layer Orchestration Service for Order Operations
 * Encapsulates domain invariants, workflows, and log tracking.
 */

import { getOrders, getOrderById, updateOrderStatus } from '../api';
import type { AdminOrder, OrderFilters, OrderStatus } from '../types';
import { logger } from '@/core/observability/logger';

// Finite State Machine transitions to protect invariants
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [], // Terminal
  CANCELLED: [], // Terminal
};

export class OrdersService {
  static async listOrders(filters?: OrderFilters): Promise<{ items: AdminOrder[]; total: number }> {
    logger.info('Querying orders via Application Orchestrator', { filters });
    try {
      const data = await getOrders(filters);
      return {
        items: data.content || [],
        total: data.totalElements || 0,
      };
    } catch (error) {
      logger.error('Orchestration failed for listOrders', { error, filters });
      throw error;
    }
  }

  static async getOrder(id: number): Promise<AdminOrder> {
    logger.info('Querying order details via Application Orchestrator', { orderId: id });
    try {
      return await getOrderById(id);
    } catch (error) {
      logger.error('Orchestration failed for getOrder', { error, orderId: id });
      throw error;
    }
  }

  static async transitionStatus(
    id: number,
    currentStatus: OrderStatus,
    newStatus: OrderStatus
  ): Promise<AdminOrder> {
    logger.info('Initiating status transition validation', { orderId: id, currentStatus, newStatus });

    const allowed = VALID_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      const errorMsg = `Illegal order transition from ${currentStatus} to ${newStatus}`;
      logger.warn(errorMsg, { orderId: id });
      throw new Error(errorMsg);
    }

    try {
      const result = await updateOrderStatus(id, newStatus);
      logger.info('Successfully transitioned order status', { orderId: id, from: currentStatus, to: newStatus });
      return result;
    } catch (error) {
      logger.error('Failed order status transition', { error, orderId: id, currentStatus, newStatus });
      throw error;
    }
  }
}
