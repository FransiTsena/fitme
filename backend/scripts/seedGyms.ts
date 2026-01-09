import mongoose from 'mongoose';
import { Gym } from '../models/gymModel.js';
import { User } from '../models/userModel.js';
import axios from 'axios';
import { MongoClient } from 'mongodb';
import "dotenv/config";

// Import the auth utility to create users directly
import { auth } from '../utils/auth.js';

interface GymData {
    ownerId: any;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    gymName: string;
    description: string;
    city: string;
    area: string;
    address: string;
    operatingHours: {
        monday: { open: string; close: string };
        tuesday: { open: string; close: string };
        wednesday: { open: string; close: string };
        thursday: { open: string; close: string };
        friday: { open: string; close: string };
        saturday: { open: string; close: string };
        sunday: { open: string; close: string };
    };
    amenities: string[];
    images: string[];
    status: 'active' | 'suspended' | 'closed';
}

// Sample user data
const sampleUsers = [
    {
        name: 'John Smith',
        email: 'johnsmith@example.com',
        phone: '+251911234567',
        registrationRole: 'owner',
        city: 'Addis Ababa',
        area: 'Bole',
    },
    {
        name: 'Sarah Johnson',
        email: 'sarahj@example.com',
        phone: '+251911234568',
        registrationRole: 'owner',
        city: 'Addis Ababa',
        area: 'Piassa',
    },
    {
        name: 'Michael Chen',
        email: 'michaelc@example.com',
        phone: '+251911234569',
        registrationRole: 'owner',
        city: 'Addis Ababa',
        area: 'Kazanchis',
    },
    {
        name: 'Emily Rodriguez',
        email: 'emilyr@example.com',
        phone: '+251911234570',
        registrationRole: 'owner',
        city: 'Addis Ababa',
        area: 'Megenagna',
    },
    {
        name: 'David Wilson',
        email: 'davidw@example.com',
        phone: '+251911234571',
        registrationRole: 'owner',
        city: 'Addis Ababa',
        area: 'Cathedral',
    }
];

