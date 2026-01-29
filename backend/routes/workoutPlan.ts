import { Router } from "express";
import { workoutPlanController } from "../controllers/workoutPlanController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

// All workout plan routes require authentication
router.use(requireAuth);

router.post("/", workoutPlanController.createPlan);
router.get("/", workoutPlanController.getUserPlans);
router.get("/templates", workoutPlanController.getTemplates);
router.post("/clone/:templateId", workoutPlanController.cloneTemplate);
router.post("/auto-generate", workoutPlanController.autoGenerate);
router.put("/:id", workoutPlanController.updatePlan);
router.delete("/:id", workoutPlanController.deletePlan);

export default router;
