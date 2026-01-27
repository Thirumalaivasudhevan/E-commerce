import { motion } from 'framer-motion';
import clsx from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * StatCard - Statistics card with icon and trend indicator
 * @param {string} title - Card title
 * @param {string|number} value - Main stat value
 * @param {ReactNode} icon - Icon component
 * @param {number} trend - Trend percentage (positive or negative)
 * @param {string} trendLabel - Trend description
 * @param {string} color - Accent color: 'blue', 'green', 'red', 'yellow'
 */
export default function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    trendLabel,
    color = 'blue',
    className = '',
}) {
    const colorClasses = {
        blue: 'text-accent-blue bg-accent-blue/10',
        green: 'text-accent-green bg-accent-green/10',
        red: 'text-accent-red bg-accent-red/10',
        yellow: 'text-accent-yellow bg-accent-yellow/10',
    };

    const isPositive = trend >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4 }}
            className={clsx('glass-card p-6', className)}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-text-secondary text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-text-primary mb-3">{value}</h3>

                    {trend !== undefined && (
                        <div className="flex items-center gap-2">
                            <div
                                className={clsx(
                                    'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold',
                                    isPositive
                                        ? 'bg-accent-green/20 text-accent-green'
                                        : 'bg-accent-red/20 text-accent-red'
                                )}
                            >
                                {isPositive ? (
                                    <TrendingUp size={14} />
                                ) : (
                                    <TrendingDown size={14} />
                                )}
                                <span>{Math.abs(trend)}%</span>
                            </div>
                            {trendLabel && (
                                <span className="text-xs text-text-muted">{trendLabel}</span>
                            )}
                        </div>
                    )}
                </div>

                {Icon && (
                    <div className={clsx('p-3 rounded-xl', colorClasses[color])}>
                        <Icon size={24} />
                    </div>
                )}
            </div>
        </motion.div>
    );
}
