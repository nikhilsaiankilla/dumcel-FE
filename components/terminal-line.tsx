"use client"

import { useEffect, useState } from "react"
import { LogItem } from "./build-logs-container"

// Simple typewriter effect for one log
export const TerminalLine: React.FC<{ log: LogItem }> = ({ log }) => {
    const [text, setText] = useState('')
    useEffect(() => {
        let i = 0
        const interval = setInterval(() => {
            setText(prev => prev + log.log[i])
            i++
            if (i >= log.log.length) clearInterval(interval)
        }, 15)
        return () => clearInterval(interval)
    }, [log.log])

    const color = log.type === 'error' ? 'text-red-400' :
        log.type === 'warn' ? 'text-yellow-400' :
            log.type === 'success' ? 'text-green-400' : 'text-blue-400'

    return (
        <div className="grid grid-cols-[160px_100px_1fr] gap-x-3 text-sm items-start">
            <span className="text-gray-500 truncate">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
            <span className={`font-medium ${color}`}>{log.step || log.type?.toUpperCase() || 'INFO'}</span>
            <div className="text-gray-100 break-words whitespace-pre-wrap">{text}{log.meta && <span className="ml-2 text-gray-500 text-xs">({log.meta})</span>}</div>
        </div>
    )
}