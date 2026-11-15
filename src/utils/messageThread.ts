import type { CustomerMessage, MessageThreadEntry } from '../types';

/**
 * Returns chronological conversation entries for a customer message thread,
 * gracefully synthesizing legacy single-message / single-reply rows when needed.
 */
export function getMessageThread(msg: CustomerMessage): MessageThreadEntry[] {
  if (Array.isArray(msg.thread) && msg.thread.length > 0) {
    return msg.thread;
  }

  const entries: MessageThreadEntry[] = [];
  if (msg.message) {
    entries.push({
      id: `m-init-${msg.id}`,
      senderRole: 'customer',
      senderName: msg.fullName || 'Client',
      text: msg.message,
      createdAt: msg.createdAt
    });
  }
  if (msg.reply) {
    entries.push({
      id: `m-rep-${msg.id}`,
      senderRole: 'admin',
      senderName: msg.repliedBy || 'Kiru Atelier Master Artisan',
      text: msg.reply,
      createdAt: msg.replyDate || msg.createdAt
    });
  }
  return entries;
}
