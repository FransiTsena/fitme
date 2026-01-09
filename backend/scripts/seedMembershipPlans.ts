import mongoose from 'mongoose';
import { Gym } from '../models/gymModel.js';
import { MembershipPlan } from '../models/membershipModel.js';
import "dotenv/config";

interface MembershipPlanData {
  title: string;
  description: string;
  durationInDays: number;
  price: number;
  isActive: boolean;
}

const membershipPlansData: MembershipPlanData[] = [
  {
    title: "Daily Pass",
    description: "Access to the gym for one day",
    durationInDays: 1,
    price: 100,
    isActive: true
  },
  {
    title: "Weekly Pass",
    description: "Access to the gym for 7 days",
    durationInDays: 7,
    price: 500,
    isActive: true
  },
  {
    title: "Monthly Pass",
    description: "Unlimited access to the gym for 30 days",
    durationInDays: 30,
    price: 1500,
    isActive: true
  },
  {
    title: "Quarterly Pass",
    description: "Unlimited access to the gym for 90 days",
    durationInDays: 90,
    price: 3500,
    isActive: true
  },
  {
    title: "Annual Pass",
    description: "Unlimited access to the gym for 365 days",
    durationInDays: 365,
    price: 12000,
    isActive: true
  }
];

const seedMembershipPlans = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected to MongoDB');

    // Get all gyms
    const gyms = await Gym.find({});
    console.log(`Found ${gyms.length} gyms to add plans to`);

    // Clear existing membership plans
    await MembershipPlan.deleteMany({});
    console.log('Cleared existing membership plans');

    // Create membership plans for each gym
    let totalPlansCreated = 0;
    for (const gym of gyms) {
      console.log(`Creating plans for gym: ${gym.name}`);
      
      for (const planData of membershipPlansData) {
        const plan = new MembershipPlan({
          gymId: gym._id,
          ownerId: gym.ownerId,
          title: planData.title,
          description: planData.description,
          durationInDays: planData.durationInDays,
          price: planData.price,
          isActive: planData.isActive
        });

        await plan.save();
        totalPlansCreated++;
        console.log(`  - Created plan: ${planData.title} for ${gym.name}`);
      }
    }

    console.log(`\nSuccessfully created ${totalPlansCreated} membership plans for ${gyms.length} gyms`);
    
    // Disconnect from database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    console.log('Membership plan seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding membership plans:', error);
    process.exit(1);
  }
};

seedMembershipPlans();