// Sample gym data with dummy images
const sampleGyms: GymData[] = [
    {
        ownerId: null, // Will be set later
        ownerName: 'John Smith',
        ownerEmail: 'johnsmith@example.com',
        ownerPhone: '+251911234567',
        gymName: 'Muscles Gym',
        description: 'A premium fitness center with state-of-the-art equipment and professional trainers.',
        city: 'Addis Ababa',
        area: 'Bole',
        address: 'Bole Road, Next to Mega Mall',
        operatingHours: {
            monday: { open: '6:00 AM', close: '10:00 PM' },
            tuesday: { open: '6:00 AM', close: '10:00 PM' },
            wednesday: { open: '6:00 AM', close: '10:00 PM' },
            thursday: { open: '6:00 AM', close: '10:00 PM' },
            friday: { open: '6:00 AM', close: '11:00 PM' },
            saturday: { open: '8:00 AM', close: '10:00 PM' },
            sunday: { open: '8:00 AM', close: '8:00 PM' },
        },
        amenities: ['Free WiFi', 'Parking', 'Sauna', 'Swimming Pool', 'Personal Trainer'],
        images: [
            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
            'https://images.unsplash.com/photo-1549060279-7e168fce7090?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80'
        ],
        status: 'active',
    },
    {
        ownerId: null, // Will be set later
        ownerName: 'Sarah Johnson',
        ownerEmail: 'sarahj@example.com',
        ownerPhone: '+251911234568',
        gymName: 'Power House',
        description: 'Your destination for strength and conditioning. We offer personalized training programs.',
        city: 'Addis Ababa',
        area: 'Piassa',
        address: 'Piassa Square, Opposite St. George Cathedral',
        operatingHours: {
            monday: { open: '5:00 AM', close: '11:00 PM' },
            tuesday: { open: '5:00 AM', close: '11:00 PM' },
            wednesday: { open: '5:00 AM', close: '11:00 PM' },
            thursday: { open: '5:00 AM', close: '11:00 PM' },
            friday: { open: '5:00 AM', close: '11:00 PM' },
            saturday: { open: '6:00 AM', close: '10:00 PM' },
            sunday: { open: '7:00 AM', close: '9:00 PM' },
        },
        amenities: ['Free WiFi', 'Parking', 'Group Classes', 'Nutrition Consultation'],
        images: [
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
            'https://images.unsplash.com/photo-1549060279-7e168fce7090?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80'
        ],
        status: 'active',
    },
    {
        ownerId: null, // Will be set later
        ownerName: 'Michael Chen',
        ownerEmail: 'michaelc@example.com',
        ownerPhone: '+251911234569',
        gymName: 'Fitness First',
        description: 'Premium fitness experience with world-class facilities and certified trainers.',
        city: 'Addis Ababa',
        area: 'Kazanchis',
        address: 'Kazanchis Commercial Center',
        operatingHours: {
            monday: { open: '6:00 AM', close: '10:00 PM' },
            tuesday: { open: '6:00 AM', close: '10:00 PM' },
            wednesday: { open: '6:00 AM', close: '10:00 PM' },
            thursday: { open: '6:00 AM', close: '10:00 PM' },
            friday: { open: '6:00 AM', close: '10:00 PM' },
            saturday: { open: '8:00 AM', close: '8:00 PM' },
            sunday: { open: '8:00 AM', close: '8:00 PM' },
        },
        amenities: ['Free WiFi', 'Parking', 'Sauna', 'Massage Services', 'Protein Bar'],
        images: [
            'https://images.unsplash.com/photo-1549060279-7e168fce7090?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80'
        ],
        status: 'active',
    },
    {
        ownerId: null, // Will be set later
        ownerName: 'Emily Rodriguez',
        ownerEmail: 'emilyr@example.com',
        ownerPhone: '+251911234570',
        gymName: "Gold's Gym",
        description: 'Legendary fitness since 1965. The most recognized name in fitness worldwide.',
        city: 'Addis Ababa',
        area: 'Megenagna',
        address: 'Megenagna Center, 3rd Floor',
        operatingHours: {
            monday: { open: '5:00 AM', close: '11:00 PM' },
            tuesday: { open: '5:00 AM', close: '11:00 PM' },
            wednesday: { open: '5:00 AM', close: '11:00 PM' },
            thursday: { open: '5:00 AM', close: '11:00 PM' },
            friday: { open: '5:00 AM', close: '11:00 PM' },
            saturday: { open: '6:00 AM', close: '10:00 PM' },
            sunday: { open: '6:00 AM', close: '8:00 PM' },
        },
        amenities: ['Free WiFi', 'Parking', 'Group Classes', 'Personal Trainer', 'Sauna', 'Swimming Pool'],
        images: [
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
            'https://images.unsplash.com/photo-1549060279-7e168fce7090?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
        ],
        status: 'active',
    },
    {
        ownerId: null, // Will be set later
        ownerName: 'David Wilson',
        ownerEmail: 'davidw@example.com',
        ownerPhone: '+251911234571',
        gymName: 'FitZone',
        description: 'A modern fitness center designed for all fitness levels. Personalized workout plans available.',
        city: 'Addis Ababa',
        area: 'Cathedral',
        address: 'Cathedral Road, Near Holy Trinity Cathedral',
        operatingHours: {
            monday: { open: '6:00 AM', close: '10:00 PM' },
            tuesday: { open: '6:00 AM', close: '10:00 PM' },
            wednesday: { open: '6:00 AM', close: '10:00 PM' },
            thursday: { open: '6:00 AM', close: '10:00 PM' },
            friday: { open: '6:00 AM', close: '10:00 PM' },
            saturday: { open: '8:00 AM', close: '8:00 PM' },
            sunday: { open: '9:00 AM', close: '7:00 PM' },
        },
        amenities: ['Free WiFi', 'Parking', 'Group Classes', 'Nutrition Consultation', 'Protein Bar'],
        images: [
            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
            'https://images.unsplash.com/photo-1549060279-7e168fce7090?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80'
        ],
        status: 'suspended',
    }
];

