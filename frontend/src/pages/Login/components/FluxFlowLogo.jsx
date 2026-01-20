import React from "react";

export default function FluxFlowLogo({ className = "", variant = "default" }) {
    const isCompact = variant === "compact";

    const iconClass = isCompact ? "h-11 w-11" : "w-20 h-20";
    const gapClass = isCompact ? "gap-2" : "gap-6";
    const titleClass = isCompact
        ? "text-white text-base font-black tracking-tight leading-none whitespace-nowrap"
        : "text-white text-3xl font-black tracking-tight leading-none whitespace-nowrap";
    const subtitleClass = isCompact
        ? "text-white text-[7px] font-medium tracking-[0.13em] mt-0.5"
        : "text-white text-[10px] font-medium tracking-[0.35em] mt-0.5";

    return (
        <div
            className={`flex items-center ${gapClass} ${className} font-sans`}
        >
            {/* Logo Icon (center aligned) */}
            <div
                className={`flex-shrink-0 flex items-center justify-center ${iconClass}`}
                aria-hidden="true"
            >
                <svg
                    viewBox="0 0 150 190"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-full w-full"
                >
                    <path
                        d="M100 182.543L97.7236 189.828L49.8232 182.518L100 18.3037V182.543ZM45 181.781L0 174.914V14.9141H45V181.781ZM150 14.9141V174.914H104V7.89355L150 14.9141ZM99.2207 7.16406L49 171.523V10.4854L52.2764 0L99.2207 7.16406Z"
                        fill="white"
                    />
                </svg>
            </div>

            {/* Text Content (vertically centered) */}
            <div className="flex flex-col justify-center leading-tight">
                <h1 className={titleClass}>FLUX FLOW</h1>
                <p className={subtitleClass}>DATA VISUALISATION</p>
            </div>
        </div>
    );
}
