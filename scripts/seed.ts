import { getDatabase } from '../lib/mongodb';
import { createUser, findUserByEmail } from '../lib/models/User';
import { hashPassword } from '../lib/auth';

async function seed() {
    try {
        console.log('🌱 Starting seed...');

        // Connect to database
        const db = await getDatabase();
        console.log('✅ Connected to database');

        // Check if admin user already exists
        const existingAdmin = await findUserByEmail('king@desert.com');

        if (existingAdmin) {
            console.log('ℹ️  Admin user already exists with email: king@desert.com');
            console.log('✅ Seed completed (no changes needed)');
            process.exit(0);
        }

        // Create admin user
        console.log('📝 Creating admin user...');

        const hashedPassword = await hashPassword('admin123');

        const adminUser = await createUser({
            email: 'king@desert.com',
            password: hashedPassword,
            name: 'Admin',
            role: 'admin',
        });

        console.log('✅ Admin user created successfully!');
        console.log(`   Email: ${adminUser.email}`);
        console.log(`   Name: ${adminUser.name}`);
        console.log(`   Role: ${adminUser.role}`);
        console.log(`   ID: ${adminUser._id}`);
        console.log('✅ Seed completed successfully!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seed function
seed();

