import VaultEntry from '../models/VaultEntry.js';
import { AppError } from '../utils/AppError.js';
export const getAllEntries = async (req, res, next) => {
    try {
        const entries = await VaultEntry.find({ userId: req.user._id }).sort('-createdAt');
        res.status(200).json({
            success: true,
            results: entries.length,
            data: {
                entries
            }
        });
    }
    catch (err) {
        next(err);
    }
};
export const createEntry = async (req, res, next) => {
    try {
        const { site, username, password, notes, favorite } = req.body;
        const newEntry = await VaultEntry.create({
            userId: req.user._id,
            site,
            username,
            password,
            notes,
            favorite
        });
        res.status(201).json({
            success: true,
            data: {
                entry: newEntry
            }
        });
    }
    catch (err) {
        next(err);
    }
};
export const deleteEntry = async (req, res, next) => {
    try {
        const entry = await VaultEntry.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });
        if (!entry) {
            return next(new AppError('No entry found with that ID', 404));
        }
        res.status(204).json({
            success: true,
            data: null
        });
    }
    catch (err) {
        next(err);
    }
};
export const updateEntry = async (req, res, next) => {
    try {
        const entry = await VaultEntry.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, { new: true, runValidators: true });
        if (!entry) {
            return next(new AppError('No entry found with that ID', 404));
        }
        res.status(200).json({
            success: true,
            data: {
                entry
            }
        });
    }
    catch (err) {
        next(err);
    }
};
//# sourceMappingURL=vaultController.js.map