import mongoose from 'mongoose';
import { Gym } from '../models/gymModel.js';
import { User } from '../models/userModel.js';
import bcrypt from 'bcrypt';
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

// Sample user data
const sampleUsers = [
    {
        name: 'Regular User',
        email: 'user@gmail.com',
        phone: '+251911234567',
        role: 'member',
        city: 'Addis Ababa',
        area: 'Bole',
    },
    {
        name: 'Sample Trainer',
        email: 'trainer@gmail.com',
        phone: '+251911234568',
        role: 'trainer',
        city: 'Addis Ababa',
        area: 'Piassa',
    },
    {
        name: 'Gym Owner',
        email: 'owner@gmail.com',
        phone: '+251911234569',
        role: 'owner',
        city: 'Addis Ababa',
        area: 'Kazanchis',
    },
    {
        name: 'Owner 2',
        email: 'owner2@gmail.com',
        phone: '+251911234570',
        role: 'owner',
        city: 'Addis Ababa',
        area: 'Megenagna',
    },
    {
        name: 'Owner 3',
        email: 'owner3@gmail.com',
        phone: '+251911234571',
        role: 'owner',
        city: 'Addis Ababa',
        area: 'Cathedral',
    },
    {
        name: 'Owner 4',
        email: 'owner4@gmail.com',
        phone: '+251911234572',
        role: 'owner',
        city: 'Addis Ababa',
        area: 'Mexico',
    },
    {
        name: 'Owner 5',
        email: 'owner5@gmail.com',
        phone: '+251911234573',
        role: 'owner',
        city: 'Addis Ababa',
        area: 'Lideta',
    },
    {
        name: 'Owner 6',
        email: 'owner6@gmail.com',
        phone: '+251911234574',
        role: 'owner',
        city: 'Addis Ababa',
        area: 'Piazza',
    },
    {
        name: 'Owner 7',
        email: 'owner7@gmail.com',
        phone: '+251911234575',
        role: 'owner',
        city: 'Addis Ababa',
        area: 'Arada',
    },
    {
        name: 'Owner 8',
        email: 'owner8@gmail.com',
        phone: '+251911234576',
        role: 'owner',
        city: 'Addis Ababa',
        area: 'Sarbet',
    },
    {
        name: 'Owner 9',
        email: 'owner9@gmail.com',
        phone: '+251911234577',
        role: 'owner',
        city: 'Addis Ababa',
        area: 'Gulele',
    },
    {
        name: 'Owner 10',
        email: 'owner10@gmail.com',
        phone: '+251911234578',
        role: 'owner',
        city: 'Addis Ababa',
        area: 'Kality',
    }
];

// Sample gym data with dummy images
const sampleGyms: GymData[] = [
    {
        ownerId: null, // Will be set later
        ownerName: 'Gym Owner',
        ownerEmail: 'owner@gmail.com',
        ownerPhone: '+251911234569',
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
        ownerName: 'Owner 2',
        ownerEmail: 'owner2@gmail.com',
        ownerPhone: '+251911234570',
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
        ownerName: 'Owner 3',
        ownerEmail: 'owner3@gmail.com',
        ownerPhone: '+251911234571',
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
        ownerName: 'Owner 4',
        ownerEmail: 'owner4@gmail.com',
        ownerPhone: '+251911234572',
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
        ownerName: 'Owner 5',
        ownerEmail: 'owner5@gmail.com',
        ownerPhone: '+251911234573',
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
    },
    {
        ownerId: null, // Will be set later
        ownerName: 'Owner 6',
        ownerEmail: 'owner6@gmail.com',
        ownerPhone: '+251911234574',
        gymName: 'Flex Fitness',
        description: 'Your destination for strength and conditioning. We offer personalized training programs.',
        city: 'Addis Ababa',
        area: 'Mexico',
        address: 'Mexico Square, Near Mexico Hospital',
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
        ownerName: 'Owner 7',
        ownerEmail: 'owner7@gmail.com',
        ownerPhone: '+251911234575',
        gymName: 'Iron Paradise',
        description: 'Premium fitness experience with world-class facilities and certified trainers.',
        city: 'Addis Ababa',
        area: 'Lideta',
        address: 'Lideta Commercial Center',
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
        ownerName: 'Owner 8',
        ownerEmail: 'owner8@gmail.com',
        ownerPhone: '+251911234576',
        gymName: 'Muscle Factory',
        description: 'Legendary fitness since 1965. The most recognized name in fitness worldwide.',
        city: 'Addis Ababa',
        area: 'Piazza',
        address: 'Piazza Center, 3rd Floor',
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
        ownerName: 'Owner 9',
        ownerEmail: 'owner9@gmail.com',
        ownerPhone: '+251911234577',
        gymName: 'FitLife',
        description: 'A modern fitness center designed for all fitness levels. Personalized workout plans available.',
        city: 'Addis Ababa',
        area: 'Arada',
        address: 'Arada Road, Near Arada University',
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
        status: 'active',
    },
    {
        ownerId: null, // Will be set later
        ownerName: 'Owner 10',
        ownerEmail: 'owner10@gmail.com',
        ownerPhone: '+251911234578',
        gymName: 'Power Station',
        description: 'Your destination for strength and conditioning. We offer personalized training programs.',
        city: 'Addis Ababa',
        area: 'Sarbet',
        address: 'Sarbet Road, Near Sarbet Hospital',
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
    }
];

const seedGyms = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI!);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Gym.deleteMany({});
        await User.deleteMany({});
        console.log('Cleared existing data');

        // Hash the password
        const hashedPassword = await bcrypt.hash('12345678', 10);
        console.log('Hashed password for all users');

        // Create users directly using Mongoose
        const createdUsers = [];
        for (const userData of sampleUsers) {
            try {
                // Create user in the database directly
                const user = new User({
                    name: userData.name,
                    email: userData.email,
                    phone: userData.phone,
                    role: userData.role,
                    city: userData.city,
                    area: userData.area,
                    password: hashedPassword, // Add the hashed password
                    emailVerified: true, // Set as verified for seed data
                    status: "active", // Set status as active for seed data
                    documentStatus: userData.role === 'owner' ? 'not_submitted' : undefined // Only set for owners
                });

                await user.save();

                console.log(`Created user: ${userData.name} (${userData.email}) - Role: ${userData.role}`);

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

        console.log(`Created ${allUsers.length} users successfully`);

        // Prepare gym data with valid owner IDs
        const gymsToInsert = sampleGyms.map((gym, index) => {
            // Find the owner user based on email
            const ownerUser = allUsers.find(user => user.email === gym.ownerEmail);
            const ownerId = ownerUser ? ownerUser._id : allUsers[index % allUsers.length]?._id || allUsers[0]._id;

            return {
                ...gym,
                ownerId: ownerId,
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
            };
        });

        // Insert gyms
        await Gym.insertMany(gymsToInsert);
        console.log(`Inserted ${gymsToInsert.length} gyms`);

        // Disconnect from database
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        console.log('Seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedGyms();