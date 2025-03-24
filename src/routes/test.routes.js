import { Router } from "express";
import { test } from "../controllers/test.controllers.js";



const router = Router();

router.route("/").get(test);

export default router;