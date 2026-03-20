import { HTMLAttributes } from 'react';
export default function AppLogoIcon(props: HTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src="/favicon.png"
            alt="MovieFlix Logo"
            className="h-12 w-auto object-contain" 
        />
    );
}
