"use client"

import { TrendingUp, Globe } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, Cell, PieChart, Pie } from "recharts"
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
import { Badge } from "./ui/badge"
import Image from "next/image"

// Utility to get 2-letter country code
const getCountryCode = (country: string) => {
    const map: Record<string, string> = {
        Ukraine: "ua",
        India: "in",
        USA: "us",
        Germany: "de",
        France: "fr",
        Brazil: "br",
        Japan: "jp",
        Unknown: "xx",
    }
    return map[country] || "xx"
}

// -------------------------
// Consistent dummy data
// -------------------------
const analytics = {
    countryDistribution: [
        { country: "Ukraine", visitors: 420 },
        { country: "India", visitors: 310 },
        { country: "USA", visitors: 290 },
        { country: "Germany", visitors: 180 },
        { country: "France", visitors: 150 },
    ],
    deviceTypeDistribution: [
        { device_type: "Desktop", count: 420 },
        { device_type: "Mobile", count: 310 },
        { device_type: "Tablet", count: 180 },
    ],
    topReferrers: [
        { referrer: "google.com", count: 420 },
        { referrer: "instagram.com", count: 310 },
        { referrer: "linkedin.com", count: 290 },
        { referrer: "facebook.com", count: 180 },
        { referrer: "(Direct)", count: 150 },
    ],
}

const barChartConfig = {
    unique_visitors: {
        label: "Visitors",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

const chartData = Array.from({ length: 30 }, (_, i) => ({
    day: String(i + 1),
    unique_visitors: Math.floor(100 + Math.random() * 400),
}))

// -------------------------
// Render helpers
// -------------------------
const renderTopReferrers = () => (
    <div className="space-y-2">
        {analytics.topReferrers.map((item, index) => (
            <div key={index} className="flex items-center justify-between border-b pb-2">
                <span className="truncate text-sm font-medium">{item.referrer}</span>
                <Badge variant="secondary">{item.count} visitors</Badge>
            </div>
        ))}
    </div>
)

const renderCountryDistribution = () => (
    <div className="space-y-2">
        {analytics.countryDistribution.map((item, index) => {
            const countryCode = getCountryCode(item.country)
            return (
                <div
                    key={index}
                    className="flex items-center justify-between border-b pb-2 last:border-none"
                >
                    <div className="flex items-center space-x-2">
                        {countryCode !== "xx" ? (
                            <>
                                <Image
                                    src={`https://flagcdn.com/16x12/${countryCode}.png`}
                                    width={16}
                                    height={12}
                                    alt={item.country}
                                />
                            </>
                        ) : (
                            <span className="text-muted-foreground">
                                <Globe size={14} />
                            </span>
                        )}
                        <span className="text-sm font-medium truncate">{item.country}</span>
                    </div>
                    <Badge variant="secondary">{item.visitors} visitors</Badge>
                </div>
            )
        })}
    </div>
)

// -------------------------
// Main Component
// -------------------------
export function LineChartLandingPage() {
    const fillColor = "#FFCA28"

    return (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {/* Visitors Chart */}
            <Card className="w-full md:col-span-2">
                <CardHeader>
                    <CardTitle>Website Visitors</CardTitle>
                    <CardDescription>
                        {new Date().toLocaleString("default", { month: "long" })} 2025
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={barChartConfig} className="h-[300px] w-full">
                        <BarChart data={chartData} margin={{ left: 12, right: 12, top: 8 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis
                                interval={5}
                                dataKey="day"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                            <Bar
                                dataKey="unique_visitors"
                                radius={[4, 4, 0, 0]}
                                isAnimationActive={false}
                            >
                                {chartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={fillColor} />
                                ))}
                            </Bar>

                            <ChartTooltip
                                cursor={{ fill: "transparent" }}
                                content={
                                    <ChartTooltipContent
                                        className="w-[150px]"
                                        nameKey="unique_visitors"
                                        labelFormatter={(value) => `Day ${value}`}
                                    />
                                }
                            />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 leading-none font-medium">
                        Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="text-muted-foreground leading-none">
                        Showing total website visitors for{" "}
                        {new Date().toLocaleString("default", { month: "long" })}
                    </div>
                </CardFooter>
            </Card>

            {/* Device Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle>Device Distribution</CardTitle>
                    <CardDescription>Breakdown by device type (Desktop, Mobile, Tablet).</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={barChartConfig} className="h-[250px] w-full">
                        <PieChart>
                            <Pie
                                data={analytics.deviceTypeDistribution}
                                dataKey="count"
                                nameKey="device_type"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={({ device_type, percent }) =>
                                    `${device_type} ${(percent * 100).toFixed(0)}%`
                                }
                            >
                                {analytics.deviceTypeDistribution.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={["#f54900", "#009689", "#104e64"][index % 3]}
                                    />
                                ))}
                            </Pie>
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        nameKey="device_type"
                                        labelFormatter={(value) => `Device: ${value}`}
                                    />
                                }
                            />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Top Referrers */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Referrers</CardTitle>
                    <CardDescription>The websites driving the most traffic.</CardDescription>
                </CardHeader>
                <CardContent>{renderTopReferrers()}</CardContent>
            </Card>

            {/* Top Countries */}
            <Card className="w-full md:col-span-2">
                <CardHeader>
                    <CardTitle>Top Countries</CardTitle>
                    <CardDescription>Visitors by country of origin.</CardDescription>
                </CardHeader>
                <CardContent>{renderCountryDistribution()}</CardContent>
            </Card>
        </div>
    )
}
