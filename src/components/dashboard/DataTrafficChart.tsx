'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { mockChartData } from '@/lib/data';

const chartConfig = {
  requests: {
    label: 'Requests',
    color: 'hsl(var(--primary))',
  },
  responses: {
    label: 'Responses',
    color: 'hsl(var(--accent))',
  },
};

export default function DataTrafficChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Traffic</CardTitle>
        <CardDescription>Recent Requests vs. Responses</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={mockChartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 5)}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="requests" fill="var(--color-requests)" radius={4} />
            <Bar dataKey="responses" fill="var(--color-responses)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
