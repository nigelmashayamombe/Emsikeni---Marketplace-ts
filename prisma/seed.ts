
import { PrismaClient, Role, AccountStatus, DocumentType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash('password123', 12);

    const users = [
        // Super Admin
        {
            email: 'super@emsikeni.com',
            phone: '+12345678901',
            role: Role.SUPER_ADMIN,
            fullName: 'Super Admin User',
            isSuperAdmin: true,
            status: AccountStatus.ACTIVE,
            emailVerified: true,
            phoneVerified: true,
        },
        // Admins
        {
            email: 'admin1@emsikeni.com',
            phone: '+12345678902',
            role: Role.ADMIN,
            fullName: 'Admin One',
            status: AccountStatus.ACTIVE,
            emailVerified: true,
            phoneVerified: true,
        },
        {
            email: 'admin2@emsikeni.com',
            phone: '+12345678903',
            role: Role.ADMIN,
            fullName: 'Admin Two',
            status: AccountStatus.ACTIVE,
            emailVerified: true,
            phoneVerified: true,
        },
        // Sellers
        {
            email: 'seller1@emsikeni.com',
            phone: '+12345678904',
            role: Role.SELLER,
            fullName: 'Seller One',
            status: AccountStatus.ACTIVE,
            emailVerified: true,
            phoneVerified: true,
            documents: {
                create: [
                    { type: DocumentType.NATIONAL_ID, url: 'http://example.com/id1.jpg' },
                    { type: DocumentType.PROOF_OF_RESIDENCE, url: 'http://example.com/res1.jpg' },
                ]
            }
        },
        {
            email: 'seller2@emsikeni.com',
            phone: '+12345678905',
            role: Role.SELLER,
            fullName: 'Seller Two',
            status: AccountStatus.ACTIVE,
            emailVerified: true,
            phoneVerified: true,
            documents: {
                create: [
                    { type: DocumentType.NATIONAL_ID, url: 'http://example.com/id2.jpg' },
                    { type: DocumentType.PROOF_OF_RESIDENCE, url: 'http://example.com/res2.jpg' },
                ]
            }
        },
        // Buyers
        {
            email: 'buyer1@emsikeni.com',
            phone: '+12345678906',
            role: Role.BUYER,
            fullName: 'Buyer One',
            status: AccountStatus.ACTIVE,
            emailVerified: true,
            phoneVerified: true,
            address: '123 Buyer St',
            gender: 'Male',
            dateOfBirth: new Date('1990-01-01'),
            nationalId: 'ID123456789'
        },
        {
            email: 'buyer2@emsikeni.com',
            phone: '+12345678907',
            role: Role.BUYER,
            fullName: 'Buyer Two',
            status: AccountStatus.ACTIVE,
            emailVerified: true,
            phoneVerified: true,
            address: '456 Buyer Ave',
            gender: 'Female',
            dateOfBirth: new Date('1995-05-05'),
            nationalId: 'ID987654321'
        },
        // Drivers
        {
            email: 'driver1@emsikeni.com',
            phone: '+12345678908',
            role: Role.DRIVER,
            fullName: 'Driver One',
            status: AccountStatus.ACTIVE,
            emailVerified: true,
            phoneVerified: true,
            driverDetail: {
                create: {
                    licenseNumber: 'LIC123456',
                    vehicleMake: 'Toyota',
                    vehicleModel: 'Corolla',
                    vehicleNumberPlate: 'ABC-123',
                }
            },
            documents: {
                create: [
                    { type: DocumentType.DRIVER_LICENSE, url: 'http://example.com/license1.jpg' },
                    { type: DocumentType.VEHICLE_DOCUMENT, url: 'http://example.com/vehicle1.jpg' },
                ]
            }
        },
        {
            email: 'driver2@emsikeni.com',
            phone: '+12345678909',
            role: Role.DRIVER,
            fullName: 'Driver Two',
            status: AccountStatus.ACTIVE,
            emailVerified: true,
            phoneVerified: true,
            driverDetail: {
                create: {
                    licenseNumber: 'LIC654321',
                    vehicleMake: 'Honda',
                    vehicleModel: 'Civic',
                    vehicleNumberPlate: 'XYZ-789',
                }
            },
            documents: {
                create: [
                    { type: DocumentType.DRIVER_LICENSE, url: 'http://example.com/license2.jpg' },
                    { type: DocumentType.VEHICLE_DOCUMENT, url: 'http://example.com/vehicle2.jpg' },
                ]
            }
        },
    ];

    console.log('Seeding users...');

    for (const user of users) {
        const { documents, driverDetail, ...userData } = user;

        // Check if user exists to avoid unique constraint errors during re-runs
        const existingUser = await prisma.user.findUnique({
            where: { email: userData.email }
        });

        if (!existingUser) {
            console.log(`Creating user: ${userData.email}`);
            await prisma.user.create({
                data: {
                    ...userData,
                    passwordHash,
                    documents: documents,
                    driverDetail: driverDetail
                }
            });
        } else {
            console.log(`User already exists: ${userData.email}, skipping...`);
            // Optional: Update fields if needed, but for now we skip to preserve existing data or avoid complexity
        }
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
