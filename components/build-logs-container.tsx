'use client'

import React, { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { RefreshCcwIcon } from 'lucide-react'
import { Button } from './ui/button'

interface BuildLogsContainerProps {
    deploymentId: string
}

interface LogItem {
    event_id: string
    project_id?: string
    deployment_id: string
    timestamp: string
    log: string
    type?: 'info' | 'warn' | 'error' | 'success'
    step?: string
    meta?: string
}

const POLLING_INTERVAL = 3000
const MAX_EMPTY_FETCHES = 5

const BuildLogsContainer: React.FC<BuildLogsContainerProps> = ({ deploymentId }) => {
    const [logs, setLogs] = useState<LogItem[]>([])
    const [error, setError] = useState<string>("")
    const [isFinished, setIsFinished] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [refreshCounter, setRefreshCounter] = useState<number>(0) // trigger useEffect on refresh

    const lastTimestampRef = useRef('1970-01-01 00:00:00')
    const emptyFetchCountRef = useRef(0)
    const logsEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })

    const fetchLogs = async () => {
        if (isFinished) return
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/project/logs/${deploymentId}?lastTimestamp=${encodeURIComponent(lastTimestampRef.current)}&limit=200`, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            })
            if (!res.ok) throw new Error('Failed to fetch logs')
            const json = await res.json()
            const newLogs: LogItem[] = json?.data?.logs || []

            if (newLogs.length > 0) {
                setLogs(prev => [...prev, ...newLogs])
                lastTimestampRef.current = newLogs[newLogs.length - 1].timestamp
                scrollToBottom()
                emptyFetchCountRef.current = 0

                const lastLog = newLogs[newLogs.length - 1]
                if (lastLog.type === 'success' || lastLog.log.toLowerCase().includes('successfully')) {
                    setIsFinished(true)
                }
            } else {
                emptyFetchCountRef.current += 1
                if (emptyFetchCountRef.current >= MAX_EMPTY_FETCHES) setIsFinished(true)
            }

            setIsLoading(false)
        } catch (err) {
            console.error(err)
            setError('Error fetching logs.')
            setIsFinished(true)
        }
    }

    // Polling effect (restarts when deploymentId or refreshCounter changes)
    useEffect(() => {
        let isCancelled = false
        const pollLogs = async () => {
            if (isCancelled || isFinished) return
            await fetchLogs()
            if (!isFinished) setTimeout(pollLogs, POLLING_INTERVAL)
        }
        pollLogs()
        return () => { isCancelled = true }
    }, [deploymentId, refreshCounter, isFinished])

    // Refresh logs
    const refreshLogs = () => {
        setLogs([])
        lastTimestampRef.current = '1970-01-01 00:00:00'
        emptyFetchCountRef.current = 0
        setIsFinished(false)
        setIsLoading(true)
        setRefreshCounter(prev => prev + 1) // trigger polling useEffect
    }

    return (
        <div className="w-full border border-gray-800 rounded-lg bg-[#0b0b0b] font-mono h-[480px] flex flex-col" id="build-logs">
            <div className="flex items-center justify-between border-b border-gray-800 px-4 py-2 text-sm text-gray-400">
                <span>Deployment Logs</span>
                <div className='flex items-center gap-2'>
                    {isFinished ? (
                        <span className="text-green-400 font-medium">✔ Completed</span>
                    ) : (
                        <span className="text-blue-400 animate-pulse">Fetching...</span>
                    )}
                    <Button
                        disabled={isLoading}
                        className='p-2 border-[0.5px] border-gray-300/30 bg-gray-400/10 rounded-sm cursor-pointer'
                        onClick={refreshLogs}
                    >
                        <RefreshCcwIcon className={clsx(isLoading && "animate-spin")} size={12} />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {error && <div className="text-red-500 text-sm">Error: {error}</div>}
                {isLoading && !error && <div className="text-gray-400 text-sm">Loading logs...</div>}

                {logs.map((logItem, index) => (
                    <div key={index} className="grid grid-cols-[160px_100px_1fr] gap-x-3 text-sm items-start">
                        <span className="text-gray-500 truncate">
                            [{new Date(logItem.timestamp).toLocaleTimeString()}]
                        </span>
                        <span
                            className={clsx(
                                'font-medium',
                                logItem.type === 'error' && 'text-red-400',
                                logItem.type === 'warn' && 'text-yellow-400',
                                logItem.type === 'success' && 'text-green-400',
                                (!logItem.type || logItem.type === 'info') && 'text-blue-400'
                            )}
                        >
                            {logItem.step || logItem.type?.toUpperCase() || 'INFO'}
                        </span>
                        <div className="text-gray-100 break-words whitespace-pre-wrap">
                            {logItem.log}
                            {logItem.meta && <span className="ml-2 text-gray-500 text-xs">({logItem.meta})</span>}
                        </div>
                    </div>
                ))}
                <div ref={logsEndRef}></div>
            </div>
        </div>
    )
}

export default BuildLogsContainer
