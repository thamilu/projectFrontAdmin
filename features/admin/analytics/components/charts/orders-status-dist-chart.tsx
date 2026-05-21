"use client"

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardOverview } from "@/features/admin/analytics/types"

interface OrdersStatusDistChartProps {
  overview?: DashboardOverview
  isLoading?: boolean
}

export function OrdersStatusDistChart({ overview, isLoading }: OrdersStatusDistChartProps) {
  if (isLoading || !overview) {
    return (
      <Card className="col-span-1 lg:col-span-3">
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

  const data = [
    { name: 'Completed', value: overview.completedOrders, color: 'hsl(var(--chart-1))' }, // Green/Primary
    { name: 'Pending', value: overview.pendingOrders, color: 'hsl(var(--chart-2))' },   // Yellow/Warning
    { name: 'Cancelled', value: overview.cancelledOrders, color: 'hsl(var(--destructive))' }, // Red/Destructive
  ]

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>Orders by Status</CardTitle>
        <CardDescription>
          Distribution of order statuses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis
              dataKey="name"
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
            />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