const seedGyms = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI!);
        console.log('Connected to MongoDB');

        // Clear existing gyms
        await Gym.deleteMany({});
        console.log('Cleared existing gyms');

        // Connect to MongoDB to clear existing sample users from Better Auth collections
        const mongoClient = new MongoClient(process.env.MONGO_URI!);
        await mongoClient.connect();

        const dbName = mongoClient.db().databaseName;
        console.log(`Connected to database: ${dbName}`);

        // List all collections to see what's available
        const collections = await mongoClient.db().listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));

        // Try to delete from common Better Auth collections
        const collectionNames = ['better-auth_user', 'better_auth_user', 'user', 'users'];

        for (const collectionName of collectionNames) {
            try {
                const collection = mongoClient.db().collection(collectionName);
                const result = await collection.deleteMany({ email: { $in: sampleUsers.map(u => u.email) } });
                console.log(`Cleared ${result.deletedCount} users from ${collectionName} collection`);
            } catch (error: any) {
                console.log(`Collection ${collectionName} may not exist or be accessible:`, error.message);
            }
        }

        // Also try account collections
        const accountCollectionNames = ['better-auth_account', 'better_auth_account', 'account', 'accounts'];
        for (const collectionName of accountCollectionNames) {
            try {
                const collection = mongoClient.db().collection(collectionName);
                const result = await collection.deleteMany({ email: { $in: sampleUsers.map(u => u.email) } });
                console.log(`Cleared ${result.deletedCount} accounts from ${collectionName} collection`);
            } catch (error: any) {
                console.log(`Account collection ${collectionName} may not exist or be accessible:`, error.message);
            }
        }

        // Also clear sessions for these users
        const sessionCollectionNames = ['better-auth_session', 'better_auth_session', 'session', 'sessions'];
        for (const collectionName of sessionCollectionNames) {
            try {
                const collection = mongoClient.db().collection(collectionName);
                // Sessions might be linked by userId instead of email, so we'll try a broader cleanup
                const result = await collection.deleteMany({});
                console.log(`Cleared ${result.deletedCount} sessions from ${collectionName} collection`);
            } catch (error: any) {
                console.log(`Session collection ${collectionName} may not exist or be accessible:`, error.message);
            }
        }

        // Close the connection
        await mongoClient.close();
        console.log('Finished clearing existing sample users');

        // Wait a bit longer to ensure deletions are processed
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Wait a moment for deletions to process
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create users directly using Mongoose instead of API calls
        const createdUsers = [];
        for (const userData of sampleUsers) {
            try {
                // Create user in the database directly
                const user = new User({
                    name: userData.name,
                    email: userData.email,
                    phone: userData.phone,
                    role: userData.registrationRole,
                    city: userData.city,
                    area: userData.area,
                    emailVerified: true, // Set as verified for seed data
                    status: "active" // Set status as active for seed data
                });

                await user.save();

                console.log(`Created user: ${userData.name} (${userData.email})`);

                // Add to created users array with the user ID from the database
                createdUsers.push({
                    _id: user._id,
                    ...userData
                });
            } catch (error: any) {
                console.error(`Error creating user ${userData.email}:`, error.message || error);
                // Continue with other users
            }
        }

        if (createdUsers.length === 0) {
            console.log('No users were created.');
            process.exit(1);
        }

        // Use the created users
        const allUsers = createdUsers;

        // Ensure all users were created successfully
        if (allUsers.length === 0) {
            console.log('No users were successfully created.');
            process.exit(1);
        }

        // Prepare gym data with valid owner IDs
        const gymsToInsert = sampleGyms.map((gym, index) => ({
            ...gym,
            ownerId: allUsers[index % allUsers.length]?._id,
            name: gym.gymName, // Map gymName to name
            location: { // Add required location with coordinates
                type: "Point",
                coordinates: [38.74687 + (index * 0.01), 9.018336 + (index * 0.01)] // Add different coordinates for each gym
            },
            address: { // Update address format
                city: gym.city,
                area: gym.area,
                street: gym.address
            },
            photos: gym.images, // Map images to photos
            verificationStatus: gym.status === 'suspended' ? 'rejected' : 'approved', // Map status
            isActive: gym.status === 'active', // Map to isActive
            rating: { average: 0, count: 0 }, // Add required rating field
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        // Insert gyms
        await Gym.insertMany(gymsToInsert);
        console.log(`Inserted ${gymsToInsert.length} gyms`);

        // Disconnect from database
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedGyms();