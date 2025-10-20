"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "Website visitors this month"

const chartData = [
    { day: "1", visitors: 120 },
    { day: "2", visitors: 150 },
    { day: "3", visitors: 180 },
    { day: "4", visitors: 140 },
    { day: "5", visitors: 160 },
    { day: "6", visitors: 200 },
    { day: "7", visitors: 220 },
    // ...continue for all days of the month
]

const chartConfig = {
    visitors: {
        label: "Visitors",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

export function LineChartLandingPage() {
    return (
        <Card className="w-full aspect-video bg-transparent">
            <CardHeader>
                <CardTitle>Website Visitors</CardTitle>
                <CardDescription>
                    {new Date().toLocaleString("default", { month: "long" })} 2025
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="day"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Line
                            dataKey="visitors"
                            type="natural"
                            stroke='#fbbf24'
                            strokeWidth={2}
                            dot={{
                                fill: "#fbbf24",
                            }}
                            activeDot={{
                                r: 6,
                            }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                    Showing total website visitors for {new Date().toLocaleString("default", { month: "long" })}
                </div>
            </CardFooter>
        </Card>
    )
}
