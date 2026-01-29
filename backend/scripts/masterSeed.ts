import mongoose from 'mongoose';
import { User } from '../models/userModel.js';
import { Gym } from '../models/gymModel.js';
import { MembershipPlan } from '../models/membershipModel.js';
import { TrainingSession } from '../models/trainingSessionModel.js';
import { Exercise } from '../models/exerciseModel.js';
import { WorkoutPlan } from '../models/workoutPlanModel.js';
import { Trainer } from '../models/trainerModel.js';
import { UserMembership } from '../models/userMembershipModel.js';
import { Payment } from '../models/paymentModel.js';
import bcrypt from 'bcrypt';
import "dotenv/config";

const gymImages = [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1975&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=2069&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=2069&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop",
];

const sessionImages = [
    "https://images.unsplash.com/photo-1518611012118-29a88f22d8b74?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?q=80&w=1925&auto=format&fit=crop",
];

const exercisesData = [
    { name: "Barbell Bench Press", category: "Strength", bodyPart: "Chest", equipment: "Barbell", instructions: ["Lie on bench", "Lower barbell to chest", "Press up"] },
    { name: "Squat", category: "Strength", bodyPart: "Legs", equipment: "Barbell", instructions: ["Bar on traps", "Lower hips", "Stand up"] },
    { name: "Deadlift", category: "Strength", bodyPart: "Back", equipment: "Barbell", instructions: ["Feet hip-width", "Grip bar", "Lift with legs and back"] },
    { name: "Plank", category: "Stability", bodyPart: "Core", equipment: "None", instructions: ["Forearms on floor", "Hold straight line", "Tighten core"] },
    { name: "Overhead Press", category: "Strength", bodyPart: "Shoulders", equipment: "Barbell", instructions: ["Bar at collarbones", "Press overhead", "Lock out"] }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fitme");
        console.log("Connected to MongoDB...");

        // Clear all collections
        await Promise.all([
            User.deleteMany({}),
            Gym.deleteMany({}),
            MembershipPlan.deleteMany({}),
            TrainingSession.deleteMany({}),
            Exercise.deleteMany({}),
            WorkoutPlan.deleteMany({}),
            Trainer.deleteMany({}),
            UserMembership.deleteMany({}),
            Payment.deleteMany({})
        ]);
        console.log("Cleared existing data.");

        // 1. Seed Exercises
        const createdExercises = await Exercise.insertMany(exercisesData);
        console.log(`Seeded ${createdExercises.length} exercises.`);

        // 2. Seed Users
        const password = await bcrypt.hash("password123", 10);
        const users = [
            { name: "Gym Owner 1", email: "owner@fitme.com", password, role: "owner", phone: "+251911222222" },
            { name: "Gym Owner 2", email: "owner2@fitme.com", password, role: "owner", phone: "+251911222223" },
            { name: "Trainer John", email: "trainer@fitme.com", password, role: "trainer", phone: "+251911333333" },
            { name: "Regular Member", email: "user@gmail.com", password, role: "member", phone: "+251911444444" }
        ];
        const createdUsers = await User.insertMany(users);
        const owner1 = createdUsers.find(u => u.email === "owner@fitme.com")!;
        const owner2 = createdUsers.find(u => u.email === "owner2@fitme.com")!;
        const trainerUser = createdUsers.find(u => u.role === "trainer")!;
        const memberUser = createdUsers.find(u => u.email === "user@gmail.com")!;
        console.log("Seeded users.");

        // 3. Seed Gyms
        const gymData = [
            {
                ownerId: owner1._id,
                name: "Elite Fitness Center",
                description: "The best gym in town with modern equipment.",
                thumbnail: gymImages[0],
                photos: [gymImages[1], gymImages[2]],
                location: { type: "Point", coordinates: [38.74687, 9.018336] },
                address: { city: "Addis Ababa", area: "Bole", street: "Bole Road" },
                isActive: true,
                verificationStatus: "approved",
                pricing: { perDay: 200, perMonth: 1500 }
            },
            {
                ownerId: owner2._id,
                name: "Power Zone",
                description: "A gym focused on strength training and bodybuilding.",
                thumbnail: gymImages[3],
                photos: [gymImages[4], gymImages[5]],
                location: { type: "Point", coordinates: [38.75687, 9.028336] },
                address: { city: "Addis Ababa", area: "Kazanchis", street: "Urael Street" },
                isActive: true,
                verificationStatus: "approved",
                pricing: { perDay: 150, perMonth: 1200 }
            }
        ];
        const createdGyms = await Gym.insertMany(gymData);
        console.log(`Seeded ${createdGyms.length} gyms.`);

        // 4. Seed Trainer Profile
        const trainerProfile = await Trainer.create({
            userId: trainerUser._id,
            gymId: createdGyms[0]._id,
            specialization: ["Bodybuilding", "HIIT"],
            bio: "Certified personal trainer with 5 years experience.",
            isActive: true
        });
        console.log("Seeded trainer profile.");

        // 5. Seed Membership Plans
        const plans = [];
        for (const gym of createdGyms) {
            plans.push(
                { gymId: gym._id, ownerId: gym.ownerId, title: "Monthly Standard", description: "Standard monthly access", price: gym.pricing.perMonth, durationInDays: 30, isActive: true },
                { gymId: gym._id, ownerId: gym.ownerId, title: "Daily Access", description: "Access for one day", price: gym.pricing.perDay, durationInDays: 1, isActive: true }
            );
        }
        const createdPlans = await MembershipPlan.insertMany(plans);
        console.log("Seeded membership plans.");

        // 6. Seed User Membership (so they can see sessions)
        const dummyPayment = await Payment.create({
            userId: memberUser._id,
            amount: 1500,
            type: "membership",
            status: "completed"
        });

        await UserMembership.create({
            userId: memberUser._id,
            gymId: createdGyms[0]._id,
            planId: createdPlans[0]._id,
            paymentId: dummyPayment._id,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: "active"
        });
        console.log("Seeded user membership.");

        // 7. Seed Training Sessions
        const sessions = [
            {
                trainerId: trainerProfile._id,
                gymId: createdGyms[0]._id,
                title: "Morning HIIT",
                description: "Start your day with high intensity.",
                thumbnail: sessionImages[0],
                durationMinutes: 45,
                price: 500,
                isActive: true
            },
            {
                trainerId: trainerProfile._id,
                gymId: createdGyms[1]._id,
                title: "Heavy Lifting",
                description: "Powerlifting session for all levels.",
                thumbnail: sessionImages[1],
                durationMinutes: 60,
                price: 800,
                isActive: true
            }
        ];
        await TrainingSession.insertMany(sessions);
        console.log("Seeded training sessions.");

        // 8. Seed Workout Plans
        const workoutPlans = [
            {
                ownerId: memberUser._id,
                name: "My First Plan",
                description: "Introductory workout plan",
                isTemplate: false,
                days: [
                    {
                        dayNumber: 1,
                        title: "Upper Body",
                        exercises: [
                            { exerciseId: createdExercises[0]._id, sets: 3, reps: 10, order: 1 },
                            { exerciseId: createdExercises[2]._id, sets: 4, reps: 12, order: 2 }
                        ]
                    }
                ]
            }
        ];
        await WorkoutPlan.insertMany(workoutPlans);
        console.log("Seeded workout plans.");

        console.log("Seeding complete!");
        await mongoose.disconnect();
    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
}

seed();
