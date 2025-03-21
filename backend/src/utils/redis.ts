import Redis from "ioredis"

const client = new Redis("rediss://default:AWMzAAIjcDE1OTBkYzZkMDc4M2E0Nzc2ODA4NWE0MDRkMTRhZDU3MHAxMA@relaxed-yak-25395.upstash.io:6379");

client.on('error', (err) => {
    console.error('Redis error:', err);
});

client.on('connect', () => {
    console.log('Redis connected');
});


export default client