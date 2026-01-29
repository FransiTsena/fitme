import mongoose from 'mongoose';
import { Exercise } from '../models/exerciseModel.js';
import "dotenv/config";

const exercises = [
    // Chest
    {
        name: "Barbell Bench Press",
        category: "Strength",
        bodyPart: "Chest",
        equipment: "Barbell",
        instructions: ["Lie on bench", "Lower barbell to chest", "Press up"],
        demoUrl: "https://www.youtube.com/watch?v=rT7DgVCn7iI"
    },
    {
        name: "Dumbbell Flyes",
        category: "Strength",
        bodyPart: "Chest",
        equipment: "Dumbbells",
        instructions: ["Lie on bench", "Arms extended", "Lower in arc"],
        demoUrl: "https://www.youtube.com/watch?v=eGjt4lk6g34"
    },
    // Back
    {
        name: "Deadlift",
        category: "Strength",
        bodyPart: "Back",
        equipment: "Barbell",
        instructions: ["Feet hip-width", "Grip bar", "Lift with legs and back"],
        demoUrl: "https://www.youtube.com/watch?v=op9kVnSso6Q"
    },
    {
        name: "Lat Pulldown",
        category: "Strength",
        bodyPart: "Back",
        equipment: "Machine",
        instructions: ["Sit at machine", "Pull bar to upper chest", "Control return"],
        demoUrl: "https://www.youtube.com/watch?v=CAwf7n6Luuc"
    },
    // Legs
    {
        name: "Squat",
        category: "Strength",
        bodyPart: "Legs",
        equipment: "Barbell",
        instructions: ["Bar on traps", "Lower hips", "Stand up"],
        demoUrl: "https://www.youtube.com/watch?v=MVMnk0HiTMg"
    },
    {
        name: "Leg Press",
        category: "Strength",
        bodyPart: "Legs",
        equipment: "Machine",
        instructions: ["Sit in machine", "Push platform", "Control descent"],
        demoUrl: "https://www.youtube.com/watch?v=IZxyjW7MPJQ"
    },
    // Shoulders
    {
        name: "Overhead Press",
        category: "Strength",
        bodyPart: "Shoulders",
        equipment: "Barbell",
        instructions: ["Bar at collarbones", "Press overhead", "Lock out"],
        demoUrl: "https://www.youtube.com/watch?v=2yjwxt_fQJI"
    },
    {
        name: "Lateral Raise",
        category: "Strength",
        bodyPart: "Shoulders",
        equipment: "Dumbbells",
        instructions: ["Stand tall", "Raise arms to sides", "Lower slowly"],
        demoUrl: "https://www.youtube.com/watch?v=3VcKaXpzqRo"
    },
    // Arms
    {
        name: "Bicep Curl",
        category: "Strength",
        bodyPart: "Arms",
        equipment: "Dumbbells",
        instructions: ["Hold dumbbells", "Curl to shoulders", "Lower slowly"],
        demoUrl: "https://www.youtube.com/watch?v=ykJmrZ5v0Oo"
    },
    {
        name: "Tricep Pushdown",
        category: "Strength",
        bodyPart: "Arms",
        equipment: "Cable",
        instructions: ["Grip bar", "Push down to hips", "Return slow"],
        demoUrl: "https://www.youtube.com/watch?v=2-LAMcpzHLU"
    },
    // Core
    {
        name: "Plank",
        category: "Stability",
        bodyPart: "Core",
        equipment: "None",
        instructions: ["Forearms on floor", "Hold straight line", "Tighten core"],
        demoUrl: "https://www.youtube.com/watch?v=pSHjTRCQxIw"
    },
    {
        name: "Crunches",
        category: "Strength",
        bodyPart: "Core",
        equipment: "None",
        instructions: ["Lie on back", "Lift shoulders", "Squeeze abs"],
        demoUrl: "https://www.youtube.com/watch?v=Xyd_fa5zoEU"
    },
    // Cardio
    {
        name: "Treadmill Run",
        category: "Cardio",
        bodyPart: "Full Body",
        equipment: "Treadmill",
        instructions: ["Set speed", "Maintain posture", "Breathe steady"],
        demoUrl: ""
    }
];

async function seedExercises() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fitme");
        console.log("Connected to MongoDB for exercise seeding");

        await Exercise.deleteMany({});
        console.log("Cleared existing exercises");

        await Exercise.insertMany(exercises);
        console.log(`Successfully seeded ${exercises.length} exercises`);

        await mongoose.connection.close();
    } catch (err) {
        console.error("Error seeding exercises:", err);
        process.exit(1);
    }
}

seedExercises();
