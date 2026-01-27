import { motion } from 'framer-motion';
import clsx from 'clsx';

/**
 * GlassCard - Instagram-style glassmorphic card component
 * @param {boolean} hover - Enable hover effects
 * @param {string} className - Additional CSS classes
 * @param {ReactNode} children - Card content
 */
export default function GlassCard({ children, hover = true, className = '', ...props }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={clsx(
                'glass-card p-6',
                !hover && 'hover:transform-none hover:shadow-glass',
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// Variants for different use cases
export function GlassCardCompact({ children, className = '', ...props }) {
    return (
        <div
            className={clsx('glass-card p-4', className)}
            {...props}
        >
            {children}
        </div>
    );
}

export function GlassCardNoPadding({ children, className = '', ...props }) {
    return (
        <div
            className={clsx('glass-card p-0 overflow-hidden', className)}
            {...props}
        >
            {children}
        </div>
    );
}
