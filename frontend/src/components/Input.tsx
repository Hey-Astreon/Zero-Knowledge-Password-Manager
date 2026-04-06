import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
    return twMerge(clsx(inputs));
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, icon, ...props }, ref) => {
        return (
            <div className="w-full space-y-1.5 focus-within:text-primary text-text-secondary group">
                {label && (
                    <label className="text-sm font-medium transition-colors">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary transition-colors pointer-events-none">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            'w-full bg-surface/60 backdrop-blur-md border border-white/10 text-white rounded-xl py-3 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-zinc-600 shadow-inner hover:bg-surface/80',
                            icon ? 'pl-10 pr-3' : 'px-3',
                            error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
        );

    }
);


Input.displayName = 'Input';

export { Input };
