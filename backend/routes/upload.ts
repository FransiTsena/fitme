import { Router } from "express";
import { documentUpload } from "../config/multer.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.post("/image", requireAuth, documentUpload.single("image"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: "No file uploaded" });
        }

        // Cloudinary returns the URL in req.file.path
        // Local storage returns filename. We want to return a URL.
        let imageUrl = (req.file as any).path;

        // Check if it's a local file path (on Windows it might have backslashes)
        if (imageUrl && (imageUrl.includes("\\") || imageUrl.includes("uploads/"))) {
            // Convert local path to web URL
            const host = req.get("host");
            const protocol = req.protocol;
            imageUrl = `${protocol}://${host}/uploads/documents/${req.file.filename}`;
        }

        res.json({
            success: true,
            data: {
                url: imageUrl,
                filename: req.file.filename
            }
        });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
