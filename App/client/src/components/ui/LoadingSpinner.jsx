import { motion } from 'framer-motion';

/**
 * LoadingSpinner - Premium loading animation
 * @param {string} size - Spinner size: 'sm', 'md', 'lg'
 * @param {string} text - Optional loading text
 */
export default function LoadingSpinner({ size = 'md', text }) {
    const sizes = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4 p-8">
            <motion.div
                className={`${sizes[size]} border-4 border-surface-light border-t-accent-blue rounded-full`}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            {text && (
                <p className="text-text-secondary text-sm font-medium">{text}</p>
            )}
        </div>
    );
}

// Skeleton loader for content
export function SkeletonLoader({ className = '', lines = 3 }) {
    return (
        <div className={`space-y-3 ${className}`}>
            {[...Array(lines)].map((_, i) => (
                <div
                    key={i}
                    className="skeleton h-4 w-full"
                    style={{ width: `${100 - i * 15}%` }}
                />
            ))}
        </div>
    );
}

// Full page loader
export function PageLoader() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <LoadingSpinner size="lg" text="Loading..." />
        </div>
    );
}
