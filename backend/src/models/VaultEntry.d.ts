import mongoose from 'mongoose';
declare const VaultEntry: mongoose.Model<{
    password: string;
    site: string;
    username: string;
    notes: string;
    favorite: boolean;
    userId: mongoose.Types.ObjectId;
    iv?: string | null;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    password: string;
    site: string;
    username: string;
    notes: string;
    favorite: boolean;
    userId: mongoose.Types.ObjectId;
    iv?: string | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    password: string;
    site: string;
    username: string;
    notes: string;
    favorite: boolean;
    userId: mongoose.Types.ObjectId;
    iv?: string | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    password: string;
    site: string;
    username: string;
    notes: string;
    favorite: boolean;
    userId: mongoose.Types.ObjectId;
    iv?: string | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    password: string;
    site: string;
    username: string;
    notes: string;
    favorite: boolean;
    userId: mongoose.Types.ObjectId;
    iv?: string | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    password: string;
    site: string;
    username: string;
    notes: string;
    favorite: boolean;
    userId: mongoose.Types.ObjectId;
    iv?: string | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    password: string;
    site: string;
    username: string;
    notes: string;
    favorite: boolean;
    userId: mongoose.Types.ObjectId;
    iv?: string | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    password: string;
    site: string;
    username: string;
    notes: string;
    favorite: boolean;
    userId: mongoose.Types.ObjectId;
    iv?: string | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export default VaultEntry;
//# sourceMappingURL=VaultEntry.d.ts.map

