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
            <div className="w-full space-y-1.5 focus-within:text-indigo-400 text-zinc-400 group">
                {label && (
                    <label className="text-sm font-medium transition-colors">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors pointer-events-none">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            'w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-zinc-600',
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
