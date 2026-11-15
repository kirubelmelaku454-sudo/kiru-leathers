/**
 * Shared message thread helpers used by both MySQL and SQLite adapters
 * to ensure consistent two-way Admin <-> Customer conversation histories.
 */

const buildInitialThread = (msg) => [
  {
    id: `m-init-${msg.id}`,
    senderRole: 'customer',
    senderName: msg.fullName || msg.name || 'Collector',
    text: msg.message || '',
    createdAt: msg.createdAt || new Date().toISOString()
  }
];

const parseThreadJson = (rawThread, fallbackMsg = {}) => {
  if (rawThread) {
    try {
      const parsed = typeof rawThread === 'string' ? JSON.parse(rawThread) : rawThread;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Fall back cleanly to synthesizing from message + reply
    }
  }

  const thread = [];
  if (fallbackMsg.message) {
    thread.push({
      id: `m-init-${fallbackMsg.id || 'msg'}`,
      senderRole: 'customer',
      senderName: fallbackMsg.fullName || fallbackMsg.name || 'Collector',
      text: fallbackMsg.message,
      createdAt: fallbackMsg.createdAt || new Date().toISOString()
    });
  }
  if (fallbackMsg.reply) {
    thread.push({
      id: `m-rep-${fallbackMsg.id || 'msg'}`,
      senderRole: 'admin',
      senderName: fallbackMsg.repliedBy || 'Kiru Atelier Master Artisan',
      text: fallbackMsg.reply,
      createdAt: fallbackMsg.replyDate || fallbackMsg.createdAt || new Date().toISOString()
    });
  }
  return thread;
};

const appendThreadEntry = (existingThread, entry) => {
  const base = Array.isArray(existingThread) ? existingThread : [];
  return [...base, entry];
};

module.exports = {
  buildInitialThread,
  parseThreadJson,
  appendThreadEntry
};
