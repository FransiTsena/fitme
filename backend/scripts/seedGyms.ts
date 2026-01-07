import mongoose from 'mongoose';
import { Gym } from '../models/gymModel.js';
import { User } from '../models/userModel.js';
import "dotenv/config";

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

        // Get existing users to assign as gym owners
        const users = await User.find({}, { _id: 1 }).limit(5);
        if (users.length === 0) {
            console.log('No users found. Please seed users first.');
            process.exit(1);
        }

        // Prepare gym data with valid owner IDs
        const gymsToInsert = sampleGyms.map((gym, index) => ({
            ...gym,
            ownerId: users[index % users.length]._id,
            verifiedAt: new Date(),
            verificationDocuments: [],
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
        console.error('Error seeding gyms:', error);
        process.exit(1);
    }
};

seedGyms();