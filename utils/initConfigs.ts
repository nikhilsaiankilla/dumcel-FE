import { ECSClient } from "@aws-sdk/client-ecs";
import { Kafka } from "kafkajs";
import { createClient } from "@clickhouse/client";
import Razorpay from "razorpay";

// Private cached instances
let ecsClient: ECSClient | null = null;
let kafka: Kafka | null = null;
let clickhouseClient: ReturnType<typeof createClient> | null = null;
let razorpay: Razorpay | null = null;

/** ---------------- AWS ECS Client ---------------- **/
export const getECSClient = () => {
    if (ecsClient) return ecsClient;

    const accessKeyId = process.env.ACCESS_KEY_ID
    const secretAccessKey =
        process.env.SECRET_ACCESS_KEY

    if (!accessKeyId || !secretAccessKey)
        throw new Error("Missing AWS credentials.");

    ecsClient = new ECSClient({
        region: "ap-south-1",
        credentials: { accessKeyId, secretAccessKey },
    });

    return ecsClient;
};

/** ---------------- Kafka Client ---------------- **/
export const getKafkaClient = () => {
    if (kafka) return kafka;

    const broker = process.env.KAFKA_BROKER
    const ca = process.env.KAFKA_CA_CERTIFICATE
    const username = process.env.KAFKA_USER_NAME
    const password = process.env.KAFKA_PASSWORD

    if (!broker || !ca || !username || !password)
        throw new Error("Missing Kafka configuration.");

    kafka = new Kafka({
        clientId: "api-server",
        brokers: [broker],
        ssl: {
            rejectUnauthorized: false,
            ca: [ca.trim()],
        },
        sasl: {
            mechanism: "plain",
            username,
            password,
        },
    });

    return kafka;
};

/** ---------------- ClickHouse Client ---------------- **/
export const getClickhouseClient = () => {
    if (clickhouseClient) return clickhouseClient;

    const url = process.env.CLICKHOUSE_URL;
    const database = process.env.DATABASE;
    const username = process.env.CLICKHOUSE_USER_NAME;
    const password = process.env.CLICKHOUSE_PASSWORD;

    if (!url || !username || !password)
        throw new Error("Missing ClickHouse configuration.");

    clickhouseClient = createClient({ url, database, username, password });

    return clickhouseClient;
};

/** ---------------- Razorpay Client ---------------- **/
export const getRazorpayClient = () => {
    if (razorpay) return razorpay;

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret)
        throw new Error("Razorpay keys are not set.");

    razorpay = new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
    });

    return razorpay;
};

