import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface UserProfile {
    name: string;
}
export interface ForensicsCase {
    id: string;
    status: CaseStatus;
    title: string;
    createdAt: Time;
    analystId: Principal;
    notes: string;
    findings: string;
    imageId: string;
}
export enum CaseStatus {
    tampered = "tampered",
    clean = "clean",
    suspicious = "suspicious"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCase(title: string, imageId: string): Promise<void>;
    deleteCase(id: string): Promise<void>;
    getAllCases(): Promise<Array<ForensicsCase>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCaseById(id: string): Promise<ForensicsCase>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCase(id: string, status: CaseStatus, notes: string, findings: string): Promise<void>;
}
