'use client';

import React, { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    PieChart,
    Pie,
    Cell
} from 'recharts';

// SHADCN/UI Imports
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { getCountryCode, getLast30Days } from '@/lib/utils';
import Image from 'next/image';
import { Globe } from 'lucide-react';

// The geoUrl is used for the world map visualization
const geoUrl =
    'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Chart config
const barChartConfig = {
    unique_visitors: {
        label: "Visitors",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

// Define your Analytics Type (as provided in your original code)
type AnalyticsType = {
    countryDistribution: { country: string; visitors: string }[];
    visitorCoordinates: { latitude: number; longitude: number }[];
    deviceTypeDistribution: { device_type: string; count: string }[];
    browserDistribution: { browser: string; count: string }[];
    osDistribution: { os: string; count: string }[];
    topReferrers: { referrer: string; count: string }[]; // New Card added for this
    dailyVisitorsTrend: { date: string; unique_visitors: string }[];
    languagePreferences: { accept_language: string; count: string }[]; // Not rendered in this example
    averageVisitsPerIp: number;
    totalUniqueVisitors: string;
};

const AnalyticsPage = ({ id, token }: { id: string; token: string }) => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [analytics, setAnalytics] = useState<AnalyticsType | null>(null);

    const last30Days = getLast30Days()

    // Fill missing days with zero visitors
    const filledVisitorsTrend = last30Days.map((dateStr) => {
        const found = analytics?.dailyVisitorsTrend.find((d) => d.date === dateStr)
        return {
            date: dateStr,
            unique_visitors: found ? Number(found.unique_visitors) : 0,
        }
    })

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/analytics/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: 'no-store',
                });

                if (!res.ok) throw new Error(`Failed to fetch project (${res.status})`);
                const json = await res.json();
                if (!json.success) throw new Error(json.error || 'Unexpected error');

                setAnalytics(json.analytics);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Something went wrong.');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [id, token]);

    console.log(analytics);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;
    if (!analytics) return <div>No analytics data available.</div>;

    // Helper to render the Top Referrers list
    const renderTopReferrers = () => (
        <div className="space-y-2">
            {analytics.topReferrers.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2">
                    <span className="truncate text-sm font-medium">{item.referrer || '(Direct)'}</span>
                    <Badge variant="secondary">{item.count} visitors</Badge>
                </div>
            ))}
        </div>
    );

    const renderCountryDistribution = () => {
        const data = analytics.countryDistribution;
        if (!data?.length) {
            return <p className="text-sm text-muted-foreground">No country data available.</p>;
        }

        return (
            <div className="space-y-2">
                {data.map((item, index) => {
                    const countryCode = getCountryCode(item.country);
                    const countryName = item.country === "unknown" ? "Unknown" : item.country;
                    const visitors = Number(item.visitors) || 0;

                    return (
                        <div
                            key={index}
                            className="flex items-center justify-between border-b pb-2 last:border-none"
                        >
                            <div className="flex items-center space-x-2">
                                {countryCode ? (
                                    <>
                                        <Image
                                            src={`https://flagcdn.com/16x12/${countryCode}.png`}
                                            width={16}
                                            height={12}
                                            alt={countryCode}
                                        />
                                    </>
                                ) : (
                                    <span className="text-muted-foreground"><Globe size={14}/></span>
                                )}
                                <span className="text-sm font-medium truncate">{countryName}</span>
                            </div>

                            <Badge variant="secondary">{visitors} visitors</Badge>
                        </div>

                    );
                })}
            </div>
        );
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Vercel Project Analytics Dashboard</h1>

            {/* TOP METRICS GRID */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Unique Visitors</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-2'>
                        <div className="text-2xl font-bold">{analytics.totalUniqueVisitors}</div>
                        <p className="text-xs text-muted-foreground">Last 7 days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Visits per IP</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-2'>
                        <div className="text-2xl font-bold">{analytics.averageVisitsPerIp.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Across all time</p>
                    </CardContent>
                </Card>
            </div>

            {/* CHARTS GRID */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Daily Unique Visitors Trend</CardTitle>
                        <CardDescription>
                            Visitor activity over the last 30 days.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={barChartConfig}
                            className="aspect-auto h-[350px] w-full"
                        >
                            <BarChart
                                accessibilityLayer
                                data={filledVisitorsTrend}
                                margin={{ left: 12, right: 12 }}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    minTickGap={32}
                                    tickFormatter={(val) => {
                                        const date = new Date(val)
                                        return date.toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                    }}
                                />
                                <Bar
                                    dataKey="unique_visitors"
                                    fill="#fbbf24"
                                    radius={[4, 4, 0, 0]}
                                />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            className="w-[150px]"
                                            nameKey="unique_visitors"
                                            labelFormatter={(value) =>
                                                new Date(value).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })
                                            }
                                        />
                                    }
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Device Type Distribution (Bar Chart) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Device Distribution</CardTitle>
                        <CardDescription>
                            Breakdown by device type (Desktop, Mobile, Tablet).
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <ChartContainer config={barChartConfig} className="h-[250px] w-full">
                            <PieChart>
                                <Pie
                                    data={analytics.deviceTypeDistribution.map(d => ({
                                        ...d,
                                        count: Number(d.count),
                                    }))}
                                    dataKey="count"
                                    nameKey="device_type"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={({ device_type, percent }) =>
                                        `${device_type} ${(percent * 100).toFixed(0)}%`
                                    }
                                >
                                    {analytics.deviceTypeDistribution.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={
                                                [
                                                    "#f54900",
                                                    "#009689",
                                                    "#104e64",
                                                    "#ffb900",
                                                    "#fe9a00",
                                                ][index % 5]
                                            }
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


                {/* Browser Distribution (Bar Chart) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Browser Share</CardTitle>
                        <CardDescription>Top browsers used by your visitors.</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <ChartContainer config={barChartConfig} className="h-[250px] w-full">
                            <BarChart
                                data={analytics.browserDistribution.map(d => ({
                                    ...d,
                                    count: Number(d.count),
                                }))}
                                margin={{ top: 16, right: 16, left: 8, bottom: 8 }}
                            >
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="browser"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    stroke="hsl(var(--muted-foreground))"
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    stroke="hsl(var(--muted-foreground))"
                                    allowDecimals={false}
                                />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            className="w-[120px]"
                                            nameKey="browser"
                                            labelFormatter={(value) => `Browser: ${value}`}
                                        />
                                    }
                                />
                                <Bar
                                    dataKey="count"
                                    fill="hsl(var(--chart-2))"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* OS Distribution (Bar Chart) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Operating System</CardTitle>
                        <CardDescription>Breakdown by operating system.</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <ChartContainer config={barChartConfig} className="h-[250px] w-full">
                            <BarChart
                                data={analytics.osDistribution.map((d) => ({
                                    ...d,
                                    count: Number(d.count),
                                }))}
                                margin={{ top: 16, right: 16, left: 8, bottom: 8 }}
                            >
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="os"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    stroke="hsl(var(--muted-foreground))"
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    stroke="hsl(var(--muted-foreground))"
                                    allowDecimals={false}
                                />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            className="w-[140px]"
                                            nameKey="os"
                                            labelFormatter={(value) => `OS: ${value}`}
                                        />
                                    }
                                />
                                <Bar
                                    dataKey="count"
                                    fill="hsl(var(--chart-3))"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Top Referrers (List) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Referrers</CardTitle>
                        <CardDescription>The websites driving the most traffic.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {renderTopReferrers()}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Countries</CardTitle>
                        <CardDescription>Visitors by country of origin.</CardDescription>
                    </CardHeader>

                    <CardContent>
                        {renderCountryDistribution()}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AnalyticsPage;
