import { getClickhouseClient, getKafkaClient, initKafkaConsumer } from "./initKafkaConsumer";

/** ---------------- Entry Point ---------------- **/
async function main() {
    const kafkaClient = getKafkaClient();
    const clickhouseClient = getClickhouseClient();

    await initKafkaConsumer(kafkaClient, clickhouseClient);
}

main().catch((err) => {
    console.error("Kafka consumer crashed:", err);
    process.exit(1);
});
