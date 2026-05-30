const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = 'issue_notifications';

let channel = null;

async function connect() {
    try {
        const conn = await amqp.connect(RABBITMQ_URL);
        channel = await conn.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        console.log('[RABBITMQ] Connected. Queue ready:', QUEUE_NAME);

        conn.on('error', (err) => {
            console.error('[RABBITMQ] Connection error:', err.message);
            channel = null;
        });

        conn.on('close', () => {
            console.warn('[RABBITMQ] Connection closed');
            channel = null;
        });
    } catch (err) {
        console.error('[RABBITMQ] Failed to connect:', err.message);
    }
}

async function publishMessage(data) {
    if (!channel) {
        console.warn('[RABBITMQ] Channel not available, skipping publish');
        return false;
    }
    try {
        const msg = Buffer.from(JSON.stringify(data));
        channel.sendToQueue(QUEUE_NAME, msg, { persistent: true });
        console.log('[RABBITMQ] Message published:', data.event);
        return true;
    } catch (err) {
        console.error('[RABBITMQ] Failed to publish:', err.message);
        return false;
    }
}

module.exports = { connect, publishMessage, QUEUE_NAME };
