"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RevenueDataPoint } from "@/types/dashboard"

interface OverviewSalesChartProps {
    data?: RevenueDataPoint[]
    isLoading?: boolean
}

export function OverviewSalesChart({ data = [], isLoading }: OverviewSalesChartProps) {
    if (isLoading) {
        return (
            <Card className="col-span-1 lg:col-span-4">
                <CardHeader>
                    <div className="h-6 w-32 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] animate-pulse rounded bg-muted" />
                </CardContent>
            </Card>
        )
    }

    // Format date for display
    const formattedData = data.map(item => ({
        ...item,
        formattedDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }))

    return (
        <Card className="col-span-1 lg:col-span-4">
            <CardHeader>
                <CardTitle>Sales Over Time</CardTitle>
                <CardDescription>
                    Daily revenue for the selected period
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={formattedData}>
                        <XAxis
                            dataKey="formattedDate"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                            contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                            labelStyle={{ color: 'hsl(var(--foreground))' }}
                            itemStyle={{ color: 'hsl(var(--primary))' }}
                            formatter={(value: number | undefined) => [`$${(value || 0).toFixed(2)}`, "Revenue"]}
                        />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
