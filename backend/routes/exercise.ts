import { Router } from "express";
import { exerciseController } from "../controllers/exerciseController.js";

const router = Router();

router.get("/", exerciseController.getExercises);
router.get("/:id", exerciseController.getExerciseById);

export default router;
