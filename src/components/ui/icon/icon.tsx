import React from "react";
import { Icons, type IconType } from "./icons";
import { Skeleton } from "../skeleton/skeleton";

type Props = {
    icon: IconType;
    className?: string;
}

export const Icon = ({ icon, className }: Props) => {
    const SvgIcon = Icons[icon];

    if (!SvgIcon) {
        return null;
    }

    return <React.Suspense fallback={<Skeleton width="24px" height="24px" />}>
        <SvgIcon className={className} />
    </React.Suspense>
}