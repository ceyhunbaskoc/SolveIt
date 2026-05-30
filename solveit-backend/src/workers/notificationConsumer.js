const amqp = require('amqplib');
const { QUEUE_NAME } = require('../utils/rabbitmq');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

async function startConsumer() {
    try {
        const conn = await amqp.connect(RABBITMQ_URL);
        const channel = await conn.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        channel.prefetch(1);

        console.log('[CONSUMER] Waiting for messages in queue:', QUEUE_NAME);

        channel.consume(QUEUE_NAME, (msg) => {
            if (!msg) return;

            try {
                const data = JSON.parse(msg.content.toString());
                console.log('[CONSUMER] Received event:', data.event);
                handleEvent(data);
                channel.ack(msg);
            } catch (err) {
                console.error('[CONSUMER] Failed to process message:', err.message);
                channel.nack(msg, false, false);
            }
        });
    } catch (err) {
        console.error('[CONSUMER] Failed to start:', err.message);
    }
}

function handleEvent(data) {
    if (data.event === 'NEW_ISSUE') {
        console.log('[CONSUMER] 📧 E-posta simülasyonu: Yeni sorun bildirimi');
        console.log(`  → Başlık   : ${data.title}`);
        console.log(`  → Kategori : ${data.category}`);
        console.log(`  → Bildiren : ${data.reporterName}`);
        console.log(`  → Konum    : lat=${data.location?.lat}, lng=${data.location?.lng}`);
        console.log(`  → Tarih    : ${new Date(data.createdAt).toLocaleString('tr-TR')}`);
        console.log('[CONSUMER] ✅ Bildirim başarıyla işlendi');
    } else {
        console.log('[CONSUMER] Unknown event:', data.event);
    }
}

module.exports = { startConsumer };
