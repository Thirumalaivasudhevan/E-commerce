import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

/**
 * AnimatedButton - Premium button with ripple effect and variants
 * @param {string} variant - Button style: 'primary', 'success', 'danger', 'outline', 'ghost'
 * @param {string} size - Button size: 'sm', 'md', 'lg'
 * @param {boolean} loading - Show loading spinner
 * @param {boolean} fullWidth - Full width button
 * @param {ReactNode} children - Button content
 */
export default function AnimatedButton({
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    children,
    className = '',
    disabled,
    ...props
}) {
    const sizeClasses = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    const variantClasses = {
        primary: 'btn-primary',
        success: 'btn-success',
        danger: 'btn-danger',
        outline: 'btn-outline',
        ghost: 'btn-ghost',
    };

    return (
        <motion.button
            whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
            className={clsx(
                'btn',
                variantClasses[variant],
                sizeClasses[size],
                fullWidth && 'w-full',
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Loading...</span>
                </>
            ) : (
                children
            )}
        </motion.button>
    );
}

// Icon Button Variant
export function IconButton({ children, className = '', ...props }) {
    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={clsx(
                'p-2 rounded-xl text-text-secondary hover:text-text-primary',
                'hover:bg-surface-hover transition-all',
                className
            )}
            {...props}
        >
            {children}
        </motion.button>
    );
}
