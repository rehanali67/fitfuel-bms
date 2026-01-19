import { MongoClient, Db } from 'mongodb';

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> {
    // Lazy initialization - check URI when actually needed (when promise is awaited)
    if (clientPromise) {
        return clientPromise;
    }

    // Check environment variable - Next.js loads .env.local at startup
    // If this is undefined, the dev server needs to be restarted
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        const error = new Error(
            'MONGODB_URI is not set in environment variables.\n' +
            'Please ensure:\n' +
            '1. Your .env.local file exists in the project root\n' +
            '2. It contains: MONGODB_URI=your_connection_string\n' +
            '3. You have restarted the Next.js dev server after adding/changing .env.local'
        );
        clientPromise = Promise.reject(error);
        return clientPromise;
    }

    if (process.env.NODE_ENV === 'development') {
        // In development mode, use a global variable so that the value
        // is preserved across module reloads caused by HMR (Hot Module Replacement).
        let globalWithMongo = global as typeof globalThis & {
            _mongoClientPromise?: Promise<MongoClient>;
        };

        if (!globalWithMongo._mongoClientPromise) {
            client = new MongoClient(uri, options);
            globalWithMongo._mongoClientPromise = client.connect();
        }
        clientPromise = globalWithMongo._mongoClientPromise;
    } else {
        // In production mode, it's best to not use a global variable.
        client = new MongoClient(uri, options);
        clientPromise = client.connect();
    }

    return clientPromise;
}

// Create a promise that will be initialized lazily when first awaited
// This defers the env var check until the promise is actually used
export default new Promise<MongoClient>((resolve, reject) => {
    // Use process.nextTick to defer execution until after module initialization
    // This ensures Next.js has loaded environment variables
    process.nextTick(() => {
        getClientPromise().then(resolve).catch(reject);
    });
});

export async function getDatabase(): Promise<Db> {
    const client = await getClientPromise();
    return client.db();
}

