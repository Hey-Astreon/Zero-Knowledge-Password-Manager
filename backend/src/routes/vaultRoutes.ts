import express from 'express';
import { getAllEntries, createEntry, deleteEntry, updateEntry } from '../controllers/vaultController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { vaultEntrySchema } from '../utils/validators.js';

const router = express.Router();

router.use(protect); // All vault routes are protected

router.route('/')
    .get(getAllEntries)
    .post(validate(vaultEntrySchema), createEntry);

router.route('/:id')
    .delete(deleteEntry)
    .patch(validate(vaultEntrySchema.partial()), updateEntry);

export default router;
