import { NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import { getInvoiceCollection } from '@/lib/models/Invoice';
import { getSalaryPaymentCollection } from '@/lib/models/SalaryPayment';
import { handleError, AuthorizationError } from '@/lib/errors';

export type PnLPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface PeriodBucket {
    label: string;
    revenue: number;
    expenses: number;
    net: number;
    invoiceCount: number;
}

interface PnLResponse {
    period: PnLPeriod;
    summary: {
        totalRevenue: number;
        totalExpenses: number;
        netProfit: number;
        invoiceCount: number;
        profitMargin: number; // percentage
    };
    breakdown: PeriodBucket[];
}

function startOfDay(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function endOfDay(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function getMonthName(m: number) {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m];
}

async function getHandler(request: AuthenticatedRequest) {
    try {
        if (request.user?.role !== 'admin') {
            throw new AuthorizationError('Only admins can view accounts');
        }

        const { searchParams } = new URL(request.url);
        const period = (searchParams.get('period') as PnLPeriod) || 'monthly';

        const now = new Date();
        const invoiceCol = await getInvoiceCollection();
        const salaryCol = await getSalaryPaymentCollection();

        const breakdown: PeriodBucket[] = [];

        if (period === 'daily') {
            // Last 30 days
            for (let i = 29; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(now.getDate() - i);
                const from = startOfDay(d);
                const to = endOfDay(d);

                const label = `${d.getDate()} ${getMonthName(d.getMonth())}`;

                const [invoices, salaries] = await Promise.all([
                    invoiceCol.find({ status: 'Paid', issueDate: { $gte: from, $lte: to } }).toArray(),
                    salaryCol.find({ paymentDate: { $gte: from, $lte: to } }).toArray(),
                ]);

                const revenue = invoices.reduce((s, inv) => s + inv.total, 0);
                const expenses = salaries.reduce((s, p) => s + p.amount, 0);
                breakdown.push({ label, revenue, expenses, net: revenue - expenses, invoiceCount: invoices.length });
            }
        } else if (period === 'weekly') {
            // Last 12 weeks
            for (let i = 11; i >= 0; i--) {
                const weekEnd = new Date(now);
                weekEnd.setDate(now.getDate() - i * 7);
                const weekStart = new Date(weekEnd);
                weekStart.setDate(weekEnd.getDate() - 6);
                const from = startOfDay(weekStart);
                const to = endOfDay(weekEnd);

                const weekLabel = `${weekStart.getDate()} ${getMonthName(weekStart.getMonth())}`;

                const [invoices, salaries] = await Promise.all([
                    invoiceCol.find({ status: 'Paid', issueDate: { $gte: from, $lte: to } }).toArray(),
                    salaryCol.find({ paymentDate: { $gte: from, $lte: to } }).toArray(),
                ]);

                const revenue = invoices.reduce((s, inv) => s + inv.total, 0);
                const expenses = salaries.reduce((s, p) => s + p.amount, 0);
                breakdown.push({ label: weekLabel, revenue, expenses, net: revenue - expenses, invoiceCount: invoices.length });
            }
        } else if (period === 'monthly') {
            // Last 12 months
            for (let i = 11; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const from = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
                const to = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

                const label = `${getMonthName(d.getMonth())} ${d.getFullYear()}`;

                const monthNum = d.getMonth() + 1;
                const yearNum = d.getFullYear();

                const [invoices, salaries] = await Promise.all([
                    invoiceCol.find({ status: 'Paid', issueDate: { $gte: from, $lte: to } }).toArray(),
                    salaryCol.find({ month: monthNum, year: yearNum }).toArray(),
                ]);

                const revenue = invoices.reduce((s, inv) => s + inv.total, 0);
                const expenses = salaries.reduce((s, p) => s + p.amount, 0);
                breakdown.push({ label, revenue, expenses, net: revenue - expenses, invoiceCount: invoices.length });
            }
        } else if (period === 'yearly') {
            // Last 5 years
            for (let i = 4; i >= 0; i--) {
                const year = now.getFullYear() - i;
                const from = new Date(year, 0, 1, 0, 0, 0, 0);
                const to = new Date(year, 11, 31, 23, 59, 59, 999);

                const [invoices, salaries] = await Promise.all([
                    invoiceCol.find({ status: 'Paid', issueDate: { $gte: from, $lte: to } }).toArray(),
                    salaryCol.find({ year }).toArray(),
                ]);

                const revenue = invoices.reduce((s, inv) => s + inv.total, 0);
                const expenses = salaries.reduce((s, p) => s + p.amount, 0);
                breakdown.push({ label: `${year}`, revenue, expenses, net: revenue - expenses, invoiceCount: invoices.length });
            }
        }

        // Summary = last bucket (current period) totals across all buckets summed
        const totalRevenue = breakdown.reduce((s, b) => s + b.revenue, 0);
        const totalExpenses = breakdown.reduce((s, b) => s + b.expenses, 0);
        const netProfit = totalRevenue - totalExpenses;
        const totalInvoices = breakdown.reduce((s, b) => s + b.invoiceCount, 0);
        const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

        const response: PnLResponse = {
            period,
            summary: {
                totalRevenue,
                totalExpenses,
                netProfit,
                invoiceCount: totalInvoices,
                profitMargin,
            },
            breakdown,
        };

        return NextResponse.json({ success: true, data: response });
    } catch (error) {
        const { statusCode, message } = handleError(error);
        return NextResponse.json({ success: false, error: message }, { status: statusCode });
    }
}

export const GET = requireAuth(getHandler);
