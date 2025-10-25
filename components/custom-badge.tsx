import React from 'react'
import clsx from 'clsx'

type BadgeVariant = 'type' | 'state'
type BadgeType = string

interface BadgeProps {
    variant?: BadgeVariant
    type: BadgeType
    className?: string
    children?: React.ReactNode
}

const CustomBadge: React.FC<BadgeProps> = ({ variant = 'type', type, className, children }) => {
    let badgeClass = ''

    if (variant === 'type') {
        // Example for type badges
        badgeClass =
            type === 'credit'
                ? 'bg-green-300/40 border-[0.5px] border-green-500/50 text-white'
                : 'bg-red-600 border border-red-700 text-white'
    } else if (variant === 'state') {
        // Example for state badges
        switch (type) {
            case 'not started':
                badgeClass = 'bg-gray-500 text-white'
                break
            case 'queued':
                badgeClass = 'bg-blue-500 text-white'
                break
            case 'in progress':
                badgeClass = 'bg-yellow-500 text-white'
                break
            case 'ready':
            case 'success':
                badgeClass = 'bg-green-500 text-white'
                break
            case 'failed':
            case 'error':
                badgeClass = 'bg-red-500 text-white'
                break
            default:
                badgeClass = 'bg-gray-300 text-white'
        }
    }

    return (
        <span
            className={clsx(
                'px-2 py-0.5 rounded text-xs font-medium capitalize',
                badgeClass,
                className
            )}
        >
            {children || type}
        </span>
    )
}

export default CustomBadge
