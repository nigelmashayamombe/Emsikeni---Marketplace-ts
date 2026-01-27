import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000/api/v1';

// Helper to create token
const generateToken = (userId: string, role: string) => {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
        console.warn('WARNING: JWT_ACCESS_SECRET not found in env, using default which might fail if server uses different secret');
    }
    return jwt.sign({ sub: userId, role }, secret || 'supersecret', { expiresIn: '1h' });
};

async function run() {
    try {
        console.log('Starting Inventory Verification...');

        // 1. Create Seller directly
        const email = `seller_${Date.now()}@test.com`;
        const seller = await prisma.user.create({
            data: {
                email,
                phone: `+1${Date.now()}`,
                role: 'SELLER',
                status: 'ACTIVE',
                passwordHash: 'hash', // generic
                emailVerified: true
            }
        });
        console.log('Created Seller:', seller.id);
        const token = generateToken(seller.id, 'SELLER');

        // 2. Create Category
        let category = await prisma.category.findFirst();
        if (!category) {
            category = await prisma.category.create({
                data: { name: 'Test Cat', slug: `test-cat-${Date.now()}` }
            });
        }
        console.log('Using Category:', category.id);

        // 3. Create Product
        const product = await prisma.product.create({
            data: {
                name: 'Test Product',
                description: 'Description 1234567890',
                price: 100,
                quantity: 10,
                sellerId: seller.id,
                categoryId: category.id,
                status: 'APPROVED',
                lowStockThreshold: 5
            }
        });
        console.log('Created Product:', product.id, 'Qty:', product.quantity);

        // 4. Test Adjust Stock (Decrease)
        // POST /inventory/:id/adjustment
        console.log('Testing Decrement Stock to 0...');
        try {
            const res1 = await axios.post(`${BASE_URL}/inventory/${product.id}/adjustment`,
                { adjustment: -10 },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            console.log('Decrement Result:', res1.data);

            if (res1.data.quantity !== 0 || res1.data.status !== 'OUT_OF_STOCK') {
                console.error('FAILED: Quantity should be 0 and status OUT_OF_STOCK');
            } else {
                console.log('PASSED: Decrement logic');
            }
        } catch (e: any) {
            console.error('Decrement Failed:', JSON.stringify(e.response?.data || e.message, null, 2));
        }

        // 5. Test Adjust Stock (Increase)
        console.log('Testing Increment Stock...');
        try {
            const res2 = await axios.post(`${BASE_URL}/inventory/${product.id}/adjustment`,
                { adjustment: 5 },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            console.log('Increment Result:', res2.data);

            if (res2.data.quantity !== 5 || res2.data.status !== 'APPROVED') { // Logic says reverts to APPROVED
                console.error('FAILED: Quantity should be 5 and status APPROVED');
            } else {
                console.log('PASSED: Increment logic');
            }
        } catch (e: any) {
            console.error('Increment Failed:', JSON.stringify(e.response?.data || e.message, null, 2));
        }

        // 6. Test Low Stock Warning
        // Threshold is 5. Qty is 5. So check if it appears in low stock list (<= 5).
        console.log('Testing Low Stock List...');
        try {
            const res3 = await axios.get(`${BASE_URL}/inventory/low-stock`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            console.log('Low Stock List Result Count:', res3.data.length);

            const found = res3.data.find((p: any) => p.id === product.id);
            if (found) {
                console.log('PASSED: Product found in low stock list');
            } else {
                console.error('FAILED: Product NOT found in low stock list. Actual list:', JSON.stringify(res3.data, null, 2));
            }
        } catch (e: any) {
            console.error('Low Stock List Failed:', JSON.stringify(e.response?.data || e.message, null, 2));
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

run();
